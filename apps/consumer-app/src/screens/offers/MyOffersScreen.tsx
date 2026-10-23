import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { Button } from "../../components/ui/Button";
import { LoadError } from "../../components/ui/LoadError";
import {
  getMyOffers,
  respondToMyOffer,
  ApiError,
  type Offer,
  type OfferEvent,
  type OfferResponseAction,
} from "../../lib/api-client";
import { useCart } from "../../lib/cart-context";
import { useNav } from "../../navigation/nav-context";
import { formatKobo } from "../../lib/order-status";
import {
  OFFER_STATUS_LABEL,
  isOfferOpen,
  timeLeft,
  eventText,
  offerToProduct,
  nairaInputToKobo,
} from "../../lib/offers";
import { color, type, space, HIT } from "../../theme/tokens";

/**
 * Every offer the buyer has made, newest first, each with its conversation
 * and whatever the buyer can do next.
 *
 * Loads on mount, which in this app's custom stack is also "on focus": only
 * the top route is rendered, so coming back here from the cart or a product
 * remounts the screen and refetches. Pull to refresh covers a vendor reply
 * arriving while the buyer is looking at it.
 */
export function MyOffersScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Re-renders the countdowns; a minute is as fine as they're shown.
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "refresh") setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const { offers: fetched } = await getMyOffers();
      setOffers(fetched ?? []);
      setNow(Date.now());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't load your offers",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load("initial");
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const replace = (updated: Offer) =>
    setOffers((cur) => cur.map((o) => (o.id === updated.id ? updated : o)));

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScreenHeader title="My offers" />
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={color.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space.gutter, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load("refresh")}
              tintColor={color.primary}
            />
          }
        >
          {error ? (
            <LoadError
              title="Couldn't load your offers"
              message={error}
              onRetry={() => void load("initial")}
            />
          ) : offers.length === 0 ? (
            <View style={s.empty}>
              <Ionicons
                name="pricetags-outline"
                size={48}
                color={color.textFaint}
              />
              <Text style={[type.title, { marginTop: space.lg }]}>
                No offers yet
              </Text>
              <Text style={[type.body, { textAlign: "center", marginTop: 4 }]}>
                Look for the Negotiable tag on a product and make the vendor an
                offer.
              </Text>
            </View>
          ) : (
            offers.map((o) => (
              <OfferCard key={o.id} offer={o} now={now} onUpdated={replace} />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function OfferCard({
  offer: o,
  now,
  onUpdated,
}: {
  offer: Offer;
  now: number;
  onUpdated: (o: Offer) => void;
}) {
  const { add } = useCart();
  const { push } = useNav();
  const [busy, setBusy] = useState<OfferResponseAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [countering, setCountering] = useState(false);
  const [counterText, setCounterText] = useState("");
  const [imgFailed, setImgFailed] = useState(false);

  const open = isOfferOpen(o.status);
  const expired = open && new Date(o.expires_at).getTime() <= now;

  const respond = async (action: OfferResponseAction, amountKobo?: number) => {
    setBusy(action);
    setActionError(null);
    try {
      const updated = await respondToMyOffer(o.id, {
        action,
        ...(amountKobo != null ? { amount_kobo: amountKobo } : {}),
      });
      onUpdated(updated);
      setCountering(false);
      setCounterText("");
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : "That didn't go through. Try again.",
      );
    } finally {
      setBusy(null);
    }
  };

  const confirm = (
    title: string,
    message: string,
    action: OfferResponseAction,
  ) =>
    Alert.alert(title, message, [
      { text: "Keep it", style: "cancel" },
      {
        text: title,
        style: "destructive",
        onPress: () => void respond(action),
      },
    ]);

  // A buyer counter has to land between their own last offer and the
  // vendor's counter — the same rule the server enforces.
  const counterKobo = nairaInputToKobo(counterText);
  const counterError =
    !counterText || o.counter_kobo == null
      ? null
      : counterKobo <= o.offer_kobo
        ? `Go higher than your last offer of ${formatKobo(o.offer_kobo)}.`
        : counterKobo >= o.counter_kobo
          ? `That's at or above their counter — accept ${formatKobo(o.counter_kobo)} instead.`
          : null;

  const buy = () => {
    if (o.agreed_kobo == null) return;
    add(offerToProduct(o), {
      deal: { offerId: o.id, unitKobo: o.agreed_kobo, quantity: o.quantity },
    });
    push("cart");
  };

  const showImage = !!o.product_image && !imgFailed;

  return (
    <View style={s.card}>
      <View style={s.head}>
        <View style={s.thumb}>
          {showImage ? (
            <Image
              source={{ uri: o.product_image }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <Ionicons name="pricetag-outline" size={20} color={color.ink} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={s.name}>
            {o.product_name}
          </Text>
          <Text numberOfLines={1} style={type.meta}>
            {[
              o.store_name,
              `List ${formatKobo(o.list_price_kobo)}`,
              o.quantity > 1 ? `× ${o.quantity}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
        <View style={[s.chip, chipTone(o)]}>
          <Text style={s.chipText}>
            {expired ? "Expired" : OFFER_STATUS_LABEL[o.status]}
          </Text>
        </View>
      </View>

      {(o.events ?? []).length > 0 && (
        <View style={s.thread}>
          {(o.events ?? []).map((e, i) => (
            <EventBubble key={`${e.created_at}-${i}`} event={e} />
          ))}
        </View>
      )}

      {open && !expired && (
        <View style={s.clockRow}>
          <Ionicons name="time-outline" size={13} color={color.textMuted} />
          <Text style={type.meta}>
            {o.status === "accepted" ? "Deal holds — " : ""}
            {timeLeft(o.expires_at, now)}
          </Text>
        </View>
      )}

      {!expired && o.status === "accepted" && o.agreed_kobo != null && (
        <Button
          label={`Buy at ${formatKobo(o.agreed_kobo)}`}
          onPress={buy}
          style={{ marginTop: space.md }}
        />
      )}

      {!expired && o.status === "countered" && o.counter_kobo != null && (
        <View style={{ marginTop: space.md, gap: space.sm }}>
          <Button
            label={`Accept ${formatKobo(o.counter_kobo)}`}
            onPress={() => void respond("accept")}
            loading={busy === "accept"}
            disabled={!!busy}
          />
          {countering ? (
            <View style={s.counterBox}>
              <View style={s.counterField}>
                <Text style={s.naira}>₦</Text>
                <TextInput
                  value={
                    counterText ? Number(counterText).toLocaleString() : ""
                  }
                  onChangeText={(t) => setCounterText(t.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  autoFocus
                  placeholder="Your counter"
                  placeholderTextColor={color.textFaint}
                  style={s.counterInput}
                  accessibilityLabel="Counter offer amount in Naira"
                />
              </View>
              {counterError && <Text style={s.fieldError}>{counterError}</Text>}
              <View style={s.actionRow}>
                <Pressable onPress={() => setCountering(false)} hitSlop={HIT}>
                  <Text style={s.quiet}>Cancel</Text>
                </Pressable>
                <Button
                  label="Send counter"
                  onPress={() => void respond("counter", counterKobo)}
                  loading={busy === "counter"}
                  disabled={!counterText || !!counterError || !!busy}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <View style={s.actionRow}>
              <Pressable
                onPress={() => setCountering(true)}
                disabled={o.buyer_offers_left <= 0 || !!busy}
                style={[
                  s.secondary,
                  o.buyer_offers_left <= 0 && { opacity: 0.45 },
                ]}
                accessibilityRole="button"
              >
                <Text style={s.secondaryText}>Counter</Text>
                <Text style={type.meta}>
                  {o.buyer_offers_left > 0
                    ? `${o.buyer_offers_left} ${o.buyer_offers_left === 1 ? "offer" : "offers"} left`
                    : "No offers left"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  confirm(
                    "Decline",
                    `Turn down ${formatKobo(o.counter_kobo!)}? This ends the negotiation.`,
                    "decline",
                  )
                }
                disabled={!!busy}
                style={s.secondary}
                accessibilityRole="button"
              >
                {busy === "decline" ? (
                  <ActivityIndicator color={color.ink} />
                ) : (
                  <Text style={s.secondaryText}>Decline</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      )}

      {!expired && (o.status === "pending" || o.status === "countered") && (
        <Pressable
          onPress={() =>
            confirm(
              "Withdraw",
              "Withdraw this offer? The vendor won't be able to accept it.",
              "withdraw",
            )
          }
          disabled={!!busy}
          hitSlop={HIT}
          accessibilityRole="button"
        >
          <Text style={[s.quiet, { marginTop: space.md }]}>
            {busy === "withdraw" ? "Withdrawing…" : "Withdraw offer"}
          </Text>
        </Pressable>
      )}

      {actionError && (
        <Text style={[s.fieldError, { textAlign: "center" }]}>
          {actionError}
        </Text>
      )}
    </View>
  );
}

/** The buyer's moves on the right, the vendor's on the left, system notes centred. */
function EventBubble({ event: e }: { event: OfferEvent }) {
  const side =
    e.actor === "buyer" ? "right" : e.actor === "vendor" ? "left" : "center";
  const when = new Date(e.created_at).toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <View
      style={[
        s.bubble,
        side === "right" && s.bubbleBuyer,
        side === "left" && s.bubbleVendor,
        side === "center" && s.bubbleSystem,
      ]}
    >
      <Text style={[s.bubbleText, side === "right" && { color: color.onInk }]}>
        {eventText(e)}
      </Text>
      {!!e.message && (
        <Text style={[s.bubbleMsg, side === "right" && { color: color.onInk }]}>
          “{e.message}”
        </Text>
      )}
      <Text
        style={[
          s.bubbleTime,
          side === "right" && { color: "rgba(255,255,255,0.7)" },
        ]}
      >
        {when}
      </Text>
    </View>
  );
}

function chipTone(o: Offer) {
  switch (o.status) {
    case "accepted":
    case "redeemed":
      return { backgroundColor: "#E1F0E6" };
    case "countered":
      return { backgroundColor: color.sunshine };
    case "pending":
      return { backgroundColor: color.panel };
    default:
      return { backgroundColor: color.line };
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: space.xl },

  card: {
    backgroundColor: color.card,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: 18,
    padding: space.lg,
    marginBottom: space.md,
  },
  head: { flexDirection: "row", alignItems: "center", gap: space.md },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: color.panel,
  },
  name: { fontFamily: "Jakarta_700", fontSize: 14, color: color.text },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontFamily: "Jakarta_600", fontSize: 11, color: color.ink },

  thread: { marginTop: space.md, gap: space.sm },
  bubble: {
    maxWidth: "82%",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleBuyer: {
    alignSelf: "flex-end",
    backgroundColor: color.ink,
    borderBottomRightRadius: 4,
  },
  bubbleVendor: {
    alignSelf: "flex-start",
    backgroundColor: color.panel,
    borderBottomLeftRadius: 4,
  },
  bubbleSystem: { alignSelf: "center", backgroundColor: color.canvas },
  bubbleText: { fontFamily: "Jakarta_600", fontSize: 13, color: color.text },
  bubbleMsg: {
    fontFamily: "Jakarta_400",
    fontSize: 13,
    color: color.text,
    marginTop: 2,
  },
  bubbleTime: {
    fontFamily: "Jakarta_400",
    fontSize: 10,
    color: color.textMuted,
    marginTop: 3,
  },

  clockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: space.md,
  },

  actionRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  secondary: {
    flex: 1,
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: color.lineStrong,
    backgroundColor: color.card,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  secondaryText: { fontFamily: "Jakarta_600", fontSize: 15, color: color.text },
  quiet: {
    fontFamily: "Jakarta_600",
    fontSize: 13,
    color: color.textMuted,
    textAlign: "center",
    paddingHorizontal: space.sm,
  },

  counterBox: { gap: space.sm },
  counterField: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 14,
    paddingHorizontal: space.lg,
    backgroundColor: color.card,
    borderWidth: 1.5,
    borderColor: color.lineStrong,
  },
  naira: {
    fontFamily: "Jakarta_700",
    fontSize: 18,
    color: color.textMuted,
    marginRight: 6,
  },
  counterInput: {
    flex: 1,
    fontFamily: "Jakarta_700",
    fontSize: 18,
    color: color.text,
    padding: 0,
  },
  fieldError: {
    fontFamily: "Jakarta_500",
    fontSize: 12,
    color: color.danger,
    marginTop: 4,
  },
});
