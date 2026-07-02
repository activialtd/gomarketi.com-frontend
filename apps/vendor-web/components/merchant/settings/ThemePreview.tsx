"use client";

import type { ThemeConfig } from "@gomarket/api-client";

interface ThemePreviewProps {
  storeName: string;
  logoUrl?: string;
  heroImageUrl?: string;
  theme: Partial<ThemeConfig>;
}

const FAKE_PRODUCTS = [
  { name: "Premium Item", price: "₦15,000", img: null },
  { name: "Store Special", price: "₦8,500", img: null },
  { name: "Best Seller", price: "₦22,000", img: null },
];

const BUTTON_RADIUS: Record<string, string> = {
  rounded: "6px",
  sharp: "2px",
  pill: "999px",
};

export function ThemePreview({
  storeName,
  logoUrl,
  heroImageUrl,
  theme,
}: ThemePreviewProps) {
  const primaryColor = theme.primary_color ?? "#1A7A42";
  const secondaryColor = theme.secondary_color ?? "#0A2E1A";
  const bgColor = theme.background_color ?? "#ffffff";
  const textColor = theme.text_color ?? "#1C1C1C";
  const accentColor = theme.accent_color ?? "#F0FAF3";
  const fontHeading = theme.font_heading ?? "Inter";
  const fontBody = theme.font_body ?? "Inter";
  const btnRadius = BUTTON_RADIUS[theme.button_style ?? "rounded"];
  const perRow = theme.products_per_row ?? 3;
  const showHero = theme.show_hero ?? false;
  const heroStyle = theme.hero_style ?? "split";

  const gridCols = perRow === 2 ? "grid-cols-2" : perRow === 4 ? "grid-cols-4" : "grid-cols-3";

  return (
    <div
      className="rounded-[10px] border overflow-hidden shadow-sm w-full"
      style={{ background: bgColor, borderColor: "#e2e8f0", fontFamily: fontBody }}
    >
      {/* Browser chrome simulation */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
        <div className="flex gap-1">
          {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
            <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div className="flex-1 mx-2 px-2 py-0.5 rounded text-[8px] font-mono" style={{ background: "#fff", border: "1px solid #e2e8f0", color: "#94a3b8" }}>
          your-store.gomarketi.com
        </div>
      </div>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: secondaryColor }}
      >
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="w-6 h-6 rounded object-cover" />
          ) : (
            <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[9px] font-bold"
              style={{ background: primaryColor }}>
              {(storeName || "S")[0].toUpperCase()}
            </div>
          )}
          <span className="text-[10px] font-bold text-white" style={{ fontFamily: fontHeading }}>
            {storeName || "Your Store"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {["Shop", "Collections", "About"].map((item) => (
            <span key={item} className="text-[8px] font-medium opacity-75 text-white">{item}</span>
          ))}
        </div>
      </div>

      {/* Hero section */}
      {showHero && (
        <div
          className="relative overflow-hidden"
          style={{
            background: heroStyle === "full" && heroImageUrl
              ? `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${heroImageUrl}) center/cover`
              : accentColor,
            minHeight: heroStyle === "none" ? 0 : 64,
          }}
        >
          {heroStyle === "split" ? (
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex-1">
                <p className="text-[10px] font-extrabold leading-tight mb-1" style={{ color: secondaryColor, fontFamily: fontHeading }}>
                  Welcome to {storeName || "Our Store"}
                </p>
                <p className="text-[8px] leading-relaxed mb-2" style={{ color: textColor, opacity: 0.75 }}>
                  Discover amazing products at great prices.
                </p>
                <div
                  className="inline-flex items-center px-2.5 py-1 text-[8px] font-bold text-white"
                  style={{ background: primaryColor, borderRadius: btnRadius }}
                >
                  Shop now
                </div>
              </div>
              {heroImageUrl && (
                <div className="w-16 h-12 rounded overflow-hidden shrink-0">
                  <img src={heroImageUrl} alt="hero" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ) : heroStyle === "minimal" ? (
            <div className="text-center py-4 px-4">
              <p className="text-[10px] font-extrabold mb-1" style={{ color: secondaryColor, fontFamily: fontHeading }}>
                {storeName || "Our Store"}
              </p>
              <div
                className="inline-flex items-center px-2.5 py-1 text-[8px] font-bold text-white"
                style={{ background: primaryColor, borderRadius: btnRadius }}
              >
                Browse all
              </div>
            </div>
          ) : (
            /* full or default */
            <div className="text-center py-5 px-4">
              <p className="text-[11px] font-extrabold mb-1 text-white" style={{ fontFamily: fontHeading }}>
                Welcome to {storeName || "Our Store"}
              </p>
              <p className="text-[8px] mb-2 text-white opacity-80">
                Discover amazing products at great prices.
              </p>
              <div
                className="inline-flex items-center px-3 py-1 text-[8px] font-bold text-white"
                style={{ background: primaryColor, borderRadius: btnRadius }}
              >
                Shop now
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products grid */}
      <div className="px-3 py-3">
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: textColor, opacity: 0.5, fontFamily: fontHeading }}>
          Featured Products
        </p>
        <div className={`grid ${gridCols} gap-2`}>
          {FAKE_PRODUCTS.slice(0, perRow === 4 ? 4 : 3).map((p) => (
            <div key={p.name} className="rounded-[6px] border overflow-hidden" style={{ borderColor: "#e2e8f0" }}>
              <div className="aspect-square flex items-center justify-center" style={{ background: accentColor }}>
                <div className="w-6 h-6 rounded opacity-30" style={{ background: primaryColor }} />
              </div>
              <div className="p-1.5">
                <p className="text-[7px] font-semibold truncate" style={{ color: textColor, fontFamily: fontBody }}>{p.name}</p>
                <p className="text-[7px] font-bold" style={{ color: primaryColor }}>{p.price}</p>
                <div
                  className="mt-1 w-full text-center text-[6px] font-bold text-white py-0.5"
                  style={{ background: primaryColor, borderRadius: btnRadius }}
                >
                  Add to cart
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini footer */}
      <div className="px-3 py-2 border-t text-center" style={{ background: secondaryColor, borderColor: "rgba(255,255,255,0.1)" }}>
        <p className="text-[7px] opacity-60 text-white">
          © {storeName || "Your Store"} · Powered by GoMarketi
        </p>
      </div>
    </div>
  );
}
