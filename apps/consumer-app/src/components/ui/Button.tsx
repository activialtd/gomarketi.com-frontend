import React from "react";
import { Text, Pressable, ActivityIndicator, View, StyleSheet, ViewStyle } from "react-native";
import { color, type } from "../../theme/tokens";

/**
 * All visual styling lives on a plain inner View with STATIC styles —
 * nothing a wrapper can strip. Pressable only handles the touch.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={style}
    >
      <View
        style={[
          s.base,
          variant === "primary" ? s.primary : s.secondary,
          variant === "primary" && isDisabled && s.primaryDisabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? color.onInk : color.ink} />
        ) : (
          <Text style={[s.label, { color: variant === "primary" ? color.onInk : color.text }]}>
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  primary: { backgroundColor: color.ink },
  primaryDisabled: { backgroundColor: "#9DB8A7" },
  secondary: { backgroundColor: color.card, borderWidth: 1.5, borderColor: color.lineStrong },
  label: { fontFamily: "Jakarta_600", fontSize: 16 },
});
