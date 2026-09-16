/**
 * ASR via voice-agent → Door. Mobile only talks to :8091 (no Door port/CORS on device).
 */

import { Platform } from "react-native";

import { adaraBaseUrl, type ApiResult } from "@/lib/api";

function guessName(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.includes(".wav")) return "recording.wav";
  if (lower.includes(".webm")) return "recording.webm";
  if (lower.includes(".m4a") || lower.includes(".mp4")) return "recording.m4a";
  return "recording.wav";
}

function guessType(name: string): string {
  if (name.endsWith(".webm")) return "audio/webm";
  if (name.endsWith(".m4a")) return "audio/mp4";
  return "audio/wav";
}

export async function doorTranscribe(
  uri: string,
  options: { language?: string; name?: string; type?: string } = {},
): Promise<ApiResult<{ transcript: string; language?: string | null }>> {
  const name = options.name ?? guessName(uri);
  const type = options.type ?? guessType(name);
  const base = adaraBaseUrl;

  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await (await fetch(uri)).blob();
    form.append("file", blob, name);
  } else {
    form.append("file", { uri, name, type } as unknown as Blob);
  }
  if (options.language) {
    form.append("language", options.language);
  }

  try {
    const response = await fetch(`${base}/v1/speech/transcribe`, {
      method: "POST",
      body: form,
    });

    if (response.status === 501) {
      const body = await response.json().catch(() => null);
      return {
        ok: false,
        kind: "notImplemented",
        message:
          (body as { error?: { message?: string } })?.error?.message ??
          "Transcription is not available on this server.",
      };
    }
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message =
        (body as { error?: { message?: string } })?.error?.message ??
        `Transcription failed (${response.status}).`;
      return { ok: false, kind: "http", message };
    }

    const data = (await response.json()) as { transcript?: string; language?: string | null };
    const transcript = (data.transcript ?? "").trim();
    if (!transcript) {
      return {
        ok: false,
        kind: "http",
        message: "No speech detected in that recording.",
      };
    }
    return { ok: true, data: { transcript, language: data.language ?? null } };
  } catch (err) {
    return {
      ok: false,
      kind: "network",
      message: `Cannot reach Adara at ${base} (${err instanceof Error ? err.message : "network"}).`,
    };
  }
}
