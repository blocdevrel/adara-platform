"""What the agent says back — grounded in what was understood, by default never generated.

`adara-intelligence` resolves references, identifies languages and reports what it could not
explain; it does not write prose. So a voice agent built on it has two honest options: refuse to
reply, or reply using only what was actually resolved. This module's default policy,
`GroundedPolicy`, does the second.

Everything in `GroundedPolicy` is a **template filled from the meaning object**, and `Reply.source`
says so on every single response — `grounded_template`, never a model name. `llm.py` is this
module's stated escape hatch actually taken: `OpenAIChatPolicy` implements the same `AgentPolicy`
protocol and is wired in instead whenever `OPENAI_API_KEY` is configured (see `server.py`'s
`_build_policy`). The label changes with it — `openai:<model>` — so a downstream consumer, a log,
or a user-facing badge can always tell which of the two actually answered, and weight its trust in
the reply accordingly: only `grounded_template` can never assert something ADARA did not resolve.

## Why a template is not a toy here

A voice agent's most valuable turns are usually not answers. They are:

- **Confirming understanding** — "you mean mobile money" — which is what makes a caller trust the
  next step.
- **Asking the disambiguating question** — `chama` is a savings group *and* a political party, and
  the engine already knows both readings and that it could not choose between them. Asking is
  strictly better than guessing, and it needs no generation at all.
- **Asking what a word means** — when the engine reports a `gap`, the speaker is the one person who
  can close it. A voice agent that asks turns every unresolved term into a contribution, which is
  the loop `context/gaps.py` exists to start.

Those are real dialogue acts, they are all derivable from the resolved data, and none of them
requires inventing a fact. What this policy will never do is claim to have performed an action,
answer a factual question, or paraphrase a term flagged `sensitivity` — the last of which is why
that field is carried all the way from a knowledge pack into this file.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

MAX_TERMS_SPOKEN = 3
"""How many resolved terms to read back. A voice reply listing nine things is unusable, and the
full list is in the meaning object for any client that wants it."""

MAX_GLOSS_CHARS = 70
"""How much of a gloss a reply may speak.

Glosses in the knowledge packs are written for a developer reading a result — several clauses of
context about what a term implies. Read aloud, one of them is fifteen seconds of a caller waiting
to say the next thing. So a spoken reply takes the first clause and stops; the full gloss stays in
the meaning object, and a screen can show all of it."""


@dataclass(frozen=True)
class Reply:
    """One agent turn."""

    text: str
    source: str = 'grounded_template'
    """`grounded_template` or, for a policy that wires a model, that model's name. Never absent."""

    act: str = 'acknowledge'
    """The dialogue act: `acknowledge`, `clarify_sense`, `ask_unknown_term`, `ask_repeat`,
    `report_unavailable`. A client can drive its UI from this without parsing the text."""

    grounded_on: tuple[str, ...] = ()
    """The exact terms this reply was built from. Empty means it asserts nothing about content."""

    expects_answer: bool = False
    """True when the agent asked something. The UI should keep the microphone open."""

    warnings: tuple[str, ...] = ()
    speech: dict = field(default_factory=dict)
    asr_transcript: str | None = None
    interpreted_transcript: str | None = None
    meaning_gloss: str | None = None

    def as_dict(self) -> dict:
        payload = {
            'text': self.text,
            'source': self.source,
            'act': self.act,
            'grounded_on': list(self.grounded_on),
            'expects_answer': self.expects_answer,
            'warnings': list(self.warnings),
            'speech': dict(self.speech),
        }
        if self.asr_transcript is not None:
            payload['asr_transcript'] = self.asr_transcript
        if self.interpreted_transcript is not None:
            payload['interpreted_transcript'] = self.interpreted_transcript
        if self.meaning_gloss is not None:
            payload['meaning_gloss'] = self.meaning_gloss
        return payload


class AgentPolicy(Protocol):
    """The seam a product replaces.

    `adara-voice` — or any consumer with its own domain logic and its own model — implements this
    and the rest of the service is unchanged. Keeping the interface this small is what stops
    health triage or payment workflows leaking into a platform service that has no business
    holding them.
    """

    def reply(self, meaning: dict, *, history: list | None = None) -> Reply:
        ...


class GroundedPolicy:
    """Replies assembled only from what ADARA resolved."""

    def __init__(self, *, speech_available: bool = False,
                 speech_reason: str = 'no synthesis backend is wired') -> None:
        self._speech = {'available': speech_available, 'reason': '' if speech_available
                        else speech_reason}

    def reply(self, meaning: dict, *, history: list | None = None) -> Reply:
        warnings = tuple(_warnings(meaning))

        if not meaning or meaning.get('status') == 'error':
            return self._reply(
                'I did not catch that. Could you say it again?',
                act='ask_repeat', expects_answer=True, warnings=warnings,
            )

        text = (meaning.get('transcript') or '').strip()
        if not text:
            return self._reply(
                'I could not hear anything to work with. Could you try again?',
                act='ask_repeat', expects_answer=True, warnings=warnings,
            )

        matches = ((meaning.get('context') or {}).get('matches')) or []

        ambiguous = next((m for m in matches if m.get('ambiguous') and m.get('alternatives')), None)
        if ambiguous is not None:
            return self._clarify_sense(ambiguous, warnings)

        if matches:
            return self._acknowledge(meaning, matches, warnings)

        gap = _first_gap(meaning)
        if gap is not None:
            return self._ask_unknown_term(gap, warnings)

        # Understood as language, but nothing in it is something this stack knows about. Saying so
        # is more useful than a generic "sorry", because it tells the speaker the problem is
        # coverage rather than audio.
        return self._reply(
            f'I heard you, but nothing in "{_shorten(text)}" is something I have knowledge about '
            'yet. I can only work with the local references that have been contributed so far.',
            act='report_unavailable', warnings=warnings,
        )

    # -- dialogue acts ---------------------------------------------------------------------
    def _clarify_sense(self, match: dict, warnings: tuple[str, ...]) -> Reply:
        """Ask rather than guess. The engine already knows it could not choose."""
        term = match.get('term', '')
        first = _sense_phrase(match)
        second = _sense_phrase((match.get('alternatives') or [{}])[0])
        return self._reply(
            f'When you say "{term}", do you mean {first}, or {second}?',
            act='clarify_sense', grounded_on=(term,), expects_answer=True, warnings=warnings,
        )

    def _ask_unknown_term(self, gap: dict, warnings: tuple[str, ...]) -> Reply:
        """The speaker is the one person who can close this gap, so ask them.

        Every answer here is a candidate contribution to a knowledge pack, which is how the
        coverage backlog shrinks from real usage rather than from a planning meeting.
        """
        word = gap.get('text', '')
        nearest = gap.get('nearest_term')
        if nearest:
            return self._reply(
                f'I did not recognise "{word}" — did you mean "{nearest}"?',
                act='ask_unknown_term', grounded_on=(word,), expects_answer=True, warnings=warnings,
            )
        return self._reply(
            f'I do not know the word "{word}" yet. What does it mean?',
            act='ask_unknown_term', grounded_on=(word,), expects_answer=True, warnings=warnings,
        )

    def _acknowledge(self, meaning: dict, matches: list, warnings: tuple[str, ...]) -> Reply:
        """Read back what was understood, and say plainly that nothing was acted on."""
        spoken = matches[:MAX_TERMS_SPOKEN]
        phrases = [f'{m.get("term")} ({_gloss_head(m)})' for m in spoken]
        listed = _join(phrases)
        remaining = len(matches) - len(spoken)
        if remaining > 0:
            listed += f', and {remaining} more'

        domains = [d.get('domain') for d in (meaning.get('domains') or [])][:2]
        about = f' This sounds like it is about {_join(domains)}.' if domains else ''

        # The second sentence is not padding. Without it an acknowledgement reads as an action,
        # and a caller told "mobile money, mobile money" believes something was done about it.
        return self._reply(
            f'I understood {listed}.{about} I can recognise these references, but no assistant '
            'logic is connected yet, so I have not acted on anything.',
            act='acknowledge',
            grounded_on=tuple(m.get('term', '') for m in spoken),
            warnings=warnings,
        )

    def _reply(self, text: str, **kwargs) -> Reply:
        return Reply(text=text, speech=dict(self._speech), **kwargs)


# -- helpers ---------------------------------------------------------------------------------------

def _warnings(meaning: dict) -> list[str]:
    """Every caveat the meaning object carries, in the order a user should hear about them.

    Duplicated deliberately from the SDK's `Meaning.warnings()` rather than imported: this service
    holds raw payloads, and a policy that only worked when its input had been through a particular
    client library would be the wrong kind of coupling for the one piece a product replaces.
    """
    found: list[str] = []
    if not meaning:
        return found
    evidence = meaning.get('language_evidence') or {}

    if meaning.get('status') == 'interface_only':
        found.append('No backend was registered, so only the offline layers ran.')
    if meaning.get('status') == 'partial':
        found.append('A capability failed and the result is degraded.')
    if meaning.get('provisional'):
        found.append(
            'The knowledge behind these glosses has not been reviewed by a native speaker.')
    if evidence.get('agreement') is False:
        found.append('The audio and text language detectors disagreed.')
    if (evidence.get('region_check') or {}).get('consistent') is False:
        found.append('The detected language is not one spoken where the local references point.')
    for match in ((meaning.get('context') or {}).get('matches')) or []:
        if match.get('sensitivity'):
            found.append(f'"{match.get("term")}" needs care: {match["sensitivity"]}')
    return found


def _first_gap(meaning: dict) -> dict | None:
    gaps = ((meaning.get('context') or {}).get('gaps')) or []
    return gaps[0] if gaps else None


def _sense_phrase(sense: dict) -> str:
    gloss = _gloss_head(sense)
    concept = (sense.get('concept') or '').replace('_', ' ')
    return f'{concept} — {gloss}' if concept else gloss


def _gloss_head(match: dict) -> str:
    """The first clause of a gloss, capped to something a person can listen to.

    Full glosses are paragraphs written for a developer inspecting a result. A spoken reply is not.
    """
    gloss = (match.get('reading') or match.get('gloss') or '').strip()
    for separator in ('. ', ' — ', ': ', ', which ', ', so '):
        if separator in gloss:
            gloss = gloss.split(separator)[0]
            break
    gloss = gloss.strip().rstrip('.')
    if len(gloss) <= MAX_GLOSS_CHARS:
        return gloss
    # Cut on a word boundary; a reply that ends mid-word sounds like a dropped connection.
    clipped = gloss[:MAX_GLOSS_CHARS].rsplit(' ', 1)[0].rstrip(',;')
    return f'{clipped}…'


def _join(items) -> str:
    items = [str(item) for item in items if item]
    if not items:
        return ''
    if len(items) == 1:
        return items[0]
    return f'{", ".join(items[:-1])} and {items[-1]}'


def _shorten(text: str, limit: int = 60) -> str:
    text = ' '.join(text.split())
    return text if len(text) <= limit else text[:limit - 1].rstrip() + '…'
