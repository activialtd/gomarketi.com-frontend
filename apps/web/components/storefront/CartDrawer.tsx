"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Download } from "lucide-react";
import { useCart } from "@/lib/cartContext";

function fmt(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 });
}

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, updateQuantity, removeLine, subtotal } = useCart();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={onClose} />
      <div ref={ref} style={{
        position: "fixed", top: "68px", right: "16px",
        width: "380px", maxWidth: "calc(100vw - 32px)",
        maxHeight: "calc(100vh - 100px)",
        background: "#fff", borderRadius: "16px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column",
        zIndex: 50, overflow: "hidden", border: "1px solid #f1f5f9",
      }}>

        {/* Header */}
        <div style={{
          padding: "16px 20px 14px", borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingBag style={{ width: "16px", height: "16px", color: "var(--store-primary, #1A7A42)" }} />
            <span style={{ fontWeight: 800, fontSize: "14px", color: "#1C1C1C" }}>Your cart</span>
            {lines.length > 0 && (
              <span style={{
                background: "var(--store-primary, #1A7A42)", color: "#fff",
                borderRadius: "999px", padding: "2px 8px", fontSize: "11px", fontWeight: 700,
              }}>{lines.length}</span>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
            <X style={{ width: "18px", height: "18px", color: "#94a3b8" }} />
          </button>
        </div>

        {/* Lines */}
        <div style={{ flex: 1, overflowY: "auto", padding: lines.length === 0 ? "0" : "14px 20px" }}>
          {lines.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "14px",
                background: "var(--store-bg, #F0FAF3)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
              }}>
                <ShoppingBag style={{ width: "24px", height: "24px", color: "var(--store-primary, #1A7A42)" }} />
              </div>
              <p style={{ fontWeight: 700, fontSize: "14px", color: "#1C1C1C", marginBottom: "6px" }}>Cart is empty</p>
              <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>Add products to get started</p>
              <Link href="/shop" onClick={onClose}
                style={{ color: "var(--store-primary, #1A7A42)", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}>
                Browse products →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {lines.map((line) => (
                <div key={line.lineId} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{
                    width: "60px", height: "60px", borderRadius: "10px",
                    overflow: "hidden", flexShrink: 0, background: "var(--store-bg, #F0FAF3)",
                    border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {line.productImage
                      ? <img src={line.productImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <Download style={{ width: "20px", height: "20px", color: "var(--store-primary, #1A7A42)", opacity: 0.5 }} />
                    }
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#1C1C1C", marginBottom: "2px", lineHeight: 1.3 }}>
                      {line.productName}
                    </p>
                    <p style={{ fontSize: "13px", fontWeight: 800, color: "var(--store-primary, #1A7A42)" }}>
                      {fmt(line.unitPrice)}
                    </p>
                    {!line.isDigital ? (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        border: "1px solid #e2e8f0", borderRadius: "7px",
                        padding: "3px 8px", marginTop: "6px",
                      }}>
                        <button onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", lineHeight: 0 }}>
                          <Minus style={{ width: "11px", height: "11px", color: "#6b7280" }} />
                        </button>
                        <span style={{ fontSize: "12px", fontWeight: 700, minWidth: "14px", textAlign: "center" }}>{line.quantity}</span>
                        <button onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", lineHeight: 0 }}>
                          <Plus style={{ width: "11px", height: "11px", color: "#6b7280" }} />
                        </button>
                      </div>
                    ) : (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        fontSize: "10px", fontWeight: 600, color: "var(--store-primary, #1A7A42)",
                        background: "var(--store-bg, #F0FAF3)", borderRadius: "4px", padding: "2px 7px", marginTop: "4px",
                      }}>
                        <Download style={{ width: "9px", height: "9px" }} /> Digital
                      </span>
                    )}
                  </div>

                  <button onClick={() => removeLine(line.lineId)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", flexShrink: 0 }}>
                    <Trash2 style={{ width: "14px", height: "14px", color: "#d1d5db" }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div style={{ padding: "16px 20px", borderTop: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Subtotal</span>
              <span style={{ fontSize: "18px", fontWeight: 900, color: "#1C1C1C" }}>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button onClick={() => { onClose(); router.push("/checkout"); }}
                style={{
                  height: "46px", borderRadius: "12px", border: "none",
                  background: "var(--store-primary, #1A7A42)", color: "#fff",
                  fontSize: "14px", fontWeight: 800, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  boxShadow: "0 4px 14px rgba(26,122,66,0.3)",
                }}>
                Checkout <ArrowRight style={{ width: "16px", height: "16px" }} />
              </button>
              <Link href="/cart" onClick={onClose}
                style={{
                  height: "38px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
                  background: "#fff", color: "#374151", fontSize: "13px", fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
                }}>
                View full cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
