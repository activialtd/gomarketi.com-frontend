import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Bouncy } from "./Bouncy";
import { BentoSize } from "./BentoGrid";
import { Market } from "../../lib/api-client";
import { color, type, space } from "../../theme/tokens";

// Cycle through a few of the brand's own tints so the markets grid reads as
// lively/varied without needing a category to key off of.
const PALETTE = ["#EFEFF1", "#E6F0E9", "#F6EEDD", "#EAF3E3", "#E8EEF7", "#F5E9E3"] as const;

export function MarketBentoCard({
  market,
  size,
  height,
  index,
  onPress,
}: {
  market: Market;
  size: BentoSize;
  height: number;
  index: number;
  onPress: () => void;
}) {
  const big = size !== "half";
  const bg = PALETTE[index % PALETTE.length];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 380, delay: Math.min(index, 8) * 60 }}
    >
      <Bouncy onPress={onPress} style={[s.card, { height }]} scaleTo={0.96}>
        <LinearGradient
          colors={[bg, "#FFFFFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1.2 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.iconWrap}>
          <Ionicons name="storefront-outline" size={big ? 30 : 22} color={color.ink} />
        </View>
        <View>
          <Text style={[type.label, s.name, big && s.nameBig]} numberOfLines={2}>
            {market.name}
          </Text>
          <Text style={[type.meta, s.city]}>
            {market.city}, {market.state}
          </Text>
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
  name: { color: color.text, fontFamily: "Jakarta_700" },
  nameBig: { fontSize: 16 },
  city: { color: color.muted, marginTop: 2 },
});
