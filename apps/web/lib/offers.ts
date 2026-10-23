// Negotiable pricing ("Make an offer") — the buyer's half.
//
// A guest buyer has no account, so the only key to an offer is the
// buyer_token the server hands back when it is created. We keep it on this
// device (localStorage) next to the offer id, and the backend's emails carry
// it in the link, so either way the buyer can get back to the conversation.
//
// All money is integer kobo. Every amount here is per unit — the offer's
// quantity multiplies it, exactly as a cart line's price_kobo does.

import { ApiError } from "@gomarket/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ── Types (mirror the orders service contract) ───────────────────────────────

export type OfferStatus =
  | "pending" // waiting on the vendor
  | "countered" // vendor countered, waiting on the buyer
  | "accepted" // deal agreed; buy at agreed_kobo until expires_at
  | "redeemed" // the deal was paid for
  | "declined"
  | "expired"
  | "withdrawn";

export type OfferEvent = {
  actor: "buyer" | "vendor" | "system";
  action: "offer" | "counter" | "accept" | "decline" | "withdraw" | "expire" | "redeem";
  amount_kobo?: number;
  message?: string;
  created_at: string;
};

export type Offer = {
  id: string;
  store_id: string;
  store_slug?: string;
  store_name?: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  list_price_kobo: number;
  offer_kobo: number;
  counter_kobo?: number;
  agreed_kobo?: number;
  quantity: number;
  status: OfferStatus;
  auto_accepted: boolean;
  buyer_offers_left: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  message?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  events: OfferEvent[];
};

export type CreateOfferReq = {
  product_id: string;
  amount_kobo: number;
  quantity?: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  message?: string;
};

export type RespondOfferReq = {
  action: "accept" | "counter" | "decline" | "withdraw";
  amount_kobo?: number;
  message?: string;
};

// ── API ───────────────────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    // The orders service explains offer refusals in plain words ("too low to
    // send", "you already have an open offer") — carry its message through.
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, body.error || res.statusText || "Request failed");
  }
  return res.json() as Promise<T>;
}

export const offersApi = {
  create: (data: CreateOfferReq) =>
    request<{ offer: Offer; buyer_token: string }>("/v1/orders/public/offers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  get: (id: string, token: string) =>
    request<Offer>(
      `/v1/orders/public/offers/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`,
    ),

  respond: (id: string, token: string, data: RespondOfferReq) =>
    request<Offer>(
      `/v1/orders/public/offers/${encodeURIComponent(id)}/respond?token=${encodeURIComponent(token)}`,
      { method: "POST", body: JSON.stringify(data) },
    ),
};

/** A message fit to show the buyer, whatever was thrown. */
export function offerErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Couldn't reach the store — check your connection and try again.";
}

// ── Saved offers (this device) ───────────────────────────────────────────────

export type SavedOffer = {
  id: string;
  token: string;
  slug: string;
  product_name: string;
  /** Lets the product page find "your open offer on this" after a 409. */
  product_id?: string;
  /** Lets "Buy at ₦X" build a cart line without refetching the product. */
  is_digital?: boolean;
};

const STORAGE_KEY = "gm-offers";
const CHANGE_EVENT = "gm-offers-change";

function readRaw(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parse(raw: string): SavedOffer[] {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (o): o is SavedOffer =>
        !!o && typeof o.id === "string" && typeof o.token === "string" && typeof o.slug === "string",
    );
  } catch {
    return [];
  }
}

export function readSavedOffers(): SavedOffer[] {
  if (typeof window === "undefined") return [];
  return parse(readRaw());
}

/**
 * Remembers an offer on this device, newest first. Returns false when the
 * browser refuses storage (private mode, quota) so callers can fall back to
 * keeping the token in the link.
 */
export function saveOffer(entry: SavedOffer): boolean {
  try {
    const rest = readSavedOffers().filter((o) => o.id !== entry.id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...rest].slice(0, 50)));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function forgetOffer(id: string) {
  try {
    const rest = readSavedOffers().filter((o) => o.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* nothing to forget if storage is unavailable */
  }
}

// useSyncExternalStore plumbing: the snapshot must be referentially stable
// between changes, so it is cached against the raw string it was parsed from.
let snapRaw = "";
let snap: SavedOffer[] = [];
const EMPTY: SavedOffer[] = [];

export function subscribeSavedOffers(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSavedOffersSnapshot(): SavedOffer[] {
  const raw = readRaw();
  if (raw !== snapRaw) {
    snapRaw = raw;
    snap = parse(raw);
  }
  return snap;
}

export function getSavedOffersServerSnapshot(): SavedOffer[] {
  return EMPTY;
}

// ── Pricing helpers ──────────────────────────────────────────────────────────

/** The lowest offer the server will accept for sending: half the list price. */
export function minOfferKobo(listKobo: number) {
  return Math.ceil(listKobo / 2);
}

export const QUICK_DISCOUNTS = [5, 10, 15] as const;

/**
 * A quick-offer amount for "x% off", rounded down to a figure a person would
 * actually say: whole ₦100s on bigger prices, whole naira otherwise.
 */
export function discountedKobo(listKobo: number, pct: number) {
  const raw = (listKobo * (100 - pct)) / 100;
  const step = listKobo >= 1_000_000 ? 10_000 : 100; // ₦10,000+ → nearest ₦100
  return Math.max(minOfferKobo(listKobo), Math.floor(raw / step) * step);
}

export type DealTone = "great" | "fair" | "bold" | "longshot";

/**
 * How an offer reads against the LIST price only. The vendor's floor is
 * private and never reaches the storefront, so this cannot (and must not)
 * hint at where it is — it is a feel for the haggle, not a prediction.
 */
export function dealMeter(listKobo: number, offerKobo: number) {
  const pctOff = listKobo > 0 ? ((listKobo - offerKobo) / listKobo) * 100 : 0;
  let tone: DealTone;
  let label: string;
  if (pctOff <= 5) {
    tone = "great";
    label = "Very likely";
  } else if (pctOff <= 15) {
    tone = "fair";
    label = "Fair offer";
  } else if (pctOff <= 30) {
    tone = "bold";
    label = "Bold";
  } else {
    tone = "longshot";
    label = "Long shot";
  }
  return { pctOff: Math.max(0, pctOff), tone, label };
}

export const DEAL_TONE_COLOR: Record<DealTone, string> = {
  great: "#16a34a",
  fair: "#65a30d",
  bold: "#d97706",
  longshot: "#dc2626",
};

/** Jiji-style one-tap notes. */
export const QUICK_MESSAGES = [
  "Is this still available?",
  "Last price?",
  "Can you deliver today?",
] as const;

/** Same rule the checkout uses, so a phone accepted here is accepted there. */
export const NG_PHONE_RE = /^(0|\+234)[789][01]\d{8}$/;

export function fmtNaira(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

/** "45000" or "45,000" → 4_500_000 kobo; NaN when there is no number. */
export function parseNairaInput(text: string): number {
  const digits = text.replace(/[^\d]/g, "");
  if (!digits) return NaN;
  return Number(digits) * 100;
}

/** Formats as the buyer types: "45000" → "45,000". */
export function formatNairaInput(text: string): string {
  const digits = text.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "").slice(0, 12);
  return digits ? Number(digits).toLocaleString("en-NG") : "";
}

// ── Status copy ──────────────────────────────────────────────────────────────

export const OPEN_STATUSES: OfferStatus[] = ["pending", "countered", "accepted"];

export function isOfferLive(o: Pick<Offer, "status" | "expires_at">) {
  return OPEN_STATUSES.includes(o.status) && new Date(o.expires_at).getTime() > Date.now();
}

export const STATUS_COPY: Record<OfferStatus, { label: string; tone: "action" | "good" | "wait" | "closed" }> = {
  pending: { label: "Waiting for the seller", tone: "wait" },
  countered: { label: "Seller countered — your move", tone: "action" },
  accepted: { label: "Deal agreed", tone: "good" },
  redeemed: { label: "Bought", tone: "good" },
  declined: { label: "Declined", tone: "closed" },
  expired: { label: "Expired", tone: "closed" },
  withdrawn: { label: "Withdrawn", tone: "closed" },
};

/** "1d 4h", "3h 12m", "8m 05s" — or null once it has passed. */
export function timeLeft(iso: string, now: number): string | null {
  const ms = new Date(iso).getTime() - now;
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86_400);
  const h = Math.floor((s % 86_400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${String(s % 60).padStart(2, "0")}s`;
}

/** Path to an offer on this storefront; the token rides along only when asked. */
export function offerHref(id: string, token?: string) {
  return token ? `/offers/${id}?token=${encodeURIComponent(token)}` : `/offers/${id}`;
}
