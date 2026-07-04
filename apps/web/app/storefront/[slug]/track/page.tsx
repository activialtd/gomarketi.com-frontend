"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Package, ChevronLeft } from "lucide-react";

export default function OrderLookupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // slug is needed to know the shopUrl; ignore lint – it's used for shopUrl
  use(params);

  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = orderId.trim().replace(/^#/, "");
    if (!cleaned) { setError("Please enter your order ID."); return; }
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setError("");
    router.push(`/orders/${cleaned}?email=${encodeURIComponent(email.trim())}`);
  }

  const c = {
    primary: "var(--store-primary, #1A7A42)",
    bg: "var(--store-bg, #f0fdf4)",
  };

  return (
    <>
      <style>{`@keyframes gm-fade-up{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}.gm-fade-up{animation:gm-fade-up 0.4s ease both}`}</style>

      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>

        <div className="gm-fade-up" style={{ width: "100%", maxWidth: "440px" }}>

          {/* Back */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280", textDecoration: "none", marginBottom: "32px" }}>
            <ChevronLeft className="w-4 h-4" /> Back to store
          </Link>

          {/* Icon */}
          <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <Package style={{ width: "28px", height: "28px", color: c.primary }} />
          </div>

          <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#1C1C1C", letterSpacing: "-0.4px", marginBottom: "6px" }}>
            Track your order
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "32px", lineHeight: 1.6 }}>
            Enter your order ID and the email you used at checkout. You'll find your order ID in the confirmation email we sent you.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Order ID
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#94a3b8", fontWeight: 700 }}>#</span>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => { setOrderId(e.target.value); setError(""); }}
                  placeholder="e.g. 4A45B151"
                  style={{ width: "100%", height: "48px", padding: "0 14px 0 28px", borderRadius: "12px", border: `1.5px solid ${error && !orderId ? "#fca5a5" : "#e2e8f0"}`, fontSize: "14px", outline: "none", color: "#1C1C1C", background: "#fafafa", boxSizing: "border-box", fontFamily: "monospace" }}
                />
              </div>
              <p style={{ margin: "5px 0 0", fontSize: "11px", color: "#94a3b8" }}>First 8 characters of your order ID (shown in your confirmation email)</p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                style={{ width: "100%", height: "48px", padding: "0 14px", borderRadius: "12px", border: `1.5px solid ${error && !email ? "#fca5a5" : "#e2e8f0"}`, fontSize: "14px", outline: "none", color: "#1C1C1C", background: "#fafafa", boxSizing: "border-box" }}
              />
            </div>

            {error && (
              <p style={{ margin: 0, fontSize: "12px", color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "9px", padding: "10px 14px" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              style={{ height: "50px", borderRadius: "12px", border: "none", background: c.primary, color: "#fff", fontSize: "15px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: `0 4px 16px color-mix(in srgb, ${c.primary} 30%, transparent)`, letterSpacing: "-0.2px" }}
            >
              <Search className="w-4 h-4" />
              Track order
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "24px", lineHeight: 1.7 }}>
            Can't find your order ID?{" "}
            <span style={{ color: "#374151", fontWeight: 600 }}>Check your confirmation email</span>{" "}
            — we sent one right after you placed your order.
          </p>
        </div>
      </div>
    </>
  );
}
