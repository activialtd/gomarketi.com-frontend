// apps/storefront/app/checkout/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  Lock,
  ShoppingBag,
  Loader2,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { STORE_CONFIG } from "@/lib/storeConfig";
import { useCart, type CustomerInfo } from "@/lib/cartContext";
import { fmtNaira } from "@gomarket/shared-utils";

// ─── Schema ───────────────────────────────────────────────────────────────────
// Email, phone, and address are required before an order can be created.

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^(0|\+234)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  address: z.string().min(8, "Enter your full delivery address"),
  city: z.string().min(2, "Required"),
  state: z.string().min(2, "Required"),
  note: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#374151",
          display: "block",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "5px",
          }}
        >
          <AlertCircle
            className="w-3 h-3 shrink-0"
            style={{ color: "#dc2626" }}
          />
          <p style={{ fontSize: "11px", color: "#dc2626" }}>{error}</p>
        </div>
      )}
    </div>
  );
}

function inputStyle(hasError?: boolean): React.CSSProperties {
  return {
    width: "100%",
    height: "44px",
    padding: "0 14px",
    borderRadius: "10px",
    border: `1.5px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`,
    fontSize: "13px",
    outline: "none",
    color: "#1C1C1C",
    background: "#fafafa",
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const c = STORE_CONFIG.colors;
  const { lines, subtotal, setCustomer, clearCart } = useCart();
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const shipping = subtotal > 5000000 ? 0 : 150000; // free shipping over ₦50,000
  const total = subtotal + shipping;

  async function onSubmit(data: CheckoutValues) {
    if (lines.length === 0) return;
    setIsPlacing(true);

    const customerInfo: CustomerInfo = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      note: data.note,
    };
    setCustomer(customerInfo);

    // Simulate order creation (Paystack init + order record in production)
    await new Promise((r) => setTimeout(r, 1300));

    const newOrderNumber = `#ORD-${Math.floor(4000 + Math.random() * 999)}`;
    setOrderNumber(newOrderNumber);
    setIsPlacing(false);
    setOrderPlaced(true);
    clearCart();
  }

  // ── Order success state ─────────────────────────────────
  if (orderPlaced) {
    return (
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: c.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke={c.primary}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 900,
            color: c.text,
            marginBottom: "8px",
          }}
        >
          Order placed!
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
          Your order <strong style={{ color: c.text }}>{orderNumber}</strong>{" "}
          has been received.
        </p>
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "28px" }}>
          We've sent a confirmation to your email. {STORE_CONFIG.storeName} will
          reach out shortly to confirm delivery details.
        </p>
        <Link
          href="/shop"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: c.primary,
            color: "#fff",
            textDecoration: "none",
            borderRadius: "10px",
            padding: "12px 24px",
            fontSize: "13px",
            fontWeight: 800,
          }}
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  // ── Empty cart guard ─────────────────────────────────────
  if (lines.length === 0) {
    return (
      <div
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <ShoppingBag
          className="w-10 h-10"
          style={{ color: "#d1d5db", margin: "0 auto 16px" }}
        />
        <p
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: c.text,
            marginBottom: "8px",
          }}
        >
          Your cart is empty
        </p>
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
          Add some products before checking out.
        </p>
        <Link
          href="/shop"
          style={{
            color: c.primary,
            fontWeight: 700,
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          Browse products →
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "24px 20px 64px",
      }}
    >
      <Link
        href="/shop"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          color: "#6b7280",
          textDecoration: "none",
          marginBottom: "20px",
        }}
      >
        <ChevronLeft className="w-4 h-4" /> Continue shopping
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "40px",
        }}
        className="checkout-grid"
      >
        {/* ── Form ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 900,
              color: c.text,
              letterSpacing: "-0.4px",
              marginBottom: "24px",
            }}
          >
            Checkout
          </h1>

          {/* Contact info */}
          <div style={{ marginBottom: "28px" }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: c.text,
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: c.primary,
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                1
              </span>
              Contact information
            </p>
            <Field label="Full name" error={errors.fullName?.message}>
              <input
                style={inputStyle(!!errors.fullName)}
                placeholder="Your full name"
                {...register("fullName")}
              />
            </Field>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <Field label="Email address" error={errors.email?.message}>
                <input
                  style={inputStyle(!!errors.email)}
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
              </Field>
              <Field label="Phone number" error={errors.phone?.message}>
                <input
                  style={inputStyle(!!errors.phone)}
                  type="tel"
                  placeholder="08031234567"
                  {...register("phone")}
                />
              </Field>
            </div>
            <p
              style={{ fontSize: "11px", color: "#94a3b8", marginTop: "-4px" }}
            >
              We'll use this to send order updates and for delivery
              coordination.
            </p>
          </div>

          {/* Delivery address */}
          <div style={{ marginBottom: "28px" }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: c.text,
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: c.primary,
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                2
              </span>
              Delivery address
            </p>
            <Field label="Street address" error={errors.address?.message}>
              <input
                style={inputStyle(!!errors.address)}
                placeholder="House number, street name"
                {...register("address")}
              />
            </Field>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <Field label="City" error={errors.city?.message}>
                <input
                  style={inputStyle(!!errors.city)}
                  placeholder="e.g. Surulere"
                  {...register("city")}
                />
              </Field>
              <Field label="State" error={errors.state?.message}>
                <select
                  style={inputStyle(!!errors.state)}
                  {...register("state")}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select state
                  </option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Order note */}
          <div style={{ marginBottom: "28px" }}>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: c.text,
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: c.primary,
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                3
              </span>
              Order note{" "}
              <span style={{ fontWeight: 500, color: "#94a3b8" }}>
                (optional)
              </span>
            </p>
            <textarea
              rows={3}
              style={{
                ...inputStyle(),
                height: "auto",
                padding: "12px 14px",
                resize: "none",
                lineHeight: 1.5,
              }}
              placeholder="Delivery instructions, gift message, etc."
              {...register("note")}
            />
          </div>

          {/* Submit (mobile) */}
          <button
            type="submit"
            disabled={isPlacing}
            className="lg:hidden"
            style={{
              width: "100%",
              height: "50px",
              borderRadius: "12px",
              border: "none",
              background: c.primary,
              color: "#fff",
              fontSize: "14px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: isPlacing ? 0.7 : 1,
            }}
          >
            {isPlacing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {isPlacing ? "Placing order…" : `Place order · ${fmtNaira(total)}`}
          </button>
        </form>

        {/* ── Order summary ────────────────────────────────── */}
        <div>
          <div
            style={{
              borderRadius: "16px",
              border: "1px solid #f1f5f9",
              padding: "20px",
              position: "sticky",
              top: "80px",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: c.text,
                marginBottom: "16px",
              }}
            >
              Order summary
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "16px",
                maxHeight: "260px",
                overflowY: "auto",
              }}
            >
              {lines.map((line) => (
                <div key={line.lineId} style={{ display: "flex", gap: "10px" }}>
                  <div
                    style={{
                      position: "relative",
                      width: "52px",
                      height: "52px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      flexShrink: 0,
                      background: c.bg,
                    }}
                  >
                    {line.productImage && (
                      <img
                        src={line.productImage}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div
                      style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-6px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: c.primary,
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {line.quantity}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: c.text,
                        lineHeight: 1.3,
                      }}
                    >
                      {line.productName}
                    </p>
                    {line.variantLabel && (
                      <p style={{ fontSize: "10px", color: "#94a3b8" }}>
                        {line.variantLabel}
                      </p>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: c.text,
                      flexShrink: 0,
                    }}
                  >
                    {fmtNaira(line.unitPrice * line.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: "1px solid #f1f5f9",
                paddingTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                <span>Subtotal</span>
                <span>{fmtNaira(subtotal)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : fmtNaira(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p
                  style={{
                    fontSize: "10px",
                    color: c.primary,
                    fontWeight: 600,
                  }}
                >
                  Add {fmtNaira(5000000 - subtotal)} more for free shipping
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "8px",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <span
                  style={{ fontSize: "14px", fontWeight: 800, color: c.text }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 900,
                    color: c.primary,
                  }}
                >
                  {fmtNaira(total)}
                </span>
              </div>
            </div>

            {/* Desktop submit */}
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isPlacing}
              className="hidden lg:flex"
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "12px",
                border: "none",
                background: c.primary,
                color: "#fff",
                fontSize: "14px",
                fontWeight: 800,
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "18px",
                opacity: isPlacing ? 0.7 : 1,
                boxShadow: `0 4px 14px ${c.primary}40`,
              }}
            >
              {isPlacing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {isPlacing ? "Placing order…" : "Place order"}
            </button>

            <p
              style={{
                fontSize: "10px",
                color: "#94a3b8",
                textAlign: "center",
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <Lock className="w-3 h-3" /> Secure checkout via Paystack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
