import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { useOrders, OrderStatus } from "../../lib/orders-context";
import { formatNaira } from "../../lib/cart-context";
import { useNav } from "../../navigation/AppNavigator";
import { color, type, space } from "../../theme/tokens";

const STATUS_LABEL: Record<OrderStatus, string> = {
  confirmed: "Confirmed",
  preparing: "Preparing",
  on_the_way: "On the way",
  delivered: "Delivered",
};

export function OrdersScreen() {
  const { orders } = useOrders();
  const { push } = useNav();

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScreenHeader title="Your orders" />
      {orders.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="receipt-outline" size={48} color={color.textFaint} />
          <Text style={[type.title, { marginTop: space.lg }]}>
            No orders yet
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: space.gutter }}>
          {orders.map((o) => (
            <Pressable
              key={o.id}
              onPress={() => push("track", { orderId: o.id })}
            >
              <View style={s.card}>
                <View style={s.rowTop}>
                  <Text style={s.ref}>#{o.reference.slice(-8)}</Text>
                  <View
                    style={[
                      s.chip,
                      o.status === "delivered" && {
                        backgroundColor: "#E1F0E6",
                      },
                    ]}
                  >
                    <Text style={s.chipText}>{STATUS_LABEL[o.status]}</Text>
                  </View>
                </View>
                <Text style={type.body} numberOfLines={1}>
                  {o.items.map((i) => `${i.qty}× ${i.product.name}`).join(", ")}
                </Text>
                <View style={s.rowBottom}>
                  <Text style={s.total}>{formatNaira(o.totalUsd)}</Text>
                  <Text style={s.track}>Track order →</Text>
                </View>
              </View>
            </Pressable>
          ))}
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
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: space.md,
  },
  total: { fontFamily: "Jakarta_700", fontSize: 15, color: color.text },
  track: { fontFamily: "Jakarta_600", fontSize: 13, color: color.primary },
});
