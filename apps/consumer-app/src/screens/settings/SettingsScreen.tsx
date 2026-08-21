// src/screens/settings/SettingsScreen.tsx
import React, { useState } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { color, type, space } from "../../theme/tokens";

export function SettingsScreen() {
  // TODO(backend): persist preferences per user
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const ROWS = [
    { label: "Push notifications", value: pushEnabled, set: setPushEnabled },
    { label: "Email updates", value: emailEnabled, set: setEmailEnabled },
    {
      label: "Use my location",
      value: locationEnabled,
      set: setLocationEnabled,
    },
  ];

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScreenHeader title="Settings" />
      <View style={{ padding: space.gutter }}>
        <View style={s.card}>
          {ROWS.map((r) => (
            <View key={r.label} style={s.row}>
              <Text style={s.label}>{r.label}</Text>
              <Switch
                value={r.value}
                onValueChange={r.set}
                trackColor={{ true: color.primary, false: color.lineStrong }}
                thumbColor={color.card}
              />
            </View>
          ))}
        </View>
        <Text style={[type.meta, { textAlign: "center", marginTop: space.xl }]}>
          GoMarketi · v0.1.0
        </Text>
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
    paddingVertical: 12,
  },
  label: { fontFamily: "Jakarta_500", fontSize: 15, color: color.text },
});
