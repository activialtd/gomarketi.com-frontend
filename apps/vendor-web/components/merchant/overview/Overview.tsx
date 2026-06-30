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
  Copy,
  Check,
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  Globe,
  ArrowRight,
  Plus,
  BarChart3,
  Wallet,
  CreditCard,
  Store,
  Loader2,
  InboxIcon,
  ShieldCheck,
  Star,
  Zap,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { CustomTooltip } from "./helpers";
import {
  analyticsApi,
  ordersApi,
  storefrontApi,
  type AnalyticsOverviewResp,
  type OrderResp,
  type StoreResp,
} from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { ORDER_STATUS_CONFIG } from "@gomarket/shared-utils";
import Link from "next/link";
import { ROUTES } from "@/lib/config/routes";

const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN ?? "gomarketi.com";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Static data ──────────────────────────────────────────────────────────────

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

const QUICK_ACTIONS = [
  {
    icon: Plus,
    label: "Add Product",
    sub: "List a new item",
    href: ROUTES.MERCHANT.PRODUCTS_NEW,
    color: "#1A7A42",
  },
  {
    icon: Store,
    label: "Update Store",
    sub: "Edit store details",
    href: ROUTES.MERCHANT.STORE_INFO,
    color: "#3b82f6",
  },
  {
    icon: Globe,
    label: "View Storefront",
    sub: "See customer view",
    href: "#",
    color: "#8b5cf6",
    external: true,
  },
  {
    icon: BarChart3,
    label: "Analytics",
    sub: "Sales & traffic data",
    href: ROUTES.MERCHANT.ANALYTICS,
    color: "#f59e0b",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function koboToNaira(kobo: number) {
  return (
    "₦" +
    (kobo / 100).toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

function formatOrderDate(iso: string) {
  const d = new Date(iso);
  const diffHrs = (Date.now() - d.getTime()) / 3600000;
  if (diffHrs < 24)
    return `Today, ${d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffHrs < 48)
    return `Yesterday, ${d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  loading,
}: {
  label: string;
  value: string | null;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: string;
  loading: boolean;
}) {
  return (
    <div
      className="rounded-[14px] border p-4 flex flex-col justify-between gap-3"
      style={{ background: "#fff", borderColor: "#e2e8f0" }}
    >
      <div className="flex items-start justify-between">
        <p
          className="text-[10px] font-extrabold uppercase tracking-[0.12em]"
          style={{ color: "#94a3b8" }}
        >
          {label}
        </p>
        <div
          className="w-8 h-8 rounded-[9px] flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
        </div>
      </div>
      {loading || value === null ? (
        <div
          className="h-8 w-20 rounded-[6px] animate-pulse"
          style={{ background: "#f1f5f9" }}
        />
      ) : (
        <p
          className="text-[26px] font-extrabold leading-none tracking-tight"
          style={{ color: "#1C1C1C" }}
        >
          {value}
        </p>
      )}
      {trend && (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" style={{ color: "#22c55e" }} />
          <span
            className="text-[11px] font-semibold"
            style={{ color: "#22c55e" }}
          >
            {trend}
          </span>
          <span className="text-[11px]" style={{ color: "#94a3b8" }}>
            vs last month
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [copied, setCopied] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsOverviewResp | null>(
    null,
  );
  const [recentOrders, setRecentOrders] = useState<OrderResp[]>([]);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<StoreResp | null>(null);

  const accountNumber = "9740176746";
  const storefrontUrl = store ? `http://${store.slug}.${STORE_DOMAIN}` : null;

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [ov, ol, st] = await Promise.allSettled([
          analyticsApi.getOverview(accessToken!),
          ordersApi.listOrders({ per_page: 5 }, accessToken!),
          storefrontApi.getMyStore(accessToken!),
        ]);
        if (cancelled) return;
        if (ov.status === "fulfilled") setAnalytics(ov.value);
        if (ol.status === "fulfilled") setRecentOrders(ol.value.orders);
        if (st.status === "fulfilled") setStore(st.value);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  function handleCopy() {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="w-full space-y-5">
      {/* ── ROW 1: Greeting + Store identity + Wallet ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* ── Left: Greeting + Store card ─── */}
        <div
          className="rounded-[16px] border overflow-hidden"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          {/* Green header strip */}
          <div className="px-6 pt-6 pb-5" style={{ background: "#0A2E1A" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-[20px] font-extrabold text-white leading-tight"
                  style={{ letterSpacing: "-0.3px" }}
                >
                  {getGreeting()}{store ? `, ${store.name}` : ""} 👋
                </p>
                <p
                  className="text-[13px] mt-1.5"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  Here's what's happening with your store today.
                </p>
              </div>
              {/* Verification + Rating cluster */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{
                    background: "rgba(34,197,94,0.15)",
                    color: "#86efac",
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified store
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{
                    background: "rgba(245,158,11,0.12)",
                    color: "#fbbf24",
                  }}
                >
                  <Star className="w-3 h-3" fill="#fbbf24" />
                  4.8 · 124 reviews
                </div>
              </div>
            </div>
          </div>

          {/* Store meta row */}
          <div
            className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b"
            style={{ borderColor: "#f1f5f9" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                style={{ background: "#F0FAF3" }}
              >
                <Store className="w-5 h-5" style={{ color: "#1A7A42" }} />
              </div>
              <div>
                <p
                  className="text-[14px] font-extrabold"
                  style={{ color: "#1C1C1C" }}
                >
                  {store?.name ?? "Your store"}
                </p>
                <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                  {store ? `${store.slug}.${STORE_DOMAIN}` : "Set up your store to get a URL"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: "#F0FAF3", color: "#1A7A42" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Active
              </span>
              <a
                href={storefrontUrl ?? "#"}
                target={storefrontUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-disabled={!storefrontUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-bold text-white transition-all hover:opacity-90"
                style={{
                  background: storefrontUrl ? "#1A7A42" : "#cbd5e1",
                  boxShadow: storefrontUrl ? "0 2px 8px rgba(26,122,66,0.25)" : "none",
                  pointerEvents: storefrontUrl ? "auto" : "none",
                }}
              >
                <Globe className="w-3.5 h-3.5" />
                View store
                <ArrowUpRight className="w-3 h-3 opacity-70" />
              </a>
            </div>
          </div>

          {/* Quick actions */}
          <div className="px-6 py-4">
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.12em] mb-3"
              style={{ color: "#94a3b8" }}
            >
              Quick actions
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  href={action.external ? (storefrontUrl ?? "#") : action.href}
                  target={action.external && storefrontUrl ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-2.5 p-3 rounded-[10px] border transition-all hover:border-[#1A7A42] hover:bg-[#F0FAF3] group"
                  style={{
                    borderColor: "#e9eef3", background: "#fafafa",
                    opacity: action.external && !storefrontUrl ? 0.5 : 1,
                    pointerEvents: action.external && !storefrontUrl ? "none" : "auto",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0"
                    style={{ background: `${action.color}14` }}
                  >
                    <action.icon
                      className="w-3.5 h-3.5"
                      style={{ color: action.color }}
                    />
                  </div>
                  <span
                    className="text-[12px] font-semibold leading-tight"
                    style={{ color: "#374151" }}
                  >
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Wallet card ─── */}
        <div
          className="rounded-[16px] border overflow-hidden flex flex-col"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          {/* Green wallet header */}
          <div className="px-5 py-5 flex-1" style={{ background: "#0A2E1A" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Wallet
                  className="w-4 h-4"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  GoMarket Wallet
                </span>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}
              >
                Coming soon
              </span>
            </div>

            <div>
              <p
                className="text-[11px] font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Available balance
              </p>
              <p
                className="text-[30px] font-extrabold text-white leading-none"
                style={{ letterSpacing: "-0.8px", opacity: 0.4 }}
              >
                ₦ — —
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className="text-[11px]"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Wallet payouts launch soon
                </span>
              </div>
            </div>

            {/* Total earnings stat */}
            <div
              className="mt-5 pt-4 border-t"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.1em]"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Total earned
                  </p>
                  <p
                    className="text-[18px] font-extrabold text-white mt-0.5"
                    style={{ letterSpacing: "-0.4px" }}
                  >
                    {analytics
                      ? koboToNaira(analytics.total_revenue_kobo)
                      : "—"}
                  </p>
                </div>
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    background: "rgba(34,197,94,0.15)",
                    color: "#86efac",
                  }}
                >
                  <TrendingUp className="w-3 h-3" />
                  +18.4%
                </div>
              </div>
            </div>
          </div>

          {/* Account strip */}
          <div
            className="px-5 py-3.5 border-t"
            style={{ borderColor: "#f1f5f9" }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CreditCard
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "#6b7280" }}
                />
                <div className="min-w-0">
                  <p
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: "#94a3b8" }}
                  >
                    Settlement account
                  </p>
                  <p
                    className="text-[12px] font-semibold truncate"
                    style={{ color: "#1C1C1C" }}
                  >
                    Paystack-Titan · {accountNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] border text-[11px] font-semibold transition-all shrink-0"
                style={{
                  borderColor: copied ? "#1A7A42" : "#e2e8f0",
                  background: copied ? "#F0FAF3" : "#fff",
                  color: copied ? "#1A7A42" : "#374151",
                }}
              >
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Withdraw CTA */}
          <div className="px-5 pb-4">
            <Link
              href={ROUTES.MERCHANT.WALLET}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-[10px] text-[13px] font-bold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#F0FAF3", color: "#1A7A42" }}
            >
              <Zap className="w-3.5 h-3.5" />
              Withdraw funds
            </Link>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Stats ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={loading ? null : String(analytics?.total_orders ?? 0)}
          icon={ShoppingCart}
          iconColor="#3b82f6"
          iconBg="#eff6ff"
          loading={loading}
        />
        <StatCard
          label="Pending Orders"
          value={loading ? null : String(analytics?.pending_orders ?? 0)}
          icon={Package}
          iconColor="#8b5cf6"
          iconBg="#f5f3ff"
          loading={loading}
        />
        <StatCard
          label="Total Customers"
          value={loading ? null : String(analytics?.total_customers ?? 0)}
          icon={Users}
          iconColor="#f59e0b"
          iconBg="#fffbeb"
          loading={loading}
        />
        <StatCard
          label="Total Revenue"
          value={
            loading ? null : koboToNaira(analytics?.total_revenue_kobo ?? 0)
          }
          icon={TrendingUp}
          iconColor="#1A7A42"
          iconBg="#F0FAF3"
          trend="+18.4%"
          loading={loading}
        />
      </div>

      {/* ── ROW 3: Chart + Recent orders ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5">
        {/* Revenue chart */}
        <div
          className="rounded-[16px] border p-5"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <p
                className="text-[15px] font-extrabold"
                style={{ color: "#1C1C1C" }}
              >
                Revenue overview
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
                Your performance across all channels this year
              </p>
            </div>
            <div
              className="flex items-center gap-4 px-3.5 py-2 rounded-[9px] border text-[12px]"
              style={{ borderColor: "#e2e8f0", background: "#fafafa" }}
            >
              {[
                { label: "Online", value: "₦105,700", color: "#1A7A42" },
                { label: "Offline", value: "₦39,800", color: "#22c55e" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span style={{ color: "#6b7280" }}>{s.label}</span>
                  <span className="font-bold" style={{ color: "#1C1C1C" }}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: "210px" }}>
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
                  strokeWidth={2.5}
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
        </div>

        {/* Recent orders */}
        <div
          className="rounded-[16px] border overflow-hidden"
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
                Last 5 transactions
              </p>
            </div>
            <Link
              href={ROUTES.MERCHANT.ORDERS}
              className="flex items-center gap-1 text-[12px] font-bold transition-colors"
              style={{ color: "#1A7A42" }}
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div
              className="flex items-center justify-center py-16 gap-2"
              style={{ color: "#94a3b8" }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[13px]">Loading…</span>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center"
                style={{ background: "#F0FAF3" }}
              >
                <InboxIcon className="w-5 h-5" style={{ color: "#1A7A42" }} />
              </div>
              <p className="text-[14px] font-bold" style={{ color: "#1C1C1C" }}>
                No orders yet
              </p>
              <p className="text-[12px]" style={{ color: "#6b7280" }}>
                When customers place orders, they'll appear here.
              </p>
            </div>
          ) : (
            <div
              className="divide-y"
              style={{ divideColor: "#f9fafb" } as React.CSSProperties}
            >
              {recentOrders.map((order) => {
                const s = ORDER_STATUS_CONFIG[order.status] ?? {
                  bg: "#f1f5f9",
                  color: "#6b7280",
                  label: order.status,
                };
                const firstItem = order.items[0];
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors cursor-pointer hover:bg-[#fafafa] border-b border-[#f9fafb]"
                  >
                    {/* Order number + customer */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p
                          className="text-[13px] font-bold"
                          style={{ color: "#1C1C1C" }}
                        >
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: s.bg, color: s.color }}
                        >
                          {s.label}
                        </span>
                      </div>
                      <p
                        className="text-[11px] truncate mt-0.5"
                        style={{ color: "#6b7280" }}
                      >
                        {order.customer_name}
                        {firstItem && (
                          <span style={{ color: "#94a3b8" }}>
                            {" "}
                            · {firstItem.name}
                            {order.items.length > 1
                              ? ` +${order.items.length - 1}`
                              : ""}
                          </span>
                        )}
                      </p>
                    </div>
                    {/* Amount + time */}
                    <div className="text-right shrink-0">
                      <p
                        className="text-[13px] font-extrabold tabular-nums"
                        style={{ color: "#1C1C1C" }}
                      >
                        {koboToNaira(order.total_kobo)}
                      </p>
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: "#94a3b8" }}
                      >
                        {formatOrderDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
