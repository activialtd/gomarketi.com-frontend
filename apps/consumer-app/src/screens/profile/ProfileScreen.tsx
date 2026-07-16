// src/screens/profile/ProfileScreen.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../lib/auth-context";
import { useNav } from "../../navigation/AppNavigator";
import { color, type, space } from "../../theme/tokens";

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { push } = useNav();

  const ROWS = [
    {
      icon: "receipt-outline" as const,
      label: "My orders",
      go: () => push("orders"),
    },
    {
      icon: "notifications-outline" as const,
      label: "Notifications",
      go: () => push("notifications"),
    },
    {
      icon: "settings-outline" as const,
      label: "Settings",
      go: () => push("settings"),
    },
  ];

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScreenHeader title="Profile" />
      <View style={{ padding: space.gutter }}>
        <View style={s.card}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {(user?.fullName ?? "?")[0].toUpperCase()}
            </Text>
          </View>
          <Text style={[type.title, { marginTop: space.md }]}>
            {user?.fullName}
          </Text>
          <Text style={type.body}>{user?.email}</Text>
        </View>

        <View
          style={[
            s.card,
            { marginTop: space.lg, alignItems: "stretch", paddingVertical: 4 },
          ]}
        >
          {ROWS.map((r) => (
            <Pressable
              key={r.label}
              onPress={r.go}
              accessibilityRole="button"
              accessibilityLabel={r.label}
            >
              <View style={s.row}>
                <Ionicons name={r.icon} size={20} color={color.ink} />
                <Text style={s.rowLabel}>{r.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={color.textFaint}
                />
              </View>
            </Pressable>
          ))}
        </View>

        <Button
          label="Sign out"
          variant="secondary"
          onPress={signOut}
          style={{ marginTop: space.xl }}
        />
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
    padding: space.xl,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: color.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: "Jakarta_700", fontSize: 28, color: color.onInk },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: 14,
    paddingHorizontal: space.sm,
  },
  rowLabel: {
    flex: 1,
    fontFamily: "Jakarta_500",
    fontSize: 15,
    color: color.text,
  },
});
