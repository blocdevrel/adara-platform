/**
 * Talk home — ChatGPT Voice chrome + Spotify lyrics transcript.
 *
 * Chrome: history menu + profile in the top bar; mute at the bottom.
 * Lyrics: active line large & bright, centered; older lines shrink/fade upward.
 */

import { useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Screen,
  Text,
  VoiceHistoryDrawer,
  VoiceMenuBar,
  VoiceWave,
  Gradient,
  ReactIcon,
} from "@/components";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { tapLight, notifySuccess } from "@/lib/haptics";
import { getVoicePrefs } from "@/lib/voicePrefs";
import { useTokens, textFontStyle } from "@/theme";
import type { Turn } from "@/lib/api";
import { FiArrowRight, FiMic, FiPlus } from "react-icons/fi";

// ─── motion ──────────────────────────────────────────────────────────────────

/** Soft spring — Spotify lyrics feel snappy, not bouncy. */
const SPRING = { damping: 26, stiffness: 160, mass: 0.9 } as const;

const WORD_STAGGER_MS = 48;
const WORD_DURATION_MS = 280;
const WORD_RISE_PX = 14;

/** Active line size; distance uses scale so lines don’t reflow. */
const LINE_SIZE = 34;

function distScale(d: number): number {
  if (d === 0) return 1;
  if (d === 1) return 0.9;
  if (d === 2) return 0.82;
  return 0.76;
}

/** Past lines fade hard so they’re gone before they meet the wave. */
function distOpacity(d: number): number {
  if (d === 0) return 1;
  if (d === 1) return 0.3;
  if (d === 2) return 0.08;
  return 0;
}

// ─── lyric model ─────────────────────────────────────────────────────────────

type LyricLine = {
  id: string;
  text: string;
  role: "user" | "assistant" | "waiting";
  /** Animate words in (active assistant only). */
  animateWords?: boolean;
};

function linesFromTurns(turns: Turn[]): LyricLine[] {
  const out: LyricLine[] = [];
  for (const turn of turns) {
    const userText =
      turn.text ?? (turn.input_kind === "audio" ? "…" : "");
    if (userText) {
      out.push({ id: `${turn.id}-u`, text: userText, role: "user" });
    }
    const reply = turn.reply?.text;
    if (reply) {
      out.push({
        id: `${turn.id}-a`,
        text: reply,
        role: "assistant",
        animateWords: true,
      });
    } else if (turn.status === "pending" || turn.status === "understood") {
      out.push({ id: `${turn.id}-w`, text: "", role: "waiting" });
    } else if (turn.status === "failed" && turn.error) {
      out.push({
        id: `${turn.id}-e`,
        text: turn.error.message,
        role: "assistant",
      });
    }
  }
  return out;
}

// ─── AnimatedWord ────────────────────────────────────────────────────────────

function AnimatedWord({
  word,
  delay,
  color,
}: {
  word: string;
  delay: number;
  color: string;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(WORD_RISE_PX)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: WORD_DURATION_MS,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: WORD_DURATION_MS,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.Text
      style={{
        opacity,
        transform: [{ translateY }],
        color,
        fontSize: LINE_SIZE,
        fontWeight: "700",
        lineHeight: LINE_SIZE * 1.35,
        marginRight: 8,
        marginBottom: 4,
        letterSpacing: -0.3,
        textAlign: "left",
        ...textFontStyle,
      }}
    >
      {word}
    </Animated.Text>
  );
}

// ─── LyricLineRow ────────────────────────────────────────────────────────────

function LyricLineRow({
  line,
  distance,
  isDark,
  onLayout,
}: {
  line: LyricLine;
  distance: number;
  isDark: boolean;
  onLayout?: (y: number, height: number) => void;
}) {
  const scaleVal = useSharedValue(distScale(distance));
  const opacityVal = useSharedValue(distOpacity(distance));
  const isActive = distance === 0;

  useEffect(() => {
    scaleVal.value = withSpring(distScale(distance), SPRING);
    opacityVal.value = withTiming(distOpacity(distance), { duration: 380 });
  }, [distance, scaleVal, opacityVal]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacityVal.value,
    transform: [{ scale: scaleVal.value }],
  }));

  const activeColor = isDark ? "#FFFFFF" : "#0A0A0A";
  // Spotify: past lines read as soft gray, not near-black
  const pastColor = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.36)";
  const color = isActive ? activeColor : pastColor;
  const words = useMemo(
    () => line.text.split(" ").filter(Boolean),
    [line.text],
  );

  return (
    <Reanimated.View
      onLayout={(e) => {
        const { y, height } = e.nativeEvent.layout;
        onLayout?.(y, height);
      }}
      style={[
        {
          width: "100%",
          paddingHorizontal: 28,
          paddingVertical: isActive ? 10 : 6,
          alignItems: "flex-start",
        },
        animStyle,
      ]}
    >
      {line.role === "waiting" ? (
        <ThinkingDots
          color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.32)"}
        />
      ) : isActive && line.animateWords && line.role === "assistant" ? (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            width: "100%",
            justifyContent: "flex-start",
          }}
        >
          {words.map((w, i) => (
            <AnimatedWord
              key={`${line.id}-${i}`}
              word={w}
              delay={i * WORD_STAGGER_MS}
              color={activeColor}
            />
          ))}
        </View>
      ) : (
        <Text
          style={{
            fontSize: LINE_SIZE,
            lineHeight: LINE_SIZE * 1.35,
            fontWeight: isActive && line.role === "assistant" ? "700" : "600",
            color,
            letterSpacing: -0.3,
            textAlign: "left",
            width: "100%",
            ...textFontStyle,
          }}
        >
          {line.text}
        </Text>
      )}
    </Reanimated.View>
  );
}

// ─── ThinkingDots ────────────────────────────────────────────────────────────

function ThinkingDots({ color }: { color: string }) {
  const dots = [
    useRef(new Animated.Value(0.2)).current,
    useRef(new Animated.Value(0.2)).current,
    useRef(new Animated.Value(0.2)).current,
  ];

  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(d, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.2, duration: 280, useNativeDriver: true }),
        ]),
      ),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 8, paddingVertical: 10 }}>
      {dots.map((d, i) => (
        <Animated.View
          key={i}
          style={{
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: color,
            opacity: d,
          }}
        />
      ))}
    </View>
  );
}

// ─── LyricStage ──────────────────────────────────────────────────────────────

const WAVE_HEIGHT = 100;
/** Soft veil under the wave so lines are gone before they touch it. */
const FADE_HEIGHT = 72;

function LyricStage({
  turns,
  isProcessing,
  isTyping,
  isDark,
  waveActive,
  liveTranscript,
}: {
  turns: Turn[];
  isProcessing: boolean;
  isTyping: boolean;
  isDark: boolean;
  waveActive: boolean;
  liveTranscript?: string | null;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const viewportH = useRef(0);
  const lineLayouts = useRef<Record<string, { y: number; height: number }>>({});

  const lines = useMemo(() => {
    const base = linesFromTurns(turns);
    if (liveTranscript?.trim()) {
      return [
        ...base,
        {
          id: "live-asr",
          role: "user" as const,
          text: liveTranscript.trim(),
          animateWords: false,
        },
      ];
    }
    return base;
  }, [turns, liveTranscript]);
  const activeIndex = lines.length - 1;

  // Stay centered until the user actually types or a turn exists.
  // Auto-listen keeps the mic open — that alone must not dock the wave.
  const engaged = isProcessing || isTyping || lines.length > 0 || !!liveTranscript?.trim();

  const canvas = isDark ? "#000000" : "#FFFFFF";
  const fadeColors = useMemo(
    () =>
      [
        canvas,
        isDark ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.85)",
        isDark ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)",
      ] as const,
    [canvas, isDark],
  );

  // Keep the current answer fully visible below the fade veil.
  const pinActive = useCallback(() => {
    const active = lines[activeIndex];
    if (!active) return;
    const layout = lineLayouts.current[active.id];
    const h = viewportH.current;
    if (!layout || h <= 0) {
      scrollRef.current?.scrollToEnd({ animated: true });
      return;
    }
    // Place active line just under the fade zone so it never dissolves.
    const targetY = Math.max(0, layout.y - FADE_HEIGHT - 16);
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  }, [activeIndex, lines]);

  useEffect(() => {
    if (activeIndex < 0) return;
    const t = setTimeout(pinActive, 80);
    return () => clearTimeout(t);
  }, [activeIndex, lines.length, pinActive]);

  // Re-pin when the active reply grows (word-by-word / streaming).
  useEffect(() => {
    if (activeIndex < 0) return;
    const active = lines[activeIndex];
    if (!active?.text) return;
    const t = setTimeout(pinActive, 40);
    return () => clearTimeout(t);
  }, [activeIndex, lines, pinActive]);

  if (!engaged) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <VoiceWave active={waveActive} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Wave stays above the transcript — never overlapping. */}
      <View
        style={{
          height: WAVE_HEIGHT + 8,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        <VoiceWave active={waveActive} />
      </View>

      <View style={{ flex: 1, position: "relative" }}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          onLayout={(e) => {
            viewportH.current = e.nativeEvent.layout.height;
          }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-end",
            paddingTop: FADE_HEIGHT + 12,
            paddingBottom: 28,
          }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={lines.length > 1}
          overScrollMode="never"
          bounces
          onContentSizeChange={() => {
            // New text / taller active line → keep it in view.
            pinActive();
          }}
        >
          {lines.map((line, idx) => (
            <LyricLineRow
              key={line.id}
              line={line}
              distance={activeIndex - idx}
              isDark={isDark}
              onLayout={(y, height) => {
                lineLayouts.current[line.id] = { y, height };
                if (idx === activeIndex) pinActive();
              }}
            />
          ))}
        </ScrollView>

        {/* Fade veil — older lines dissolve before they reach the wave. */}
        <Gradient
          colors={[...fadeColors]}
          locations={[0, 0.45, 1]}
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: FADE_HEIGHT,
            zIndex: 1,
          }}
        />
      </View>
    </View>
  );
}

// ─── VoiceScreen ─────────────────────────────────────────────────────────────

export default function VoiceScreen() {
  const router = useRouter();
  const tokens = useTokens();
  const insets = useSafeAreaInsets();
  const prefs = getVoicePrefs();
  const keyboardHeight = useKeyboardHeight();
  const keyboardUp = keyboardHeight > 0;

  const {
    loading, session, capabilities, turns,
    micState, liveTranscript, error,
    startRecording, stopAndSend, cancelRecording, sendText, sendAudioUri,
  } = useVoiceSession({ locale: prefs.locale, language: prefs.speechLanguage });

  const [textDraft, setTextDraft] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const micHeldRef = useRef(false);

  const handleMicPressIn = useCallback(() => {
    if (!session || !capabilities?.transcribe || micState !== "idle") return;
    micHeldRef.current = true;
    tapLight();
    void startRecording();
  }, [session, capabilities?.transcribe, micState, startRecording]);

  const handleMicPressOut = useCallback(() => {
    if (!micHeldRef.current) return;
    micHeldRef.current = false;
    void stopAndSend();
  }, [stopAndSend]);

  const handleSendText = useCallback(async () => {
    const text = textDraft.trim();
    if (!text || !session) return;
    setTextDraft("");
    tapLight();
    await sendText(text);
    notifySuccess();
  }, [textDraft, session, sendText]);

  const handleDraftChange = useCallback((next: string) => {
    setTextDraft(next);
    if (next.trim().length > 0 && micState === "recording") {
      void cancelRecording();
    }
  }, [micState, cancelRecording]);

  const handleAudioUpload = useCallback(async () => {
    if (!session || micState === "processing") return;
    tapLight();
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (picked.canceled || !picked.assets?.[0]) return;
      const asset = picked.assets[0];
      await sendAudioUri(asset.uri, {
        name: asset.name ?? "upload.m4a",
        type: asset.mimeType ?? "audio/m4a",
      });
      notifySuccess();
    } catch (err) {
      Alert.alert(
        "Upload failed",
        err instanceof Error ? err.message : "Could not open that audio file.",
      );
    }
  }, [session, micState, sendAudioUri]);

  const isDark = tokens.scheme === "dark";
  const isProcessing = micState === "processing";
  const isRecording = micState === "recording";
  const hasText = textDraft.trim().length > 0;
  /** ChatGPT pattern: one blue action — mic empty, send while typing. */
  const showSendAction = hasText || isProcessing;
  const inputBg = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)";
  const hintColor = tokens.textTertiary;

  const composerHint = !capabilities?.transcribe
    ? "Voice is offline — type your message below"
    : hasText
    ? "Ready to send — tap → or hit return"
    : isRecording
    ? `Hold to speak (${prefs.speechLanguage}) — release to send`
    : isProcessing
    ? liveTranscript && liveTranscript !== "Transcribing…"
      ? "Got it — thinking…"
      : "Transcribing…"
    : "Hold the mic to speak, or type below";

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <VoiceMenuBar
          onOpenHistory={() => setHistoryOpen(true)}
          onOpenProfile={() => router.push("/profile")}
        />

        <VoiceHistoryDrawer
          visible={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14 }}>
            <ActivityIndicator color={tokens.textSecondary} />
            <Text style={{ color: tokens.textTertiary, fontSize: 17 }}>Starting…</Text>
          </View>
        ) : !session ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14, paddingHorizontal: 40 }}>
            <Text style={{ color: tokens.textTertiary, fontSize: 16, textAlign: "center" }}>
              {error ?? "Could not connect"}
            </Text>
          </View>
        ) : (
          <LyricStage
            turns={turns}
            isProcessing={isProcessing}
            isTyping={hasText}
            isDark={isDark}
            waveActive={isRecording}
            liveTranscript={liveTranscript}
          />
        )}

        {error && session ? (
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 8,
              backgroundColor: isDark ? "#2A1010" : "#FFF0F0",
              borderRadius: 12,
              padding: 10,
            }}
          >
            <Text style={{ color: "#E55", fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}

        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: keyboardUp
              ? Platform.OS === "ios" ? 8 : Math.max(insets.bottom, 8)
              : Math.max(insets.bottom, 20),
            paddingTop: 8,
            gap: 8,
          }}
        >
          <Text
            style={{
              color: hintColor,
              fontSize: 12,
              textAlign: "center",
              letterSpacing: 0.2,
              paddingHorizontal: 8,
            }}
          >
            {composerHint}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: inputBg,
              borderRadius: 28,
              paddingVertical: Platform.OS === "ios" ? 8 : 6,
              paddingLeft: 10,
              paddingRight: 8,
              minHeight: 52,
            }}
          >
            <Pressable
              onPress={handleAudioUpload}
              disabled={!session || isProcessing}
              accessibilityRole="button"
              accessibilityLabel="Upload audio"
              accessibilityHint="Attach a voice note or audio file"
              hitSlop={6}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
                opacity: pressed || !session || isProcessing ? 0.5 : 1,
              })}
            >
              <ReactIcon icon={FiPlus} size={22} color={tokens.text} />
            </Pressable>

            <TextInput
              style={{
                flex: 1,
                color: tokens.text,
                fontSize: 17,
                lineHeight: 23,
                maxHeight: 110,
                minHeight: 36,
                paddingVertical: 4,
                ...textFontStyle,
              }}
              placeholder="Ask Adara anything…"
              placeholderTextColor={tokens.textTertiary}
              value={textDraft}
              onChangeText={handleDraftChange}
              onFocus={() => {
                if (isRecording) void cancelRecording();
              }}
              multiline
              returnKeyType="send"
              blurOnSubmit
              onSubmitEditing={handleSendText}
              editable={!isProcessing && !!session}
              accessibilityLabel="Message Adara"
              accessibilityHint="Type a question, then tap send"
            />

            <View
              collapsable={false}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                // Fill on View — Android often drops backgroundColor on Pressable.
                backgroundColor: "#2563EB",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                opacity: !session || isProcessing ? 0.55 : 1,
              }}
            >
              <Pressable
                onPress={showSendAction ? handleSendText : undefined}
                onPressIn={showSendAction ? undefined : handleMicPressIn}
                onPressOut={showSendAction ? undefined : handleMicPressOut}
                disabled={
                  !session ||
                  isProcessing ||
                  (showSendAction && !hasText) ||
                  (!showSendAction && !capabilities?.transcribe)
                }
                hitSlop={4}
                style={({ pressed }) => ({
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed || isRecording ? 0.75 : 1,
                  transform: [{ scale: isRecording ? 1.08 : 1 }],
                })}
                accessibilityRole="button"
                accessibilityLabel={
                  showSendAction ? "Send" : "Hold to speak"
                }
                accessibilityHint={
                  showSendAction
                    ? "Send your message"
                    : "Press and hold to record, release to send"
                }
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : showSendAction ? (
                  <ReactIcon
                    icon={FiArrowRight}
                    size={18}
                    strokeWidth={2.75}
                    color="#FFFFFF"
                  />
                ) : (
                  <ReactIcon
                    icon={FiMic}
                    size={20}
                    strokeWidth={2.5}
                    color="#FFFFFF"
                  />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
