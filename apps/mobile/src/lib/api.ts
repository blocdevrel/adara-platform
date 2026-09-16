import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Client for the Adara backend.
 *
 * Two servers can answer this, and the app does not need to know which:
 *
 *   - `apps/api` — the Node stub. Every intelligence route answers 501.
 *   - `services/voice-agent` — the Python backend that reaches the real intelligence layer
 *     through `adara-sdk`, and adds the session/turn surface a voice conversation needs.
 *
 * Point `EXPO_PUBLIC_ADARA_API_URL` at whichever is running. Routes that exist on both keep the
 * same shapes, so nothing below branches on it.
 *
 * `notImplemented` stays a first-class result rather than an error. It is what a capability with
 * no backend wired returns, it is the normal state of several of them today, and the honest UI is
 * a disabled affordance — not a crash and not a retry.
 */

/** Must not be Expo Metro's 8081 — Expo Go loads the JS bundle from that port. */
const VOICE_AGENT_PORT = 8091;

function packagerHost(): string | undefined {
  const raw = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.linkingUri,
  ].filter(Boolean) as string[];

  for (const value of raw) {
    try {
      const host = value.includes("://") ? new URL(value).hostname : value.split(":")[0];
      if (host && host !== "localhost" && host !== "127.0.0.1") return host;
    } catch {
      // skip unparseable values
    }
  }
  return undefined;
}

function resolveBaseUrl(): string {
  // On a physical device, follow the same LAN IP Expo Go used for Metro.
  if (Platform.OS !== "web") {
    const host = packagerHost();
    if (host) return `http://${host}:${VOICE_AGENT_PORT}`;
  }

  const fromEnv = process.env.EXPO_PUBLIC_ADARA_API_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const extra = Constants.expoConfig?.extra?.adaraApiUrl as string | undefined;
  if (extra) return extra.replace(/\/$/, "");

  return `http://127.0.0.1:${VOICE_AGENT_PORT}`;
}

const baseUrl = resolveBaseUrl();

export const adaraBaseUrl = baseUrl;

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; kind: "notImplemented" | "network" | "http"; message: string };

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
    });

    if (response.status === 501) {
      const body = await response.json().catch(() => null);
      return {
        ok: false,
        kind: "notImplemented",
        // The service explains *why* a capability is missing — no weights, no endpoint, wrong
        // transport. That sentence is more useful to a user than a generic apology.
        message: body?.error?.message ?? "This Adara capability is not wired up yet.",
      };
    }
    if (!response.ok) {
      return { ok: false, kind: "http", message: `Request failed (${response.status}).` };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (err) {
    return {
      ok: false,
      kind: "network",
      message: `Cannot reach Adara at ${baseUrl} (${err instanceof Error ? err.message : "network"}).`,
    };
  }
}

/** Multipart, for audio. `fetch` sets the boundary itself, so no content-type is sent here. */
async function upload<T>(path: string, form: FormData): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${baseUrl}${path}`, { method: "POST", body: form });
    if (response.status === 501) {
      const body = await response.json().catch(() => null);
      return {
        ok: false,
        kind: "notImplemented",
        message: body?.error?.message ?? "This Adara capability is not wired up yet.",
      };
    }
    if (!response.ok) {
      return { ok: false, kind: "http", message: `Upload failed (${response.status}).` };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (err) {
    return {
      ok: false,
      kind: "network",
      message: `Cannot reach Adara at ${baseUrl} (${err instanceof Error ? err.message : "network"}).`,
    };
  }
}

/**
 * What this deployment can do, answered before the user tries.
 *
 * The reason it exists: finding out that transcription is unavailable *after* someone has
 * recorded thirty seconds of audio is a worse product than never showing the microphone.
 */
export type Capabilities = {
  understand: boolean;
  detect_language: boolean;
  resolve_context: boolean;
  transcribe: boolean;
  synthesize: boolean;
  extract_entities: boolean;
  /** Why each unavailable capability is unavailable. Show it; do not swallow it. */
  reasons: Record<string, string>;
};

/** One thing Adara recognised in an utterance. */
export type ContextMatch = {
  term: string;
  concept: string;
  category: string;
  gloss: string;
  /** The gloss actually in force — differs from `gloss` when a negation inverted it. */
  reading?: string;
  confidence: number;
  surface_form: string;
  start: number;
  end: number;
  ambiguous?: boolean;
  /** Non-empty when the term needs care — an insult, a contested name. Never paraphrase it. */
  sensitivity?: string;
};

/** What the agent said back, and on what basis. */
export type AgentReply = {
  text: string;
  /** `grounded_template` means it was assembled from what was resolved, not generated. */
  source: string;
  /** `acknowledge` | `clarify_sense` | `ask_unknown_term` | `ask_repeat` | `report_unavailable` */
  act: string;
  grounded_on: string[];
  /** True when the agent asked something — keep the microphone open. */
  expects_answer: boolean;
  /** Caveats to surface: unreviewed knowledge, detector disagreement, sensitive terms. */
  warnings: string[];
  speech: { available: boolean; reason?: string; language?: string };
};

export type Turn = {
  id: string;
  role: string;
  status: "pending" | "understood" | "replied" | "failed";
  input_kind: "text" | "audio";
  text: string | null;
  transcript_source?: string;
  reply: AgentReply | null;
  meaning?: {
    language: string | null;
    concepts: string[];
    provisional: boolean;
    context?: { matches: ContextMatch[]; gaps: { text: string; reason: string }[] };
  } | null;
  error: { code: string; message: string; recoverable: boolean } | null;
};

export type Session = {
  id: string;
  locale: string | null;
  language: string | null;
  language_source: string;
  turns: Turn[];
};

export const api = {
  /**
   * Convert text to speech.
   *
   * Returns `audio_base64` — a WAV buffer encoded as base64. Play it with expo-audio.
   *
   * Returns `{ ok: false, kind: 'notImplemented' }` when MMS-TTS weights are not installed.
   * The UI should skip playback silently — the text reply is already shown.
   */
  synthesize: (text: string, options: { language?: string; locale?: string } = {}) =>
    request<{ audio_base64: string; format: string; sample_rate: number }>(
      "/v1/speech/synthesize",
      { method: "POST", body: JSON.stringify({ text, ...options }) },
    ),
};

/**
 * The voice conversation.
 *
 * A session holds the locale and the settled language so every turn does not resend them, and so
 * a short utterance the language detector abstains on still inherits the language established
 * earlier in the call.
 */
export const agent = {
  createSession: (options: {
    locale?: string;
    language?: string;
    client?: Record<string, string>;
  } = {}) =>
    request<{ session: Session; capabilities: Capabilities }>("/v1/agent/sessions", {
      method: "POST",
      body: JSON.stringify(options),
    }),

  getSession: (sessionId: string) =>
    request<{ session: Session }>(`/v1/agent/sessions/${sessionId}`),

  endSession: (sessionId: string) =>
    request<{ ended: boolean }>(`/v1/agent/sessions/${sessionId}`, { method: "DELETE" }),

  sendText: (sessionId: string, text: string) =>
    request<{ turn: Turn; session: Partial<Session> }>(
      `/v1/agent/sessions/${sessionId}/turns`,
      { method: "POST", body: JSON.stringify({ text }) },
    ),

  /** ASR transcript — voice-agent marks source as `asr` so the LLM can interpret noisy text. */
  sendTranscript: (sessionId: string, text: string) =>
    request<{ turn: Turn; session: Partial<Session> }>(
      `/v1/agent/sessions/${sessionId}/turns`,
      {
        method: "POST",
        body: JSON.stringify({ text, transcript_source: "asr" }),
      },
    ),

  /**
   * Upload a recording as a turn.
   *
   * `uri` is what the recorder hands back. React Native's FormData takes the `{ uri, name, type }`
   * shape and streams the file itself, which is why the bytes are never loaded into JS memory.
   */
  sendAudio: (sessionId: string, uri: string, options: { name?: string; type?: string } = {}) => {
    const form = new FormData();
    form.append("file", {
      uri,
      name: options.name ?? "turn.m4a",
      type: options.type ?? "audio/m4a",
    } as unknown as Blob);
    return upload<{ turn: Turn; session: Partial<Session> }>(
      `/v1/agent/sessions/${sessionId}/turns`,
      form,
    );
  },

  /** The full meaning object for one turn — kilobytes of provenance, fetched only on demand. */
  getTurn: (sessionId: string, turnId: string) =>
    request<{ turn: Turn }>(`/v1/agent/sessions/${sessionId}/turns/${turnId}`),

  /**
   * Watch a session's turns as they progress.
   *
   * Uses `EventSource` where the runtime has one (Expo Web) and falls back to polling elsewhere,
   * because React Native ships neither `EventSource` nor streaming `fetch`. Both paths deliver the
   * same turn summaries, so a caller never branches on which one it got — the difference is
   * latency, not information.
   *
   * Returns an unsubscribe function. Call it when the screen unmounts, or the stream outlives the
   * conversation.
   */
  subscribe(
    sessionId: string,
    onTurn: (turn: Turn) => void,
    options: { pollMs?: number } = {},
  ): () => void {
    const EventSourceImpl = (globalThis as { EventSource?: typeof EventSource }).EventSource;

    if (EventSourceImpl) {
      const stream = new EventSourceImpl(`${baseUrl}/v1/agent/sessions/${sessionId}/events`);
      const handle = (event: MessageEvent) => {
        try {
          onTurn(JSON.parse(event.data) as Turn);
        } catch {
          // A malformed frame is not worth tearing the stream down for.
        }
      };
      for (const name of ["turn.created", "turn.transcribed", "turn.understood", "turn.replied", "turn.failed"]) {
        stream.addEventListener(name, handle as EventListener);
      }
      return () => stream.close();
    }

    let stopped = false;
    let seen = 0;
    const interval = setInterval(async () => {
      if (stopped) return;
      const result = await agent.getSession(sessionId);
      if (!result.ok) return;
      const turns = result.data.session.turns ?? [];
      for (const turn of turns.slice(seen)) onTurn(turn);
      seen = turns.length;
    }, options.pollMs ?? 1200);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  },
};
