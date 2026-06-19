"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Plus } from "lucide-react";
import { fmtNaira } from "@gomarket/shared-utils";
import type { Product } from "@/lib/data/products";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const isOut = product.stock === 0;
  const discountPct = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative block"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="animate-[fadeUp_0.5s_ease_forwards] opacity-0 [animation-fill-mode:forwards]">
        {/* ── Image stage ─────────────────────────────────── */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--store-bg)]">
          {/* Skeleton shimmer while image loads */}
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[var(--store-bg)] via-white/40 to-[var(--store-bg)]" />
          )}

          <img
            src={product.images[0]}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.06] ${
              imgLoaded ? "opacity-100" : "opacity-0"
            } ${isOut ? "saturate-0 opacity-50" : ""}`}
          />

          {/* Soft gradient for legibility of badges */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {discountPct && !isOut && (
              <span className="rounded-full bg-[var(--store-primary)] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                −{discountPct}%
              </span>
            )}
            {product.featured && !isOut && (
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[var(--store-text)] shadow-sm backdrop-blur-sm">
                ★ Featured
              </span>
            )}
          </div>

          {isOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 shadow-md">
                Out of stock
              </span>
            </div>
          )}

          {/* Quick-add affordance — rises from the bottom on hover */}
          {!isOut && (
            <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-white/95 py-2.5 text-[12px] font-bold text-[var(--store-text)] shadow-lg backdrop-blur-sm transition-colors group-hover:bg-[var(--store-primary)] group-hover:text-white">
                <ShoppingBag className="h-3.5 w-3.5" />
                View product
              </div>
            </div>
          )}
        </div>

        {/* ── Info ─────────────────────────────────────────── */}
        <div className="mt-3 flex items-start justify-between gap-2 px-0.5">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-snug text-[var(--store-text)]">
              {product.name}
            </p>
            <p className="mt-0.5 text-[11px] capitalize text-gray-400">
              {product.category}
            </p>
          </div>

          {/* Add icon — desktop-only quick action, separate from the link */}
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            aria-label="Quick add"
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all duration-200 hover:border-[var(--store-primary)] hover:text-[var(--store-primary)] sm:flex"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-1.5 flex items-center gap-2 px-0.5">
          <span className="text-[14px] font-bold text-[var(--store-primary)]">
            {fmtNaira(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-[11px] text-gray-400 line-through">
              {fmtNaira(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
