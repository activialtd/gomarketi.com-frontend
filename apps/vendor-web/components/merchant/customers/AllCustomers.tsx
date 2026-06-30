"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Users, TrendingUp, ArrowUpDown, Loader2 } from "lucide-react";
import { crmApi, type CustomerResp } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { fmtNaira } from "@gomarket/shared-utils";
import { CustomerDrawer, CustomerRow } from "./helpers";

export default function AllCustomers() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [customers, setCustomers] = useState<CustomerResp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<CustomerResp | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    crmApi
      .listCustomers({ per_page: 100 }, accessToken)
      .then((resp) => {
        if (!cancelled) setCustomers(resp.customers);
      })
      .catch(() => {
        if (!cancelled) setCustomers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const filtered = useMemo(() => {
    let list = [...customers];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone ?? "").includes(q),
      );
    }
    list.sort((a, b) =>
      sortAsc
        ? a.total_spent_kobo - b.total_spent_kobo
        : b.total_spent_kobo - a.total_spent_kobo,
    );
    return list;
  }, [customers, search, sortAsc]);

  const totalSpend = customers.reduce((s, c) => s + c.total_spent_kobo, 0);

  return (
    <div className="w-full">
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
          {!loading && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#F0FAF3", color: "#1A7A42" }}
            >
              {customers.length}
            </span>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-8 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-[12px] border"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
              style={{ background: "#F0FAF3" }}
            >
              <Users className="w-4 h-4" style={{ color: "#1A7A42" }} />
            </div>
            <div>
              <p
                className="text-[20px] font-extrabold leading-tight"
                style={{ color: "#1C1C1C", letterSpacing: "-0.4px" }}
              >
                {loading ? "—" : customers.length}
              </p>
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "#94a3b8" }}
              >
                Total customers
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-[12px] border"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
              style={{ background: "#dcfce7" }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: "#15803d" }} />
            </div>
            <div>
              <p
                className="text-[20px] font-extrabold leading-tight"
                style={{ color: "#1C1C1C", letterSpacing: "-0.4px" }}
              >
                {loading ? "—" : fmtNaira(totalSpend)}
              </p>
              <p
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: "#94a3b8" }}
              >
                Total spend
              </p>
            </div>
          </div>
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
              placeholder="Search name, email, phone…"
              className="w-full h-9 pl-9 pr-3 rounded-[8px] border text-[13px] outline-none transition-all"
              style={{
                borderColor: "#e2e8f0",
                background: "#F0FAF3",
                color: "#1C1C1C",
              }}
            />
          </div>

          <button
            onClick={() => setSortAsc((v) => !v)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] border text-[12px] font-medium transition-colors ml-auto"
            style={{
              borderColor: "#e2e8f0",
              background: "#fff",
              color: "#374151",
            }}
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
              gridTemplateColumns: "44px 1fr 130px 130px",
              gap: "12px",
              background: "#fafafa",
              borderColor: "#e2e8f0",
            }}
          >
            <div />
            {["Customer", "Total spent", "Last order"].map((h) => (
              <span
                key={h}
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
              <span className="text-[13px]">Loading customers…</span>
            </div>
          ) : filtered.length === 0 ? (
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
              <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                {!search && "Customers appear here after their first order."}
              </p>
            </div>
          ) : (
            filtered.map((c) => (
              <CustomerRow key={c.id} customer={c} onClick={() => setSelected(c)} />
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
