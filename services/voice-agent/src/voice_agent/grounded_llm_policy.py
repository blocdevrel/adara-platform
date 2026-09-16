"""Grounded LLM replies — ASR interpretation + cultural grounding, not raw transcript chat.

When OPENAI_API_KEY is set, this replaces ``OpenAIChatPolicy``. It runs the same
``grounded_reply`` path as Door's ``/v1/intelligence/reply``: understand first (already done
by the agent), interpret noisy ASR when ``asr_transcript`` is present, then generate a reply
with ADARA's cultural context injected — not a freeform chat on garbled text.
"""

from __future__ import annotations

import logging

from .policy import Reply

logger = logging.getLogger(__name__)
MAX_HISTORY_TURNS = 6


class GroundedLLMPolicy:
    """Replies via ``adara_intelligence.intelligence.grounded_llm``."""

    def __init__(self, *, api_key: str, model: str = 'gpt-4o-mini',
                 speech_available: bool = False,
                 speech_reason: str = 'no synthesis backend is wired') -> None:
        if not api_key:
            raise ValueError('GroundedLLMPolicy needs an api_key (set OPENAI_API_KEY)')
        self._api_key = api_key
        self._model = model
        self._speech = {
            'available': speech_available,
            'reason': '' if speech_available else speech_reason,
        }

    def reply(self, meaning: dict, *, history: list | None = None) -> Reply:
        from adara_intelligence.intelligence.grounded_llm import OpenAIProvider, grounded_reply

        if not meaning or meaning.get('status') == 'error':
            return self._reply(
                'I did not catch that. Could you say it again?',
                act='ask_repeat', expects_answer=True,
            )

        text = (meaning.get('transcript') or '').strip()
        if not text:
            return self._reply(
                'I could not hear anything to work with. Could you try again?',
                act='ask_repeat', expects_answer=True,
            )

        provider = OpenAIProvider(api_key=self._api_key, model=self._model)
        interpret = bool(meaning.get('asr_transcript'))
        extra = _history_as_extra(history)

        try:
            grounded = grounded_reply(
                meaning, provider, extra_context=extra, interpret_asr=interpret,
            )
        except Exception as error:  # noqa: BLE001
            logger.warning('Grounded LLM reply failed: %s', error)
            return self._reply(
                'I understood you, but could not reach my language model just now.',
                act='report_unavailable',
                warnings=('The language model backend is unavailable.',),
            )

        if not grounded.text:
            return self._reply(
                'I heard you, but had nothing to say back.', act='report_unavailable',
            )

        return self._reply(
            grounded.text,
            act='acknowledge',
            source=grounded.source,
            asr_transcript=grounded.asr_transcript,
            interpreted_transcript=grounded.interpreted_transcript,
            meaning_gloss=grounded.meaning_gloss,
        )

    def _reply(self, text: str, **kwargs) -> Reply:
        source = kwargs.pop('source', f'grounded_llm:{self._model}')
        return Reply(text=text, source=source, speech=dict(self._speech), **kwargs)


def _history_as_extra(history: list | None) -> str:
    if not history or len(history) < 2:
        return ''
    lines: list[str] = ['Recent conversation:']
    for turn in history[:-1][-MAX_HISTORY_TURNS:]:
        if turn.role == 'agent':
            content = (turn.reply or {}).get('text')
            label = 'Assistant'
        else:
            content = turn.text
            label = 'User'
        if content:
            lines.append(f'{label}: {content}')
    return '\n'.join(lines)
