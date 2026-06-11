"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Download,
  RefreshCw,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ShoppingBag,
} from "lucide-react";
import { ORDERS, ORDER_STATS } from "@/lib/data/orders";
import { OrderRow, StatCard } from "./helpers";
import { fmtNaira } from "@gomarket/shared-utils";

const PAGE_SIZE = 10;

export default function AllOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);

  function handleStatClick(filter: string) {
    setActiveStatFilter((prev) => (prev === filter ? null : filter));
    setStatusFilter(filter === activeStatFilter ? "all" : filter);
    setPage(1);
  }

  const filtered = useMemo(() => {
    let list = [...ORDERS];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.customer.phone.includes(q),
      );
    }
    if (statusFilter !== "all")
      list = list.filter((o) => o.status === statusFilter);
    if (paymentFilter !== "all")
      list = list.filter((o) => o.paymentStatus === paymentFilter);
    return list;
  }, [search, statusFilter, paymentFilter]);

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
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#F0FAF3", color: "#1A7A42" }}
          >
            {ORDERS.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] border text-[12px] font-semibold transition-colors"
            style={{
              borderColor: "#e2e8f0",
              background: "#fff",
              color: "#374151",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#F0FAF3")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-5 space-y-5">
        {/* ── Stats row ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="All orders"
            value={ORDER_STATS.total}
            sub={fmtNaira(ORDER_STATS.totalRevenue)}
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
            label="Pending"
            value={ORDER_STATS.pending}
            icon={Clock}
            iconBg="#fef3c7"
            iconColor="#f59e0b"
            active={activeStatFilter === "pending"}
            onClick={() => handleStatClick("pending")}
          />
          <StatCard
            label="Processing"
            value={ORDER_STATS.processing}
            icon={RefreshCw}
            iconBg="#dbeafe"
            iconColor="#3b82f6"
            active={activeStatFilter === "processing"}
            onClick={() => handleStatClick("processing")}
          />
          <StatCard
            label="Shipped"
            value={ORDER_STATS.shipped}
            icon={Truck}
            iconBg="#e0f2fe"
            iconColor="#0369a1"
            active={activeStatFilter === "shipped"}
            onClick={() => handleStatClick("shipped")}
          />
          <StatCard
            label="Delivered"
            value={ORDER_STATS.delivered}
            icon={CheckCircle2}
            iconBg="#dcfce7"
            iconColor="#15803d"
            active={activeStatFilter === "delivered"}
            onClick={() => handleStatClick("delivered")}
          />
          <StatCard
            label="Cancelled"
            value={ORDER_STATS.cancelled}
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
              placeholder="Search by name, order no, phone…"
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
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 rounded-[8px] border text-[12px] font-medium outline-none appearance-none"
            style={{
              borderColor: "#e2e8f0",
              background: "#F0FAF3",
              color: "#374151",
            }}
          >
            <option value="all">All payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Awaiting payment</option>
            <option value="refunded">Refunded</option>
          </select>
          {(search || statusFilter !== "all" || paymentFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPaymentFilter("all");
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
          {/* Header */}
          <div
            className="hidden sm:grid px-4 py-2.5 border-b"
            style={{
              gridTemplateColumns: "32px 1fr 120px 110px 110px 100px 36px",
              gap: "12px",
              background: "#fafafa",
              borderColor: "#e2e8f0",
            }}
          >
            <div />
            {["Order / Customer", "Amount", "Status", "Payment", "Date"].map(
              (h) => (
                <span
                  key={h}
                  className="text-[10px] font-extrabold uppercase tracking-wide"
                  style={{ color: "#94a3b8" }}
                >
                  {h}
                </span>
              ),
            )}
            <div />
          </div>

          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center"
                style={{ background: "#F0FAF3" }}
              >
                <Package className="w-5 h-5" style={{ color: "#1A7A42" }} />
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
                  : "Orders will appear here once customers start buying"}
              </p>
            </div>
          ) : (
            paginated.map((order) => <OrderRow key={order.id} order={order} />)
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
