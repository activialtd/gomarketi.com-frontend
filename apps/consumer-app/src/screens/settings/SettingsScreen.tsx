// src/screens/settings/SettingsScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, Linking, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { color, type, space } from "../../theme/tokens";

/**
 * Only settings that are real. Push/email/location switches used to sit here
 * holding local state nothing read or saved, so flipping them did nothing.
 * Location is the one preference the app genuinely depends on, and the OS
 * owns it — so this shows the actual permission and links to where it's
 * changed.
 */
export function SettingsScreen() {
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const readPermission = useCallback(() => {
    Location.getForegroundPermissionsAsync()
      .then((p) => setLocationStatus(p.status))
      .catch(() => setLocationStatus(null));
  }, []);

  useEffect(readPermission, [readPermission]);

  const locationLabel =
    locationStatus === "granted"
      ? "Allowed"
      : locationStatus === "denied"
        ? "Not allowed"
        : locationStatus === "undetermined"
          ? "Not asked yet"
          : "—";

  const version = Constants.expoConfig?.version;

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScreenHeader title="Settings" />
      <View style={{ padding: space.gutter }}>
        <View style={s.card}>
          <Pressable
            onPress={() => void Linking.openSettings()}
            accessibilityRole="button"
            accessibilityLabel="Location access, open system settings"
          >
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Location access</Text>
                <Text style={type.meta}>
                  Finds vendors near you. Change it in your phone's settings.
                </Text>
              </View>
              <Text style={s.value}>{locationLabel}</Text>
            </View>
          </Pressable>
        </View>
        {!!version && (
          <Text style={[type.meta, { textAlign: "center", marginTop: space.xl }]}>
            GoMarketi · v{version}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  card: {
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 20,
    paddingHorizontal: space.lg,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    paddingVertical: 12,
  },
  label: { fontFamily: "Jakarta_500", fontSize: 15, color: color.text },
  value: { fontFamily: "Jakarta_600", fontSize: 13, color: color.ink },
});
