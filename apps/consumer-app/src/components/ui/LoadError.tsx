import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { color, type, space } from "../../theme/tokens";

/**
 * What a list shows when its fetch fails — a reason and a way to try again,
 * rather than an endless skeleton or an "empty" that isn't true.
 */
export function LoadError({
  title = "Couldn't load this",
  message,
  onRetry,
}: {
  title?: string;
  message?: string | null;
  onRetry?: () => void;
}) {
  return (
    <View style={s.wrap}>
      <Ionicons
        name="cloud-offline-outline"
        size={40}
        color={color.textFaint}
      />
      <Text style={[type.label, s.title]}>{title}</Text>
      {!!message && <Text style={[type.body, s.msg]}>{message}</Text>}
      {onRetry && (
        <Pressable onPress={onRetry} style={s.retry} accessibilityRole="button">
          <Text style={s.retryText}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", paddingTop: 48, paddingHorizontal: space.lg },
  title: { fontFamily: "Jakarta_600", marginTop: space.md },
  msg: { marginTop: 4, textAlign: "center" },
  retry: {
    marginTop: space.md,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: color.line,
    borderRadius: 100,
  },
  retryText: { ...type.meta, fontFamily: "Jakarta_600", color: color.ink },
});
