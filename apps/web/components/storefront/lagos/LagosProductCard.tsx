"use client";
import Link from "next/link";
import { useState } from "react";
import { Download } from "lucide-react";
import type { StorefrontProduct } from "@/app/storefront/[slug]/page";

function fmtPrice(kobo: number): string {
  return "₦" + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function LagosProductCard({
  product,
  index = 0,
  tall = false,
}: {
  product: StorefrontProduct;
  index?: number;
  tall?: boolean;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const hasImage = product.images.length > 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative block opacity-0 [animation-fill-mode:forwards]"
      style={{ animation: `fadeUp 0.6s ease forwards ${index * 70}ms` }}
    >
      <div className={`relative overflow-hidden bg-[#1A1A1A] ${tall ? "aspect-[3/4.4]" : "aspect-[3/4]"}`}>
        {!imgLoaded && hasImage && (
          <div className="absolute inset-0 animate-pulse bg-white/5" />
        )}

        {hasImage ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.04] ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2">
            <Download className="h-8 w-8 text-white/20" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/30">
              {product.is_digital ? "Digital" : "Product"}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Price tag */}
        <div className="absolute right-3 top-3">
          <span className="bg-[#F7F4EE] px-2.5 py-1 text-[11px] font-bold tracking-tight text-[#0E0E0E]">
            {fmtPrice(product.price_kobo)}
          </span>
        </div>

        {product.is_digital && (
          <div className="absolute left-3 top-3">
            <span className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              <Download className="h-2.5 w-2.5" /> Digital
            </span>
          </div>
        )}

        {/* Name reveal on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-[12.5px] font-semibold leading-snug text-white">{product.name}</p>
          {product.tags[0] && (
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.08em] text-white/55">{product.tags[0]}</p>
          )}
        </div>
      </div>

      {/* Mobile label */}
      <div className="mt-2.5 flex items-baseline justify-between gap-2 sm:hidden">
        <p className="truncate text-[12.5px] font-medium text-[#F7F4EE]">{product.name}</p>
        <span className="shrink-0 text-[12px] font-bold text-[#C75D3A]">{fmtPrice(product.price_kobo)}</span>
      </div>
    </Link>
  );
}
