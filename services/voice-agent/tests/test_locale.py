"""Locale / speech-language defaults for the multilingual MVP."""

from __future__ import annotations

from voice_agent.locale import (
    apply_session_defaults,
    context_language_for,
    speech_language_for,
    tts_language_for,
)
from voice_agent.sessions import Session


def test_bare_session_defaults_to_ghana_twi_speech():
    locale, language, client = apply_session_defaults(None, None, None)
    assert locale == 'GH'
    assert language is None
    assert client['speech_language'] == 'tw'
    assert client['tts_language'] == 'tw'


def test_nigeria_defaults_to_english_asr_and_yoruba_tts():
    locale, language, client = apply_session_defaults('NG', None, None)
    assert locale == 'NG'
    assert language is None
    assert client['speech_language'] == 'en'
    assert client['tts_language'] == 'yo'


def test_explicit_twi_is_used_for_both_speech_and_context():
    locale, language, client = apply_session_defaults('GH', 'tw', None)
    assert language == 'tw'
    assert client['speech_language'] == 'tw'

    session = Session(
        id='s', created_at=0, updated_at=0, locale=locale, language=language, client=client,
    )
    assert speech_language_for(session) == 'tw'
    assert context_language_for(session) == 'tw'


def test_english_speech_does_not_narrow_context_packs():
    """language=en would consult zero packs — momo would never resolve."""
    session = Session(
        id='s', created_at=0, updated_at=0,
        locale='GH', language=None,
        client={'speech_language': 'en'},
    )
    assert speech_language_for(session) == 'eng'
    assert context_language_for(session) is None
    assert tts_language_for(session) == 'tw'


def test_en_gh_locale_normalises_to_country():
    locale, _, client = apply_session_defaults('en-GH', None, None)
    assert locale == 'GH'
    assert client['speech_language'] == 'tw'


def test_store_create_fills_ghana_twi_when_the_client_sends_nothing(store):
    session = store.create()
    assert session.locale == 'GH'
    assert session.language is None
    assert session.client['speech_language'] == 'tw'
    assert speech_language_for(session) == 'tw'
