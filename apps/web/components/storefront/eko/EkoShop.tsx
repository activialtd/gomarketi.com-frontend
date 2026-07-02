"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, X, Package } from "lucide-react";
import { ProductCard } from "@/components/storefront/eko/EkoProductCard";
import type { StorefrontProduct } from "@/app/storefront/[slug]/page";

export default function ShopPage({ products = [] }: { products?: StorefrontProduct[] }) {
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Derive tag list from real products
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).slice(0, 12);
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (tagFilter) list = list.filter((p) => p.tags.includes(tagFilter));
    list.sort((a, b) => {
      if (sortBy === "price-asc") return a.price_kobo - b.price_kobo;
      if (sortBy === "price-desc") return b.price_kobo - a.price_kobo;
      return 0; // preserve server order (newest) by default
    });
    return list;
  }, [products, tagFilter, sortBy]);

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400">
          Filter by tag
        </p>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => setTagFilter(null)}
            className={`rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors ${
              tagFilter === null
                ? "bg-[var(--store-bg)] font-bold text-[var(--store-primary)]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            All products
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              className={`rounded-lg px-2.5 py-2 text-left text-[13px] font-medium capitalize transition-colors ${
                tagFilter === tag
                  ? "bg-[var(--store-bg)] font-bold text-[var(--store-primary)]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--store-text)]">
          {tagFilter ? `${tagFilter}` : "Shop all"}
        </h1>
        <p className="mt-1.5 text-[13px] text-gray-500">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
        {/* Desktop filter sidebar */}
        {allTags.length > 0 && (
          <aside className="hidden lg:block">
            <FilterPanel />
          </aside>
        )}

        <div className={allTags.length === 0 ? "col-span-full" : ""}>
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            {allTags.length > 0 && (
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              </button>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "price-asc" | "price-desc")}
              className="ml-auto rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-700 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>

          {/* Product grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-24 gap-4 text-center">
              <Package className="h-10 w-10 text-gray-300" />
              <p className="text-[14px] font-semibold text-gray-500">
                {products.length === 0 ? "No products yet" : "No products match this filter"}
              </p>
              {tagFilter && (
                <button onClick={() => setTagFilter(null)}
                  className="text-[13px] font-semibold text-[var(--store-primary)] hover:underline">
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[280px] overflow-y-auto bg-white p-5">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[15px] font-extrabold text-[var(--store-text)]">Filters</p>
              <button onClick={() => setFiltersOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
}
