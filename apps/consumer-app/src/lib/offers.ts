import type { Offer, OfferEvent, OfferStatus } from "./api-client";
import type { Product } from "./types";
import { categoryMeta } from "./store-category";
import { formatKobo } from "./order-status";
import { color } from "../theme/tokens";

/** The lowest offer the server will take: half the list price. */
export const MIN_OFFER_RATIO = 0.5;
export const MAX_OFFER_QTY = 10;

export type DealMeter = {
  label: "Very likely" | "Fair offer" | "Bold" | "Long shot";
  /** 0–3, for the meter's lit segments. */
  level: 0 | 1 | 2 | 3;
  tone: string;
  pctBelow: number;
};

// dealMeter labels an offer by how far below list price it is. Computed from
// list price alone, on purpose: the vendor's floor never reaches a buyer
// client, and a meter that knew it would leak it one offer at a time.
export function dealMeter(listKobo: number, offerKobo: number): DealMeter {
  const pctBelow = listKobo > 0 ? ((listKobo - offerKobo) / listKobo) * 100 : 0;
  if (pctBelow <= 5)
    return { label: "Very likely", level: 0, tone: color.primary, pctBelow };
  if (pctBelow <= 15)
    return { label: "Fair offer", level: 1, tone: color.accent, pctBelow };
  if (pctBelow <= 30)
    return { label: "Bold", level: 2, tone: color.sunshine, pctBelow };
  return { label: "Long shot", level: 3, tone: color.coral, pctBelow };
}

// validateOfferAmount mirrors the server's own rules so the buyer hears about
// them before sending — the server still has the final say.
export function validateOfferAmount(
  listKobo: number,
  offerKobo: number,
): string | null {
  if (!offerKobo || offerKobo <= 0)
    return "Enter the amount you'd like to pay.";
  if (offerKobo >= listKobo)
    return `That's the list price or more — just buy it at ${formatKobo(listKobo)}.`;
  if (offerKobo < Math.ceil(listKobo * MIN_OFFER_RATIO))
    return `Too low to send — offers start at ${formatKobo(Math.ceil(listKobo * MIN_OFFER_RATIO))}.`;
  return null;
}

/** Digits typed into a Naira field → kobo. */
export function nairaInputToKobo(text: string): number {
  const digits = text.replace(/[^0-9]/g, "");
  return digits ? Number(digits) * 100 : 0;
}

export const OFFER_STATUS_LABEL: Record<OfferStatus, string> = {
  pending: "Waiting on vendor",
  countered: "Vendor countered",
  accepted: "Deal agreed",
  redeemed: "Paid",
  declined: "Declined",
  expired: "Expired",
  withdrawn: "Withdrawn",
};

/** Statuses with a clock running on them. */
export const isOfferOpen = (s: OfferStatus) =>
  s === "pending" || s === "countered" || s === "accepted";

// timeLeft reads expires_at as a short countdown — "1d 4h left", "35m left".
export function timeLeft(expiresAt: string, now = Date.now()): string {
  const ms = new Date(expiresAt).getTime() - now;
  if (!Number.isFinite(ms) || ms <= 0) return "Expired";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m left`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m left`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
}

// eventText is one line of the negotiation, from the buyer's side.
export function eventText(e: OfferEvent): string {
  const amt = e.amount_kobo != null ? ` ${formatKobo(e.amount_kobo)}` : "";
  const you = e.actor === "buyer";
  switch (e.action) {
    case "offer":
      return you ? `You offered${amt}` : `Offer of${amt}`;
    case "counter":
      return you ? `You countered with${amt}` : `Vendor countered with${amt}`;
    case "accept":
      if (e.actor === "system") return `Instant deal at${amt}`;
      return you ? `You accepted${amt}` : `Vendor accepted${amt}`;
    case "decline":
      return you ? "You declined" : "Vendor declined";
    case "withdraw":
      return "You withdrew the offer";
    case "expire":
      return "The offer expired";
    case "redeem":
      return "Paid for at checkout";
  }
}

// offerToProduct rebuilds enough of a Product from an offer to put the deal
// in the cart from My offers, where the full catalogue product isn't loaded.
// Every field is the offer's own; the category is unknown, so the icon falls
// back to the generic store glyph.
export function offerToProduct(o: Offer): Product {
  const meta = categoryMeta("");
  return {
    id: o.product_id,
    name: o.product_name,
    vendor: o.store_name ?? "",
    storeId: o.store_id,
    storeSlug: o.store_slug,
    storeName: o.store_name,
    category: "",
    priceKobo: o.list_price_kobo,
    isNegotiable: true,
    description: "",
    images: o.product_image ? [o.product_image] : [],
    icon: meta.icon,
    tint: meta.tint,
  };
}
