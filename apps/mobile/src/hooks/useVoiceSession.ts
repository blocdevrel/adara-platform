/**
 * Push-to-talk: hold mic → voice-agent ASR → understand + LLM reply.
 */

import {
  AudioModule,
  AudioQuality,
  IOSOutputFormat,
  RecordingPresets,
  createAudioPlayer,
  setAudioModeAsync,
  useAudioRecorder,
  type AudioPlayer,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";

import { agent, api, type Capabilities, type Session, type Turn } from "@/lib/api";
import { doorTranscribe } from "@/lib/doorTranscribe";
import { getVoicePrefs, sessionOptionsFromPrefs } from "@/lib/voicePrefs";

const ASR_RECORDING = {
  ...RecordingPresets.HIGH_QUALITY,
  extension: ".wav",
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 256000,
  ios: {
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.HIGH,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  android: {
    outputFormat: "mpeg4" as const,
    audioEncoder: "aac" as const,
    extension: ".m4a",
    sampleRate: 16000,
  },
};

const MIN_RECORD_MS = 400;

export type MicState = "idle" | "recording" | "processing";

export type VoiceSessionState = {
  loading: boolean;
  session: Session | null;
  capabilities: Capabilities | null;
  turns: Turn[];
  micState: MicState;
  liveTranscript: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopAndSend: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  sendText: (text: string) => Promise<void>;
  sendAudioUri: (uri: string, options?: { name?: string; type?: string }) => Promise<void>;
  speakReply: (text: string, language?: string | null) => Promise<void>;
};

export function useVoiceSession(options: {
  locale?: string;
  language?: string;
} = {}): VoiceSessionState {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [micState, setMicState] = useState<MicState>("idle");
  const [liveTranscript, setLiveTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorder = useAudioRecorder(ASR_RECORDING);

  const sessionIdRef = useRef<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const speechLangRef = useRef<string>("tw");
  const micStateRef = useRef<MicState>("idle");
  const stoppingRef = useRef(false);
  const holdActiveRef = useRef(false);
  const recordingStartedAt = useRef<number | null>(null);

  useEffect(() => {
    micStateRef.current = micState;
  }, [micState]);

  const upsertTurn = useCallback((turn: Turn) => {
    setTurns((prev) => {
      const idx = prev.findIndex((t) => t.id === turn.id);
      if (idx === -1) return [...prev, turn];
      const next = [...prev];
      next[idx] = turn;
      return next;
    });
  }, []);

  const speakReply = useCallback(
    async (text: string, language?: string | null) => {
      if (!capabilities?.synthesize) return;
      if (!text.trim()) return;

      try {
        playerRef.current?.remove();
        playerRef.current = null;

        const result = await api.synthesize(text, language ? { language } : {});
        if (!result.ok) return;

        const player = createAudioPlayer({
          uri: `data:audio/wav;base64,${result.data.audio_base64}`,
        });
        playerRef.current = player;
        player.play();
      } catch {
        // Playback errors are non-fatal.
      }
    },
    [capabilities],
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);

      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError("Microphone permission is required for voice input.");
        setLoading(false);
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      const prefs = getVoicePrefs();
      speechLangRef.current = options.language ?? prefs.speechLanguage;
      const result = await agent.createSession({
        ...sessionOptionsFromPrefs({
          locale: options.locale ?? prefs.locale,
          speechLanguage: speechLangRef.current,
        }),
      });

      if (cancelled) return;

      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        return;
      }

      const { session: s, capabilities: caps } = result.data;
      // ASR runs voice-agent → Door; enable mic when understand works.
      if (caps.understand) {
        caps.transcribe = true;
        delete caps.reasons.transcribe;
      }
      setSession(s);
      setCapabilities(caps);
      setTurns(s.turns ?? []);
      sessionIdRef.current = s.id;
      setLoading(false);

      unsubscribeRef.current = agent.subscribe(s.id, (turn) => {
        upsertTurn(turn);
        if (turn.status === "replied" && turn.reply?.text) {
          const ttsLang =
            (turn.reply.speech as { language?: string } | undefined)?.language ??
            turn.meaning?.language ??
            null;
          void speakReply(turn.reply.text, ttsLang);
        }
      });
    }

    void init();

    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
      if (sessionIdRef.current) {
        void agent.endSession(sessionIdRef.current);
      }
      playerRef.current?.remove();
      playerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startRecording = useCallback(async () => {
    if (micStateRef.current !== "idle") return;
    if (!sessionIdRef.current) return;

    holdActiveRef.current = true;

    try {
      setLiveTranscript(null);
      setError(null);
      recordingStartedAt.current = Date.now();
      stoppingRef.current = false;

      const prefs = getVoicePrefs();
      speechLangRef.current = options.language ?? prefs.speechLanguage;

      await recorder.prepareToRecordAsync();
      if (!holdActiveRef.current) return;

      recorder.record();
      if (!holdActiveRef.current) {
        await recorder.stop();
        return;
      }
      setMicState("recording");
    } catch (err) {
      setError(`Could not start recording: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [recorder, options.language]);

  const stopAndSend = useCallback(async () => {
    holdActiveRef.current = false;
    if (micStateRef.current !== "recording" || stoppingRef.current) return;
    const sid = sessionIdRef.current;
    if (!sid) return;

    stoppingRef.current = true;
    setMicState("processing");
    setLiveTranscript("Transcribing…");

    try {
      const recordMs = recordingStartedAt.current
        ? Date.now() - recordingStartedAt.current
        : 0;

      await recorder.stop();
      const uri = recorder.uri;

      if (!uri || recordMs < MIN_RECORD_MS) {
        setLiveTranscript(null);
        return;
      }

      const asr = await doorTranscribe(uri, {
        language: speechLangRef.current,
      });

      if (!asr.ok) {
        setError(asr.message);
        return;
      }

      setLiveTranscript(asr.data.transcript);
      const result = await agent.sendTranscript(sid, asr.data.transcript);
      if (result.ok) {
        upsertTurn(result.data.turn);
      } else {
        setError(result.message);
      }
    } finally {
      stoppingRef.current = false;
      setMicState("idle");
      setTimeout(() => setLiveTranscript(null), 1500);
    }
  }, [recorder, upsertTurn]);

  const cancelRecording = useCallback(async () => {
    holdActiveRef.current = false;
    if (micStateRef.current !== "recording") return;
    stoppingRef.current = true;
    try {
      await recorder.stop();
    } catch {
      // Already stopped.
    } finally {
      setLiveTranscript(null);
      stoppingRef.current = false;
      setMicState("idle");
    }
  }, [recorder]);

  const sendText = useCallback(async (text: string) => {
    const sid = sessionIdRef.current;
    if (!sid || !text.trim()) return;

    setMicState("processing");
    const result = await agent.sendText(sid, text);
    setMicState("idle");

    if (result.ok) upsertTurn(result.data.turn);
    else setError(result.message);
  }, [upsertTurn]);

  const sendAudioUri = useCallback(async (
    uri: string,
    options: { name?: string; type?: string } = {},
  ) => {
    const sid = sessionIdRef.current;
    if (!sid || !uri) return;

    setMicState("processing");
    setLiveTranscript("Transcribing…");

    const lower = (options.name ?? uri).toLowerCase();
    const isWav = lower.endsWith(".wav") || lower.includes(".wav");
    const asr = await doorTranscribe(uri, {
      language: speechLangRef.current,
      name: options.name ?? (isWav ? "upload.wav" : "upload.m4a"),
      type: options.type ?? (isWav ? "audio/wav" : "audio/m4a"),
    });

    if (!asr.ok) {
      setError(asr.message);
      setMicState("idle");
      return;
    }

    setLiveTranscript(asr.data.transcript);
    const result = await agent.sendTranscript(sid, asr.data.transcript);
    setMicState("idle");

    if (result.ok) upsertTurn(result.data.turn);
    else setError(result.message);

    setTimeout(() => setLiveTranscript(null), 1500);
  }, [upsertTurn]);

  return {
    loading,
    session,
    capabilities,
    turns,
    micState,
    liveTranscript,
    error,
    startRecording,
    stopAndSend,
    cancelRecording,
    sendText,
    sendAudioUri,
    speakReply,
  };
}
