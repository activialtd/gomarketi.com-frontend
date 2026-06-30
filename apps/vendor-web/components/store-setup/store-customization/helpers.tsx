export type TemplateId = "eko" | "lagos" | "abuja";

export type Template = {
  id: TemplateId;
  name: string;
  tagline: string;
  bestFor: string[];
  isPro: boolean;
  accent: string;
  preview: React.ReactNode;
};

// Inline SVG thumbnails — minimal "wireframe" of each layout
export function EkoThumb({
  colors,
}: {
  colors: { bg: string; primary: string; card: string };
}) {
  return (
    <svg
      viewBox="0 0 280 180"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Nav */}
      <rect x="0" y="0" width="280" height="22" fill={colors.primary} />
      <rect
        x="10"
        y="7"
        width="40"
        height="8"
        rx="2"
        fill="rgba(255,255,255,0.8)"
      />
      <rect
        x="180"
        y="7"
        width="20"
        height="8"
        rx="2"
        fill="rgba(255,255,255,0.4)"
      />
      <rect
        x="206"
        y="7"
        width="20"
        height="8"
        rx="2"
        fill="rgba(255,255,255,0.4)"
      />
      <rect
        x="232"
        y="7"
        width="38"
        height="8"
        rx="4"
        fill="rgba(255,255,255,0.9)"
      />
      {/* Hero banner */}
      <rect x="0" y="22" width="280" height="60" fill={colors.bg} />
      <rect
        x="20"
        y="35"
        width="100"
        height="12"
        rx="3"
        fill={colors.primary}
        opacity="0.5"
      />
      <rect
        x="20"
        y="52"
        width="70"
        height="8"
        rx="2"
        fill={colors.primary}
        opacity="0.3"
      />
      <rect x="20" y="65" width="50" height="12" rx="4" fill={colors.primary} />
      <rect x="170" y="28" width="90" height="50" rx="6" fill={colors.card} />
      {/* Product grid 3-col */}
      <rect x="10" y="92" width="82" height="70" rx="6" fill={colors.card} />
      <rect x="99" y="92" width="82" height="70" rx="6" fill={colors.card} />
      <rect x="188" y="92" width="82" height="70" rx="6" fill={colors.card} />
      <rect
        x="16"
        y="138"
        width="50"
        height="6"
        rx="2"
        fill={colors.primary}
        opacity="0.4"
      />
      <rect
        x="105"
        y="138"
        width="50"
        height="6"
        rx="2"
        fill={colors.primary}
        opacity="0.4"
      />
      <rect
        x="194"
        y="138"
        width="50"
        height="6"
        rx="2"
        fill={colors.primary}
        opacity="0.4"
      />
      <rect
        x="16"
        y="148"
        width="30"
        height="5"
        rx="2"
        fill={colors.primary}
        opacity="0.6"
      />
      <rect
        x="105"
        y="148"
        width="30"
        height="5"
        rx="2"
        fill={colors.primary}
        opacity="0.6"
      />
      <rect
        x="194"
        y="148"
        width="30"
        height="5"
        rx="2"
        fill={colors.primary}
        opacity="0.6"
      />
    </svg>
  );
}

export function LagosThumb({
  colors,
}: {
  colors: { bg: string; primary: string; card: string };
}) {
  return (
    <svg
      viewBox="0 0 280 180"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Minimal top bar */}
      <rect x="0" y="0" width="280" height="18" fill={colors.bg} />
      <rect
        x="110"
        y="5"
        width="60"
        height="8"
        rx="2"
        fill={colors.primary}
        opacity="0.5"
      />
      <rect x="245" y="5" width="25" height="8" rx="4" fill={colors.primary} />
      {/* Full bleed image hero */}
      <rect
        x="0"
        y="18"
        width="280"
        height="70"
        fill={colors.primary}
        opacity="0.12"
      />
      <rect
        x="60"
        y="30"
        width="160"
        height="14"
        rx="3"
        fill={colors.primary}
        opacity="0.5"
      />
      <rect
        x="90"
        y="50"
        width="100"
        height="9"
        rx="2"
        fill={colors.primary}
        opacity="0.3"
      />
      <rect
        x="105"
        y="63"
        width="70"
        height="14"
        rx="5"
        fill={colors.primary}
      />
      {/* 2-col feature + products */}
      <rect x="0" y="98" width="136" height="76" fill={colors.card} />
      <rect x="144" y="98" width="136" height="36" rx="0" fill={colors.card} />
      <rect x="144" y="138" width="64" height="36" fill={colors.card} />
      <rect x="216" y="138" width="64" height="36" fill={colors.card} />
      <rect
        x="10"
        y="130"
        width="60"
        height="6"
        rx="2"
        fill={colors.primary}
        opacity="0.4"
      />
      <rect
        x="10"
        y="140"
        width="40"
        height="5"
        rx="2"
        fill={colors.primary}
        opacity="0.6"
      />
    </svg>
  );
}

export function AbujaThumb({
  colors,
}: {
  colors: { bg: string; primary: string; card: string };
}) {
  return (
    <svg
      viewBox="0 0 280 180"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Side nav */}
      <rect
        x="0"
        y="0"
        width="60"
        height="180"
        fill={colors.primary}
        opacity="0.9"
      />
      <rect
        x="10"
        y="12"
        width="40"
        height="8"
        rx="2"
        fill="rgba(255,255,255,0.8)"
      />
      <rect
        x="10"
        y="32"
        width="40"
        height="6"
        rx="2"
        fill="rgba(255,255,255,0.4)"
      />
      <rect
        x="10"
        y="44"
        width="40"
        height="6"
        rx="2"
        fill="rgba(255,255,255,0.4)"
      />
      <rect
        x="10"
        y="56"
        width="40"
        height="6"
        rx="2"
        fill="rgba(255,255,255,0.4)"
      />
      <rect
        x="10"
        y="68"
        width="40"
        height="6"
        rx="2"
        fill="rgba(255,255,255,0.4)"
      />
      {/* Main content */}
      <rect x="60" y="0" width="220" height="180" fill={colors.bg} />
      {/* Top bar */}
      <rect x="60" y="0" width="220" height="20" fill="white" />
      <rect
        x="170"
        y="6"
        width="40"
        height="8"
        rx="2"
        fill={colors.primary}
        opacity="0.3"
      />
      <rect x="220" y="6" width="50" height="8" rx="4" fill={colors.primary} />
      {/* Hero */}
      <rect x="70" y="28" width="200" height="45" rx="8" fill={colors.card} />
      <rect
        x="80"
        y="38"
        width="80"
        height="8"
        rx="2"
        fill={colors.primary}
        opacity="0.4"
      />
      <rect
        x="80"
        y="50"
        width="55"
        height="6"
        rx="2"
        fill={colors.primary}
        opacity="0.25"
      />
      <rect
        x="200"
        y="36"
        width="60"
        height="30"
        rx="4"
        fill={colors.primary}
        opacity="0.2"
      />
      {/* Product grid 2x2 */}
      <rect x="70" y="80" width="94" height="44" rx="5" fill={colors.card} />
      <rect x="172" y="80" width="94" height="44" rx="5" fill={colors.card} />
      <rect x="70" y="130" width="94" height="44" rx="5" fill={colors.card} />
      <rect x="172" y="130" width="94" height="44" rx="5" fill={colors.card} />
      <rect
        x="76"
        y="106"
        width="50"
        height="5"
        rx="2"
        fill={colors.primary}
        opacity="0.35"
      />
      <rect
        x="178"
        y="106"
        width="50"
        height="5"
        rx="2"
        fill={colors.primary}
        opacity="0.35"
      />
      <rect
        x="76"
        y="156"
        width="50"
        height="5"
        rx="2"
        fill={colors.primary}
        opacity="0.35"
      />
      <rect
        x="178"
        y="156"
        width="50"
        height="5"
        rx="2"
        fill={colors.primary}
        opacity="0.35"
      />
    </svg>
  );
}

export const TEMPLATES: Template[] = [
  {
    id: "eko",
    name: "Eko",
    tagline: "Classic storefront with hero banner and 3-column product grid",
    bestFor: ["Fashion", "General retail", "Multi-category stores"],
    isPro: false,
    accent: "#F0FAF3",
    preview: null,
  },
  {
    id: "lagos",
    name: "Lagos",
    tagline:
      "Bold full-bleed layout with featured collections and editorial feel",
    bestFor: ["Luxury", "Fashion", "Premium brands"],
    isPro: false,
    accent: "#f0f9ff",
    preview: null,
  },
];

// ─── Colour presets ───────────────────────────────────────────────────────────

export type ColorPreset = {
  label: string;
  primary: string;
  secondary: string;
  bg: string;
  text: string;
};

export const COLOR_PRESETS: ColorPreset[] = [
  {
    label: "GoGreen",
    primary: "#1A7A42",
    secondary: "#0A4D2A",
    bg: "#F0FAF3",
    text: "#1C1C1C",
  },
  {
    label: "Midnight",
    primary: "#1e293b",
    secondary: "#0f172a",
    bg: "#f8fafc",
    text: "#0f172a",
  },
  {
    label: "Ember",
    primary: "#c2410c",
    secondary: "#7c2d12",
    bg: "#fff7ed",
    text: "#1C1C1C",
  },
  {
    label: "Ocean",
    primary: "#0369a1",
    secondary: "#0c4a6e",
    bg: "#f0f9ff",
    text: "#0c1a2e",
  },
  {
    label: "Royal",
    primary: "#7c3aed",
    secondary: "#4c1d95",
    bg: "#faf5ff",
    text: "#1C1C1C",
  },
  {
    label: "Rose",
    primary: "#be185d",
    secondary: "#831843",
    bg: "#fff1f2",
    text: "#1C1C1C",
  },
  {
    label: "Sand",
    primary: "#92400e",
    secondary: "#451a03",
    bg: "#fffbeb",
    text: "#1C1C1C",
  },
];

// ─── Font presets ─────────────────────────────────────────────────────────────

export const FONT_PRESETS = [
  { label: "Plus Jakarta", value: "plus-jakarta", sample: "Aa" },
  { label: "Inter", value: "inter", sample: "Aa" },
  { label: "Playfair", value: "playfair", sample: "Aa" },
  { label: "DM Sans", value: "dm-sans", sample: "Aa" },
  { label: "Sora", value: "sora", sample: "Aa" },
];

export const FONT_FAMILIES: Record<string, string> = {
  "plus-jakarta": "'Plus Jakarta Sans', sans-serif",
  inter: "'Inter', sans-serif",
  playfair: "'Playfair Display', serif",
  "dm-sans": "'DM Sans', sans-serif",
  sora: "'Sora', sans-serif",
};

// ─── Live preview component ───────────────────────────────────────────────────

// Loose shape — just the fields LivePreview actually reads, all optional for safety
type ThemeSections = {
  announcement?: { enabled?: boolean; text?: string; bgColor?: string; textColor?: string; dismissible?: boolean };
  header?: { logoUrl?: string; sticky?: boolean; showSearch?: boolean; showStoreName?: boolean };
  nav?: { items?: Array<{ id: string; label: string; url: string }> };
  hero?: { enabled?: boolean; headline?: string; subheadline?: string; ctaText?: string; imageUrl?: string; layout?: string; eyebrow?: string };
  collections?: { enabled?: boolean; title?: string };
  featured?: { enabled?: boolean; title?: string; count?: number };
  newsletter?: { enabled?: boolean; headline?: string; subtext?: string; placeholder?: string };
  ctaBand?: { enabled?: boolean; headline?: string; text?: string; btnText?: string };
  footer?: {
    tagline?: string; showPoweredBy?: boolean; copyright?: string;
    showAbout?: boolean; showLinks?: boolean; showContact?: boolean;
    customLinks?: Array<{ id: string; label: string; url: string }>;
    contact?: { whatsapp?: string; email?: string; phone?: string };
    social?: { instagram?: string; twitter?: string; facebook?: string };
    newsletter?: boolean;
  };
};

export function LivePreview({
  template,
  colors,
  font,
  storeName,
  headline,
  subheadline,
  viewport,
  config,
}: {
  template: TemplateId;
  colors: Omit<ColorPreset, "label"> & { label?: string };
  font: string;
  storeName: string;
  headline: string;
  subheadline: string;
  viewport: "desktop" | "tablet" | "mobile";
  config?: { sections: ThemeSections };
}) {
  const sec = config?.sections;
  const fontFamily = FONT_FAMILIES[font] ?? FONT_FAMILIES["plus-jakarta"];

  const widths: Record<string, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  // Shared mock products
  const mockProducts = [
    {
      name: "Ankara Crop Top",
      price: "₦12,500",
      img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80",
    },
    {
      name: "Aso-Oke Set",
      price: "₦85,000",
      img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&q=80",
    },
    {
      name: "Kaftan Dress",
      price: "₦28,000",
      img: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300&q=80",
    },
    {
      name: "Senator Suit",
      price: "₦42,000",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    },
    {
      name: "Gele Head-tie",
      price: "₦7,500",
      img: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=300&q=80",
    },
    {
      name: "Kids Set",
      price: "₦9,500",
      img: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&q=80",
    },
  ];

  const isMobile = viewport === "mobile";
  const isTablet = viewport === "tablet";

  return (
    <div className="w-full">
      <div
        style={{
          width: "100%",
          minWidth: isMobile ? "375px" : undefined,
          transition: "width 0.3s ease",
          fontFamily,
        }}
      >
        {template === "eko" && (
          <div style={{ background: "#fff", minHeight: "600px" }}>
            {/* Announcement bar */}
            {sec?.announcement?.enabled && (
              <div style={{
                background: sec.announcement.bgColor || colors.primary,
                color: sec.announcement.textColor || "#fff",
                padding: "7px 24px", fontSize: "11px", fontWeight: 600, textAlign: "center",
              }}>
                {sec.announcement.text || "Free delivery on orders above ₦20,000"}
              </div>
            )}
            {/* Nav */}
            <nav
              style={{
                background: colors.primary,
                padding: "0 24px",
                height: "56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#fff", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.3px" }}>
                {storeName}
              </span>
              {!isMobile && (
                <div style={{ display: "flex", gap: "20px" }}>
                  {(sec?.nav?.items?.length ? sec.nav.items : [{ label: "Shop" }, { label: "Collections" }]).slice(0, 4).map((item) => (
                    <span key={item.label} style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", cursor: "pointer" }}>
                      {item.label}
                    </span>
                  ))}
                </div>
              )}
              <button
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "7px 16px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cart (0)
              </button>
            </nav>

            {/* Hero — shown only when enabled in config, or always in legacy mode */}
            {(sec ? sec.hero?.enabled : true) && (
              <div style={{
                background: colors.bg,
                padding: isMobile ? "32px 20px" : "52px 40px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: "24px",
                flexDirection: isMobile ? "column" : "row",
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.primary, marginBottom: "10px" }}>
                    {storeName}
                  </p>
                  <h1 style={{ fontSize: isMobile ? "26px" : "36px", fontWeight: 900, letterSpacing: "-0.5px", color: colors.text, margin: "0 0 12px", lineHeight: 1.1 }}>
                    {sec?.hero?.headline || headline || "Welcome to our store"}
                  </h1>
                  <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px", maxWidth: "340px", lineHeight: 1.6 }}>
                    {sec?.hero?.subheadline || subheadline || "Discover amazing products."}
                  </p>
                  <button style={{ background: colors.primary, color: "#fff", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 14px ${colors.primary}44` }}>
                    {sec?.hero?.ctaText || "Shop now"} →
                  </button>
                </div>
                {!isMobile && (
                  <div style={{ width: "240px", height: "200px", borderRadius: "16px", overflow: "hidden", flexShrink: 0, background: `${colors.primary}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {sec?.hero?.imageUrl
                      ? <img src={sec.hero.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ textAlign: "center", color: colors.primary, opacity: 0.5 }}>
                          <div style={{ fontSize: "32px", marginBottom: "4px" }}>🖼</div>
                          <p style={{ fontSize: "10px", fontWeight: 600 }}>Hero image</p>
                        </div>
                    }
                  </div>
                )}
              </div>
            )}
            {sec && !sec.hero?.enabled && (
              <div style={{ background: "#f8fafc", borderBottom: "1px dashed #e2e8f0", padding: "12px 40px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>🖼 Hero section — enable it in the Sections panel</span>
              </div>
            )}

            {/* Featured products */}
            {(sec ? sec.featured?.enabled : true) && (
            <div style={{ padding: isMobile ? "24px 16px" : "40px 40px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: colors.text, marginBottom: "20px", letterSpacing: "-0.3px" }}>
                {sec?.featured?.title || "Featured products"}
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, 1fr)"
                    : isTablet
                      ? "repeat(2, 1fr)"
                      : "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                {mockProducts.slice(0, isMobile ? 4 : 6).map((p) => (
                  <div
                    key={p.name}
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid #f1f5f9",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: "1",
                        overflow: "hidden",
                        background: colors.bg,
                      }}
                    >
                      <img
                        src={p.img}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div style={{ padding: "12px" }}>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: colors.text,
                          marginBottom: "4px",
                        }}
                      >
                        {p.name}
                      </p>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 800,
                          color: colors.primary,
                        }}
                      >
                        {p.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
            {sec && !sec.featured?.enabled && (
              <div style={{ background: "#f8fafc", borderTop: "1px dashed #e2e8f0", padding: "12px 40px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>📦 Featured products — enable in Sections panel</span>
              </div>
            )}

            {/* Newsletter */}
            {sec?.newsletter?.enabled && (
              <div style={{ background: colors.bg, padding: "32px 40px", textAlign: "center" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: colors.text, marginBottom: "6px" }}>
                  {sec.newsletter.headline || "Stay in the loop"}
                </h3>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "14px" }}>{sec.newsletter.subtext}</p>
                <div style={{ display: "flex", gap: "8px", maxWidth: "320px", margin: "0 auto" }}>
                  <input readOnly placeholder={sec.newsletter.placeholder || "Enter your email"}
                    style={{ flex: 1, padding: "9px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", outline: "none" }} />
                  <button style={{ padding: "9px 16px", borderRadius: "8px", background: colors.primary, color: "#fff", border: "none", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                    Subscribe
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ background: colors.secondary, padding: "24px 40px", marginTop: "8px" }}>
              {sec?.footer?.tagline && (
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", textAlign: "center", marginBottom: "6px" }}>
                  {sec.footer.tagline}
                </p>
              )}
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px", textAlign: "center" }}>
                {sec?.footer?.copyright || `© 2026 ${storeName}`}
                {sec?.footer?.showPoweredBy !== false && " · Powered by GoMarketi"}
              </p>
            </div>
          </div>
        )}

        {template === "lagos" && (
          <div style={{ background: "#0E0E0E", color: "#F7F4EE", minHeight: "600px" }}>
            {/* Nav — matches LagosLayout exactly */}
            <nav style={{
              padding: "0 32px", height: "56px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
              <span style={{
                fontWeight: 600, fontSize: "16px", letterSpacing: "-0.3px",
                color: "#F7F4EE", fontFamily: "'Playfair Display', Georgia, serif",
              }}>
                {storeName}
              </span>
              {!isMobile && (
                <div style={{ display: "flex", gap: "24px" }}>
                  {(sec?.nav?.items?.length ? sec.nav.items : [{ label: "Shop" }, { label: "Collections" }]).slice(0, 4).map((item) => (
                    <span key={item.label} style={{
                      fontSize: "11px", fontWeight: 500, color: "rgba(247,244,238,0.6)",
                      cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                      {item.label}
                    </span>
                  ))}
                </div>
              )}
              <button style={{
                background: "transparent", color: "#F7F4EE",
                border: "1px solid rgba(247,244,238,0.2)", borderRadius: 0,
                padding: "7px 14px", fontSize: "10px", fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              }}>
                Bag
              </button>
            </nav>

            {/* Announcement bar */}
            {sec?.announcement?.enabled && (
              <div style={{
                background: sec.announcement.bgColor || "#1A1A1A",
                color: sec.announcement.textColor || "#fff",
                padding: "7px 24px", fontSize: "11px", fontWeight: 600, textAlign: "center",
              }}>
                {sec.announcement.text || "Free delivery on orders above ₦20,000"}
              </div>
            )}

            {/* Hero — split layout, matches LagosHome exactly */}
            {(sec ? sec.hero?.enabled : true) && (
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
                gap: isMobile ? "20px" : "32px",
                padding: isMobile ? "32px 20px" : "48px 32px",
                alignItems: "stretch",
              }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  {sec?.hero?.eyebrow && (
                    <p style={{
                      fontSize: "10px", fontWeight: 700, letterSpacing: "0.2em",
                      textTransform: "uppercase", color: colors.primary, marginBottom: "10px",
                    }}>
                      {sec.hero.eyebrow}
                    </p>
                  )}
                  <h1 style={{
                    fontSize: isMobile ? "30px" : "44px", fontWeight: 600,
                    lineHeight: 0.98, letterSpacing: "-0.5px", color: "#F7F4EE",
                    fontFamily: "'Playfair Display', Georgia, serif", marginBottom: "16px",
                  }}>
                    {sec?.hero?.headline || headline || "Welcome to our store"}
                  </h1>
                  <p style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(247,244,238,0.55)", marginBottom: "22px", maxWidth: "320px" }}>
                    {sec?.hero?.subheadline || subheadline || "Discover amazing products."}
                  </p>
                  <button style={{
                    background: "transparent", color: "#F7F4EE",
                    border: "1px solid #F7F4EE", borderRadius: 0,
                    padding: "12px 24px", fontSize: "11px", fontWeight: 600,
                    letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", alignSelf: "flex-start",
                  }}>
                    {sec?.hero?.ctaText || "Explore the edit"} →
                  </button>
                </div>

                <div style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden" }}>
                  {sec?.hero?.imageUrl ? (
                    <img src={sec.hero.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%", background: "#1a1a1a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px",
                    }}>
                      <span style={{ fontSize: "28px", opacity: 0.2 }}>🖼</span>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Hero image</p>
                    </div>
                  )}
                  <div style={{ position: "absolute", inset: "10px", border: "1px solid rgba(255,255,255,0.2)", pointerEvents: "none" }} />
                </div>
              </div>
            )}
            {sec && !sec.hero?.enabled && (
              <div style={{ padding: "12px 32px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>🖼 Hero section — enable it in the Sections panel</span>
              </div>
            )}

            {/* Featured products — matches LagosProductCard styling */}
            {(sec ? sec.featured?.enabled : true) && (
              <div style={{ padding: isMobile ? "8px 20px 32px" : "8px 32px 48px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
                  <h2 style={{
                    fontSize: "20px", fontWeight: 600, color: "#F7F4EE",
                    fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.3px",
                  }}>
                    {sec?.featured?.title || "New arrivals"}
                  </h2>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(247,244,238,0.5)", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>
                    Shop all →
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "10px" }}>
                  {mockProducts.slice(0, 4).map((p) => (
                    <div key={p.name} style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", background: "#1A1A1A", cursor: "pointer" }}>
                      <img src={p.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                        <span style={{ background: "#F7F4EE", color: "#0E0E0E", padding: "4px 9px", fontSize: "10px", fontWeight: 700 }}>
                          {p.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {sec && !sec.featured?.enabled && (
              <div style={{ padding: "12px 32px 32px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>📦 Featured products — enable in Sections panel</span>
              </div>
            )}

            {/* WhatsApp CTA band — matches LagosHome */}
            {sec?.ctaBand?.enabled && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "40px 32px", textAlign: "center" }}>
                <h3 style={{
                  fontSize: "18px", fontWeight: 600, color: "#F7F4EE",
                  fontFamily: "'Playfair Display', Georgia, serif", marginBottom: "14px", maxWidth: "320px", margin: "0 auto 14px",
                }}>
                  {sec.ctaBand.headline || `${storeName} replies on WhatsApp, usually within minutes.`}
                </h3>
                <button style={{
                  background: colors.primary, color: "#fff", border: "none",
                  padding: "11px 22px", fontSize: "11px", fontWeight: 700,
                  letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
                }}>
                  {sec.ctaBand.btnText || "Message us"}
                </button>
              </div>
            )}

            {/* Footer — matches LagosLayout footer */}
            <div style={{ background: "#0A0A0A", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "28px 32px" }}>
              <p style={{
                fontSize: "16px", fontWeight: 600, color: "#F7F4EE",
                fontFamily: "'Playfair Display', Georgia, serif", marginBottom: sec?.footer?.tagline ? "6px" : "0",
              }}>
                {storeName}
              </p>
              {sec?.footer?.tagline && (
                <p style={{ fontSize: "11px", color: "rgba(247,244,238,0.45)", maxWidth: "240px", marginBottom: "14px" }}>
                  {sec.footer.tagline}
                </p>
              )}
              <p style={{ fontSize: "10px", color: "rgba(247,244,238,0.3)", marginTop: "14px" }}>
                {sec?.footer?.copyright || `© 2026 ${storeName}`}
                {sec?.footer?.showPoweredBy !== false && " · Powered by GoMarketi"}
              </p>
            </div>
          </div>
        )}

        {template === "abuja" && (
          <div
            style={{
              background: "#f8fafc",
              minHeight: "600px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Top bar */}
            <div
              style={{
                background: "#fff",
                borderBottom: "1px solid #e2e8f0",
                padding: "0 24px",
                height: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "17px",
                  color: colors.primary,
                  letterSpacing: "-0.3px",
                }}
              >
                {storeName}
              </span>
              <div style={{ flex: 1, maxWidth: "300px", margin: "0 24px" }}>
                <div
                  style={{
                    background: "#f1f5f9",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    fontSize: "12px",
                    color: "#94a3b8",
                  }}
                >
                  🔍 Search products…
                </div>
              </div>
              <button
                style={{
                  background: colors.primary,
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "7px 16px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cart (0)
              </button>
            </div>

            <div style={{ display: "flex", flex: 1 }}>
              {/* Sidebar */}
              {!isMobile && (
                <aside
                  style={{
                    width: "200px",
                    background: "#fff",
                    borderRight: "1px solid #e2e8f0",
                    padding: "20px 16px",
                    flexShrink: 0,
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#94a3b8",
                      marginBottom: "10px",
                    }}
                  >
                    Categories
                  </p>
                  {[
                    "All",
                    "Women",
                    "Men",
                    "Kids",
                    "Accessories",
                    "Ceremonial",
                  ].map((c, i) => (
                    <div
                      key={c}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "7px",
                        fontSize: "13px",
                        fontWeight: i === 0 ? 700 : 500,
                        color: i === 0 ? colors.primary : "#374151",
                        background: i === 0 ? colors.bg : "transparent",
                        cursor: "pointer",
                        marginBottom: "2px",
                      }}
                    >
                      {c}
                    </div>
                  ))}
                  <div
                    style={{
                      marginTop: "20px",
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "#94a3b8",
                        marginBottom: "10px",
                      }}
                    >
                      Price range
                    </p>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      ₦0 — ₦200,000
                    </div>
                  </div>
                </aside>
              )}

              {/* Main */}
              <main
                style={{
                  flex: 1,
                  padding: isMobile ? "16px" : "24px",
                  overflow: "auto",
                }}
              >
                {/* Hero card */}
                <div
                  style={{
                    background: colors.primary,
                    borderRadius: "14px",
                    padding: "24px",
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                      }}
                    >
                      Featured
                    </p>
                    <h2
                      style={{
                        color: "#fff",
                        fontSize: isMobile ? "18px" : "24px",
                        fontWeight: 900,
                        letterSpacing: "-0.4px",
                        margin: "0 0 8px",
                      }}
                    >
                      {headline}
                    </h2>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      {subheadline}
                    </p>
                    <button
                      style={{
                        background: "#fff",
                        color: colors.primary,
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 20px",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Shop now
                    </button>
                  </div>
                  {!isMobile && (
                    <img
                      src={mockProducts[0].img}
                      alt=""
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>

                {/* Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "repeat(2, 1fr)"
                      : "repeat(3, 1fr)",
                    gap: "12px",
                  }}
                >
                  {mockProducts.map((p) => (
                    <div
                      key={p.name}
                      style={{
                        background: "#fff",
                        borderRadius: "10px",
                        border: "1px solid #f1f5f9",
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ aspectRatio: "1", overflow: "hidden" }}>
                        <img
                          src={p.img}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <p
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: colors.text,
                            marginBottom: "4px",
                          }}
                        >
                          {p.name}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "13px",
                              fontWeight: 800,
                              color: colors.primary,
                            }}
                          >
                            {p.price}
                          </p>
                          <button
                            style={{
                              background: colors.primary,
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              fontSize: "10px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </main>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
