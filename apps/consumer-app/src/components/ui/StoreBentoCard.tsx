import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Bouncy } from "./Bouncy";
import { BentoSize } from "./BentoGrid";
import { StoreResult } from "../../lib/api-client";
import { categoryMeta } from "../../lib/store-category";
import { color, tint, type, space } from "../../theme/tokens";

export function StoreBentoCard({
  store,
  size,
  height,
  index,
  onPress,
}: {
  store: StoreResult;
  size: BentoSize;
  height: number;
  index: number;
  onPress: () => void;
}) {
  const meta = categoryMeta(store.category);
  const big = size !== "half";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 380, delay: Math.min(index, 8) * 60 }}
    >
      <Bouncy onPress={onPress} style={[s.card, { height }]} scaleTo={0.96}>
        <LinearGradient
          colors={[tint[meta.tint], "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1.2 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.iconWrap}>
          <Ionicons name={meta.icon} size={big ? 30 : 22} color={color.ink} />
        </View>

        <View style={s.body}>
          <Text
            style={[type.label, s.name, big && s.nameBig]}
            numberOfLines={size === "wide" ? 1 : 2}
          >
            {store.name}
          </Text>
          <View style={s.metaRow}>
            <Text style={[type.meta, s.metaText]}>{meta.label}</Text>
            {typeof store.distance_km === "number" && (
              <>
                <Text style={[type.meta, s.dot]}>·</Text>
                <Text style={[type.meta, s.metaText]}>{store.distance_km.toFixed(1)} km</Text>
              </>
            )}
          </View>
          {big && store.tagline && (
            <Text style={[type.meta, s.tagline]} numberOfLines={2}>
              {store.tagline}
            </Text>
          )}
        </View>
      </Bouncy>
    </MotiView>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: color.line,
    padding: space.md,
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { gap: 3 },
  name: { color: color.text, fontFamily: "Jakarta_700" },
  nameBig: { fontSize: 16 },
  metaRow: { flexDirection: "row", alignItems: "center" },
  metaText: { color: color.muted },
  dot: { color: color.muted, marginHorizontal: 4 },
  tagline: { color: color.muted, marginTop: 2 },
});
