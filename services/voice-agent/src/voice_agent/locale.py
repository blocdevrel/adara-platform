"""Locale → speech / context / TTS defaults for a solid multilingual MVP.

Production voice systems treat language as a *hint hierarchy* (profile → locale →
safe default), never as optional. Meta MMS requires an adapter on every call —
Hugging Face documents English (`eng`) as the default when none is chosen.

Context packs are keyed by African language codes (`tw`, `pcm`, …). Passing
`language=en` into understand consults *no* pack. So ASR speech language and
context language are deliberately separate: English/code-switched audio uses
the `eng` adapter while locale `GH` still resolves `momo` / `chale`.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .sessions import Session

# ISO 3166-1 alpha-2 → default ASR language (ADARA short codes).
# English for GH/NG covers the demo phrases ("chale the momo no enter", "NEPA
# don take light") which are Ghanaian/Nigerian English with local loanwords.
LOCALE_SPEECH_LANGUAGE: dict[str, str] = {
    'GH': 'tw',
    'NG': 'en',
    'KE': 'sw',
    'TZ': 'sw',
    'UG': 'en',
    'ZA': 'en',
    'RW': 'sw',
}

LOCALE_TTS_LANGUAGE: dict[str, str] = {
    'GH': 'tw',
    'NG': 'yo',
    'KE': 'sw',
    'TZ': 'sw',
    'UG': 'sw',
    'ZA': 'en',
}

DEFAULT_LOCALE = 'GH'
DEFAULT_SPEECH_LANGUAGE = 'en'
DEFAULT_TTS_LANGUAGE = 'tw'

# Languages with no context pack — understand must not narrow to these.
NON_CONTEXT_LANGUAGES = frozenset({'en', 'eng', 'fr', 'fra'})

# ADARA short codes → ISO 639-3 names Meta MMS uses for adapters.
MMS_ADAPTER_ALIASES = {
    'en': 'eng',
    'fr': 'fra',
    'pt': 'por',
    'ar': 'ara',
}


def normalize_locale(locale: str | None) -> str | None:
    if not locale:
        return None
    raw = locale.strip().replace('_', '-')
    if not raw:
        return None
    # Accept "GH", "en-GH", "en_GH"
    if '-' in raw:
        parts = raw.split('-')
        country = parts[-1].upper()
        return country if len(country) == 2 else raw.upper()
    return raw.upper() if len(raw) == 2 else raw


def speech_language_for(session: Session) -> str:
    """Language code for MMS/Whisper. Never empty — adapters are mandatory.

    Returns the ISO 639-3 form MMS expects (`eng`, `aka`, …) so Door can load the
    adapter even before an intelligence rebuild.
    """
    client = session.client or {}
    explicit = (client.get('speech_language') or client.get('asr_language') or '').strip()
    if explicit:
        code = explicit.lower()
    elif session.language and session.language.lower() not in NON_CONTEXT_LANGUAGES:
        code = session.language.lower()
    else:
        country = normalize_locale(session.locale)
        code = (
            LOCALE_SPEECH_LANGUAGE.get(country, DEFAULT_SPEECH_LANGUAGE)
            if country else DEFAULT_SPEECH_LANGUAGE
        )

    return MMS_ADAPTER_ALIASES.get(code, code)


def context_language_for(session: Session) -> str | None:
    """Language for knowledge packs. None = consult all packs (code-switch safe)."""
    if not session.language:
        return None
    code = session.language.lower()
    if code in NON_CONTEXT_LANGUAGES:
        return None
    return code


def tts_language_for(session: Session, *, reply_language: str | None = None) -> str:
    """TTS voice. Prefer detected/reply language when MMS-TTS can speak it."""
    for candidate in (
        reply_language,
        (session.client or {}).get('tts_language'),
        session.language,
        LOCALE_TTS_LANGUAGE.get(normalize_locale(session.locale) or ''),
        DEFAULT_TTS_LANGUAGE,
    ):
        if not candidate:
            continue
        code = str(candidate).lower()
        if code in NON_CONTEXT_LANGUAGES:
            continue
        return code
    return DEFAULT_TTS_LANGUAGE


def apply_session_defaults(locale: str | None, language: str | None,
                           client: dict | None) -> tuple[str, str | None, dict]:
    """Fill missing locale / speech_language so a bare createSession still works."""
    client = dict(client or {})
    locale_out = normalize_locale(locale) or DEFAULT_LOCALE
    language_out = (language or '').strip().lower() or None
    if language_out in ('',):
        language_out = None

    if not (client.get('speech_language') or client.get('asr_language')):
        if language_out and language_out not in NON_CONTEXT_LANGUAGES:
            client['speech_language'] = language_out
        else:
            client['speech_language'] = LOCALE_SPEECH_LANGUAGE.get(
                locale_out, DEFAULT_SPEECH_LANGUAGE,
            )

    if not client.get('tts_language'):
        client['tts_language'] = LOCALE_TTS_LANGUAGE.get(locale_out, DEFAULT_TTS_LANGUAGE)

    return locale_out, language_out, client
