import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { PaystackSheet } from "../../components/PaystackSheet";
import { useCart, formatNaira, toNaira, NGN_RATE } from "../../lib/cart-context";
import { useOrders } from "../../lib/orders-context";
import { useAuth } from "../../lib/auth-context";
import { useLocation } from "../../hooks/useLocation";
import { useNav } from "../../navigation/AppNavigator";
import { color, type, space } from "../../theme/tokens";
import { KeyboardAvoidingView, Platform } from "react-native";
import { groupCartByStore } from "../../lib/checkout-grouping";
import { createCheckout, ApiError } from "../../lib/api-client";

export function CheckoutScreen() {
  const { items, totalUsd, clear } = useCart();
  const { registerOrders } = useOrders();
  const { user } = useAuth();
  const { address: capturedAddress } = useLocation();
  const { reset, push } = useNav();

  const [address, setAddress] = useState("");
  const [addressEdited, setAddressEdited] = useState(false);
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Pre-fill from the buyer's captured location, but never overwrite
  // something they've already typed or edited themselves.
  useEffect(() => {
    if (!addressEdited && capturedAddress) {
      setAddress(capturedAddress);
    }
  }, [capturedAddress, addressEdited]);

  const valid =
    address.trim().length > 5 && phone.trim().length >= 7 && items.length > 0;

  // Stable for the lifetime of one payment attempt — PaystackSheet stays
  // mounted throughout, and payment idempotency now depends on this
  // reference not changing mid-payment (it would otherwise be recomputed on
  // every render, e.g. from a keystroke elsewhere on screen while paying).
  const reference = useMemo(() => `gmk_${Date.now()}`, []);

  const onPaid = async (ref: string) => {
    setPaying(false);
    setCheckoutError(null);

    const grouped = groupCartByStore(items);
    if (!grouped.ok) {
      setCheckoutError(grouped.error);
      return;
    }

    setCheckingOut(true);
    try {
      const { orders } = await createCheckout({
        customer_name: user?.fullName || "Customer",
        customer_email: user?.email ?? "",
        customer_phone: phone,
        delivery_address: address,
        payment_reference: ref,
        stores: grouped.stores,
      });

      registerOrders(
        orders.map((o) => ({
          id: o.id,
          reference: ref,
          items: grouped.linesByStore[o.store_id] ?? [],
          totalUsd: o.total_kobo / 100 / NGN_RATE,
          address,
          storeId: o.store_id,
          storeName: grouped.stores.find((s) => s.store_id === o.store_id)?.store_name,
        })),
      );
      clear();
      reset("home");
      push("orders");
    } catch (err) {
      // Payment already succeeded with Paystack at this point — surface the
      // error but keep the cart intact so the buyer can retry checkout
      // (createCheckout is idempotent on `ref`, so retrying is safe).
      setCheckoutError(
        err instanceof ApiError
          ? err.message
          : "Payment succeeded but we couldn't finish placing your order. Please try again.",
      );
    } finally {
      setCheckingOut(false);
    }
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
              onChangeText={(t) => {
                setAddressEdited(true);
                setAddress(t);
              }}
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
