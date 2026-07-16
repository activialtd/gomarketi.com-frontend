import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { color, radius, space } from "../theme/tokens";

/** Brand hold. Static — no logo choreography. */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.root}>
      <View style={s.mark}>
        <Ionicons name="bag-handle-outline" size={34} color={color.onPrimary} />
      </View>
      <Text style={s.word}>GoMarketi</Text>
      <ActivityIndicator style={{ marginTop: 32 }} color={color.muted} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.background, alignItems: "center", justifyContent: "center" },
  mark: {
    width: 68,
    height: 68,
    borderRadius: radius.card,
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  word: {
    fontFamily: "Jakarta_700",
    fontSize: 22,
    color: color.foreground,
    marginTop: space.lg,
    letterSpacing: -0.3,
  },
});
