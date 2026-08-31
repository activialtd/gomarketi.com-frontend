import React, { useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useOrders } from "../../lib/orders-context";
import { summarizeBatch, formatKobo } from "../../lib/order-status";
import { useNav } from "../../navigation/AppNavigator";
import { color, type, space } from "../../theme/tokens";

export function OrdersScreen() {
  const { batches, loading, error, refresh } = useOrders();
  const { push } = useNav();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScreenHeader title="Your orders" />
      {batches.length === 0 ? (
        <View style={s.empty}>
          {loading ? (
            <ActivityIndicator color={color.primary} />
          ) : (
            <>
              <Ionicons name="receipt-outline" size={48} color={color.textFaint} />
              <Text style={[type.title, { marginTop: space.lg }]}>No orders yet</Text>
              {error && <Text style={[type.body, { marginTop: 4, color: color.textFaint }]}>{error}</Text>}
            </>
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space.gutter }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={color.primary} />}
        >
          {batches.map((b) => {
            const summary = summarizeBatch(b.orders);
            const totalKobo = b.orders.reduce((sum, o) => sum + o.total_kobo, 0);
            return (
              <Pressable key={b.reference} onPress={() => push("track", { reference: b.reference })}>
                <View style={s.card}>
                  <View style={s.rowTop}>
                    <Text style={s.ref}>
                      {b.orders.length > 1 ? `${b.orders.length} vendors · ` : ""}#{b.reference.slice(-8)}
                    </Text>
                    <View style={[s.chip, summary.label === "Delivered" && { backgroundColor: "#E1F0E6" }]}>
                      <Text style={s.chipText}>{summary.label}</Text>
                    </View>
                  </View>
                  <Text style={type.body} numberOfLines={1}>
                    {b.orders
                      .flatMap((o) => o.items.map((i) => `${i.quantity}× ${i.name}`))
                      .join(", ") || "—"}
                  </Text>
                  {summary.anyAwaitingConfirmation && (
                    <Text style={s.confirmHint}>Tap to confirm you've received it</Text>
                  )}
                  <View style={s.rowBottom}>
                    <Text style={s.total}>{formatKobo(totalKobo)}</Text>
                    <Text style={s.track}>Track order →</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 18,
    padding: space.lg,
    marginBottom: space.md,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ref: { fontFamily: "Jakarta_700", fontSize: 14, color: color.text },
  chip: {
    backgroundColor: color.panel,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: { fontFamily: "Jakarta_600", fontSize: 11, color: color.ink },
  confirmHint: { fontFamily: "Jakarta_600", fontSize: 12, color: color.primary, marginTop: 6 },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: space.md,
  },
  total: { fontFamily: "Jakarta_700", fontSize: 15, color: color.text },
  track: { fontFamily: "Jakarta_600", fontSize: 13, color: color.primary },
});
