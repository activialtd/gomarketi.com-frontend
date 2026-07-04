"use client";

import {
  TrendingUp, ShoppingBag, Users, AlertTriangle, Package, Loader2,
  Eye, Wallet, Tag,
} from "lucide-react";
import { fmtK } from "@gomarket/shared-utils";
import { KPICard } from "./helpers";
import { useAnalyticsOverview, useTopProducts } from "@/lib/swr/hooks";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie,
} from "recharts";

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <p style={{ fontWeight: 700, color: "#1C1C1C", marginBottom: 2 }}>{label}</p>
      <p style={{ color: "#1A7A42" }}>₦{payload[0].value.toLocaleString("en-NG")}</p>
    </div>
  );
}

function UnitsTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <p style={{ fontWeight: 700, color: "#1C1C1C", marginBottom: 2 }}>{label}</p>
      <p style={{ color: "#3b82f6" }}>{payload[0].value} units</p>
    </div>
  );
}

const BAR_COLORS = ["#1A7A42", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"];

export default function Analytics() {
  const { data: overview, isLoading: loadingOverview } = useAnalyticsOverview();
  const { data: topProducts = [], isLoading: loadingTop } = useTopProducts(5);
  const loading = loadingOverview || loadingTop;

  const barData = topProducts.map((p) => ({
    name: p.name.length > 18 ? p.name.slice(0, 16) + "…" : p.name,
    revenue: Math.round(p.revenue_kobo / 100),
    units: p.units_sold,
  }));

  const completedOrders = Math.max(0, (overview?.total_orders ?? 0) - (overview?.pending_orders ?? 0));
  const statusData = [
    { name: "Completed", value: completedOrders, color: "#1A7A42" },
    { name: "Pending", value: overview?.pending_orders ?? 0, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="px-6 lg:px-8 py-4 border-b flex flex-wrap items-center justify-between gap-3"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <h1 className="text-[20px] font-extrabold" style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}>
          Analytics
        </h1>
      </div>

      <div className="px-6 lg:px-8 py-5 space-y-5">
        {/* KPI row — top 4 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Total revenue"
            value={loading ? "—" : fmtK(overview?.total_revenue_kobo ?? 0)}
            sub="All non-cancelled orders"
            icon={TrendingUp}
            iconBg="#F0FAF3"
            iconColor="#1A7A42"
          />
          <KPICard
            label="Total orders"
            value={loading ? "—" : String(overview?.total_orders ?? 0)}
            sub={
              !loading && overview && overview.total_orders > 0
                ? `${fmtK(overview.total_revenue_kobo / overview.total_orders)} avg`
                : undefined
            }
            icon={ShoppingBag}
            iconBg="#dbeafe"
            iconColor="#3b82f6"
          />
          <KPICard
            label="Customers"
            value={loading ? "—" : String(overview?.total_customers ?? 0)}
            sub="Unique buyers"
            icon={Users}
            iconBg="#dcfce7"
            iconColor="#15803d"
          />
          <KPICard
            label="Pending"
            value={loading ? "—" : String(overview?.pending_orders ?? 0)}
            sub="Awaiting action"
            icon={AlertTriangle}
            iconBg="#fef3c7"
            iconColor="#f59e0b"
          />
        </div>

        {/* Secondary KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard
            label="Storefront visits"
            value={loading ? "—" : String(overview?.storefront_visits_30d ?? 0)}
            sub="Unique sessions · last 30 days"
            icon={Eye}
            iconBg="#f0f9ff"
            iconColor="#0ea5e9"
          />
          <KPICard
            label="Expenses"
            value={loading ? "—" : fmtK(overview?.total_expenses_kobo ?? 0)}
            sub="Total wallet withdrawals"
            icon={Wallet}
            iconBg="#fdf2f8"
            iconColor="#a855f7"
          />
          <KPICard
            label="Discounts given"
            value={loading ? "—" : fmtK(overview?.total_discounts_kobo ?? 0)}
            sub="Total discount value applied"
            icon={Tag}
            iconBg="#fff7ed"
            iconColor="#f97316"
          />
        </div>

        {/* Revenue by product + Order status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Top products horizontal bar chart */}
          <div className="lg:col-span-2 rounded-[14px] border p-5" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
            <p className="text-[15px] font-extrabold" style={{ color: "#1C1C1C" }}>Top products</p>
            <p className="text-[12px] mt-0.5 mb-4" style={{ color: "#6b7280" }}>Revenue generated per product</p>

            {loading ? (
              <div className="flex items-center justify-center gap-2" style={{ height: 200, color: "#94a3b8" }}>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[13px]">Loading…</span>
              </div>
            ) : barData.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2" style={{ height: 200 }}>
                <Package className="w-8 h-8" style={{ color: "#d1fae5" }} />
                <p className="text-[13px] text-center" style={{ color: "#6b7280" }}>
                  No sales yet — charts fill in once orders come through.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart layout="vertical" data={barData} margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
                  <XAxis type="number" hide axisLine={false} tickLine={false} />
                  <YAxis
                    type="category" dataKey="name" width={130}
                    tick={{ fontSize: 11, fill: "#374151" }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<RevenueTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i] ?? "#bbf7d0"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Order status donut */}
          <div className="rounded-[14px] border p-5" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
            <p className="text-[15px] font-extrabold" style={{ color: "#1C1C1C" }}>Order status</p>
            <p className="text-[12px] mt-0.5 mb-2" style={{ color: "#6b7280" }}>Completion breakdown</p>

            {loading ? (
              <div className="flex items-center justify-center" style={{ height: 200, color: "#94a3b8" }}>
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : statusData.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2" style={{ height: 200 }}>
                <ShoppingBag className="w-7 h-7" style={{ color: "#d1fae5" }} />
                <p className="text-[12px] text-center" style={{ color: "#6b7280" }}>No orders yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={statusData} dataKey="value"
                      cx="50%" cy="50%"
                      innerRadius={48} outerRadius={72}
                      strokeWidth={0} paddingAngle={2}
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: unknown) => [String(v), "orders"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 mt-1">
                  {statusData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-[11px]" style={{ color: "#374151" }}>{d.name}</span>
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: "#1C1C1C" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Units sold per product */}
        {!loading && barData.length > 0 && (
          <div className="rounded-[14px] border p-5" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
            <p className="text-[15px] font-extrabold mb-1" style={{ color: "#1C1C1C" }}>Units sold</p>
            <p className="text-[12px] mb-4" style={{ color: "#6b7280" }}>Per product</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={barData} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis hide axisLine={false} tickLine={false} />
                <Tooltip content={<UnitsTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="units" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#3b82f6" : "#bfdbfe"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
