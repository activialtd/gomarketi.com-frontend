import React, { useEffect } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./Button";
import { color, radius, type, space } from "../../theme/tokens";
import { randomVoiceQuery } from "../../lib/mock-products";

/**
 * Voice capture sheet.
 *
 * A bottom sheet, not a full-screen spectacle. The only motion is the system
 * modal slide — no waveform, no pulses. Listening state is communicated by a
 * solid accent mic and a label, which is enough.
 *
 * TODO(backend): real speech-to-text. @react-native-voice/voice needs a dev
 * build (won't run in Expo Go). Swap the timeout below for the recognizer's
 * onSpeechResults callback.
 */
export function VoiceSearchOverlay({
  onResult,
  onCancel,
}: {
  onResult: (query: string) => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onResult(randomVoiceQuery()), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <Modal transparent animationType="slide" onRequestClose={onCancel}>
      {/* scrim: tap to dismiss */}
      <Pressable style={s.scrim} onPress={onCancel} accessibilityLabel="Dismiss" />

      <View style={s.sheet}>
        <View style={s.grabber} />

        <View style={s.mic}>
          <Ionicons name="mic" size={26} color={color.onPrimary} />
        </View>

        <Text style={[type.title, { marginTop: space.lg }]}>Listening…</Text>
        <Text style={[type.body, { textAlign: "center", marginTop: 6 }]}>
          Say what you're looking for
        </Text>

        <Button
          label="Cancel"
          variant="secondary"
          onPress={onCancel}
          style={{ alignSelf: "stretch", marginTop: space.xxl }}
        />
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: "rgba(12,20,15,0.35)" },
  sheet: {
    alignItems: "center",
    backgroundColor: color.background,
    paddingHorizontal: space.xxl,
    paddingTop: space.md,
    paddingBottom: 40,
    borderTopLeftRadius: radius.panel,
    borderTopRightRadius: radius.panel,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.border,
    marginBottom: space.xxl,
  },
  mic: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: color.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
