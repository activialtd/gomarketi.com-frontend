// src/screens/notifications/NotificationsScreen.tsx
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useOrders } from "../../lib/orders-context";
import { color, type, space } from "../../theme/tokens";

/** Derived from order events for now. TODO(backend): push via expo-notifications. */
export function NotificationsScreen() {
  const { orders } = useOrders();

  const items = orders.map((o) => ({
    id: o.id,
    icon: "cube-outline" as const,
    title: `Order #${(o.payment_reference ?? o.id).slice(-8)} ${o.status.replace(/_/g, " ")}`,
    time: new Date(o.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScreenHeader title="Notifications" />
      {items.length === 0 ? (
        <View style={s.empty}>
          <Ionicons
            name="notifications-off-outline"
            size={48}
            color={color.textFaint}
          />
          <Text style={[type.title, { marginTop: space.lg }]}>Nothing yet</Text>
          <Text style={[type.body, { marginTop: 4 }]}>
            Order updates will land here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: space.gutter }}>
          {items.map((n) => (
            <View key={n.id} style={s.row}>
              <View style={s.dot}>
                <Ionicons name={n.icon} size={18} color={color.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{n.title}</Text>
                <Text style={type.meta}>{n.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 18,
    padding: space.lg,
    marginBottom: space.md,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontFamily: "Jakarta_600", fontSize: 14, color: color.text },
});
