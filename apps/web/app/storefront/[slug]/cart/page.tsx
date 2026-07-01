"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Download, Shield } from "lucide-react";
import { useCart } from "@/lib/cartContext";

function fmt(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 });
}

export default function CartPage() {
  const { lines, updateQuantity, removeLine, subtotal, clearCart } = useCart();
  const router = useRouter();

  const delivery = lines.some((l) => !l.isDigital) ? 150000 : 0; // ₦1,500 for physical
  const total = subtotal + delivery;

  if (lines.length === 0) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", textAlign: "center" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "20px",
          background: "var(--store-bg, #F0FAF3)",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px",
        }}>
          <ShoppingBag style={{ width: "36px", height: "36px", color: "var(--store-primary, #1A7A42)" }} />
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#1C1C1C", marginBottom: "8px" }}>Your cart is empty</h1>
        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/shop" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "var(--store-primary, #1A7A42)", color: "#fff",
          borderRadius: "12px", padding: "12px 28px",
          fontWeight: 700, fontSize: "14px", textDecoration: "none",
        }}>
          Browse products <ArrowRight style={{ width: "16px", height: "16px" }} />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
        <button onClick={() => router.back()}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", borderRadius: "8px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 500 }}>
          <ArrowLeft style={{ width: "16px", height: "16px" }} /> Back
        </button>
        <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#1C1C1C", letterSpacing: "-0.4px" }}>
          Shopping cart
        </h1>
        <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>
          ({lines.length} {lines.length === 1 ? "item" : "items"})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

        {/* Items */}
        <div style={{ border: "1px solid #f1f5f9", borderRadius: "16px", overflow: "hidden" }}>

          {/* Table head */}
          <div className="hidden sm:grid" style={{
            display: "grid", gridTemplateColumns: "1fr auto auto auto",
            padding: "12px 20px", background: "#f8fafc",
            borderBottom: "1px solid #f1f5f9",
          }}>
            {["Product", "Price", "Quantity", "Total"].map((h) => (
              <span key={h} style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: h === "Product" ? "left" : "center" }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {lines.map((line, i) => (
            <div key={line.lineId} style={{
              display: "flex", alignItems: "center", gap: "16px",
              padding: "20px", borderBottom: i < lines.length - 1 ? "1px solid #f9fafb" : "none",
            }}>
              {/* Image */}
              <div style={{
                width: "72px", height: "72px", borderRadius: "12px",
                overflow: "hidden", flexShrink: 0,
                background: "var(--store-bg, #F0FAF3)",
                border: "1px solid #f1f5f9",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {line.productImage
                  ? <img src={line.productImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <Download style={{ width: "24px", height: "24px", color: "var(--store-primary, #1A7A42)", opacity: 0.5 }} />
                }
              </div>

              {/* Name + type */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: "14px", color: "#1C1C1C", lineHeight: 1.3, marginBottom: "4px" }}>
                  {line.productName}
                </p>
                {line.isDigital && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    fontSize: "10px", fontWeight: 700, color: "var(--store-primary, #1A7A42)",
                    background: "var(--store-bg, #F0FAF3)", borderRadius: "4px", padding: "2px 8px",
                  }}>
                    <Download style={{ width: "9px", height: "9px" }} /> Digital download
                  </span>
                )}
              </div>

              {/* Unit price */}
              <div style={{ minWidth: "80px", textAlign: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>{fmt(line.unitPrice)}</span>
              </div>

              {/* Qty */}
              <div style={{ minWidth: "110px", display: "flex", justifyContent: "center" }}>
                {line.isDigital ? (
                  <span style={{ fontSize: "13px", color: "#94a3b8" }}>×1</span>
                ) : (
                  <div style={{
                    display: "inline-flex", alignItems: "center",
                    border: "1.5px solid #e2e8f0", borderRadius: "9px", overflow: "hidden",
                  }}>
                    <button onClick={() => line.quantity > 1 ? updateQuantity(line.lineId, line.quantity - 1) : removeLine(line.lineId)}
                      style={{ width: "34px", height: "34px", border: "none", background: "#f8fafc", cursor: "pointer", fontSize: "16px", color: "#374151" }}>
                      −
                    </button>
                    <span style={{ width: "36px", textAlign: "center", fontWeight: 700, fontSize: "14px" }}>
                      {line.quantity}
                    </span>
                    <button onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                      style={{ width: "34px", height: "34px", border: "none", background: "#f8fafc", cursor: "pointer", fontSize: "16px", color: "#374151" }}>
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* Total + remove */}
              <div style={{ minWidth: "90px", textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--store-primary, #1A7A42)" }}>
                  {fmt(line.unitPrice * line.quantity)}
                </span>
                <button onClick={() => removeLine(line.lineId)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", lineHeight: 0 }}>
                  <Trash2 style={{ width: "14px", height: "14px", color: "#d1d5db" }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div>
          <div style={{ border: "1px solid #f1f5f9", borderRadius: "16px", padding: "24px", position: "sticky", top: "80px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#1C1C1C", marginBottom: "20px" }}>Order summary</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>Subtotal</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>
                  {delivery > 0 ? "Estimated delivery" : "Delivery"}
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: delivery > 0 ? "#374151" : "var(--store-primary, #1A7A42)" }}>
                  {delivery > 0 ? fmt(delivery) : "Free"}
                </span>
              </div>
              <div style={{ height: "1px", background: "#f1f5f9" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#1C1C1C" }}>Total</span>
                <span style={{ fontSize: "20px", fontWeight: 900, color: "#1C1C1C" }}>{fmt(total)}</span>
              </div>
            </div>

            <button onClick={() => router.push("/checkout")}
              style={{
                width: "100%", height: "50px", borderRadius: "12px", border: "none",
                background: "var(--store-primary, #1A7A42)", color: "#fff",
                fontSize: "15px", fontWeight: 800, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 6px 20px rgba(26,122,66,0.3)",
                marginBottom: "12px",
              }}>
              Proceed to checkout <ArrowRight style={{ width: "17px", height: "17px" }} />
            </button>

            <Link href="/shop" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: "42px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
              color: "#374151", fontSize: "13px", fontWeight: 600, textDecoration: "none",
              marginBottom: "16px",
            }}>
              Continue shopping
            </Link>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <Shield style={{ width: "13px", height: "13px", color: "#94a3b8" }} />
              <p style={{ fontSize: "11px", color: "#94a3b8" }}>Secured by Paystack</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
