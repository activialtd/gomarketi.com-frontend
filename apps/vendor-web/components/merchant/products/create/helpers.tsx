import { Input } from "@gomarket/ui";
import {
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Upload,
  X,
  Plus,
  GripVertical,
  Trash2,
} from "lucide-react";
import { useState, useRef } from "react";
import { useFieldArray } from "react-hook-form";

export const CATEGORIES = [
  "fashion",
  "beauty",
  "food",
  "electronics",
  "home",
  "health",
  "sports",
  "books",
  "auto",
  "kids",
  "jewelry",
  "digital",
  "agriculture",
  "art",
  "other",
];

export const CATEGORY_LABELS: Record<string, string> = {
  fashion: "Fashion & Apparel",
  beauty: "Beauty & Skincare",
  food: "Food & Beverages",
  electronics: "Electronics & Gadgets",
  home: "Home & Living",
  health: "Health & Wellness",
  sports: "Sports & Fitness",
  books: "Books & Stationery",
  auto: "Auto & Accessories",
  kids: "Kids & Toys",
  jewelry: "Jewelry & Accessories",
  digital: "Digital Products & Services",
  agriculture: "Agriculture & Farm Produce",
  art: "Art & Crafts",
  other: "Other",
};

export function Section({
  title,
  description,
  children,
  collapsible = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div
      className="rounded-[14px] border overflow-hidden"
      style={{ background: "#fff", borderColor: "#e2e8f0" }}
    >
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-5 py-4 border-b ${collapsible ? "cursor-pointer hover:bg-[#fafafa]" : "cursor-default"}`}
        style={{ borderColor: "#f1f5f9" }}
      >
        <div className="text-left">
          <p
            className="text-[14px] font-extrabold"
            style={{ color: "#1C1C1C" }}
          >
            {title}
          </p>
          {description && (
            <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
              {description}
            </p>
          )}
        </div>
        {collapsible &&
          (open ? (
            <ChevronUp
              className="w-4 h-4 shrink-0"
              style={{ color: "#94a3b8" }}
            />
          ) : (
            <ChevronDown
              className="w-4 h-4 shrink-0"
              style={{ color: "#94a3b8" }}
            />
          ))}
      </button>
      {(!collapsible || open) && <div className="p-5">{children}</div>}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

export function Field({
  label,
  hint,
  error,
  required = false,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <label
          className="text-[10px] font-extrabold uppercase block"
          style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
        >
          {label}
        </label>
        {required && (
          <span className="text-[10px]" style={{ color: "#dc2626" }}>
            *
          </span>
        )}
      </div>
      {children}
      {hint && !error && (
        <p className="text-[11px]" style={{ color: "#94a3b8" }}>
          {hint}
        </p>
      )}
      {error && (
        <div className="flex items-center gap-1">
          <AlertCircle
            className="w-3 h-3 shrink-0"
            style={{ color: "#dc2626" }}
          />
          <p className="text-[11px]" style={{ color: "#dc2626" }}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative w-9 h-5 rounded-full transition-colors shrink-0"
        style={{ background: checked ? "#1A7A42" : "#e2e8f0" }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
          style={{
            transform: checked ? "translateX(18px)" : "translateX(2px)",
          }}
        />
      </button>
      {label && (
        <span className="text-[13px] font-medium" style={{ color: "#374151" }}>
          {label}
        </span>
      )}
    </label>
  );
}

// ─── Image upload area ────────────────────────────────────────────────────────

export function ImageUpload({
  images,
  onAdd,
  onRemove,
}: {
  images: string[];
  onAdd: (url: string) => void;
  onRemove: (i: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-3">
      {/* Upload zone */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full rounded-[10px] border-2 border-dashed py-8 flex flex-col items-center gap-2 transition-all"
        style={{ borderColor: "#d1fae5" }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = "#1A7A42";
          e.currentTarget.style.background = "#F0FAF3";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = "#d1fae5";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center"
          style={{ background: "#F0FAF3" }}
        >
          <Upload className="w-5 h-5" style={{ color: "#1A7A42" }} />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-semibold" style={{ color: "#1C1C1C" }}>
            Click to upload images
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "#94a3b8" }}>
            PNG, JPG, WEBP · Max 5MB each · Up to 8 images
          </p>
        </div>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-[8px] overflow-hidden group border"
              style={{ borderColor: "#e2e8f0" }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <div
                  className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#1A7A42", color: "#fff" }}
                >
                  Main
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {images.length < 8 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-[8px] border-2 border-dashed flex items-center justify-center transition-colors"
              style={{ borderColor: "#e2e8f0" }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#1A7A42";
                e.currentTarget.style.background = "#F0FAF3";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Plus className="w-5 h-5" style={{ color: "#94a3b8" }} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Variant option builder ───────────────────────────────────────────────────

export function VariantOptionBuilder({
  control,
  register,
  errors,
}: {
  control: any;
  register: any;
  errors: any;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variantOptions",
  });
  const [tagInputs, setTagInputs] = useState<Record<number, string>>({});

  return (
    <div className="space-y-3">
      {fields.map((field, i) => {
        const values: string[] =
          control._getWatch?.(`variantOptions.${i}.values`) ?? [];
        return (
          <div
            key={field.id}
            className="rounded-[10px] border p-4 space-y-3"
            style={{ borderColor: "#e2e8f0", background: "#fafafa" }}
          >
            <div className="flex items-center gap-2">
              <GripVertical
                className="w-4 h-4 shrink-0"
                style={{ color: "#d1d5db" }}
              />
              <div className="flex-1">
                <Field
                  label="Option name"
                  error={errors?.variantOptions?.[i]?.name?.message}
                >
                  <Input
                    placeholder='e.g. "Size" or "Color"'
                    {...register(`variantOptions.${i}.name`)}
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1.5 rounded-[6px] hover:bg-red-50 transition-colors mt-4 shrink-0"
              >
                <Trash2 className="w-4 h-4" style={{ color: "#dc2626" }} />
              </button>
            </div>

            {/* Values as pills */}
            <div className="space-y-2">
              <label
                className="text-[10px] font-extrabold uppercase block"
                style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
              >
                Option values
              </label>
              <div className="flex flex-wrap gap-1.5">
                {values.map((val: string, vi: number) => (
                  <span
                    key={vi}
                    className="flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: "#F0FAF3",
                      color: "#1A7A42",
                      border: "1px solid rgba(26,122,66,0.2)",
                    }}
                  >
                    {val}
                    <button
                      type="button"
                      onClick={() => {
                        const curr =
                          control._getWatch(`variantOptions.${i}.values`) ?? [];
                        control._setValue(
                          `variantOptions.${i}.values`,
                          curr.filter((_: any, ci: number) => ci !== vi),
                        );
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInputs[i] ?? ""}
                  onChange={(e) =>
                    setTagInputs((p) => ({ ...p, [i]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (
                      (e.key === "Enter" || e.key === ",") &&
                      tagInputs[i]?.trim()
                    ) {
                      e.preventDefault();
                      const curr =
                        control._getWatch(`variantOptions.${i}.values`) ?? [];
                      control._setValue(`variantOptions.${i}.values`, [
                        ...curr,
                        tagInputs[i].trim(),
                      ]);
                      setTagInputs((p) => ({ ...p, [i]: "" }));
                    }
                  }}
                  placeholder="Add value, press Enter"
                  className="flex-1 min-w-[140px] h-7 px-2.5 rounded-full border text-[12px] outline-none transition-all"
                  style={{
                    borderColor: "#e2e8f0",
                    background: "#fff",
                    color: "#1C1C1C",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#1A7A42";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {fields.length < 3 && (
        <button
          type="button"
          onClick={() => append({ name: "", values: [] })}
          className="flex items-center gap-2 text-[13px] font-semibold transition-colors"
          style={{ color: "#1A7A42" }}
        >
          <Plus className="w-4 h-4" /> Add option{" "}
          {fields.length > 0 ? "(" + (3 - fields.length) + " more)" : ""}
        </button>
      )}
    </div>
  );
}
