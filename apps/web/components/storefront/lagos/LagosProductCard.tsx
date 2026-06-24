"use client";
import Link from "next/link";
import { useState } from "react";
import { fmtNaira } from "@gomarket/shared-utils";
import type { Product } from "@/lib/data/products";

export function LagosProductCard({
  product,
  index = 0,
  tall = false,
}: {
  product: Product;
  index?: number;
  tall?: boolean;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isOut = product.stock === 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative block opacity-0 [animation-fill-mode:forwards]"
      style={{ animation: `fadeUp 0.6s ease forwards ${index * 70}ms` }}
    >
      <div
        className={`relative overflow-hidden bg-[#1A1A1A] ${tall ? "aspect-[3/4.4]" : "aspect-[3/4]"}`}
      >
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-white/5" />
        )}

        <img
          src={product.images[0]}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.04] ${
            imgLoaded ? "opacity-100" : "opacity-0"
          } ${isOut ? "grayscale opacity-50" : ""}`}
        />

        {/* Vignette on hover for tag legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Floating price tag — top-right, the Lagos signature instead of badges */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
          <span className="bg-[#F7F4EE] px-2.5 py-1 text-[11px] font-bold tracking-tight text-[#0E0E0E]">
            {fmtNaira(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="bg-[#C75D3A] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              Sale
            </span>
          )}
        </div>

        {isOut && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="border border-white/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
              Sold out
            </span>
          </div>
        )}

        {/* Name reveal — slides up from bottom edge on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-[12.5px] font-semibold leading-snug text-white">
            {product.name}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.08em] text-white/55">
            {product.category}
          </p>
        </div>
      </div>

      {/* Static label below — always visible, name + price for non-hover (mobile-first) sm:hidden the hover one shows instead */}
      <div className="mt-2.5 flex items-baseline justify-between gap-2 sm:hidden">
        <p className="truncate text-[12.5px] font-medium text-[#F7F4EE]">
          {product.name}
        </p>
        <span className="shrink-0 text-[12px] font-bold text-[#C75D3A]">
          {fmtNaira(product.price)}
        </span>
      </div>
    </Link>
  );
}
