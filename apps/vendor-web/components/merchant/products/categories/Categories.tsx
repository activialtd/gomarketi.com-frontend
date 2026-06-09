"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Tag,
  Package,
  Check,
  X,
  ArrowUpDown,
  Info,
} from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/data/categories";
import { CategoryFormValues } from "@/lib/validations/schemas";
import { CategoryFormPanel, CategoryRow, DeleteModal } from "./helpers";
import { toSlug } from "@gomarket/shared-utils";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "productCount">("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  }

  const filtered = useMemo(() => {
    let list = [...categories];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      if (sortBy === "name")
        return sortAsc
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      return sortAsc
        ? a.productCount - b.productCount
        : b.productCount - a.productCount;
    });
    return list;
  }, [categories, search, sortBy, sortAsc]);

  function handleSave(data: CategoryFormValues, id?: string) {
    if (id) {
      // Edit existing
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                name: data.name,
                description: data.description,
                emoji: data.emoji,
                color: data.color,
                slug: data.slug ?? c.slug,
              }
            : c,
        ),
      );
      setEditTarget(null);
      showToast(`"${data.name}" updated`);
    } else {
      // Create new
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: data.name,
        slug: data.slug ?? toSlug(data.name),
        description: data.description,
        emoji: data.emoji,
        color: data.color,
        productCount: 0,
        isDefault: false,
        createdAt: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCat]);
      showToast(`"${data.name}" added`);
    }
  }

  function handleDelete(category: Category) {
    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    setDeleteTarget(null);
    if (editTarget?.id === category.id) setEditTarget(null);
    showToast(`"${category.name}" deleted`, "error");
  }

  const totalProducts = categories.reduce((s, c) => s + c.productCount, 0);
  const customCount = categories.filter((c) => !c.isDefault).length;

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
            Categories
          </h1>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#F0FAF3", color: "#1A7A42" }}
          >
            {categories.length}
          </span>
        </div>

        {/* Stats pills */}
        <div className="hidden sm:flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 text-[12px]"
            style={{ color: "#6b7280" }}
          >
            <Tag className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
            <span>
              <strong style={{ color: "#1C1C1C" }}>{customCount}</strong> custom
            </span>
          </div>
          <div className="w-px h-4" style={{ background: "#e2e8f0" }} />
          <div
            className="flex items-center gap-1.5 text-[12px]"
            style={{ color: "#6b7280" }}
          >
            <Package className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
            <span>
              <strong style={{ color: "#1C1C1C" }}>{totalProducts}</strong>{" "}
              products categorised
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
          {/* ── LEFT: Category list ──────────────────────── */}
          <div className="space-y-4">
            {/* Info notice */}
            <div
              className="flex items-start gap-2.5 px-4 py-3 rounded-[10px] border text-[12px] leading-relaxed"
              style={{
                background: "#fffbeb",
                borderColor: "rgba(245,158,11,0.2)",
                color: "#92400e",
              }}
            >
              <Info
                className="w-3.5 h-3.5 shrink-0 mt-0.5"
                style={{ color: "#f59e0b" }}
              />
              <span>
                <strong>Default categories</strong> are shared across all
                GoMarket stores and can't be deleted — only hidden per product.
                Add your own custom categories to match how you organise your
                inventory.
              </span>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: "#94a3b8" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories…"
                  className="w-full h-9 pl-9 pr-3 rounded-[8px] border text-[13px] outline-none transition-all"
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
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (sortBy === "name") setSortAsc((v) => !v);
                  else {
                    setSortBy("name");
                    setSortAsc(true);
                  }
                }}
                className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] border text-[12px] font-medium transition-colors"
                style={{
                  borderColor: sortBy === "name" ? "#1A7A42" : "#e2e8f0",
                  background: sortBy === "name" ? "#F0FAF3" : "#fff",
                  color: sortBy === "name" ? "#1A7A42" : "#374151",
                }}
              >
                <ArrowUpDown className="w-3.5 h-3.5" /> Name
              </button>
              <button
                type="button"
                onClick={() => {
                  if (sortBy === "productCount") setSortAsc((v) => !v);
                  else {
                    setSortBy("productCount");
                    setSortAsc(false);
                  }
                }}
                className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] border text-[12px] font-medium transition-colors"
                style={{
                  borderColor:
                    sortBy === "productCount" ? "#1A7A42" : "#e2e8f0",
                  background: sortBy === "productCount" ? "#F0FAF3" : "#fff",
                  color: sortBy === "productCount" ? "#1A7A42" : "#374151",
                }}
              >
                <Package className="w-3.5 h-3.5" /> Products
              </button>
            </div>

            {/* List */}
            <div
              className="rounded-[14px] border overflow-hidden"
              style={{ borderColor: "#e2e8f0" }}
            >
              {/* Column headers */}
              <div
                className="grid px-4 py-2.5 border-b"
                style={{
                  gridTemplateColumns: "36px 1fr 80px 66px",
                  gap: "12px",
                  background: "#fafafa",
                  borderColor: "#e2e8f0",
                }}
              >
                <div />
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wide"
                  style={{ color: "#94a3b8" }}
                >
                  Category
                </span>
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wide text-right"
                  style={{ color: "#94a3b8" }}
                >
                  Products
                </span>
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wide text-right"
                  style={{ color: "#94a3b8" }}
                >
                  Actions
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2.5">
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center"
                    style={{ background: "#F0FAF3" }}
                  >
                    <Tag className="w-5 h-5" style={{ color: "#1A7A42" }} />
                  </div>
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: "#374151" }}
                  >
                    {search
                      ? `No results for "${search}"`
                      : "No categories yet"}
                  </p>
                  <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                    {search
                      ? "Try a different search term"
                      : "Add your first category using the form →"}
                  </p>
                </div>
              ) : (
                <div>
                  {filtered.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      isSelected={editTarget?.id === cat.id}
                      onEdit={() => setEditTarget(cat)}
                      onDelete={() => setDeleteTarget(cat)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer count */}
            {filtered.length > 0 && (
              <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                Showing {filtered.length} of {categories.length} categories
                {search && ` matching "${search}"`}
              </p>
            )}
          </div>

          {/* ── RIGHT: Form panel ────────────────────────── */}
          <CategoryFormPanel
            key={editTarget?.id ?? "new"}
            editTarget={editTarget}
            onSave={handleSave}
            onCancel={() => setEditTarget(null)}
          />
        </div>
      </div>

      {/* ── Delete confirm modal ──────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          category={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toast ────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-[10px] border shadow-lg text-[13px] font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{
            background: toast.type === "success" ? "#F0FAF3" : "#fee2e2",
            borderColor:
              toast.type === "success"
                ? "rgba(26,122,66,0.2)"
                : "rgba(220,38,38,0.2)",
            color: toast.type === "success" ? "#1A7A42" : "#dc2626",
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          }}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <X className="w-4 h-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
