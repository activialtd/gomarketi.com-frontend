"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ClipboardCheck, PackageCheck, Truck, BadgeCheck,
  XCircle, RotateCcw, ChevronLeft, ExternalLink,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const POLL_MS = 20_000;

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderItem {
  name: string;
  quantity: number;
  price_kobo: number;
  image_url?: string;
}

interface OrderData {
  id: string;
  status: string;
  total_kobo: number;
  created_at: string;
  updated_at?: string;
  customer_name: string;
  customer_email: string;
  delivery_address: string;
  items: OrderItem[];
  store_slug?: string;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    key: "pending",
    label: "Order placed",
    sub: "We've received your order",
    icon: ClipboardCheck,
    color: "#6366f1",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    sub: "Store confirmed your order",
    icon: PackageCheck,
    color: "#0891b2",
  },
  {
    key: "shipped",
    label: "On its way",
    sub: "Your order is in transit",
    icon: Truck,
    color: "#f59e0b",
  },
  {
    key: "delivered",
    label: "Delivered",
    sub: "Enjoy your purchase!",
    icon: BadgeCheck,
    color: "#1A7A42",
  },
] as const;

function stepIndex(status: string) {
  const i = STEPS.findIndex((s) => s.key === status);
  return i >= 0 ? i : 0;
}

function fmt(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { slug, id } = use(params);
  const sp = use(searchParams);
  const email = sp.email ?? "";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  async function fetchOrder() {
    if (!email) { setLoading(false); return; }
    try {
      const res = await fetch(
        `${API_URL}/v1/orders/public/${id}?email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) return;
      const data = (await res.json()) as OrderData;
      setOrder(data);
      setLastUpdated(new Date());
    } catch {
      // keep previous state on transient errors
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchOrder();
    const t = setInterval(() => void fetchOrder(), POLL_MS);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, email]);

  const shopUrl = `/`;

  // ── No email ─────────────────────────────────────────────────────────────
  if (!email) {
    return (
      <NoEmail orderId={id} slug={slug} shopUrl={shopUrl} />
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return <LoadingSkeleton />;
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !order) {
    return <NotFound shopUrl={shopUrl} slug={slug} />;
  }

  const isCancelled = order.status === "cancelled";
  const currentStep = isCancelled ? -1 : stepIndex(order.status);
  const progressPct = isCancelled ? 0 : (currentStep / (STEPS.length - 1)) * 100;

  return (
    <>
      <style>{`
        @keyframes gm-pulse-ring{0%{transform:scale(1);opacity:0.7}50%{transform:scale(1.35);opacity:0.3}100%{transform:scale(1);opacity:0.7}}
        @keyframes gm-progress{0%{width:0%}100%{width:var(--pct)}}
        @keyframes gm-fade-up{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes gm-spin-slow{to{transform:rotate(360deg)}}
        .gm-pulse{animation:gm-pulse-ring 1.8s ease-in-out infinite}
        .gm-fade-up{animation:gm-fade-up 0.4s ease both}
      `}</style>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "32px 20px 80px" }} className="gm-fade-up">

        {/* Back */}
        <Link href={shopUrl} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280", textDecoration: "none", marginBottom: "24px" }}>
          <ChevronLeft className="w-4 h-4" /> Back to store
        </Link>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "28px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "4px" }}>
              Order tracking
            </p>
            <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#1C1C1C", letterSpacing: "-0.5px", margin: 0 }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 0" }}>
              Placed {timeAgo(order.created_at)} · Updated {timeAgo(lastUpdated.toISOString())}
              {" "}
              <button onClick={() => void fetchOrder()} style={{ background: "none", border: "none", cursor: "pointer", color: "#1A7A42", fontSize: "12px", fontWeight: 700, padding: 0 }}>
                ↻ refresh
              </button>
            </p>
          </div>
          <StatusPill status={order.status} />
        </div>

        {/* Timeline card */}
        {!isCancelled ? (
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", marginBottom: "20px", border: "1.5px solid #f1f5f9", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>
            {/* Progress bar */}
            <div style={{ position: "relative", height: "4px", background: "#f1f5f9", borderRadius: "999px", marginBottom: "32px" }}>
              <div
                style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  width: `${progressPct}%`,
                  borderRadius: "999px",
                  background: "linear-gradient(90deg, #1A7A42, #4ade80)",
                  transition: "width 1s cubic-bezier(.4,0,.2,1)",
                }}
              />
            </div>

            {/* Steps */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, gap: "8px" }}>
              {STEPS.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                const Icon = step.icon;
                return (
                  <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    {/* Circle */}
                    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {active && (
                        <div
                          className="gm-pulse"
                          style={{ position: "absolute", width: "52px", height: "52px", borderRadius: "50%", background: step.color + "22" }}
                        />
                      )}
                      <div style={{
                        width: "44px", height: "44px", borderRadius: "50%", position: "relative", zIndex: 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: done ? step.color : active ? step.color : "#f8fafc",
                        border: `2px solid ${done ? step.color : active ? step.color : "#e2e8f0"}`,
                        transition: "all 0.4s ease",
                        boxShadow: active ? `0 0 0 4px ${step.color}22` : "none",
                      }}>
                        <Icon style={{ width: "18px", height: "18px", color: done || active ? "#fff" : "#d1d5db" }} />
                      </div>
                    </div>
                    {/* Label */}
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: "11px", fontWeight: active || done ? 800 : 500, color: active ? step.color : done ? "#1C1C1C" : "#9ca3af", margin: 0, lineHeight: 1.3 }}>
                        {step.label}
                      </p>
                      {active && (
                        <p style={{ fontSize: "10px", color: step.color, margin: "3px 0 0", fontWeight: 600, lineHeight: 1.3 }}>
                          {step.sub}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ background: "#fef2f2", borderRadius: "16px", padding: "24px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "16px", border: "1.5px solid #fecaca" }}>
            <XCircle style={{ width: "28px", height: "28px", color: "#ef4444", flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#991b1b" }}>Order cancelled</p>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#dc2626" }}>This order has been cancelled. Contact the store for more information.</p>
            </div>
          </div>
        )}

        {/* Status message */}
        <StatusMessage status={order.status} />

        {/* Items */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #f1f5f9", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f9fafb", background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 800, color: "#1C1C1C" }}>Items in this order</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
          </div>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", borderBottom: i < order.items.length - 1 ? "1px solid #f9fafb" : "none" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, background: "#f1f5f9", border: "1px solid #f1f5f9" }}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📦</div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#1C1C1C", lineHeight: 1.3 }}>{item.name}</p>
                <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#94a3b8" }}>Qty: {item.quantity} × {fmt(item.price_kobo)}</p>
              </div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#1A7A42", flexShrink: 0 }}>{fmt(item.price_kobo * item.quantity)}</p>
            </div>
          ))}
          {/* Total row */}
          <div style={{ padding: "14px 20px", borderTop: "2px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#6b7280" }}>Order total</span>
            <span style={{ fontSize: "20px", fontWeight: 900, color: "#1C1C1C" }}>{fmt(order.total_kobo)}</span>
          </div>
        </div>

        {/* Delivery info */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1.5px solid #f1f5f9", padding: "18px 20px", marginBottom: "20px" }}>
          <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Delivery address</p>
          <p style={{ margin: 0, fontSize: "13px", color: "#374151", lineHeight: 1.6 }}>{order.delivery_address}</p>
        </div>

        {/* Share / look up another */}
        <div style={{ background: "#f8fafc", borderRadius: "16px", border: "1.5px solid #e2e8f0", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "#374151" }}>Track another order or share this page</p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              href="/track"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#1A7A42", background: "#f0fdf4", padding: "9px 16px", borderRadius: "9px", textDecoration: "none", border: "1.5px solid #bbf7d0" }}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Look up an order
            </Link>
            <button
              onClick={() => { if (navigator.clipboard) void navigator.clipboard.writeText(window.location.href); }}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#6366f1", background: "#f5f3ff", padding: "9px 16px", borderRadius: "9px", border: "1.5px solid #ddd6fe", cursor: "pointer" }}
            >
              <ExternalLink className="w-3.5 h-3.5" /> Copy tracking link
            </button>
          </div>
        </div>

      </div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    pending:   { bg: "#eef2ff", text: "#6366f1", label: "Pending" },
    confirmed: { bg: "#ecfeff", text: "#0891b2", label: "Confirmed" },
    shipped:   { bg: "#fffbeb", text: "#d97706", label: "Shipped" },
    delivered: { bg: "#f0fdf4", text: "#1A7A42", label: "Delivered" },
    cancelled: { bg: "#fef2f2", text: "#dc2626", label: "Cancelled" },
  };
  const s = map[status] ?? { bg: "#f8fafc", text: "#6b7280", label: status };
  return (
    <span style={{ padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, background: s.bg, color: s.text, textTransform: "capitalize", letterSpacing: "0.04em" }}>
      {s.label}
    </span>
  );
}

function StatusMessage({ status }: { status: string }) {
  const msgs: Record<string, { title: string; body: string; bg: string; border: string; text: string }> = {
    pending: {
      title: "Waiting for store confirmation",
      body: "Your order has been placed successfully. The store will confirm it shortly. You'll receive an email when it's confirmed.",
      bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca",
    },
    confirmed: {
      title: "Order confirmed — being prepared",
      body: "The store has confirmed your order and is preparing it for shipment. We'll notify you as soon as it's on the way.",
      bg: "#ecfeff", border: "#a5f3fc", text: "#0e7490",
    },
    shipped: {
      title: "Your order is on the way!",
      body: "Your order has been handed to the delivery partner. The store will share tracking details with you directly.",
      bg: "#fffbeb", border: "#fde68a", text: "#92400e",
    },
    delivered: {
      title: "Order delivered — enjoy!",
      body: "Your order has been marked as delivered. We hope you love what you got! Contact the store if you have any questions.",
      bg: "#f0fdf4", border: "#bbf7d0", text: "#166534",
    },
    cancelled: {
      title: "Order cancelled",
      body: "This order has been cancelled. If you have questions or need a refund, please contact the store directly.",
      bg: "#fef2f2", border: "#fecaca", text: "#991b1b",
    },
  };
  const m = msgs[status];
  if (!m) return null;
  return (
    <div style={{ background: m.bg, border: `1.5px solid ${m.border}`, borderRadius: "14px", padding: "16px 20px", marginBottom: "16px" }}>
      <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 800, color: m.text }}>{m.title}</p>
      <p style={{ margin: 0, fontSize: "12.5px", color: m.text, lineHeight: 1.6, opacity: 0.85 }}>{m.body}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "32px 20px" }}>
      <style>{`@keyframes gm-shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}.gm-sh{background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:400px;animation:gm-shimmer 1.2s infinite}`}</style>
      {[80, 200, 120, 60].map((h, i) => (
        <div key={i} className="gm-sh" style={{ height: h, borderRadius: "14px", marginBottom: "16px" }} />
      ))}
    </div>
  );
}

function NoEmail({ orderId, slug, shopUrl }: { orderId: string; slug: string; shopUrl: string }) {
  const [email, setEmail] = useState("");
  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <ClipboardCheck style={{ width: "28px", height: "28px", color: "#1A7A42" }} />
      </div>
      <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#1C1C1C", marginBottom: "8px" }}>Track your order</h1>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px", lineHeight: 1.6 }}>
        Enter the email address you used when placing order <strong style={{ color: "#1C1C1C" }}>#{orderId.slice(0, 8).toUpperCase()}</strong>.
      </p>
      <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/orders/${orderId}?email=${encodeURIComponent(email)}`; }}>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ width: "100%", height: "46px", padding: "0 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0", fontSize: "14px", marginBottom: "12px", outline: "none", boxSizing: "border-box" }}
        />
        <button type="submit" style={{ width: "100%", height: "46px", borderRadius: "10px", border: "none", background: "#1A7A42", color: "#fff", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>
          View order →
        </button>
      </form>
      <Link href={shopUrl} style={{ display: "block", marginTop: "20px", fontSize: "12px", color: "#94a3b8", textDecoration: "none" }}>← Back to store</Link>
    </div>
  );
}

function NotFound({ shopUrl, slug }: { shopUrl: string; slug: string }) {
  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <XCircle style={{ width: "28px", height: "28px", color: "#ef4444" }} />
      </div>
      <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#1C1C1C", marginBottom: "8px" }}>Order not found</h1>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px", lineHeight: 1.6 }}>
        We couldn't find an order matching that ID and email. Please check your confirmation email or contact the store.
      </p>
      <Link href="/track" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#1A7A42", color: "#fff", textDecoration: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "13px", fontWeight: 800, marginBottom: "12px" }}>
        Try again
      </Link>
      <br />
      <Link href={shopUrl} style={{ fontSize: "12px", color: "#94a3b8", textDecoration: "none" }}>← Back to store</Link>
    </div>
  );
}
