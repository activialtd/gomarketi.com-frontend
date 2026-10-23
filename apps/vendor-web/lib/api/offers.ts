/**
 * Negotiable pricing ("Make an offer") — the vendor side of the API.
 *
 * Lives here rather than in @gomarket/api-client for now: that package's
 * request() wrapper is private, so this module carries a small copy of it
 * (same base URL, same Bearer header, same one-shot refresh on 401 through the
 * shared refreshOnce() guard). Once the shared client grows an offers API this
 * file can shrink to re-exports.
 *
 * All money is integer kobo.
 */

import { ApiError, refreshOnce } from "@gomarket/api-client";

// Must match the api-client's own fallback, or the two would talk to
// different gateways when NEXT_PUBLIC_API_URL is unset.
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://prenatal-slather-explicit.ngrok-free.dev";

// ── Product fields ────────────────────────────────────────────────────────────

/** What the catalogue adds to a product for negotiable pricing. */
export interface NegotiablePricing {
  is_negotiable?: boolean;
  /** The vendor's private floor. Only ever returned on the vendor's own endpoints. */
  min_price_kobo?: number | null;
}

// ── Offer types ───────────────────────────────────────────────────────────────

export type OfferStatus =
  | "pending" // waiting on the vendor
  | "countered" // vendor countered, waiting on the buyer
  | "accepted" // deal agreed, buyer can check out at agreed_kobo
  | "declined"
  | "expired"
  | "redeemed" // the deal was paid for
  | "withdrawn";

export interface OfferEvent {
  actor: "buyer" | "vendor" | "system";
  action: "offer" | "counter" | "accept" | "decline" | "withdraw" | "expire" | "redeem";
  amount_kobo?: number;
  message?: string;
  created_at: string;
}

export interface Offer {
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
  min_price_kobo?: number;
  below_floor?: boolean;
}

/** The inbox tabs. `closed` = declined + expired + withdrawn + redeemed. */
export type OfferTab = "pending" | "countered" | "accepted" | "closed";

export interface OfferCounts {
  pending: number;
  countered: number;
  accepted: number;
  closed: number;
}

export interface OfferListResp {
  offers: Offer[];
  total: number;
  page: number;
  per_page: number;
  counts: OfferCounts;
}

export type VendorOfferAction = "accept" | "counter" | "decline";

export interface RespondToOfferReq {
  action: VendorOfferAction;
  amount_kobo?: number;
  message?: string;
}

// ── Fetch wrapper (mirrors @gomarket/api-client's request) ────────────────────

async function request<T>(path: string, init: RequestInit, accessToken: string): Promise<T> {
  const send = (token: string) =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

  let res = await send(accessToken);
  if (res.status === 401) {
    const fresh = await refreshOnce();
    if (fresh) res = await send(fresh);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      fields?: Array<{ field: string; message: string }>;
    };
    throw new ApiError(res.status, body.error ?? res.statusText, body.fields);
  }
  return res.json() as Promise<T>;
}

// ── Own-action memory ─────────────────────────────────────────────────────────
// The socket echoes every change back as offer_updated {offer_id, status},
// including the ones this vendor just made — and "accepted" alone cannot say
// whether the vendor accepted or the buyer took the vendor's counter. Remember
// what was answered from this tab for a short while so the notification code
// can stay quiet about the vendor's own clicks.

const OWN_ACTION_WINDOW_MS = 60_000;
const recentOwnActions = new Map<string, number>();

export function wasRecentOwnAction(offerId: string): boolean {
  const at = recentOwnActions.get(offerId);
  if (at === undefined) return false;
  if (Date.now() - at > OWN_ACTION_WINDOW_MS) {
    recentOwnActions.delete(offerId);
    return false;
  }
  return true;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const offersApi = {
  list: (
    params: { status?: OfferTab | "all"; page?: number; per_page?: number },
    token: string,
  ) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    if (params.page) qs.set("page", String(params.page));
    if (params.per_page) qs.set("per_page", String(params.per_page));
    return request<OfferListResp>(`/v1/orders/offers?${qs}`, {}, token);
  },

  respond: (id: string, body: RespondToOfferReq, token: string) => {
    recentOwnActions.set(id, Date.now());
    return request<Offer>(
      `/v1/orders/offers/${id}/respond`,
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },
};

// ── Money helpers ─────────────────────────────────────────────────────────────

/** Whole-naira display ("₦45,000") — offers are haggled in round numbers. */
export function nairaWhole(kobo: number): string {
  return (
    "₦" +
    Math.round(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })
  );
}

/** Percent below the list price, rounded; 0 when the offer is at or above it. */
export function percentOff(amountKobo: number, listKobo: number): number {
  if (listKobo <= 0 || amountKobo >= listKobo) return 0;
  return Math.round(((listKobo - amountKobo) / listKobo) * 100);
}
