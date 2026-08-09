// components/storefront/Checkout.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft, Lock, ShoppingBag, Loader2, AlertCircle,
  CreditCard, Smartphone, Banknote, CheckCircle2, ChevronRight,
} from "lucide-react";
import { useCart, type CustomerInfo } from "@/lib/cartContext";
import { PaystackModal } from "@/components/storefront/PaystackModal";
import { ordersApi, type PaymentGatewayResp } from "@gomarket/api-client";

function fmtNaira(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 });
}

// ── Schema ─────────────────────────────────────────────────────────────────────
const checkoutSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(/^(0|\+234)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  address: z.string().min(8, "Enter your full delivery address"),
  city: z.string().min(2, "Required"),
  state: z.string().min(2, "Required"),
  note: z.string().optional(),
});
type CheckoutValues = z.infer<typeof checkoutSchema>;

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

// ── Gateway metadata ───────────────────────────────────────────────────────────
const GATEWAY_META: Record<string, { label: string; desc: string; icon: React.ReactNode }> = {
  paystack:    { label: "Pay online",       desc: "Card, bank transfer, USSD", icon: <CreditCard className="w-5 h-5" /> },
  flutterwave: { label: "Pay online",       desc: "Card, bank transfer",      icon: <CreditCard className="w-5 h-5" /> },
  stripe:      { label: "Pay with card",    desc: "Visa, Mastercard",         icon: <CreditCard className="w-5 h-5" /> },
  pos:         { label: "Pay with POS",     desc: "Use a POS terminal in-store",            icon: <Smartphone className="w-5 h-5" /> },
  manual:      { label: "Bank transfer",    desc: "Transfer to our bank account",           icon: <Banknote className="w-5 h-5" /> },
};

// ── Small helpers ──────────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "5px" }}>
          <AlertCircle className="w-3 h-3 shrink-0" style={{ color: "#dc2626" }} />
          <p style={{ fontSize: "11px", color: "#dc2626" }}>{error}</p>
        </div>
      )}
    </div>
  );
}

function inputStyle(hasError?: boolean): React.CSSProperties {
  return {
    width: "100%", height: "44px", padding: "0 14px",
    borderRadius: "10px", border: `1.5px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`,
    fontSize: "13px", outline: "none", color: "#1C1C1C", background: "#fafafa",
  };
}

function StepBadge({ n, primary }: { n: number; primary: string }) {
  return (
    <span style={{
      width: "20px", height: "20px", borderRadius: "50%", background: primary,
      color: "#fff", fontSize: "11px", fontWeight: 800,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>{n}</span>
  );
}

// ── Flutterwave loader ────────────────────────────────────────────────────────
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FlutterwaveCheckout?: (opts: Record<string, unknown>) => void;
  }
}

function loadFlutterwaveScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.FlutterwaveCheckout) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.flutterwave.com/v3.js";
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CheckoutPage({
  storeId, storeSlug = "", storeName = "GoMarketi Store",
}: { storeId: string | null; storeSlug?: string; storeName?: string }) {
  const router = useRouter();
  // Clean path — proxy.ts rewrites this transparently on the store's subdomain.
  const shopUrl = "/shop";
  const c = {
    primary: "var(--store-primary, #1A7A42)",
    bg: "var(--store-bg, #F0FAF3)",
    text: "#1C1C1C",
    secondary: "var(--store-secondary, #0A4D2A)",
  };

  const { lines, subtotal, setCustomer, clearCart } = useCart();
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderError, setOrderError] = useState("");

  // Payment gateway state
  const [gateways, setGateways] = useState<PaymentGatewayResp[]>([]);
  const [selectedGateway, setSelectedGateway] = useState("");
  const [showGatewaySelector, setShowGatewaySelector] = useState(false);
  const [pendingCustomer, setPendingCustomer] = useState<CustomerInfo | null>(null);

  // Paystack
  const [showPaystack, setShowPaystack] = useState(false);

  // POS / Manual reference
  const [showRefForm, setShowRefForm] = useState(false);
  const [refInput, setRefInput] = useState("");
  const [refError, setRefError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const allDigital = lines.every((l) => l.isDigital);
  const shipping = allDigital ? 0 : subtotal > 5000000 ? 0 : 150000;
  const total = subtotal + shipping;

  // Fetch active gateways once
  useEffect(() => {
    if (!storeId) return;
    ordersApi.getPublicGateways(storeId).then((gws) => {
      setGateways(gws);
      if (gws.length === 1) setSelectedGateway(gws[0].gateway);
    }).catch(() => {
      setGateways([{ gateway: "paystack", enabled: true, config: {} }]);
      setSelectedGateway("paystack");
    });
  }, [storeId]);

  // Step 1: form submitted → fire cart email, then show gateway selector (or go direct)
  async function onSubmit(data: CheckoutValues) {
    if (lines.length === 0) return;
    const customerInfo: CustomerInfo = {
      fullName: data.fullName, email: data.email, phone: data.phone,
      address: data.address, city: data.city, state: data.state, note: data.note,
    };
    setCustomer(customerInfo);
    setPendingCustomer(customerInfo);

    // Fire cart summary email immediately — don't await, never block checkout.
    if (storeSlug && storeName) {
      ordersApi.sendCartEmail({
        email: data.email,
        customer_name: data.fullName,
        store_slug: storeSlug,
        store_name: storeName,
        items: lines.map((l) => ({
          name: l.productName,
          image_url: l.productImage || undefined,
          quantity: l.quantity,
          price_kobo: l.unitPrice,
        })),
        total_kobo: total,
      }).catch(() => { /* email failure never blocks checkout */ });
    }

    if (gateways.length === 1) {
      await launchGateway(gateways[0].gateway, customerInfo);
    } else {
      setShowGatewaySelector(true);
    }
  }

  async function launchGateway(gateway: string, customer: CustomerInfo) {
    setSelectedGateway(gateway);
    setOrderError("");
    setRefInput("");
    setRefError("");

    if (gateway === "paystack") {
      setShowPaystack(true);
    } else if (gateway === "flutterwave") {
      await triggerFlutterwave(customer);
    } else if (gateway === "pos" || gateway === "manual") {
      setShowRefForm(true);
    } else {
      setOrderError("This payment method is not yet available. Please choose another.");
    }
  }

  async function triggerFlutterwave(customer: CustomerInfo) {
    const gw = gateways.find((g) => g.gateway === "flutterwave");
    const pubKey = (gw?.config?.public_key as string) || process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY || "";
    if (!pubKey) {
      setOrderError("Flutterwave is not configured yet. Please choose another payment method.");
      return;
    }
    try {
      await loadFlutterwaveScript();
      window.FlutterwaveCheckout?.({
        public_key: pubKey,
        tx_ref: `gm-${Date.now()}`,
        amount: total / 100,
        currency: "NGN",
        payment_options: "card,banktransfer,ussd",
        customer: { email: customer.email, phone_number: customer.phone, name: customer.fullName },
        customizations: { title: storeName, description: "Order payment", logo: "" },
        callback: (resp: { status: string; transaction_id: string; tx_ref: string }) => {
          if (resp.status === "successful" || resp.status === "completed") {
            void createOrder(`FLW-${resp.transaction_id || resp.tx_ref}`, customer, "flutterwave");
          } else {
            setOrderError("Payment was not completed. Please try again.");
          }
        },
        onclose: () => {},
      });
    } catch {
      setOrderError("Could not load Flutterwave. Please try another payment method.");
    }
  }

  async function handlePaystackSuccess(ref: string) {
    setShowPaystack(false);
    if (!pendingCustomer) return;
    await createOrder(ref, pendingCustomer, "paystack");
  }

  async function handleManualSubmit() {
    if (!refInput.trim()) { setRefError("Enter the payment reference or transaction ID"); return; }
    setShowRefForm(false);
    if (!pendingCustomer) return;
    await createOrder(refInput.trim(), pendingCustomer, selectedGateway);
  }

  const [placedOrderId, setPlacedOrderId] = useState("");
  const [placedEmail, setPlacedEmail] = useState("");

  async function createOrder(ref: string, customer: CustomerInfo, gateway: string) {
    if (!storeId) { setOrderError("Something went wrong. Please refresh and try again."); return; }
    setIsPlacing(true);
    try {
      const order = await ordersApi.createOrder({
        store_id: storeId,
        store_slug: storeSlug || undefined,
        store_name: storeName || undefined,
        customer_name: customer.fullName,
        customer_email: customer.email,
        customer_phone: customer.phone,
        delivery_address: `${customer.address}, ${customer.city}, ${customer.state}`,
        items: lines.map((l) => ({
          product_id: l.productId,
          name: l.productName,
          image_url: l.productImage,
          quantity: l.quantity,
          price_kobo: l.unitPrice,
        })),
        payment_reference: ref,
        payment_method: gateway === "pos" || gateway === "manual" ? gateway : "online",
        payment_gateway: gateway,
      } as Parameters<typeof ordersApi.createOrder>[0]);
      setOrderNumber(`#${order.id.slice(0, 8).toUpperCase()}`);
      setPlacedOrderId(order.id);
      setPlacedEmail(customer.email);
      clearCart();
      setOrderPlaced(true);
    } catch {
      setOrderError("Your payment succeeded but we couldn't save your order. Please contact the store with ref: " + ref);
    } finally {
      setIsPlacing(false);
    }
  }

  // ── Order success modal ─────────────────────────────────────────────────────
  if (orderPlaced) {
    const trackUrl = `/orders/${placedOrderId}?email=${encodeURIComponent(placedEmail)}`;
    return (
      <>
        <style>{`
          @keyframes gm-scale-in{0%{transform:scale(0.6);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
          @keyframes gm-check-draw{0%{stroke-dashoffset:60}100%{stroke-dashoffset:0}}
          @keyframes gm-fade-up{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}
          @keyframes gm-confetti-fall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(80px) rotate(720deg);opacity:0}}
          .gm-confetti span{position:absolute;top:0;animation:gm-confetti-fall 1.2s ease-out forwards}
        `}</style>
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", padding: "20px" }}>
          <div style={{ position: "relative", background: "#fff", borderRadius: "24px", maxWidth: "440px", width: "100%", padding: "44px 36px 36px", textAlign: "center", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", animation: "gm-scale-in 0.4s cubic-bezier(.34,1.56,.64,1) both" }}>

            {/* Confetti dots */}
            <div className="gm-confetti" style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", width: "200px", height: "0" }} aria-hidden>
              {["#1A7A42","#4ade80","#fbbf24","#60a5fa","#f472b6","#a78bfa"].map((color, i) => (
                <span key={i} style={{ left: `${i * 17}%`, width: "8px", height: "8px", borderRadius: i % 2 === 0 ? "50%" : "2px", background: color, animationDelay: `${i * 0.08}s`, animationDuration: `${1 + i * 0.1}s` }} />
              ))}
            </div>

            {/* Animated checkmark */}
            <div style={{ animation: "gm-scale-in 0.35s cubic-bezier(.34,1.56,.64,1) 0.1s both" }}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ margin: "0 auto 20px" }}>
                <circle cx="40" cy="40" r="40" fill={c.bg} />
                <circle cx="40" cy="40" r="38" fill="none" stroke={c.primary} strokeWidth="2" strokeDasharray="240" strokeDashoffset="0" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
                <path d="M24 40 L35 51 L56 30" stroke={c.primary} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset="0" style={{ animation: "gm-check-draw 0.5s ease 0.3s both" }} />
              </svg>
            </div>

            <div style={{ animation: "gm-fade-up 0.4s ease 0.3s both" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#1C1C1C", letterSpacing: "-0.4px", marginBottom: "6px" }}>
                Order placed! 🎉
              </h1>
              <p style={{ fontSize: "15px", fontWeight: 700, color: c.primary, marginBottom: "8px" }}>
                {orderNumber}
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, marginBottom: "6px" }}>
                Payment received. Your receipt is on its way to
              </p>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "28px" }}>
                {placedEmail}
              </p>

              {/* CTAs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link
                  href={trackUrl}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: c.primary, color: "#fff", textDecoration: "none", borderRadius: "12px", padding: "14px 24px", fontSize: "14px", fontWeight: 800, boxShadow: `0 4px 16px ${c.primary}40` }}
                >
                  Track my order →
                </Link>
                <Link
                  href={shopUrl}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#374151", textDecoration: "none", borderRadius: "12px", padding: "13px 24px", fontSize: "13px", fontWeight: 700, border: "1px solid #e2e8f0" }}
                >
                  Continue shopping
                </Link>
              </div>

              <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "20px", lineHeight: 1.6 }}>
                You can track your order anytime at <strong style={{ color: "#374151" }}>/track</strong> using your order ID and email.
              </p>
            </div>
          </div>
        </div>
        {/* Keep the checkout page dimmed underneath */}
        <div style={{ opacity: 0.3, pointerEvents: "none" }} />
      </>
    );
  }

  if (lines.length === 0) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <ShoppingBag className="w-10 h-10" style={{ color: "#d1d5db", margin: "0 auto 16px" }} />
        <p style={{ fontSize: "16px", fontWeight: 700, color: c.text, marginBottom: "8px" }}>Your cart is empty</p>
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>Add some products before checking out.</p>
        <Link href={shopUrl} style={{ color: c.primary, fontWeight: 700, fontSize: "13px", textDecoration: "none" }}>Browse products →</Link>
      </div>
    );
  }

  // ── Gateway selector modal ──────────────────────────────────────────────────
  if (showGatewaySelector && !showPaystack && !showRefForm) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "40px 20px" }}>
        <button onClick={() => setShowGatewaySelector(false)} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280", background: "none", border: "none", cursor: "pointer", marginBottom: "24px", padding: 0 }}>
          <ChevronLeft className="w-4 h-4" /> Back to details
        </button>
        <h2 style={{ fontSize: "20px", fontWeight: 900, color: c.text, marginBottom: "6px" }}>How would you like to pay?</h2>
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px" }}>Choose a payment method to complete your order of <strong style={{ color: c.text }}>{fmtNaira(total)}</strong></p>

        {orderError && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#dc2626" }} />
            <p style={{ fontSize: "12px", color: "#991b1b" }}>{orderError}</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {gateways.map((gw) => {
            const meta = GATEWAY_META[gw.gateway] ?? { label: gw.gateway, desc: "", icon: <CreditCard className="w-5 h-5" /> };
            const isSelected = selectedGateway === gw.gateway;
            return (
              <button
                key={gw.gateway}
                onClick={() => { setSelectedGateway(gw.gateway); void launchGateway(gw.gateway, pendingCustomer!); }}
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "16px", borderRadius: "12px", cursor: "pointer",
                  border: `2px solid ${isSelected ? c.primary : "#e2e8f0"}`,
                  background: isSelected ? c.bg : "#fff",
                  textAlign: "left", width: "100%",
                }}
              >
                <span style={{ color: c.primary }}>{meta.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: c.text, margin: 0 }}>{meta.label}</p>
                  <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}>{meta.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: "#94a3b8" }} />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── POS / Manual reference form ─────────────────────────────────────────────
  if (showRefForm) {
    const gw = gateways.find((g) => g.gateway === selectedGateway);
    const isPOS = selectedGateway === "pos";
    const bankName = (gw?.config?.bank_name as string) ?? "";
    const accNumber = (gw?.config?.account_number as string) ?? "";
    const accName = (gw?.config?.account_name as string) ?? "";
    const instructions = (gw?.config?.instructions as string) ?? "";

    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "40px 20px" }}>
        <button onClick={() => { setShowRefForm(false); setShowGatewaySelector(gateways.length > 1); }} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280", background: "none", border: "none", cursor: "pointer", marginBottom: "24px", padding: 0 }}>
          <ChevronLeft className="w-4 h-4" /> {gateways.length > 1 ? "Change payment method" : "Back"}
        </button>

        <h2 style={{ fontSize: "20px", fontWeight: 900, color: c.text, marginBottom: "6px" }}>
          {isPOS ? "POS Payment" : "Bank Transfer"}
        </h2>

        {!isPOS && (bankName || accNumber || instructions) && (
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Transfer details</p>
            {bankName && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}><span style={{ fontSize: "13px", color: "#6b7280" }}>Bank</span><span style={{ fontSize: "13px", fontWeight: 700, color: c.text }}>{bankName}</span></div>}
            {accNumber && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}><span style={{ fontSize: "13px", color: "#6b7280" }}>Account No.</span><span style={{ fontSize: "13px", fontWeight: 700, color: c.text }}>{accNumber}</span></div>}
            {accName && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}><span style={{ fontSize: "13px", color: "#6b7280" }}>Account Name</span><span style={{ fontSize: "13px", fontWeight: 700, color: c.text }}>{accName}</span></div>}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #e2e8f0", marginTop: "8px" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Amount to send</span>
              <span style={{ fontSize: "15px", fontWeight: 900, color: c.primary }}>{fmtNaira(total)}</span>
            </div>
            {instructions && <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "10px", lineHeight: 1.5 }}>{instructions}</p>}
          </div>
        )}

        {isPOS && instructions && (
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px", lineHeight: 1.6 }}>{instructions}</p>
        )}
        {isPOS && !instructions && (
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px", lineHeight: 1.6 }}>
            Please pay <strong style={{ color: c.text }}>{fmtNaira(total)}</strong> using the POS terminal, then enter the transaction ID below to complete your order.
          </p>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>
            {isPOS ? "POS Transaction ID" : "Transfer reference / transaction ID"}
          </label>
          <input
            value={refInput}
            onChange={(e) => { setRefInput(e.target.value); setRefError(""); }}
            placeholder={isPOS ? "e.g. 000123456789" : "e.g. NXP2026010312345"}
            style={inputStyle(!!refError)}
          />
          {refError && <p style={{ fontSize: "11px", color: "#dc2626", marginTop: "5px" }}>{refError}</p>}
        </div>

        <button
          onClick={handleManualSubmit}
          disabled={isPlacing}
          style={{ width: "100%", height: "50px", borderRadius: "12px", border: "none", background: c.primary, color: "#fff", fontSize: "14px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: isPlacing ? 0.7 : 1 }}
        >
          {isPlacing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {isPlacing ? "Placing order…" : "Confirm & place order"}
        </button>
      </div>
    );
  }

  // ── Main checkout form ──────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 20px 64px" }}>
      <Link href={shopUrl} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280", textDecoration: "none", marginBottom: "20px" }}>
        <ChevronLeft className="w-4 h-4" /> Continue shopping
      </Link>

      {orderError && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px" }}>
          <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "#dc2626" }} />
          <p style={{ fontSize: "12px", color: "#991b1b" }}>{orderError}</p>
        </div>
      )}

      <div style={{ display: "grid", gap: "40px" }} className="checkout-grid">
        {/* ── Form ── */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1 style={{ fontSize: "22px", fontWeight: 900, color: c.text, letterSpacing: "-0.4px", marginBottom: "24px" }}>Checkout</h1>

          {/* Contact info */}
          <div style={{ marginBottom: "28px" }}>
            <p style={{ fontSize: "13px", fontWeight: 800, color: c.text, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <StepBadge n={1} primary={c.primary} /> Contact information
            </p>
            <Field label="Full name" error={errors.fullName?.message}>
              <input style={inputStyle(!!errors.fullName)} placeholder="Your full name" {...register("fullName")} />
            </Field>
            <div style={{ display: "grid", gap: "12px" }} className="checkout-field-pair">
              <Field label="Email address" error={errors.email?.message}>
                <input style={inputStyle(!!errors.email)} type="email" placeholder="you@example.com" {...register("email")} />
              </Field>
              <Field label="Phone number" error={errors.phone?.message}>
                <input style={inputStyle(!!errors.phone)} type="tel" placeholder="08031234567" {...register("phone")} />
              </Field>
            </div>
            <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "-4px" }}>We'll use this to send order updates.</p>
          </div>

          {/* Delivery address */}
          <div style={{ marginBottom: "28px" }}>
            <p style={{ fontSize: "13px", fontWeight: 800, color: c.text, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <StepBadge n={2} primary={c.primary} /> Delivery address
            </p>
            <Field label="Street address" error={errors.address?.message}>
              <input style={inputStyle(!!errors.address)} placeholder="House number, street name" {...register("address")} />
            </Field>
            <div style={{ display: "grid", gap: "12px" }} className="checkout-field-pair">
              <Field label="City" error={errors.city?.message}>
                <input style={inputStyle(!!errors.city)} placeholder="e.g. Surulere" {...register("city")} />
              </Field>
              <Field label="State" error={errors.state?.message}>
                <select style={inputStyle(!!errors.state)} {...register("state")} defaultValue="">
                  <option value="" disabled>Select state</option>
                  {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Order note */}
          <div style={{ marginBottom: "28px" }}>
            <p style={{ fontSize: "13px", fontWeight: 800, color: c.text, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <StepBadge n={3} primary={c.primary} />
              Order note <span style={{ fontWeight: 500, color: "#94a3b8" }}>(optional)</span>
            </p>
            <textarea rows={3} style={{ ...inputStyle(), height: "auto", padding: "12px 14px", resize: "none", lineHeight: 1.5 }} placeholder="Delivery instructions, gift message, etc." {...register("note")} />
          </div>

          {/* Mobile submit */}
          <button type="submit" disabled={isPlacing} className="lg:hidden" style={{ width: "100%", height: "50px", borderRadius: "12px", border: "none", background: c.primary, color: "#fff", fontSize: "14px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: isPlacing ? 0.7 : 1 }}>
            {isPlacing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {isPlacing ? "Processing…" : `Pay · ${fmtNaira(total)}`}
          </button>
        </form>

        {/* ── Order summary ── */}
        <div>
          <div style={{ borderRadius: "16px", border: "1px solid #f1f5f9", padding: "20px" }} className="checkout-summary-panel">
            <p style={{ fontSize: "14px", fontWeight: 800, color: c.text, marginBottom: "16px" }}>Order summary</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px", maxHeight: "260px", overflowY: "auto" }}>
              {lines.map((line) => (
                <div key={line.lineId} style={{ display: "flex", gap: "10px" }}>
                  <div style={{ position: "relative", width: "52px", height: "52px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: c.bg }}>
                    {line.productImage && <img src={line.productImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    <div style={{ position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", borderRadius: "50%", background: c.primary, color: "#fff", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{line.quantity}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: c.text, lineHeight: 1.3 }}>{line.productName}</p>
                    {line.isDigital && <p style={{ fontSize: "10px", color: "#94a3b8" }}>Digital download</p>}
                  </div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: c.text, flexShrink: 0 }}>{fmtNaira(line.unitPrice * line.quantity)}</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280" }}>
                <span>Subtotal</span><span>{fmtNaira(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280" }}>
                <span>Shipping</span><span>{shipping === 0 ? "Free" : fmtNaira(shipping)}</span>
              </div>
              {shipping > 0 && <p style={{ fontSize: "10px", color: c.primary, fontWeight: 600 }}>Add {fmtNaira(5000000 - subtotal)} more for free shipping</p>}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "14px", fontWeight: 800, color: c.text }}>Total</span>
                <span style={{ fontSize: "16px", fontWeight: 900, color: c.primary }}>{fmtNaira(total)}</span>
              </div>
            </div>

            {/* Desktop submit */}
            <button type="button" onClick={handleSubmit(onSubmit)} disabled={isPlacing} className="hidden lg:flex" style={{ width: "100%", height: "50px", borderRadius: "12px", border: "none", background: c.primary, color: "#fff", fontSize: "14px", fontWeight: 800, cursor: "pointer", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "18px", opacity: isPlacing ? 0.7 : 1, boxShadow: `0 4px 14px ${c.primary}40` }}>
              {isPlacing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {isPlacing ? "Processing…" : gateways.length === 1 ? `Pay ${fmtNaira(total)}` : "Continue to payment"}
            </button>

            {/* Payment methods indicator */}
            {gateways.length > 0 && (
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                {gateways.map((gw) => {
                  const meta = GATEWAY_META[gw.gateway];
                  return meta ? (
                    <span key={gw.gateway} title={meta.label} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#94a3b8", background: "#f8fafc", borderRadius: "6px", padding: "3px 7px", border: "1px solid #e2e8f0" }}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}

            <p style={{ fontSize: "10px", color: "#94a3b8", textAlign: "center", marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <Lock className="w-3 h-3" /> Secured by GoMarketi
            </p>
          </div>
        </div>
      </div>

      {/* Paystack modal */}
      {showPaystack && pendingCustomer && (
        <PaystackModal
          amount={total}
          email={pendingCustomer.email}
          storeName={storeName}
          publicKey={gateways.find((g) => g.gateway === "paystack")?.config?.public_key as string | undefined}
          onSuccess={handlePaystackSuccess}
          onClose={() => { setShowPaystack(false); if (gateways.length > 1) setShowGatewaySelector(true); }}
        />
      )}
    </div>
  );
}
