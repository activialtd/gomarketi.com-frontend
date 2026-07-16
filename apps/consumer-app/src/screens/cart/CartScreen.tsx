import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { Button } from "../../components/ui/Button";
import { useCart, formatNaira } from "../../lib/cart-context";
import { useNav } from "../../navigation/AppNavigator";
import { color, type, space, tint, HIT } from "../../theme/tokens";

export function CartScreen() {
  const { items, subtotalUsd, deliveryUsd, totalUsd, setQty, remove } =
    useCart();
  const { push } = useNav();

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScreenHeader title="Your cart" />

      {items.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="cart-outline" size={48} color={color.textFaint} />
          <Text style={[type.title, { marginTop: space.lg }]}>
            Cart is empty
          </Text>
          <Text style={[type.body, { textAlign: "center", marginTop: 4 }]}>
            Ask GoMarketi for anything and add it here.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ padding: space.gutter, paddingBottom: 24 }}
          >
            {items.map((line) => (
              <View key={line.key} style={s.row}>
                <View
                  style={[
                    s.thumb,
                    { backgroundColor: tint[line.product.tint] },
                  ]}
                >
                  <Ionicons
                    name={line.product.icon}
                    size={22}
                    color={color.ink}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={s.name}>
                    {line.product.name}
                  </Text>
                  <Text style={type.meta}>{line.product.vendor}</Text>
                  {(line.variant || line.size) && (
                    <Text style={s.variantLine}>
                      {[line.variant, line.size && `Size ${line.size}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  )}
                  <Text style={s.price}>{formatNaira(line.product.price)}</Text>
                </View>

                <View style={s.qty}>
                  <Pressable
                    onPress={() => setQty(line.key, line.qty - 1)}
                    hitSlop={HIT}
                    accessibilityLabel={`Decrease ${line.product.name}`}
                  >
                    <View style={s.qtyBtn}>
                      <Ionicons name="remove" size={16} color={color.text} />
                    </View>
                  </Pressable>
                  <Text style={s.qtyNum}>{line.qty}</Text>
                  <Pressable
                    onPress={() => setQty(line.key, line.qty + 1)}
                    hitSlop={HIT}
                    accessibilityLabel={`Increase ${line.product.name}`}
                  >
                    <View style={s.qtyBtn}>
                      <Ionicons name="add" size={16} color={color.text} />
                    </View>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => remove(line.key)}
                  hitSlop={HIT}
                  accessibilityLabel={`Remove ${line.product.name}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={color.textFaint}
                  />
                </Pressable>
              </View>
            ))}
          </ScrollView>

          <View style={s.summary}>
            <Row label="Subtotal" value={formatNaira(subtotalUsd)} />
            <Row label="Delivery" value={formatNaira(deliveryUsd)} />
            <View style={s.rule} />
            <Row label="Total" value={formatNaira(totalUsd)} bold />
            <Button
              label="Checkout"
              onPress={() => push("checkout")}
              style={{ marginTop: space.lg }}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={s.sumRow}>
      <Text style={bold ? s.sumBold : type.body}>{label}</Text>
      <Text style={bold ? s.sumBold : s.sumVal}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 48,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 18,
    padding: space.md,
    marginBottom: space.md,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontFamily: "Jakarta_600", fontSize: 14, color: color.text },
  variantLine: {
    fontFamily: "Jakarta_500",
    fontSize: 12,
    color: color.ink,
    marginTop: 2,
  },
  price: {
    fontFamily: "Jakarta_700",
    fontSize: 14,
    color: color.text,
    marginTop: 3,
  },

  qty: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyNum: {
    fontFamily: "Jakarta_600",
    fontSize: 14,
    color: color.text,
    minWidth: 16,
    textAlign: "center",
  },

  summary: {
    backgroundColor: color.card,
    borderTopWidth: 1,
    borderColor: color.line,
    paddingHorizontal: space.gutter,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  sumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  sumVal: { fontFamily: "Jakarta_500", fontSize: 14, color: color.text },
  sumBold: { fontFamily: "Jakarta_700", fontSize: 16, color: color.text },
  rule: { height: 1, backgroundColor: color.line, marginVertical: space.sm },
});
