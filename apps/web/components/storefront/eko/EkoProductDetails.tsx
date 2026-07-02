"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download, ShoppingBag, Check, Share2,
  Shield, Zap, RotateCcw, ChevronRight,
} from "lucide-react";
import { useCart } from "@/lib/cartContext";
import type { StorefrontProduct } from "@/app/storefront/[slug]/page";
import { ProductCard } from "./EkoProductCard";

function fmt(kobo: number) {
  return "₦" + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 });
}

export default function EkoProductDetails({
  product,
  related = [],
}: {
  product: StorefrontProduct;
  related?: StorefrontProduct[];
}) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  function handleAdd() {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  function handleBuyNow() {
    addToCart(product, qty);
    router.push("/checkout");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>

      {/* Breadcrumb */}
      <div style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9", padding: "10px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/" style={{ color: "#6b7280", fontSize: "12px", textDecoration: "none" }}>Home</Link>
          <ChevronRight style={{ width: "12px", height: "12px", color: "#d1d5db" }} />
          <Link href="/shop" style={{ color: "#6b7280", fontSize: "12px", textDecoration: "none" }}>Shop</Link>
          <ChevronRight style={{ width: "12px", height: "12px", color: "#d1d5db" }} />
          <span style={{ color: "#374151", fontSize: "12px", fontWeight: 600 }}>{product.name}</span>
        </div>
      </div>

      {/* Main section */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Image gallery */}
          <div>
            <div style={{
              aspectRatio: "1", borderRadius: "20px", overflow: "hidden",
              background: "var(--store-bg, #F0FAF3)", border: "1px solid #f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "12px", position: "relative",
            }}>
              {product.images.length > 0 ? (
                <img src={product.images[activeImg]} alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ textAlign: "center", opacity: 0.4 }}>
                  {product.is_digital
                    ? <Download style={{ width: "64px", height: "64px", color: "var(--store-primary, #1A7A42)", margin: "0 auto 8px" }} />
                    : <ShoppingBag style={{ width: "64px", height: "64px", color: "var(--store-primary, #1A7A42)", margin: "0 auto 8px" }} />
                  }
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                    {product.is_digital ? "Digital product" : "No image"}
                  </p>
                </div>
              )}
              {product.is_digital && (
                <div style={{
                  position: "absolute", top: "14px", left: "14px",
                  background: "var(--store-primary, #1A7A42)", color: "#fff",
                  borderRadius: "999px", padding: "5px 12px",
                  fontSize: "11px", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: "5px",
                }}>
                  <Download style={{ width: "11px", height: "11px" }} /> Digital Download
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{
                    width: "72px", height: "72px", borderRadius: "10px", overflow: "hidden",
                    border: `2px solid ${i === activeImg ? "var(--store-primary, #1A7A42)" : "#e2e8f0"}`,
                    cursor: "pointer", padding: 0, background: "transparent",
                  }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="lg:sticky lg:top-20">
            {product.tags.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                {product.tags.slice(0, 4).map((tag) => (
                  <span key={tag} style={{
                    background: "var(--store-bg, #F0FAF3)", color: "var(--store-primary, #1A7A42)",
                    borderRadius: "999px", padding: "3px 10px",
                    fontSize: "11px", fontWeight: 600, textTransform: "capitalize",
                  }}>{tag}</span>
                ))}
              </div>
            )}

            <h1 style={{
              fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 900,
              letterSpacing: "-0.5px", color: "#1C1C1C", lineHeight: 1.15, marginBottom: "16px",
            }}>
              {product.name}
            </h1>

            <div style={{ marginBottom: "24px", display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "34px", fontWeight: 900, color: "var(--store-primary, #1A7A42)", letterSpacing: "-0.5px" }}>
                {fmt(product.price_kobo)}
              </span>
              {product.is_digital && (
                <span style={{ fontSize: "13px", color: "#6b7280" }}>One-time purchase</span>
              )}
            </div>

            {product.description && (
              <p style={{ fontSize: "15px", lineHeight: 1.8, color: "#374151", marginBottom: "28px", whiteSpace: "pre-line" }}>
                {product.description}
              </p>
            )}

            {!product.is_digital && (
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", marginBottom: "8px", letterSpacing: "0.08em" }}>
                  QUANTITY
                </p>
                <div style={{
                  display: "inline-flex", alignItems: "center",
                  border: "1.5px solid #e2e8f0", borderRadius: "10px", overflow: "hidden",
                }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{
                    width: "42px", height: "42px", border: "none", background: "#f8fafc",
                    cursor: "pointer", fontSize: "18px", color: "#374151",
                  }}>−</button>
                  <span style={{ width: "48px", textAlign: "center", fontWeight: 700, fontSize: "15px" }}>
                    {qty}
                  </span>
                  <button onClick={() => setQty(qty + 1)} style={{
                    width: "42px", height: "42px", border: "none", background: "#f8fafc",
                    cursor: "pointer", fontSize: "18px", color: "#374151",
                  }}>+</button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
              <button onClick={handleBuyNow} style={{
                height: "54px", borderRadius: "14px", border: "none",
                background: "var(--store-primary, #1A7A42)", color: "#fff",
                fontSize: "15px", fontWeight: 800, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 8px 24px rgba(26,122,66,0.35)",
              }}>
                {product.is_digital
                  ? <><Zap style={{ width: "17px", height: "17px" }} /> Get Instant Access</>
                  : <><ShoppingBag style={{ width: "17px", height: "17px" }} /> Buy Now</>
                }
              </button>

              <button onClick={handleAdd} style={{
                height: "54px", borderRadius: "14px",
                border: `2px solid ${added ? "var(--store-primary, #1A7A42)" : "#e2e8f0"}`,
                background: added ? "var(--store-bg, #F0FAF3)" : "#fff",
                color: added ? "var(--store-primary, #1A7A42)" : "#374151",
                fontSize: "15px", fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "all 0.2s",
              }}>
                {added
                  ? <><Check style={{ width: "17px", height: "17px" }} /> Added to cart!</>
                  : <><ShoppingBag style={{ width: "17px", height: "17px" }} /> Add to cart</>
                }
              </button>
            </div>

            {/* Trust badges */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px",
              padding: "16px", background: "#f8fafc", borderRadius: "14px", marginBottom: "20px",
            }}>
              {[
                { icon: Shield, text: "Secure checkout" },
                { icon: Zap, text: product.is_digital ? "Instant delivery" : "Fast shipping" },
                { icon: RotateCcw, text: "7-day guarantee" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ textAlign: "center" }}>
                  <Icon style={{ width: "20px", height: "20px", color: "var(--store-primary, #1A7A42)", margin: "0 auto 5px" }} />
                  <p style={{ fontSize: "10px", fontWeight: 600, color: "#374151", lineHeight: 1.3 }}>{text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
                }
              }}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "none", border: "none", cursor: "pointer",
                color: "#94a3b8", fontSize: "13px", padding: 0,
              }}>
              <Share2 style={{ width: "14px", height: "14px" }} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div style={{ background: "#f8fafc", padding: "60px 24px", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "28px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#1C1C1C", letterSpacing: "-0.3px" }}>
                You may also like
              </h2>
              <Link href="/shop" style={{ fontSize: "13px", fontWeight: 700, color: "var(--store-primary, #1A7A42)", textDecoration: "none" }}>
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
