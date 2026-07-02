"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Loader2,
  ExternalLink,
  Info,
  Globe,
  Share2,
} from "lucide-react";
import { Input } from "@gomarket/ui";
import { storeInfoSchema, StoreInfoValues } from "@/lib/validations/schemas";
import { LogoUpload, Field, Section } from "./helpers";
import { NIGERIAN_STATES } from "@gomarket/shared-utils";
import { storefrontApi, ApiError, type StoreResp } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/lib/config/routes";

const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN ?? "gomarketi.com";

export default function StoreInformationPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [store, setStore] = useState<StoreResp | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreInfoValues>({
    resolver: zodResolver(storeInfoSchema),
  });

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    storefrontApi
      .getMyStore(accessToken)
      .then((s) => {
        if (cancelled) return;
        setStore(s);
        setLogo(s.logo_url ?? null);
        reset({
          storeName: s.name,
          storeTagline: s.tagline ?? "",
          storePhone: s.support_phone ?? "",
          storeAddress: s.address ?? "",
          storeCity: s.city ?? "",
          storeState: s.state ?? "",
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : "Could not load your store details.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, reset]);

  async function onSubmit(data: StoreInfoValues) {
    if (!accessToken || !store) return;
    setIsSaving(true);
    setSubmitError("");
    try {
      const updated = await storefrontApi.updateStore(
        store.id,
        {
          name: data.storeName,
          tagline: data.storeTagline || undefined,
          support_phone: data.storePhone,
          address: data.storeAddress,
          city: data.storeCity,
          state: data.storeState,
          logo_url: logo ?? undefined,
        },
        accessToken,
      );
      setStore(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const storefrontUrl = store ? `http://${store.slug}.${STORE_DOMAIN}` : null;
  const completionItems = [
    { label: "Store logo", done: !!logo },
    { label: "Tagline", done: !!store?.tagline },
    { label: "Phone number", done: !!store?.support_phone },
    { label: "Business address", done: !!store?.address },
  ];
  const completionPct = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100,
  );

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-32 gap-2" style={{ color: "#94a3b8" }}>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-[13px]">Loading store details…</span>
      </div>
    );
  }

  if (loadError || !store) {
    return (
      <div className="w-full flex items-center justify-center py-32">
        <p className="text-[13px] font-semibold" style={{ color: "#374151" }}>
          {loadError || "Could not load your store."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="px-6 lg:px-8 py-4 border-b flex flex-wrap items-center justify-between gap-3"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <div>
          <h1
            className="text-[20px] font-extrabold"
            style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
          >
            Store Information
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
            Details displayed on your storefront and order communications
          </p>
        </div>
        <div className="flex items-center gap-2">
          {submitError && (
            <span className="text-[12px] font-semibold text-red-500 max-w-[220px] truncate">{submitError}</span>
          )}
          <a
            href={storefrontUrl ?? "#"}
            target={storefrontUrl ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] border text-[12px] font-semibold transition-colors"
            style={{
              borderColor: "#e2e8f0",
              background: "#fff",
              color: "#374151",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#F0FAF3")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <ExternalLink className="w-3.5 h-3.5" /> Preview store
          </a>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="flex items-center gap-1.5 h-9 px-4 rounded-[8px] text-white text-[12px] font-bold transition-all disabled:opacity-60"
            style={{
              background: "#0A2E1A",
              boxShadow: "0 2px 8px rgba(26,122,66,0.25)",
            }}
            onMouseOver={(e) =>
              !isSaving && (e.currentTarget.style.background = "#239452")
            }
            onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saved ? (
              <>
                <Check className="w-3.5 h-3.5" /> Saved!
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>

      <form
        className="px-6 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-5">
          {/* Branding */}
          <Section
            title="Branding"
            description="Your logo appears on your storefront and emails."
          >
            <LogoUpload logo={logo} onSet={setLogo} accessToken={accessToken ?? ""} />
          </Section>

          {/* Basic details */}
          <Section
            title="Store details"
            description="Core information about your business."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Store name" error={errors.storeName?.message}>
                  <Input
                    placeholder="Eko Fashion House"
                    {...register("storeName")}
                  />
                </Field>
                <Field
                  label="Tagline"
                  hint="Short description shown under your store name"
                  error={errors.storeTagline?.message}
                >
                  <Input
                    placeholder="Premium Nigerian fashion"
                    {...register("storeTagline")}
                  />
                </Field>
              </div>
              <Field label="Contact phone" error={errors.storePhone?.message}>
                <Input
                  type="tel"
                  placeholder="08031234567"
                  {...register("storePhone")}
                />
              </Field>
            </div>
          </Section>

          {/* Address */}
          <Section
            title="Business address"
            description="Shown in your storefront footer and on receipts."
          >
            <div className="space-y-4">
              <Field
                label="Street address"
                error={errors.storeAddress?.message}
              >
                <Input
                  placeholder="14 Bode Thomas Street"
                  {...register("storeAddress")}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" error={errors.storeCity?.message}>
                  <Input placeholder="Surulere" {...register("storeCity")} />
                </Field>
                <Field label="State" error={errors.storeState?.message}>
                  <div className="relative">
                    <select
                      className="w-full h-[42px] px-3.5 rounded-[10px] border text-[13px] outline-none appearance-none transition-all"
                      style={{
                        borderColor: "#e2e8f0",
                        background: "#F0FAF3",
                        color: "#1C1C1C",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#1A7A42";
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.outline = "2px solid #1A7A42";
                        e.currentTarget.style.outlineOffset = "-2px";
                      }}
                      {...register("storeState", {
                        onBlur: (e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.background = "#F0FAF3";
                          e.currentTarget.style.outline = "none";
                        },
                      })}
                    >
                      <option value="">Select state</option>
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>
              </div>
            </div>
          </Section>

          {/* Social — managed in Store Customization */}
          <div
            className="rounded-[14px] border p-4 flex items-start gap-3"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div
              className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
              style={{ background: "#F0FAF3" }}
            >
              <Share2 className="w-4 h-4" style={{ color: "#1A7A42" }} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold" style={{ color: "#1C1C1C" }}>
                WhatsApp & social links
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
                Your WhatsApp number, Instagram, Twitter, and Facebook links are managed in
                Store Customization, where they appear live in your storefront footer.
              </p>
              <Link
                href={ROUTES.MERCHANT.CUSTOMISE}
                className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-bold"
                style={{ color: "#1A7A42" }}
              >
                Go to Store Customization →
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Store URL */}
          <div
            className="rounded-[14px] border p-4 space-y-3"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <p
              className="text-[13px] font-extrabold"
              style={{ color: "#1C1C1C" }}
            >
              Storefront URL
            </p>
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-[8px]"
              style={{
                background: "#F0FAF3",
                border: "1px solid rgba(26,122,66,0.15)",
              }}
            >
              <Globe
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: "#1A7A42" }}
              />
              <span
                className="text-[12px] font-mono font-semibold truncate"
                style={{ color: "#1A7A42" }}
              >
                {store.slug}.{STORE_DOMAIN}
              </span>
            </div>
            <a
              href={storefrontUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-semibold"
              style={{ color: "#1A7A42" }}
            >
              <ExternalLink className="w-3.5 h-3.5" /> Visit your store
            </a>
          </div>

          {/* Completion */}
          <div
            className="rounded-[14px] border p-4 space-y-3"
            style={{ background: "#fff", borderColor: "#e2e8f0" }}
          >
            <div className="flex items-center justify-between">
              <p
                className="text-[13px] font-extrabold"
                style={{ color: "#1C1C1C" }}
              >
                Profile completeness
              </p>
              <span
                className="text-[12px] font-bold"
                style={{ color: "#1A7A42" }}
              >
                {completionPct}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "#f1f5f9" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${completionPct}%`, background: "#1A7A42" }}
              />
            </div>
            <div className="space-y-1.5">
              {completionItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-[11px]"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: item.done ? "#1A7A42" : "#f1f5f9" }}
                  >
                    {item.done && <Check className="w-2 h-2 text-white" />}
                  </div>
                  <span
                    style={{
                      color: item.done ? "#374151" : "#94a3b8",
                      textDecoration: item.done ? "line-through" : "none",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div
            className="rounded-[12px] p-3.5 space-y-1.5 text-[12px]"
            style={{
              background: "#fffbeb",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "#92400e",
            }}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} /> Tip
            </div>
            Stores with complete profiles get <strong>2× more trust</strong>{" "}
            from first-time customers. Add your logo and tagline today.
          </div>
        </div>
      </form>
    </div>
  );
}
