// apps/storefront/components/templates/lagos/LagosProductDetail.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Minus,
  Plus,
  Check,
  MessageCircle,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { STORE_CONFIG } from "@/lib/storeConfig";
import { PRODUCTS } from "@/lib/data/products";
import { useCart } from "@/lib/cartContext";
import { fmtNaira } from "@gomarket/shared-utils";

export default function LagosProductDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const product = PRODUCTS.find((p) => p.slug === slug);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // useMemo must run unconditionally on every render (rules of hooks),
  // so it sits above the `if (!product)` guard and handles the
  // not-found case internally instead of being skipped.
  const matchedVariant = useMemo(() => {
    if (!product || !product.hasVariants || !product.variants) return undefined;
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#0E0E0E] px-6 text-center text-[#F7F4EE]">
        <p
          className="text-[20px] font-semibold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Piece not found
        </p>
        <p className="mt-2 text-[13px] text-white/45">
          This item may be out of stock or no longer available.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#C75D3A] no-underline hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Browse all pieces
        </Link>
      </div>
    );
  }

  // From this point on, `product` is narrowed to `Product` by the guard
  // above. TypeScript carries this narrowing correctly through the rest
  // of the component body because there is no hook call in between that
  // could have been skipped (which is what previously broke narrowing).

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
    if (!product?.variants) return true;
    const trial = { ...selectedOptions, [optionName]: value };
    return (
      product.variants.some(
        (v) =>
          Object.entries(trial).every(([k, val]) => v.options[k] === val) &&
          v.stock > 0,
      ) || product.variants.some((v) => v.options[optionName] === value)
    );
  }

  function handleAddToCart() {
    if (!product || needsSelection || isOutOfStock) return;
    addToCart(product, matchedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!product || needsSelection || isOutOfStock) return;
    addToCart(product, matchedVariant, quantity);
    router.push("/checkout");
  }

  return (
    <div className="bg-[#0E0E0E] text-[#F7F4EE]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-10 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-white/35">
          <Link href="/" className="no-underline hover:text-white/60">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="no-underline hover:text-white/60">
            Shop
          </Link>
          <span>/</span>
          <span className="text-white/65">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ── Gallery ─────────────────────────────────── */}
          <div>
            <div className="relative aspect-[3/4] overflow-hidden bg-[#1A1A1A]">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-3 border border-white/15" />
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2.5">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-20 w-16 shrink-0 overflow-hidden border transition-colors ${
                      activeImage === i
                        ? "border-[#C75D3A]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details ─────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C75D3A]">
              {product.category}
            </p>
            <h1
              className="mt-3 text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-[1.05] tracking-tight text-[#F7F4EE]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {product.name}
            </h1>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-[22px] font-bold text-[#F7F4EE]">
                {fmtNaira(currentPrice)}
              </span>
              {currentCompareAt && (
                <span className="text-[14px] text-white/35 line-through">
                  {fmtNaira(currentCompareAt)}
                </span>
              )}
            </div>

            <p className="mt-6 max-w-md text-[13.5px] leading-relaxed text-white/55">
              {product.description}
            </p>

            {/* Variant selectors */}
            {product.hasVariants &&
              product.variantOptions?.map((opt) => (
                <div key={opt.name} className="mt-7">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                    {opt.name}
                    {selectedOptions[opt.name] && (
                      <span className="ml-1.5 font-normal normal-case text-white/60">
                        — {selectedOptions[opt.name]}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val) => {
                      const isSelected = selectedOptions[opt.name] === val;
                      const available = isValueAvailable(opt.name, val);
                      return (
                        <button
                          key={val}
                          onClick={() =>
                            available && selectOption(opt.name, val)
                          }
                          disabled={!available}
                          className={`border px-4 py-2 text-[12px] font-medium transition-colors ${
                            isSelected
                              ? "border-[#C75D3A] bg-[#C75D3A]/10 text-[#C75D3A]"
                              : available
                                ? "border-white/15 text-white/70 hover:border-white/40"
                                : "cursor-not-allowed border-white/5 text-white/20 line-through"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            {needsSelection && (
              <p className="mt-4 text-[11.5px] font-medium text-[#C75D3A]">
                Select{" "}
                {product.variantOptions?.map((o) => o.name).join(" and ")} to
                continue
              </p>
            )}

            {!needsSelection && (
              <p
                className={`mt-4 text-[11.5px] font-medium ${isOutOfStock ? "text-red-400" : currentStock <= 5 ? "text-amber-400" : "text-emerald-400"}`}
              >
                {isOutOfStock
                  ? "Sold out"
                  : currentStock <= 5
                    ? `Only ${currentStock} left`
                    : "In stock"}
              </p>
            )}

            {/* Quantity */}
            <div className="mt-7 flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                Qty
              </span>
              <div className="flex items-center gap-4 border border-white/15 px-4 py-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-white/60 transition-colors hover:text-white"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[16px] text-center text-[13px] font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(currentStock || 1, q + 1))
                  }
                  disabled={quantity >= (currentStock || 1)}
                  className="text-white/60 transition-colors hover:text-white disabled:opacity-20"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={needsSelection || isOutOfStock}
                className={`flex-1 border px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  added
                    ? "border-[#C75D3A] bg-[#C75D3A] text-white"
                    : "border-white/25 text-[#F7F4EE] hover:border-white"
                }`}
              >
                {added ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="h-3.5 w-3.5" /> Added
                  </span>
                ) : (
                  "Add to bag"
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={needsSelection || isOutOfStock}
                className="flex-1 bg-[#C75D3A] px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                Buy now
              </button>
            </div>

            {/* Trust strip */}
            <div className="mt-10 space-y-3 border-t border-white/10 pt-7">
              <div className="flex items-center gap-3 text-[12px] text-white/55">
                <Truck className="h-4 w-4 shrink-0 text-[#C75D3A]" /> Delivery
                available nationwide
              </div>
              <div className="flex items-center gap-3 text-[12px] text-white/55">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#C75D3A]" />{" "}
                {STORE_CONFIG.returnPolicy.split(".")[0]}.
              </div>
              <a
                href={`https://wa.me/${STORE_CONFIG.contact.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[12px] font-medium text-[#C75D3A] no-underline hover:underline"
              >
                <MessageCircle className="h-4 w-4 shrink-0" /> Ask a question on
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
