"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  AlertCircle, CheckCircle2, ChevronLeft, Clock, Handshake, Loader2, PartyPopper, XCircle,
} from "lucide-react";
import {
  OPEN_STATUSES,
  fmtNaira,
  getSavedOffersServerSnapshot,
  getSavedOffersSnapshot,
  offerErrorMessage,
  offersApi,
  parseNairaInput,
  saveOffer,
  subscribeSavedOffers,
  timeLeft,
  type Offer,
  type OfferEvent,
  type RespondOfferReq,
} from "@/lib/offers";
import { BuyDealButton } from "./BuyDealButton";
import { DealMeter } from "./DealMeter";
import { NairaInput, QuickMessages } from "./OfferInputs";
import { OfferStatusPill } from "./OfferStatusPill";

const POLL_MS = 15_000;

/**
 * One negotiation, as a conversation. Reached from the offer sheet, from
 * "My offers", or from the backend's email link (`/offers/<id>?token=…`).
 *
 * The token comes from the link when there is one — and is then remembered
 * on this device and dropped from the address bar — otherwise from the
 * offers this device has saved.
 */
export function OfferThread({
  slug,
  id,
  tokenFromUrl,
}: {
  slug: string;
  id: string;
  tokenFromUrl?: string;
}) {
  const saved = useSyncExternalStore(
    subscribeSavedOffers,
    getSavedOffersSnapshot,
    getSavedOffersServerSnapshot,
  );
  const savedEntry = saved.find((o) => o.id === id);
  const token = tokenFromUrl || savedEntry?.token || "";

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loadError, setLoadError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const keptFromUrl = useRef(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const o = await offersApi.get(id, token);
      setOffer(o);
      setLoadError("");
      if (tokenFromUrl && !keptFromUrl.current) {
        keptFromUrl.current = true;
        // Arrived from the email: keep the key on this device so the offer
        // shows under "My offers", then take it out of the address bar so it
        // is not shared along with a screenshot or a copied link.
        const kept = saveOffer({
          id: o.id,
          token: tokenFromUrl,
          slug,
          product_name: o.product_name,
          product_id: o.product_id,
        });
        if (kept) window.history.replaceState(window.history.state, "", window.location.pathname);
      }
    } catch (err) {
      setLoadError(offerErrorMessage(err));
    }
  }, [id, token, tokenFromUrl, slug]);

  const live = !offer || OPEN_STATUSES.includes(offer.status);

  // Poll while the negotiation can still move; stop once it is closed.
  useEffect(() => {
    if (!token || !live) return;
    const tick = () => {
      if (document.visibilityState === "visible") void load();
    };
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [load, token, live]);

  // The countdown.
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [live]);

  if (!token) {
    return (
      <Shell>
        <EmptyState
          title="We can't open this offer here"
          body="Offers are linked to the device you made them on. Use the link in the email we sent you to open it on this one."
        />
      </Shell>
    );
  }

  if (!offer) {
    return (
      <Shell>
        {loadError ? (
          <EmptyState title="Couldn't load this offer" body={loadError} />
        ) : (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--store-primary,#1A7A42)]" />
          </div>
        )}
      </Shell>
    );
  }

  return (
    <Shell>
      <Header offer={offer} now={now} />
      <Thread offer={offer} />
      <Actions
        offer={offer}
        token={token}
        isDigital={savedEntry?.is_digital}
        now={now}
        onUpdated={setOffer}
      />
      {loadError && (
        <p className="mt-3 text-center text-[11px] text-neutral-400">
          Couldn&apos;t refresh just now — showing the last update.
        </p>
      )}
    </Shell>
  );
}

// ── Layout ───────────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  // Own light surface, so the page reads the same inside the dark template.
  return (
    <div className="min-h-[70vh] bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6">
        <Link href="/offers" className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900">
          <ChevronLeft className="h-4 w-4" /> My offers
        </Link>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--store-bg,#F0FAF3)]">
        <Handshake className="h-6 w-6 text-[var(--store-primary,#1A7A42)]" />
      </div>
      <p className="text-[17px] font-extrabold">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-neutral-500">{body}</p>
      <Link href="/shop" className="mt-5 inline-block text-[13px] font-bold text-[var(--store-primary,#1A7A42)]">
        Browse the shop
      </Link>
    </div>
  );
}

function Header({ offer, now }: { offer: Offer; now: number }) {
  const left = timeLeft(offer.expires_at, now);
  const clockCopy =
    offer.status === "accepted"
      ? "Price held for"
      : offer.status === "countered"
        ? "Reply within"
        : offer.status === "pending"
          ? "Seller has"
          : null;

  return (
    <div className="mb-6 rounded-2xl border border-neutral-100 p-4 shadow-sm">
      <div className="flex gap-3">
        <Link href={`/products/${offer.product_id}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--store-bg,#F0FAF3)]">
          {offer.product_image && <img src={offer.product_image} alt="" className="h-full w-full object-cover" />}
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/products/${offer.product_id}`} className="block truncate text-[15px] font-extrabold hover:underline">
            {offer.product_name}
          </Link>
          <p className="mt-0.5 text-[12px] text-neutral-500">
            Listed at {fmtNaira(offer.list_price_kobo)}
            {offer.quantity > 1 && <> · {offer.quantity} items</>}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <OfferStatusPill status={offer.status} />
            {clockCopy && left && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500">
                <Clock className="h-3 w-3" />
                {clockCopy} <span className="tabular-nums text-neutral-800">{left}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Conversation ─────────────────────────────────────────────────────────────

function describe(e: OfferEvent, offer: Offer): string {
  const amt = e.amount_kobo != null ? fmtNaira(e.amount_kobo) : "";
  const buyer = e.actor === "buyer";
  switch (e.action) {
    case "offer":
      return `Offered ${amt}`;
    case "counter":
      return buyer ? `Countered with ${amt}` : `Can do ${amt}`;
    case "accept": {
      const a = amt || (offer.agreed_kobo != null ? fmtNaira(offer.agreed_kobo) : "");
      if (e.actor === "system") return `Instant deal at ${a}`;
      return buyer ? `Accepted ${a}` : `Deal — ${a} it is`;
    }
    case "decline":
      return buyer ? "Declined the counter" : "Declined the offer";
    case "withdraw":
      return "Withdrew the offer";
    case "expire":
      return "This offer expired";
    case "redeem":
      return "Paid — deal complete";
    default:
      return e.action;
  }
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function Thread({ offer }: { offer: Offer }) {
  const events = offer.events?.length
    ? offer.events
    : // Older payloads may not carry events; at least show the opening move.
      [{ actor: "buyer", action: "offer", amount_kobo: offer.offer_kobo, message: offer.message, created_at: offer.created_at } as OfferEvent];

  return (
    <div className="mb-6 flex flex-col gap-3">
      {events.map((e, i) => {
        if (e.actor === "system") {
          return (
            <div key={i} className="flex justify-center">
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-500">
                {describe(e, offer)} · {fmtTime(e.created_at)}
              </span>
            </div>
          );
        }
        const mine = e.actor === "buyer";
        return (
          <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[82%] min-w-0">
              <p className={`mb-1 text-[10.5px] font-semibold text-neutral-400 ${mine ? "text-right" : ""}`}>
                {mine ? "You" : offer.store_name || "Seller"} · {fmtTime(e.created_at)}
              </p>
              <div
                className={`rounded-2xl px-3.5 py-2.5 ${
                  mine
                    ? "rounded-br-md bg-[var(--store-primary,#1A7A42)] text-white"
                    : "rounded-bl-md bg-neutral-100 text-neutral-900"
                }`}
              >
                <p className="text-[14px] font-extrabold">{describe(e, offer)}</p>
                {e.message && (
                  <p className={`mt-1 whitespace-pre-line break-words text-[13px] leading-relaxed ${mine ? "text-white/85" : "text-neutral-600"}`}>
                    {e.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Buyer actions ────────────────────────────────────────────────────────────

function Actions({
  offer,
  token,
  isDigital,
  now,
  onUpdated,
}: {
  offer: Offer;
  token: string;
  isDigital?: boolean;
  now: number;
  onUpdated: (o: Offer) => void;
}) {
  const [busy, setBusy] = useState<RespondOfferReq["action"] | null>(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState<"decline" | "withdraw" | null>(null);
  const [countering, setCountering] = useState(false);
  const [amountText, setAmountText] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);

  async function act(req: RespondOfferReq) {
    setBusy(req.action);
    setError("");
    try {
      const o = await offersApi.respond(offer.id, token, req);
      onUpdated(o);
      setConfirming(null);
      setCountering(false);
      setAmountText("");
      setNote("");
      setTouched(false);
    } catch (err) {
      setError(offerErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  const errorBox = error && (
    <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      <p className="text-[13px] text-red-800">{error}</p>
    </div>
  );

  // A deal past its hold, before the server's sweep has marked it expired:
  // the checkout would refuse it, so do not offer to buy.
  const lapsed = offer.status === "accepted" && !timeLeft(offer.expires_at, now);
  if (lapsed) {
    return (
      <Notice icon={<Clock className="h-5 w-5 text-neutral-400" />} title="This deal has lapsed">
        The agreed price was held for 48 hours. You can still buy at the listed price, or make a new offer from the{" "}
        <Link href={`/products/${offer.product_id}`} className="font-bold text-[var(--store-primary,#1A7A42)] underline">
          product page
        </Link>
        .
      </Notice>
    );
  }

  // ── Deal ──
  if (offer.status === "accepted" && offer.agreed_kobo != null) {
    const saving = (offer.list_price_kobo - offer.agreed_kobo) * offer.quantity;
    return (
      <div className="rounded-2xl bg-[var(--store-bg,#F0FAF3)] p-5 text-center">
        <PartyPopper className="mx-auto mb-2 h-7 w-7 text-[var(--store-primary,#1A7A42)]" />
        <p className="text-[18px] font-black tracking-tight">
          Deal! {fmtNaira(offer.agreed_kobo)}
          {offer.quantity > 1 ? ` each for ${offer.quantity}` : ""} is yours
        </p>
        <p className="mt-1 text-[12px] text-neutral-600">
          <s className="text-neutral-400">{fmtNaira(offer.list_price_kobo)}</s> · you save {fmtNaira(saving)}. Check out with{" "}
          <span className="font-semibold text-neutral-800 break-words">{offer.customer_email}</span>.
        </p>
        <BuyDealButton offer={offer} isDigital={isDigital} className="mt-4" />
      </div>
    );
  }

  // ── Closed ──
  if (offer.status === "redeemed") {
    return (
      <Notice icon={<CheckCircle2 className="h-5 w-5 text-[var(--store-primary,#1A7A42)]" />} title="You bought this at your price">
        {offer.agreed_kobo != null && <>Paid {fmtNaira(offer.agreed_kobo)}{offer.quantity > 1 ? ` each for ${offer.quantity}` : ""}. </>}
        Your order confirmation was emailed to you.
      </Notice>
    );
  }
  if (offer.status === "declined" || offer.status === "expired" || offer.status === "withdrawn") {
    const title =
      offer.status === "declined" ? "This negotiation was declined" : offer.status === "expired" ? "This offer expired" : "You withdrew this offer";
    return (
      <Notice icon={<XCircle className="h-5 w-5 text-neutral-400" />} title={title}>
        You can still buy it at the listed price, or make a new offer from the{" "}
        <Link href={`/products/${offer.product_id}`} className="font-bold text-[var(--store-primary,#1A7A42)] underline">
          product page
        </Link>
        .
      </Notice>
    );
  }

  const withdrawControl = (
    <ConfirmButton
      label="Withdraw offer"
      confirmLabel="Yes, withdraw"
      confirming={confirming === "withdraw"}
      busy={busy === "withdraw"}
      onAsk={() => setConfirming("withdraw")}
      onCancel={() => setConfirming(null)}
      onConfirm={() => void act({ action: "withdraw" })}
    />
  );

  // ── Waiting on the vendor ──
  if (offer.status === "pending") {
    return (
      <div>
        <div className="rounded-2xl border border-neutral-100 p-4 text-center">
          <p className="text-[14px] font-bold">Waiting for the seller</p>
          <p className="mt-1 text-[12.5px] text-neutral-500">
            Sellers usually reply within a few hours. This page updates by itself, and we&apos;ll email you too.
          </p>
        </div>
        <div className="mt-3 flex justify-center">{withdrawControl}</div>
        {errorBox}
      </div>
    );
  }

  // ── Countered: the buyer's move ──
  const counter = offer.counter_kobo ?? offer.list_price_kobo;
  const amount = parseNairaInput(amountText);
  const counterError = !Number.isFinite(amount)
    ? "Enter your new offer."
    : amount <= offer.offer_kobo
      ? `Go higher than your last offer of ${fmtNaira(offer.offer_kobo)}.`
      : amount >= counter
        ? `That's not below the seller's ${fmtNaira(counter)} — accept it instead.`
        : "";
  const left = offer.buyer_offers_left;

  return (
    <div>
      <div className="rounded-2xl border-2 border-[var(--store-primary,#1A7A42)]/30 p-4 sm:p-5">
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-neutral-500">The seller&apos;s counter</p>
        <p className="mt-1 text-[28px] font-black tracking-tight text-[var(--store-primary,#1A7A42)]">
          {fmtNaira(counter)}
          {offer.quantity > 1 && <span className="ml-1 text-[14px] font-bold text-neutral-400">each</span>}
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={!!busy}
            onClick={() => void act({ action: "accept" })}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--store-primary,#1A7A42)] text-[15px] font-extrabold text-white hover:opacity-90 disabled:opacity-60"
          >
            {busy === "accept" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Accept {fmtNaira(counter)}
          </button>
          <button
            type="button"
            disabled={!!busy || left <= 0}
            onClick={() => setCountering((c) => !c)}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border-[1.5px] border-neutral-200 bg-white text-[14px] font-bold text-neutral-800 hover:border-neutral-300 disabled:opacity-50"
          >
            <Handshake className="h-4 w-4" />
            {left > 0 ? "Counter back" : "No offers left"}
          </button>
        </div>
        <p className="mt-2 text-center text-[11.5px] text-neutral-500">
          {left > 0
            ? `You have ${left} ${left === 1 ? "offer" : "offers"} left in this negotiation.`
            : "You've used all your offers — accept the counter or decline it."}
        </p>

        {countering && left > 0 && (
          <form
            className="mt-4 border-t border-neutral-100 pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              setTouched(true);
              if (counterError) return;
              void act({ action: "counter", amount_kobo: amount, message: note.trim() || undefined });
            }}
            noValidate
          >
            <label htmlFor="counter-amount" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-500">
              Your new offer
            </label>
            <NairaInput id="counter-amount" value={amountText} onChange={setAmountText} invalid={touched && !!counterError} autoFocus />
            <p className={`mt-1.5 text-[12px] ${touched && counterError ? "text-red-600" : "text-neutral-500"}`}>
              {touched && counterError
                ? counterError
                : `Somewhere between ${fmtNaira(offer.offer_kobo)} and ${fmtNaira(counter)}.`}
            </p>
            <div className="mt-3">
              <DealMeter listKobo={offer.list_price_kobo} offerKobo={counterError ? null : amount} />
            </div>
            <div className="mt-4">
              <QuickMessages note={note} onChange={setNote} />
              <textarea
                rows={2}
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                className="mt-2.5 w-full resize-none rounded-xl border-[1.5px] border-neutral-200 bg-neutral-50 p-3 text-[16px] outline-none focus:border-[var(--store-primary,#1A7A42)] focus:bg-white sm:text-[14px]"
              />
            </div>
            <button
              type="submit"
              disabled={!!busy}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 text-[15px] font-extrabold text-white hover:opacity-90 disabled:opacity-60"
            >
              {busy === "counter" && <Loader2 className="h-4 w-4 animate-spin" />}
              Send {counterError ? "counter" : fmtNaira(amount)}
            </button>
          </form>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <ConfirmButton
          label="Decline counter"
          confirmLabel="Yes, decline"
          confirming={confirming === "decline"}
          busy={busy === "decline"}
          onAsk={() => setConfirming("decline")}
          onCancel={() => setConfirming(null)}
          onConfirm={() => void act({ action: "decline" })}
        />
        {withdrawControl}
      </div>
      {errorBox}
    </div>
  );
}

function ConfirmButton({
  label,
  confirmLabel,
  confirming,
  busy,
  onAsk,
  onCancel,
  onConfirm,
}: {
  label: string;
  confirmLabel: string;
  confirming: boolean;
  busy: boolean;
  onAsk: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!confirming) {
    return (
      <button type="button" onClick={onAsk} className="text-[13px] font-semibold text-neutral-500 underline-offset-2 hover:text-red-600 hover:underline">
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-60"
      >
        {busy && <Loader2 className="h-3 w-3 animate-spin" />}
        {confirmLabel}
      </button>
      <button type="button" onClick={onCancel} className="text-[12px] font-semibold text-neutral-500">
        Cancel
      </button>
    </span>
  );
}

function Notice({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[14px] font-bold">{title}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-500">{children}</p>
      </div>
    </div>
  );
}
