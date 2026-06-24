import {
  Category,
  CATEGORY_COLORS,
  CATEGORY_EMOJIS,
} from "@/lib/data/categories";
import { CategoryFormValues, categorySchema } from "@/lib/validations/schemas";
import { toSlug } from "@gomarket/shared-utils";
import { Input } from "@gomarket/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronRight,
  Edit2,
  Package,
  Trash2,
  X,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "../create/helpers";

export function StyledTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      rows={2}
      className="w-full px-3.5 py-2.5 rounded-[10px] border text-[13px] resize-none outline-none transition-all"
      style={{
        borderColor: "#e2e8f0",
        background: "#F0FAF3",
        color: "#1C1C1C",
        lineHeight: "1.6",
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
      {...props}
    />
  );
}

export function DeleteModal({
  category,
  onConfirm,
  onCancel,
}: {
  category: Category;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-[16px] border p-5 shadow-xl"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
            style={{ background: "#fee2e2" }}
          >
            <Trash2 className="w-4 h-4" style={{ color: "#dc2626" }} />
          </div>
          <div>
            <p
              className="text-[14px] font-extrabold"
              style={{ color: "#1C1C1C" }}
            >
              Delete "{category.name}"?
            </p>
            <p
              className="text-[12px] mt-1 leading-relaxed"
              style={{ color: "#6b7280" }}
            >
              {category.productCount > 0
                ? `This category has ${category.productCount} product${category.productCount !== 1 ? "s" : ""}. They won't be deleted, but they'll lose this category.`
                : "This category has no products. It will be permanently removed."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-4 rounded-[8px] border text-[12px] font-semibold transition-colors"
            style={{
              borderColor: "#e2e8f0",
              background: "#fff",
              color: "#374151",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-9 px-4 rounded-[8px] text-white text-[12px] font-bold transition-all active:scale-[0.98]"
            style={{ background: "#dc2626" }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#b91c1c")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#dc2626")}
          >
            Delete category
          </button>
        </div>
      </div>
    </div>
  );
}

export function CategoryFormPanel({
  editTarget,
  onSave,
  onCancel,
}: {
  editTarget: Category | null;
  onSave: (data: CategoryFormValues, id?: string) => void;
  onCancel: () => void;
}) {
  const isEdit = !!editTarget;
  const [slugEdited, setSlugEdited] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: editTarget
      ? {
          name: editTarget.name,
          description: editTarget.description ?? "",
          emoji: editTarget.emoji,
          color: editTarget.color,
          slug: editTarget.slug,
        }
      : {
          emoji: "🏷️",
          color: CATEGORY_COLORS[0].value,
        },
  });

  const nameVal = watch("name") ?? "";
  const emojiVal = watch("emoji") ?? "🏷️";
  const colorVal = watch("color") ?? CATEGORY_COLORS[0].value;
  const slugVal = watch("slug") ?? "";

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited && !isEdit) {
      setValue("slug", toSlug(e.target.value));
    }
  }

  async function onSubmit(data: CategoryFormValues) {
    await new Promise((r) => setTimeout(r, 400));
    onSave(data, editTarget?.id);
    reset();
    setSlugEdited(false);
  }

  const charCount = watch("description")?.length ?? 0;

  return (
    <div
      className="rounded-[14px] border overflow-hidden h-fit sticky top-5"
      style={{ background: "#fff", borderColor: "#e2e8f0" }}
    >
      {/* Panel header */}
      <div
        className="px-5 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "#f1f5f9" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-[7px] flex items-center justify-center text-base"
            style={{ background: colorVal }}
          >
            {emojiVal}
          </div>
          <p
            className="text-[14px] font-extrabold"
            style={{ color: "#1C1C1C" }}
          >
            {isEdit ? "Edit category" : "New category"}
          </p>
        </div>
        {isEdit && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-[5px] hover:bg-[#f1f5f9] transition-colors"
          >
            <X className="w-4 h-4" style={{ color: "#94a3b8" }} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
        {/* Live preview chip */}
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border"
          style={{ background: colorVal, borderColor: "rgba(0,0,0,0.06)" }}
        >
          <span className="text-xl">{emojiVal}</span>
          <div className="min-w-0">
            <p
              className="text-[13px] font-bold truncate"
              style={{ color: "#1C1C1C" }}
            >
              {nameVal || "Category name"}
            </p>
            {slugVal && (
              <p
                className="text-[10px] font-medium truncate"
                style={{ color: "#6b7280" }}
              >
                /{slugVal}
              </p>
            )}
          </div>
        </div>

        {/* Name */}
        <Field label="Name" error={errors.name?.message}>
          <Input
            id="cat-name"
            placeholder="e.g. Ankara & Fabric"
            {...register("name", { onChange: handleNameChange })}
          />
        </Field>

        {/* Description */}
        <Field
          label="Description"
          hint={`${charCount}/200 — optional, shown on storefront`}
          error={errors.description?.message}
        >
          <StyledTextarea
            placeholder="Short description of what's in this category…"
            {...register("description")}
          />
        </Field>

        {/* Emoji picker */}
        <Field label="Emoji" error={errors.emoji?.message}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setEmojiPickerOpen((v) => !v)}
              className="flex items-center gap-2.5 h-[42px] w-full px-3.5 rounded-[10px] border text-[13px] font-medium transition-all text-left"
              style={{
                borderColor: emojiPickerOpen ? "#1A7A42" : "#e2e8f0",
                background: "#F0FAF3",
                color: "#1C1C1C",
              }}
            >
              <span className="text-xl">{emojiVal}</span>
              <span style={{ color: "#6b7280" }}>Pick an emoji</span>
              <ChevronRight
                className="ml-auto w-4 h-4 transition-transform duration-200"
                style={{
                  color: "#94a3b8",
                  transform: emojiPickerOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {emojiPickerOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1.5 rounded-[12px] border p-3 z-20 shadow-lg"
                style={{
                  background: "#fff",
                  borderColor: "#e2e8f0",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                }}
              >
                <div className="grid grid-cols-6 gap-1">
                  {CATEGORY_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setValue("emoji", em);
                        setEmojiPickerOpen(false);
                      }}
                      className="w-9 h-9 rounded-[7px] text-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{
                        background: emojiVal === em ? "#F0FAF3" : "transparent",
                        border:
                          emojiVal === em
                            ? "1.5px solid #1A7A42"
                            : "1.5px solid transparent",
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Field>

        {/* Color palette */}
        <Field label="Chip color" error={errors.color?.message}>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => setValue("color", c.value)}
                className="w-7 h-7 rounded-full transition-all relative"
                style={{
                  background: c.value,
                  border:
                    colorVal === c.value
                      ? "2.5px solid #1A7A42"
                      : "2px solid rgba(0,0,0,0.08)",
                  transform: colorVal === c.value ? "scale(1.15)" : "scale(1)",
                }}
              >
                {colorVal === c.value && (
                  <Check
                    className="absolute inset-0 m-auto w-3 h-3"
                    style={{ color: "#1A7A42" }}
                  />
                )}
              </button>
            ))}
          </div>
        </Field>

        {/* Slug */}
        <Field
          label="URL slug"
          hint="Auto-generated from name. Edit to customise."
          error={errors.slug?.message}
        >
          <div
            className="flex items-center h-[42px] rounded-[10px] border overflow-hidden"
            style={{ borderColor: "#e2e8f0" }}
            onFocusCapture={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#1A7A42";
              (e.currentTarget as HTMLElement).style.outline =
                "2px solid #1A7A42";
              (e.currentTarget as HTMLElement).style.outlineOffset = "-2px";
            }}
            onBlurCapture={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
              (e.currentTarget as HTMLElement).style.outline = "none";
            }}
          >
            <div
              className="h-full flex items-center px-3 border-r text-[11px] font-semibold shrink-0 select-none"
              style={{
                background: "#f8fafc",
                borderColor: "#e2e8f0",
                color: "#94a3b8",
              }}
            >
              /categories/
            </div>
            <input
              placeholder="ankara-fabric"
              className="flex-1 h-full px-3 text-[12px] outline-none font-mono bg-[#F0FAF3] focus:bg-white transition-colors"
              style={{ color: "#1C1C1C" }}
              {...register("slug", { onChange: () => setSlugEdited(true) })}
            />
          </div>
        </Field>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-60"
            style={{
              background: "#0A2E1A",
              boxShadow: "0 2px 8px rgba(26,122,66,0.25)",
            }}
            onMouseOver={(e) =>
              !isSubmitting && (e.currentTarget.style.background = "#239452")
            }
            onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                {isEdit ? "Save changes" : "Add category"}
              </>
            )}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={onCancel}
              className="h-10 px-4 rounded-[10px] border text-[13px] font-semibold transition-colors"
              style={{
                borderColor: "#e2e8f0",
                background: "#fff",
                color: "#374151",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#F0FAF3")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export function CategoryRow({
  category,
  isSelected,
  onEdit,
  onDelete,
}: {
  category: Category;
  isSelected: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b transition-colors last:border-0 group"
      style={{
        borderColor: "#f1f5f9",
        background: isSelected ? "rgba(240,250,243,0.7)" : undefined,
      }}
      onMouseOver={(e) => {
        if (!isSelected) e.currentTarget.style.background = "#fafafa";
      }}
      onMouseOut={(e) => {
        if (!isSelected) e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Emoji chip */}
      <div
        className="w-9 h-9 rounded-[9px] flex items-center justify-center text-lg shrink-0"
        style={{ background: category.color }}
      >
        {category.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="text-[13px] font-semibold truncate"
            style={{ color: "#1C1C1C" }}
          >
            {category.name}
          </p>
          {category.isDefault && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: "#f1f5f9", color: "#94a3b8" }}
            >
              DEFAULT
            </span>
          )}
          {isSelected && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: "#F0FAF3", color: "#1A7A42" }}
            >
              EDITING
            </span>
          )}
        </div>
        {category.description && (
          <p
            className="text-[11px] truncate mt-0.5"
            style={{ color: "#6b7280" }}
          >
            {category.description}
          </p>
        )}
      </div>

      {/* Product count */}
      <div className="flex items-center gap-1 shrink-0 min-w-[60px] justify-end">
        <Package className="w-3.5 h-3.5" style={{ color: "#94a3b8" }} />
        <span
          className="text-[12px] font-semibold"
          style={{ color: category.productCount > 0 ? "#1C1C1C" : "#94a3b8" }}
        >
          {category.productCount}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onEdit}
          className="w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors hover:bg-[#F0FAF3]"
          title="Edit"
        >
          <Edit2 className="w-3.5 h-3.5" style={{ color: "#1A7A42" }} />
        </button>
        {!category.isDefault ? (
          <button
            type="button"
            onClick={onDelete}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" style={{ color: "#dc2626" }} />
          </button>
        ) : (
          <div
            className="w-7 h-7 flex items-center justify-center"
            title="Default categories can't be deleted"
          >
            <Lock className="w-3.5 h-3.5" style={{ color: "#d1d5db" }} />
          </div>
        )}
      </div>
    </div>
  );
}
