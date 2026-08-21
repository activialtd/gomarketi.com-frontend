import React from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { BentoGrid, BentoSize } from "./BentoGrid";
import { color, space } from "../../theme/tokens";

function ShimmerBlock({ height }: { height: number }) {
  return (
    <MotiView
      from={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 700, loop: true, repeatReverse: true }}
      style={[s.block, { height }]}
    />
  );
}

/** Placeholder grid shown while a bento list's first page is loading. */
export function BentoSkeleton({ count = 6 }: { count?: number }) {
  const placeholders = Array.from({ length: count }, (_, i) => i);
  return (
    <BentoGrid
      items={placeholders}
      keyExtractor={(i) => `skeleton-${i}`}
      renderItem={(_item, _size: BentoSize, height) => <ShimmerBlock height={height} />}
    />
  );
}

const s = StyleSheet.create({
  block: {
    borderRadius: 22,
    backgroundColor: color.line,
  },
});
