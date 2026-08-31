import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { Button } from "../../components/ui/Button";
import { useOrders } from "../../lib/orders-context";
import { STATUS_STEPS, summarizeBatch, formatKobo } from "../../lib/order-status";
import { color, type, space } from "../../theme/tokens";

const VENDOR_STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting payment",
  confirmed: "Confirmed — awaiting hub delivery",
  at_hub: "At GoMarketi hub",
  shipped: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled — refunded",
};

export function TrackOrderScreen({ reference }: { reference?: string }) {
  const { batches, loading, refresh, confirmReceived } = useOrders();
  const batch = batches.find((b) => b.reference === reference) ?? batches[0];
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    if (!batch) refresh();
  }, [batch, refresh]);

  if (!batch) {
    return (
      <SafeAreaView style={s.root} edges={["top"]}>
        <ScreenHeader title="Track order" />
        <View style={s.center}>
          {loading ? <ActivityIndicator color={color.primary} /> : <Text style={type.body}>No order found.</Text>}
        </View>
      </SafeAreaView>
    );
  }

  const summary = summarizeBatch(batch.orders);
  const totalKobo = batch.orders.reduce((sum, o) => sum + o.total_kobo, 0);
  const address = batch.orders[0]?.delivery_address ?? "";
  const awaitingOrders = batch.orders.filter((o) => o.status === "shipped" && !o.delivery_confirmed_at);

  async function handleConfirm() {
    setConfirming(true);
    setConfirmError(null);
    try {
      for (const o of awaitingOrders) {
        await confirmReceived(o.id);
      }
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : "Couldn't confirm delivery — try again.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScreenHeader title={`Order #${batch.reference.slice(-8)}`} />

      <ScrollView contentContainerStyle={{ padding: space.gutter }}>
        {!summary.allCancelled && (
          <View style={s.steps}>
            {STATUS_STEPS.map((st, i) => (
              <View key={st.key} style={s.step}>
                <View style={[s.stepDot, i <= summary.activeIdx && s.stepDotOn]}>
                  <Ionicons
                    name={st.icon as any}
                    size={14}
                    color={i <= summary.activeIdx ? color.onInk : color.textFaint}
                  />
                </View>
                <Text style={[s.stepLabel, i <= summary.activeIdx && { color: color.text }]}>{st.label}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={[type.body, { textAlign: "center", marginTop: space.lg }]}>
          Delivering to: {address}
        </Text>

        {summary.anyAwaitingConfirmation && (
          <View style={{ marginTop: space.lg }}>
            <Button label="I've received this" onPress={handleConfirm} loading={confirming} />
            {confirmError && <Text style={s.error}>{confirmError}</Text>}
          </View>
        )}

        <View style={s.divider} />
        <Text style={[type.title, { marginBottom: space.md }]}>
          {batch.orders.length > 1 ? `${batch.orders.length} vendors in this order` : "Order details"}
        </Text>

        {batch.orders.map((o) => (
          <View key={o.id} style={s.vendorCard}>
            <View style={s.rowTop}>
              <Text style={s.vendorName}>{o.customer_name}</Text>
              <Text
                style={[
                  s.vendorStatus,
                  o.status === "cancelled" && { color: "#B3261E" },
                  o.status === "delivered" && { color: color.primary },
                ]}
              >
                {VENDOR_STATUS_LABEL[o.status] ?? o.status}
              </Text>
            </View>
            <Text style={type.meta} numberOfLines={2}>
              {o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ") || "—"}
            </Text>
            <Text style={s.vendorTotal}>{formatKobo(o.total_kobo)}</Text>
          </View>
        ))}

        <View style={s.rowBottom}>
          <Text style={type.body}>Total</Text>
          <Text style={s.total}>{formatKobo(totalKobo)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  steps: { flexDirection: "row", justifyContent: "space-between", marginTop: space.md },
  step: { alignItems: "center", flex: 1 },
  stepDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: color.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotOn: { backgroundColor: color.primary },
  stepLabel: {
    fontFamily: "Jakarta_500",
    fontSize: 11,
    color: color.textFaint,
    marginTop: 6,
    textAlign: "center",
  },
  divider: { height: 1, backgroundColor: color.line, marginVertical: space.lg },
  vendorCard: {
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 16,
    padding: space.md,
    marginBottom: space.sm,
  },
  rowTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  vendorName: { fontFamily: "Jakarta_700", fontSize: 14, color: color.text },
  vendorStatus: { fontFamily: "Jakarta_600", fontSize: 12, color: color.textFaint },
  vendorTotal: { fontFamily: "Jakarta_700", fontSize: 13, color: color.text, marginTop: 6 },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderColor: color.line,
  },
  total: { fontFamily: "Jakarta_700", fontSize: 16, color: color.text },
  error: { fontFamily: "Jakarta_500", fontSize: 12, color: "#B3261E", marginTop: 8, textAlign: "center" },
});
