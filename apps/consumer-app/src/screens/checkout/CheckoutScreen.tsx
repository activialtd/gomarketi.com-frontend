import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { PaystackSheet } from "../../components/PaystackSheet";
import { useCart, formatNaira, toNaira, type CartLine } from "../../lib/cart-context";
import { useOrders } from "../../lib/orders-context";
import { useAuth } from "../../lib/auth-context";
import { useNav } from "../../navigation/nav-context";
import { color, type, space, tint } from "../../theme/tokens";
import { KeyboardAvoidingView, Platform } from "react-native";
import { groupCartByStore } from "../../lib/checkout-grouping";
import {
  placeCheckout,
  confirmPayment,
  type OrderResp,
  getDeliveryOptions,
  ApiError,
  type DeliveryOption,
} from "../../lib/api-client";

const fmtKobo = (kobo: number) =>
  "₦" + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 });

/**
 * One line of the order summary, led by the product's picture.
 *
 * The summary was text-only, so a buyer confirming a ₦300,000 order saw
 * nothing but a name — the one place a wrong item is cheapest to catch. Falls
 * back to the product's icon the same way ProductCard does, since a catalogue
 * product with no image, or a URL that 404s, is ordinary rather than
 * exceptional.
 */
function SummaryLine({
  line,
  priceLabel,
}: {
  line: CartLine;
  priceLabel: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const cover = line.product.images?.[0];
  const showImage = !!cover && !imgFailed;
  const qualifier = [line.variant, line.size].filter(Boolean).join(", ");

  return (
    <View style={s.itemRow}>
      <View style={[s.thumb, { backgroundColor: tint[line.product.tint] }]}>
        {showImage ? (
          <Image
            source={{ uri: cover }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <Ionicons name={line.product.icon} size={18} color={color.ink} />
        )}
      </View>

      <View style={s.itemText}>
        <Text numberOfLines={2} style={type.body}>
          {line.qty} × {line.product.name}
          {qualifier ? ` (${qualifier})` : ""}
        </Text>
      </View>

      <Text style={s.lineVal}>{priceLabel}</Text>
    </View>
  );
}

export function CheckoutScreen() {
  const { items, subtotalUsd, clear } = useCart();
  const { registerOrders } = useOrders();
  const { user } = useAuth();
  const { reset, push } = useNav();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [loadingDelivery, setLoadingDelivery] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption | null>(
    null,
  );
  const [shippingOpen, setShippingOpen] = useState(false);

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
        // Nothing preselected: defaulting to the first option showed a fee
        // the buyer never chose, and the cheapest option is rarely the right
        // one for a given address.
        setSelectedDelivery(null);
      })
      .finally(() => !cancelled && setLoadingDelivery(false));
    return () => {
      cancelled = true;
    };
  }, [storeSlugs.join(",")]);

  // Goods only. This used to read totalUsd, which carried a hardcoded ₦2,250
  // "delivery" the server knew nothing about — so Paystack was charged one
  // figure and the order verified against another, and the exact-match check
  // refused every payment that got this far.
  const itemsKobo = toNaira(subtotalUsd) * 100;
  const deliveryKobo = selectedDelivery?.price_kobo ?? 0;
  const totalKobo = itemsKobo + deliveryKobo;

  // Deliberately not prefilled from the device's location. A GPS reading is
  // a place, not an address someone can deliver a parcel to, and starting the
  // field with a plausible-looking wrong one invites it being left alone.

  const valid =
    address.trim().length > 5 &&
    phone.trim().length >= 7 &&
    items.length > 0 &&
    // Every basket needs a delivery choice: the orders service refuses an
    // order whose store has set none, so there is nothing to fall back to.
    selectedDelivery != null;

  // Stable for the lifetime of one payment attempt — PaystackSheet stays
  // mounted throughout, and payment idempotency now depends on this
  // reference not changing mid-payment (it would otherwise be recomputed on
  // every render, e.g. from a keystroke elsewhere on screen while paying).
  const reference = useMemo(() => `gmk_${Date.now()}`, []);

  // Orders created before payment, held here so onPaid can confirm them.
  const placed = useRef<OrderResp[] | null>(null);

  // Create the orders first, then open Paystack against the reference they
  // come back with. Nothing is charged if this fails, so the buyer can simply
  // try again — unlike the old order, where the charge came first and an
  // interruption afterwards took the money and left nothing behind.
  const startPayment = async () => {
    setCheckoutError(null);
    const grouped = groupCartByStore(items);
    if (!grouped.ok) {
      setCheckoutError(grouped.error);
      return;
    }

    setCheckingOut(true);
    try {
      const { orders } = await placeCheckout({
        customer_name: user?.fullName || "Customer",
        customer_email: user?.email ?? "",
        customer_phone: phone,
        delivery_address: address,
        stores: grouped.stores,
        delivery_option_id: selectedDelivery?.id,
      });
      placed.current = orders;
      setPaying(true);
    } catch (err) {
      setCheckoutError(
        err instanceof ApiError
          ? err.message
          : "We couldn't start your order. Nothing has been charged — please try again.",
      );
    } finally {
      setCheckingOut(false);
    }
  };

  const onPaid = async (ref: string) => {
    setPaying(false);
    setCheckoutError(null);

    const orders = placed.current;
    if (!orders?.length) {
      setCheckoutError(`Payment received but we lost track of your order. Contact support with reference ${ref}.`);
      return;
    }

    setCheckingOut(true);
    try {
      await confirmPayment(ref || orders[0].payment_reference || "");
    } catch (err) {
      // Not worth stopping the buyer for: the orders exist and Paystack's
      // webhook confirms them server-side within seconds regardless. Logged
      // rather than shown, because there is nothing for them to do.
      console.warn("confirmPayment failed; the webhook will finish it", err);
    } finally {
      setCheckingOut(false);
    }

    registerOrders(orders);
    clear();
    reset("home");
    push("orders");
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

          <Text style={[type.section, { marginTop: space.xxl }]}>Shipping</Text>
          {loadingDelivery ? (
            <View style={[s.card, { alignItems: "center" }]}>
              <ActivityIndicator color={color.primary} />
            </View>
          ) : deliveryOptions.length === 0 ? (
            <View style={s.card}>
              <Text style={type.body}>
                This vendor has not set a shipping fee yet, so the order
                cannot be placed. Contact the store and ask them to add one.
              </Text>
            </View>
          ) : (
            // One row that opens the picker, rather than every option inline.
            // A long list pushed the total and the pay button off screen, and
            // this matches how the storefront asks the same question.
            <Pressable
              onPress={() => setShippingOpen(true)}
              style={[s.deliveryRow, { marginTop: space.lg }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[type.label, { fontFamily: "Jakarta_600" }]}>
                  {selectedDelivery ? selectedDelivery.title : "Choose a shipping option"}
                </Text>
                <Text style={type.meta}>
                  {selectedDelivery?.description || "Tap to pick where we are delivering to."}
                </Text>
              </View>
              <Text style={s.lineVal}>
                {selectedDelivery ? fmtKobo(selectedDelivery.price_kobo) : "—"}
              </Text>
            </Pressable>
          )}

          <Text style={[type.section, { marginTop: space.xxl }]}>
            Order summary
          </Text>
          <View style={s.card}>
            {items.map((line) => (
              <SummaryLine
                key={line.key}
                line={line}
                priceLabel={formatNaira(line.product.price * line.qty)}
              />
            ))}
            {/* Only once a shipping option is actually chosen — a fee the
                buyer has not picked has no business being in their total. */}
            {selectedDelivery && (
              <View style={s.itemRow}>
                <View style={s.itemText}>
                  <Text style={type.body}>Shipping — {selectedDelivery.title}</Text>
                  {!!selectedDelivery.description && (
                    <Text style={[type.meta, { marginTop: 2 }]}>
                      {selectedDelivery.description}
                    </Text>
                  )}
                </View>
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
          {/* checkoutError was set in three places and rendered in none, so a
              failure — most often a cart item saved before stores were tracked
              — left the buyer pressing Pay with nothing happening at all. */}
          {checkoutError && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle" size={16} color={color.danger} />
              <Text style={s.errorText}>{checkoutError}</Text>
            </View>
          )}
          <Button
            label={checkingOut ? "Starting your order…" : `Pay ${fmtKobo(totalKobo)}`}
            disabled={!valid}
            loading={checkingOut}
            onPress={() => void startPayment()}
          />
        </View>

        <Modal
          visible={shippingOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setShippingOpen(false)}
        >
          <Pressable style={s.sheetBackdrop} onPress={() => setShippingOpen(false)}>
            {/* Stops a tap inside the sheet closing it, while a tap on the
                dimmed area still does. */}
            <Pressable style={s.sheet} onPress={() => {}}>
              <View style={s.sheetHandle} />
              <Text style={[type.section, { marginBottom: space.sm }]}>
                Choose shipping
              </Text>
              <ScrollView
                style={{ maxHeight: 380 }}
                showsVerticalScrollIndicator={false}
              >
                {deliveryOptions.map((opt) => {
                  const active = selectedDelivery?.id === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => {
                        setSelectedDelivery(opt);
                        setShippingOpen(false);
                      }}
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
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

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
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginBottom: space.md,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  // Takes the slack so the price stays hard against the right edge however
  // long the product name runs.
  itemText: { flex: 1 },
  lineVal: { fontFamily: "Jakarta_500", fontSize: 14, color: color.text },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: color.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: space.gutter,
    paddingTop: space.md,
    paddingBottom: space.xxl,
    gap: space.sm,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: color.line,
    marginBottom: space.md,
  },
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
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
    padding: space.md,
    borderRadius: 12,
    backgroundColor: "#FDECEC",
    marginBottom: space.md,
  },
  errorText: {
    flex: 1,
    fontFamily: "Jakarta_500",
    fontSize: 13,
    lineHeight: 19,
    color: "#8E1F1F",
  },
  cta: {
    paddingHorizontal: space.gutter,
    paddingVertical: space.md,
    backgroundColor: color.card,
    borderTopWidth: 1,
    borderColor: color.line,
  },
});
