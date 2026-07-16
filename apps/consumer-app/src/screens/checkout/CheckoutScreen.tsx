import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { PaystackSheet } from "../../components/PaystackSheet";
import { useCart, formatNaira, toNaira } from "../../lib/cart-context";
import { useOrders } from "../../lib/orders-context";
import { useAuth } from "../../lib/auth-context";
import { useNav } from "../../navigation/AppNavigator";
import { color, type, space } from "../../theme/tokens";
import { KeyboardAvoidingView, Platform } from "react-native";

export function CheckoutScreen() {
  const { items, totalUsd, clear } = useCart();
  const { placeOrder } = useOrders();
  const { user } = useAuth();
  const { reset, push } = useNav();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);

  const valid =
    address.trim().length > 5 && phone.trim().length >= 7 && items.length > 0;
  const reference = `gmk_${Date.now()}`;

  const onPaid = (ref: string) => {
    setPaying(false);
    // TODO(backend): verify `ref` server-side BEFORE creating the order.
    const order = placeOrder({ reference: ref, items, totalUsd, address });
    clear();
    reset("home");
    push("track", { orderId: order.id });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={s.root} edges={["top", "bottom"]}>
        <ScreenHeader title="Checkout" />
        <ScrollView
          contentContainerStyle={{ padding: space.gutter }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={type.section}>Delivery details</Text>
          <View style={{ gap: space.lg, marginTop: space.lg }}>
            <Input
              label="Delivery address"
              placeholder="12 Adeola Odeku St, Victoria Island"
              value={address}
              onChangeText={setAddress}
            />
            <Input
              label="Phone"
              placeholder="+234 801 234 5678"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <Text style={[type.section, { marginTop: space.xxl }]}>
            Order summary
          </Text>
          <View style={s.card}>
            {items.map((line) => (
              <View key={line.key} style={s.line}>
                <Text style={type.body}>
                  {line.qty} × {line.product.name}
                  {(line.variant || line.size) &&
                    ` (${[line.variant, line.size].filter(Boolean).join(", ")})`}
                </Text>
                <Text style={s.lineVal}>
                  {formatNaira(line.product.price * line.qty)}
                </Text>
              </View>
            ))}
            <View style={s.rule} />
            <View style={s.line}>
              <Text style={s.total}>Total</Text>
              <Text style={s.total}>{formatNaira(totalUsd)}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={s.cta}>
          <Button
            label={`Pay ${formatNaira(totalUsd)}`}
            disabled={!valid}
            onPress={() => setPaying(true)}
          />
        </View>

        {paying && (
          <PaystackSheet
            email={user?.email ?? "customer@gomarketi.com"}
            amountKobo={toNaira(totalUsd) * 100}
            reference={reference}
            onSuccess={onPaid}
            onCancel={() => setPaying(false)}
          />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  card: {
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 18,
    padding: space.lg,
    marginTop: space.lg,
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  lineVal: { fontFamily: "Jakarta_500", fontSize: 14, color: color.text },
  rule: { height: 1, backgroundColor: color.line, marginVertical: space.sm },
  total: { fontFamily: "Jakarta_700", fontSize: 16, color: color.text },
  cta: {
    paddingHorizontal: space.gutter,
    paddingVertical: space.md,
    backgroundColor: color.card,
    borderTopWidth: 1,
    borderColor: color.line,
  },
});
