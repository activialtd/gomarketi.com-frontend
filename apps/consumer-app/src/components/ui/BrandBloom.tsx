import React from "react";
import { View, StyleSheet } from "react-native";
import { color } from "../../theme/tokens";

/**
 * The bloom behind the ask panel.
 *
 * Niva uses a gradient mesh here. Gradients are out, so this rebuilds the same
 * organic swell from overlapping SOLID circles at stepped opacity — flat fills
 * only, no gradient, but the layered edges still read as soft light.
 *
 * Purely decorative → hidden from screen readers.
 */
export function BrandBloom() {
  return (
    <View style={s.wrap} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[s.blob, { width: 260, height: 260, left: -30, bottom: -110, backgroundColor: color.accent, opacity: 0.16 }]} />
      <View style={[s.blob, { width: 200, height: 200, left: 60, bottom: -90, backgroundColor: color.primary, opacity: 0.20 }]} />
      <View style={[s.blob, { width: 150, height: 150, right: 10, bottom: -70, backgroundColor: color.accent, opacity: 0.22 }]} />
      <View style={[s.blob, { width: 96, height: 96, right: 78, bottom: -34, backgroundColor: color.primary, opacity: 0.26 }]} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  blob: { position: "absolute", borderRadius: 999 },
});
