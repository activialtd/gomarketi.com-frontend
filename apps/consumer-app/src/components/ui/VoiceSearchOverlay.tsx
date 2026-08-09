import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { Button } from "./Button";
import { color, radius, type, space } from "../../theme/tokens";

type Status = "listening" | "error";
const RECOGNITION_OPTIONS = { lang: "en-US", interimResults: true, continuous: false } as const;

/**
 * Voice capture sheet — real on-device speech-to-text via
 * expo-speech-recognition (no more stub/timeout). A dev build is required
 * to run this at all: adding this native module means Expo Go can no
 * longer load the app — use `eas build --profile development` once, then
 * `expo start --dev-client` for local iteration from then on.
 *
 * Listening starts as soon as the sheet mounts; the native "end" event
 * (fired on silence or an explicit stop()) resolves with whatever the last
 * transcript was. An empty transcript or a recognition error surfaces
 * inline ("Didn't catch that — try again") instead of silently closing.
 */
export function VoiceSearchOverlay({
  onResult,
  onCancel,
}: {
  onResult: (query: string) => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState<Status>("listening");
  const [liveTranscript, setLiveTranscript] = useState("");
  const transcriptRef = useRef("");
  // Guards event handlers against firing after cancel/unmount — stop()
  // stopping the native recognizer doesn't guarantee its async "end"/"error"
  // events can't still land a tick later.
  const activeRef = useRef(true);

  useSpeechRecognitionEvent("result", (event) => {
    if (!activeRef.current) return;
    const t = event.results[0]?.transcript ?? "";
    transcriptRef.current = t;
    setLiveTranscript(t);
  });

  useSpeechRecognitionEvent("error", () => {
    if (!activeRef.current) return;
    setStatus("error");
  });

  useSpeechRecognitionEvent("end", () => {
    if (!activeRef.current) return;
    const t = transcriptRef.current.trim();
    if (t) {
      onResult(t);
    } else {
      setStatus("error");
    }
  });

  const startListening = async () => {
    transcriptRef.current = "";
    setLiveTranscript("");
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!activeRef.current) return;
    if (!perm.granted) {
      setStatus("error");
      return;
    }
    setStatus("listening");
    ExpoSpeechRecognitionModule.start(RECOGNITION_OPTIONS);
  };

  useEffect(() => {
    activeRef.current = true;
    startListening();
    return () => {
      activeRef.current = false;
      ExpoSpeechRecognitionModule.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal transparent animationType="slide" onRequestClose={onCancel}>
      {/* scrim: tap to dismiss */}
      <Pressable style={s.scrim} onPress={onCancel} accessibilityLabel="Dismiss" />

      <View style={s.sheet}>
        <View style={s.grabber} />

        <View style={[s.mic, status === "error" && s.micError]}>
          <Ionicons name={status === "error" ? "mic-off" : "mic"} size={26} color={color.onPrimary} />
        </View>

        {status === "listening" ? (
          <>
            <Text style={[type.title, { marginTop: space.lg }]}>Listening…</Text>
            <Text style={[type.body, { textAlign: "center", marginTop: 6 }]}>
              {liveTranscript || "Say what you're looking for"}
            </Text>
          </>
        ) : (
          <>
            <Text style={[type.title, { marginTop: space.lg }]}>Didn't catch that</Text>
            <Text style={[type.body, { textAlign: "center", marginTop: 6 }]}>
              Try again, or check your microphone permission.
            </Text>
          </>
        )}

        {status === "error" && (
          <Button
            label="Try again"
            onPress={startListening}
            style={{ alignSelf: "stretch", marginTop: space.xxl }}
          />
        )}
        <Button
          label="Cancel"
          variant="secondary"
          onPress={onCancel}
          style={{ alignSelf: "stretch", marginTop: status === "error" ? space.sm : space.xxl }}
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
  micError: { backgroundColor: color.textFaint },
});
