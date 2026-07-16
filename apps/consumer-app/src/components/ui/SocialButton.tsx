import React, { useState } from "react";
import { Text, Pressable, View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { color } from "../../theme/tokens";

/**
 * Soft social buttons.
 * Google: official multicolor "G" (Google's own CDN asset), falling back to
 * the Ionicons glyph if the image can't load. Apple: the Ionicons Apple glyph
 * IS the official mark shape — rendered solid black per Apple's guidelines.
 */
const GOOGLE_G = "https://developers.google.com/identity/images/g-logo.png";

export function SocialButton({
  provider,
  onPress,
}: {
  provider: "google" | "apple";
  onPress?: () => void;
}) {
  const [gFailed, setGFailed] = useState(false);
  const label = provider === "google" ? "Google" : "Apple";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Continue with ${label}`}
      style={{ flex: 1 }}
    >
      <View style={s.btn}>
        {provider === "google" && !gFailed ? (
          <Image
            source={{ uri: GOOGLE_G }}
            style={{ width: 19, height: 19 }}
            onError={() => setGFailed(true)}
          />
        ) : (
          <Ionicons
            name={provider === "google" ? "logo-google" : "logo-apple"}
            size={20}
            color="#000000"
          />
        )}
        <Text style={s.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 18,
    backgroundColor: color.card,
    borderWidth: 1.5,
    borderColor: "#E7ECE8",
    shadowColor: "#0A2E1A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  label: { fontFamily: "Jakarta_600", fontSize: 15, color: color.text },
});
