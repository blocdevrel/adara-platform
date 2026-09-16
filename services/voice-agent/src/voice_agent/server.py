"""The HTTP surface the mobile app talks to.

Two groups of routes, and the split is deliberate.

**`/v1/health`, `/v1/languages`, `/v1/models`, `/v1/language/detect`** already exist in
`apps/mobile/src/lib/api.ts`, in shapes that client already parses. They are served here in exactly
those shapes so the app can be pointed at this service by changing one environment variable, with
no code change, and start getting real answers where `apps/api` returns `501`. Where a capability
genuinely is not available — transcription, generation — this returns `501` too, which that client
already handles as a first-class `notImplemented` result rather than an error.

**`/v1/agent/*`** is the voice conversation: sessions, turns, and a server-sent event stream. This
is what a voice UI actually needs and what no single-shot endpoint can provide, because a
conversation has state and a turn has stages a user should see happening.

Built on `http.server` with no dependencies, matching `apps/api`, which does the same in Node. That
is right for a development service and it has a real ceiling: a thread per connection, no HTTP/2,
and an SSE stream occupies a thread for its lifetime. A deployment past a handful of concurrent
calls puts an ASGI server in front of this, which is why the routing table is a plain dict of
functions and not spread through the handler class.
"""

from __future__ import annotations

import json
import logging
import re
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from queue import Empty, Queue

from adara import AdaraError, NotImplementedYet

from .adara import AdaraGateway
from .agent import VoiceAgent
from .config import Config
from .grounded_llm_policy import GroundedLLMPolicy
from .sessions import SessionStore

logger = logging.getLogger(__name__)

SERVICE = 'adara-voice-agent'
SSE_KEEPALIVE_SECONDS = 15.0
"""Proxies and mobile networks drop a connection that has been silent too long, and a voice call
can easily be silent for a minute. A comment frame keeps it open without inventing an event."""

# The mobile client types languages as planned|experimental|research|beta|production. ADARA types
# them as verified|claimed|not_claimed. The mapping is deliberately pessimistic: `claimed` means a
# vendor listed the language, which is evidence of their marketing and nothing else, so it can
# never map above `experimental`. The true value rides along as `adara_status` so nothing is lost.
STATUS_MAP = {
    'verified': 'beta',
    'claimed': 'experimental',
    'pack_reviewed': 'beta',
    'pack_unreviewed': 'experimental',
    'not_claimed': 'planned',
    'no_pack': 'planned',
    'unknown': 'planned',
}


def _build_policy(config: Config, gateway: AdaraGateway):
    """`None` defers to VoiceAgent's own default (GroundedPolicy) -- see agent.py.

    GroundedLLMPolicy when a key is configured — ASR interpretation + culturally grounded replies.
    Without OPENAI_API_KEY the agent stays on template-only GroundedPolicy.
    """
    if not config.openai_api_key:
        return None
    capabilities = gateway.capabilities()
    return GroundedLLMPolicy(
        api_key=config.openai_api_key,
        model=config.openai_model,
        speech_available=capabilities.synthesize,
        speech_reason=capabilities.reasons.get('synthesize', 'no synthesis backend is wired'),
    )


class Application:
    """Routing and handlers, independent of the server that drives them."""

    def __init__(self, config: Config, gateway: AdaraGateway | None = None,
                 store: SessionStore | None = None, agent: VoiceAgent | None = None) -> None:
        self.config = config
        self.adara = gateway or AdaraGateway(config)
        self.store = store or SessionStore(
            ttl_seconds=config.session_ttl_seconds,
            max_turns=config.max_turns_per_session,
        )
        self.agent = agent or VoiceAgent(
            self.adara, self.store, max_audio_bytes=config.max_audio_bytes,
            policy=_build_policy(config, self.adara),
        )
        self.started_at = time.time()

        self._routes = [
            ('GET', re.compile(r'^/v1/health$'), self.health),
            ('GET', re.compile(r'^/v1/languages$'), self.languages),
            ('GET', re.compile(r'^/v1/models$'), self.models),
            ('GET', re.compile(r'^/v1/context/coverage$'), self.coverage),
            ('POST', re.compile(r'^/v1/language/detect$'), self.detect_language),
            ('POST', re.compile(r'^/v1/speech/transcribe$'), self.transcribe),
            ('POST', re.compile(r'^/v1/speech/synthesize$'), self.synthesize),
            ('POST', re.compile(r'^/v1/context/generate$'), self.generate),
            ('POST', re.compile(r'^/v1/agent/sessions$'), self.create_session),
            ('GET', re.compile(r'^/v1/agent/sessions/(?P<sid>[\w-]+)$'), self.get_session),
            ('DELETE', re.compile(r'^/v1/agent/sessions/(?P<sid>[\w-]+)$'), self.end_session),
            ('POST', re.compile(r'^/v1/agent/sessions/(?P<sid>[\w-]+)/turns$'), self.create_turn),
            ('GET', re.compile(r'^/v1/agent/sessions/(?P<sid>[\w-]+)/turns/(?P<tid>[\w-]+)$'),
             self.get_turn),
            ('GET', re.compile(r'^/v1/agent/sessions/(?P<sid>[\w-]+)/events$'), self.events),
        ]

    def resolve(self, method: str, path: str):
        """Find a handler, or say whether the path exists at all under a different method."""
        path_exists = False
        for route_method, pattern, handler in self._routes:
            match = pattern.match(path)
            if match:
                path_exists = True
                if route_method == method:
                    return handler, match.groupdict()
        return (None, {'_status': 405}) if path_exists else (None, {'_status': 404})

    # -- catalogue routes the mobile client already calls -----------------------------------------
    def health(self, request) -> Response:
        capabilities = self.adara.capabilities()
        return Response(200, {
            'status': 'ok',
            'service': SERVICE,
            # `development` is what apps/mobile checks. It stays development until a deployment
            # has real backends behind every capability it advertises.
            'mode': 'development',
            'adara_mode': self.config.mode,
            'uptime_seconds': round(time.time() - self.started_at, 1),
            'sessions': len(self.store),
            # The block that lets a UI disable the microphone *before* someone records into it.
            'capabilities': capabilities.as_dict(),
        })

    def languages(self, request) -> Response:
        try:
            rows = self.adara.languages()
        except Exception as error:  # noqa: BLE001 - the catalogue must not take the service down
            logger.warning('Language catalogue unavailable: %s', error)
            return Response(200, {'data': [], 'note': f'catalogue unavailable: {error}'})

        return Response(200, {
            'data': [
                {
                    'code': row.get('code'),
                    'name': row.get('name'),
                    'endonym': row.get('endonym', ''),
                    'status': STATUS_MAP.get(row.get('status', 'unknown'), 'planned'),
                    'adara_status': row.get('status'),
                }
                for row in rows
            ],
            'caveat': (
                'Status is mapped down, never up: "claimed" means a backend lists the language, '
                'which is evidence of its marketing and not of accuracy. Nothing is verified.'
            ),
        })

    def models(self, request) -> Response:
        capabilities = self.adara.capabilities().as_dict()
        wired = [name for name, available in capabilities.items()
                 if name != 'reasons' and available]
        return Response(200, {
            'data': [{'name': f'adara:{name}', 'capabilities': [name]} for name in wired],
            'note': ('Capabilities wired in this deployment. An empty list means only the offline '
                     'layers are available.'),
        })

    def coverage(self, request) -> Response:
        return Response(200, {'data': self.adara.context_coverage()})

    def detect_language(self, request) -> Response:
        text = (request.json or {}).get('text', '')
        if not text.strip():
            return error_response(400, 'empty_text', 'Send a non-empty "text" field.')
        detection = self.adara.detect_language(text)
        # `code` is what apps/mobile reads; everything else is additive so the abstention is
        # visible to a client that wants it. A null code with a reason is an answer, not a failure.
        return Response(200, {
            'code': detection.get('language'),
            'confidence': detection.get('confidence'),
            'method': detection.get('method'),
            'reason': detection.get('reason', ''),
            'abstained': detection.get('language') is None and bool(detection.get('reason')),
            'candidates': detection.get('candidates', []),
            'provisional': detection.get('provisional', True),
            'caveat': detection.get('caveat', ''),
        })

    def transcribe(self, request) -> Response:
        """Proxy multipart audio to Door ASR — mobile never calls Door directly."""
        if request.audio is None:
            return error_response(
                400, 'empty_audio',
                'Send audio as multipart/form-data with a file field.',
            )
        filename, audio = request.audio
        if not audio:
            return error_response(400, 'empty_audio', 'Audio file is empty.')

        fields = request.json if isinstance(request.json, dict) else {}
        language = (fields.get('language') or '').strip() or None

        try:
            result = self.adara.transcribe(filename, audio, language=language)
        except NotImplementedYet as error:
            return error_response(501, 'not_implemented', str(error))
        except AdaraError as error:
            logger.warning('Transcription failed: %s', error)
            return error_response(502, 'upstream_error', str(error)[:200])
        return Response(200, result)

    def synthesize(self, request) -> Response:
        """Proxy Door TTS so the phone does not have to know about :8080."""
        body = request.json or {}
        text = (body.get('text') or '').strip()
        if not text:
            return error_response(400, 'empty_text', 'text is required')
        try:
            result = self.adara.synthesize(text, language=body.get('language'))
        except NotImplementedYet as error:
            return error_response(501, 'not_implemented', str(error))
        except AdaraError as error:
            logger.warning('Synthesize failed: %s', error)
            return error_response(502, 'upstream_error', str(error)[:200])
        return Response(200, result)

    def generate(self, request) -> Response:
        return error_response(
            501, 'not_implemented',
            'This standalone route is not implemented. Reply generation happens per-turn at '
            'POST /v1/agent/sessions/{id}/turns instead -- the reply carries source='
            '"grounded_template", or "openai:<model>" when OPENAI_API_KEY is configured.',
        )

    # -- the voice conversation -------------------------------------------------------------------
    def create_session(self, request) -> Response:
        body = request.json or {}
        session = self.store.create(
            locale=body.get('locale'),
            language=body.get('language'),
            client=body.get('client') or {},
        )
        return Response(201, {
            'session': session.as_dict(),
            'capabilities': self.adara.capabilities().as_dict(),
        })

    def get_session(self, request) -> Response:
        session = self.store.get(request.params['sid'])
        if session is None:
            return error_response(404, 'session_not_found', 'No such session, or it expired.')
        return Response(200, {'session': session.as_dict()})

    def end_session(self, request) -> Response:
        if not self.store.delete(request.params['sid']):
            return error_response(404, 'session_not_found', 'No such session, or it expired.')
        return Response(200, {'ended': True})

    def create_turn(self, request) -> Response:
        session = self.store.get(request.params['sid'])
        if session is None:
            return error_response(404, 'session_not_found', 'No such session, or it expired.')

        if request.audio is not None:
            filename, audio = request.audio
            turn = self.agent.submit_audio(session, filename, audio)
        else:
            body = request.json or {}
            turn = self.agent.submit_text(
                session,
                body.get('text', ''),
                transcript_source=body.get('transcript_source') or 'typed',
            )

        return Response(201, {
            'turn': turn.as_dict(),
            'session': {'id': session.id, 'language': session.language,
                        'language_source': session.language_source, 'locale': session.locale},
        })

    def get_turn(self, request) -> Response:
        session = self.store.get(request.params['sid'])
        if session is None:
            return error_response(404, 'session_not_found', 'No such session, or it expired.')
        turn = next((t for t in session.turns if t.id == request.params['tid']), None)
        if turn is None:
            return error_response(404, 'turn_not_found', 'No such turn in this session.')
        return Response(200, {'turn': turn.as_dict()})

    def events(self, request) -> Response:
        """Marker: the handler streams instead of returning a body. See `_stream_events`."""
        return Response(200, None, stream='events')


class Request:
    """One parsed request. Small on purpose — this is a BFF, not a framework."""

    def __init__(self, method: str, path: str, params: dict, headers, body: bytes) -> None:
        self.method = method
        self.path = path
        self.params = params
        self.headers = headers
        self.body = body
        self.json = None
        self.audio: tuple[str, bytes] | None = None

        content_type = (headers.get('content-type') or '').lower()
        if 'application/json' in content_type and body:
            try:
                self.json = json.loads(body.decode('utf-8'))
            except (ValueError, UnicodeDecodeError):
                self.json = None
        elif 'multipart/form-data' in content_type and body:
            self.audio, self.json = _parse_multipart(body, content_type)


class Response:
    def __init__(self, status: int, payload, *, stream: str | None = None) -> None:
        self.status = status
        self.payload = payload
        self.stream = stream


def error_response(status: int, code: str, message: str) -> Response:
    """The error envelope from `docs/openapi/adara-v1.yaml`, so one client parses both services."""
    types = {400: 'invalid_request_error', 404: 'not_found_error', 405: 'invalid_request_error',
             413: 'invalid_request_error', 501: 'not_implemented_error',
             502: 'api_error'}
    return Response(status, {
        'error': {
            'type': types.get(status, 'api_error'),
            'code': code,
            'message': message,
        }
    })


def _parse_multipart(body: bytes, content_type: str) -> tuple[tuple[str, bytes] | None, dict]:
    """Pull one file part and any text fields out of a multipart body.

    Written by hand because `cgi` was removed in Python 3.13 and `email` wants the headers glued
    back on. It handles the shape a phone actually sends — a few small text fields and one audio
    part — and nothing more.
    """
    match = re.search(r'boundary=(?:"([^"]+)"|([^;]+))', content_type)
    if not match:
        return None, {}
    boundary = (match.group(1) or match.group(2)).strip().encode()

    fields: dict = {}
    file_part: tuple[str, bytes] | None = None

    for section in body.split(b'--' + boundary):
        if not section.strip() or section.strip() == b'--':
            continue
        head, _, payload = section.partition(b'\r\n\r\n')
        if not payload:
            continue
        payload = payload.rstrip(b'\r\n')
        headers = head.decode('utf-8', 'replace')

        name = re.search(r'name="([^"]*)"', headers)
        filename = re.search(r'filename="([^"]*)"', headers)
        if filename:
            file_part = (filename.group(1) or 'audio', payload)
        elif name:
            fields[name.group(1)] = payload.decode('utf-8', 'replace')

    return file_part, fields


class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    application: Application = None  # injected by `serve`

    def log_message(self, fmt, *args):
        logger.info('%s - %s', self.address_string(), fmt % args)

    # -- verbs --------------------------------------------------------------------------------
    def do_GET(self):
        self._dispatch('GET')

    def do_POST(self):
        self._dispatch('POST')

    def do_DELETE(self):
        self._dispatch('DELETE')

    def do_OPTIONS(self):
        # CORS preflight. Expo Web runs the app on a different origin from this service, so
        # without this the browser build cannot call it at all.
        self.send_response(204)
        self._cors()
        self.send_header('access-control-allow-methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('access-control-allow-headers', 'content-type, authorization')
        self.send_header('access-control-max-age', '86400')
        self.send_header('content-length', '0')
        self.end_headers()

    # -- plumbing -----------------------------------------------------------------------------
    def _bearer_token(self) -> str | None:
        auth = self.headers.get('authorization') or ''
        prefix = 'bearer '
        return auth[len(prefix):].strip() if auth.lower().startswith(prefix) else None

    def _dispatch(self, method: str):
        path = self.path.split('?', 1)[0].rstrip('/') or '/'
        handler, params = self.application.resolve(method, path)

        if handler is None:
            status = params.get('_status', 404)
            code = 'method_not_allowed' if status == 405 else 'not_found'
            self._send(error_response(status, code, f'{method} {path} is not a route here.'))
            return

        # Health stays open so a load balancer or the app's own status check needs no key.
        # Every other route can trigger a paid call against Door, so once VOICE_AGENT_API_KEYS is
        # set, all of them require it. Off (empty keys) is the current, unauthenticated default.
        if path != '/v1/health' and not self.application.config.accepts(self._bearer_token()):
            self._send(error_response(401, 'invalid_api_key', 'A valid bearer token is required.'))
            return

        try:
            length = int(self.headers.get('content-length') or 0)
            body = self.rfile.read(length) if length else b''
            request = Request(method, path, params, self.headers, body)
            response = handler(request)
        except Exception as error:  # noqa: BLE001 - a handler bug returns 500, it does not kill the server
            logger.exception('Unhandled error on %s %s', method, path)
            self._send(error_response(500, 'internal_error', str(error)[:200]))
            return

        if response.stream == 'events':
            self._stream_events(params['sid'])
            return
        self._send(response)

    def _send(self, response: Response):
        payload = (json.dumps(response.payload).encode('utf-8')
                   if response.payload is not None else b'')
        self.send_response(response.status)
        self.send_header('content-type', 'application/json')
        self.send_header('content-length', str(len(payload)))
        self._cors()
        self.end_headers()
        if payload:
            self.wfile.write(payload)

    def _cors(self):
        origins = self.application.config.allowed_origins
        origin = self.headers.get('origin')
        allowed = '*' if '*' in origins else (origin if origin in origins else '')
        if allowed:
            self.send_header('access-control-allow-origin', allowed)
            self.send_header('vary', 'origin')

    def _stream_events(self, session_id: str):
        """Server-sent events for one session.

        SSE rather than WebSocket: the traffic is one-directional, it survives proxies that mangle
        upgrades, `EventSource` needs no library, and reconnection is built into the browser. A
        WebSocket would be the right call once the client streams audio *up* continuously.
        """
        store = self.application.store
        if store.get(session_id) is None:
            self._send(error_response(404, 'session_not_found', 'No such session, or it expired.'))
            return

        queue: Queue = Queue()
        store.subscribe(session_id, queue.put)

        self.send_response(200)
        self.send_header('content-type', 'text/event-stream')
        self.send_header('cache-control', 'no-cache')
        self.send_header('connection', 'keep-alive')
        # Without this an Nginx in front buffers the stream and the client sees nothing until the
        # connection closes, which defeats the entire point of streaming.
        self.send_header('x-accel-buffering', 'no')
        self._cors()
        self.end_headers()

        try:
            self._write_event({'event': 'stream.open', 'data': {'session_id': session_id}})
            while True:
                try:
                    event = queue.get(timeout=SSE_KEEPALIVE_SECONDS)
                except Empty:
                    self.wfile.write(b': keepalive\n\n')
                    self.wfile.flush()
                    continue
                if event is None:
                    self._write_event(
                        {'event': 'session.ended', 'data': {'session_id': session_id}})
                    return
                self._write_event(event)
        except ConnectionError:
            # The phone walked out of coverage, or the app was backgrounded. Normal, not an error.
            # `ConnectionError` rather than the individual subclasses because which one is raised
            # is platform-specific — Windows aborts (10053) where Linux resets — and a stack trace
            # in the log every time a user locks their screen trains operators to ignore the log.
            pass
        finally:
            store.unsubscribe(session_id, queue.put)

    def _write_event(self, event: dict):
        payload = json.dumps(event.get('data', {}))
        self.wfile.write(f'event: {event["event"]}\ndata: {payload}\n\n'.encode())
        self.wfile.flush()


def build(config: Config | None = None, **kwargs) -> Application:
    return Application(config or Config.from_env(), **kwargs)


def serve(application: Application | None = None) -> ThreadingHTTPServer:
    """Start the server. Returns it so a caller — or a test — can shut it down."""
    application = application or build()
    handler = type('BoundHandler', (Handler,), {'application': application})
    server = ThreadingHTTPServer((application.config.host, application.config.port), handler)
    server.daemon_threads = True
    return server


def main() -> None:
    from .envfile import load_env_file

    logging.basicConfig(level=logging.INFO, format='%(levelname)s %(name)s: %(message)s')
    load_env_file()  # optional; a real environment variable always wins, see envfile.py
    application = build()
    server = serve(application)
    host, port = server.server_address[:2]

    capabilities = application.adara.capabilities()
    policy_name = 'openai:' + application.config.openai_model if application.config.openai_api_key \
        else 'grounded_template'
    logger.info('%s listening on http://%s:%s (adara mode=%s, reply policy=%s)',
                SERVICE, host, port, application.config.mode, policy_name)
    logger.info('capabilities: %s', {k: v for k, v in capabilities.as_dict().items()
                                     if k != 'reasons'})
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info('shutting down')
    finally:
        server.shutdown()
        server.server_close()


if __name__ == '__main__':
    main()
