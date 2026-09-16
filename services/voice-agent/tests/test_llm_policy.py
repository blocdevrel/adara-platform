"""GroundedLLMPolicy — ASR interpretation + culturally grounded replies.

No real network calls: ``grounded_reply`` is monkeypatched so the suite stays offline.
"""

from __future__ import annotations

from unittest.mock import patch

import pytest

from voice_agent.grounded_llm_policy import GroundedLLMPolicy
from voice_agent.sessions import Turn
from adara_intelligence.intelligence.grounded_llm import GroundedReply, GroundingContext


def _grounding(**kwargs) -> GroundingContext:
    defaults = dict(
        transcript='hello', asr_transcript=None, meaning_gloss=None,
        dominant_language='tw', language_basis='text_only', code_switched=False,
        switch_spans=[], concepts=[], domains=[], region={}, entities=None, intent=None,
        reply_language_hint='tw', reply_tone_hint='formal', suggested_reply_length='short',
        provisional=True, confidence=0.8, warnings=[],
    )
    defaults.update(kwargs)
    return GroundingContext(**defaults)


def _fake_reply(**kwargs) -> GroundedReply:
    defaults = dict(
        text='Akwaaba!', language='tw', source='grounded_llm:gpt-4o-mini',
        grounding=_grounding(), system_prompt='SYSTEM', raw_llm_response='Akwaaba!',
        asr_transcript=None, interpreted_transcript=None, meaning_gloss=None,
    )
    defaults.update(kwargs)
    return GroundedReply(**defaults)


def _turn(role: str, *, text: str | None = None, reply_text: str | None = None) -> Turn:
    turn = Turn(id='t', role=role, created_at=0.0, text=text)
    if reply_text is not None:
        turn.reply = {'text': reply_text}
    return turn


def test_requires_an_api_key():
    with pytest.raises(ValueError):
        GroundedLLMPolicy(api_key='')


def test_empty_or_error_meaning_asks_to_repeat_without_calling_the_model():
    policy = GroundedLLMPolicy(api_key='sk-test')
    with patch('adara_intelligence.intelligence.grounded_llm.grounded_reply') as mock:
        reply = policy.reply({'status': 'error'})
        mock.assert_not_called()
    assert reply.act == 'ask_repeat'
    assert reply.expects_answer is True


def test_a_normal_turn_is_answered_by_grounded_reply():
    policy = GroundedLLMPolicy(api_key='sk-test', model='gpt-4o-mini', speech_available=True)
    fake = _fake_reply(text='Mobile money is a way to send cash by phone.')
    with patch('adara_intelligence.intelligence.grounded_llm.grounded_reply', return_value=fake) as mock:
        reply = policy.reply({'transcript': 'What is momo?'})
        mock.assert_called_once()
        assert mock.call_args.kwargs.get('interpret_asr') is False

    assert reply.source == 'grounded_llm:gpt-4o-mini'
    assert reply.act == 'acknowledge'
    assert reply.text == 'Mobile money is a way to send cash by phone.'
    assert reply.speech == {'available': True, 'reason': ''}


def test_asr_transcript_triggers_interpretation():
    policy = GroundedLLMPolicy(api_key='sk-test')
    fake = _fake_reply(
        asr_transcript='ekom demi',
        interpreted_transcript='Etwɔn anɔpa ni',
        meaning_gloss="I'm hungry; I haven't eaten since morning.",
        text='Mo ho yɛ den?',
    )
    meaning = {'transcript': 'ekom demi', 'asr_transcript': 'ekom demi'}
    with patch('adara_intelligence.intelligence.grounded_llm.grounded_reply', return_value=fake) as mock:
        reply = policy.reply(meaning)
        assert mock.call_args.kwargs.get('interpret_asr') is True

    assert reply.interpreted_transcript == 'Etwɔn anɔpa ni'
    assert reply.meaning_gloss == "I'm hungry; I haven't eaten since morning."


def test_prior_turns_become_extra_context():
    policy = GroundedLLMPolicy(api_key='sk-test')
    fake = _fake_reply()
    history = [
        _turn('user', text='hello'),
        _turn('agent', reply_text='hi there'),
        _turn('user', text='what is momo?'),
    ]
    with patch('adara_intelligence.intelligence.grounded_llm.grounded_reply', return_value=fake) as mock:
        policy.reply({'transcript': 'what is momo?'}, history=history)
        extra = mock.call_args.kwargs.get('extra_context') or ''
    assert 'hello' in extra
    assert 'hi there' in extra
    assert extra.count('what is momo?') == 0


def test_a_model_outage_degrades_to_a_reply_instead_of_failing_the_turn():
    policy = GroundedLLMPolicy(api_key='sk-test')
    with patch('adara_intelligence.intelligence.grounded_llm.grounded_reply', side_effect=TimeoutError('timed out')):
        reply = policy.reply({'transcript': 'hello'})

    assert reply.act == 'report_unavailable'
    assert reply.warnings
