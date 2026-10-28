import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { color } from "../../theme/tokens";

/**
 * "Negotiable" as a bright pill, so a buyer scanning a grid spots the
 * products they can make an offer on; "Fixed price" as quiet text otherwise —
 * it answers the question without competing with the pill.
 */
export function NegotiableBadge({ negotiable }: { negotiable: boolean }) {
  if (!negotiable) {
    return <Text style={s.fixed}>Fixed price</Text>;
  }
  return (
    <View style={s.pill} accessibilityLabel="Negotiable price">
      <Ionicons name="pricetag" size={10} color={color.ink900} />
      <Text style={s.pillText}>Negotiable</Text>
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: color.sunshine,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: color.ink900,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillText: { fontFamily: "Jakarta_700", fontSize: 10, color: color.ink900 },
  // Same line height as the pill, so grid cards with and without it align.
  fixed: { fontFamily: "Jakarta_500", fontSize: 11, lineHeight: 19, color: color.textFaint },
});
