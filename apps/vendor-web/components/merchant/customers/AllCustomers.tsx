"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Users,
  Star,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  ArrowUpDown,
} from "lucide-react";
import { CUSTOMERS, CUSTOMER_STATS, type Customer } from "@/lib/data/customers";
import { TAG_CFG, CustomerDrawer, CustomerRow } from "./helpers";

export default function AllCustomers() {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [sortKey, setSortKey] = useState<
    "name" | "totalSpent" | "totalOrders" | "lastOrderAt"
  >("totalSpent");
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    let list = [...CUSTOMERS];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.location.city.toLowerCase().includes(q),
      );
    }
    if (tagFilter !== "all")
      list = list.filter((c) => c.tags.includes(tagFilter as any));
    list.sort((a, b) => {
      const va = a[sortKey] as any,
        vb = b[sortKey] as any;
      if (typeof va === "string")
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });
    return list;
  }, [search, tagFilter, sortKey, sortAsc]);

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="px-6 lg:px-8 py-4 border-b flex flex-wrap items-center justify-between gap-3"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <div className="flex items-center gap-2.5">
          <h1
            className="text-[20px] font-extrabold"
            style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
          >
            Customers
          </h1>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#F0FAF3", color: "#1A7A42" }}
          >
            {CUSTOMERS.length}
          </span>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            {
              label: "Total customers",
              value: CUSTOMER_STATS.total,
              icon: Users,
              iconBg: "#F0FAF3",
              iconColor: "#1A7A42",
            },
            {
              label: "Active",
              value: CUSTOMER_STATS.active,
              icon: TrendingUp,
              iconBg: "#dcfce7",
              iconColor: "#15803d",
            },
            {
              label: "New this month",
              value: CUSTOMER_STATS.new,
              icon: UserPlus,
              iconBg: "#dbeafe",
              iconColor: "#3b82f6",
            },
            {
              label: "VIP",
              value: CUSTOMER_STATS.vip,
              icon: Star,
              iconBg: "#fef3c7",
              iconColor: "#f59e0b",
            },
            {
              label: "At risk",
              value: CUSTOMER_STATS.atRisk,
              icon: AlertTriangle,
              iconBg: "#fee2e2",
              iconColor: "#dc2626",
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
              <div>
                <p
                  className="text-[20px] font-extrabold leading-tight"
                  style={{ color: "#1C1C1C", letterSpacing: "-0.4px" }}
                >
                  {s.value}
                </p>
                <p
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: "#94a3b8" }}
                >
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: "#94a3b8" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone, city…"
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
            {[
              { v: "all", l: "All" },
              { v: "vip", l: "VIP" },
              { v: "repeat", l: "Repeat" },
              { v: "new", l: "New" },
              { v: "at-risk", l: "At risk" },
            ].map((f) => (
              <button
                key={f.v}
                type="button"
                onClick={() => setTagFilter(f.v)}
                className="h-9 px-3 text-[11px] font-semibold transition-colors"
                style={{
                  background: tagFilter === f.v ? "#F0FAF3" : "#fff",
                  color: tagFilter === f.v ? "#1A7A42" : "#6b7280",
                  borderRight: f.v !== "at-risk" ? "1px solid #e2e8f0" : "none",
                }}
              >
                {f.l}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const k = sortKey === "totalSpent" ? "totalSpent" : "totalSpent";
              setSortAsc((v) => !v);
            }}
            className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] border text-[12px] font-medium transition-colors ml-auto"
            style={{
              borderColor: "#e2e8f0",
              background: "#fff",
              color: "#374151",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#F0FAF3")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />{" "}
            {sortAsc ? "Lowest spend" : "Highest spend"}
          </button>

          <p className="text-[12px]" style={{ color: "#94a3b8" }}>
            {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Table */}
        <div
          className="rounded-[14px] border overflow-hidden"
          style={{ borderColor: "#e2e8f0" }}
        >
          <div
            className="hidden sm:grid px-4 py-2.5 border-b"
            style={{
              gridTemplateColumns: "44px 1fr 130px 130px 100px 80px 40px",
              gap: "12px",
              background: "#fafafa",
              borderColor: "#e2e8f0",
            }}
          >
            <div />
            {["Customer", "Location", "Total spent", "Last order", "Tags"].map(
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

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center"
                style={{ background: "#F0FAF3" }}
              >
                <Users className="w-5 h-5" style={{ color: "#1A7A42" }} />
              </div>
              <p
                className="text-[13px] font-semibold"
                style={{ color: "#374151" }}
              >
                {search ? `No customers match "${search}"` : "No customers yet"}
              </p>
            </div>
          ) : (
            filtered.map((c) => (
              <CustomerRow
                key={c.id}
                customer={c}
                onClick={() => setSelected(c)}
              />
            ))
          )}
        </div>
      </div>

      {selected && (
        <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
