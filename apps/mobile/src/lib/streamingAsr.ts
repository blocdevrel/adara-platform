/**
 * Door WebSocket ASR client — PCM16 in, FINAL transcript out.
 *
 * Door accumulates chunks and transcribes on COMMIT (no mid-utterance PARTIAL yet).
 * Opening the socket while the mic is live still cuts end-of-turn latency vs HTTP upload.
 */

import { doorWsAsrUrl } from "@/lib/doorConfig";
import { bytesToBase64, pcm16FromWav } from "@/lib/wavPcm";

export type AsrFinal = {
  transcript: string;
  language: string | null;
  durationMs: number;
};

type ServerMessage = {
  type: string;
  transcript?: string;
  language?: string | null;
  duration_ms?: number;
  seq?: number;
  message?: string;
  code?: string;
  fatal?: boolean;
};

export class StreamingAsrSession {
  private ws: WebSocket | null = null;
  private ready = false;
  private seq = 0;
  private closed = false;
  private waiters: {
    ready?: { resolve: () => void; reject: (e: Error) => void };
    final?: { resolve: (r: AsrFinal) => void; reject: (e: Error) => void };
  } = {};

  static async connect(options: {
    language?: string;
    sampleRate?: number;
  }): Promise<StreamingAsrSession> {
    const session = new StreamingAsrSession();
    await session.open(options);
    return session;
  }

  private open(options: { language?: string; sampleRate?: number }): Promise<void> {
    const url = doorWsAsrUrl({
      language: options.language,
      sampleRate: options.sampleRate ?? 16000,
    });

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      this.ws = ws;
      this.waiters.ready = { resolve, reject };

      const fail = (message: string) => {
        if (this.waiters.ready) {
          this.waiters.ready.reject(new Error(message));
          this.waiters.ready = undefined;
        }
        if (this.waiters.final) {
          this.waiters.final.reject(new Error(message));
          this.waiters.final = undefined;
        }
      };

      ws.onopen = () => {
        // SESSION_READY arrives as first server frame.
      };

      ws.onmessage = (event) => {
        let msg: ServerMessage;
        try {
          msg = JSON.parse(String(event.data)) as ServerMessage;
        } catch {
          return;
        }

        if (msg.type === "SESSION_READY") {
          this.ready = true;
          this.waiters.ready?.resolve();
          this.waiters.ready = undefined;
          return;
        }

        if (msg.type === "ERROR") {
          fail(msg.message || msg.code || "ASR WebSocket error");
          this.close();
          return;
        }

        if (msg.type === "FINAL") {
          this.waiters.final?.resolve({
            transcript: (msg.transcript || "").trim(),
            language: msg.language ?? null,
            durationMs: msg.duration_ms ?? 0,
          });
          this.waiters.final = undefined;
          this.close();
        }
      };

      ws.onerror = () => fail("ASR WebSocket connection failed");
      ws.onclose = () => {
        if (!this.ready && this.waiters.ready) {
          fail("ASR WebSocket closed before SESSION_READY");
        }
        this.closed = true;
      };

      setTimeout(() => {
        if (!this.ready && this.waiters.ready) {
          fail("ASR WebSocket timed out waiting for SESSION_READY");
          this.close();
        }
      }, 8000);
    });
  }

  get isOpen(): boolean {
    return !!this.ws && this.ready && !this.closed;
  }

  /** Send raw PCM16 LE mono bytes (already decoded from WAV). */
  sendPcm(pcm: Uint8Array, chunkBytes = 32_000): void {
    if (!this.ws || !this.ready || this.closed) {
      throw new Error("ASR session is not ready");
    }
    for (let i = 0; i < pcm.length; i += chunkBytes) {
      const slice = pcm.subarray(i, Math.min(i + chunkBytes, pcm.length));
      this.ws.send(
        JSON.stringify({
          type: "AUDIO_CHUNK",
          seq: this.seq++,
          data: bytesToBase64(slice),
        }),
      );
    }
  }

  /** Read a recorded WAV URI, stream PCM, COMMIT, wait for FINAL. */
  async commitWavUri(uri: string): Promise<AsrFinal> {
    const response = await fetch(uri);
    const buffer = await response.arrayBuffer();
    const pcm = pcm16FromWav(buffer);
    if (!pcm || pcm.byteLength === 0) {
      throw new Error("Recording is not PCM WAV — falling back to upload");
    }
    this.sendPcm(pcm);
    return this.commit();
  }

  commit(): Promise<AsrFinal> {
    if (!this.ws || !this.ready) {
      return Promise.reject(new Error("ASR session is not ready"));
    }
    return new Promise((resolve, reject) => {
      this.waiters.final = { resolve, reject };
      this.ws!.send(JSON.stringify({ type: "COMMIT" }));
      setTimeout(() => {
        if (this.waiters.final) {
          this.waiters.final.reject(new Error("ASR COMMIT timed out"));
          this.waiters.final = undefined;
          this.close();
        }
      }, 120_000);
    });
  }

  close(): void {
    this.closed = true;
    try {
      this.ws?.close();
    } catch {
      // already closed
    }
    this.ws = null;
  }
}
