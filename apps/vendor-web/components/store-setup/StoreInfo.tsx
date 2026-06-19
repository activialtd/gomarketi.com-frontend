"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Phone,
  Check,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
  Info,
  Globe,
} from "lucide-react";
import { Input } from "@gomarket/ui";
import { storeInfoSchema, StoreInfoValues } from "@/lib/validations/schemas";
import { LogoUpload, Field, StyledTextarea, Section } from "./helpers";
import { NIGERIAN_STATES, toSlug } from "@gomarket/shared-utils";

export default function StoreInformationPage() {
  const [logo, setLogo] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const bannerRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<StoreInfoValues>({
    resolver: zodResolver(storeInfoSchema),
    defaultValues: {
      storeName: "Eko Fashion House",
      storeTagline: "Premium Nigerian fashion for every occasion",
      storeEmail: "hello@ekofashion.ng",
      storePhone: "08031234567",
      storeAddress: "14 Bode Thomas Street",
      storeCity: "Surulere",
      storeState: "Lagos",
    },
  });

  async function onSubmit(_data: StoreInfoValues) {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }
  const storeSlug = toSlug(getValues("storeName"));

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
          <a
            href="#"
            target="_blank"
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
              background: "#1A7A42",
              boxShadow: "0 2px 8px rgba(26,122,66,0.25)",
            }}
            onMouseOver={(e) =>
              !isSaving && (e.currentTarget.style.background = "#239452")
            }
            onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
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
            description="Your logo and banner appear on your storefront and emails."
          >
            <div className="space-y-5">
              <div>
                <p
                  className="text-[10px] font-extrabold uppercase mb-3"
                  style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
                >
                  Store logo
                </p>
                <LogoUpload logo={logo} onSet={setLogo} />
              </div>
              <div>
                <p
                  className="text-[10px] font-extrabold uppercase mb-2"
                  style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
                >
                  Store banner
                </p>
                {banner ? (
                  <div className="relative rounded-[10px] overflow-hidden aspect-[3/1]">
                    <img
                      src={banner}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setBanner(null)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.6)" }}
                    >
                      <span className="text-white text-sm">×</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => bannerRef.current?.click()}
                    className="w-full rounded-[10px] border-2 border-dashed py-7 flex flex-col items-center gap-2 transition-all"
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
                    <ImageIcon
                      className="w-6 h-6"
                      style={{ color: "#a7f3d0" }}
                    />
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: "#374151" }}
                    >
                      Upload store banner
                    </p>
                    <p className="text-[11px]" style={{ color: "#94a3b8" }}>
                      Recommended 1440×400px · PNG, JPG
                    </p>
                  </button>
                )}
                <input
                  ref={bannerRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() =>
                    setBanner(
                      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
                    )
                  }
                />
              </div>
            </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Contact email" error={errors.storeEmail?.message}>
                  <Input
                    type="email"
                    placeholder="hello@yourstore.ng"
                    {...register("storeEmail")}
                  />
                </Field>
                <Field label="Contact phone" error={errors.storePhone?.message}>
                  <Input
                    type="tel"
                    placeholder="08031234567"
                    {...register("storePhone")}
                  />
                </Field>
              </div>
              <Field
                label="Support email"
                hint="For order enquiries — defaults to contact email if empty"
                error={errors.supportEmail?.message}
              >
                <Input
                  type="email"
                  placeholder="support@yourstore.ng"
                  {...register("supportEmail")}
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
                      // onBlur={(e) => {
                      //   e.currentTarget.style.borderColor = "#e2e8f0";
                      //   e.currentTarget.style.background = "#F0FAF3";
                      //   e.currentTarget.style.outline = "none";
                      // }}
                      {...register("storeState")}
                    >
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>
              </div>
              <Field
                label="Opening hours"
                hint="Displayed on your storefront — helps customers know when to reach you"
              >
                <Input
                  placeholder="Mon–Sat: 9am–6pm · Sun: Closed"
                  {...register("openingHours")}
                />
              </Field>
            </div>
          </Section>

          {/* Social */}
          <Section
            title="Social media"
            description="Links appear in your storefront footer."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  key: "whatsapp" as const,
                  icon: Phone,
                  label: "WhatsApp",
                  placeholder: "+2348031234567",
                },
                {
                  key: "instagram" as const,
                  icon: Phone,
                  label: "Instagram",
                  placeholder: "@yourstore",
                },
                {
                  key: "twitter" as const,
                  icon: Phone,
                  label: "X (Twitter)",
                  placeholder: "@yourstore",
                },
                {
                  key: "facebook" as const,
                  icon: Phone,
                  label: "Facebook",
                  placeholder: "yourpagename",
                },
              ].map((s) => (
                <Field key={s.key} label={s.label}>
                  <div className="relative">
                    <s.icon
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                      style={{ color: "#94a3b8" }}
                    />
                    <Input
                      className="pl-9"
                      placeholder={s.placeholder}
                      {...register(s.key)}
                    />
                  </div>
                </Field>
              ))}
            </div>
          </Section>

          {/* Return policy */}
          <Section
            title="Return & refund policy"
            description="Shown at checkout and on your storefront — builds customer trust."
          >
            <Field
              label="Policy text"
              hint="Keep it clear and honest — customers appreciate transparency"
            >
              <StyledTextarea
                rows={4}
                placeholder="e.g. We accept returns within 7 days of delivery. Items must be unworn and in original packaging. Contact us on WhatsApp to initiate a return…"
                {...register("returnPolicy")}
              />
            </Field>
          </Section>
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
                eko-fashion.gomarketi.com
              </span>
            </div>
            <a
              href={`https://${storeSlug}.${process.env.NEXT_PUBLIC_FRONTEND_URL} || http://${storeSlug}.localhost:3000`}
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
                72%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "#f1f5f9" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: "72%", background: "#1A7A42" }}
              />
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Store logo", done: !!logo },
                { label: "Store banner", done: !!banner },
                { label: "Social links", done: false },
                { label: "Return policy", done: false },
              ].map((item) => (
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
            from first-time customers. Add your logo and return policy today.
          </div>
        </div>
      </form>
    </div>
  );
}
