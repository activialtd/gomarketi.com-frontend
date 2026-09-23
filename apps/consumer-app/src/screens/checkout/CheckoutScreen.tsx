import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { PaystackSheet } from "../../components/PaystackSheet";
import { useCart, formatNaira, toNaira } from "../../lib/cart-context";
import { useOrders } from "../../lib/orders-context";
import { useAuth } from "../../lib/auth-context";
import { useLocation } from "../../hooks/useLocation";
import { useNav } from "../../navigation/nav-context";
import { color, type, space } from "../../theme/tokens";
import { KeyboardAvoidingView, Platform } from "react-native";
import { groupCartByStore } from "../../lib/checkout-grouping";
import {
  createCheckout,
  getDeliveryOptions,
  ApiError,
  type DeliveryOption,
} from "../../lib/api-client";

const fmtKobo = (kobo: number) =>
  "₦" + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 });

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
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [loadingDelivery, setLoadingDelivery] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption | null>(
    null,
  );

  // The basket can span several vendors, each with their own delivery
  // choices, but the buyer pays for ONE delivery — the hub consolidates the
  // vendors' parcels into a single trip. So gather every vendor's options and
  // let the buyer pick one.
  const storeSlugs = useMemo(() => {
    const slugs = new Set<string>();
    for (const line of items) {
      if (line.product.storeSlug) slugs.add(line.product.storeSlug);
    }
    return Array.from(slugs);
  }, [items]);

  useEffect(() => {
    let cancelled = false;
    if (storeSlugs.length === 0) {
      setDeliveryOptions([]);
      setLoadingDelivery(false);
      return;
    }
    setLoadingDelivery(true);
    Promise.all(storeSlugs.map((slug) => getDeliveryOptions(slug).catch(() => [])))
      .then((lists) => {
        if (cancelled) return;
        const merged = lists.flat().filter((o) => o.is_active);
        setDeliveryOptions(merged);
        setSelectedDelivery(merged[0] ?? null);
      })
      .finally(() => !cancelled && setLoadingDelivery(false));
    return () => {
      cancelled = true;
    };
  }, [storeSlugs.join(",")]);

  const itemsKobo = toNaira(totalUsd) * 100;
  const deliveryKobo = selectedDelivery?.price_kobo ?? 0;
  const totalKobo = itemsKobo + deliveryKobo;

  // Pre-fill from the buyer's captured location, but never overwrite
  // something they've already typed or edited themselves.
  useEffect(() => {
    if (!addressEdited && capturedAddress) {
      setAddress(capturedAddress);
    }
  }, [capturedAddress, addressEdited]);

  const valid =
    address.trim().length > 5 &&
    phone.trim().length >= 7 &&
    items.length > 0 &&
    // A vendor with options configured requires one to be chosen; a basket
    // with none at all is still checkout-able.
    (deliveryOptions.length === 0 || selectedDelivery != null);

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
        delivery_option_id: selectedDelivery?.id,
      });

      registerOrders(orders);
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

          <Text style={[type.section, { marginTop: space.xxl }]}>Delivery</Text>
          {loadingDelivery ? (
            <View style={[s.card, { alignItems: "center" }]}>
              <ActivityIndicator color={color.primary} />
            </View>
          ) : deliveryOptions.length === 0 ? (
            <View style={s.card}>
              <Text style={type.body}>
                No delivery options set for these vendors yet — the seller will
                arrange delivery with you directly.
              </Text>
            </View>
          ) : (
            <View style={{ gap: space.sm, marginTop: space.lg }}>
              {deliveryOptions.map((opt) => {
                const active = selectedDelivery?.id === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setSelectedDelivery(opt)}
                    style={[s.deliveryRow, active && s.deliveryRowActive]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[type.label, { fontFamily: "Jakarta_600" }]}>
                        {opt.title}
                      </Text>
                      {!!opt.description && (
                        <Text style={type.meta}>{opt.description}</Text>
                      )}
                    </View>
                    <Text style={s.lineVal}>{fmtKobo(opt.price_kobo)}</Text>
                  </Pressable>
                );
              })}
              <Text style={type.meta}>
                One delivery fee covers the whole order, however many vendors
                it comes from.
              </Text>
            </View>
          )}

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
            {deliveryKobo > 0 && (
              <View style={s.line}>
                <Text style={type.body}>
                  Delivery{selectedDelivery ? ` — ${selectedDelivery.title}` : ""}
                </Text>
                <Text style={s.lineVal}>{fmtKobo(deliveryKobo)}</Text>
              </View>
            )}
            <View style={s.rule} />
            <View style={s.line}>
              <Text style={s.total}>Total</Text>
              <Text style={s.total}>{fmtKobo(totalKobo)}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={s.cta}>
          <Button
            label={`Pay ${fmtKobo(totalKobo)}`}
            disabled={!valid}
            onPress={() => setPaying(true)}
          />
        </View>

        {paying && (
          <PaystackSheet
            email={user?.email ?? "customer@gomarketi.com"}
            amountKobo={totalKobo}
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
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.lg,
    borderRadius: 16,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
  },
  deliveryRowActive: { borderColor: color.primary, borderWidth: 2 },
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
