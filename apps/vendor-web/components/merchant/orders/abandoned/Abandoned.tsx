"use client";

import { useState, useMemo } from "react";
import { Search, RotateCcw, TrendingUp, Loader2 } from "lucide-react";
import { type AbandonedCartResp } from "@gomarket/api-client";
import { fmtNaira } from "@gomarket/shared-utils";
import { AbandonedRow, AbandonedEmptyState } from "./helpers";
import { useAbandonedCarts } from "@/lib/swr/hooks";

export default function AbandonedOrdersPage() {
  const [search, setSearch] = useState("");
  const { data: cartsData, isLoading: loading } = useAbandonedCarts();
  const carts: AbandonedCartResp[] = cartsData?.carts ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return carts;
    const q = search.toLowerCase();
    return carts.filter((c) => c.customer_email?.toLowerCase().includes(q));
  }, [carts, search]);

  const totalValue = carts.reduce((s, c) => s + c.total_kobo, 0);

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
            Abandoned Carts
          </h1>
          {!loading && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#fee2e2", color: "#dc2626" }}
            >
              {carts.length}
            </span>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-8 py-5 space-y-5">
        {/* ── Stats ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-[12px] border"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
              style={{ background: "#fee2e2" }}
            >
              <RotateCcw className="w-4 h-4" style={{ color: "#dc2626" }} />
            </div>
            <div className="min-w-0">
              <p
                className="text-[18px] font-extrabold leading-tight"
                style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
              >
                {loading ? "—" : carts.length}
              </p>
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "#94a3b8" }}
              >
                Abandoned carts
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-[12px] border"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
              style={{ background: "#F0FAF3" }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: "#1A7A42" }} />
            </div>
            <div className="min-w-0">
              <p
                className="text-[18px] font-extrabold leading-tight"
                style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
              >
                {loading ? "—" : fmtNaira(totalValue)}
              </p>
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "#94a3b8" }}
              >
                Value at risk
              </p>
            </div>
          </div>
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
              placeholder="Search by email…"
              className="w-full h-9 pl-9 pr-3 rounded-[8px] border text-[13px] outline-none transition-all"
              style={{
                borderColor: "#e2e8f0",
                background: "#F0FAF3",
                color: "#1C1C1C",
              }}
            />
          </div>
          <p className="ml-auto text-[12px]" style={{ color: "#94a3b8" }}>
            {filtered.length} cart{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div
          className="rounded-[14px] border overflow-hidden"
          style={{ borderColor: "#e2e8f0" }}
        >
          <div
            className="hidden sm:grid px-4 py-2.5 border-b"
            style={{
              gridTemplateColumns: "1fr 100px 90px 140px",
              gap: "12px",
              background: "#fafafa",
              borderColor: "#e2e8f0",
            }}
          >
            {["Customer", "Value", "Left", ""].map((h, i) => (
              <span
                key={i}
                className="text-[10px] font-extrabold uppercase tracking-wide"
                style={{ color: "#94a3b8" }}
              >
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2" style={{ color: "#94a3b8" }}>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[13px]">Loading abandoned carts…</span>
            </div>
          ) : filtered.length === 0 ? (
            <AbandonedEmptyState hasFilter={!!search} />
          ) : (
            filtered.map((cart) => <AbandonedRow key={cart.id} cart={cart} />)
          )}
        </div>
      </div>
    </div>
  );
}
