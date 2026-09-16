import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/Text";
import { Waveform } from "@/components/Waveform";
import { tapLight } from "@/lib/haptics";
import { sessionHistory } from "@/lib/sessionHistory";
import { useTokens } from "@/theme";

const PANEL_W = Math.min(Dimensions.get("window").width * 0.88, 360);

type VoiceHistoryDrawerProps = {
  visible: boolean;
  onClose: () => void;
  onSelectSession?: (id: string) => void;
};

/** ChatGPT-style slide-in sidebar for past voice sessions. */
export function VoiceHistoryDrawer({
  visible,
  onClose,
  onSelectSession,
}: VoiceHistoryDrawerProps) {
  const tokens = useTokens();
  const insets = useSafeAreaInsets();
  const isDark = tokens.scheme === "dark";
  const slide = useSharedValue(-PANEL_W);

  useEffect(() => {
    slide.value = withTiming(visible ? 0 : -PANEL_W, { duration: 280 });
  }, [visible, slide]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slide.value }],
  }));

  const panelBg = isDark ? "#14121C" : "#FFFFFF";
  const border = isDark ? "#2A2736" : "#F0EEF6";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, flexDirection: "row" }}>
        <Reanimated.View
          style={[
            {
              width: PANEL_W,
              height: "100%",
              backgroundColor: panelBg,
              borderRightWidth: 1,
              borderRightColor: border,
              paddingTop: insets.top + 8,
              paddingBottom: insets.bottom + 12,
            },
            panelStyle,
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingBottom: 16,
            }}
          >
            <Text variant="heading" accessibilityRole="header">
              History
            </Text>
            <Pressable
              onPress={() => {
                tapLight();
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel="Close history"
              hitSlop={10}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
              }}
            >
              <Ionicons name="close" size={20} color={tokens.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 4, paddingBottom: 24 }}
          >
            {sessionHistory.map((session, index) => (
              <View key={session.id}>
                {sessionHistory[index - 1]?.day !== session.day ? (
                  <Text
                    variant="label"
                    className="text-text-tertiary"
                    style={{
                      marginTop: index === 0 ? 0 : 16,
                      marginBottom: 8,
                      paddingHorizontal: 4,
                    }}
                    accessibilityRole="header"
                  >
                    {session.day}
                  </Text>
                ) : null}

                <Pressable
                  onPress={() => {
                    tapLight();
                    onSelectSession?.(session.id);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={session.title}
                  accessibilityHint={session.length}
                  style={({ pressed }) => ({
                    borderRadius: 14,
                    padding: 14,
                    backgroundColor: pressed
                      ? isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"
                      : "transparent",
                  })}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <Text variant="bodyStrong" numberOfLines={2}>
                        {session.title}
                      </Text>
                      <Text variant="callout" className="text-text-tertiary">
                        {session.length}
                      </Text>
                    </View>
                    <Waveform
                      height={22}
                      seed={session.seed}
                      progress={1}
                      color={tokens.primary}
                      trackColor={tokens.textTertiary}
                    />
                  </View>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </Reanimated.View>

        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.42)" }}
          onPress={() => {
            tapLight();
            onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss history"
        />
      </View>
    </Modal>
  );
}
