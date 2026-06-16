"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Download,
  Search,
  LayoutGrid,
  LayoutList,
  Tag,
  Package,
  ChevronDown,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  Layers,
  Loader2,
} from "lucide-react";
import { type Product, COLLECTIONS } from "@/lib/data/products";
import { catalogueApi } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/lib/config/routes";
import { fmt } from "@gomarket/shared-utils";
import {
  CollectionsTab,
  EmptyProducts,
  ProductCard,
  ProductRow,
  StatCard,
} from "./helpers";

type Tab = "products" | "collections";
type ViewMode = "grid" | "list";
type SortKey = "name" | "price" | "stock" | "sold" | "createdAt";

export default function ProductsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [tab, setTab] = useState<Tab>("products");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    async function load() {
      setLoadingProducts(true);
      try {
        const resp = await catalogueApi.listProducts({ per_page: 100 }, accessToken!);
        if (cancelled) return;
        const mapped: Product[] = resp.products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.id,
          category: p.category_id ?? "Uncategorised",
          collectionIds: [],
          description: p.description ?? "",
          images: p.images ?? [],
          price: p.price_kobo / 100,
          currency: "NGN",
          hasVariants: false,
          stock: p.stock,
          sold: 0,
          status: p.stock === 0 ? "out_of_stock" : p.is_published ? "active" : "draft",
          featured: false,
          createdAt: p.created_at,
          tags: p.tags ?? [],
        }));
        setProducts(mapped);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [accessToken]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredProducts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)) ||
          p.category.includes(q),
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    list.sort((a, b) => {
      let va: number | string = a[sortKey] as any;
      let vb: number | string = b[sortKey] as any;
      if (typeof va === "string" && typeof vb === "string") {
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortAsc
        ? (va as number) - (vb as number)
        : (vb as number) - (va as number);
    });
    return list;
  }, [products, search, statusFilter, sortKey, sortAsc]);

  const totalRetailValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const outOfStock = products.filter((p) => p.status === "out_of_stock").length;

  const allSelected =
    filteredProducts.length > 0 && selected.size === filteredProducts.length;

  return (
    <div className="w-full">
      {/* ── Page header ──────────────────────────────────── */}
      <div
        className="px-6 lg:px-8 py-4 border-b flex flex-wrap items-center justify-between gap-3"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <div className="flex items-center gap-2.5">
          <h1
            className="text-[20px] font-extrabold"
            style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
          >
            Products
          </h1>
          {!loadingProducts && (
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#F0FAF3", color: "#1A7A42" }}
            >
              {products.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Import */}
          <button
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] border text-[12px] font-semibold transition-colors"
            style={{
              borderColor: "#e2e8f0",
              background: "#fff",
              color: "#374151",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#F0FAF3")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <Download className="w-3.5 h-3.5" /> Import
          </button>

          {/* Actions dropdown */}
          <button
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] border text-[12px] font-semibold transition-colors"
            style={{
              borderColor: "#e2e8f0",
              background: "#fff",
              color: "#374151",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#F0FAF3")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
          >
            Actions <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Add product */}
          <Link
            href={ROUTES.MERCHANT.PRODUCTS_NEW}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[8px] text-white text-[12px] font-bold transition-all active:scale-[0.98]"
            style={{
              background: "#1A7A42",
              boxShadow: "0 2px 8px rgba(26,122,66,0.25)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#239452")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
          >
            <Plus className="w-3.5 h-3.5" /> Add New Product
          </Link>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-5 space-y-5">
        {/* ── Stats row ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Retail Value"
            value={loadingProducts ? "—" : fmt(totalRetailValue)}
            icon={Tag}
            iconBg="#eff6ff"
            iconColor="#3b82f6"
          />
          <StatCard
            label="Total Products"
            value={loadingProducts ? "—" : String(products.length)}
            icon={Package}
            iconBg="#fef3c7"
            iconColor="#f59e0b"
          />
          <StatCard
            label="Published"
            value={loadingProducts ? "—" : String(products.filter((p) => p.status === "active").length)}
            icon={ArrowUpDown}
            iconBg="#F0FAF3"
            iconColor="#1A7A42"
          />
          <StatCard
            label="Out of Stock"
            value={loadingProducts ? "—" : String(outOfStock)}
            icon={AlertTriangle}
            iconBg="#fee2e2"
            iconColor="#dc2626"
          />
        </div>

        {/* ── Tab bar ───────────────────────────────────── */}
        <div
          className="flex items-center gap-0 border-b"
          style={{ borderColor: "#e2e8f0" }}
        >
          {(["products", "collections"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2.5 text-[13px] font-semibold capitalize border-b-2 transition-colors"
              style={{
                borderColor: tab === t ? "#1A7A42" : "transparent",
                color: tab === t ? "#1A7A42" : "#6b7280",
                marginBottom: "-1px",
              }}
            >
              {t === "collections" ? (
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Collections
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5"
                    style={{ background: "#F0FAF3", color: "#1A7A42" }}
                  >
                    {COLLECTIONS.length}
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Products
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5"
                    style={{ background: "#F0FAF3", color: "#1A7A42" }}
                  >
                    {products.length}
                  </span>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Products tab ──────────────────────────────── */}
        {tab === "products" && (
          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: "#94a3b8" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="w-full h-9 pl-9 pr-3 rounded-[8px] border text-[13px] transition-all outline-none"
                  style={{
                    borderColor: "#e2e8f0",
                    background: "#F0FAF3",
                    color: "#1C1C1C",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = "#1A7A42";
                    e.currentTarget.style.outline = "2px solid #1A7A42";
                    e.currentTarget.style.outlineOffset = "-2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = "#F0FAF3";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.outline = "none";
                  }}
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-[8px] border text-[12px] font-medium outline-none transition-all appearance-none"
                style={{
                  borderColor: "#e2e8f0",
                  background: "#F0FAF3",
                  color: "#374151",
                }}
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of stock</option>
                <option value="archived">Archived</option>
              </select>

              {/* Sort */}
              <button
                onClick={() => setSortAsc((v) => !v)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] border text-[12px] font-medium transition-colors"
                style={{
                  borderColor: "#e2e8f0",
                  background: "#F0FAF3",
                  color: "#374151",
                }}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortAsc ? "Oldest" : "Newest"}
              </button>

              <div className="flex-1" />

              {/* Bulk action */}
              {selected.size > 0 && (
                <div className="flex items-center gap-2">
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: "#374151" }}
                  >
                    {selected.size} selected
                  </span>
                  <button
                    className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] border text-[12px] font-medium hover:bg-red-50 transition-colors"
                    style={{ borderColor: "#fca5a5", color: "#dc2626" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}

              {/* View toggle */}
              <div
                className="flex items-center rounded-[8px] border overflow-hidden"
                style={{ borderColor: "#e2e8f0" }}
              >
                {(["list", "grid"] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="h-9 w-9 flex items-center justify-center transition-colors"
                    style={{
                      background: viewMode === mode ? "#F0FAF3" : "#fff",
                      color: viewMode === mode ? "#1A7A42" : "#94a3b8",
                    }}
                  >
                    {mode === "grid" ? (
                      <LayoutGrid className="w-4 h-4" />
                    ) : (
                      <LayoutList className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            {loadingProducts ? (
              <div className="flex items-center justify-center py-20 gap-2" style={{ color: "#94a3b8" }}>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[13px]">Loading products…</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyProducts />
            ) : viewMode === "list" ? (
              <div
                className="rounded-[12px] border overflow-hidden"
                style={{ borderColor: "#e2e8f0" }}
              >
                {/* List header */}
                <div
                  className="hidden sm:grid px-4 py-2.5 border-b"
                  style={{
                    gridTemplateColumns:
                      "36px 48px 1fr 120px 100px 80px 80px 50px",
                    gap: "12px",
                    background: "#fafafa",
                    borderColor: "#e2e8f0",
                  }}
                >
                  {/* Select all */}
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center justify-center"
                  >
                    <div
                      className="w-4 h-4 rounded-[4px] flex items-center justify-center"
                      style={{
                        background: allSelected ? "#1A7A42" : "transparent",
                        border: `1.5px solid ${allSelected ? "#1A7A42" : "#d1d5db"}`,
                      }}
                    >
                      {allSelected && (
                        <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                          <path
                            d="M1 3.5l2 2L7 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                  <div />
                  {[
                    { key: "name", label: "Product" },
                    { key: "price", label: "Price" },
                    { key: null, label: "Status" },
                    { key: "stock", label: "Stock" },
                    { key: "sold", label: "Sold" },
                  ].map(({ key, label }) => (
                    <button
                      key={label}
                      onClick={() => {
                        if (key) {
                          setSortKey(key as SortKey);
                          setSortAsc((v) => !v);
                        }
                      }}
                      className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-left"
                      style={{ color: sortKey === key ? "#1A7A42" : "#94a3b8" }}
                    >
                      {label}
                      {key && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                  ))}
                  <div />
                </div>

                {filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    selected={selected.has(product.id)}
                    onSelect={toggleSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    selected={selected.has(product.id)}
                    onSelect={toggleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Collections tab ───────────────────────────── */}
        {tab === "collections" && <CollectionsTab />}
      </div>
    </div>
  );
}
