"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle, Handshake, Loader2, Minus, PartyPopper, Plus, Send, X,
} from "lucide-react";
import { useCart } from "@/lib/cartContext";
import {
  NG_PHONE_RE,
  QUICK_DISCOUNTS,
  discountedKobo,
  fmtNaira,
  minOfferKobo,
  offerErrorMessage,
  offerHref,
  offersApi,
  parseNairaInput,
  readSavedOffers,
  saveOffer,
  type Offer,
} from "@/lib/offers";
import type { StorefrontProduct } from "@/app/storefront/[slug]/page";
import { DealMeter } from "./DealMeter";
import { NairaInput, QuickMessages } from "./OfferInputs";
import { BuyDealButton } from "./BuyDealButton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Sent = { offer: Offer; token: string; savedLocally: boolean; sentAt: number };

/**
 * "Make an offer" — a bottom sheet on phones, a centred dialog from `sm` up.
 *
 * Mounted only while open, so its state starts fresh each time and the saved
 * checkout details (already rehydrated by then) can seed the contact fields.
 */
export function MakeOfferSheet({
  product,
  slug,
  maxQty,
  onClose,
}: {
  product: StorefrontProduct;
  slug: string;
  /** 1–10, already capped to stock by the caller. */
  maxQty: number;
  onClose: () => void;
}) {
  const { customer } = useCart();
  const list = product.price_kobo;
  const floorToSend = minOfferKobo(list);

  const [amountText, setAmountText] = useState("");
  const [qty, setQty] = useState(1);
  const [name, setName] = useState(customer?.fullName ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  // Returning buyers see a one-line "Sending as …" instead of three fields.
  const [editContact, setEditContact] = useState(
    !(customer?.fullName && customer?.email),
  );
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [existingHref, setExistingHref] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);

  // Lock the page behind the sheet, and let Escape close it.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const amount = parseNairaInput(amountText);
  const amountError = useMemo(() => {
    if (!Number.isFinite(amount)) return "Enter how much you would like to pay.";
    if (amount >= list) return `Offer less than ${fmtNaira(list)} — or just buy it at that price.`;
    if (amount < floorToSend) return `The lowest offer you can send is ${fmtNaira(floorToSend)} (half the price).`;
    return "";
  }, [amount, list, floorToSend]);

  const contactErrors = {
    name: name.trim().length < 2 ? "Enter your name" : "",
    email: EMAIL_RE.test(email.trim()) ? "" : "Enter a valid email — replies go there",
    phone: phone.trim() && !NG_PHONE_RE.test(phone.trim()) ? "Enter a valid Nigerian phone number" : "",
  };
  const contactInvalid = !!(contactErrors.name || contactErrors.email || contactErrors.phone);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (amountError || contactInvalid) {
      if (contactInvalid) setEditContact(true);
      return;
    }
    setSending(true);
    setServerError("");
    setExistingHref("");
    try {
      const res = await offersApi.create({
        product_id: product.id,
        amount_kobo: amount,
        quantity: qty,
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim() || undefined,
        message: note.trim() || undefined,
      });
      const savedLocally = saveOffer({
        id: res.offer.id,
        token: res.buyer_token,
        slug,
        product_name: res.offer.product_name || product.name,
        product_id: product.id,
        is_digital: product.is_digital,
      });
      setSent({ offer: res.offer, token: res.buyer_token, savedLocally, sentAt: Date.now() });
    } catch (err) {
      setServerError(offerErrorMessage(err));
      // "You already have an open offer on this" — point at it if this
      // device knows where it is.
      const mine = readSavedOffers().find((o) => o.slug === slug && o.product_id === product.id);
      if (mine) setExistingHref(offerHref(mine.id));
    } finally {
      setSending(false);
    }
  }

  const showAmountError = touched && !!amountError;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="make-offer-title">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[22px] bg-white text-neutral-900 shadow-2xl sm:max-w-[460px] sm:rounded-[22px]">
        {/* Grab handle — reads as a sheet on phones */}
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-neutral-200 sm:hidden" />

        <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-3 sm:pt-5">
          <h2 id="make-offer-title" className="flex items-center gap-2 text-[17px] font-black tracking-tight">
            <Handshake className="h-5 w-5 text-[var(--store-primary,#1A7A42)]" />
            {sent ? (sent.offer.status === "accepted" ? "It's a deal" : "Offer sent") : "Make an offer"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <Outcome sent={sent} isDigital={product.is_digital} onClose={onClose} />
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col" noValidate>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
              {/* Product + list price */}
              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-neutral-50 p-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--store-bg,#F0FAF3)]">
                  {product.images[0] && <img src={product.images[0]} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold">{product.name}</p>
                  <p className="mt-0.5 text-[12px] text-neutral-500">
                    Listed at <span className="font-extrabold text-neutral-900">{fmtNaira(list)}</span>
                  </p>
                </div>
              </div>

              {/* Amount */}
              <label htmlFor="offer-amount" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-500">
                Your offer {maxQty > 1 && <span className="normal-case tracking-normal text-neutral-400">(per item)</span>}
              </label>
              <NairaInput id="offer-amount" value={amountText} onChange={setAmountText} invalid={showAmountError} />
              {showAmountError && <FieldError>{amountError}</FieldError>}

              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_DISCOUNTS.map((pct) => {
                  const k = discountedKobo(list, pct);
                  const on = amount === k;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setAmountText((k / 100).toLocaleString("en-NG"))}
                      className={`rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors ${
                        on
                          ? "border-[var(--store-primary,#1A7A42)] bg-[var(--store-primary,#1A7A42)] text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      −{pct}% <span className={on ? "text-white/80" : "text-neutral-400"}>{fmtNaira(k)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <DealMeter listKobo={list} offerKobo={amountError ? null : amount} />
              </div>

              {/* Quantity */}
              {maxQty > 1 && (
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-500">Quantity</p>
                    {!amountError && qty > 1 && (
                      <p className="mt-0.5 text-[12px] text-neutral-500">
                        {fmtNaira(amount * qty)} in total
                      </p>
                    )}
                  </div>
                  <div className="inline-flex items-center overflow-hidden rounded-[10px] border-[1.5px] border-neutral-200">
                    <button type="button" aria-label="Fewer" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}
                      className="flex h-10 w-10 items-center justify-center bg-neutral-50 text-neutral-700 disabled:text-neutral-300">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-[15px] font-bold">{qty}</span>
                    <button type="button" aria-label="More" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty}
                      className="flex h-10 w-10 items-center justify-center bg-neutral-50 text-neutral-700 disabled:text-neutral-300">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="mt-6">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-500">Your details</p>
                {editContact ? (
                  <div className="flex flex-col gap-2.5">
                    <TextField label="Full name" value={name} onChange={setName} autoComplete="name" error={touched ? contactErrors.name : ""} />
                    <TextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" error={touched ? contactErrors.email : ""} />
                    <TextField label="Phone (optional)" type="tel" value={phone} onChange={setPhone} autoComplete="tel" placeholder="08031234567" error={touched ? contactErrors.phone : ""} />
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-3.5 py-2.5">
                    <p className="min-w-0 truncate text-[13px] text-neutral-600">
                      <span className="font-bold text-neutral-900">{name}</span> · {email}
                    </p>
                    <button type="button" onClick={() => setEditContact(true)} className="shrink-0 text-[12px] font-bold text-[var(--store-primary,#1A7A42)]">
                      Change
                    </button>
                  </div>
                )}
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  The seller&apos;s reply comes to this email. If you agree a price, check out with the same email.
                </p>
              </div>

              {/* Note */}
              <div className="mt-6">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-500">
                  Note to the seller <span className="normal-case tracking-normal text-neutral-400">(optional)</span>
                </p>
                <QuickMessages note={note} onChange={setNote} />
                <textarea
                  rows={2}
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything the seller should know"
                  className="mt-2.5 w-full resize-none rounded-xl border-[1.5px] border-neutral-200 bg-neutral-50 p-3 text-[16px] leading-relaxed outline-none focus:border-[var(--store-primary,#1A7A42)] focus:bg-white sm:text-[14px]"
                />
              </div>

              {serverError && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <div className="min-w-0 text-[13px] text-red-800">
                    <p>{serverError}</p>
                    {existingHref && (
                      <Link href={existingHref} className="mt-1 inline-block font-bold underline">
                        Open your offer
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky action */}
            <div className="shrink-0 border-t border-neutral-100 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              <button
                type="submit"
                disabled={sending}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--store-primary,#1A7A42)] text-[15px] font-extrabold text-white shadow-lg shadow-black/10 transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Sending…" : amountError ? "Send offer" : `Send offer · ${fmtNaira(amount)}`}
              </button>
              <p className="mt-2 text-center text-[11px] text-neutral-400">
                If the seller accepts, the price is held for you for 48 hours.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Outcome({ sent, isDigital, onClose }: { sent: Sent; isDigital: boolean; onClose: () => void }) {
  const { offer, token, savedLocally, sentAt } = sent;
  // Without local storage the link is the only way back, so it keeps the token.
  const href = offerHref(offer.id, savedLocally ? undefined : token);

  if (offer.status === "accepted" && offer.agreed_kobo != null) {
    const hours = Math.max(1, Math.round((new Date(offer.expires_at).getTime() - sentAt) / 3_600_000));
    return (
      <div className="overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center">
        <div className="mx-auto mb-4 mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--store-bg,#F0FAF3)]">
          <PartyPopper className="h-8 w-8 text-[var(--store-primary,#1A7A42)]" />
        </div>
        <p className="text-[22px] font-black leading-tight tracking-tight">
          Deal! {fmtNaira(offer.agreed_kobo)} is yours
          <br className="hidden sm:block" /> for {Number.isFinite(hours) ? hours : 48} hours
        </p>
        <p className="mt-2 text-[13px] text-neutral-500">
          The seller accepted straight away
          {offer.quantity > 1 ? ` — ${offer.quantity} at ${fmtNaira(offer.agreed_kobo)} each` : ""}. Check out
          with <span className="font-semibold text-neutral-700">{offer.customer_email}</span> to use it.
        </p>
        <p className="mt-1 text-[12px] text-neutral-400">
          <s>{fmtNaira(offer.list_price_kobo)}</s> → you save {fmtNaira((offer.list_price_kobo - offer.agreed_kobo) * offer.quantity)}
        </p>
        <BuyDealButton offer={offer} isDigital={isDigital} className="mt-6" />
        <Link href={href} className="mt-3 inline-block text-[13px] font-bold text-[var(--store-primary,#1A7A42)]">
          View deal
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center">
      <div className="mx-auto mb-4 mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--store-bg,#F0FAF3)]">
        <Send className="h-7 w-7 text-[var(--store-primary,#1A7A42)]" />
      </div>
      <p className="text-[20px] font-black leading-tight tracking-tight">
        Offer sent — the vendor usually replies within a few hours
      </p>
      <p className="mt-2 text-[13px] text-neutral-500">
        You offered <span className="font-bold text-neutral-800">{fmtNaira(offer.offer_kobo)}</span>
        {offer.quantity > 1 ? ` each for ${offer.quantity}` : ""}. We&apos;ll email{" "}
        <span className="font-semibold text-neutral-700">{offer.customer_email}</span> when they answer.
      </p>
      <Link
        href={href}
        className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[var(--store-primary,#1A7A42)] text-[15px] font-extrabold text-white hover:opacity-90"
      >
        View your offer
      </Link>
      <button type="button" onClick={onClose} className="mt-3 text-[13px] font-bold text-neutral-500 hover:text-neutral-800">
        Keep shopping
      </button>
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-start gap-1 text-[12px] text-red-600">
      <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
      {children}
    </p>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold text-neutral-700">{label}</span>
      {/* 16px on phones so iOS does not zoom the page on focus */}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`h-11 w-full rounded-[10px] border-[1.5px] bg-neutral-50 px-3.5 text-[16px] text-neutral-900 outline-none transition-colors focus:bg-white focus:border-[var(--store-primary,#1A7A42)] sm:text-[13px] ${
          error ? "border-red-300" : "border-neutral-200"
        }`}
      />
      {error && <FieldError>{error}</FieldError>}
    </label>
  );
}
