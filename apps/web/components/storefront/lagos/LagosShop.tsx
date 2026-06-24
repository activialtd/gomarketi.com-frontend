"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { PRODUCTS, COLLECTIONS } from "@/lib/data/products";
import { LagosProductCard } from "./LagosProductCard";

const CATEGORIES = Array.from(new Set(PRODUCTS.map((p) => p.category)));

export default function LagosShop() {
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
    <div className="space-y-9">
      <div>
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
          Category
        </p>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`border-l-2 py-1.5 pl-3 text-left text-[13px] transition-colors ${
              categoryFilter === null
                ? "border-[#C75D3A] font-semibold text-[#F7F4EE]"
                : "border-white/10 text-white/45 hover:text-white/70"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`border-l-2 py-1.5 pl-3 text-left text-[13px] capitalize transition-colors ${
                categoryFilter === cat
                  ? "border-[#C75D3A] font-semibold text-[#F7F4EE]"
                  : "border-white/10 text-white/45 hover:text-white/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
          Collections
        </p>
        <div className="flex flex-col gap-0.5">
          {COLLECTIONS.map((col) => (
            <button
              key={col.id}
              onClick={() =>
                setCollectionFilter(collectionFilter === col.id ? null : col.id)
              }
              className={`border-l-2 py-1.5 pl-3 text-left text-[13px] transition-colors ${
                collectionFilter === col.id
                  ? "border-[#C75D3A] font-semibold text-[#F7F4EE]"
                  : "border-white/10 text-white/45 hover:text-white/70"
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
    <div className="bg-[#0E0E0E] text-[#F7F4EE]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1
          className="text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          The full edit
        </h1>
        <p className="mt-2 text-[12.5px] text-white/45">
          {filtered.length} piece{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[200px_1fr]">
          <aside className="hidden lg:block">
            <FilterPanel />
          </aside>

          <div>
            <div className="mb-7 flex items-center justify-between gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-1.5 border border-white/15 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70 transition-colors hover:border-white/30 lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="ml-auto border border-white/15 bg-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70 outline-none"
              >
                <option className="bg-[#0E0E0E]" value="newest">
                  Newest
                </option>
                <option className="bg-[#0E0E0E]" value="price-asc">
                  Price: Low to high
                </option>
                <option className="bg-[#0E0E0E]" value="price-desc">
                  Price: High to low
                </option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="border border-dashed border-white/15 py-24 text-center">
                <p className="text-[14px] font-medium text-white/60">
                  No pieces match these filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {filtered.map((product, i) => (
                  <LagosProductCard
                    key={product.id}
                    product={product}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[280px] overflow-y-auto bg-[#0E0E0E] p-6 [animation:slideIn_0.25s_ease_forwards]">
            <div className="mb-8 flex items-center justify-between">
              <p
                className="text-[16px] font-semibold"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Filter
              </p>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-1 text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
}
