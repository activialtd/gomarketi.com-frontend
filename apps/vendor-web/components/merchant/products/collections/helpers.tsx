import { type ProductResp } from "@gomarket/api-client";
import { fmt } from "@gomarket/shared-utils";
import { Package, Star, X } from "lucide-react";
import { FileUpload } from "@/components/common/FileUpload";

// Alias so existing usages of Product still compile
type Product = ProductResp;

export function ProductPickerRow({
  product,
  selected,
  onToggle,
}: {
  product: Product;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] transition-colors text-left"
      style={{ background: selected ? "rgba(26,122,66,0.05)" : "transparent" }}
      onMouseOver={(e) =>
        !selected && (e.currentTarget.style.background = "#fafafa")
      }
      onMouseOut={(e) =>
        !selected && (e.currentTarget.style.background = "transparent")
      }
    >
      {/* Checkbox */}
      <div
        className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 transition-all"
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

      {/* Thumbnail */}
      <div
        className="w-9 h-9 rounded-[6px] overflow-hidden shrink-0"
        style={{ background: "#F0FAF3" }}
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-4 h-4" style={{ color: "#a7f3d0" }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p
            className="text-[12px] font-semibold truncate"
            style={{ color: "#1C1C1C" }}
          >
            {product.name}
          </p>
          {false && (
            <Star
              className="w-3 h-3 shrink-0"
              style={{ color: "#f59e0b" }}
              fill="#f59e0b"
            />
          )}
        </div>
        <p className="text-[10px] truncate" style={{ color: "#6b7280" }}>
          {product.category_id ?? ""}
          {product.hasVariants && ` · ${product.variants?.length} variants`}
        </p>
      </div>

      {/* Price + stock */}
      <div className="text-right shrink-0">
        <p className="text-[12px] font-bold" style={{ color: "#1A7A42" }}>
          {fmt(product.price)}
        </p>
        <p
          className="text-[10px]"
          style={{ color: product.stock === 0 ? "#dc2626" : "#94a3b8" }}
        >
          {product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
        </p>
      </div>
    </button>
  );
}

export function SelectedProductPill({
  product,
  onRemove,
}: {
  product: Product;
  onRemove: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 pr-2 rounded-[8px] border overflow-hidden"
      style={{ borderColor: "#e2e8f0", background: "#fafafa" }}
    >
      <div
        className="w-9 h-9 shrink-0 overflow-hidden"
        style={{ background: "#F0FAF3" }}
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-4 h-4" style={{ color: "#a7f3d0" }} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-1.5">
        <p
          className="text-[12px] font-semibold truncate"
          style={{ color: "#1C1C1C" }}
        >
          {product.name}
        </p>
        <p className="text-[10px]" style={{ color: "#6b7280" }}>
          {fmt(product.price)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 rounded-full hover:bg-red-50 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" style={{ color: "#dc2626" }} />
      </button>
    </div>
  );
}

// ─── Cover image upload ───────────────────────────────────────────────────────

export function CoverImageUpload({
  image,
  onSet,
  onClear,
  accessToken,
}: {
  image: string | null;
  onSet: (url: string) => void;
  onClear: () => void;
  accessToken: string;
}) {
  return (
    <FileUpload
      value={image ?? undefined}
      onChange={(url) => (url ? onSet(url) : onClear())}
      label="Upload cover image"
      hint="PNG, JPG · Recommended 1200×630px · Max 10 MB"
      accessToken={accessToken}
      purpose="collections"
      accept="image/png,image/jpeg,image/webp"
      maxMB={10}
      shape="square"
    />
  );
}
