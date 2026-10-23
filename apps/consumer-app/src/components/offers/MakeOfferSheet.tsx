import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Button } from "../ui/Button";
import { createOffer, ApiError, type Offer } from "../../lib/api-client";
import { useAuth } from "../../lib/auth-context";
import { useCart } from "../../lib/cart-context";
import { useNav } from "../../navigation/nav-context";
import { formatKobo } from "../../lib/order-status";
import {
  dealMeter,
  validateOfferAmount,
  nairaInputToKobo,
  timeLeft,
  MAX_OFFER_QTY,
} from "../../lib/offers";
import type { Product } from "../../lib/types";
import { color, type, space, HIT, stickerShadow } from "../../theme/tokens";

const QUICK_CUTS = [5, 10, 15];
const QUICK_MESSAGES = [
  "Is this still available?",
  "Last price?",
  "Can you deliver today?",
];
const MAX_NOTE = 500;

/**
 * "Make an offer" — the buyer names a price below list on a negotiable
 * product. The deal meter grades the offer against list price only; the
 * vendor's floor is never known to the app, so nothing here can hint at it.
 *
 * An offer that clears the floor comes back already accepted ("instant
 * deal") and can go straight into the cart at the agreed price. Anything
 * else is sent to the vendor and followed up in My offers.
 */
export function MakeOfferSheet({
  visible,
  product,
  onClose,
}: {
  visible: boolean;
  product: Product;
  onClose: () => void;
}) {
  const { user, signOut } = useAuth();
  const { add } = useCart();
  const { push } = useNav();

  const listKobo = product.priceKobo;
  const [amountText, setAmountText] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [result, setResult] = useState<Offer | null>(null);

  // A fresh sheet every time it opens — a previous result or half-typed
  // amount for this product shouldn't greet the buyer on the next visit.
  useEffect(() => {
    if (!visible) return;
    setAmountText("");
    setQty(1);
    setNote("");
    setTouched(false);
    setSendError(null);
    setResult(null);
  }, [visible]);

  const offerKobo = nairaInputToKobo(amountText);
  const invalid = validateOfferAmount(listKobo, offerKobo);
  const meter =
    offerKobo > 0 && offerKobo < listKobo
      ? dealMeter(listKobo, offerKobo)
      : null;

  const setCut = (pct: number) => {
    setTouched(true);
    setAmountText(String(Math.round((listKobo * (1 - pct / 100)) / 100)));
  };

  const addQuickMessage = (m: string) =>
    setNote((cur) =>
      (cur.includes(m) ? cur : [cur.trim(), m].filter(Boolean).join(" ")).slice(
        0,
        MAX_NOTE,
      ),
    );

  const goToOffers = () => {
    onClose();
    push("offers");
  };

  const send = async () => {
    setTouched(true);
    if (invalid || !user?.email) return;
    setSending(true);
    setSendError(null);
    try {
      const { offer } = await createOffer({
        product_id: product.id,
        amount_kobo: offerKobo,
        quantity: qty,
        customer_name: user.fullName || user.email,
        customer_email: user.email,
        message: note.trim() || undefined,
      });
      setResult(offer);
    } catch (err) {
      setSendError(
        err instanceof ApiError
          ? err.message
          : "We couldn't send your offer. Check your connection and try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const buyDeal = (o: Offer) => {
    if (o.agreed_kobo == null) return;
    add(product, {
      deal: { offerId: o.id, unitKobo: o.agreed_kobo, quantity: o.quantity },
    });
    onClose();
    push("cart");
  };

  let body: React.ReactNode;
  if (!user?.email) {
    // The offer is tied to the account's email — that's how My offers and
    // checkout find it again — so there's nothing to send without one.
    // Signing out drops back to the app's sign-in flow.
    body = (
      <View style={s.centerBlock}>
        <Ionicons name="person-circle-outline" size={44} color={color.ink} />
        <Text style={[type.title, s.centerText]}>Sign in to make an offer</Text>
        <Text style={[type.body, s.centerText]}>
          Offers are linked to your account so you can follow the vendor's
          reply.
        </Text>
        <Button
          label="Sign in"
          onPress={() => void signOut()}
          style={{ alignSelf: "stretch", marginTop: space.lg }}
        />
      </View>
    );
  } else if (result?.status === "accepted" && result.agreed_kobo != null) {
    body = (
      <InstantDeal
        offer={result}
        onBuy={() => buyDeal(result)}
        onClose={onClose}
      />
    );
  } else if (result) {
    body = (
      <View style={s.centerBlock}>
        <View style={s.sentIcon}>
          <Ionicons name="paper-plane" size={26} color={color.onInk} />
        </View>
        <Text style={[type.title, s.centerText]}>Offer sent</Text>
        <Text style={[type.body, s.centerText]}>
          You offered {formatKobo(result.offer_kobo)}
          {result.quantity > 1 ? ` each for ${result.quantity}` : ""}.{" "}
          {result.store_name ?? product.vendor} has{" "}
          {timeLeft(result.expires_at).replace(" left", "")} to reply — accept,
          counter or decline.
        </Text>
        <Button
          label="View my offers"
          onPress={goToOffers}
          style={{ alignSelf: "stretch", marginTop: space.lg }}
        />
        <Pressable onPress={onClose} hitSlop={HIT}>
          <Text style={s.quietLink}>Done</Text>
        </Pressable>
      </View>
    );
  } else {
    body = (
      <>
        <View style={s.listRow}>
          <View style={{ flex: 1 }}>
            <Text style={type.meta}>List price</Text>
            <Text style={s.listPrice}>{formatKobo(listKobo)}</Text>
          </View>
          <Pressable
            onPress={goToOffers}
            hitSlop={HIT}
            accessibilityRole="button"
          >
            <Text style={s.link}>My offers</Text>
          </Pressable>
        </View>

        <Text style={[type.label, s.fieldLabel]}>Your offer (per item)</Text>
        <View style={[s.amountField, touched && !!invalid && s.amountFieldBad]}>
          <Text style={s.naira}>₦</Text>
          <TextInput
            value={amountText ? Number(amountText).toLocaleString() : ""}
            onChangeText={(t) => setAmountText(t.replace(/[^0-9]/g, ""))}
            onBlur={() => setTouched(true)}
            keyboardType="number-pad"
            placeholder={Math.round((listKobo * 0.9) / 100).toLocaleString()}
            placeholderTextColor={color.textFaint}
            style={s.amountInput}
            accessibilityLabel="Offer amount in Naira"
          />
        </View>

        <View style={s.chipRow}>
          {QUICK_CUTS.map((pct) => (
            <Pressable
              key={pct}
              onPress={() => setCut(pct)}
              style={s.chip}
              accessibilityRole="button"
            >
              <Text style={s.chipText}>−{pct}%</Text>
            </Pressable>
          ))}
        </View>

        <DealMeterBar meter={meter} />
        {touched && !!invalid && <Text style={s.fieldError}>{invalid}</Text>}

        <View style={s.qtyRow}>
          <Text style={type.section}>Quantity</Text>
          <View style={s.qty}>
            <Pressable
              onPress={() => setQty((q) => Math.max(1, q - 1))}
              hitSlop={HIT}
              accessibilityLabel="Decrease quantity"
            >
              <View style={s.qtyBtn}>
                <Ionicons name="remove" size={17} color={color.text} />
              </View>
            </Pressable>
            <Text style={s.qtyNum}>{qty}</Text>
            <Pressable
              onPress={() => setQty((q) => Math.min(MAX_OFFER_QTY, q + 1))}
              hitSlop={HIT}
              accessibilityLabel="Increase quantity"
            >
              <View style={s.qtyBtn}>
                <Ionicons name="add" size={17} color={color.text} />
              </View>
            </Pressable>
          </View>
        </View>

        <Text style={[type.label, s.fieldLabel]}>
          Note to the vendor (optional)
        </Text>
        <View style={s.chipRow}>
          {QUICK_MESSAGES.map((m) => (
            <Pressable
              key={m}
              onPress={() => addQuickMessage(m)}
              style={s.msgChip}
              accessibilityRole="button"
            >
              <Text style={s.msgChipText}>{m}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={note}
          onChangeText={(t) => setNote(t.slice(0, MAX_NOTE))}
          multiline
          placeholder="Add a message"
          placeholderTextColor={color.textFaint}
          style={s.note}
        />

        {sendError && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle" size={16} color={color.danger} />
            <View style={{ flex: 1 }}>
              <Text style={s.errorText}>{sendError}</Text>
              <Pressable onPress={goToOffers} hitSlop={HIT}>
                <Text style={[s.link, { marginTop: 4 }]}>See my offers</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Button
          label={
            offerKobo > 0 && !invalid
              ? `Send offer · ${formatKobo(offerKobo * qty)}`
              : "Send offer"
          }
          onPress={() => void send()}
          loading={sending}
          disabled={!!invalid}
          style={{ marginTop: space.lg }}
        />
      </>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Pressable style={s.backdrop} onPress={onClose}>
          {/* Stops a tap inside the sheet closing it, while a tap on the
              dimmed area still does. */}
          <Pressable style={s.sheet} onPress={() => {}}>
            <View style={s.handle} />
            <View style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>Make an offer</Text>
                <Text numberOfLines={1} style={type.meta}>
                  {product.name} · {product.vendor}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={HIT}
                style={s.closeBtn}
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={20} color={color.ink} />
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: space.md }}
            >
              {body}
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Four segments, lit up to the offer's level, with the label beneath. */
function DealMeterBar({
  meter,
}: {
  meter: ReturnType<typeof dealMeter> | null;
}) {
  return (
    <View style={s.meterWrap}>
      <View style={s.meterTrack}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              s.meterSeg,
              meter && i <= meter.level && { backgroundColor: meter.tone },
            ]}
          />
        ))}
      </View>
      <View style={s.meterLabels}>
        <Text style={[s.meterLabel, meter && { color: color.text }]}>
          {meter ? meter.label : "Deal meter"}
        </Text>
        <Text style={type.meta}>
          {meter
            ? `${Math.round(meter.pctBelow)}% below list`
            : "Enter an amount"}
        </Text>
      </View>
    </View>
  );
}

function InstantDeal({
  offer,
  onBuy,
  onClose,
}: {
  offer: Offer;
  onBuy: () => void;
  onClose: () => void;
}) {
  const agreed = offer.agreed_kobo ?? offer.offer_kobo;
  const confetti = [
    color.sunshine,
    color.coral,
    color.sky,
    color.accent,
    color.sunshine,
    color.coral,
  ];
  return (
    <View style={s.centerBlock}>
      <View style={s.burst}>
        {confetti.map((c, i) => {
          const angle = (i / confetti.length) * Math.PI * 2;
          return (
            <MotiView
              key={i}
              from={{ translateX: 0, translateY: 0, opacity: 0, scale: 0.4 }}
              animate={{
                translateX: Math.cos(angle) * 54,
                translateY: Math.sin(angle) * 54,
                opacity: 1,
                scale: 1,
              }}
              transition={{ type: "spring", damping: 12, delay: 120 + i * 30 }}
              style={[s.confetti, { backgroundColor: c }]}
            />
          );
        })}
        <MotiView
          from={{ scale: 0.3, rotate: "-20deg" }}
          animate={{ scale: 1, rotate: "0deg" }}
          transition={{ type: "spring", damping: 9 }}
          style={s.dealBadge}
        >
          <Ionicons name="checkmark" size={34} color={color.onInk} />
        </MotiView>
      </View>
      <Text style={[type.display, s.centerText, { fontSize: 26 }]}>
        It's a deal!
      </Text>
      <Text style={[type.body, s.centerText]}>
        {offer.store_name ?? "The vendor"} accepted {formatKobo(agreed)}
        {offer.quantity > 1 ? ` each for ${offer.quantity}` : ""}. The price
        holds for {timeLeft(offer.expires_at).replace(" left", "")}.
      </Text>
      <Text style={s.struck}>{formatKobo(offer.list_price_kobo)}</Text>
      <Button
        label={`Buy at ${formatKobo(agreed)}`}
        onPress={onBuy}
        style={{ alignSelf: "stretch", marginTop: space.md }}
      />
      <Pressable onPress={onClose} hitSlop={HIT}>
        <Text style={s.quietLink}>Later — it's saved in My offers</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: color.canvas,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: space.gutter,
    paddingTop: space.sm,
    paddingBottom: space.xxl,
    maxHeight: "90%",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.lineStrong,
    marginBottom: space.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.md,
    marginBottom: space.lg,
  },
  title: { ...type.display, fontSize: 22 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.line,
    alignItems: "center",
    justifyContent: "center",
  },

  listRow: { flexDirection: "row", alignItems: "flex-end" },
  listPrice: { fontFamily: "Jakarta_700", fontSize: 20, color: color.text },
  link: { fontFamily: "Jakarta_600", fontSize: 13, color: color.primary },

  fieldLabel: {
    fontFamily: "Jakarta_600",
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  amountField: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    borderRadius: 16,
    paddingHorizontal: space.lg,
    backgroundColor: color.card,
    borderWidth: 1.5,
    borderColor: color.lineStrong,
  },
  amountFieldBad: { borderColor: color.danger },
  naira: {
    fontFamily: "Jakarta_700",
    fontSize: 22,
    color: color.textMuted,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontFamily: "Jakarta_700",
    fontSize: 22,
    color: color.text,
    padding: 0,
  },
  fieldError: {
    fontFamily: "Jakarta_500",
    fontSize: 12,
    color: color.danger,
    marginTop: space.sm,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    marginTop: space.md,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: color.card,
    borderWidth: 1.5,
    borderColor: color.ink900,
  },
  chipText: { fontFamily: "Jakarta_700", fontSize: 13, color: color.ink900 },
  msgChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: color.panel,
  },
  msgChipText: { fontFamily: "Jakarta_500", fontSize: 12, color: color.ink },

  meterWrap: { marginTop: space.lg },
  meterTrack: { flexDirection: "row", gap: 4 },
  meterSeg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.line,
  },
  meterLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  meterLabel: {
    fontFamily: "Jakarta_700",
    fontSize: 13,
    color: color.textFaint,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: space.xl,
  },
  qty: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.lineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyNum: {
    fontFamily: "Jakarta_700",
    fontSize: 16,
    color: color.text,
    minWidth: 20,
    textAlign: "center",
  },

  note: {
    marginTop: space.md,
    minHeight: 72,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: color.line,
    backgroundColor: color.card,
    padding: space.md,
    fontFamily: "Jakarta_400",
    fontSize: 14,
    color: color.text,
    textAlignVertical: "top",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
    padding: space.md,
    borderRadius: 12,
    backgroundColor: "#FDECEC",
    marginTop: space.lg,
  },
  errorText: {
    fontFamily: "Jakarta_500",
    fontSize: 13,
    lineHeight: 19,
    color: "#8E1F1F",
  },

  centerBlock: { alignItems: "center", paddingVertical: space.lg },
  centerText: { textAlign: "center", marginTop: space.sm },
  sentIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: color.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
  },
  quietLink: {
    fontFamily: "Jakarta_600",
    fontSize: 13,
    color: color.textMuted,
    textAlign: "center",
    marginTop: space.md,
  },

  burst: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  confetti: { position: "absolute", width: 12, height: 12, borderRadius: 4 },
  dealBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
    ...stickerShadow(color.ink900, 4),
  },
  struck: {
    fontFamily: "Jakarta_500",
    fontSize: 14,
    color: color.textFaint,
    textDecorationLine: "line-through",
    marginTop: space.sm,
  },
});
