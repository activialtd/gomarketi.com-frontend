"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { STORE_CONFIG } from "@/lib/storeConfig";
import { useCart } from "@/lib/cartContext";
import { fmtNaira } from "@gomarket/shared-utils";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { lines, updateQuantity, removeLine, subtotal } = useCart();
  const router = useRouter();
  const c = STORE_CONFIG.colors;

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          width: "min(420px, 100vw)",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p style={{ fontWeight: 800, fontSize: "15px", color: c.text }}>
            Your cart ({lines.length})
          </p>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X className="w-5 h-5" style={{ color: "#94a3b8" }} />
          </button>
        </div>

        {/* Lines */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {lines.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: "12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: c.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingBag className="w-6 h-6" style={{ color: c.primary }} />
              </div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: c.text }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: "12px", color: "#6b7280" }}>
                Add items to get started.
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: c.primary,
                  textDecoration: "none",
                }}
              >
                Browse products →
              </Link>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {lines.map((line) => (
                <div key={line.lineId} style={{ display: "flex", gap: "12px" }}>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
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
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: c.text,
                        marginBottom: "2px",
                      }}
                    >
                      {line.productName}
                    </p>
                    {line.variantLabel && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#6b7280",
                          marginBottom: "6px",
                        }}
                      >
                        {line.variantLabel}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          border: "1px solid #e2e8f0",
                          borderRadius: "7px",
                          padding: "3px 6px",
                        }}
                      >
                        <button
                          onClick={() =>
                            updateQuantity(line.lineId, line.quantity - 1)
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px",
                          }}
                        >
                          <Minus
                            className="w-3 h-3"
                            style={{ color: "#6b7280" }}
                          />
                        </button>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            minWidth: "16px",
                            textAlign: "center",
                          }}
                        >
                          {line.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(line.lineId, line.quantity + 1)
                          }
                          disabled={line.quantity >= line.maxStock}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px",
                            opacity: line.quantity >= line.maxStock ? 0.3 : 1,
                          }}
                        >
                          <Plus
                            className="w-3 h-3"
                            style={{ color: "#6b7280" }}
                          />
                        </button>
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 800,
                          color: c.primary,
                        }}
                      >
                        {fmtNaira(line.unitPrice * line.quantity)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeLine(line.lineId)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      alignSelf: "flex-start",
                    }}
                  >
                    <Trash2
                      className="w-3.5 h-3.5"
                      style={{ color: "#d1d5db" }}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div style={{ padding: "18px 20px", borderTop: "1px solid #f1f5f9" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                Subtotal
              </span>
              <span
                style={{ fontSize: "16px", fontWeight: 800, color: c.text }}
              >
                {fmtNaira(subtotal)}
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                router.push("/checkout");
              }}
              style={{
                width: "100%",
                height: "46px",
                background: c.primary,
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: `0 4px 14px ${c.primary}44`,
              }}
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </button>
            <p
              style={{
                fontSize: "10px",
                color: "#94a3b8",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              Shipping & taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
