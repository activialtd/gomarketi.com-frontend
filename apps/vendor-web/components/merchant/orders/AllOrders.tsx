"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Clock,
  RefreshCw,
  Truck,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { type OrderResp, type OrderStatus } from "@gomarket/api-client";
import { OrderRow, StatCard } from "./helpers";
import { fmtNaira } from "@gomarket/shared-utils";
import { useOrders, invalidate } from "@/lib/swr/hooks";

const PAGE_SIZE = 10;

export default function AllOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);

  const { data: ordersData, isLoading: loading, mutate } = useOrders();
  const orders: OrderResp[] = ordersData?.orders ?? [];

  function handleOrderUpdated(updated: OrderResp) {
    // Optimistic update locally then invalidate cache
    mutate(
      (prev) => prev ? { ...prev, orders: prev.orders.map((o) => o.id === updated.id ? updated : o) } : prev,
      { revalidate: false }
    );
    invalidate.orders();
  }

  function handleStatClick(filter: string) {
    setActiveStatFilter((prev) => (prev === filter ? null : filter));
    setStatusFilter(filter === activeStatFilter ? "all" : filter);
    setPage(1);
  }

  const stats = useMemo(() => {
    const out = {
      total: orders.length,
      totalRevenue: orders.reduce((s, o) => s + o.total_kobo, 0),
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const o of orders) {
      if (o.status in out) (out as any)[o.status]++;
    }
    return out;
  }, [orders]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all")
      list = list.filter((o) => o.status === statusFilter);
    return list;
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            Orders
          </h1>
          {!loading && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#F0FAF3", color: "#1A7A42" }}
            >
              {orders.length}
            </span>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-8 py-5 space-y-5">
        {/* ── Stats row ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            label="All orders"
            value={loading ? "—" : stats.total}
            sub={loading ? undefined : fmtNaira(stats.totalRevenue)}
            icon={ShoppingBag}
            iconBg="#F0FAF3"
            iconColor="#1A7A42"
            active={activeStatFilter === null && statusFilter === "all"}
            onClick={() => {
              setStatusFilter("all");
              setActiveStatFilter(null);
              setPage(1);
            }}
          />
          <StatCard
            label="Confirmed"
            value={loading ? "—" : stats.confirmed}
            icon={RefreshCw}
            iconBg="#dbeafe"
            iconColor="#3b82f6"
            active={activeStatFilter === "confirmed"}
            onClick={() => handleStatClick("confirmed")}
          />
          <StatCard
            label="Shipped"
            value={loading ? "—" : stats.shipped}
            icon={Truck}
            iconBg="#e0f2fe"
            iconColor="#0369a1"
            active={activeStatFilter === "shipped"}
            onClick={() => handleStatClick("shipped")}
          />
          <StatCard
            label="Delivered"
            value={loading ? "—" : stats.delivered}
            icon={CheckCircle2}
            iconBg="#dcfce7"
            iconColor="#15803d"
            active={activeStatFilter === "delivered"}
            onClick={() => handleStatClick("delivered")}
          />
          <StatCard
            label="Cancelled"
            value={loading ? "—" : stats.cancelled}
            icon={XCircle}
            iconBg="#fee2e2"
            iconColor="#dc2626"
            active={activeStatFilter === "cancelled"}
            onClick={() => handleStatClick("cancelled")}
          />
        </div>

        {/* ── Filters ───────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: "#94a3b8" }}
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, order no…"
              className="w-full h-9 pl-9 pr-3 rounded-[8px] border text-[13px] outline-none transition-all"
              style={{
                borderColor: "#e2e8f0",
                background: "#F0FAF3",
                color: "#1C1C1C",
              }}
            />
          </div>
          {(search || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setActiveStatFilter(null);
                setPage(1);
              }}
              className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] border text-[12px] font-semibold transition-colors"
              style={{
                borderColor: "#fca5a5",
                background: "#fff",
                color: "#dc2626",
              }}
            >
              <XCircle className="w-3.5 h-3.5" /> Clear
            </button>
          )}
          <p className="ml-auto text-[12px]" style={{ color: "#94a3b8" }}>
            {filtered.length} order{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── Table ─────────────────────────────────────── */}
        <div
          className="rounded-[14px] border overflow-hidden"
          style={{ borderColor: "#e2e8f0" }}
        >
          <div
            className="hidden sm:grid px-4 py-2.5 border-b"
            style={{
              gridTemplateColumns: "32px 1fr 120px 110px 110px 36px",
              gap: "12px",
              background: "#fafafa",
              borderColor: "#e2e8f0",
            }}
          >
            <div />
            {["Order / Customer", "Amount", "Status", "Date"].map((h) => (
              <span
                key={h}
                className="text-[10px] font-extrabold uppercase tracking-wide"
                style={{ color: "#94a3b8" }}
              >
                {h}
              </span>
            ))}
            <div />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2" style={{ color: "#94a3b8" }}>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[13px]">Loading orders…</span>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center"
                style={{ background: "#F0FAF3" }}
              >
                <Clock className="w-5 h-5" style={{ color: "#1A7A42" }} />
              </div>
              <p
                className="text-[13px] font-semibold"
                style={{ color: "#374151" }}
              >
                {search ? `No orders match "${search}"` : "No orders yet"}
              </p>
              <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                {search
                  ? "Try a different search"
                  : "Orders will appear here once customers start buying from your storefront"}
              </p>
            </div>
          ) : (
            paginated.map((order) => (
              <OrderRow key={order.id} order={order} onUpdated={handleOrderUpdated} />
            ))
          )}
        </div>

        {/* ── Pagination ────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-[12px]" style={{ color: "#6b7280" }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-3 rounded-[7px] border text-[12px] font-medium transition-colors disabled:opacity-40"
                style={{
                  borderColor: "#e2e8f0",
                  background: "#fff",
                  color: "#374151",
                }}
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="h-8 w-8 rounded-[7px] border text-[12px] font-semibold transition-colors"
                  style={{
                    borderColor: page === p ? "#1A7A42" : "#e2e8f0",
                    background: page === p ? "#1A7A42" : "#fff",
                    color: page === p ? "#fff" : "#374151",
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 px-3 rounded-[7px] border text-[12px] font-medium transition-colors disabled:opacity-40"
                style={{
                  borderColor: "#e2e8f0",
                  background: "#fff",
                  color: "#374151",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
