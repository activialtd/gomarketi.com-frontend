import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { space } from "../../theme/tokens";

export type BentoSize = "large" | "half" | "wide";

const PATTERN: BentoSize[] = ["large", "half", "half", "wide"];

const HEIGHTS: Record<BentoSize, number> = {
  large: 190,
  half: 150,
  wide: 110,
};

/**
 * A repeating 4-cell rhythm (big → two-up → banner → repeat) instead of a
 * uniform grid or a plain list — the "bento" look. Purely flexbox: no
 * masonry measurement, just a fixed height per position in the pattern.
 */
export function BentoGrid<T>({
  items,
  keyExtractor,
  renderItem,
}: {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, size: BentoSize, height: number, index: number) => ReactNode;
}) {
  return (
    <View style={s.grid}>
      {items.map((item, i) => {
        const size = PATTERN[i % PATTERN.length];
        return (
          <View key={keyExtractor(item, i)} style={sizeStyle(size)}>
            {renderItem(item, size, HEIGHTS[size], i)}
          </View>
        );
      })}
    </View>
  );
}

function sizeStyle(size: BentoSize) {
  if (size === "half") return s.half;
  return s.full;
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  full: { width: "100%" },
  half: { width: "47.6%" },
});
