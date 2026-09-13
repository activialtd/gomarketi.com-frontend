"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star, ArrowLeft, HelpCircle } from "lucide-react";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gomarket/ui";
import { ROUTES } from "@/lib/config/routes";
import {
  CreateProductFormValues,
  createProductSchema,
} from "@/lib/validations/schemas";
import { Field, ImageUpload, Toggle, Section } from "./helpers";
import {
  catalogueApi,
  ApiError,
  type CollectionResp,
  type CategoryResp,
  type CanonicalProductResp,
} from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import CanonicalProductTypeahead from "./CanonicalProductTypeahead";
import { invalidate, useSubscription, useProducts } from "@/lib/swr/hooks";
import { UpgradeBanner } from "@/components/common/PlanGate";

export default function CreateProductPage({
  productId,
}: {
  productId?: string;
}) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isEditing = !!productId;
  const { data: subscription } = useSubscription();
  const { data: productsData } = useProducts();
  const plan = subscription?.plan;
  const maxImages = plan?.slug === "free" ? 3 : 8;
  const atProductLimit =
    !isEditing &&
    !!plan &&
    plan.product_limit !== -1 &&
    (productsData?.total ?? 0) >= plan.product_limit;
  const [images, setImages] = useState<string[]>([]);
  const [canonicalProduct, setCanonicalProduct] =
    useState<CanonicalProductResp | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [collections, setCollections] = useState<CollectionResp[]>([]);
  const [categories, setCategories] = useState<CategoryResp[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    catalogueApi
      .listCollections(accessToken)
      .then((r) => setCollections(r.collections))
      .catch(() => {});
    catalogueApi
      .listCategories(accessToken)
      .then((cats) => setCategories(cats))
      .catch(() => {});
  }, [accessToken]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema) as any,
    defaultValues: {
      status: "draft",
      featured: false,
    },
  });

  useEffect(() => {
    if (!productId || !accessToken) return;
    let cancelled = false;
    (async () => {
      let p;
      try {
        p = await catalogueApi.getProduct(productId, accessToken);
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiError
              ? err.message
              : "Could not load this product. It may have been deleted.";
          // eslint-disable-next-line no-console
          console.error("Failed to load product for editing:", err);
          setLoadError(message);
          setLoadingProduct(false);
        }
        return;
      }
      if (cancelled) return;
      try {
        setImages(p.images ?? []);
        reset({
          name: p.name,
          description: p.description ?? "",
          category: p.category_id ?? "",
          tags: (p.tags ?? []).join(", "),
          price: p.price_kobo / 100,
          stock: p.stock,
          sku: p.sku ?? "",
          status: p.is_published ? "active" : "draft",
          featured: false,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Product loaded but failed to populate the form:", err);
        if (!cancelled)
          setLoadError(
            "This product loaded but couldn't be displayed. Please try again.",
          );
      } finally {
        if (!cancelled) setLoadingProduct(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, accessToken, reset]);

  const { onBlur: descriptionOnBlur, ...descriptionRegister } =
    register("description");

  const nameVal = watch("name") ?? "";

  async function onSubmit(
    data: CreateProductFormValues,
    status: "draft" | "active",
  ) {
    if (!accessToken) return;
    if (atProductLimit) {
      setSubmitError(
        `You've reached your plan's ${plan?.product_limit}-product limit — upgrade to add more.`,
      );
      return;
    }
    const setter = status === "draft" ? setIsSaving : setIsPublishing;
    setter(true);
    setSubmitError(null);
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        category_id: data.category || undefined,
        price_kobo: Math.round((data.price ?? 0) * 100),
        stock: data.stock ?? 9999,
        sku: data.sku || undefined,
        images,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        canonical_product_id: canonicalProduct?.id ?? undefined,
      };

      const productIdForPublish = isEditing
        ? (await catalogueApi.updateProduct(productId!, payload, accessToken))
            .id
        : (
            await catalogueApi.createProduct(
              { ...payload, is_digital: false },
              accessToken,
            )
          ).id;

      if (status === "active") {
        await catalogueApi.publishProduct(productIdForPublish, accessToken);
      } else if (isEditing) {
        await catalogueApi.unpublishProduct(productIdForPublish, accessToken);
      }
      invalidate.products();
      router.push(ROUTES.MERCHANT.PRODUCTS);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "Failed to save product. Please try again.",
      );
    } finally {
      setter(false);
    }
  }

  if (loadingProduct) {
    return (
      <div
        className="w-full flex items-center justify-center py-32 gap-2"
        style={{ color: "#94a3b8" }}
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-[13px]">Loading product…</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 gap-3">
        <p className="text-[13px] font-semibold" style={{ color: "#374151" }}>
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => router.push(ROUTES.MERCHANT.PRODUCTS)}
          className="text-[12px] font-bold"
          style={{ color: "#1A7A42" }}
        >
          Back to products
        </button>
      </div>
    );
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
          {nameVal || (isEditing ? "Edit product" : "New product")}
        </h1>
        <div className="flex items-center gap-2">
          {submitError && !atProductLimit && (
            <span className="text-[12px] font-semibold text-red-500 max-w-[200px] truncate">
              {submitError}
            </span>
          )}
          <button
            type="button"
            onClick={handleSubmit((d) => onSubmit(d, "draft"))}
            disabled={isSaving || isPublishing || atProductLimit}
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
            {isEditing ? "Save as draft" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={handleSubmit((d) => onSubmit(d, "active"))}
            disabled={isSaving || isPublishing || atProductLimit}
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
            {isEditing ? "Save & publish" : "Publish product"}
          </button>
        </div>
      </div>

      {atProductLimit && (
        <div className="px-6 lg:px-8 pt-5">
          <UpgradeBanner
            label={`You've reached your plan's ${plan?.product_limit}-product limit`}
            message="Upgrade to add more products and unlock higher limits."
          />
        </div>
      )}

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
                  {accessToken && (
                    <CanonicalProductTypeahead
                      query={nameVal}
                      token={accessToken}
                      selected={canonicalProduct}
                      onSelect={setCanonicalProduct}
                    />
                  )}
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
                            {categories.length === 0 ? (
                              <SelectItem value="__none" disabled>
                                No categories yet — add from Categories page
                              </SelectItem>
                            ) : (
                              categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))
                            )}
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
              description={
                plan?.slug === "free"
                  ? "Free plan: up to 3 images. First image is the main thumbnail."
                  : "Upload up to 8 images. First image is the main thumbnail."
              }
            >
              <ImageUpload
                images={images}
                onAdd={(url) => setImages((p) => [...p, url])}
                onRemove={(i) =>
                  setImages((p) => p.filter((_, idx) => idx !== i))
                }
                accessToken={accessToken ?? ""}
                maxImages={maxImages}
              />
            </Section>

            {/* Pricing */}
            <Section
              title="Pricing"
              description="Set your customer selling price."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  hint="Shown as strikethrough for sales/discounts"
                >
                  <Input
                    type="number"
                    min={0}
                    placeholder="0.00"
                    {...register("compareAtPrice")}
                  />
                </Field>
              </div>
            </Section>

            {/* Inventory */}
            <Section
              title="Inventory"
              description="Stock levels and internal identification."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Stock quantity" error={errors.stock?.message}>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    {...register("stock")}
                  />
                </Field>
                <Field
                  label={
                    <span className="flex items-center gap-1.5">
                      SKU (Stock Keeping Unit)
                      <span className="group relative inline-flex">
                        <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                        <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-lg z-50 font-normal">
                          Optional internal code (e.g. ANK-M-CB) to track unique
                          product styles/variants in your inventory.
                        </span>
                      </span>
                    </span>
                  }
                  hint="Optional internal reference code"
                >
                  <Input placeholder="e.g. ANK-M-CB" {...register("sku")} />
                </Field>
              </div>
            </Section>

            {/* Variant Option Builder commented out or removed per request */}
            {/* 
            <Section title="Variants" ...>
              ...
            </Section> 
            */}
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
                    {collections.length === 0 && (
                      <p
                        className="text-[12px] py-2"
                        style={{ color: "#94a3b8" }}
                      >
                        No collections yet — create one from the Products page.
                      </p>
                    )}
                    {collections.map((col) => {
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
                            {col.product_ids?.length ?? 0}
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
