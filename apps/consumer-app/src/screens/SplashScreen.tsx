import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, MotiText } from "moti";
import { Easing } from "react-native-reanimated";
import { color, radius, space, stickerShadow } from "../theme/tokens";

const DOTS = [0, 1, 2];
const BLOBS = [
  { bg: color.sunshine, size: 60, top: "18%", left: "14%", delay: 0 },
  { bg: color.coral, size: 46, top: "68%", left: "78%", delay: 250 },
  { bg: color.sky, size: 38, top: "72%", left: "12%", delay: 500 },
] as const;

/** Brand hold — the mark wiggles and bounces like a little character, not a static logo. */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1700);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.root}>
      {/* floating colour pops, drifting slowly in the background */}
      {BLOBS.map((b, i) => (
        <MotiView
          key={i}
          from={{ translateY: 0, opacity: 0 }}
          animate={{ translateY: -18, opacity: 0.85 }}
          transition={{
            type: "timing",
            duration: 1800,
            delay: b.delay,
            loop: true,
            repeatReverse: true,
          }}
          style={[
            s.blob,
            {
              backgroundColor: b.bg,
              width: b.size,
              height: b.size,
              borderRadius: b.size / 2,
              top: b.top as any,
              left: b.left as any,
            },
          ]}
        />
      ))}

      <View style={s.markWrap}>
        {/* breathing halo behind the mark */}
        <MotiView
          from={{ scale: 0.9, opacity: 0.35 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{
            type: "timing",
            duration: 1600,
            easing: Easing.out(Easing.ease),
            loop: true,
          }}
          style={s.halo}
        />

        {/* the mark itself: springs in, then wiggles + bounces continuously like a character */}
        <MotiView
          from={{ scale: 0.4, opacity: 0, rotate: "-18deg" }}
          animate={{ scale: 1, opacity: 1, rotate: "0deg" }}
          transition={{ type: "spring", damping: 8, mass: 0.6, delay: 80 }}
        >
          <MotiView
            from={{ rotate: "-7deg" }}
            animate={{ rotate: "7deg" }}
            transition={{
              type: "timing",
              duration: 900,
              delay: 700,
              loop: true,
              repeatReverse: true,
              easing: Easing.inOut(Easing.ease),
            }}
            style={[s.mark, stickerShadow(color.ink900, 5)]}
          >
            <Ionicons name="bag-handle-outline" size={38} color={color.onPrimary} />
          </MotiView>
        </MotiView>

        {/* sparkle badge, bouncing on its own beat */}
        <MotiView
          from={{ scale: 0.6, translateY: 0 }}
          animate={{ scale: 1, translateY: -6 }}
          transition={{
            type: "timing",
            duration: 550,
            delay: 900,
            loop: true,
            repeatReverse: true,
          }}
          style={[s.sparkle, stickerShadow(color.ink900, 3)]}
        >
          <Ionicons name="sparkles" size={16} color={color.foreground} />
        </MotiView>
      </View>

      <MotiText
        from={{ opacity: 0, translateY: 14 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 450, delay: 420 }}
        style={s.word}
      >
        GoMarketi
      </MotiText>

      <View style={s.dots}>
        {DOTS.map((i) => (
          <MotiView
            key={i}
            from={{ opacity: 0.25, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "timing",
              duration: 500,
              delay: 700 + i * 140,
              loop: true,
              repeatReverse: true,
            }}
            style={[s.dot, { backgroundColor: [color.coral, color.sunshine, color.sky][i] }]}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.background, alignItems: "center", justifyContent: "center" },
  blob: { position: "absolute" },
  markWrap: { alignItems: "center", justifyContent: "center" },
  halo: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: color.accent,
  },
  mark: {
    width: 76,
    height: 76,
    borderRadius: radius.card,
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sparkle: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: color.sunshine,
    alignItems: "center",
    justifyContent: "center",
  },
  word: {
    fontFamily: "Fredoka_600",
    fontSize: 24,
    color: color.foreground,
    marginTop: space.lg,
    letterSpacing: -0.2,
  },
  dots: { flexDirection: "row", gap: 8, marginTop: 32 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
