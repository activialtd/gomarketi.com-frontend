"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Search,
  Layers,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import { Input } from "@gomarket/ui";
import { ROUTES } from "@/lib/config/routes";
import { PRODUCTS } from "@/lib/data/products";
import {
  CreateCollectionFormValues,
  createCollectionSchema,
} from "@/lib/validations/schemas";
import { Field, Section } from "../create/helpers";
import {
  CoverImageUpload,
  ProductPickerRow,
  SelectedProductPill,
} from "./helpers";

export default function CreateCollection() {
  const router = useRouter();
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCollectionFormValues>({
    resolver: zodResolver(createCollectionSchema) as any,
    defaultValues: { status: "active", productIds: [] },
  });

  const { onBlur: descriptionOnBlur, ...descriptionRegister } =
    register("description");

  const nameVal = watch("name") ?? "";
  const selectedIds: string[] = watch("productIds") ?? [];

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return PRODUCTS;
    const q = productSearch.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.includes(q) ||
        p.tags.some((t) => t.includes(q)),
    );
  }, [productSearch]);

  const selectedProducts = PRODUCTS.filter((p) => selectedIds.includes(p.id));

  function toggleProduct(id: string) {
    const curr = selectedIds;
    setValue(
      "productIds",
      curr.includes(id) ? curr.filter((i) => i !== id) : [...curr, id],
      { shouldValidate: true },
    );
  }

  async function onSubmit(
    data: CreateCollectionFormValues,
    status: "active" | "draft",
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
          className="flex items-center gap-1.5 text-[13px] font-medium group transition-colors"
          style={{ color: "#6b7280" }}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Collections
        </button>
        <div className="w-px h-4" style={{ background: "#e2e8f0" }} />
        <div className="flex items-center gap-2 flex-1">
          <Layers className="w-4 h-4 shrink-0" style={{ color: "#1A7A42" }} />
          <h1
            className="text-[18px] font-extrabold"
            style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
          >
            {nameVal || "New collection"}
          </h1>
        </div>

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
            Publish collection
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <form className="px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          {/* ── LEFT ────────────────────────────────────── */}
          <div className="space-y-5 min-w-0">
            {/* Details */}
            <Section
              title="Collection details"
              description="Name and description visible to customers on your storefront."
            >
              <div className="space-y-4">
                <Field
                  label="Collection name"
                  required
                  error={errors.name?.message}
                >
                  <Input
                    id="name"
                    placeholder="e.g. New Arrivals"
                    {...register("name", {
                      // onChange: (e) => {
                      //   if (!slugEdited)
                      //     setValue("slug", toSlug(e.target.value));
                      // },
                    })}
                  />
                </Field>

                <Field
                  label="Description"
                  hint="Appears below the collection title on your storefront."
                >
                  <textarea
                    rows={3}
                    placeholder="Fresh pieces just landed in the store…"
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
              </div>
            </Section>

            {/* Cover image */}
            <Section
              title="Cover image"
              description="Displayed at the top of your collection page and in collection grids."
            >
              <CoverImageUpload
                image={coverImage}
                onSet={setCoverImage}
                onClear={() => setCoverImage(null)}
              />
            </Section>

            {/* Products */}
            <Section
              title="Products"
              description={`${selectedIds.length} product${selectedIds.length !== 1 ? "s" : ""} in this collection`}
            >
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                    style={{ color: "#94a3b8" }}
                  />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products to add…"
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
                </div>

                {/* Product list */}
                <div
                  className="rounded-[10px] border divide-y overflow-hidden"
                  style={
                    { borderColor: "#e2e8f0", divideColor: "#f1f5f9" } as any
                  }
                >
                  {filteredProducts.length === 0 ? (
                    <div className="py-8 text-center">
                      <p
                        className="text-[13px] font-medium"
                        style={{ color: "#94a3b8" }}
                      >
                        No products match "{productSearch}"
                      </p>
                    </div>
                  ) : (
                    <div className="p-1.5 max-h-[340px] overflow-y-auto space-y-0.5">
                      {filteredProducts.map((product) => (
                        <ProductPickerRow
                          key={product.id}
                          product={product}
                          selected={selectedIds.includes(product.id)}
                          onToggle={() => toggleProduct(product.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {errors.productIds && (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle
                      className="w-3.5 h-3.5"
                      style={{ color: "#dc2626" }}
                    />
                    <p className="text-[12px]" style={{ color: "#dc2626" }}>
                      {errors.productIds.message}
                    </p>
                  </div>
                )}

                {/* Selected summary */}
                {selectedProducts.length > 0 && (
                  <div>
                    <p
                      className="text-[11px] font-bold uppercase mb-2"
                      style={{ letterSpacing: "0.08em", color: "#94a3b8" }}
                    >
                      Selected ({selectedProducts.length})
                    </p>
                    <div className="space-y-1.5">
                      {selectedProducts.map((p) => (
                        <SelectedProductPill
                          key={p.id}
                          product={p}
                          onRemove={() => toggleProduct(p.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          </div>

          {/* ── RIGHT sidebar ────────────────────────────── */}
          <div className="space-y-5">
            {/* Visibility */}
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
                          onClick={(e) => e.stopPropagation()}
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
            </div>

            {/* Tips */}
            <div
              className="rounded-[12px] p-4 space-y-2.5 text-[12px]"
              style={{
                background: "#fffbeb",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <div
                className="flex items-center gap-1.5 font-bold"
                style={{ color: "#92400e" }}
              >
                <Info className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
                Collection tips
              </div>
              {[
                "Collections appear as categories on your storefront homepage.",
                "A product can belong to multiple collections.",
                "Use collections to run promotions on a group of products.",
              ].map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2"
                  style={{ color: "#92400e" }}
                >
                  <div
                    className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                    style={{ background: "#f59e0b" }}
                  />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
