"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Clock,
  HandCoins,
  Loader2,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Reply,
  X,
} from "lucide-react";
import {
  nairaWhole,
  percentOff,
  type Offer,
  type OfferEvent,
  type OfferStatus,
  type OfferTab,
  type RespondToOfferReq,
} from "@/lib/api/offers";
import { whatsappLink } from "@/lib/whatsapp";
import { formatRelative } from "@/store/useNotificationStore";
import { ROUTES } from "@/lib/config/routes";

// ── Status ────────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<OfferStatus, { label: string; bg: string; color: string }> = {
  pending: { label: "Needs reply", bg: "#fff7ed", color: "#c2410c" },
  countered: { label: "Waiting on buyer", bg: "#dbeafe", color: "#1d4ed8" },
  accepted: { label: "Deal agreed", bg: "#dcfce7", color: "#15803d" },
  redeemed: { label: "Paid", bg: "#dcfce7", color: "#15803d" },
  declined: { label: "Declined", bg: "#f1f5f9", color: "#64748b" },
  expired: { label: "Expired", bg: "#f1f5f9", color: "#64748b" },
  withdrawn: { label: "Withdrawn", bg: "#f1f5f9", color: "#64748b" },
};

export function OfferStatusPill({ status }: { status: OfferStatus }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.declined;
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

const OPEN_STATUSES: OfferStatus[] = ["pending", "countered", "accepted"];

/** "1d 4h left" / "3h 12m left" / "12m left" — null once it has lapsed. */
function timeLeft(iso: string, now: number): { label: string; urgent: boolean } | null {
  const ms = new Date(iso).getTime() - now;
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const mins = Math.floor(ms / 60_000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  const label =
    days > 0 ? `${days}d ${hrs % 24}h left` : hrs > 0 ? `${hrs}h ${mins % 60}m left` : `${Math.max(mins, 1)}m left`;
  return { label, urgent: hrs < 6 };
}

// ── Counter maths ─────────────────────────────────────────────────────────────

/**
 * Halfway between the buyer's offer and the list price, rounded to a number a
 * person would actually say (nearest ₦100, or ₦500 on bigger tickets) — as long
 * as rounding keeps it strictly between the two, which the server insists on.
 */
export function suggestedCounter(offerKobo: number, listKobo: number): number {
  const mid = (offerKobo + listKobo) / 2;
  const step = listKobo >= 5_000_000 ? 50_000 : 10_000; // ₦500 above ₦50k, else ₦100
  const rounded = Math.round(mid / step) * step;
  if (rounded > offerKobo && rounded < listKobo) return rounded;
  const exact = Math.round(mid);
  return exact > offerKobo && exact < listKobo ? exact : listKobo - 1;
}

function counterError(amountKobo: number, offer: Offer): string | null {
  if (!amountKobo) return "Enter an amount";
  if (amountKobo <= offer.offer_kobo) return `Must be more than their ${nairaWhole(offer.offer_kobo)}`;
  if (amountKobo >= offer.list_price_kobo)
    return `Must be below your list price of ${nairaWhole(offer.list_price_kobo)}`;
  return null;
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────

function offerWhatsappText(offer: Offer): string {
  const first = offer.customer_name?.split(" ")[0] || "there";
  const product = offer.product_name;
  const shop = offer.store_name ? ` at ${offer.store_name}` : "";
  switch (offer.status) {
    case "pending":
      return `Hi ${first}! Thanks for your offer of ${nairaWhole(offer.offer_kobo)} on the ${product}${shop}. Happy to talk it through — what works for you?`;
    case "countered":
      return `Hi ${first}! I sent you a counter of ${nairaWhole(offer.counter_kobo ?? offer.offer_kobo)} for the ${product}${shop}. Let me know what you think!`;
    case "accepted":
      return `Hi ${first}! Good news — your deal on the ${product} at ${nairaWhole(offer.agreed_kobo ?? offer.offer_kobo)} is ready. You can check out whenever you're ready.`;
    default:
      return `Hi ${first}! Following up on your offer for the ${product}${shop}.`;
  }
}

// ── Thread ────────────────────────────────────────────────────────────────────

function describeEvent(e: OfferEvent): string {
  const amt = typeof e.amount_kobo === "number" ? nairaWhole(e.amount_kobo) : "";
  const who = e.actor === "buyer" ? "Buyer" : e.actor === "vendor" ? "You" : "GoMarketi";
  switch (e.action) {
    case "offer":
      return `${who} offered ${amt}`.trim();
    case "counter":
      return `${who} countered ${amt}`.trim();
    case "accept":
      // A system accept is an offer that cleared the floor on its own.
      return e.actor === "system" ? `Accepted instantly ${amt ? `at ${amt}` : ""}`.trim() : `${who} accepted ${amt}`.trim();
    case "decline":
      return `${who} declined`;
    case "withdraw":
      return `${who} withdrew the offer`;
    case "expire":
      return "Offer expired";
    case "redeem":
      return "Deal paid for at checkout";
    default:
      return e.action;
  }
}

function OfferThread({ events }: { events: OfferEvent[] }) {
  if (events.length === 0) return null;
  return (
    <ol className="space-y-1.5">
      {events.map((e, i) => {
        if (e.actor === "system") {
          return (
            <li key={i} className="flex justify-center">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#f1f5f9", color: "#64748b" }}
              >
                {describeEvent(e)} · {formatRelative(e.created_at)}
              </span>
            </li>
          );
        }
        const mine = e.actor === "vendor";
        return (
          <li key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[85%] rounded-[10px] px-2.5 py-1.5"
              style={{
                background: mine ? "#0A2E1A" : "#fff",
                color: mine ? "#fff" : "#1C1C1C",
                border: mine ? "none" : "1px solid #e2e8f0",
                borderBottomRightRadius: mine ? 3 : 10,
                borderBottomLeftRadius: mine ? 10 : 3,
              }}
            >
              <p className="text-[12px] font-semibold">{describeEvent(e)}</p>
              {e.message && (
                <p className="text-[12px] mt-0.5" style={{ opacity: 0.85 }}>
                  &ldquo;{e.message}&rdquo;
                </p>
              )}
              <p className="text-[10px] mt-0.5" style={{ opacity: 0.6 }}>
                {formatRelative(e.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ── Counter composer ──────────────────────────────────────────────────────────

function CounterComposer({
  offer,
  busy,
  onSend,
  onCancel,
}: {
  offer: Offer;
  busy: boolean;
  onSend: (amountKobo: number, message?: string) => void;
  onCancel: () => void;
}) {
  const halfway = suggestedCounter(offer.offer_kobo, offer.list_price_kobo);
  const [naira, setNaira] = useState(String(Math.round(halfway / 100)));
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);
  const amountKobo = Math.round((Number(naira) || 0) * 100);
  const error = counterError(amountKobo, offer);

  const chips: Array<{ label: string; kobo: number }> = [
    { label: "Meet halfway", kobo: halfway },
  ];
  const floor = offer.min_price_kobo;
  if (floor && floor > offer.offer_kobo && floor < offer.list_price_kobo) {
    chips.push({ label: "Floor price", kobo: floor });
  }
  const fivePctOff = Math.round((offer.list_price_kobo * 0.95) / 100) * 100;
  if (fivePctOff > offer.offer_kobo && fivePctOff < offer.list_price_kobo && fivePctOff !== floor) {
    chips.push({ label: "5% off list", kobo: fivePctOff });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (error) return;
    onSend(amountKobo, message.trim() || undefined);
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[10px] border p-3 space-y-2.5"
      style={{ borderColor: "#bfdbfe", background: "#f8fbff" }}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {chips.map((c) => {
          const active = amountKobo === c.kobo;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => setNaira(String(Math.round(c.kobo / 100)))}
              className="h-6 px-2 rounded-full border text-[11px] font-semibold transition-colors"
              style={{
                borderColor: active ? "#1d4ed8" : "#e2e8f0",
                background: active ? "#dbeafe" : "#fff",
                color: active ? "#1d4ed8" : "#374151",
              }}
            >
              {c.label} · {nairaWhole(c.kobo)}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-start gap-2">
        <div className="relative w-[150px]">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold"
            style={{ color: "#6b7280" }}
          >
            ₦
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={naira}
            autoFocus
            onChange={(e) => setNaira(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-label="Counter amount in naira"
            className="w-full h-9 pl-7 pr-3 rounded-[8px] border text-[13px] font-bold tabular-nums outline-none"
            style={{
              borderColor: touched && error ? "#fca5a5" : "#e2e8f0",
              background: "#fff",
              color: "#1C1C1C",
            }}
          />
        </div>
        <input
          value={message}
          maxLength={500}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a note (optional)"
          className="flex-1 min-w-[160px] h-9 px-3 rounded-[8px] border text-[12px] outline-none"
          style={{ borderColor: "#e2e8f0", background: "#fff", color: "#1C1C1C" }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] flex-1 min-w-[160px]" style={{ color: touched && error ? "#dc2626" : "#6b7280" }}>
          {touched && error
            ? error
            : amountKobo > 0 && !error
              ? `${percentOff(amountKobo, offer.list_price_kobo)}% off your list price${
                  floor && amountKobo < floor ? " — below your usual floor" : ""
                }`
              : "Between their offer and your list price."}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="h-8 px-3 rounded-[7px] text-[12px] font-semibold"
          style={{ color: "#6b7280" }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-1.5 h-8 px-3.5 rounded-[7px] text-[12px] font-bold text-white disabled:opacity-60"
          style={{ background: "#1d4ed8" }}
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Reply className="w-3.5 h-3.5" />}
          Send counter
        </button>
      </div>
    </form>
  );
}

// ── Offer card ────────────────────────────────────────────────────────────────

export function OfferCard({
  offer,
  now,
  onRespond,
}: {
  offer: Offer;
  now: number;
  /** Resolves when the server has answered; rejects with a vendor-readable message. */
  onRespond: (offer: Offer, body: RespondToOfferReq) => Promise<void>;
}) {
  const [mode, setMode] = useState<"idle" | "counter" | "confirm-decline">("idle");
  const [busy, setBusy] = useState<RespondToOfferReq["action"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const off = percentOff(offer.offer_kobo, offer.list_price_kobo);
  const left = OPEN_STATUSES.includes(offer.status) ? timeLeft(offer.expires_at, now) : null;
  const wa = whatsappLink(offer.customer_phone, offerWhatsappText(offer));
  const initials = (offer.customer_name || offer.customer_email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const floor = offer.min_price_kobo;
  const belowFloor = offer.below_floor ?? (floor !== undefined ? offer.offer_kobo < floor : undefined);
  const qty = offer.quantity || 1;

  async function act(body: RespondToOfferReq) {
    setBusy(body.action);
    setError(null);
    try {
      await onRespond(offer, body);
      setMode("idle");
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      className="rounded-[14px] border overflow-hidden"
      style={{ background: "#fff", borderColor: offer.status === "pending" ? "#fed7aa" : "#e2e8f0" }}
    >
      {/* ── Product + status ─────────────────────────── */}
      <div className="flex items-start gap-3 px-4 pt-4">
        <div
          className="w-14 h-14 rounded-[10px] overflow-hidden shrink-0 flex items-center justify-center border"
          style={{ background: "#F0FAF3", borderColor: "#e2e8f0" }}
        >
          {offer.product_image ? (
            <img src={offer.product_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <Package className="w-5 h-5" style={{ color: "#94a3b8" }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[14px] font-bold leading-tight truncate" style={{ color: "#1C1C1C" }}>
              {offer.product_name}
            </p>
            <OfferStatusPill status={offer.status} />
          </div>
          <p className="text-[11px] mt-0.5 flex flex-wrap items-center gap-x-2" style={{ color: "#6b7280" }}>
            <span>
              Qty {qty} · {formatRelative(offer.created_at)}
            </span>
            {left && (
              <span
                className="inline-flex items-center gap-1 font-semibold"
                style={{ color: left.urgent ? "#dc2626" : "#6b7280" }}
              >
                <Clock className="w-3 h-3" /> {left.label}
              </span>
            )}
            {offer.auto_accepted && (
              <span className="font-semibold" style={{ color: "#15803d" }}>
                Instant deal
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Prices ───────────────────────────────────── */}
      <div className="px-4 pt-3 flex flex-wrap items-end gap-x-5 gap-y-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
            List price
          </p>
          <p className="text-[14px] font-semibold tabular-nums line-through" style={{ color: "#94a3b8" }}>
            {nairaWhole(offer.list_price_kobo)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
            Their offer
          </p>
          <p className="flex items-center gap-1.5">
            <span className="text-[20px] font-extrabold tabular-nums" style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}>
              {nairaWhole(offer.offer_kobo)}
            </span>
            {off > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "#fee2e2", color: "#dc2626" }}
              >
                −{off}%
              </span>
            )}
          </p>
        </div>
        {offer.counter_kobo !== undefined && offer.status !== "accepted" && offer.status !== "redeemed" && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
              Your counter
            </p>
            <p className="text-[14px] font-bold tabular-nums" style={{ color: "#1d4ed8" }}>
              {nairaWhole(offer.counter_kobo)}
            </p>
          </div>
        )}
        {offer.agreed_kobo !== undefined && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
              Agreed
            </p>
            <p className="text-[14px] font-bold tabular-nums" style={{ color: "#15803d" }}>
              {nairaWhole(offer.agreed_kobo)}
              {qty > 1 && (
                <span className="text-[11px] font-medium" style={{ color: "#6b7280" }}>
                  {" "}× {qty} = {nairaWhole(offer.agreed_kobo * qty)}
                </span>
              )}
            </p>
          </div>
        )}
        {belowFloor !== undefined && (offer.status === "pending" || offer.status === "countered") && (
          <span
            className="text-[11px] font-semibold px-2 py-1 rounded-[7px]"
            style={
              belowFloor
                ? { background: "#fff7ed", color: "#c2410c" }
                : { background: "#F0FAF3", color: "#1A7A42" }
            }
          >
            {belowFloor
              ? `Below your floor${floor ? ` of ${nairaWhole(floor)}` : ""}`
              : "Above your floor"}
          </span>
        )}
      </div>

      {/* ── Buyer ────────────────────────────────────── */}
      <div
        className="mx-4 mt-3 flex flex-wrap items-center gap-3 rounded-[10px] px-3 py-2.5"
        style={{ background: "#fafafa" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
          style={{ background: "#94a3b8" }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-[160px]">
          <p className="text-[13px] font-semibold truncate" style={{ color: "#1C1C1C" }}>
            {offer.customer_name || "Buyer"}
          </p>
          <p className="text-[11px] flex flex-wrap gap-x-2" style={{ color: "#6b7280" }}>
            <span className="truncate">{offer.customer_email}</span>
            {offer.customer_phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3 h-3" /> {offer.customer_phone}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {/* WhatsApp first, as on Abandoned Carts: it is where these
              conversations actually happen. */}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-[7px] text-[11px] font-semibold"
              style={{ background: "#25D366", color: "#fff" }}
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          )}
          {offer.customer_email && (
            <a
              href={`mailto:${offer.customer_email}?subject=${encodeURIComponent(`Your offer on ${offer.product_name}`)}`}
              className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-[7px] border text-[11px] font-semibold"
              style={{ borderColor: "#e2e8f0", background: "#fff", color: "#374151" }}
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
          )}
        </div>
      </div>

      {/* ── Conversation ─────────────────────────────── */}
      {(offer.events?.length ?? 0) > 0 ? (
        <div className="px-4 pt-3">
          <OfferThread events={offer.events} />
        </div>
      ) : offer.message ? (
        <p className="px-4 pt-3 text-[12px] italic" style={{ color: "#374151" }}>
          &ldquo;{offer.message}&rdquo;
        </p>
      ) : null}

      {/* ── Actions / outcome ───────────────────────── */}
      <div className="px-4 py-3.5 mt-3 border-t space-y-2.5" style={{ borderColor: "#f1f5f9" }}>
        {error && (
          <p className="text-[12px] font-semibold" style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}

        {offer.status === "pending" && mode === "counter" && (
          <CounterComposer
            offer={offer}
            busy={busy === "counter"}
            onSend={(amount_kobo, message) => act({ action: "counter", amount_kobo, message })}
            onCancel={() => setMode("idle")}
          />
        )}

        {(offer.status === "pending" || offer.status === "countered") && mode === "confirm-decline" && (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[12px] flex-1" style={{ color: "#374151" }}>
              Decline this offer? The buyer will be told, and the negotiation closes.
            </p>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="h-8 px-3 rounded-[7px] text-[12px] font-semibold"
              style={{ color: "#6b7280" }}
            >
              Keep it
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => act({ action: "decline" })}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-[7px] text-[12px] font-bold text-white disabled:opacity-60"
              style={{ background: "#dc2626" }}
            >
              {busy === "decline" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Yes, decline
            </button>
          </div>
        )}

        {offer.status === "pending" && mode === "idle" && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!!busy}
              onClick={() => act({ action: "accept" })}
              className="flex items-center gap-1.5 h-9 px-4 rounded-[8px] text-white text-[12px] font-bold transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: "#0A2E1A", boxShadow: "0 2px 8px rgba(26,122,66,0.25)" }}
            >
              {busy === "accept" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Accept {nairaWhole(offer.offer_kobo)}
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => setMode("counter")}
              className="flex items-center gap-1.5 h-9 px-4 rounded-[8px] border text-[12px] font-semibold disabled:opacity-60"
              style={{ borderColor: "#bfdbfe", background: "#fff", color: "#1d4ed8" }}
            >
              <Reply className="w-3.5 h-3.5" /> Counter
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => setMode("confirm-decline")}
              className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] text-[12px] font-semibold disabled:opacity-60 hover:bg-red-50"
              style={{ color: "#dc2626" }}
            >
              <X className="w-3.5 h-3.5" /> Decline
            </button>
          </div>
        )}

        {offer.status === "countered" && mode !== "confirm-decline" && (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[12px] flex-1" style={{ color: "#374151" }}>
              Waiting for the buyer to answer your counter
              {offer.buyer_offers_left > 0
                ? ` — they can accept, decline or come back with ${offer.buyer_offers_left === 1 ? "one more offer" : `up to ${offer.buyer_offers_left} more offers`}.`
                : " — they have no offers left, so it's yes or no."}
            </p>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => setMode("confirm-decline")}
              className="h-8 px-3 rounded-[7px] text-[12px] font-semibold hover:bg-red-50"
              style={{ color: "#dc2626" }}
            >
              Call it off
            </button>
          </div>
        )}

        {offer.status === "accepted" && (
          <p className="text-[12px]" style={{ color: "#15803d" }}>
            Deal agreed at <strong>{nairaWhole(offer.agreed_kobo ?? offer.offer_kobo)}</strong>. The buyer can
            check out at this price{left ? ` for the next ${left.label.replace(" left", "")}` : ""} — it
            shows up in Orders once they pay.
          </p>
        )}

        {offer.status === "redeemed" && (
          <p className="text-[12px]" style={{ color: "#15803d" }}>
            Paid for at {nairaWhole(offer.agreed_kobo ?? offer.offer_kobo)} —{" "}
            <Link href={ROUTES.MERCHANT.ORDERS} className="font-bold underline">
              see it in Orders
            </Link>
            .
          </p>
        )}

        {(offer.status === "declined" || offer.status === "expired" || offer.status === "withdrawn") && (
          <p className="text-[12px]" style={{ color: "#6b7280" }}>
            Closed {formatRelative(offer.updated_at)}.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Skeleton + empty state ────────────────────────────────────────────────────

export function OfferCardSkeleton() {
  return (
    <div
      className="rounded-[14px] border p-4 space-y-3 animate-pulse"
      style={{ background: "#fff", borderColor: "#e2e8f0" }}
    >
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-[10px]" style={{ background: "#f1f5f9" }} />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-48 rounded" style={{ background: "#f1f5f9" }} />
          <div className="h-2.5 w-28 rounded" style={{ background: "#f1f5f9" }} />
        </div>
      </div>
      <div className="flex gap-5">
        <div className="h-8 w-20 rounded" style={{ background: "#f1f5f9" }} />
        <div className="h-8 w-28 rounded" style={{ background: "#f1f5f9" }} />
      </div>
      <div className="h-12 rounded-[10px]" style={{ background: "#f8fafc" }} />
      <div className="flex gap-2">
        <div className="h-9 w-28 rounded-[8px]" style={{ background: "#f1f5f9" }} />
        <div className="h-9 w-24 rounded-[8px]" style={{ background: "#f1f5f9" }} />
      </div>
    </div>
  );
}

const EMPTY_COPY: Record<OfferTab, { title: string; body: string }> = {
  pending: {
    title: "No offers waiting on you",
    body: "When a buyer offers less than your lowest price, it lands here for you to accept, counter or decline.",
  },
  countered: {
    title: "Nothing waiting on buyers",
    body: "Offers you've countered sit here until the buyer answers.",
  },
  accepted: {
    title: "No open deals",
    body: "Offers you accept — and ones that clear your lowest price automatically — wait here until the buyer checks out.",
  },
  closed: {
    title: "No closed offers yet",
    body: "Paid, declined, withdrawn and expired offers end up here.",
  },
};

export function OffersEmptyState({ tab, hasFilter }: { tab: OfferTab; hasFilter: boolean }) {
  const copy = hasFilter
    ? { title: "No matching offers", body: "Try a different buyer or product name." }
    : EMPTY_COPY[tab];
  return (
    <div
      className="flex flex-col items-center justify-center py-16 gap-3 rounded-[14px] border"
      style={{ background: "#fff", borderColor: "#e2e8f0" }}
    >
      <div
        className="w-12 h-12 rounded-[12px] flex items-center justify-center"
        style={{ background: "#fff7ed" }}
      >
        <HandCoins className="w-5 h-5" style={{ color: "#ea580c" }} />
      </div>
      <p className="text-[13px] font-semibold" style={{ color: "#374151" }}>
        {copy.title}
      </p>
      <p className="text-[11px] text-center max-w-[320px]" style={{ color: "#94a3b8" }}>
        {copy.body}
      </p>
      {!hasFilter && tab === "pending" && (
        <Link
          href={ROUTES.MERCHANT.PRODUCTS}
          className="text-[12px] font-bold"
          style={{ color: "#1A7A42" }}
        >
          Make a product negotiable →
        </Link>
      )}
    </div>
  );
}
