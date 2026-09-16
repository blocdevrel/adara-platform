import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Door (adara-intelligence API) — WebSocket ASR lives here, not on voice-agent.
 *
 * voice-agent (8091) owns sessions/turns. Door (8080) owns WS /v1/speech/ws/asr.
 * Keys on device are for local/dev only (`ADARA_DOOR_DEV=1` → token `dev`).
 */

/** Not 8080 — that port is the web Vite dev server in this monorepo. */
const DOOR_PORT = 8088;

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
      // skip
    }
  }
  return undefined;
}

function resolveDoorHttpBase(): string {
  const fromEnv = process.env.EXPO_PUBLIC_ADARA_DOOR_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const extra = Constants.expoConfig?.extra?.adaraDoorUrl as string | undefined;
  if (extra) return extra.replace(/\/$/, "");

  if (Platform.OS !== "web") {
    const host = packagerHost();
    if (host) return `http://${host}:${DOOR_PORT}`;
  }

  return `http://127.0.0.1:${DOOR_PORT}`;
}

export function doorHttpBase(): string {
  return resolveDoorHttpBase();
}

export function doorWsAsrUrl(params: {
  language?: string;
  sampleRate?: number;
  token?: string;
}): string {
  const http = resolveDoorHttpBase();
  const wsBase = http.replace(/^http/i, "ws");
  const token =
    params.token ??
    process.env.EXPO_PUBLIC_ADARA_DOOR_TOKEN ??
    (Constants.expoConfig?.extra?.adaraDoorToken as string | undefined) ??
    "dev";

  const q = new URLSearchParams();
  q.set("token", token);
  if (params.language) q.set("language", params.language);
  q.set("sample_rate", String(params.sampleRate ?? 16000));
  return `${wsBase}/v1/speech/ws/asr?${q.toString()}`;
}

export function isDoorAsrConfigured(): boolean {
  // Dev default is always reachable when Door is running with ADARA_DOOR_DEV=1.
  return true;
}
