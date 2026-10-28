"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Clock, Handshake, Loader2 } from "lucide-react";
import {
  OPEN_STATUSES,
  fmtNaira,
  forgetOffer,
  offerErrorMessage,
  offersApi,
  timeLeft,
  type Offer,
  type SavedOffer,
} from "@/lib/offers";
import { BuyDealButton } from "./BuyDealButton";
import { OfferStatusPill } from "./OfferStatusPill";
import { useSavedOffers } from "./useSavedOffers";

const REFRESH_MS = 30_000;

type Row = { offer?: Offer; error?: string };

/**
 * "My offers" — every offer made on this device at this store, with its live
 * status. Guests have no account, so this device's saved tokens are the list.
 */
export function OffersList({ slug }: { slug: string }) {
  const mine = useSavedOffers(slug);
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (mine.length === 0) return;
    let cancelled = false;
    async function refresh() {
      if (document.visibilityState !== "visible") return;
      const results = await Promise.allSettled(mine.map((s) => offersApi.get(s.id, s.token)));
      if (cancelled) return;
      setNow(Date.now());
      setRows((prev) => {
        const next = { ...prev };
        results.forEach((r, i) => {
          const id = mine[i].id;
          next[id] =
            r.status === "fulfilled"
              ? { offer: r.value }
              // Keep the last good copy through a blip; only show the error
              // when there was never anything to show.
              : prev[id]?.offer
                ? prev[id]
                : { error: offerErrorMessage(r.reason) };
        });
        return next;
      });
    }
    const first = setTimeout(() => void refresh(), 0);
    const timer = setInterval(() => void refresh(), REFRESH_MS);
    const onVis = () => void refresh();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearTimeout(first);
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [mine]);

  // Offers that need the buyer first, then live ones, then closed.
  const sorted = useMemo(() => {
    const rank = (s: SavedOffer) => {
      const st = rows[s.id]?.offer?.status;
      if (st === "countered" || st === "accepted") return 0;
      if (st && OPEN_STATUSES.includes(st)) return 1;
      return 2;
    };
    return [...mine].sort((a, b) => rank(a) - rank(b));
  }, [mine, rows]);

  return (
    <div className="min-h-[70vh] bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-2xl px-4 pb-20 pt-8 sm:px-6">
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
          <Handshake className="h-6 w-6 text-[var(--store-primary,#1A7A42)]" /> My offers
        </h1>
        <p className="mt-1.5 text-[13px] text-neutral-500">
          Offers you&apos;ve made at this store from this device. Made one somewhere else? Open the link in the email we sent you.
        </p>

        {mine.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[16px] font-extrabold">No offers yet</p>
            <p className="mx-auto mt-2 max-w-sm text-[13px] text-neutral-500">
              Look for items marked <span className="font-bold text-[var(--store-primary,#1A7A42)]">Negotiable</span> and tap
              “Make an offer” to name your price.
            </p>
            <Link href="/shop" className="mt-5 inline-block text-[13px] font-bold text-[var(--store-primary,#1A7A42)]">
              Browse the shop
            </Link>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {sorted.map((s) => (
              <OfferRow key={s.id} saved={s} row={rows[s.id]} now={now} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function OfferRow({ saved, row, now }: { saved: SavedOffer; row?: Row; now: number }) {
  const offer = row?.offer;
  const href = `/offers/${saved.id}`;

  if (!offer) {
    return (
      <li className="rounded-2xl border border-neutral-100 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-bold">{saved.product_name}</p>
            {row?.error ? (
              <p className="mt-0.5 text-[12px] text-red-600">{row.error}</p>
            ) : (
              <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-neutral-400">
                <Loader2 className="h-3 w-3 animate-spin" /> Checking status…
              </p>
            )}
          </div>
          {row?.error && (
            <button type="button" onClick={() => forgetOffer(saved.id)} className="shrink-0 text-[12px] font-semibold text-neutral-400 hover:text-neutral-700">
              Remove
            </button>
          )}
        </div>
      </li>
    );
  }

  const left = OPEN_STATUSES.includes(offer.status) ? timeLeft(offer.expires_at, now) : null;
  const closed = !OPEN_STATUSES.includes(offer.status);
  const summary =
    offer.status === "accepted" || offer.status === "redeemed"
      ? `Deal at ${fmtNaira(offer.agreed_kobo ?? offer.offer_kobo)}`
      : offer.status === "countered" && offer.counter_kobo != null
        ? `You offered ${fmtNaira(offer.offer_kobo)} · seller says ${fmtNaira(offer.counter_kobo)}`
        : `You offered ${fmtNaira(offer.offer_kobo)}`;

  return (
    <li
      className={`rounded-2xl border p-4 ${
        offer.status === "countered" ? "border-amber-200 bg-amber-50/40" : "border-neutral-100"
      } ${closed ? "opacity-75" : ""}`}
    >
      <Link href={href} className="flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--store-bg,#F0FAF3)]">
          {offer.product_image && <img src={offer.product_image} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold">{offer.product_name}</p>
          <p className="mt-0.5 text-[12px] leading-snug text-neutral-500">
            {summary}
            {offer.quantity > 1 ? ` · ${offer.quantity} items` : ""}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <OfferStatusPill status={offer.status} />
            {left && (
              <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                <Clock className="h-3 w-3" /> <span className="tabular-nums">{left}</span> left
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" />
      </Link>
      {offer.status === "accepted" && left && (
        <BuyDealButton offer={offer} isDigital={saved.is_digital} className="mt-3" />
      )}
      {closed && (
        <div className="mt-2 text-right">
          <button type="button" onClick={() => forgetOffer(saved.id)} className="text-[12px] font-semibold text-neutral-400 hover:text-neutral-700">
            Remove from this list
          </button>
        </div>
      )}
    </li>
  );
}
