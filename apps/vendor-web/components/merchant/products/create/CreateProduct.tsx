"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Image as ImageIcon,
  Loader2,
  Info,
  Star,
  ArrowLeft,
} from "lucide-react";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gomarket/ui";
import { ROUTES } from "@/lib/config/routes";
import { COLLECTIONS } from "@/lib/data/products";
import {
  CreateProductFormValues,
  createProductSchema,
} from "@/lib/validations/schemas";
import {
  Field,
  CATEGORIES,
  CATEGORY_LABELS,
  ImageUpload,
  Toggle,
  VariantOptionBuilder,
  Section,
} from "./helpers";

export default function CreateProductPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: {
      status: "draft",
      hasVariants: false,
      trackInventory: true,
      featured: false,
    },
  });

  const { onBlur: descriptionOnBlur, ...descriptionRegister } =
    register("description");
  const { onBlur: seoDescriptionOnBlur, ...seoDescriptionRegister } =
    register("seoDescription");

  const hasVariants = watch("hasVariants");
  const nameVal = watch("name") ?? "";
  const priceVal = watch("price");
  const costVal = watch("costPerItem");
  const margin =
    priceVal && costVal
      ? Math.round(((priceVal - costVal) / priceVal) * 100)
      : null;

  async function onSubmit(
    data: CreateProductFormValues,
    status: "draft" | "active",
  ) {
    const setter = status === "draft" ? setIsSaving : setIsPublishing;
    setter(true);
    setValue("status", status);
    await new Promise((r) => setTimeout(r, 1000));
    setter(false);
    router.push(ROUTES.MERCHANT.PRODUCTS);
  }

  return (
    <div className="w-full">
      {/* ── Header ───────────────────────────────────────── */}
      <div
        className="px-6 lg:px-8 py-4 border-b flex flex-wrap items-center gap-3"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[13px] font-medium transition-colors group"
          style={{ color: "#6b7280" }}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Products
        </button>
        <div className="w-px h-4" style={{ background: "#e2e8f0" }} />
        <h1
          className="text-[18px] font-extrabold flex-1"
          style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
        >
          {nameVal || "New product"}
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit((d) => onSubmit(d, "draft"))}
            disabled={isSaving || isPublishing}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[8px] border text-[12px] font-semibold transition-all disabled:opacity-50"
            style={{
              borderColor: "#e2e8f0",
              background: "#fff",
              color: "#374151",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#F0FAF3")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Save draft
          </button>
          <button
            type="button"
            onClick={handleSubmit((d) => onSubmit(d, "active"))}
            disabled={isSaving || isPublishing}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[8px] text-white text-[12px] font-bold transition-all active:scale-[0.98] disabled:opacity-60"
            style={{
              background: "#0A2E1A",
              boxShadow: "0 2px 8px rgba(26,122,66,0.25)",
            }}
            onMouseOver={(e) =>
              !isPublishing && (e.currentTarget.style.background = "#239452")
            }
            onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
          >
            {isPublishing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : null}
            Publish product
          </button>
        </div>
      </div>

      {/* ── Content: two-column layout ────────────────────── */}
      <form className="px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          {/* ── LEFT: Main details ─────────────────────── */}
          <div className="space-y-5 min-w-0">
            {/* Basic info */}
            <Section
              title="Product details"
              description="Name, description, and category"
            >
              <div className="space-y-4">
                <Field
                  label="Product name"
                  required
                  error={errors.name?.message}
                >
                  <Input
                    id="name"
                    placeholder="e.g. Ankara Crop Top"
                    autoComplete="off"
                    {...register("name")}
                  />
                </Field>

                <Field
                  label="Description"
                  hint="Describe the product — material, fit, care instructions."
                >
                  <textarea
                    rows={4}
                    placeholder="A vibrant wax-print crop top, fully lined with a hidden zip…"
                    className="w-full px-3.5 py-2.5 rounded-[10px] border text-[13px] resize-none transition-all outline-none"
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
                      descriptionOnBlur(e);
                    }}
                    {...descriptionRegister}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Category"
                    required
                    error={errors.category?.message}
                  >
                    <Controller
                      control={control}
                      name="category"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {CATEGORY_LABELS[c]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>

                  <Field
                    label="Tags"
                    hint="Separate with commas or press Enter"
                  >
                    <Input
                      placeholder="e.g. ankara, women, casual"
                      {...register("tags")}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Media */}
            <Section
              title="Product images"
              description="Upload up to 8 images. First image is the main thumbnail."
            >
              <ImageUpload
                images={images}
                onAdd={(url) => setImages((p) => [...p, url])}
                onRemove={(i) =>
                  setImages((p) => p.filter((_, idx) => idx !== i))
                }
              />
            </Section>

            {/* Pricing */}
            <Section
              title="Pricing"
              description="Set your selling price, compare price, and cost."
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Price (₦)" required error={errors.price?.message}>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0.00"
                    {...register("price")}
                  />
                </Field>
                <Field
                  label="Compare-at price (₦)"
                  hint="Shown as strikethrough"
                >
                  <Input
                    type="number"
                    min={0}
                    placeholder="0.00"
                    {...register("compareAtPrice")}
                  />
                </Field>
                <Field label="Cost per item (₦)" hint="Not shown to customers">
                  <Input
                    type="number"
                    min={0}
                    placeholder="0.00"
                    {...register("costPerItem")}
                  />
                </Field>
              </div>

              {margin !== null && (
                <div
                  className="mt-3 flex items-center gap-3 px-4 py-2.5 rounded-[8px] text-[12px]"
                  style={{
                    background: "#F0FAF3",
                    border: "1px solid rgba(26,122,66,0.15)",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: "#3D6B4F" }}>Margin:</span>
                    <strong style={{ color: "#1A7A42" }}>{margin}%</strong>
                  </div>
                  <div
                    className="w-px h-4"
                    style={{ background: "rgba(26,122,66,0.2)" }}
                  />
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: "#3D6B4F" }}>Profit per unit:</span>
                    <strong style={{ color: "#1A7A42" }}>
                      ₦{((priceVal ?? 0) - (costVal ?? 0)).toLocaleString()}
                    </strong>
                  </div>
                </div>
              )}
            </Section>

            {/* Inventory */}
            <Section
              title="Inventory"
              description="Stock levels, SKU, and tracking."
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: "#1C1C1C" }}
                    >
                      Track inventory
                    </p>
                    <p className="text-[11px]" style={{ color: "#6b7280" }}>
                      GoMarket will count down stock as orders come in
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="trackInventory"
                    render={({ field }) => (
                      <Toggle
                        checked={!!field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Stock quantity" error={errors.stock?.message}>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      {...register("stock")}
                    />
                  </Field>
                  <Field label="SKU" hint="Stock Keeping Unit">
                    <Input placeholder="e.g. ANK-M-CB" {...register("sku")} />
                  </Field>
                  <Field label="Barcode">
                    <Input
                      placeholder="ISBN, UPC, GTIN…"
                      {...register("barcode")}
                    />
                  </Field>
                </div>

                <Field
                  label="Weight (kg)"
                  hint="Used to calculate shipping cost"
                >
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    className="max-w-[140px]"
                    {...register("weight")}
                  />
                </Field>
              </div>
            </Section>

            {/* Variants */}
            <Section
              title="Variants"
              description="Add options like size or color. Each combination becomes a variant."
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: "#1C1C1C" }}
                    >
                      This product has variants
                    </p>
                    <p className="text-[11px]" style={{ color: "#6b7280" }}>
                      e.g. different sizes, colors, or materials
                    </p>
                  </div>
                  <Controller
                    control={control}
                    name="hasVariants"
                    render={({ field }) => (
                      <Toggle
                        checked={!!field.value}
                        onChange={(v) => {
                          field.onChange(v);
                        }}
                      />
                    )}
                  />
                </div>

                {hasVariants && (
                  <div
                    className="pt-2 border-t"
                    style={{ borderColor: "#f1f5f9" }}
                  >
                    <VariantOptionBuilder
                      control={control}
                      register={register}
                      errors={errors}
                    />
                    <div
                      className="mt-4 flex items-start gap-2.5 px-3.5 py-2.5 rounded-[8px] text-[11px]"
                      style={{
                        background: "#fffbeb",
                        border: "1px solid rgba(245,158,11,0.2)",
                        color: "#92400e",
                      }}
                    >
                      <Info
                        className="w-3.5 h-3.5 shrink-0 mt-0.5"
                        style={{ color: "#f59e0b" }}
                      />
                      Variant prices, stock, and SKUs can be set individually
                      after saving the product.
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* SEO */}
            <Section
              title="SEO & storefront"
              description="Control how this product appears on search engines."
              collapsible
            >
              <div className="space-y-4">
                <Field
                  label="Page title"
                  hint="Shown in browser tabs and search results. Defaults to product name."
                >
                  <Input
                    placeholder={nameVal || "Product page title"}
                    {...register("seoTitle")}
                  />
                </Field>
                <Field
                  label="Meta description"
                  hint="Short description for search results (under 160 chars)"
                >
                  <textarea
                    rows={2}
                    placeholder="Describe this product for search engines…"
                    className="w-full px-3.5 py-2.5 rounded-[10px] border text-[13px] resize-none transition-all outline-none"
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
                      seoDescriptionOnBlur(e);
                    }}
                    {...seoDescriptionRegister}
                  />
                </Field>
                <Field label="URL slug" hint="gomarketi.com/products/…">
                  <div
                    className="flex items-center h-[42px] rounded-[10px] border overflow-hidden"
                    style={{ borderColor: "#e2e8f0" }}
                    onFocusCapture={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "#1A7A42";
                      (e.currentTarget as HTMLElement).style.outline =
                        "2px solid #1A7A42";
                      (e.currentTarget as HTMLElement).style.outlineOffset =
                        "-2px";
                    }}
                    onBlurCapture={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "#e2e8f0";
                      (e.currentTarget as HTMLElement).style.outline = "none";
                    }}
                  >
                    <div
                      className="h-full flex items-center px-3 border-r text-[12px] font-medium shrink-0 select-none"
                      style={{
                        background: "#f8fafc",
                        borderColor: "#e2e8f0",
                        color: "#6b7280",
                      }}
                    >
                      /products/
                    </div>
                    <input
                      placeholder="ankara-crop-top"
                      className="flex-1 h-full px-3 text-[13px] outline-none font-mono bg-[#F0FAF3] focus:bg-white transition-colors"
                      style={{ color: "#1C1C1C" }}
                      {...register("slug")}
                    />
                  </div>
                </Field>
              </div>
            </Section>
          </div>

          {/* ── RIGHT: Sidebar ─────────────────────────── */}
          <div className="space-y-5">
            {/* Status */}
            <div
              className="rounded-[14px] border p-4 space-y-3"
              style={{ background: "#fff", borderColor: "#e2e8f0" }}
            >
              <p
                className="text-[13px] font-extrabold"
                style={{ color: "#1C1C1C" }}
              >
                Visibility
              </p>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <div className="space-y-2">
                    {(
                      [
                        {
                          value: "active",
                          label: "Active",
                          desc: "Visible on your storefront",
                          dot: "#1A7A42",
                        },
                        {
                          value: "draft",
                          label: "Draft",
                          desc: "Hidden from customers",
                          dot: "#94a3b8",
                        },
                      ] as const
                    ).map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-3 p-3 rounded-[8px] border cursor-pointer transition-all"
                        style={{
                          borderColor:
                            field.value === opt.value ? "#1A7A42" : "#e2e8f0",
                          background:
                            field.value === opt.value
                              ? "rgba(26,122,66,0.04)"
                              : "#fafafa",
                        }}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          value={opt.value}
                          checked={field.value === opt.value}
                          onChange={() => field.onChange(opt.value)}
                        />
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: opt.dot }}
                        />
                        <div>
                          <p
                            className="text-[12px] font-semibold"
                            style={{ color: "#1C1C1C" }}
                          >
                            {opt.label}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: "#6b7280" }}
                          >
                            {opt.desc}
                          </p>
                        </div>
                        {field.value === opt.value && (
                          <div
                            className="ml-auto w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: "#1A7A42" }}
                          >
                            <svg
                              width="8"
                              height="7"
                              viewBox="0 0 8 7"
                              fill="none"
                            >
                              <path
                                d="M1 3.5l2 2L7 1"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              />
              <Controller
                control={control}
                name="featured"
                render={({ field }) => (
                  <div
                    className="flex items-center justify-between pt-2 border-t"
                    style={{ borderColor: "#f1f5f9" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Star
                        className="w-3.5 h-3.5"
                        style={{ color: "#f59e0b" }}
                      />
                      <span
                        className="text-[12px] font-medium"
                        style={{ color: "#374151" }}
                      >
                        Featured product
                      </span>
                    </div>
                    <Toggle checked={!!field.value} onChange={field.onChange} />
                  </div>
                )}
              />
            </div>

            {/* Collections */}
            <div
              className="rounded-[14px] border p-4 space-y-3"
              style={{ background: "#fff", borderColor: "#e2e8f0" }}
            >
              <p
                className="text-[13px] font-extrabold"
                style={{ color: "#1C1C1C" }}
              >
                Collections
              </p>
              <p className="text-[11px]" style={{ color: "#6b7280" }}>
                Add this product to one or more collections.
              </p>
              <Controller
                control={control}
                name="collectionIds"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    {COLLECTIONS.map((col) => {
                      const isChecked = (field.value ?? []).includes(col.id);
                      return (
                        <label
                          key={col.id}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] cursor-pointer transition-colors hover:bg-[#F0FAF3]"
                        >
                          <div
                            className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0"
                            style={{
                              background: isChecked ? "#1A7A42" : "transparent",
                              border: `1.5px solid ${isChecked ? "#1A7A42" : "#d1d5db"}`,
                            }}
                            onClick={() => {
                              const curr = field.value ?? [];
                              field.onChange(
                                isChecked
                                  ? curr.filter((id: string) => id !== col.id)
                                  : [...curr, col.id],
                              );
                            }}
                          >
                            {isChecked && (
                              <svg
                                width="8"
                                height="7"
                                viewBox="0 0 8 7"
                                fill="none"
                              >
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
                          <span
                            className="text-[12px] font-medium"
                            style={{ color: "#374151" }}
                          >
                            {col.name}
                          </span>
                          <span
                            className="ml-auto text-[10px]"
                            style={{ color: "#94a3b8" }}
                          >
                            {col.productIds.length}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
