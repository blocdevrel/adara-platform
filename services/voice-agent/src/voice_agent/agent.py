"""Running one turn: audio or text in, understanding and a reply out.

This is the orchestration the mobile app would otherwise have to do itself — transcribe, then
understand, then decide what to say, then work out what to tell the user about how much of that
actually worked. Doing it on a phone means four round trips over a connection that may be a bar of
3G, and it means every client re-implements the degradation rules. Doing it here means one request
per turn and one place where those rules live.

**Every stage is optional and the turn survives all of them failing.** No ASR weights installed?
An audio turn still creates a turn record, still reports why there is no transcript, and still
returns a reply the UI can render. A capability that is missing produces a stated reason, never a
blank field that reads as silence.

**Progress is published as it happens.** A voice interface that shows nothing for two seconds
feels broken, so each stage emits an event before the next one starts and `GET .../events`
streams them. The final response carries the same data, so a client that cannot hold a stream open
loses latency but no information.
"""

from __future__ import annotations

import logging
import shutil
import subprocess
import tempfile
from pathlib import Path

from adara import AdaraError, NotImplementedYet

from .adara import AdaraGateway
from .locale import context_language_for, speech_language_for, tts_language_for
from .policy import AgentPolicy, GroundedPolicy
from .sessions import Session, SessionStore, Turn

logger = logging.getLogger(__name__)

ERROR_NO_TRANSCRIPTION = 'transcription_unavailable'
ERROR_UNDERSTANDING_FAILED = 'understanding_unavailable'
ERROR_EMPTY_INPUT = 'empty_input'
ERROR_AUDIO_TOO_LARGE = 'audio_too_large'


class VoiceAgent:
    """Turns, end to end."""

    def __init__(self, gateway: AdaraGateway, store: SessionStore, *,
                 policy: AgentPolicy | None = None,
                 max_audio_bytes: int = 25 * 1024 * 1024) -> None:
        self._adara = gateway
        self._store = store
        self._max_audio_bytes = max_audio_bytes
        capabilities = gateway.capabilities()
        self._policy = policy or GroundedPolicy(
            speech_available=capabilities.synthesize,
            speech_reason=capabilities.reasons.get('synthesize', 'no synthesis backend is wired'),
        )

    # -- entry points --------------------------------------------------------------------------
    def submit_text(self, session: Session, text: str, *,
                    transcript_source: str = 'typed') -> Turn:
        """A typed turn, or one the client transcribed via Door ASR (`transcript_source='asr'`)."""
        if not text or not text.strip():
            turn = self._store.add_turn(session, role='user', input_kind='text', text=None)
            return self._fail(session, turn, ERROR_EMPTY_INPUT,
                              'No text was supplied for this turn.')

        turn = self._store.add_turn(session, role='user', input_kind='text',
                                    text=text.strip(), transcript_source=transcript_source)
        self._emit(session, 'turn.created', turn)
        return self._understand_and_reply(session, turn)

    def submit_audio(self, session: Session, filename: str, audio: bytes) -> Turn:
        """A spoken turn. Transcribes first, then follows the same path as a typed one."""
        turn = self._store.add_turn(session, role='user', input_kind='audio')
        self._emit(session, 'turn.created', turn)

        if len(audio) > self._max_audio_bytes:
            return self._fail(
                session, turn, ERROR_AUDIO_TOO_LARGE,
                f'Audio is {len(audio)} bytes; this service accepts up to {self._max_audio_bytes}. '
                'Record shorter turns, or send the file to an asynchronous job.',
            )

        filename, audio = _wav_for_asr(filename, audio)
        asr_language = speech_language_for(session)

        try:
            result = self._adara.transcribe(filename, audio, language=asr_language)
        except NotImplementedYet as error:
            # The expected state today: no ASR weights anywhere in this deployment. The turn is
            # kept, the reason is recorded, and the client is told to fall back to typing rather
            # than being handed an empty transcript that looks like silence.
            return self._fail(session, turn, ERROR_NO_TRANSCRIPTION, str(error), recoverable=True)
        except AdaraError as error:
            logger.warning('Transcription failed for turn %s: %s', turn.id, error)
            return self._fail(
                session, turn, ERROR_NO_TRANSCRIPTION,
                _transcription_user_message(error), recoverable=True,
            )

        transcript = (result.get('transcript') or '').strip()
        turn.text = transcript or None
        turn.transcript_source = 'asr'
        if not transcript:
            return self._fail(session, turn, ERROR_NO_TRANSCRIPTION,
                              'The transcriber returned no text for this audio.', recoverable=True)

        self._emit(session, 'turn.transcribed', turn)
        return self._understand_and_reply(session, turn)

    # -- the shared path -----------------------------------------------------------------------
    def _understand_and_reply(self, session: Session, turn: Turn) -> Turn:
        try:
            meaning = self._adara.understand(
                turn.text or '',
                locale=session.locale,
                language=context_language_for(session),
            )
        except NotImplementedYet as error:
            return self._fail(session, turn, ERROR_UNDERSTANDING_FAILED, str(error))
        except AdaraError as error:
            logger.warning('Understanding failed for turn %s: %s', turn.id, error)
            return self._fail(session, turn, ERROR_UNDERSTANDING_FAILED, str(error))

        if turn.transcript_source == 'asr' and turn.text:
            meaning['asr_transcript'] = turn.text
            meaning['transcript_source'] = 'asr'

        turn.meaning = meaning
        turn.status = 'understood'
        # Only a detection settles the session's language; an abstention leaves the previous one
        # in place. See SessionStore.settle_language.
        session.settle_language(meaning.get('language'), source='detected')
        self._store.touch(session)
        self._emit(session, 'turn.understood', turn)

        reply = self._policy.reply(meaning, history=session.turns)
        if reply.interpreted_transcript:
            turn.text = reply.interpreted_transcript
            meaning['transcript'] = reply.interpreted_transcript
            if reply.meaning_gloss:
                meaning['meaning_gloss'] = reply.meaning_gloss
            turn.meaning = meaning
        # Stamp the TTS language the client should request — never leave it to chance.
        speech = dict(reply.speech or {})
        speech.setdefault(
            'language',
            tts_language_for(session, reply_language=meaning.get('language')),
        )
        reply_dict = reply.as_dict()
        reply_dict['speech'] = speech
        turn.reply = reply_dict
        turn.status = 'replied'
        self._store.touch(session)
        self._emit(session, 'turn.replied', turn)
        return turn

    def _fail(self, session: Session, turn: Turn, code: str, message: str, *,
              recoverable: bool = False) -> Turn:
        """Record a failed stage without losing the turn.

        `recoverable` distinguishes "this deployment cannot do that, try another way" from "this
        turn is over". The mobile UI uses it to decide between offering the keyboard and showing
        an error.
        """
        turn.status = 'failed'
        turn.error = {'code': code, 'message': message, 'recoverable': recoverable}
        if turn.reply is None:
            turn.reply = self._policy.reply(
                {'status': 'error', 'transcript': turn.text}, history=session.turns,
            ).as_dict()
        self._store.touch(session)
        self._emit(session, 'turn.failed', turn)
        return turn

    def _emit(self, session: Session, event: str, turn: Turn) -> None:
        self._store.publish(session.id, {'event': event, 'data': turn.summary()})


def _transcription_user_message(error: Exception) -> str:
    """Phone-facing copy. Raw `HTTP 500` is an operator log, not a prompt to speak again."""
    raw = str(error)
    lowered = raw.lower()
    if any(token in lowered for token in ('500', 'decode', 'format', 'codec', 'backend')):
        return (
            'Could not transcribe this recording. Type what you said instead.'
        )
    return raw


def _wav_for_asr(filename: str, audio: bytes) -> tuple[str, bytes]:
    """MMS/soundfile reads WAV. Phone recordings are AAC/m4a; convert when ffmpeg is present."""
    if audio[:4] == b'RIFF' or Path(filename).suffix.lower() in {'.wav', '.flac', '.ogg'}:
        return filename, audio
    ffmpeg = shutil.which('ffmpeg')
    if not ffmpeg:
        logger.warning('No ffmpeg on PATH; sending %s to ASR as-is', filename)
        return filename, audio

    suffix = Path(filename).suffix or '.m4a'
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / f'in{suffix}'
        dst = Path(tmp) / 'out.wav'
        src.write_bytes(audio)
        result = subprocess.run(
            [ffmpeg, '-y', '-i', str(src), '-ac', '1', '-ar', '16000', '-f', 'wav', str(dst)],
            capture_output=True, timeout=30, check=False,
        )
        if result.returncode != 0 or not dst.exists() or dst.stat().st_size == 0:
            logger.warning('ffmpeg could not decode %s: %s', filename,
                           (result.stderr or b'')[-200:].decode('utf-8', 'replace'))
            return filename, audio
        return 'turn.wav', dst.read_bytes()
