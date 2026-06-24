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
import { analyticsApi, ordersApi, storefrontApi, type AnalyticsOverviewResp, type OrderResp, type StoreResp } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { ORDER_STATUS_CONFIG } from "@gomarket/shared-utils";

const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN ?? "gomarketi.com";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

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

const BASE_TODO = [
  { icon: ImageIcon, label: "Upload a store banner image", key: "banner" },
  { icon: Tag, label: "Add a tagline to your store", key: "tagline" },
  { icon: Globe, label: "Activate your storefront", key: "activate" },
  { icon: Package, label: "Add your first product", key: "product" },
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
  const [earningsVisible, setEarningsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsOverviewResp | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderResp[]>([]);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<StoreResp | null>(null);
  const [storefrontActivated, setStorefrontActivated] = useState(false);
  const [activating, setActivating] = useState(false);

  const hasRevenue = (analytics?.total_revenue_kobo ?? 0) > 0;
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
        if (st.status === "fulfilled") {
          setStore(st.value);
          const key = `sf_activated:${st.value.slug}`;
          setStorefrontActivated(localStorage.getItem(key) === "1");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [accessToken]);

  function handleActivate() {
    if (!store) return;
    setActivating(true);
    localStorage.setItem(`sf_activated:${store.slug}`, "1");
    setTimeout(() => {
      setStorefrontActivated(true);
      setActivating(false);
    }, 800);
  }

  function handleCopy() {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="w-full space-y-6">
      {/* ── Onboarding banner / storefront activated ─────── */}
      {storefrontActivated && storefrontUrl ? (
        <div
          data-animate
          className="rounded-[12px] border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ background: "#F0FAF3", borderColor: "rgba(26,122,66,0.2)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#1A7A42" }}>
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[14px] font-bold" style={{ color: "#1C1C1C" }}>
                Your storefront is live 🎉
              </p>
              <p className="text-[12px] mt-0.5 font-mono" style={{ color: "#3D6B4F" }}>
                {storefrontUrl}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 h-8 rounded-[7px] border text-[12px] font-bold transition-colors"
              style={{ borderColor: "#1A7A42", color: "#1A7A42", background: "#fff" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#F0FAF3")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </a>
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 h-8 rounded-[7px] text-[12px] font-bold text-white transition-colors"
              style={{ background: "#1A7A42" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#239452")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
            >
              <ExternalLink className="w-3.5 h-3.5" /> View store
            </a>
          </div>
        </div>
      ) : (
        <div
          data-animate
          className="rounded-[12px] border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ background: "#F0FAF3", borderColor: "rgba(26,122,66,0.2)" }}
        >
          <div>
            <p className="text-[14px] font-bold" style={{ color: "#1C1C1C" }}>
              {store ? `${store.name} is ready — activate your storefront` : "Complete your store setup"}
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "#3D6B4F" }}>
              {store
                ? `Your store URL will be ${store.slug}.${STORE_DOMAIN}`
                : "Finish a few steps to start accepting orders from customers."}
            </p>
          </div>
          <button
            onClick={handleActivate}
            disabled={activating || !store}
            className="flex items-center gap-2 px-4 h-9 rounded-[8px] text-[13px] font-bold text-white shrink-0 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: "#1A7A42", boxShadow: "0 2px 8px rgba(26,122,66,0.3)" }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#239452")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
          >
            {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {activating ? "Activating…" : "Activate storefront"}
          </button>
        </div>
      )}

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
                {getGreeting()}{store ? `, ${store.name}` : ""} 👋
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

          {/* Revenue cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Total earnings */}
            <div
              className="rounded-[12px] p-4 border"
              style={{ background: "#F0FAF3", borderColor: "rgba(26,122,66,0.15)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" style={{ color: "#1A7A42" }} />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.1em]" style={{ color: "#3D6B4F" }}>
                    Total Revenue
                  </span>
                </div>
                {hasRevenue && (
                  <button onClick={() => setEarningsVisible((v) => !v)} className="p-1 rounded-[5px] transition-colors hover:bg-white">
                    {earningsVisible
                      ? <Eye className="w-3.5 h-3.5" style={{ color: "#3D6B4F" }} />
                      : <EyeOff className="w-3.5 h-3.5" style={{ color: "#3D6B4F" }} />}
                  </button>
                )}
              </div>
              {loading ? (
                <div className="h-8 w-24 rounded-[6px] animate-pulse" style={{ background: "rgba(26,122,66,0.1)" }} />
              ) : hasRevenue ? (
                <>
                  <p className="text-[24px] font-extrabold tracking-tight" style={{ color: "#1C1C1C", letterSpacing: "-0.5px" }}>
                    {earningsVisible ? koboToNaira(analytics!.total_revenue_kobo) : "₦ • • • • •"}
                  </p>
                  <p className="text-[11px] mt-1.5" style={{ color: "#3D6B4F" }}>From {analytics!.total_orders} orders</p>
                </>
              ) : (
                <>
                  <p className="text-[22px] font-extrabold" style={{ color: "#94a3b8", letterSpacing: "-0.4px" }}>₦0.00</p>
                  <p className="text-[11px] mt-1.5" style={{ color: "#94a3b8" }}>No sales recorded yet</p>
                </>
              )}
            </div>

            {/* Wallet — coming soon */}
            <div
              className="rounded-[12px] p-4 border flex flex-col justify-between"
              style={{ background: "#fff", borderColor: "#e2e8f0" }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <Wallet className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.1em]" style={{ color: "#94a3b8" }}>
                  Wallet Balance
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[22px] font-extrabold" style={{ color: "#94a3b8", letterSpacing: "-0.4px" }}>— —</p>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] self-start text-[11px] font-semibold"
                  style={{ background: "#fef3c7", color: "#92400e" }}
                >
                  <Zap className="w-3 h-3" style={{ color: "#f59e0b" }} />
                  Wallet coming soon
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* To-do + Quick actions */}
        <div className="space-y-4">
          {/* To-do list */}
          <div className="rounded-[14px] border p-4" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>To-do list</p>
              {(() => {
                const pending = BASE_TODO.filter(t => t.key === "activate" ? !storefrontActivated : t.key === "product" ? false : true).length;
                return pending > 0 ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>
                    {pending} pending
                  </span>
                ) : null;
              })()}
            </div>
            <div className="space-y-1">
              {BASE_TODO.map((item) => {
                const done = item.key === "activate" ? storefrontActivated : item.key === "product";
                return (
                  <div key={item.key} className="flex items-center gap-2.5 px-2 py-2 rounded-[8px] transition-colors hover:bg-[#F0FAF3] cursor-pointer group">
                    <div
                      className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                      style={{ borderColor: done ? "#1A7A42" : "#e2e8f0", background: done ? "#F0FAF3" : "transparent" }}
                    >
                      {done && <Check className="w-3 h-3" style={{ color: "#1A7A42" }} />}
                    </div>
                    <span className="text-[12px] font-medium flex-1" style={{ color: done ? "#94a3b8" : "#374151", textDecoration: done ? "line-through" : "none" }}>
                      {item.label}
                    </span>
                    {!done && <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "#1A7A42" }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-[14px] border p-4" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
            <p className="text-[13px] font-bold mb-3" style={{ color: "#1C1C1C" }}>Quick actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Plus, label: "Add Product", sub: "List a new item", href: "/merchant/products/create-product", color: "#1A7A42" },
                { icon: Store, label: "Update Store", sub: "Edit store details", href: "/merchant/store/information", color: "#3b82f6" },
                { icon: Globe, label: "View Storefront", sub: "See what customers see", href: storefrontUrl ?? "#", color: "#8b5cf6", external: true },
                { icon: BarChart3, label: "Analytics", sub: "Sales & traffic data", href: "/merchant/analytics", color: "#f59e0b" },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  className="flex flex-col items-start gap-1.5 p-3 rounded-[10px] border text-left transition-all hover:border-[#1A7A42] hover:bg-[#F0FAF3] group"
                  style={{ borderColor: "#e2e8f0", background: "#f8fafc", opacity: action.external && !storefrontUrl ? 0.5 : 1, pointerEvents: action.external && !storefrontUrl ? "none" : "auto" }}
                >
                  <div className="w-7 h-7 rounded-[7px] flex items-center justify-center" style={{ background: `${action.color}15` }}>
                    <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: "#1C1C1C" }}>{action.label}</p>
                    <p className="text-[10px]" style={{ color: "#6b7280" }}>{action.sub}</p>
                  </div>
                </a>
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
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-[15px] font-extrabold" style={{ color: "#1C1C1C" }}>Business Overview</p>
              <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>Your revenue performance this year</p>
            </div>
          </div>

          {hasRevenue ? (
            <>
              <div style={{ height: "200px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="onlineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A7A42" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#1A7A42" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => v === 0 ? "0" : `₦${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="online" name="Online Sales" stroke="#1A7A42" strokeWidth={2} fill="url(#onlineGrad)" dot={false} activeDot={{ r: 4, fill: "#1A7A42", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ background: "#F0FAF3" }}>
                <BarChart3 className="w-5 h-5" style={{ color: "#1A7A42" }} />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-bold" style={{ color: "#1C1C1C" }}>No sales data yet</p>
                <p className="text-[12px] mt-1" style={{ color: "#6b7280" }}>Your revenue chart will appear here once you record your first sale.</p>
              </div>
            </div>
          )}
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

          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <ShoppingCart className="w-8 h-8" style={{ color: "#e2e8f0" }} />
            <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>No channel data yet</p>
            <p className="text-[11px]" style={{ color: "#94a3b8" }}>Record a sale to see where your revenue is coming from.</p>
            <button
              className="mt-1 px-4 py-1.5 rounded-[7px] text-[12px] font-bold border transition-colors"
              style={{ borderColor: "#1A7A42", color: "#1A7A42", background: "transparent" }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#F0FAF3"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
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
