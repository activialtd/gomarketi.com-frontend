"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { PRODUCTS, COLLECTIONS } from "@/lib/data/products";
import { ProductCard } from "@/components/storefront/ProductCard";

const CATEGORIES = Array.from(new Set(PRODUCTS.map((p) => p.category)));

export default function ShopPage() {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">(
    "newest",
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter(
      (p) => p.status === "active" || p.status === "out_of_stock",
    );
    if (categoryFilter)
      list = list.filter((p) => p.category === categoryFilter);
    if (collectionFilter)
      list = list.filter((p) => p.collectionIds.includes(collectionFilter));
    list = [...list].sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [categoryFilter, collectionFilter, sortBy]);

  const FilterPanel = () => (
    <div className="space-y-7">
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400">
          Category
        </p>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors ${
              categoryFilter === null
                ? "bg-[var(--store-bg)] font-bold text-[var(--store-primary)]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            All categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-2.5 py-2 text-left text-[13px] font-medium capitalize transition-colors ${
                categoryFilter === cat
                  ? "bg-[var(--store-bg)] font-bold text-[var(--store-primary)]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-400">
          Collections
        </p>
        <div className="flex flex-col gap-0.5">
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              onClick={() =>
                setCollectionFilter(collectionFilter === col.id ? null : col.id)
              }
              className={`rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors ${
                collectionFilter === col.id
                  ? "bg-[var(--store-bg)] font-bold text-[var(--store-primary)]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {col.name}
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
          Shop all
        </h1>
        <p className="mt-1.5 text-[13px] text-gray-500">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block">
          <FilterPanel />
        </aside>

        <div>
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="ml-auto rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-700 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
            </select>
          </div>

          {/* Product grid */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center">
              <p className="text-[14px] font-semibold text-gray-600">
                No products match these filters
              </p>
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
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[280px] overflow-y-auto bg-white p-5 [animation:slideIn_0.25s_ease_forwards]">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[15px] font-extrabold text-[var(--store-text)]">
                Filters
              </p>
              <button
                onClick={() => setFiltersOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
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
