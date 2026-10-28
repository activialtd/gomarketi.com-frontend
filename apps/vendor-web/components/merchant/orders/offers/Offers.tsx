"use client";

import { useEffect, useMemo, useState } from "react";
import { mutate as globalMutate } from "swr";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Search } from "lucide-react";
import { ApiError } from "@gomarket/api-client";
import { useOffers, useOfferCounts, invalidate } from "@/lib/swr/hooks";
import { useAuthStore } from "@/store/useAuthStore";
import {
  offersApi,
  type Offer,
  type OfferCounts,
  type OfferListResp,
  type OfferStatus,
  type OfferTab,
  type RespondToOfferReq,
} from "@/lib/api/offers";
import { OfferCard, OfferCardSkeleton, OffersEmptyState } from "./helpers";

const TABS: Array<{ key: OfferTab; label: string }> = [
  { key: "pending", label: "Needs reply" },
  { key: "countered", label: "Waiting on buyer" },
  { key: "accepted", label: "Deals" },
  { key: "closed", label: "Closed" },
];

const HOLD_MS = 48 * 60 * 60 * 1000; // every move restarts the 48h clock

function tabOf(status: OfferStatus): OfferTab {
  if (status === "pending" || status === "countered" || status === "accepted") return status;
  return "closed";
}

/** What the server will most likely send back, so the card can change at once. */
function predictOffer(offer: Offer, body: RespondToOfferReq): Offer {
  const now = new Date();
  const base = {
    ...offer,
    updated_at: now.toISOString(),
    events: [
      ...(offer.events ?? []),
      {
        actor: "vendor" as const,
        action: body.action,
        amount_kobo: body.action === "counter" ? body.amount_kobo : body.action === "accept" ? offer.offer_kobo : undefined,
        message: body.message,
        created_at: now.toISOString(),
      },
    ],
  };
  switch (body.action) {
    case "accept":
      return {
        ...base,
        status: "accepted",
        agreed_kobo: offer.offer_kobo,
        expires_at: new Date(now.getTime() + HOLD_MS).toISOString(),
      };
    case "counter":
      return {
        ...base,
        status: "countered",
        counter_kobo: body.amount_kobo,
        expires_at: new Date(now.getTime() + HOLD_MS).toISOString(),
      };
    case "decline":
      return { ...base, status: "declined" };
  }
}

function shiftCounts(counts: OfferCounts, from: OfferStatus, to: OfferStatus): OfferCounts {
  const a = tabOf(from);
  const b = tabOf(to);
  if (a === b) return counts;
  return { ...counts, [a]: Math.max(0, counts[a] - 1), [b]: counts[b] + 1 };
}

function withOffer(list: OfferListResp | undefined, prev: Offer, next: Offer): OfferListResp | undefined {
  if (!list) return list;
  return {
    ...list,
    offers: list.offers.map((o) => (o.id === next.id ? next : o)),
    counts: shiftCounts(list.counts, prev.status, next.status),
  };
}

// How long an answered card stays put — showing its new state — before the
// list refetches and it moves to its new tab.
const SETTLE_MS = 1500;

export default function OffersPage() {
  const [tab, setTab] = useState<OfferTab>("pending");
  const [search, setSearch] = useState("");
  const { data, isLoading, error, mutate } = useOffers(tab);
  const fallbackCounts = useOfferCounts();
  const counts = data?.counts ?? fallbackCounts;
  const offers = useMemo(() => data?.offers ?? [], [data]);

  // One clock for every card's "time left" instead of an interval each.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return offers;
    const q = search.toLowerCase();
    return offers.filter(
      (o) =>
        o.product_name.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q),
    );
  }, [offers, search]);

  async function respond(offer: Offer, body: RespondToOfferReq) {
    const token = useAuthStore.getState().accessToken;
    if (!token) throw new Error("Your session has expired — sign in again.");
    const predicted = predictOffer(offer, body);

    // Nav badge moves with the card, not a refetch later.
    globalMutate<OfferListResp>(
      "offers:counts",
      (c) => (c ? { ...c, counts: shiftCounts(c.counts, offer.status, predicted.status) } : c),
      { revalidate: false },
    );

    try {
      await mutate(
        async (current) => {
          const saved = await offersApi.respond(offer.id, body, token);
          return withOffer(current, offer, saved);
        },
        {
          optimisticData: (current) => withOffer(current, offer, predicted)!,
          rollbackOnError: true,
          revalidate: false,
        },
      );
    } catch (err) {
      invalidate.offers(); // put the badge back too
      if (err instanceof ApiError && err.status === 409) {
        // The buyer moved first (withdrew, or it expired) — show them the truth.
        throw new Error("This offer changed before your answer arrived. Refreshing…");
      }
      throw err instanceof ApiError ? new Error(err.message) : err;
    }

    setTimeout(() => invalidate.offers(), SETTLE_MS);
  }

  return (
    <div className="w-full">
      {/* ── Header ───────────────────────────────────────── */}
      <div
        className="px-6 lg:px-8 py-4 border-b flex flex-wrap items-center justify-between gap-3"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <div className="flex items-center gap-2.5">
          <h1
            className="text-[20px] font-extrabold"
            style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
          >
            Offers
          </h1>
          {counts && counts.pending > 0 && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#fff7ed", color: "#c2410c" }}
            >
              {counts.pending} need{counts.pending === 1 ? "s" : ""} reply
            </span>
          )}
        </div>
        <p className="text-[12px]" style={{ color: "#6b7280" }}>
          Offers at or above your lowest price are accepted for you. The rest come here.
        </p>
      </div>

      <div className="px-6 lg:px-8 py-5 space-y-5">
        {/* ── Tabs ──────────────────────────────────────── */}
        <div
          className="flex items-center gap-0 border-b overflow-x-auto"
          style={{ borderColor: "#e2e8f0" }}
          role="tablist"
        >
          {TABS.map((t) => {
            const active = tab === t.key;
            const n = counts?.[t.key];
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className="px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5"
                style={{
                  borderColor: active ? "#1A7A42" : "transparent",
                  color: active ? "#1A7A42" : "#6b7280",
                  marginBottom: "-1px",
                }}
              >
                {t.label}
                {n !== undefined && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={
                      t.key === "pending" && n > 0
                        ? { background: "#fff7ed", color: "#c2410c" }
                        : { background: "#F0FAF3", color: "#1A7A42" }
                    }
                  >
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Search ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: "#94a3b8" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search buyer or product…"
              className="w-full h-9 pl-9 pr-3 rounded-[8px] border text-[13px] outline-none transition-all"
              style={{ borderColor: "#e2e8f0", background: "#F0FAF3", color: "#1C1C1C" }}
            />
          </div>
          {!isLoading && (
            <p className="ml-auto text-[12px]" style={{ color: "#94a3b8" }}>
              {filtered.length} offer{filtered.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* ── List ──────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <OfferCardSkeleton key={i} />
            ))}
          </div>
        ) : error && !data ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3 rounded-[14px] border"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <AlertCircle className="w-5 h-5" style={{ color: "#dc2626" }} />
            <p className="text-[13px] font-semibold" style={{ color: "#374151" }}>
              Couldn&apos;t load your offers
            </p>
            <button
              type="button"
              onClick={() => mutate()}
              className="text-[12px] font-bold"
              style={{ color: "#1A7A42" }}
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <OffersEmptyState tab={tab} hasFilter={!!search.trim()} />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
            <AnimatePresence initial={false}>
              {filtered.map((offer) => (
                <motion.div
                  key={offer.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <OfferCard offer={offer} now={now} onRespond={respond} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
