"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  Globe,
  Zap,
  ArrowRight,
  Plus,
  BarChart3,
  CheckCircle2,
  Clock,
  ChevronRight,
  Wallet,
  CreditCard,
  Store,
  Image as ImageIcon,
  Tag,
  Loader2,
  InboxIcon,
} from "lucide-react";
import { CustomTooltip } from "./overview/helpers";
import { analyticsApi, ordersApi, type AnalyticsOverviewResp, type OrderResp } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { ORDER_STATUS_CONFIG } from "@gomarket/shared-utils";

const CHART_DATA = [
  { month: "Jan", online: 0, offline: 0 },
  { month: "Feb", online: 12400, offline: 4200 },
  { month: "Mar", online: 18700, offline: 6100 },
  { month: "Apr", online: 14200, offline: 8900 },
  { month: "May", online: 31500, offline: 11200 },
  { month: "Jun", online: 28900, offline: 9400 },
  { month: "Jul", online: 0, offline: 0 },
  { month: "Aug", online: 0, offline: 0 },
  { month: "Sep", online: 0, offline: 0 },
  { month: "Oct", online: 0, offline: 0 },
  { month: "Nov", online: 0, offline: 0 },
  { month: "Dec", online: 0, offline: 0 },
];

const TODO_ITEMS = [
  { icon: ImageIcon, label: "Upload a store banner image", done: false },
  { icon: Tag, label: "Add a tagline to your store", done: false },
  { icon: Globe, label: "Activate your storefront", done: false },
  { icon: Package, label: "Add your first product", done: true },
];

const QUICK_ACTIONS = [
  {
    icon: Plus,
    label: "Add Product",
    sub: "List a new item",
    href: "#",
    color: "#1A7A42",
  },
  {
    icon: Store,
    label: "Update Store",
    sub: "Edit store details",
    href: "#",
    color: "#3b82f6",
  },
  {
    icon: Globe,
    label: "View Storefront",
    sub: "See what customers see",
    href: "#",
    color: "#8b5cf6",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    sub: "Sales & traffic data",
    href: "#",
    color: "#f59e0b",
  },
];

function koboToNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatOrderDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHrs = diffMs / (1000 * 60 * 60);
  if (diffHrs < 24) return `Today, ${d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffHrs < 48) return `Yesterday, ${d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function OverviewPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [earningsVisible, setEarningsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsOverviewResp | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderResp[]>([]);
  const [loading, setLoading] = useState(true);

  const accountNumber = "9740176746";
  const balance = "₦248,500.00";
  const earnings = analytics ? koboToNaira(analytics.total_revenue_kobo) : "—";
  const pendingSettlement = "₦18,300.00";

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [ov, ol] = await Promise.allSettled([
          analyticsApi.getOverview(accessToken!),
          ordersApi.listOrders({ per_page: 5 }, accessToken!),
        ]);
        if (cancelled) return;
        if (ov.status === "fulfilled") setAnalytics(ov.value);
        if (ol.status === "fulfilled") setRecentOrders(ol.value.orders);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [accessToken]);

  function handleCopy() {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="w-full space-y-6">
      {/* ── Onboarding banner ─────────────────────────────── */}
      <div
        data-animate
        className="rounded-[12px] border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ background: "#F0FAF3", borderColor: "rgba(26,122,66,0.2)" }}
      >
        <div>
          <p className="text-[14px] font-bold" style={{ color: "#1C1C1C" }}>
            Complete your store setup
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "#3D6B4F" }}>
            Finish a few steps to start accepting orders from customers.
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 h-9 rounded-[8px] text-[13px] font-bold text-white shrink-0 transition-all active:scale-[0.98]"
          style={{
            background: "#1A7A42",
            boxShadow: "0 2px 8px rgba(26,122,66,0.3)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#239452")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
        >
          <CheckCircle2 className="w-4 h-4" />
          Activate storefront
        </button>
      </div>

      {/* ── Top row: Greeting + Wallet + Account + To-do ─── */}
      <div data-animate className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Wallet card */}
        <div
          className="lg:col-span-2 rounded-[14px] border p-5 space-y-4"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-[20px] font-extrabold"
                style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
              >
                Good morning, Akachi 👋
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
                Here's what's happening with your store today.
              </p>
            </div>
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[8px] border text-[11px] font-semibold"
              style={{
                borderColor: "rgba(245,158,11,0.3)",
                background: "rgba(254,243,199,0.6)",
                color: "#92400e",
              }}
            >
              <Zap className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
              14 days left on trial
            </div>
          </div>

          {/* Balance + Earnings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Wallet balance */}
            <div
              className="rounded-[12px] p-4 border"
              style={{
                background: "#F0FAF3",
                borderColor: "rgba(26,122,66,0.15)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Wallet
                    className="w-3.5 h-3.5"
                    style={{ color: "#1A7A42" }}
                  />
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-[0.1em]"
                    style={{ color: "#3D6B4F" }}
                  >
                    Wallet Balance
                  </span>
                </div>
                <button
                  onClick={() => setBalanceVisible((v) => !v)}
                  className="p-1 rounded-[5px] transition-colors hover:bg-white"
                >
                  {balanceVisible ? (
                    <Eye className="w-3.5 h-3.5" style={{ color: "#3D6B4F" }} />
                  ) : (
                    <EyeOff
                      className="w-3.5 h-3.5"
                      style={{ color: "#3D6B4F" }}
                    />
                  )}
                </button>
              </div>
              <p
                className="text-[24px] font-extrabold tracking-tight"
                style={{ color: "#1C1C1C", letterSpacing: "-0.5px" }}
              >
                {balanceVisible ? balance : "₦ • • • • • •"}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <Clock className="w-3 h-3" style={{ color: "#6b7280" }} />
                <span className="text-[11px]" style={{ color: "#6b7280" }}>
                  Pending settlement:{" "}
                  <span className="font-semibold">
                    {balanceVisible ? pendingSettlement : "• • •"}
                  </span>
                </span>
              </div>
            </div>

            {/* Total earnings */}
            <div
              className="rounded-[12px] p-4 border"
              style={{ background: "#fff", borderColor: "#e2e8f0" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <TrendingUp
                    className="w-3.5 h-3.5"
                    style={{ color: "#1A7A42" }}
                  />
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-[0.1em]"
                    style={{ color: "#3D6B4F" }}
                  >
                    Total Earnings
                  </span>
                </div>
                <button
                  onClick={() => setEarningsVisible((v) => !v)}
                  className="p-1 rounded-[5px] transition-colors hover:bg-[#F0FAF3]"
                >
                  {earningsVisible ? (
                    <Eye className="w-3.5 h-3.5" style={{ color: "#3D6B4F" }} />
                  ) : (
                    <EyeOff
                      className="w-3.5 h-3.5"
                      style={{ color: "#3D6B4F" }}
                    />
                  )}
                </button>
              </div>
              <p
                className="text-[24px] font-extrabold tracking-tight"
                style={{ color: "#1C1C1C", letterSpacing: "-0.5px" }}
              >
                {earningsVisible ? earnings : "₦ • • • • • •"}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3" style={{ color: "#22c55e" }} />
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: "#22c55e" }}
                >
                  +18.4%
                </span>
                <span className="text-[11px]" style={{ color: "#6b7280" }}>
                  &nbsp;vs last month
                </span>
              </div>
            </div>
          </div>

          {/* Account details strip */}
          <div
            className="rounded-[10px] border px-4 py-3 flex flex-wrap items-center justify-between gap-2"
            style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
          >
            <div className="flex items-center gap-3">
              <CreditCard
                className="w-4 h-4 shrink-0"
                style={{ color: "#6b7280" }}
              />
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: "#94a3b8" }}
                >
                  Bank Account
                </p>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: "#1C1C1C" }}
                >
                  Paystack-Titan &nbsp;·&nbsp; {accountNumber}
                </p>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border text-[12px] font-semibold transition-all"
              style={{
                borderColor: copied ? "#1A7A42" : "#e2e8f0",
                background: copied ? "#F0FAF3" : "#fff",
                color: copied ? "#1A7A42" : "#374151",
              }}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* To-do + Quick actions */}
        <div className="space-y-4">
          {/* To-do list */}
          <div
            className="rounded-[14px] border p-4"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>
                To-do list
              </p>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#fef3c7", color: "#92400e" }}
              >
                {TODO_ITEMS.filter((t) => !t.done).length} pending
              </span>
            </div>
            <div className="space-y-1">
              {TODO_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-[8px] transition-colors hover:bg-[#F0FAF3] cursor-pointer group"
                >
                  <div
                    className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                    style={{
                      borderColor: item.done ? "#1A7A42" : "#e2e8f0",
                      background: item.done ? "#F0FAF3" : "transparent",
                    }}
                  >
                    {item.done && (
                      <Check className="w-3 h-3" style={{ color: "#1A7A42" }} />
                    )}
                  </div>
                  <span
                    className="text-[12px] font-medium flex-1"
                    style={{
                      color: item.done ? "#94a3b8" : "#374151",
                      textDecoration: item.done ? "line-through" : "none",
                    }}
                  >
                    {item.label}
                  </span>
                  {!item.done && (
                    <ChevronRight
                      className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      style={{ color: "#1A7A42" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div
            className="rounded-[14px] border p-4"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <p
              className="text-[13px] font-bold mb-3"
              style={{ color: "#1C1C1C" }}
            >
              Quick actions
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  className="flex flex-col items-start gap-1.5 p-3 rounded-[10px] border text-left transition-all hover:border-[#1A7A42] hover:bg-[#F0FAF3] group"
                  style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}
                >
                  <div
                    className="w-7 h-7 rounded-[7px] flex items-center justify-center"
                    style={{ background: `${action.color}15` }}
                  >
                    <action.icon
                      className="w-3.5 h-3.5"
                      style={{ color: action.color }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-[12px] font-bold"
                      style={{ color: "#1C1C1C" }}
                    >
                      {action.label}
                    </p>
                    <p className="text-[10px]" style={{ color: "#6b7280" }}>
                      {action.sub}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────── */}
      <div data-animate className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Orders",
            value: loading ? null : String(analytics?.total_orders ?? 0),
            icon: ShoppingCart,
            iconColor: "#3b82f6",
            iconBg: "#eff6ff",
          },
          {
            label: "Pending Orders",
            value: loading ? null : String(analytics?.pending_orders ?? 0),
            icon: Package,
            iconColor: "#8b5cf6",
            iconBg: "#f5f3ff",
          },
          {
            label: "Total Customers",
            value: loading ? null : String(analytics?.total_customers ?? 0),
            icon: Users,
            iconColor: "#f59e0b",
            iconBg: "#fffbeb",
          },
          {
            label: "Total Revenue",
            value: loading ? null : koboToNaira(analytics?.total_revenue_kobo ?? 0),
            icon: Globe,
            iconColor: "#1A7A42",
            iconBg: "#F0FAF3",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[14px] border p-4 flex items-start justify-between"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div>
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.1em] mb-2"
                style={{ color: "#94a3b8" }}
              >
                {stat.label}
              </p>
              {stat.value === null ? (
                <div className="h-7 w-16 rounded-[6px] animate-pulse" style={{ background: "#f1f5f9" }} />
              ) : (
                <p
                  className="text-[26px] font-extrabold leading-none"
                  style={{ color: "#1C1C1C", letterSpacing: "-0.5px" }}
                >
                  {stat.value}
                </p>
              )}
            </div>
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ background: stat.iconBg }}
            >
              <stat.icon
                className="w-4 h-4"
                style={{ color: stat.iconColor }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Business overview chart + top sales ────────────── */}
      <div data-animate className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart — spans 2 cols */}
        <div
          className="lg:col-span-2 rounded-[14px] border p-5"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <p
                className="text-[15px] font-extrabold"
                style={{ color: "#1C1C1C" }}
              >
                Business Overview
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
                Your revenue performance this year
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Sales totals */}
              <div
                className="flex items-center gap-4 px-3 py-1.5 rounded-[8px] border text-[12px]"
                style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}
              >
                {[
                  { label: "Total Sales", value: "₦105,700", color: "#1A7A42" },
                  { label: "Settled", value: "₦87,200", color: "#22c55e" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="flex items-center gap-1 mb-0.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: s.color }}
                      />
                      <span style={{ color: "#6b7280" }}>{s.label}</span>
                    </div>
                    <p className="font-bold" style={{ color: "#1C1C1C" }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={CHART_DATA}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="onlineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A7A42" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1A7A42" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="offlineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                    v === 0 ? "0" : `₦${(v / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="online"
                  name="Online Sales"
                  stroke="#1A7A42"
                  strokeWidth={2}
                  fill="url(#onlineGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#1A7A42", strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="offline"
                  name="Offline Sales"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#offlineGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3">
            {[
              { color: "#1A7A42", label: "Online Sales" },
              { color: "#22c55e", label: "Offline Sales" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: l.color }}
                />
                <span
                  className="text-[12px] font-medium"
                  style={{ color: "#6b7280" }}
                >
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top sales channels */}
        <div
          className="rounded-[14px] border p-5"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p
              className="text-[15px] font-extrabold"
              style={{ color: "#1C1C1C" }}
            >
              Top Channels
            </p>
            <button
              className="text-[11px] font-bold"
              style={{ color: "#1A7A42" }}
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                name: "Storefront",
                value: 61,
                amount: "₦64,277",
                color: "#1A7A42",
              },
              {
                name: "Direct Orders",
                value: 28,
                amount: "₦29,596",
                color: "#3b82f6",
              },
              {
                name: "WhatsApp",
                value: 11,
                amount: "₦11,627",
                color: "#22c55e",
              },
            ].map((ch) => (
              <div key={ch.name}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[12px] font-semibold"
                    style={{ color: "#374151" }}
                  >
                    {ch.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: "#1C1C1C" }}
                    >
                      {ch.amount}
                    </span>
                    <span className="text-[11px]" style={{ color: "#94a3b8" }}>
                      {ch.value}%
                    </span>
                  </div>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "#f1f5f9" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${ch.value}%`, background: ch.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Empty state if no data */}
          <div
            className="mt-6 rounded-[10px] border border-dashed p-4 text-center"
            style={{ borderColor: "#e2e8f0" }}
          >
            <p
              className="text-[12px] font-semibold mb-1"
              style={{ color: "#374151" }}
            >
              Create your first order
            </p>
            <p className="text-[11px] mb-3" style={{ color: "#94a3b8" }}>
              Record a sale to see real channel data
            </p>
            <button
              className="px-4 py-1.5 rounded-[7px] text-[12px] font-bold border transition-colors"
              style={{
                borderColor: "#1A7A42",
                color: "#1A7A42",
                background: "transparent",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#F0FAF3";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              + Record order
            </button>
          </div>
        </div>
      </div>

      {/* ── Recent orders ──────────────────────────────────── */}
      <div
        data-animate
        className="rounded-[14px] border"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "#f1f5f9" }}
        >
          <div>
            <p
              className="text-[15px] font-extrabold"
              style={{ color: "#1C1C1C" }}
            >
              Recent Orders
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
              Your 5 most recent transactions
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 text-[12px] font-bold transition-colors"
            style={{ color: "#1A7A42" }}
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table header */}
        <div
          className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.1em]"
          style={{ color: "#94a3b8", borderBottom: "1px solid #f1f5f9" }}
        >
          <span>Order / Customer</span>
          <span>Product</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Date</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2" style={{ color: "#94a3b8" }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-[13px]">Loading orders…</span>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14">
            <div
              className="w-12 h-12 rounded-[12px] flex items-center justify-center"
              style={{ background: "#F0FAF3" }}
            >
              <InboxIcon className="w-5 h-5" style={{ color: "#1A7A42" }} />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-bold" style={{ color: "#1C1C1C" }}>
                No orders yet
              </p>
              <p className="text-[12px] mt-1" style={{ color: "#6b7280" }}>
                When customers place orders, they'll appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#f9fafb" }}>
            {recentOrders.map((order) => {
              const s = ORDER_STATUS_CONFIG[order.status] ?? { bg: "#f1f5f9", color: "#6b7280", label: order.status };
              const firstItem = order.items[0];
              return (
                <div
                  key={order.id}
                  className="grid grid-cols-1 sm:grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-2 sm:gap-4 px-5 py-3.5 transition-colors hover:bg-[#fafafa] cursor-pointer border-b border-[#f1f5f9]"
                >
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-[11px]" style={{ color: "#6b7280" }}>
                      {order.customer_name}
                    </p>
                  </div>
                  <p className="text-[12px] font-medium self-center" style={{ color: "#374151" }}>
                    {firstItem ? firstItem.name : "—"}
                    {order.items.length > 1 && (
                      <span style={{ color: "#94a3b8" }}> +{order.items.length - 1}</span>
                    )}
                  </p>
                  <p className="text-[13px] font-bold self-center tabular-nums" style={{ color: "#1C1C1C" }}>
                    {koboToNaira(order.total_kobo)}
                  </p>
                  <div className="self-center">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <p className="text-[11px] self-center" style={{ color: "#94a3b8" }}>
                    {formatOrderDate(order.created_at)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
