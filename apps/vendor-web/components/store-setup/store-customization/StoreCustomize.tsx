"use client";

import { useState, useCallback } from "react";
import {
  Check,
  ExternalLink,
  Loader2,
  Eye,
  Palette,
  Type,
  Layout,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  Star,
  Lock,
  Sparkles,
  Info,
} from "lucide-react";
import {
  LivePreview,
  TEMPLATES,
  COLOR_PRESETS,
  FONT_PRESETS,
  FONT_FAMILIES,
  TemplateId,
  ColorPreset,
  EkoThumb,
  LagosThumb,
  AbujaThumb,
} from "./helpers";

export default function StoreCustomize() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("eko");
  const [activeColors, setActiveColors] = useState<ColorPreset>(
    COLOR_PRESETS[0],
  );
  const [activeFont, setActiveFont] = useState("plus-jakarta");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [storeName, setStoreName] = useState("Eko Fashion House");
  const [headline, setHeadline] = useState("Fashion that tells your story");
  const [subheadline, setSubheadline] = useState(
    "Premium Nigerian fashion for weddings, events, and everyday life.",
  );
  const [activePanel, setActivePanel] = useState<
    "template" | "colors" | "typography" | "content"
  >("template");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const thumbColors = {
    eko: { bg: "#F0FAF3", primary: "#1A7A42", card: "#f8fafc" },
    lagos: { bg: "#f0f9ff", primary: "#0369a1", card: "#f8fafc" },
    abuja: { bg: "#faf5ff", primary: "#7c3aed", card: "#f8fafc" },
  };

  return (
    <div
      className="w-full flex flex-col"
      style={{ height: "calc(100vh - 60px)" }}
    >
      {/* ── Top toolbar ──────────────────────────────────────── */}
      <div
        className="shrink-0 px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <div className="flex items-center gap-2">
          <h1
            className="text-[16px] font-extrabold"
            style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
          >
            Store customisation
          </h1>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#F0FAF3", color: "#1A7A42" }}
          >
            Live preview
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport */}
          <div
            className="flex items-center rounded-[8px] border overflow-hidden"
            style={{ borderColor: "#e2e8f0" }}
          >
            {[
              { v: "desktop" as const, Icon: Monitor },
              { v: "tablet" as const, Icon: Tablet },
              { v: "mobile" as const, Icon: Smartphone },
            ].map(({ v, Icon }) => (
              <button
                key={v}
                type="button"
                onClick={() => setViewport(v)}
                className="w-9 h-9 flex items-center justify-center transition-colors"
                style={{
                  background: viewport === v ? "#F0FAF3" : "#fff",
                  color: viewport === v ? "#1A7A42" : "#94a3b8",
                }}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

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
            <ExternalLink className="w-3.5 h-3.5" /> View live
          </a>

          <button
            type="button"
            onClick={handleSave}
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
                <Check className="w-3.5 h-3.5" /> Published!
              </>
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </div>

      {/* ── Main area: sidebar + preview ─────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── LEFT: panel tabs + content ───────────────────── */}
        <div
          className="flex shrink-0"
          style={{ width: "320px", borderRight: "1px solid #e2e8f0" }}
        >
          {/* Tab strip */}
          <div
            className="flex flex-col border-r shrink-0"
            style={{
              width: "56px",
              borderColor: "#f1f5f9",
              background: "#fafafa",
            }}
          >
            {[
              { id: "template" as const, Icon: Layout, label: "Template" },
              { id: "colors" as const, Icon: Palette, label: "Colors" },
              { id: "typography" as const, Icon: Type, label: "Fonts" },
              { id: "content" as const, Icon: Eye, label: "Content" },
            ].map(({ id, Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActivePanel(id)}
                className="flex flex-col items-center gap-1 py-3.5 text-[8px] font-bold uppercase transition-colors"
                style={{
                  letterSpacing: "0.06em",
                  color: activePanel === id ? "#1A7A42" : "#94a3b8",
                  background: activePanel === id ? "#F0FAF3" : "transparent",
                  borderLeft:
                    activePanel === id
                      ? "2px solid #1A7A42"
                      : "2px solid transparent",
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto bg-white p-4 space-y-4">
            {/* ── Template panel ── */}
            {activePanel === "template" && (
              <div className="space-y-3">
                <div>
                  <p
                    className="text-[13px] font-extrabold mb-1"
                    style={{ color: "#1C1C1C" }}
                  >
                    Choose a template
                  </p>
                  <p className="text-[11px]" style={{ color: "#6b7280" }}>
                    Your customers will see this at your store URL.
                  </p>
                </div>

                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => !t.isPro && setActiveTemplate(t.id)}
                    className="w-full rounded-[12px] border overflow-hidden text-left transition-all"
                    style={{
                      borderColor:
                        activeTemplate === t.id ? "#1A7A42" : "#e2e8f0",
                      boxShadow:
                        activeTemplate === t.id
                          ? "0 0 0 2px rgba(26,122,66,0.15)"
                          : "none",
                      opacity: t.isPro ? 0.7 : 1,
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      className="w-full overflow-hidden"
                      style={{ aspectRatio: "16/9", background: t.accent }}
                    >
                      {t.id === "eko" && <EkoThumb colors={thumbColors.eko} />}
                      {t.id === "lagos" && (
                        <LagosThumb colors={thumbColors.lagos} />
                      )}
                      {t.id === "abuja" && (
                        <AbujaThumb colors={thumbColors.abuja} />
                      )}
                    </div>

                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p
                            className="text-[13px] font-extrabold"
                            style={{ color: "#1C1C1C" }}
                          >
                            {t.name}
                          </p>
                          {t.isPro && (
                            <span
                              className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: "#fef3c7",
                                color: "#92400e",
                              }}
                            >
                              <Lock className="w-2.5 h-2.5" /> Pro
                            </span>
                          )}
                          {activeTemplate === t.id && (
                            <span
                              className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: "#F0FAF3",
                                color: "#1A7A42",
                              }}
                            >
                              <Check className="w-2.5 h-2.5" /> Active
                            </span>
                          )}
                        </div>
                      </div>
                      <p
                        className="text-[11px] leading-relaxed"
                        style={{ color: "#6b7280" }}
                      >
                        {t.tagline}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.bestFor.map((b) => (
                          <span
                            key={b}
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: "#f1f5f9", color: "#374151" }}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ── Colors panel ── */}
            {activePanel === "colors" && (
              <div className="space-y-4">
                <div>
                  <p
                    className="text-[13px] font-extrabold mb-1"
                    style={{ color: "#1C1C1C" }}
                  >
                    Colour scheme
                  </p>
                  <p className="text-[11px]" style={{ color: "#6b7280" }}>
                    Sets your store's primary and background colours.
                  </p>
                </div>

                <div className="space-y-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setActiveColors(preset)}
                      className="w-full flex items-center gap-3 p-3 rounded-[10px] border transition-all text-left"
                      style={{
                        borderColor:
                          activeColors.label === preset.label
                            ? "#1A7A42"
                            : "#e2e8f0",
                        background:
                          activeColors.label === preset.label
                            ? "rgba(26,122,66,0.04)"
                            : "#fafafa",
                      }}
                    >
                      {/* Swatch pair */}
                      <div className="flex gap-1 shrink-0">
                        <div
                          className="w-7 h-7 rounded-l-[6px]"
                          style={{ background: preset.primary }}
                        />
                        <div
                          className="w-7 h-7 rounded-r-[6px]"
                          style={{
                            background: preset.bg,
                            border: "1px solid #e2e8f0",
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[12px] font-semibold"
                          style={{ color: "#1C1C1C" }}
                        >
                          {preset.label}
                        </p>
                        <p
                          className="text-[10px] font-mono"
                          style={{ color: "#94a3b8" }}
                        >
                          {preset.primary}
                        </p>
                      </div>
                      {activeColors.label === preset.label && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "#1A7A42" }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div
                  className="rounded-[10px] p-3 text-[11px] leading-relaxed"
                  style={{
                    background: "#fffbeb",
                    border: "1px solid rgba(245,158,11,0.2)",
                    color: "#92400e",
                  }}
                >
                  <strong>Tip:</strong> GoGreen matches your GoMarket dashboard
                  and is trusted by customers as a Nigerian-native brand colour.
                </div>
              </div>
            )}

            {/* ── Typography panel ── */}
            {activePanel === "typography" && (
              <div className="space-y-4">
                <div>
                  <p
                    className="text-[13px] font-extrabold mb-1"
                    style={{ color: "#1C1C1C" }}
                  >
                    Font style
                  </p>
                  <p className="text-[11px]" style={{ color: "#6b7280" }}>
                    Applied to all text on your storefront.
                  </p>
                </div>

                <div className="space-y-2">
                  {FONT_PRESETS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setActiveFont(f.value)}
                      className="w-full flex items-center gap-3 p-3 rounded-[10px] border transition-all text-left"
                      style={{
                        borderColor:
                          activeFont === f.value ? "#1A7A42" : "#e2e8f0",
                        background:
                          activeFont === f.value
                            ? "rgba(26,122,66,0.04)"
                            : "#fafafa",
                      }}
                    >
                      <div
                        className="w-12 h-10 rounded-[7px] flex items-center justify-center shrink-0 text-[22px] font-bold"
                        style={{
                          background: "#f1f5f9",
                          color: "#1C1C1C",
                          fontFamily: FONT_FAMILIES[f.value],
                        }}
                      >
                        {f.sample}
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-[12px] font-semibold"
                          style={{ color: "#1C1C1C" }}
                        >
                          {f.label}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{
                            color: "#6b7280",
                            fontFamily: FONT_FAMILIES[f.value],
                          }}
                        >
                          The quick brown fox
                        </p>
                      </div>
                      {activeFont === f.value && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: "#1A7A42" }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Content panel ── */}
            {activePanel === "content" && (
              <div className="space-y-4">
                <div>
                  <p
                    className="text-[13px] font-extrabold mb-1"
                    style={{ color: "#1C1C1C" }}
                  >
                    Storefront content
                  </p>
                  <p className="text-[11px]" style={{ color: "#6b7280" }}>
                    Edit the text customers see on your homepage.
                  </p>
                </div>

                {[
                  {
                    label: "Store name",
                    value: storeName,
                    set: setStoreName,
                    placeholder: "Eko Fashion House",
                    hint: "Shown in your nav and page title",
                  },
                  {
                    label: "Hero headline",
                    value: headline,
                    set: setHeadline,
                    placeholder: "Fashion that tells your story",
                    hint: "The big text on your homepage",
                  },
                  {
                    label: "Hero subheading",
                    value: subheadline,
                    set: setSubheadline,
                    placeholder: "Premium fashion for every occasion",
                    hint: "Supporting text under the headline",
                  },
                ].map((field) => (
                  <div key={field.label} className="space-y-1.5">
                    <label
                      className="text-[10px] font-extrabold uppercase block"
                      style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
                    >
                      {field.label}
                    </label>
                    <textarea
                      rows={2}
                      value={field.value}
                      onChange={(e) => field.set(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 rounded-[8px] border text-[13px] resize-none outline-none transition-all"
                      style={{
                        borderColor: "#e2e8f0",
                        background: "#F0FAF3",
                        color: "#1C1C1C",
                        lineHeight: "1.5",
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
                    <p className="text-[10px]" style={{ color: "#94a3b8" }}>
                      {field.hint}
                    </p>
                  </div>
                ))}

                <div
                  className="rounded-[10px] p-3 text-[11px] leading-relaxed flex items-start gap-2"
                  style={{
                    background: "#F0FAF3",
                    border: "1px solid rgba(26,122,66,0.15)",
                    color: "#3D6B4F",
                  }}
                >
                  <Info
                    className="w-3.5 h-3.5 shrink-0 mt-0.5"
                    style={{ color: "#1A7A42" }}
                  />
                  Changes here update the live preview instantly. Click
                  "Publish" to push them to your store.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Live preview ───────────────────────────── */}
        <div className="flex-1 overflow-auto" style={{ background: "#f1f5f9" }}>
          <div className="p-5 min-h-full">
            {/* Browser chrome */}
            <div
              className="rounded-[12px] overflow-hidden shadow-xl border"
              style={{ borderColor: "#e2e8f0" }}
            >
              {/* Browser bar */}
              <div
                className="flex items-center gap-2.5 px-4 py-2.5 border-b"
                style={{ background: "#fff", borderColor: "#e2e8f0" }}
              >
                <div className="flex gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: "#fee2e2" }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: "#fef3c7" }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: "#dcfce7" }}
                  />
                </div>
                <div
                  className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-[11px]"
                  style={{
                    background: "#f8fafc",
                    maxWidth: "320px",
                    margin: "0 auto",
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: "#1A7A42" }}
                  />
                  <span style={{ color: "#6b7280", fontFamily: "monospace" }}>
                    eko-fashion.gomarketi.com
                  </span>
                </div>
              </div>

              {/* Preview content */}
              <div
                style={{
                  background: "#fff",
                  maxHeight: "calc(100vh - 240px)",
                  overflow: "auto",
                }}
              >
                <LivePreview
                  template={activeTemplate}
                  colors={activeColors}
                  font={activeFont}
                  storeName={storeName}
                  headline={headline}
                  subheadline={subheadline}
                  viewport={viewport}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
