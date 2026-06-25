"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Plus, Download } from "lucide-react";
import type { StorefrontProduct } from "@/app/storefront/[slug]/page";

function fmtPrice(kobo: number): string {
  return "₦" + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function ProductCard({
  product,
  index = 0,
}: {
  product: StorefrontProduct;
  index?: number;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasImage = product.images.length > 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative block"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="animate-[fadeUp_0.5s_ease_forwards] opacity-0 [animation-fill-mode:forwards]">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--store-bg)]">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[var(--store-bg)] via-white/40 to-[var(--store-bg)]" />
          )}

          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.name}
              onLoad={() => setImgLoaded(true)}
              className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.06] ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-[var(--store-bg)]">
              {product.is_digital
                ? <Download className="h-8 w-8 text-[var(--store-primary)] opacity-40" />
                : <ShoppingBag className="h-8 w-8 text-[var(--store-primary)] opacity-40" />
              }
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {product.is_digital ? "Digital" : "Product"}
              </span>
            </div>
          )}

          {/* Digital badge */}
          {product.is_digital && (
            <div className="absolute left-3 top-3">
              <span className="flex items-center gap-1 rounded-full bg-[var(--store-primary)] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                <Download className="h-2.5 w-2.5" /> Digital
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-white/95 py-2.5 text-[12px] font-bold text-[var(--store-text)] shadow-lg backdrop-blur-sm transition-colors group-hover:bg-[var(--store-primary)] group-hover:text-white">
              <ShoppingBag className="h-3.5 w-3.5" />
              {product.is_digital ? "Get it now" : "View product"}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 flex items-start justify-between gap-2 px-0.5">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-snug text-[var(--store-text)]">
              {product.name}
            </p>
            {product.tags.length > 0 && (
              <p className="mt-0.5 text-[11px] capitalize text-gray-400 truncate">
                {product.tags[0]}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            aria-label="Quick view"
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all duration-200 hover:border-[var(--store-primary)] hover:text-[var(--store-primary)] sm:flex"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-1.5 px-0.5">
          <span className="text-[14px] font-bold text-[var(--store-primary)]">
            {fmtPrice(product.price_kobo)}
          </span>
        </div>
      </div>
    </Link>
  );
}
