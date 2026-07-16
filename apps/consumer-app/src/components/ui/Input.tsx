import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { color, space, HIT } from "../../theme/tokens";

/**
 * Soft input, kept deliberately simple:
 * - No wrapper Pressable, no refs — the TextInput itself stretches to fill
 *   the whole 56px field, so the entire surface is natively tappable.
 * - Focus styling driven by plain onFocus/onBlur state.
 */
export function Input({
  label,
  error,
  isPassword,
  ...rest
}: TextInputProps & { label: string; error?: string; isPassword?: boolean }) {
  const [hidden, setHidden] = useState(!!isPassword);
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Text style={s.label}>{label}</Text>

      <View
        style={[
          s.field,
          focused && s.fieldFocused,
          !!error && { borderColor: "#D26A5B" },
        ]}
      >
        <TextInput
          {...rest}
          secureTextEntry={hidden}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={color.textFaint}
          style={s.input}
        />

        {isPassword && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={HIT}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <Ionicons
              name={hidden ? "eye-off-outline" : "eye-outline"}
              size={19}
              color={color.textMuted}
            />
          </Pressable>
        )}
      </View>

      {!!error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  label: {
    fontFamily: "Jakarta_600",
    fontSize: 12.5,
    color: color.textMuted,
    marginBottom: 7,
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 18,
    paddingHorizontal: space.lg,
    backgroundColor: "#EEF3EF",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  fieldFocused: {
    backgroundColor: color.card,
    borderColor: "#9BD8B2",
  },
  input: {
    flex: 1,
    alignSelf: "stretch", // input fills the full field height — whole surface tappable
    fontFamily: "Jakarta_500",
    fontSize: 15,
    color: color.text,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  error: {
    fontFamily: "Jakarta_500",
    fontSize: 12,
    color: "#D26A5B",
    marginTop: 6,
    marginLeft: 4,
  },
});
