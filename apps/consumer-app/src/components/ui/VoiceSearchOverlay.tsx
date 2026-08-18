import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { color, radius, type, space } from "../../theme/tokens";
import { useVoiceSearch } from "../../hooks/useVoiceSearch";

const { width, height } = Dimensions.get("window");

export function VoiceSearchOverlay({
  onResult,
  onCancel,
}: {
  onResult: (query: string) => void;
  onCancel: () => void;
}) {
  const { state, start, stop, cancel } = useVoiceSearch(onResult);

  useEffect(() => {
    start();
    return () => {
      cancel();
    };
  }, []);

  const handleCancel = () => {
    cancel();
    onCancel();
  };

  const handleStop = () => {
    if (state === "recording") stop();
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={handleCancel}>
      <Pressable
        style={s.scrim}
        onPress={handleCancel}
        accessibilityLabel="Dismiss"
      />

      <View style={s.sheet}>
        <View style={s.grabber} />

        <AuroraField dimmed={state === "processing" || state === "error"} />

        <View style={s.stage}>
          {state === "recording" && <MicButton onPress={handleStop} />}
          {state === "processing" && <Processing />}
          {state === "error" && <ErrorState onRetry={start} />}
          {state === "idle" && <ActivityIndicator color={color.ink} />}
        </View>

        {/* Status text */}
        <View style={s.textBlock}>
          <Text style={[type.title, { textAlign: "center" }]}>
            {state === "recording" && "Listening…"}
            {state === "processing" && "Hearing you out…"}
            {state === "error" && "Didn't catch that"}
            {state === "idle" && "Preparing microphone"}
          </Text>
          <Text style={[type.body, { textAlign: "center", marginTop: 6 }]}>
            {state === "recording" && "Tap the mic when you're done speaking"}
            {state === "processing" && "Transcribing your request"}
            {state === "error" && "Try again, or type your search instead"}
            {state === "idle" && "Just a moment"}
          </Text>
        </View>

        <Pressable
          onPress={handleCancel}
          disabled={state === "processing"}
          style={({ pressed }) => [
            s.cancel,
            pressed && { backgroundColor: color.panel },
            state === "processing" && { opacity: 0.4 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Cancel voice search"
        >
          <Text style={s.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function MicButton({ onPress }: { onPress: () => void }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Stop recording"
    >
      {/* outward pulse ring */}
      <Animated.View
        style={[
          s.pulseRing,
          { opacity, transform: [{ scale }], backgroundColor: color.accent },
        ]}
      />
      <View style={s.mic}>
        <Ionicons name="mic" size={32} color={color.onInk} />
      </View>
    </Pressable>
  );
}

/* ────────────────────────── processing ────────────────────────── */

function Processing() {
  return (
    <View style={[s.mic, { backgroundColor: color.ink }]}>
      <ActivityIndicator color={color.onInk} size="large" />
    </View>
  );
}

/* ────────────────────────── error ────────────────────────── */

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Pressable
      onPress={onRetry}
      accessibilityRole="button"
      accessibilityLabel="Retry recording"
    >
      <View style={[s.mic, { backgroundColor: "#C0392B" }]}>
        <Ionicons name="refresh" size={30} color={color.onInk} />
      </View>
    </Pressable>
  );
}

/* ────────────────────────── aurora (background) ────────────────────────── */

function AuroraField({ dimmed }: { dimmed: boolean }) {
  const t1 = useRef(new Animated.Value(0)).current;
  const t2 = useRef(new Animated.Value(0)).current;
  const t3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (v: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    loop(t1, 3800);
    loop(t2, 5400);
    loop(t3, 4600);
  }, []);

  const drift = (
    v: Animated.Value,
    x: number,
    y: number,
    r1: string,
    r2: string,
    s1 = 1,
    s2 = 1.12,
  ) => ({
    transform: [
      {
        translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, x] }),
      },
      {
        translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, y] }),
      },
      { rotate: v.interpolate({ inputRange: [0, 1], outputRange: [r1, r2] }) },
      { scale: v.interpolate({ inputRange: [0, 1], outputRange: [s1, s2] }) },
    ],
  });

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity: dimmed ? 0.3 : 1 }]}
    >
      <Animated.View
        style={[
          a.blob,
          {
            top: 20,
            left: -60,
            width: 240,
            height: 150,
            borderRadius: 120,
            backgroundColor: "#CFEBD8",
            opacity: 0.6,
          },
          drift(t2, 20, 10, "-14deg", "0deg"),
        ]}
      />
      <Animated.View
        style={[
          a.blob,
          {
            top: 80,
            right: -70,
            width: 260,
            height: 140,
            borderRadius: 130,
            backgroundColor: "#8FDCA6",
            opacity: 0.5,
          },
          drift(t1, -22, 12, "20deg", "36deg", 1, 0.94),
        ]}
      />
      <Animated.View
        style={[
          a.blob,
          {
            bottom: 140,
            alignSelf: "center",
            width: 300,
            height: 180,
            borderRadius: 150,
            backgroundColor: "#CFEBD8",
            opacity: 0.55,
          },
          drift(t3, 16, -8, "-24deg", "-8deg"),
        ]}
      />
      <Animated.View
        style={[
          a.blob,
          {
            bottom: 160,
            alignSelf: "center",
            width: 140,
            height: 100,
            borderRadius: 70,
            backgroundColor: "#34B968",
            opacity: 0.4,
          },
          drift(t1, 12, -14, "6deg", "-12deg", 1, 1.2),
        ]}
      />
    </View>
  );
}
const a = StyleSheet.create({ blob: { position: "absolute" } });

/* ────────────────────────── styles ────────────────────────── */

const s = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: "rgba(12,20,15,0.4)" },
  sheet: {
    height: height * 0.55,
    backgroundColor: color.card,
    paddingHorizontal: space.xxl,
    paddingTop: space.md,
    paddingBottom: 40,
    borderTopLeftRadius: radius.panel,
    borderTopRightRadius: radius.panel,
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.lineStrong,
    marginBottom: space.xl,
  },
  stage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  mic: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: color.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: color.accent,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  pulseRing: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 96,
    height: 96,
    borderRadius: 48,
  },

  textBlock: {
    marginTop: space.xl,
    paddingHorizontal: space.md,
  },

  cancel: {
    alignSelf: "stretch",
    height: 52,
    borderRadius: radius.chip,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: color.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    marginTop: space.xl,
  },
  cancelText: {
    fontFamily: "Jakarta_600",
    fontSize: 15,
    color: color.text,
  },
});
