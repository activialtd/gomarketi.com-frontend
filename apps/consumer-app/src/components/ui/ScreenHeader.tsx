import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNav } from "../../navigation/AppNavigator";
import { color, space, HIT } from "../../theme/tokens";

export function ScreenHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  const { pop } = useNav();
  return (
    <View style={s.bar}>
      <Pressable
        onPress={pop}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <View style={s.back}>
          <Ionicons name="arrow-back" size={20} color={color.text} />
        </View>
      </Pressable>
      <Text style={s.title}>{title}</Text>
      <View style={s.right}>{right}</View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.gutter,
    paddingVertical: space.md,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: "Jakarta_700", fontSize: 17, color: color.text },
  right: { width: 40, alignItems: "flex-end" },
});
