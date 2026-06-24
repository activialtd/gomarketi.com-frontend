"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Check, ExternalLink, Loader2, Monitor, Smartphone, Tablet,
  ChevronDown, ChevronRight, Eye, EyeOff, Palette, Type, Layout,
  Globe, Image as ImageIcon, AlignLeft, Megaphone, Package, Link2,
  Instagram, Phone, ToggleLeft, ToggleRight, Upload, Undo2, Save,
} from "lucide-react";
import {
  LivePreview, COLOR_PRESETS, FONT_PRESETS, FONT_FAMILIES,
  TemplateId, ColorPreset, EkoThumb, LagosThumb,
} from "./helpers";
import { storefrontApi } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";

// ─── ThemeConfig types ────────────────────────────────────────────────────────

export interface ThemeConfig {
  template: TemplateId;
  colors: { primary: string; secondary: string; bg: string; text: string; };
  font: string;
  sections: {
    announcement: { enabled: boolean; text: string; bgColor: string; };
    hero: { enabled: boolean; headline: string; subheadline: string; ctaText: string; imageUrl?: string; };
    collections: { enabled: boolean; title: string; };
    featured: { enabled: boolean; title: string; count: number; };
    ctaBand: { enabled: boolean; headline: string; text: string; btnText: string; };
    footer: { tagline: string; whatsapp?: string; instagram?: string; };
  };
}

const DEFAULT_CONFIG: ThemeConfig = {
  template: "eko",
  colors: COLOR_PRESETS[0],
  font: "plus-jakarta",
  sections: {
    announcement: { enabled: false, text: "🎉 Free delivery on orders above ₦20,000", bgColor: "#1A7A42" },
    hero: { enabled: false, headline: "Welcome to our store", subheadline: "Discover amazing products curated just for you.", ctaText: "Shop now" },
    collections: { enabled: false, title: "Shop by collection" },
    featured: { enabled: false, title: "Featured products", count: 6 },
    ctaBand: { enabled: false, headline: "Have a question?", text: "Message us on WhatsApp — we reply fast.", btnText: "Chat on WhatsApp" },
    footer: { tagline: "", whatsapp: "", instagram: "" },
  },
};

// ─── Sidebar section definitions ──────────────────────────────────────────────

type SectionKey = keyof ThemeConfig["sections"];

interface SectionDef {
  key: SectionKey;
  label: string;
  icon: React.ElementType;
  toggleable: boolean;
}

const SECTION_DEFS: SectionDef[] = [
  { key: "announcement", label: "Announcement bar", icon: Megaphone, toggleable: true },
  { key: "hero",         label: "Hero section",      icon: ImageIcon,  toggleable: true },
  { key: "collections",  label: "Collections strip",  icon: Layout,     toggleable: true },
  { key: "featured",     label: "Featured products",  icon: Package,    toggleable: true },
  { key: "ctaBand",      label: "WhatsApp CTA band",  icon: Phone,      toggleable: true },
  { key: "footer",       label: "Footer",             icon: AlignLeft,  toggleable: false },
];

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className="shrink-0 relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none"
      style={{ background: on ? "#1A7A42" : "#cbd5e1" }}
      aria-checked={on}
      role="switch"
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5"
        style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

// ─── Input helpers ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "#94a3b8" }}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-[8px] border text-[12px] outline-none focus:border-[#1A7A42] transition-colors"
      style={{ borderColor: "#e2e8f0", color: "#1C1C1C", background: "#f8fafc" }}
    />
  );
}

// ─── Section panels ───────────────────────────────────────────────────────────

function AnnouncementPanel({ s, set }: { s: ThemeConfig["sections"]["announcement"]; set: (v: Partial<ThemeConfig["sections"]["announcement"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <Field label="Bar text">
        <TextInput value={s.text} onChange={(v) => set({ text: v })} placeholder="🎉 Free delivery on orders above ₦20,000" />
      </Field>
      <Field label="Background colour">
        <div className="flex gap-2 flex-wrap">
          {["#1A7A42", "#0369a1", "#7c3aed", "#be185d", "#c2410c", "#0f172a"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set({ bgColor: c })}
              className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
              style={{ background: c, borderColor: s.bgColor === c ? "#1C1C1C" : "transparent" }}
            />
          ))}
          <input type="color" value={s.bgColor} onChange={(e) => set({ bgColor: e.target.value })}
            className="w-6 h-6 rounded-full cursor-pointer border-0 p-0 bg-transparent" title="Custom colour" />
        </div>
      </Field>
    </div>
  );
}

function HeroPanel({ s, set }: { s: ThemeConfig["sections"]["hero"]; set: (v: Partial<ThemeConfig["sections"]["hero"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <Field label="Headline">
        <TextInput value={s.headline} onChange={(v) => set({ headline: v })} placeholder="Welcome to our store" />
      </Field>
      <Field label="Subheadline">
        <textarea
          value={s.subheadline}
          onChange={(e) => set({ subheadline: e.target.value })}
          placeholder="A short description of your store..."
          rows={2}
          className="w-full px-3 py-2 rounded-[8px] border text-[12px] outline-none focus:border-[#1A7A42] resize-none transition-colors"
          style={{ borderColor: "#e2e8f0", color: "#1C1C1C", background: "#f8fafc" }}
        />
      </Field>
      <Field label="Button text">
        <TextInput value={s.ctaText} onChange={(v) => set({ ctaText: v })} placeholder="Shop now" />
      </Field>
      <Field label="Hero image">
        <div
          className="rounded-[8px] border-2 border-dashed flex flex-col items-center justify-center gap-2 py-4 cursor-pointer transition-colors hover:border-[#1A7A42] hover:bg-[#F0FAF3]"
          style={{ borderColor: "#e2e8f0" }}
        >
          {s.imageUrl ? (
            <img src={s.imageUrl} alt="" className="w-full h-24 object-cover rounded-[6px]" />
          ) : (
            <>
              <Upload className="w-4 h-4" style={{ color: "#94a3b8" }} />
              <p className="text-[11px] text-center" style={{ color: "#94a3b8" }}>
                Upload image or paste URL<br />
                <span style={{ color: "#cbd5e1" }}>Placeholder shown until uploaded</span>
              </p>
            </>
          )}
          <input type="text" placeholder="Paste image URL…" value={s.imageUrl ?? ""}
            onChange={(e) => set({ imageUrl: e.target.value || undefined })}
            className="w-full mt-1 px-2 py-1.5 rounded-[6px] border text-[11px] outline-none"
            style={{ borderColor: "#e2e8f0", background: "#fff" }}
          />
        </div>
      </Field>
    </div>
  );
}

function CollectionsPanel({ s, set }: { s: ThemeConfig["sections"]["collections"]; set: (v: Partial<ThemeConfig["sections"]["collections"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <Field label="Section title">
        <TextInput value={s.title} onChange={(v) => set({ title: v })} placeholder="Shop by collection" />
      </Field>
      <p className="text-[11px]" style={{ color: "#94a3b8" }}>Collections appear here once you create them in your product catalogue.</p>
    </div>
  );
}

function FeaturedPanel({ s, set }: { s: ThemeConfig["sections"]["featured"]; set: (v: Partial<ThemeConfig["sections"]["featured"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <Field label="Section title">
        <TextInput value={s.title} onChange={(v) => set({ title: v })} placeholder="Featured products" />
      </Field>
      <Field label="Products to show">
        <div className="flex gap-2">
          {[3, 4, 6, 8].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => set({ count: n })}
              className="flex-1 py-1.5 rounded-[6px] border text-[12px] font-bold transition-colors"
              style={{
                borderColor: s.count === n ? "#1A7A42" : "#e2e8f0",
                background: s.count === n ? "#F0FAF3" : "#fff",
                color: s.count === n ? "#1A7A42" : "#374151",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </Field>
      <p className="text-[11px]" style={{ color: "#94a3b8" }}>Products appear here once you add them to your catalogue.</p>
    </div>
  );
}

function CtaBandPanel({ s, set }: { s: ThemeConfig["sections"]["ctaBand"]; set: (v: Partial<ThemeConfig["sections"]["ctaBand"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <Field label="Headline">
        <TextInput value={s.headline} onChange={(v) => set({ headline: v })} placeholder="Have a question?" />
      </Field>
      <Field label="Body text">
        <TextInput value={s.text} onChange={(v) => set({ text: v })} placeholder="Message us on WhatsApp — we reply fast." />
      </Field>
      <Field label="Button text">
        <TextInput value={s.btnText} onChange={(v) => set({ btnText: v })} placeholder="Chat on WhatsApp" />
      </Field>
    </div>
  );
}

function FooterPanel({ s, set }: { s: ThemeConfig["sections"]["footer"]; set: (v: Partial<ThemeConfig["sections"]["footer"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <Field label="Store tagline">
        <TextInput value={s.tagline} onChange={(v) => set({ tagline: v })} placeholder="Quality products, fast delivery" />
      </Field>
      <Field label="WhatsApp number">
        <TextInput value={s.whatsapp ?? ""} onChange={(v) => set({ whatsapp: v || undefined })} placeholder="+2348012345678" />
      </Field>
      <Field label="Instagram handle">
        <TextInput value={s.instagram ?? ""} onChange={(v) => set({ instagram: v || undefined })} placeholder="@yourstorename" />
      </Field>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StoreCustomize() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN ?? "gomarketi.com";

  const [store, setStore] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [draft, setDraft] = useState<ThemeConfig>(DEFAULT_CONFIG);
  const [published, setPublished] = useState<ThemeConfig | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"design" | "sections">("sections");
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>("hero");

  // Load store + published config
  useEffect(() => {
    if (!accessToken) return;
    storefrontApi.getMyStore(accessToken).then((s) => {
      setStore({ id: s.id, name: s.name, slug: s.slug });
      if (s.theme_config) {
        try {
          const cfg = JSON.parse(s.theme_config) as ThemeConfig;
          setDraft(cfg);
          setPublished(cfg);
        } catch { /* invalid JSON — use defaults */ }
      }
    }).catch(() => {});
  }, [accessToken]);

  // Mark dirty whenever draft changes after initial load
  const updateDraft = useCallback((updater: (prev: ThemeConfig) => ThemeConfig) => {
    setDraft((prev) => {
      const next = updater(prev);
      setIsDirty(true);
      return next;
    });
  }, []);

  function setColors(colors: ThemeConfig["colors"]) {
    updateDraft((p) => ({ ...p, colors }));
  }

  function setTemplate(template: TemplateId) {
    updateDraft((p) => ({ ...p, template }));
  }

  function setFont(font: string) {
    updateDraft((p) => ({ ...p, font }));
  }

  function setSection<K extends SectionKey>(key: K, value: Partial<ThemeConfig["sections"][K]>) {
    updateDraft((p) => ({
      ...p,
      sections: {
        ...p.sections,
        [key]: { ...p.sections[key], ...value },
      },
    }));
  }

  function toggleSection(key: SectionKey) {
    const sec = draft.sections[key] as { enabled?: boolean };
    setSection(key, { enabled: !sec.enabled } as Partial<ThemeConfig["sections"][typeof key]>);
  }

  async function handlePublish() {
    if (!accessToken || !store) return;
    setIsSaving(true);
    try {
      await storefrontApi.updateStore(store.id, { theme_config: JSON.stringify(draft) }, accessToken);
      setPublished(draft);
      setIsDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    if (published) {
      setDraft(published);
    } else {
      setDraft(DEFAULT_CONFIG);
    }
    setIsDirty(false);
  }

  const storefrontUrl = store ? `http://${store.slug}.${STORE_DOMAIN}` : null;
  const thumbColors = {
    eko: { bg: draft.colors.bg, primary: draft.colors.primary, card: "#f8fafc" },
    lagos: { bg: draft.colors.bg, primary: draft.colors.primary, card: "#f8fafc" },
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 60px)" }}>

      {/* ── Top toolbar ──────────────────────────────────────── */}
      <div
        className="shrink-0 px-4 py-2.5 border-b flex items-center justify-between gap-3"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-[14px] font-extrabold" style={{ color: "#1C1C1C" }}>
            Store Customisation
          </h1>
          {isDirty && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>
              Unsaved changes
            </span>
          )}
          {saved && (
            <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: "#1A7A42" }}>
              <Check className="w-3 h-3" /> Published!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport switcher */}
          <div className="flex items-center border rounded-[8px] overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
            {([
              { id: "desktop", icon: Monitor },
              { id: "tablet",  icon: Tablet },
              { id: "mobile",  icon: Smartphone },
            ] as const).map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setViewport(id)}
                className="p-2 transition-colors"
                style={{ background: viewport === id ? "#F0FAF3" : "#fff", color: viewport === id ? "#1A7A42" : "#94a3b8" }}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {storefrontUrl && (
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 h-8 px-3 rounded-[7px] border text-[12px] font-semibold transition-colors"
              style={{ borderColor: "#e2e8f0", color: "#374151", background: "#fff" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <ExternalLink className="w-3.5 h-3.5" /> View live
            </a>
          )}

          {isDirty && (
            <button
              type="button"
              onClick={handleDiscard}
              className="flex items-center gap-1.5 h-8 px-3 rounded-[7px] border text-[12px] font-semibold transition-colors"
              style={{ borderColor: "#e2e8f0", color: "#6b7280", background: "#fff" }}
            >
              <Undo2 className="w-3.5 h-3.5" /> Discard
            </button>
          )}

          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving || !isDirty}
            className="flex items-center gap-1.5 h-8 px-4 rounded-[7px] text-[12px] font-bold text-white transition-colors disabled:opacity-50"
            style={{ background: "#1A7A42" }}
            onMouseOver={(e) => { if (!isSaving && isDirty) e.currentTarget.style.background = "#239452"; }}
            onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isSaving ? "Publishing…" : isDirty ? "Publish" : "Published"}
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left sidebar ─────────────────────────────────── */}
        <div
          className="w-[280px] shrink-0 flex flex-col border-r overflow-hidden"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          {/* Tab bar */}
          <div className="flex border-b shrink-0" style={{ borderColor: "#e2e8f0" }}>
            {(["sections", "design"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 text-[12px] font-bold capitalize transition-colors"
                style={{
                  color: activeTab === tab ? "#1A7A42" : "#94a3b8",
                  borderBottom: activeTab === tab ? "2px solid #1A7A42" : "2px solid transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* ── SECTIONS tab ─────────────────────────────── */}
            {activeTab === "sections" && (
              <div>
                {/* Header row (always-on) */}
                <div className="px-4 py-3 border-b" style={{ borderColor: "#f1f5f9" }}>
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: "#94a3b8" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold" style={{ color: "#1C1C1C" }}>Header</p>
                      <p className="text-[10px] truncate" style={{ color: "#94a3b8" }}>{store?.name ?? "Your store name"}</p>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#f1f5f9", color: "#94a3b8" }}>ALWAYS ON</span>
                  </div>
                </div>

                {/* Toggleable sections */}
                {SECTION_DEFS.map((def) => {
                  const sec = draft.sections[def.key] as { enabled?: boolean };
                  const isOn = !def.toggleable || (sec.enabled ?? false);
                  const isExpanded = expandedSection === def.key;

                  return (
                    <div key={def.key} className="border-b" style={{ borderColor: "#f1f5f9" }}>
                      <button
                        type="button"
                        onClick={() => setExpandedSection(isExpanded ? null : def.key)}
                        className="w-full flex items-center gap-2.5 px-4 py-3 transition-colors hover:bg-[#fafafa] text-left"
                      >
                        <def.icon className="w-3.5 h-3.5 shrink-0" style={{ color: isOn ? "#1A7A42" : "#94a3b8" }} />
                        <span className="flex-1 text-[12px] font-bold" style={{ color: isOn ? "#1C1C1C" : "#94a3b8" }}>
                          {def.label}
                        </span>
                        {def.toggleable && (
                          <Toggle on={isOn} onChange={() => toggleSection(def.key)} />
                        )}
                        <ChevronDown
                          className="w-3.5 h-3.5 shrink-0 transition-transform"
                          style={{ color: "#94a3b8", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4" style={{ background: "#fafafa" }}>
                          {def.key === "announcement" && (
                            <AnnouncementPanel
                              s={draft.sections.announcement}
                              set={(v) => setSection("announcement", v)}
                            />
                          )}
                          {def.key === "hero" && (
                            <HeroPanel
                              s={draft.sections.hero}
                              set={(v) => setSection("hero", v)}
                            />
                          )}
                          {def.key === "collections" && (
                            <CollectionsPanel
                              s={draft.sections.collections}
                              set={(v) => setSection("collections", v)}
                            />
                          )}
                          {def.key === "featured" && (
                            <FeaturedPanel
                              s={draft.sections.featured}
                              set={(v) => setSection("featured", v)}
                            />
                          )}
                          {def.key === "ctaBand" && (
                            <CtaBandPanel
                              s={draft.sections.ctaBand}
                              set={(v) => setSection("ctaBand", v)}
                            />
                          )}
                          {def.key === "footer" && (
                            <FooterPanel
                              s={draft.sections.footer}
                              set={(v) => setSection("footer", v)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── DESIGN tab ───────────────────────────────── */}
            {activeTab === "design" && (
              <div className="p-4 space-y-6">

                {/* Template selection */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-3" style={{ color: "#94a3b8" }}>Template</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["eko", "lagos"] as TemplateId[]).map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTemplate(id)}
                        className="relative rounded-[10px] border-2 overflow-hidden transition-all"
                        style={{
                          borderColor: draft.template === id ? "#1A7A42" : "#e2e8f0",
                          boxShadow: draft.template === id ? "0 0 0 1px #1A7A42" : "none",
                        }}
                      >
                        <div className="aspect-[7/5] w-full">
                          {id === "eko"
                            ? <EkoThumb colors={thumbColors.eko} />
                            : <LagosThumb colors={thumbColors.lagos} />
                          }
                        </div>
                        <div
                          className="flex items-center justify-between px-2 py-1.5"
                          style={{ background: draft.template === id ? "#F0FAF3" : "#f8fafc" }}
                        >
                          <span className="text-[11px] font-bold capitalize" style={{ color: draft.template === id ? "#1A7A42" : "#374151" }}>
                            {id}
                          </span>
                          {draft.template === id && <Check className="w-3 h-3" style={{ color: "#1A7A42" }} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colour presets */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-3" style={{ color: "#94a3b8" }}>Colours</p>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setColors(preset)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-[8px] border transition-all text-left"
                        style={{
                          borderColor: draft.colors.primary === preset.primary ? "#1A7A42" : "#e2e8f0",
                          background: draft.colors.primary === preset.primary ? "#F0FAF3" : "#f8fafc",
                        }}
                      >
                        <div className="flex gap-0.5 shrink-0">
                          <div className="w-3 h-5 rounded-l-sm" style={{ background: preset.primary }} />
                          <div className="w-3 h-5 rounded-r-sm" style={{ background: preset.bg }} />
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: "#374151" }}>{preset.label}</span>
                        {draft.colors.primary === preset.primary && (
                          <Check className="w-3 h-3 ml-auto shrink-0" style={{ color: "#1A7A42" }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font selection */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-3" style={{ color: "#94a3b8" }}>Typography</p>
                  <div className="space-y-1.5">
                    {FONT_PRESETS.map((fp) => (
                      <button
                        key={fp.value}
                        type="button"
                        onClick={() => setFont(fp.value)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-[8px] border transition-all text-left"
                        style={{
                          borderColor: draft.font === fp.value ? "#1A7A42" : "#e2e8f0",
                          background: draft.font === fp.value ? "#F0FAF3" : "#f8fafc",
                        }}
                      >
                        <span
                          className="text-[14px]"
                          style={{ fontFamily: FONT_FAMILIES[fp.value], color: "#1C1C1C" }}
                        >
                          {fp.sample} {fp.label}
                        </span>
                        {draft.font === fp.value && <Check className="w-3 h-3 shrink-0" style={{ color: "#1A7A42" }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Preview pane ─────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto py-4 px-4"
          style={{ background: "#f1f5f9" }}
        >
          {/* Browser-frame chrome */}
          <div
            className="mx-auto rounded-[12px] shadow-xl overflow-clip transition-all duration-300 border"
            style={{
              width: viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px",
              maxWidth: "100%",
              borderColor: "#e2e8f0",
            }}
          >
            {/* Fake browser top bar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ef4444" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#f59e0b" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#22c55e" }} />
              </div>
              <div className="flex-1 mx-3 px-3 py-1 rounded-[5px] text-[10px] font-mono truncate" style={{ background: "#fff", border: "1px solid #e2e8f0", color: "#94a3b8" }}>
                {store ? `${store.slug}.${STORE_DOMAIN}` : "your-store.gomarketi.com"}
              </div>
            </div>

            {/* Storefront content */}
            <div style={{ background: "#fff" }}>
              <LivePreview
                template={draft.template}
                colors={draft.colors}
                font={draft.font}
                storeName={store?.name ?? "Your Store"}
                headline={draft.sections.hero.enabled ? draft.sections.hero.headline : ""}
                subheadline={draft.sections.hero.enabled ? draft.sections.hero.subheadline : ""}
                viewport={viewport}
                config={draft}
              />
            </div>
          </div>

          <p className="mt-3 text-center text-[11px]" style={{ color: "#94a3b8" }}>
            Preview — click <strong>Publish</strong> to push changes live
          </p>
        </div>
      </div>
    </div>
  );
}
