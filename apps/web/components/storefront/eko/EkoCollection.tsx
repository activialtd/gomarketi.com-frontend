"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PRODUCTS, COLLECTIONS } from "@/lib/data/products";
import { ProductCard } from "@/components/storefront/eko/EkoProductCard";

export default function CollectionPage({
  collectionSlug,
}: {
  collectionSlug: string;
}) {
  const collection = COLLECTIONS.find((col) => col.slug === collectionSlug);

  if (!collection) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-[18px] font-extrabold text-[var(--store-text)]">
          Collection not found
        </p>
        <p className="mt-2 text-[13px] text-gray-500">
          This collection may have been removed or renamed.
        </p>
        <Link
          href="/shop"
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--store-primary)] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Browse all products
        </Link>
      </div>
    );
  }

  // Adapt legacy mock Product shape to the real StorefrontProduct shape
  // the live ProductCard expects. This page is pending rewiring to the
  // real collections API — until then it renders from mock catalogue data.
  const products = collection.productIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(
      (p): p is NonNullable<typeof p> =>
        !!p && (p.status === "active" || p.status === "out_of_stock"),
    )
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price_kobo: Math.round(p.price * 100),
      images: p.images,
      tags: p.tags,
      is_digital: false,
      category_id: undefined as string | undefined,
    }));

  return (
    <div>
      {/* ── Collection hero ───────────────────────────────── */}
      <section className="relative h-[260px] overflow-hidden sm:h-[320px]">
        <img
          src={collection.coverImage}
          alt={collection.name}
          className="h-full w-full scale-105 object-cover [animation:fadeUp_0.8s_ease_forwards]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <Link
            href="/shop"
            className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            <ArrowLeft className="h-3 w-3" /> All products
          </Link>
          <h1 className="text-[clamp(1.75rem,4.5vw,2.5rem)] font-extrabold tracking-tight text-white">
            {collection.name}
          </h1>
          <p className="mt-3 max-w-md text-[13px] text-white/80">
            {collection.description}
          </p>
        </div>
      </section>

      {/* ── Products ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-7 flex items-baseline justify-between">
          <p className="text-[13px] text-gray-500">
            <span className="font-bold text-[var(--store-text)]">
              {products.length}
            </span>{" "}
            product{products.length !== 1 ? "s" : ""} in this collection
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center">
            <p className="text-[14px] font-semibold text-gray-600">
              No products in this collection yet
            </p>
            <p className="mt-1 text-[12px] text-gray-400">
              Check back soon, or explore the full catalogue.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-block text-[13px] font-bold text-[var(--store-primary)] hover:underline"
            >
              Shop all products →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
