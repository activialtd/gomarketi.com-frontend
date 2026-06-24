"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Calendar,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { fmtK } from "@gomarket/shared-utils";
import {
  REVENUE_DATA,
  RANGES,
  KPICard,
  CustomTooltip,
  CATEGORY_DATA,
  TRAFFIC_DATA,
  TOP_PRODUCTS,
} from "./helpers";

export default function Analytics() {
  const [range, setRange] = useState("This month");
  const [rangeOpen, setRangeOpen] = useState(false);

  const totalRevenue = REVENUE_DATA.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = REVENUE_DATA.reduce((s, d) => s + d.orders, 0);

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
            Analytics
          </h1>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setRangeOpen((v) => !v)}
            className="flex items-center gap-2 h-9 px-3.5 rounded-[8px] border text-[12px] font-semibold transition-colors"
            style={{
              borderColor: "#e2e8f0",
              background: "#fff",
              color: "#374151",
            }}
          >
            <Calendar className="w-3.5 h-3.5" style={{ color: "#1A7A42" }} />
            {range}
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform"
              style={{
                color: "#94a3b8",
                transform: rangeOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>
          {rangeOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setRangeOpen(false)}
              />
              <div
                className="absolute top-full right-0 mt-1.5 w-44 rounded-[10px] border shadow-lg py-1 z-20"
                style={{ background: "#fff", borderColor: "#e2e8f0" }}
              >
                {RANGES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRange(r);
                      setRangeOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-[12px] font-medium text-left transition-colors hover:bg-[#F0FAF3]"
                    style={{
                      color: range === r ? "#1A7A42" : "#374151",
                      background: range === r ? "#F0FAF3" : "transparent",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-6 lg:px-8 py-5 space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Total revenue"
            value={fmtK(totalRevenue)}
            change="+24%"
            positive={true}
            sub="vs last period"
            icon={TrendingUp}
            iconBg="#F0FAF3"
            iconColor="#1A7A42"
          />
          <KPICard
            label="Total orders"
            value={String(totalOrders)}
            change="+18%"
            positive={true}
            sub={`${(totalRevenue / totalOrders / 100).toFixed(0)} avg`}
            icon={ShoppingBag}
            iconBg="#dbeafe"
            iconColor="#3b82f6"
          />
          <KPICard
            label="New customers"
            value="7"
            change="+3"
            positive={true}
            sub="this period"
            icon={Users}
            iconBg="#dcfce7"
            iconColor="#15803d"
          />
          <KPICard
            label="Conversion rate"
            value="3.2%"
            change="-0.4%"
            positive={false}
            sub="visits to orders"
            icon={BarChart3}
            iconBg="#fef3c7"
            iconColor="#f59e0b"
          />
        </div>

        {/* Revenue chart + category breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue area chart */}
          <div
            className="lg:col-span-2 rounded-[14px] border p-5"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <p
                  className="text-[15px] font-extrabold"
                  style={{ color: "#1C1C1C" }}
                >
                  Revenue over time
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
                  Monthly revenue in Naira
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-[20px] font-extrabold"
                  style={{ color: "#1A7A42", letterSpacing: "-0.4px" }}
                >
                  {fmtK(totalRevenue)}
                </p>
                <p className="text-[11px]" style={{ color: "#6b7280" }}>
                  YTD total
                </p>
              </div>
            </div>
            <div style={{ height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={REVENUE_DATA}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#1A7A42"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#1A7A42" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      v === 0 ? "0" : `₦${(v / 100000).toFixed(0)}k`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#1A7A42"
                    strokeWidth={2.5}
                    fill="url(#revGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#1A7A42", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category donut */}
          <div
            className="rounded-[14px] border p-5"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <p
              className="text-[15px] font-extrabold mb-1"
              style={{ color: "#1C1C1C" }}
            >
              Sales by category
            </p>
            <p className="text-[12px] mb-4" style={{ color: "#6b7280" }}>
              % of total revenue
            </p>
            <div style={{ height: "160px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {CATEGORY_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => `${v}%`}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {CATEGORY_DATA.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between text-[12px]"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ background: c.color }}
                    />
                    <span style={{ color: "#374151" }}>{c.name}</span>
                  </div>
                  <span className="font-bold" style={{ color: "#1C1C1C" }}>
                    {c.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders bar + top products + traffic */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Weekly traffic */}
          <div
            className="rounded-[14px] border p-5"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <p
              className="text-[15px] font-extrabold mb-1"
              style={{ color: "#1C1C1C" }}
            >
              Storefront visits
            </p>
            <p className="text-[12px] mb-4" style={{ color: "#6b7280" }}>
              This week by day
            </p>
            <div style={{ height: "160px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={TRAFFIC_DATA}
                  margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                  barSize={20}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="visits"
                    name="Visits"
                    fill="#1A7A42"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[12px] mt-3" style={{ color: "#6b7280" }}>
              Total:{" "}
              <strong style={{ color: "#1C1C1C" }}>
                {TRAFFIC_DATA.reduce((s, d) => s + d.visits, 0)} visits
              </strong>{" "}
              this week
            </p>
          </div>

          {/* Top products */}
          <div
            className="lg:col-span-2 rounded-[14px] border p-5"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p
                  className="text-[15px] font-extrabold"
                  style={{ color: "#1C1C1C" }}
                >
                  Top products
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
                  By revenue generated
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {TOP_PRODUCTS.map((p, i) => {
                const maxRev = TOP_PRODUCTS[0].revenue;
                const pct = Math.round((p.revenue / maxRev) * 100);
                return (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-[11px] font-bold w-4 shrink-0"
                          style={{ color: i === 0 ? "#1A7A42" : "#94a3b8" }}
                        >
                          #{i + 1}
                        </span>
                        <p
                          className="text-[12px] font-semibold truncate"
                          style={{ color: "#374151" }}
                        >
                          {p.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className="text-[12px] font-bold"
                          style={{ color: "#1C1C1C" }}
                        >
                          {fmtK(p.revenue)}
                        </span>
                        <span
                          className="text-[10px] font-semibold w-10 text-right"
                          style={{
                            color: p.trend >= 0 ? "#22c55e" : "#ef4444",
                          }}
                        >
                          {p.trend >= 0 ? "+" : ""}
                          {p.trend}%
                        </span>
                      </div>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "#f1f5f9" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background:
                            i === 0
                              ? "#1A7A42"
                              : i === 1
                                ? "#22c55e"
                                : "#86efac",
                        }}
                      />
                    </div>
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ color: "#94a3b8" }}
                    >
                      {p.units} units sold
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
