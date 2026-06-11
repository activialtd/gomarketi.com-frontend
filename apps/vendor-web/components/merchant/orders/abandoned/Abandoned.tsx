"use client";

import { useState, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  TrendingUp,
  Zap,
  RotateCcw,
} from "lucide-react";
import {
  ABANDONED_ORDERS,
  ABANDONED_STATS,
  type AbandonedOrder,
} from "@/lib/data/orders";
import { fmtNaira } from "@gomarket/shared-utils";
import { AbandonedRow, OutreachModal } from "./helpers";

export default function AbandonedOrdersPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [outreachTargets, setOutreachTargets] = useState<
    AbandonedOrder[] | null
  >(null);
  const [filter, setFilter] = useState<
    "all" | "uncontacted" | "contacted" | "recovered"
  >("all");

  const filtered = useMemo(() => {
    let list = [...ABANDONED_ORDERS];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q),
      );
    }
    if (filter === "uncontacted")
      list = list.filter(
        (o) => !o.recoveryEmailSent && !o.recoverySMSSent && !o.recovered,
      );
    if (filter === "contacted")
      list = list.filter(
        (o) => (o.recoveryEmailSent || o.recoverySMSSent) && !o.recovered,
      );
    if (filter === "recovered") list = list.filter((o) => o.recovered);
    return list;
  }, [search, filter]);

  const allSelected =
    filtered.length > 0 &&
    selected.size === filtered.filter((o) => !o.recovered).length;

  function toggleSelectAll() {
    const eligible = filtered.filter((o) => !o.recovered).map((o) => o.id);
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(eligible));
  }

  function handleBulkOutreach() {
    const targets = ABANDONED_ORDERS.filter((o) => selected.has(o.id));
    if (targets.length) setOutreachTargets(targets);
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
            Abandoned Carts
          </h1>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#fee2e2", color: "#dc2626" }}
          >
            {ABANDONED_STATS.pending} pending
          </span>
        </div>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={handleBulkOutreach}
            className="flex items-center gap-2 h-9 px-4 rounded-[8px] text-white text-[12px] font-bold transition-all"
            style={{
              background: "#1A7A42",
              boxShadow: "0 2px 8px rgba(26,122,66,0.2)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#239452")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
          >
            <Send className="w-3.5 h-3.5" /> Send to {selected.size} selected
          </button>
        )}
      </div>

      <div className="px-6 lg:px-8 py-5 space-y-5">
        {/* ── Stats ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Abandoned carts",
              value: ABANDONED_STATS.total,
              icon: RotateCcw,
              iconBg: "#fee2e2",
              iconColor: "#dc2626",
              sub: fmtNaira(ABANDONED_STATS.totalValue) + " at risk",
            },
            {
              label: "Recovered",
              value: ABANDONED_STATS.recovered,
              icon: CheckCircle2,
              iconBg: "#dcfce7",
              iconColor: "#15803d",
              sub: `${ABANDONED_STATS.recoveryRate}% recovery rate`,
            },
            {
              label: "Not contacted",
              value: ABANDONED_ORDERS.filter(
                (o) =>
                  !o.recoveryEmailSent && !o.recoverySMSSent && !o.recovered,
              ).length,
              icon: AlertTriangle,
              iconBg: "#fef3c7",
              iconColor: "#f59e0b",
              sub: "No outreach sent",
            },
            {
              label: "Value at risk",
              value: fmtNaira(ABANDONED_STATS.totalValue),
              icon: TrendingUp,
              iconBg: "#F0FAF3",
              iconColor: "#1A7A42",
              sub: `${ABANDONED_STATS.pending} open carts`,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 px-4 py-3.5 rounded-[12px] border"
              style={{ background: "#fff", borderColor: "#e2e8f0" }}
            >
              <div
                className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
                style={{ background: s.iconBg }}
              >
                <s.icon className="w-4 h-4" style={{ color: s.iconColor }} />
              </div>
              <div className="min-w-0">
                <p
                  className="text-[18px] font-extrabold leading-tight truncate"
                  style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
                >
                  {s.value}
                </p>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: "#94a3b8" }}
                >
                  {s.label}
                </p>
                {s.sub && (
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: "#6b7280" }}
                  >
                    {s.sub}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Tip banner ────────────────────────────────── */}
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-[10px] border"
          style={{ background: "#fffbeb", borderColor: "rgba(245,158,11,0.2)" }}
        >
          <Zap
            className="w-4 h-4 shrink-0 mt-0.5"
            style={{ color: "#f59e0b" }}
          />
          <div
            className="text-[12px] leading-relaxed"
            style={{ color: "#92400e" }}
          >
            <strong>Recovery tip:</strong> Abandoned carts contacted within 1
            hour convert at 3× the rate of those contacted after 24 hours.
            {ABANDONED_ORDERS.filter(
              (o) => !o.recovered && !o.recoveryEmailSent && !o.recoverySMSSent,
            ).length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const uncontacted = ABANDONED_ORDERS.filter(
                    (o) =>
                      !o.recovered &&
                      !o.recoveryEmailSent &&
                      !o.recoverySMSSent,
                  );
                  setOutreachTargets(uncontacted);
                }}
                className="ml-2 font-bold underline underline-offset-2 hover:no-underline transition-all"
              >
                Send to all{" "}
                {
                  ABANDONED_ORDERS.filter(
                    (o) =>
                      !o.recovered &&
                      !o.recoveryEmailSent &&
                      !o.recoverySMSSent,
                  ).length
                }{" "}
                uncontacted →
              </button>
            )}
          </div>
        </div>

        {/* ── Filters + search ──────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: "#94a3b8" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full h-9 pl-9 pr-3 rounded-[8px] border text-[13px] outline-none transition-all"
              style={{
                borderColor: "#e2e8f0",
                background: "#F0FAF3",
                color: "#1C1C1C",
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "#1A7A42";
                e.currentTarget.style.outline = "2px solid #1A7A42";
                e.currentTarget.style.outlineOffset = "-2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "#F0FAF3";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.outline = "none";
              }}
            />
          </div>
          <div
            className="flex items-center rounded-[8px] border overflow-hidden"
            style={{ borderColor: "#e2e8f0" }}
          >
            {(["all", "uncontacted", "contacted", "recovered"] as const).map(
              (f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className="h-9 px-3 text-[11px] font-semibold capitalize transition-colors"
                  style={{
                    background: filter === f ? "#F0FAF3" : "#fff",
                    color: filter === f ? "#1A7A42" : "#6b7280",
                    borderRight:
                      f !== "recovered" ? "1px solid #e2e8f0" : "none",
                  }}
                >
                  {f}
                </button>
              ),
            )}
          </div>
          <p className="ml-auto text-[12px]" style={{ color: "#94a3b8" }}>
            {filtered.length} cart{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div
          className="rounded-[14px] border overflow-hidden"
          style={{ borderColor: "#e2e8f0" }}
        >
          {/* Header */}
          <div
            className="hidden sm:grid px-4 py-2.5 border-b"
            style={{
              gridTemplateColumns: "20px 32px 1fr 100px 110px 130px 120px 36px",
              gap: "12px",
              background: "#fafafa",
              borderColor: "#e2e8f0",
            }}
          >
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center justify-center"
            >
              <div
                className="w-4 h-4 rounded-[4px] flex items-center justify-center"
                style={{
                  background: allSelected ? "#1A7A42" : "transparent",
                  border: `1.5px solid ${allSelected ? "#1A7A42" : "#d1d5db"}`,
                }}
              >
                {allSelected && (
                  <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                    <path
                      d="M1 3.5l2 2L7 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </button>
            <div />
            {["Customer", "Value", "Source", "Last seen", "Outreach", ""].map(
              (h, i) => (
                <span
                  key={i}
                  className="text-[10px] font-extrabold uppercase tracking-wide"
                  style={{ color: "#94a3b8" }}
                >
                  {h}
                </span>
              ),
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center"
                style={{ background: "#F0FAF3" }}
              >
                <CheckCircle2
                  className="w-5 h-5"
                  style={{ color: "#1A7A42" }}
                />
              </div>
              <p
                className="text-[13px] font-semibold"
                style={{ color: "#374151" }}
              >
                {filter !== "all"
                  ? `No ${filter} carts`
                  : search
                    ? `No results for "${search}"`
                    : "No abandoned carts — great work!"}
              </p>
            </div>
          ) : (
            filtered.map((order) => (
              <AbandonedRow
                key={order.id}
                order={order}
                selected={selected.has(order.id)}
                onSelect={() => {
                  if (order.recovered) return;
                  setSelected((prev) => {
                    const next = new Set(prev);
                    next.has(order.id)
                      ? next.delete(order.id)
                      : next.add(order.id);
                    return next;
                  });
                }}
                onOutreach={() => setOutreachTargets([order])}
              />
            ))
          )}
        </div>
      </div>

      {outreachTargets && (
        <OutreachModal
          targets={outreachTargets}
          onClose={() => {
            setOutreachTargets(null);
            setSelected(new Set());
          }}
        />
      )}
    </div>
  );
}
