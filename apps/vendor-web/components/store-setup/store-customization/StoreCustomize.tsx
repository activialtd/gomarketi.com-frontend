"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Check, ExternalLink, Loader2, Monitor, Smartphone, Tablet,
  ChevronDown, Eye, Palette, Type, Globe, Image as ImageIcon,
  AlignLeft, Megaphone, Package, Phone, Save, Undo2, Plus, Trash2,
  GripVertical, Layout, Link2, Search, Layers, Mail, MapPin,
  AtSign, Youtube, Music2, Facebook, Share2, Settings, Hash,
} from "lucide-react";
import {
  LivePreview, COLOR_PRESETS, FONT_PRESETS, FONT_FAMILIES,
  TemplateId, ColorPreset, EkoThumb, LagosThumb, AbujaThumb,
} from "./helpers";
import { storefrontApi } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavMenuItem {
  id: string;
  label: string;
  url: string;
  type: "custom" | "category" | "page";
  openInNew?: boolean;
}

export interface ThemeConfig {
  template: TemplateId;
  colors: { primary: string; secondary: string; bg: string; text: string; };
  font: string;
  sections: {
    announcement: {
      enabled: boolean; text: string; bgColor: string;
      textColor: string; dismissible: boolean; link?: string;
    };
    header: {
      logoUrl?: string; sticky: boolean;
      showSearch: boolean; showStoreName: boolean; transparentOnHero: boolean;
    };
    nav: { items: NavMenuItem[]; };
    hero: {
      enabled: boolean;
      layout: "split" | "centered" | "full-bleed";
      eyebrow?: string; headline: string; subheadline: string;
      ctaText: string; secondaryCtaText?: string; imageUrl?: string;
      overlayOpacity: number;
    };
    collections: { enabled: boolean; title: string; subtitle?: string; columns: 2 | 3 | 4; };
    featured: {
      enabled: boolean; title: string; subtitle?: string;
      count: number; layout: "grid" | "carousel";
    };
    newsletter: { enabled: boolean; headline: string; subtext: string; placeholder: string; };
    ctaBand: { enabled: boolean; headline: string; text: string; btnText: string; };
    footer: {
      tagline?: string; showPoweredBy: boolean; copyright?: string;
      showAbout: boolean; showLinks: boolean; showContact: boolean;
      customLinks: Array<{ id: string; label: string; url: string }>;
      contact: { email?: string; phone?: string; whatsapp?: string; address?: string; };
      social: { instagram?: string; twitter?: string; facebook?: string; tiktok?: string; youtube?: string; };
      newsletter: boolean;
    };
  };
  seo: { metaTitle?: string; metaDescription?: string; };
}

const DEFAULT_CONFIG: ThemeConfig = {
  template: "eko",
  colors: COLOR_PRESETS[0],
  font: "plus-jakarta",
  sections: {
    announcement: { enabled: false, text: "🎉 Free delivery on orders above ₦20,000", bgColor: "#1A7A42", textColor: "#ffffff", dismissible: true },
    header: { sticky: true, showSearch: true, showStoreName: true, transparentOnHero: false },
    nav: { items: [
      { id: "1", label: "Shop", url: "/shop", type: "custom" },
      { id: "2", label: "Collections", url: "/collections", type: "custom" },
    ]},
    hero: { enabled: false, layout: "split", headline: "Welcome to our store", subheadline: "Discover amazing products.", ctaText: "Shop now", overlayOpacity: 0.4 },
    collections: { enabled: false, title: "Shop by collection", columns: 3 },
    featured: { enabled: false, title: "Featured products", count: 6, layout: "grid" },
    newsletter: { enabled: false, headline: "Stay in the loop", subtext: "Get updates on new arrivals and exclusive deals.", placeholder: "Enter your email" },
    ctaBand: { enabled: false, headline: "Have a question?", text: "Message us on WhatsApp — we reply fast.", btnText: "Chat on WhatsApp" },
    footer: {
      showPoweredBy: true, showAbout: true, showLinks: true, showContact: false, newsletter: false,
      customLinks: [{ id: "1", label: "Shop", url: "/shop" }, { id: "2", label: "Collections", url: "/collections" }],
      contact: {}, social: {},
    },
  },
  seo: {},
};

// ─── Small primitives ─────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onChange(); }}
      className="shrink-0 relative inline-flex h-5 w-9 rounded-full transition-colors duration-200"
      style={{ background: on ? "#1A7A42" : "#cbd5e1" }} role="switch" aria-checked={on}
    >
      <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5"
        style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }} />
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-bold uppercase tracking-[0.1em] mb-1" style={{ color: "#94a3b8" }}>{children}</label>;
}

function TextInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-2.5 py-2 rounded-[7px] border text-[12px] outline-none focus:border-[#1A7A42] transition-colors"
      style={{ borderColor: "#e2e8f0", color: "#1C1C1C", background: "#f8fafc" }} />
  );
}

function Textarea({ value, onChange, placeholder, rows = 2 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full px-2.5 py-2 rounded-[7px] border text-[12px] outline-none focus:border-[#1A7A42] resize-none transition-colors"
      style={{ borderColor: "#e2e8f0", color: "#1C1C1C", background: "#f8fafc" }} />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><FieldLabel>{label}</FieldLabel>{children}</div>;
}

function SwitchRow({ label, sub, on, onChange }: { label: string; sub?: string; on: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div><p className="text-[12px] font-semibold" style={{ color: "#374151" }}>{label}</p>
        {sub && <p className="text-[10px]" style={{ color: "#94a3b8" }}>{sub}</p>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <p className="text-[12px] font-semibold" style={{ color: "#374151" }}>{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full border border-gray-200" style={{ background: value }} />
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border-0 p-0" />
      </div>
    </div>
  );
}

// ─── Panel components ─────────────────────────────────────────────────────────

function AnnouncementPanel({ s, set }: { s: ThemeConfig["sections"]["announcement"]; set: (v: Partial<ThemeConfig["sections"]["announcement"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <Field label="Message text">
        <TextInput value={s.text} onChange={(v) => set({ text: v })} placeholder="🎉 Free delivery on orders above ₦20,000" />
      </Field>
      <Field label="Link URL (optional)">
        <TextInput value={s.link ?? ""} onChange={(v) => set({ link: v || undefined })} placeholder="https://... or /shop" />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <ColorRow label="Background" value={s.bgColor} onChange={(v) => set({ bgColor: v })} />
        <ColorRow label="Text" value={s.textColor} onChange={(v) => set({ textColor: v })} />
      </div>
      <SwitchRow label="Dismissible" sub="Show × to close" on={s.dismissible} onChange={() => set({ dismissible: !s.dismissible })} />
    </div>
  );
}

function HeaderPanel({ s, set }: { s: ThemeConfig["sections"]["header"]; set: (v: Partial<ThemeConfig["sections"]["header"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <Field label="Logo image URL">
        <TextInput value={s.logoUrl ?? ""} onChange={(v) => set({ logoUrl: v || undefined })} placeholder="https://…/logo.png" />
      </Field>
      <div className="space-y-1">
        <SwitchRow label="Sticky header" sub="Stays at top when scrolling" on={s.sticky} onChange={() => set({ sticky: !s.sticky })} />
        <SwitchRow label="Show store name" sub="Text logo next to/instead of image" on={s.showStoreName} onChange={() => set({ showStoreName: !s.showStoreName })} />
        <SwitchRow label="Show search icon" on={s.showSearch} onChange={() => set({ showSearch: !s.showSearch })} />
        <SwitchRow label="Transparent over hero" sub="Header blends into hero on homepage" on={s.transparentOnHero} onChange={() => set({ transparentOnHero: !s.transparentOnHero })} />
      </div>
    </div>
  );
}

function NavBuilder({ items, onChange }: { items: NavMenuItem[]; onChange: (items: NavMenuItem[]) => void }) {
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState<NavMenuItem["type"]>("custom");

  function addItem() {
    if (!newLabel.trim()) return;
    const item: NavMenuItem = {
      id: Date.now().toString(),
      label: newLabel.trim(),
      url: newUrl.trim() || `/${newLabel.trim().toLowerCase().replace(/\s+/g, "-")}`,
      type: newType,
    };
    onChange([...items, item]);
    setNewLabel(""); setNewUrl("");
  }

  function removeItem(id: string) { onChange(items.filter((i) => i.id !== id)); }

  function move(id: string, dir: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    if (idx + dir < 0 || idx + dir >= items.length) return;
    const next = [...items];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    onChange(next);
  }

  const CATEGORY_LINKS = [
    { label: "Shop all", url: "/shop" },
    { label: "New arrivals", url: "/shop?sort=newest" },
    { label: "Collections", url: "/collections" },
    { label: "Sale", url: "/shop?sale=true" },
  ];

  return (
    <div className="space-y-3 pt-1">
      {/* Current items */}
      <div className="space-y-1">
        {items.length === 0 && <p className="text-[11px] text-center py-3" style={{ color: "#94a3b8" }}>No menu items yet</p>}
        {items.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-2 px-2 py-1.5 rounded-[7px] border group" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
            <GripVertical className="w-3.5 h-3.5 shrink-0" style={{ color: "#cbd5e1" }} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate" style={{ color: "#1C1C1C" }}>{item.label}</p>
              <p className="text-[10px] truncate" style={{ color: "#94a3b8" }}>{item.url}</p>
            </div>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={() => move(item.id, -1)} disabled={idx === 0}
                className="p-1 rounded text-[10px] font-bold disabled:opacity-30" style={{ color: "#6b7280" }}>↑</button>
              <button type="button" onClick={() => move(item.id, 1)} disabled={idx === items.length - 1}
                className="p-1 rounded text-[10px] font-bold disabled:opacity-30" style={{ color: "#6b7280" }}>↓</button>
              <button type="button" onClick={() => removeItem(item.id)} className="p-1 rounded" style={{ color: "#ef4444" }}>
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick-add category links */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1.5" style={{ color: "#94a3b8" }}>Quick add</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_LINKS.map((l) => (
            <button key={l.url} type="button"
              onClick={() => { if (!items.find(i => i.url === l.url)) onChange([...items, { id: Date.now().toString(), label: l.label, url: l.url, type: "category" }]); }}
              className="px-2 py-1 text-[10px] font-semibold rounded-[5px] border transition-colors"
              style={{ borderColor: "#e2e8f0", color: "#374151", background: items.find(i => i.url === l.url) ? "#F0FAF3" : "#f8fafc" }}
            >
              + {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom link */}
      <div className="border rounded-[8px] p-2.5 space-y-2" style={{ borderColor: "#e2e8f0" }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "#94a3b8" }}>Add custom link</p>
        <div className="grid grid-cols-2 gap-2">
          <TextInput value={newLabel} onChange={setNewLabel} placeholder="Label" />
          <TextInput value={newUrl} onChange={setNewUrl} placeholder="/page or https://…" />
        </div>
        <button type="button" onClick={addItem} disabled={!newLabel.trim()}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-[11px] font-bold text-white disabled:opacity-40"
          style={{ background: "#1A7A42" }}
        >
          <Plus className="w-3 h-3" /> Add to menu
        </button>
      </div>
    </div>
  );
}

function HeroPanel({ s, set }: { s: ThemeConfig["sections"]["hero"]; set: (v: Partial<ThemeConfig["sections"]["hero"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <Field label="Layout">
        <div className="grid grid-cols-3 gap-1.5">
          {(["split", "centered", "full-bleed"] as const).map((l) => (
            <button key={l} type="button" onClick={() => set({ layout: l })}
              className="py-1.5 rounded-[6px] border text-[10px] font-bold capitalize transition-all"
              style={{ borderColor: s.layout === l ? "#1A7A42" : "#e2e8f0", background: s.layout === l ? "#F0FAF3" : "#fff", color: s.layout === l ? "#1A7A42" : "#6b7280" }}
            >{l}</button>
          ))}
        </div>
      </Field>
      <Field label="Eyebrow text (optional)">
        <TextInput value={s.eyebrow ?? ""} onChange={(v) => set({ eyebrow: v || undefined })} placeholder="New collection" />
      </Field>
      <Field label="Headline">
        <TextInput value={s.headline} onChange={(v) => set({ headline: v })} placeholder="Welcome to our store" />
      </Field>
      <Field label="Subheadline">
        <Textarea value={s.subheadline} onChange={(v) => set({ subheadline: v })} placeholder="A short description…" />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Primary CTA">
          <TextInput value={s.ctaText} onChange={(v) => set({ ctaText: v })} placeholder="Shop now" />
        </Field>
        <Field label="Secondary CTA">
          <TextInput value={s.secondaryCtaText ?? ""} onChange={(v) => set({ secondaryCtaText: v || undefined })} placeholder="Learn more" />
        </Field>
      </div>
      <Field label="Hero image URL">
        <TextInput value={s.imageUrl ?? ""} onChange={(v) => set({ imageUrl: v || undefined })} placeholder="https://…/banner.jpg" />
      </Field>
      {s.layout === "full-bleed" && (
        <Field label={`Overlay opacity: ${Math.round(s.overlayOpacity * 100)}%`}>
          <input type="range" min={0} max={100} value={Math.round(s.overlayOpacity * 100)}
            onChange={(e) => set({ overlayOpacity: Number(e.target.value) / 100 })}
            className="w-full h-1.5 rounded-full accent-[#1A7A42]" />
        </Field>
      )}
    </div>
  );
}

function CollectionsPanel({ s, set }: { s: ThemeConfig["sections"]["collections"]; set: (v: Partial<ThemeConfig["sections"]["collections"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <Field label="Section title"><TextInput value={s.title} onChange={(v) => set({ title: v })} placeholder="Shop by collection" /></Field>
      <Field label="Subtitle (optional)"><TextInput value={s.subtitle ?? ""} onChange={(v) => set({ subtitle: v || undefined })} /></Field>
      <Field label="Columns">
        <div className="flex gap-2">
          {([2, 3, 4] as const).map((n) => (
            <button key={n} type="button" onClick={() => set({ columns: n })}
              className="flex-1 py-1.5 rounded-[6px] border text-[12px] font-bold transition-all"
              style={{ borderColor: s.columns === n ? "#1A7A42" : "#e2e8f0", background: s.columns === n ? "#F0FAF3" : "#fff", color: s.columns === n ? "#1A7A42" : "#6b7280" }}
            >{n}</button>
          ))}
        </div>
      </Field>
      <p className="text-[10px]" style={{ color: "#94a3b8" }}>Collections appear once you create them in your catalogue.</p>
    </div>
  );
}

function FeaturedPanel({ s, set }: { s: ThemeConfig["sections"]["featured"]; set: (v: Partial<ThemeConfig["sections"]["featured"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <Field label="Section title"><TextInput value={s.title} onChange={(v) => set({ title: v })} placeholder="Featured products" /></Field>
      <Field label="Subtitle (optional)"><TextInput value={s.subtitle ?? ""} onChange={(v) => set({ subtitle: v || undefined })} /></Field>
      <Field label="Products to show">
        <div className="flex gap-2">
          {[3, 4, 6, 8].map((n) => (
            <button key={n} type="button" onClick={() => set({ count: n })}
              className="flex-1 py-1.5 rounded-[6px] border text-[12px] font-bold transition-all"
              style={{ borderColor: s.count === n ? "#1A7A42" : "#e2e8f0", background: s.count === n ? "#F0FAF3" : "#fff", color: s.count === n ? "#1A7A42" : "#6b7280" }}
            >{n}</button>
          ))}
        </div>
      </Field>
      <Field label="Display layout">
        <div className="grid grid-cols-2 gap-2">
          {(["grid", "carousel"] as const).map((l) => (
            <button key={l} type="button" onClick={() => set({ layout: l })}
              className="py-1.5 rounded-[6px] border text-[11px] font-bold capitalize transition-all"
              style={{ borderColor: s.layout === l ? "#1A7A42" : "#e2e8f0", background: s.layout === l ? "#F0FAF3" : "#fff", color: s.layout === l ? "#1A7A42" : "#6b7280" }}
            >{l}</button>
          ))}
        </div>
      </Field>
      <p className="text-[10px]" style={{ color: "#94a3b8" }}>Products appear once you add them to your catalogue.</p>
    </div>
  );
}

function NewsletterPanel({ s, set }: { s: ThemeConfig["sections"]["newsletter"]; set: (v: Partial<ThemeConfig["sections"]["newsletter"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <Field label="Headline"><TextInput value={s.headline} onChange={(v) => set({ headline: v })} placeholder="Stay in the loop" /></Field>
      <Field label="Subtext"><Textarea value={s.subtext} onChange={(v) => set({ subtext: v })} placeholder="Get updates on new arrivals…" /></Field>
      <Field label="Input placeholder"><TextInput value={s.placeholder} onChange={(v) => set({ placeholder: v })} placeholder="Enter your email" /></Field>
    </div>
  );
}

function CtaBandPanel({ s, set }: { s: ThemeConfig["sections"]["ctaBand"]; set: (v: Partial<ThemeConfig["sections"]["ctaBand"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <Field label="Headline"><TextInput value={s.headline} onChange={(v) => set({ headline: v })} placeholder="Have a question?" /></Field>
      <Field label="Body text"><TextInput value={s.text} onChange={(v) => set({ text: v })} placeholder="Message us on WhatsApp — we reply fast." /></Field>
      <Field label="Button label"><TextInput value={s.btnText} onChange={(v) => set({ btnText: v })} placeholder="Chat on WhatsApp" /></Field>
    </div>
  );
}

function FooterPanel({ s, storeName, set }: { s: ThemeConfig["sections"]["footer"]; storeName: string; set: (v: Partial<ThemeConfig["sections"]["footer"]>) => void }) {
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  function addLink() {
    if (!newLinkLabel.trim()) return;
    const link = { id: Date.now().toString(), label: newLinkLabel.trim(), url: newLinkUrl.trim() || "#" };
    set({ customLinks: [...s.customLinks, link] });
    setNewLinkLabel(""); setNewLinkUrl("");
  }

  function removeLink(id: string) { set({ customLinks: s.customLinks.filter((l) => l.id !== id) }); }

  return (
    <div className="space-y-4 pt-1">
      {/* Brand */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "#94a3b8" }}>Brand</p>
        <Field label="Tagline"><Textarea value={s.tagline ?? ""} onChange={(v) => set({ tagline: v || undefined })} placeholder="Quality products, fast delivery" rows={2} /></Field>
        <Field label="Copyright text"><TextInput value={s.copyright ?? ""} onChange={(v) => set({ copyright: v || undefined })} placeholder={`© 2025 ${storeName}`} /></Field>
        <SwitchRow label="Show 'Powered by GoMarketi'" on={s.showPoweredBy} onChange={() => set({ showPoweredBy: !s.showPoweredBy })} />
      </div>

      {/* Columns */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "#94a3b8" }}>Columns to show</p>
        <SwitchRow label="About / brand column" on={s.showAbout} onChange={() => set({ showAbout: !s.showAbout })} />
        <SwitchRow label="Quick links column" on={s.showLinks} onChange={() => set({ showLinks: !s.showLinks })} />
        <SwitchRow label="Contact column" on={s.showContact} onChange={() => set({ showContact: !s.showContact })} />
        <SwitchRow label="Newsletter signup" on={s.newsletter} onChange={() => set({ newsletter: !s.newsletter })} />
      </div>

      {/* Custom links */}
      {s.showLinks && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "#94a3b8" }}>Quick links</p>
          <div className="space-y-1">
            {s.customLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] border" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
                <p className="flex-1 text-[11px] font-semibold truncate" style={{ color: "#374151" }}>{link.label}</p>
                <p className="text-[10px] truncate max-w-[80px]" style={{ color: "#94a3b8" }}>{link.url}</p>
                <button type="button" onClick={() => removeLink(link.id)}><Trash2 className="w-3 h-3" style={{ color: "#ef4444" }} /></button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <TextInput value={newLinkLabel} onChange={setNewLinkLabel} placeholder="Label" />
            <TextInput value={newLinkUrl} onChange={setNewLinkUrl} placeholder="/page" />
          </div>
          <button type="button" onClick={addLink} disabled={!newLinkLabel.trim()}
            className="w-full py-1.5 rounded-[6px] border text-[11px] font-bold transition-colors disabled:opacity-40"
            style={{ borderColor: "#1A7A42", color: "#1A7A42", background: "#F0FAF3" }}
          >+ Add link</button>
        </div>
      )}

      {/* Contact */}
      {s.showContact && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "#94a3b8" }}>Contact info</p>
          <Field label="WhatsApp number"><TextInput value={s.contact.whatsapp ?? ""} onChange={(v) => set({ contact: { ...s.contact, whatsapp: v || undefined } })} placeholder="+2348012345678" /></Field>
          <Field label="Email address"><TextInput value={s.contact.email ?? ""} onChange={(v) => set({ contact: { ...s.contact, email: v || undefined } })} type="email" placeholder="hello@store.com" /></Field>
          <Field label="Phone number"><TextInput value={s.contact.phone ?? ""} onChange={(v) => set({ contact: { ...s.contact, phone: v || undefined } })} type="tel" placeholder="+234…" /></Field>
          <Field label="Physical address"><Textarea value={s.contact.address ?? ""} onChange={(v) => set({ contact: { ...s.contact, address: v || undefined } })} placeholder="14 Example Street, Lagos" rows={2} /></Field>
        </div>
      )}

      {/* Social */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "#94a3b8" }}>Social media</p>
        {[
          { key: "instagram", placeholder: "@yourstorename", label: "Instagram" },
          { key: "twitter", placeholder: "@yourstorename", label: "Twitter / X" },
          { key: "facebook", placeholder: "yourstorename", label: "Facebook" },
          { key: "tiktok", placeholder: "@yourstorename", label: "TikTok" },
          { key: "youtube", placeholder: "channel URL", label: "YouTube" },
        ].map(({ key, placeholder, label }) => (
          <Field key={key} label={label}>
            <TextInput
              value={(s.social as Record<string, string | undefined>)[key] ?? ""}
              onChange={(v) => set({ social: { ...s.social, [key]: v || undefined } })}
              placeholder={placeholder}
            />
          </Field>
        ))}
      </div>
    </div>
  );
}

function SeoPanel({ seo, set }: { seo: ThemeConfig["seo"]; set: (v: Partial<ThemeConfig["seo"]>) => void }) {
  return (
    <div className="space-y-3 pt-1">
      <p className="text-[11px] leading-relaxed" style={{ color: "#94a3b8" }}>Controls how your store appears in Google search results and social media previews.</p>
      <Field label="Page title"><TextInput value={seo.metaTitle ?? ""} onChange={(v) => set({ metaTitle: v || undefined })} placeholder="My Store — Great Products" /></Field>
      <Field label="Meta description">
        <Textarea value={seo.metaDescription ?? ""} onChange={(v) => set({ metaDescription: v || undefined })} placeholder="Short description of your store shown in search results…" rows={3} />
        <p className="text-[10px] mt-1" style={{ color: seo.metaDescription && seo.metaDescription.length > 160 ? "#ef4444" : "#94a3b8" }}>
          {seo.metaDescription?.length ?? 0}/160 characters
        </p>
      </Field>
    </div>
  );
}

// ─── Section definitions ──────────────────────────────────────────────────────

type SectionKey = keyof ThemeConfig["sections"];

interface SectionDef {
  key: SectionKey;
  label: string;
  icon: React.ElementType;
  toggleable: boolean;
  alwaysExpanded?: boolean;
}

const SECTION_DEFS: SectionDef[] = [
  { key: "announcement", label: "Announcement bar", icon: Megaphone, toggleable: true },
  { key: "header",       label: "Header",           icon: Layout,    toggleable: false },
  { key: "nav",          label: "Navigation menu",  icon: Link2,     toggleable: false },
  { key: "hero",         label: "Hero section",     icon: ImageIcon, toggleable: true },
  { key: "collections",  label: "Collections",      icon: Layers,    toggleable: true },
  { key: "featured",     label: "Featured products",icon: Package,   toggleable: true },
  { key: "newsletter",   label: "Newsletter",       icon: Mail,      toggleable: true },
  { key: "ctaBand",      label: "WhatsApp CTA",     icon: Phone,     toggleable: true },
  { key: "footer",       label: "Footer",           icon: AlignLeft, toggleable: false },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function StoreCustomize() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN ?? "gomarketi.com";

  const [store, setStore] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [draft, setDraft] = useState<ThemeConfig>(DEFAULT_CONFIG);
  const [published, setPublished] = useState<ThemeConfig | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"sections" | "design" | "seo">("sections");
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>("hero");

  useEffect(() => {
    if (!accessToken) return;
    storefrontApi.getMyStore(accessToken).then((s) => {
      setStore({ id: s.id, name: s.name, slug: s.slug });
      setStoreLoading(false);
      if (s.theme_config) {
        try {
          const cfg = JSON.parse(s.theme_config) as ThemeConfig;
          // Merge with defaults so new fields are populated
          const merged: ThemeConfig = {
            ...DEFAULT_CONFIG,
            ...cfg,
            sections: { ...DEFAULT_CONFIG.sections, ...cfg.sections,
              footer: { ...DEFAULT_CONFIG.sections.footer, ...cfg.sections?.footer,
                contact: { ...DEFAULT_CONFIG.sections.footer.contact, ...cfg.sections?.footer?.contact },
                social: { ...DEFAULT_CONFIG.sections.footer.social, ...cfg.sections?.footer?.social },
                customLinks: cfg.sections?.footer?.customLinks ?? DEFAULT_CONFIG.sections.footer.customLinks,
              },
              nav: { items: cfg.sections?.nav?.items ?? DEFAULT_CONFIG.sections.nav.items },
            },
            seo: { ...DEFAULT_CONFIG.seo, ...cfg.seo },
          };
          setDraft(merged);
          setPublished(merged);
        } catch { /* use defaults */ }
      }
    }).catch(() => { setStoreLoading(false); });
  }, [accessToken]);

  // setIsDirty must be called outside the setDraft functional updater —
  // calling state setters inside another state setter's updater is a React anti-pattern
  // that Strict Mode intentionally suppresses on the second invocation.
  const updateDraft = useCallback((updater: (prev: ThemeConfig) => ThemeConfig) => {
    setDraft((prev) => updater(prev));
    setIsDirty(true);
  }, []);

  function setSection<K extends SectionKey>(key: K, value: Partial<ThemeConfig["sections"][K]>) {
    updateDraft((p) => ({ ...p, sections: { ...p.sections, [key]: { ...p.sections[key], ...value } } }));
  }

  function toggleSection(key: SectionKey) {
    const sec = draft.sections[key] as { enabled?: boolean };
    setSection(key, { enabled: !sec.enabled } as Partial<ThemeConfig["sections"][typeof key]>);
  }

  async function handlePublish() {
    if (!accessToken) return;
    if (!store) {
      setSaveError("Store not loaded yet — please wait a moment.");
      setTimeout(() => setSaveError(null), 3000);
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    try {
      await storefrontApi.updateStore(store.id, { theme_config: JSON.stringify(draft) }, accessToken);
      setPublished(draft);
      setIsDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to publish";
      setSaveError(msg);
      setTimeout(() => setSaveError(null), 4000);
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    setDraft(published ?? DEFAULT_CONFIG);
    setIsDirty(false);
  }

  const storefrontUrl = store ? `http://${store.slug}.${STORE_DOMAIN}` : null;
  const thumbColors = { bg: draft.colors.bg, primary: draft.colors.primary, card: "#f8fafc" };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 60px)" }}>

      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2.5 border-b flex items-center justify-between gap-3 flex-wrap"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}>
        <div className="flex items-center gap-3">
          <h1 className="text-[14px] font-extrabold" style={{ color: "#1C1C1C" }}>Store Editor</h1>
          {isDirty && !saved && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92400e" }}>
              Unsaved changes
            </span>
          )}
          {saved && <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: "#1A7A42" }}><Check className="w-3 h-3" /> Published!</span>}
          {saveError && <span className="text-[11px] font-bold text-red-500">{saveError}</span>}
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport */}
          <div className="flex items-center border rounded-[7px] overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
            {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([id, Icon]) => (
              <button key={id} type="button" onClick={() => setViewport(id)}
                className="p-1.5 transition-colors"
                style={{ background: viewport === id ? "#F0FAF3" : "#fff", color: viewport === id ? "#1A7A42" : "#94a3b8" }}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {storefrontUrl && (
            <a href={storefrontUrl} target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-[7px] border text-[12px] font-semibold transition-colors"
              style={{ borderColor: "#e2e8f0", color: "#374151", background: "#fff" }}>
              <ExternalLink className="w-3.5 h-3.5" /> View live
            </a>
          )}

          {isDirty && (
            <button type="button" onClick={handleDiscard}
              className="flex items-center gap-1.5 h-8 px-3 rounded-[7px] border text-[12px] font-semibold"
              style={{ borderColor: "#e2e8f0", color: "#6b7280", background: "#fff" }}>
              <Undo2 className="w-3.5 h-3.5" /> Discard
            </button>
          )}

          <button type="button" onClick={handlePublish} disabled={isSaving}
            className="flex items-center gap-1.5 h-8 px-4 rounded-[7px] text-[12px] font-bold text-white transition-colors"
            style={{ background: "#1A7A42", opacity: isSaving ? 0.7 : 1 }}
            onMouseOver={(e) => { if (!isSaving) e.currentTarget.style.background = "#239452"; }}
            onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}>
            {isSaving
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing…</>
              : storeLoading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…</>
                : <><Save className="w-3.5 h-3.5" /> {isDirty ? "Publish changes" : "Publish"}</>
            }
          </button>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left sidebar ──────────────────────────────────── */}
        <div className="w-[280px] shrink-0 flex flex-col border-r" style={{ background: "#fff", borderColor: "#e2e8f0" }}>
          {/* Tabs */}
          <div className="flex border-b shrink-0" style={{ borderColor: "#e2e8f0" }}>
            {(["sections", "design", "seo"] as const).map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                className="flex-1 py-2.5 text-[11px] font-bold capitalize transition-colors"
                style={{ color: activeTab === tab ? "#1A7A42" : "#94a3b8", borderBottom: activeTab === tab ? "2px solid #1A7A42" : "2px solid transparent" }}>
                {tab === "seo" ? "SEO" : tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* ── SECTIONS ────────────────────────────────── */}
            {activeTab === "sections" && (
              <div>
                {SECTION_DEFS.map((def) => {
                  const sec = draft.sections[def.key] as { enabled?: boolean };
                  const isOn = !def.toggleable || (sec.enabled ?? false);
                  const isExpanded = expandedSection === def.key;

                  return (
                    <div key={def.key} className="border-b" style={{ borderColor: "#f1f5f9" }}>
                      <button type="button"
                        onClick={() => setExpandedSection(isExpanded ? null : def.key)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 transition-colors hover:bg-[#fafafa] text-left">
                        <def.icon className="w-3.5 h-3.5 shrink-0" style={{ color: isOn ? "#1A7A42" : "#94a3b8" }} />
                        <span className="flex-1 text-[12px] font-bold" style={{ color: isOn ? "#1C1C1C" : "#94a3b8" }}>
                          {def.label}
                        </span>
                        {def.toggleable && <Toggle on={isOn} onChange={() => toggleSection(def.key)} />}
                        {!def.toggleable && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#f1f5f9", color: "#94a3b8" }}>ON</span>}
                        <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform" style={{ color: "#94a3b8", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }} />
                      </button>

                      {isExpanded && (
                        <div className="px-3 pb-4" style={{ background: "#fafafa" }}>
                          {def.key === "announcement" && <AnnouncementPanel s={draft.sections.announcement} set={(v) => setSection("announcement", v)} />}
                          {def.key === "header" && <HeaderPanel s={draft.sections.header} set={(v) => setSection("header", v)} />}
                          {def.key === "nav" && <NavBuilder items={draft.sections.nav.items} onChange={(items) => setSection("nav", { items })} />}
                          {def.key === "hero" && <HeroPanel s={draft.sections.hero} set={(v) => setSection("hero", v)} />}
                          {def.key === "collections" && <CollectionsPanel s={draft.sections.collections} set={(v) => setSection("collections", v)} />}
                          {def.key === "featured" && <FeaturedPanel s={draft.sections.featured} set={(v) => setSection("featured", v)} />}
                          {def.key === "newsletter" && <NewsletterPanel s={draft.sections.newsletter} set={(v) => setSection("newsletter", v)} />}
                          {def.key === "ctaBand" && <CtaBandPanel s={draft.sections.ctaBand} set={(v) => setSection("ctaBand", v)} />}
                          {def.key === "footer" && <FooterPanel s={draft.sections.footer} storeName={store?.name ?? "Your Store"} set={(v) => setSection("footer", v)} />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── DESIGN ──────────────────────────────────── */}
            {activeTab === "design" && (
              <div className="p-3 space-y-5">
                {/* Templates */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2.5" style={{ color: "#94a3b8" }}>Template</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: "eko",   label: "Eko",   Thumb: EkoThumb,   soon: false },
                      { id: "lagos", label: "Lagos", Thumb: LagosThumb, soon: false },
                      { id: "abuja", label: "Abuja", Thumb: AbujaThumb, soon: true  },
                    ] as const).map(({ id, label, Thumb, soon }) => (
                      <button key={id} type="button"
                        onClick={() => { if (!soon) updateDraft((p) => ({ ...p, template: id })); }}
                        className="rounded-[8px] border-2 overflow-hidden transition-all relative"
                        style={{ borderColor: draft.template === id ? "#1A7A42" : "#e2e8f0", opacity: soon ? 0.55 : 1, cursor: soon ? "not-allowed" : "pointer" }}>
                        <div className="aspect-[7/5]"><Thumb colors={thumbColors} /></div>
                        <div className="flex items-center justify-between px-1.5 py-1" style={{ background: draft.template === id ? "#F0FAF3" : "#f8fafc" }}>
                          <span className="text-[10px] font-bold" style={{ color: draft.template === id ? "#1A7A42" : "#374151" }}>{label}</span>
                          {soon
                            ? <span className="text-[8px] font-bold px-1 rounded" style={{ background: "#f1f5f9", color: "#94a3b8" }}>SOON</span>
                            : draft.template === id && <Check className="w-3 h-3" style={{ color: "#1A7A42" }} />
                          }
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colours */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2.5" style={{ color: "#94a3b8" }}>Brand colours</p>
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {COLOR_PRESETS.map((preset) => (
                      <button key={preset.label} type="button" onClick={() => updateDraft((p) => ({ ...p, colors: preset }))}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-[7px] border transition-all text-left"
                        style={{ borderColor: draft.colors.primary === preset.primary ? "#1A7A42" : "#e2e8f0", background: draft.colors.primary === preset.primary ? "#F0FAF3" : "#f8fafc" }}>
                        <div className="flex gap-0.5 shrink-0">
                          <div className="w-3 h-5 rounded-l-sm" style={{ background: preset.primary }} />
                          <div className="w-3 h-5 rounded-r-sm" style={{ background: preset.bg }} />
                        </div>
                        <span className="text-[10px] font-semibold flex-1" style={{ color: "#374151" }}>{preset.label}</span>
                        {draft.colors.primary === preset.primary && <Check className="w-3 h-3 shrink-0" style={{ color: "#1A7A42" }} />}
                      </button>
                    ))}
                  </div>
                  {/* Custom colour overrides */}
                  <div className="border rounded-[8px] p-2.5 space-y-1" style={{ borderColor: "#e2e8f0" }}>
                    <p className="text-[10px] font-bold" style={{ color: "#94a3b8" }}>Custom override</p>
                    <ColorRow label="Primary" value={draft.colors.primary} onChange={(v) => updateDraft((p) => ({ ...p, colors: { ...p.colors, primary: v } }))} />
                    <ColorRow label="Secondary" value={draft.colors.secondary} onChange={(v) => updateDraft((p) => ({ ...p, colors: { ...p.colors, secondary: v } }))} />
                    <ColorRow label="Background" value={draft.colors.bg} onChange={(v) => updateDraft((p) => ({ ...p, colors: { ...p.colors, bg: v } }))} />
                    <ColorRow label="Text" value={draft.colors.text} onChange={(v) => updateDraft((p) => ({ ...p, colors: { ...p.colors, text: v } }))} />
                  </div>
                </div>

                {/* Typography */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2.5" style={{ color: "#94a3b8" }}>Typography</p>
                  <div className="space-y-1.5">
                    {FONT_PRESETS.map((fp) => (
                      <button key={fp.value} type="button" onClick={() => updateDraft((p) => ({ ...p, font: fp.value }))}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-[7px] border transition-all text-left"
                        style={{ borderColor: draft.font === fp.value ? "#1A7A42" : "#e2e8f0", background: draft.font === fp.value ? "#F0FAF3" : "#f8fafc" }}>
                        <span className="text-[14px]" style={{ fontFamily: FONT_FAMILIES[fp.value], color: "#1C1C1C" }}>{fp.sample} {fp.label}</span>
                        {draft.font === fp.value && <Check className="w-3 h-3 shrink-0" style={{ color: "#1A7A42" }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── SEO ─────────────────────────────────────── */}
            {activeTab === "seo" && (
              <div className="p-3">
                <SeoPanel seo={draft.seo} set={(v) => updateDraft((p) => ({ ...p, seo: { ...p.seo, ...v } }))} />
              </div>
            )}
          </div>
        </div>

        {/* ── Preview pane ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto py-4 px-4" style={{ background: "#f1f5f9" }}>
          <div className="mx-auto rounded-[12px] shadow-xl overflow-clip border transition-all duration-300"
            style={{
              width: viewport === "desktop" ? "100%" : viewport === "tablet" ? "768px" : "375px",
              maxWidth: "100%", borderColor: "#e2e8f0",
            }}>
            {/* Browser chrome */}
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
            {/* Content */}
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
            Preview updates live · Click <strong>Publish</strong> to push to your store
          </p>
        </div>
      </div>
    </div>
  );
}
