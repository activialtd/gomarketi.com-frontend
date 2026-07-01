import { Product } from "@/lib/data/products";
import { PRODUCTS_STATUS_CONFIG, fmt } from "@gomarket/shared-utils";
import {
  MoreHorizontal,
  Edit,
  Eye,
  Copy,
  Trash2,
  Package,
  Star,
  Download,
  Plus,
  Layers,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CollectionResp, catalogueApi } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/lib/config/routes";

const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN ?? "gomarketi.com";

export function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-[12px] border flex-1 min-w-0"
      style={{ background: "#fff", borderColor: "#e2e8f0" }}
    >
      <div
        className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p
          className="text-[18px] font-extrabold leading-tight truncate"
          style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
        >
          {value}
        </p>
        <p
          className="text-[10px] font-semibold uppercase tracking-wide mt-0.5"
          style={{ color: "#94a3b8" }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: Product["status"] }) {
  const cfg = PRODUCTS_STATUS_CONFIG[status];
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

export function ProductRowMenu({
  product,
  storeSlug,
  onChanged,
}: {
  product: Product;
  storeSlug?: string | null;
  onChanged: () => void;
}) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState<"duplicate" | "delete" | null>(null);
  const [error, setError] = useState("");

  const previewUrl = storeSlug ? `http://${storeSlug}.${STORE_DOMAIN}/products/${product.id}` : null;

  function close() {
    setOpen(false);
    setConfirmingDelete(false);
    setError("");
  }

  async function handleDuplicate() {
    if (!accessToken || busy) return;
    setBusy("duplicate");
    setError("");
    try {
      const full = await catalogueApi.getProduct(product.id, accessToken);
      await catalogueApi.createProduct(
        {
          name: `${full.name} (Copy)`,
          description: full.description,
          category_id: full.category_id,
          price_kobo: full.price_kobo,
          stock: full.stock,
          sku: full.sku ? `${full.sku}-copy` : undefined,
          images: full.images,
          tags: full.tags,
          is_digital: full.is_digital,
        },
        accessToken,
      );
      close();
      onChanged();
    } catch {
      setError("Couldn't duplicate this product.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!accessToken || busy) return;
    setBusy("delete");
    setError("");
    try {
      await catalogueApi.deleteProduct(product.id, accessToken);
      close();
      onChanged();
    } catch {
      setError("Couldn't delete this product.");
      setBusy(null);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors hover:bg-[#F0FAF3]"
        style={{ color: "#94a3b8" }}
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MoreHorizontal className="w-4 h-4" />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div
            className="absolute right-0 top-8 z-20 w-48 rounded-[10px] border shadow-lg py-1 overflow-hidden"
            style={{
              background: "#fff",
              borderColor: "#e2e8f0",
              boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {!confirmingDelete ? (
              <>
                <button
                  onClick={() => {
                    close();
                    router.push(ROUTES.MERCHANT.PRODUCTS_EDIT(product.id));
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-left transition-colors hover:bg-[#F0FAF3]"
                  style={{ color: "#374151" }}
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit product
                </button>
                <a
                  href={previewUrl ?? "#"}
                  target={previewUrl ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!previewUrl) e.preventDefault();
                    close();
                  }}
                  aria-disabled={!previewUrl}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-left transition-colors hover:bg-[#F0FAF3]"
                  style={{ color: previewUrl ? "#374151" : "#cbd5e1", cursor: previewUrl ? "pointer" : "not-allowed" }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </a>
                <button
                  onClick={handleDuplicate}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-left transition-colors hover:bg-[#F0FAF3]"
                  style={{ color: "#374151" }}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </button>
                <div className="h-px mx-2 my-1" style={{ background: "#f1f5f9" }} />
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[12px] font-medium text-left transition-colors hover:bg-red-50"
                  style={{ color: "#dc2626" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
                {error && (
                  <p className="px-3.5 pt-1.5 text-[10px] flex items-center gap-1" style={{ color: "#dc2626" }}>
                    <AlertCircle className="w-3 h-3 shrink-0" /> {error}
                  </p>
                )}
              </>
            ) : (
              <div className="px-3.5 py-3 space-y-2.5">
                <p className="text-[11px] leading-snug" style={{ color: "#374151" }}>
                  Delete <strong>{product.name}</strong>? This can&apos;t be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="flex-1 h-7 rounded-[6px] border text-[11px] font-semibold"
                    style={{ borderColor: "#e2e8f0", color: "#374151" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={busy === "delete"}
                    className="flex-1 h-7 rounded-[6px] text-white text-[11px] font-bold disabled:opacity-60"
                    style={{ background: "#dc2626" }}
                  >
                    {busy === "delete" ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Product Grid Card ────────────────────────────────────────────────────────

export function ProductCard({
  product,
  selected,
  onSelect,
  storeSlug,
  onChanged,
}: {
  product: Product;
  selected: boolean;
  onSelect: (id: string) => void;
  storeSlug?: string | null;
  onChanged: () => void;
}) {
  const cfg = PRODUCTS_STATUS_CONFIG[product.status];
  return (
    <div
      className="rounded-[12px] border overflow-hidden transition-all cursor-pointer group"
      style={{
        background: "#fff",
        borderColor: selected ? "#1A7A42" : "#e2e8f0",
        boxShadow: selected ? "0 0 0 2px rgba(26,122,66,0.15)" : "none",
      }}
    >
      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden"
        style={{ background: "#F0FAF3" }}
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10" style={{ color: "#d1fae5" }} />
          </div>
        )}
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product.id);
          }}
          className="absolute top-2 left-2 transition-all"
          style={{ opacity: selected ? 1 : 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <div
            className="w-5 h-5 rounded-[5px] flex items-center justify-center"
            style={{
              background: selected ? "#1A7A42" : "rgba(255,255,255,0.9)",
              border: "1.5px solid #1A7A42",
            }}
          >
            {selected && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path
                  d="M1 4l3 3L9 1"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </button>
        {/* Featured star */}
        {product.featured && (
          <div
            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.15)" }}
          >
            <Star
              className="w-3 h-3"
              style={{ color: "#f59e0b" }}
              fill="#f59e0b"
            />
          </div>
        )}
        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div
            className="absolute inset-0 flex items-end pb-2 justify-center"
            style={{ background: "rgba(0,0,0,0.25)" }}
          >
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#fee2e2", color: "#dc2626" }}
            >
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1 mb-1">
          <p
            className="text-[13px] font-bold leading-tight line-clamp-2 flex-1"
            style={{ color: "#1C1C1C" }}
          >
            {product.name}
          </p>
          <ProductRowMenu product={product} storeSlug={storeSlug} onChanged={onChanged} />
        </div>
        <p className="text-[11px] mb-2" style={{ color: "#6b7280" }}>
          {product.category}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span
              className="text-[14px] font-extrabold"
              style={{ color: "#1A7A42" }}
            >
              {fmt(product.price)}
            </span>
            {product.compareAtPrice && (
              <span
                className="text-[11px] line-through ml-1.5"
                style={{ color: "#94a3b8" }}
              >
                {fmt(product.compareAtPrice)}
              </span>
            )}
          </div>
          <StatusBadge status={product.status} />
        </div>
        {product.hasVariants && (
          <p
            className="text-[10px] mt-1.5 font-medium"
            style={{ color: "#6b7280" }}
          >
            {product.variants?.length} variants ·{" "}
            {product.variantOptions?.map((o) => o.name).join(", ")}
          </p>
        )}
        <div
          className="flex items-center justify-between mt-2 pt-2 border-t"
          style={{ borderColor: "#f1f5f9" }}
        >
          <span className="text-[11px]" style={{ color: "#6b7280" }}>
            Stock:{" "}
            <strong
              style={{ color: product.stock === 0 ? "#dc2626" : "#1C1C1C" }}
            >
              {product.stock}
            </strong>
          </span>
          <span className="text-[11px]" style={{ color: "#6b7280" }}>
            Sold: <strong style={{ color: "#1C1C1C" }}>{product.sold}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Product List Row ─────────────────────────────────────────────────────────

export function ProductRow({
  product,
  selected,
  onSelect,
  storeSlug,
  onChanged,
}: {
  product: Product;
  selected: boolean;
  onSelect: (id: string) => void;
  storeSlug?: string | null;
  onChanged: () => void;
}) {
  return (
    <div
      className="grid items-center px-4 py-3 border-b transition-colors hover:bg-[#fafafa] cursor-pointer"
      style={{
        gridTemplateColumns: "36px 48px 1fr 120px 100px 80px 80px 50px",
        gap: "12px",
        borderColor: "#f1f5f9",
        background: selected ? "rgba(240,250,243,0.6)" : undefined,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(product.id);
        }}
        className="flex items-center justify-center"
      >
        <div
          className="w-4 h-4 rounded-[4px] flex items-center justify-center"
          style={{
            background: selected ? "#1A7A42" : "transparent",
            border: `1.5px solid ${selected ? "#1A7A42" : "#d1d5db"}`,
          }}
        >
          {selected && (
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

      {/* Thumbnail */}
      <div
        className="w-12 h-12 rounded-[8px] overflow-hidden shrink-0 border"
        style={{ background: "#F0FAF3", borderColor: "#e2e8f0" }}
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-5 h-5" style={{ color: "#a7f3d0" }} />
          </div>
        )}
      </div>

      {/* Name + meta */}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p
            className="text-[13px] font-semibold truncate"
            style={{ color: "#1C1C1C" }}
          >
            {product.name}
          </p>
          {product.featured && (
            <Star
              className="w-3 h-3 shrink-0"
              style={{ color: "#f59e0b" }}
              fill="#f59e0b"
            />
          )}
        </div>
        <p className="text-[11px] truncate" style={{ color: "#6b7280" }}>
          {product.category}
          {product.hasVariants && (
            <span className="ml-1.5 font-medium" style={{ color: "#94a3b8" }}>
              · {product.variants?.length} variants
            </span>
          )}
        </p>
      </div>

      {/* Price */}
      <div>
        <p className="text-[13px] font-bold" style={{ color: "#1A7A42" }}>
          {fmt(product.price)}
        </p>
        {product.compareAtPrice && (
          <p className="text-[10px] line-through" style={{ color: "#94a3b8" }}>
            {fmt(product.compareAtPrice)}
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <StatusBadge status={product.status} />
      </div>

      {/* Stock */}
      <p
        className="text-[13px] font-semibold"
        style={{ color: product.stock === 0 ? "#dc2626" : "#374151" }}
      >
        {product.stock}
      </p>

      {/* Sold */}
      <p className="text-[13px]" style={{ color: "#374151" }}>
        {product.sold}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-end">
        <ProductRowMenu product={product} storeSlug={storeSlug} onChanged={onChanged} />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyProducts() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div
        className="w-20 h-20 rounded-[20px] flex items-center justify-center mb-5"
        style={{ background: "#F0FAF3" }}
      >
        <Package className="w-9 h-9" style={{ color: "#1A7A42" }} />
      </div>
      <h3
        className="text-[17px] font-extrabold mb-2"
        style={{ color: "#1C1C1C" }}
      >
        Add new products to your store
      </h3>
      <p
        className="text-[13px] mb-6 max-w-xs leading-relaxed"
        style={{ color: "#6b7280" }}
      >
        Choose how you want to add products to get your store ready for
        customers.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          className="flex items-center gap-2 px-5 h-10 rounded-[10px] border text-[13px] font-semibold transition-all"
          style={{
            borderColor: "#1A7A42",
            color: "#1A7A42",
            background: "#fff",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#F0FAF3")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
        >
          <Download className="w-4 h-4" />
          Import Products
        </button>
        <button
          className="flex items-center gap-2 px-6 h-10 rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.98]"
          style={{
            background: "#1A7A42",
            boxShadow: "0 4px 14px rgba(26,122,66,0.25)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#239452")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>
    </div>
  );
}

// ─── Collections Tab ──────────────────────────────────────────────────────────

export function CollectionsTab({
  collections,
  loading,
}: {
  collections: CollectionResp[];
  loading: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2" style={{ color: "#94a3b8" }}>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-[13px]">Loading collections…</span>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="w-16 h-16 rounded-[16px] flex items-center justify-center mb-4"
          style={{ background: "#F0FAF3" }}
        >
          <Layers className="w-7 h-7" style={{ color: "#1A7A42" }} />
        </div>
        <p className="text-[15px] font-bold mb-1" style={{ color: "#1C1C1C" }}>
          No collections yet
        </p>
        <p className="text-[13px] mb-5" style={{ color: "#6b7280" }}>
          Group products together for easier browsing.
        </p>
        <Link
          href={ROUTES.MERCHANT.COLLECTIONS_NEW}
          className="flex items-center gap-2 px-5 h-10 rounded-[10px] text-white text-[13px] font-bold"
          style={{ background: "#1A7A42" }}
        >
          <Plus className="w-4 h-4" /> Create collection
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[13px]" style={{ color: "#6b7280" }}>
          <strong style={{ color: "#1C1C1C" }}>{collections.length}</strong>{" "}
          collection{collections.length !== 1 ? "s" : ""}
        </p>
        <Link
          href={ROUTES.MERCHANT.COLLECTIONS_NEW}
          className="flex items-center gap-2 px-4 h-9 rounded-[8px] text-white text-[12px] font-bold transition-all"
          style={{
            background: "#1A7A42",
            boxShadow: "0 2px 8px rgba(26,122,66,0.2)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#239452")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
        >
          <Plus className="w-3.5 h-3.5" /> New collection
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {collections.map((col) => {
          const productCount = col.product_ids?.length ?? 0;

          return (
            <div
              key={col.id}
              className="rounded-[12px] border overflow-hidden cursor-pointer transition-all"
              style={{
                borderColor: hovered === col.id ? "#1A7A42" : "#e2e8f0",
                background: "#fff",
              }}
              onMouseEnter={() => setHovered(col.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Cover image */}
              <div
                className="relative h-[120px] overflow-hidden flex items-center justify-center"
                style={{ background: "#F0FAF3" }}
              >
                {col.image_url ? (
                  <img
                    src={col.image_url}
                    alt={col.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Layers className="w-7 h-7" style={{ color: "#a7f3d0" }} />
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-[13px] font-bold"
                      style={{ color: "#1C1C1C" }}
                    >
                      {col.name}
                    </p>
                    {col.description && (
                      <p
                        className="text-[11px] mt-0.5 line-clamp-2 leading-relaxed"
                        style={{ color: "#6b7280" }}
                      >
                        {col.description}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className="flex items-center justify-between mt-2.5 pt-2 border-t"
                  style={{ borderColor: "#f1f5f9" }}
                >
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: "#6b7280" }}
                  >
                    {productCount} product{productCount !== 1 ? "s" : ""}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: col.is_published ? "#F0FAF3" : "#fef3c7",
                      color: col.is_published ? "#1A7A42" : "#92400e",
                    }}
                  >
                    {col.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
