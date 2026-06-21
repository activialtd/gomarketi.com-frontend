"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PRODUCTS, COLLECTIONS } from "@/lib/data/products";
import { LagosProductCard } from "./LagosProductCard";

export default function LagosCollection({
  collectionSlug,
}: {
  collectionSlug: string;
}) {
  const collection = COLLECTIONS.find((col) => col.slug === collectionSlug);

  if (!collection) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#0E0E0E] px-6 text-center text-[#F7F4EE]">
        <p
          className="text-[20px] font-semibold"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Collection not found
        </p>
        <p className="mt-2 text-[13px] text-white/45">
          This collection may have been removed or renamed.
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

  const products = collection.productIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(
      (p): p is NonNullable<typeof p> =>
        !!p && (p.status === "active" || p.status === "out_of_stock"),
    );

  return (
    <div className="bg-[#0E0E0E] text-[#F7F4EE]">
      {/* Hero band */}
      <section className="relative h-[320px] overflow-hidden sm:h-[400px]">
        <img
          src={collection.coverImage}
          alt={collection.name}
          className="h-full w-full scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-black/40 to-black/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-12 text-center">
          <Link
            href="/shop"
            className="mb-5 inline-flex items-center gap-1.5 border border-white/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/80 no-underline transition-colors hover:border-white hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" /> All pieces
          </Link>
          <h1
            className="text-[clamp(2rem,5.5vw,3.5rem)] font-semibold leading-[0.95] tracking-tight text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {collection.name}
          </h1>
          <p className="mt-4 max-w-md text-[13px] text-white/65">
            {collection.description}
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="mb-8 text-[11px] uppercase tracking-[0.12em] text-white/40">
          {products.length} piece{products.length !== 1 ? "s" : ""} in this
          collection
        </p>

        {products.length === 0 ? (
          <div className="border border-dashed border-white/15 py-24 text-center">
            <p className="text-[14px] font-medium text-white/60">
              No pieces in this collection yet
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-block text-[12px] font-semibold uppercase tracking-[0.1em] text-[#C75D3A] no-underline hover:underline"
            >
              Shop all pieces →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product, i) => (
              <LagosProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
