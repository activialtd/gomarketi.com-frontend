// apps/storefront/app/products/[slug]/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  ShoppingBag,
  Check,
  ChevronRight,
  MessageCircle,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { STORE_CONFIG } from "@/lib/storeConfig";
import { Product, PRODUCTS } from "@/lib/data/products";
import { useCart } from "@/lib/cartContext";
import { fmtNaira } from "@gomarket/shared-utils";

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const c = STORE_CONFIG.colors;
  const router = useRouter();
  const { addToCart } = useCart();
  const product = PRODUCTS.find((p) => p.slug === params.slug) ?? null;
  const [activeImage, setActiveImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const matchedVariant = useMemo(() => {
    if (!product?.hasVariants || !product.variants) return undefined;

    const allSelected = product.variantOptions?.every(
      (opt) => selectedOptions[opt.name],
    );

    if (!allSelected) return undefined;

    return product.variants.find((v) =>
      Object.entries(selectedOptions).every(
        ([key, val]) => v.options[key] === val,
      ),
    );
  }, [product, selectedOptions]);

  if (!product) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: c.text,
            marginBottom: "8px",
          }}
        >
          Product not found
        </p>
        <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
          This item may be out of stock or no longer available.
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
          Browse all products →
        </Link>
      </div>
    );
  }

  const needsSelection = product.hasVariants && !matchedVariant;
  const currentPrice = matchedVariant?.price ?? product.price;
  const currentCompareAt = matchedVariant
    ? matchedVariant.compareAtPrice
    : product.compareAtPrice;
  const currentStock = matchedVariant?.stock ?? product.stock;
  const isOutOfStock = product.hasVariants
    ? matchedVariant
      ? matchedVariant.stock === 0
      : false
    : product.stock === 0;

  function selectOption(optionName: string, value: string) {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
    setQuantity(1);
    setAdded(false);
  }

  function isValueAvailable(optionName: string, value: string): boolean {
    if (!product!.variants) return true;
    // Check if any variant with this value (given other current selections) has stock
    const trial = { ...selectedOptions, [optionName]: value };
    return (
      product!.variants.some(
        (v) =>
          Object.entries(trial).every(([k, val]) => v.options[k] === val) &&
          v.stock > 0,
      ) || product!.variants.some((v) => v.options[optionName] === value)
    ); // fallback: at least exists
  }

  function handleAddToCart() {
    if (needsSelection || isOutOfStock) return;
    addToCart(product!, matchedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (needsSelection || isOutOfStock) return;
    addToCart(product!, matchedVariant, quantity);
    router.push("/checkout");
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px 20px 64px",
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          color: "#94a3b8",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <Link href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" style={{ color: "#94a3b8", textDecoration: "none" }}>
          Shop
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span style={{ color: c.text, fontWeight: 600 }}>{product.name}</span>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}
        className="product-grid"
      >
        {/* ── Image gallery ────────────────────────────────── */}
        <div>
          <div
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              aspectRatio: "1",
              background: c.bg,
              marginBottom: "12px",
            }}
          >
            <img
              src={product.images[activeImage]}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: "8px" }}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    flexShrink: 0,
                    border:
                      activeImage === i
                        ? `2px solid ${c.primary}`
                        : "2px solid #f1f5f9",
                    cursor: "pointer",
                    padding: 0,
                    background: "none",
                  }}
                >
                  <img
                    src={img}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ──────────────────────────────────────── */}
        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: c.primary,
              marginBottom: "8px",
            }}
          >
            {product.category}
          </p>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 900,
              color: c.text,
              letterSpacing: "-0.5px",
              marginBottom: "12px",
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{ fontSize: "24px", fontWeight: 800, color: c.primary }}
            >
              {fmtNaira(currentPrice)}
            </span>
            {currentCompareAt && (
              <span
                style={{
                  fontSize: "15px",
                  color: "#94a3b8",
                  textDecoration: "line-through",
                }}
              >
                {fmtNaira(currentCompareAt)}
              </span>
            )}
          </div>

          <p
            style={{
              fontSize: "14px",
              color: "#374151",
              lineHeight: 1.7,
              marginBottom: "24px",
            }}
          >
            {product.description}
          </p>

          {/* Variant selectors */}
          {product.hasVariants &&
            product.variantOptions?.map((opt) => (
              <div key={opt.name} style={{ marginBottom: "20px" }}>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: c.text,
                    marginBottom: "10px",
                  }}
                >
                  {opt.name}
                  {selectedOptions[opt.name] && (
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      {" "}
                      — {selectedOptions[opt.name]}
                    </span>
                  )}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {opt.values.map((val) => {
                    const isSelected = selectedOptions[opt.name] === val;
                    const available = isValueAvailable(opt.name, val);
                    return (
                      <button
                        key={val}
                        onClick={() => available && selectOption(opt.name, val)}
                        disabled={!available}
                        style={{
                          padding: "9px 16px",
                          borderRadius: "9px",
                          fontSize: "13px",
                          fontWeight: 600,
                          border: isSelected
                            ? `2px solid ${c.primary}`
                            : "1.5px solid #e2e8f0",
                          background: isSelected ? c.bg : "#fff",
                          color: !available
                            ? "#d1d5db"
                            : isSelected
                              ? c.primary
                              : "#374151",
                          cursor: available ? "pointer" : "not-allowed",
                          textDecoration: !available ? "line-through" : "none",
                          position: "relative",
                        }}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          {needsSelection && (
            <p
              style={{
                fontSize: "12px",
                color: "#f59e0b",
                marginBottom: "16px",
                fontWeight: 600,
              }}
            >
              Please select{" "}
              {product.variantOptions?.map((o) => o.name).join(" and ")} to
              continue
            </p>
          )}

          {/* Stock indicator */}
          {!needsSelection && (
            <p
              style={{
                fontSize: "12px",
                marginBottom: "20px",
                fontWeight: 600,
                color: isOutOfStock
                  ? "#dc2626"
                  : currentStock <= 5
                    ? "#f59e0b"
                    : "#15803d",
              }}
            >
              {isOutOfStock
                ? "Out of stock"
                : currentStock <= 5
                  ? `Only ${currentStock} left in stock`
                  : "In stock"}
            </p>
          )}

          {/* Quantity */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 700, color: c.text }}>
              Quantity
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: "10px",
                padding: "6px 10px",
              }}
            >
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                }}
              >
                <Minus className="w-3.5 h-3.5" style={{ color: "#374151" }} />
              </button>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(currentStock || 1, q + 1))
                }
                disabled={quantity >= (currentStock || 1)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  opacity: quantity >= (currentStock || 1) ? 0.3 : 1,
                }}
              >
                <Plus className="w-3.5 h-3.5" style={{ color: "#374151" }} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
            <button
              onClick={handleAddToCart}
              disabled={needsSelection || isOutOfStock}
              style={{
                flex: 1,
                height: "48px",
                borderRadius: "12px",
                border: `2px solid ${c.primary}`,
                background: added ? c.primary : "#fff",
                color: added ? "#fff" : c.primary,
                fontSize: "13px",
                fontWeight: 800,
                cursor:
                  needsSelection || isOutOfStock ? "not-allowed" : "pointer",
                opacity: needsSelection || isOutOfStock ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Added
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add to cart
                </>
              )}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={needsSelection || isOutOfStock}
              style={{
                flex: 1,
                height: "48px",
                borderRadius: "12px",
                border: "none",
                background: c.primary,
                color: "#fff",
                fontSize: "13px",
                fontWeight: 800,
                cursor:
                  needsSelection || isOutOfStock ? "not-allowed" : "pointer",
                opacity: needsSelection || isOutOfStock ? 0.5 : 1,
                boxShadow: `0 4px 14px ${c.primary}40`,
              }}
            >
              Buy now
            </button>
          </div>

          {/* Trust badges */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "16px",
              borderRadius: "12px",
              background: c.bg,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Truck
                className="w-4 h-4 shrink-0"
                style={{ color: c.primary }}
              />
              <span style={{ fontSize: "12px", color: "#374151" }}>
                Delivery available nationwide
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldCheck
                className="w-4 h-4 shrink-0"
                style={{ color: c.primary }}
              />
              <span style={{ fontSize: "12px", color: "#374151" }}>
                {STORE_CONFIG.returnPolicy.split(".")[0]}.
              </span>
            </div>
            <a
              href={`https://wa.me/${STORE_CONFIG.contact.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
              }}
            >
              <MessageCircle
                className="w-4 h-4 shrink-0"
                style={{ color: c.primary }}
              />
              <span
                style={{ fontSize: "12px", color: c.primary, fontWeight: 600 }}
              >
                Ask a question on WhatsApp
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
