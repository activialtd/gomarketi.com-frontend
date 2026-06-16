export type TemplateId = "eko" | "lagos" | "abuja";

export type Template = {
  id: TemplateId;
  name: string;
  tagline: string;
  bestFor: string[];
  isPro: boolean;
  accent: string; // demo tint for the card
  preview: React.ReactNode; // inline SVG thumbnail
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
  {
    id: "abuja",
    name: "Abuja",
    tagline:
      "Modern sidebar layout — great for large catalogues with categories",
    bestFor: ["Electronics", "Multi-category", "High-volume stores"],
    isPro: true,
    accent: "#faf5ff",
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

export function LivePreview({
  template,
  colors,
  font,
  storeName,
  headline,
  subheadline,
  viewport,
}: {
  template: TemplateId;
  colors: ColorPreset;
  font: string;
  storeName: string;
  headline: string;
  subheadline: string;
  viewport: "desktop" | "tablet" | "mobile";
}) {
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
    <div className="w-full overflow-auto flex justify-center">
      <div
        style={{
          width: widths[viewport],
          minWidth: isMobile ? "375px" : undefined,
          transition: "width 0.3s ease",
          fontFamily,
        }}
      >
        {template === "eko" && (
          <div style={{ background: "#fff", minHeight: "600px" }}>
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
              <span
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "18px",
                  letterSpacing: "-0.3px",
                }}
              >
                {storeName}
              </span>
              {!isMobile && (
                <div style={{ display: "flex", gap: "24px" }}>
                  {["Shop", "Collections", "About"].map((l) => (
                    <span
                      key={l}
                      style={{
                        color: "rgba(255,255,255,0.75)",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      {l}
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

            {/* Hero */}
            <div
              style={{
                background: colors.bg,
                padding: isMobile ? "32px 20px" : "52px 40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "24px",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: colors.primary,
                    marginBottom: "10px",
                  }}
                >
                  New Collection
                </p>
                <h1
                  style={{
                    fontSize: isMobile ? "26px" : "36px",
                    fontWeight: 900,
                    letterSpacing: "-0.5px",
                    color: colors.text,
                    margin: "0 0 12px",
                    lineHeight: 1.1,
                  }}
                >
                  {headline}
                </h1>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "20px",
                    maxWidth: "340px",
                    lineHeight: 1.6,
                  }}
                >
                  {subheadline}
                </p>
                <button
                  style={{
                    background: colors.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 24px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: `0 4px 14px ${colors.primary}44`,
                  }}
                >
                  Shop now →
                </button>
              </div>
              {!isMobile && (
                <div
                  style={{
                    width: "240px",
                    height: "200px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={mockProducts[0].img}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Products */}
            <div style={{ padding: isMobile ? "24px 16px" : "40px 40px" }}>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: colors.text,
                  marginBottom: "20px",
                  letterSpacing: "-0.3px",
                }}
              >
                Featured products
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

            {/* Footer */}
            <div
              style={{
                background: colors.secondary,
                padding: "24px 40px",
                marginTop: "20px",
              }}
            >
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "11px",
                  textAlign: "center",
                }}
              >
                © 2026 {storeName} · Powered by GoMarket
              </p>
            </div>
          </div>
        )}

        {template === "lagos" && (
          <div style={{ background: "#fff", minHeight: "600px" }}>
            {/* Minimal nav */}
            <nav
              style={{
                padding: "0 32px",
                height: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "20px",
                  letterSpacing: "-0.5px",
                  color: colors.primary,
                }}
              >
                {storeName}
              </span>
              {!isMobile && (
                <div style={{ display: "flex", gap: "28px" }}>
                  {["Women", "Men", "Kids", "Sale"].map((l) => (
                    <span
                      key={l}
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#374151",
                        cursor: "pointer",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              )}
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
                Bag (0)
              </button>
            </nav>

            {/* Full-bleed hero */}
            <div style={{ position: "relative", overflow: "hidden" }}>
              <img
                src={mockProducts[1].img}
                alt=""
                style={{
                  width: "100%",
                  height: isMobile ? "220px" : "320px",
                  objectFit: "cover",
                  objectPosition: "center 30%",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
                }}
              >
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                  }}
                >
                  Now available
                </p>
                <h1
                  style={{
                    fontSize: isMobile ? "24px" : "40px",
                    fontWeight: 900,
                    color: "#fff",
                    letterSpacing: "-0.5px",
                    textAlign: "center",
                    marginBottom: "16px",
                    lineHeight: 1.1,
                    textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                  }}
                >
                  {headline}
                </h1>
                <button
                  style={{
                    background: "#fff",
                    color: colors.primary,
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 32px",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Explore collection
                </button>
              </div>
            </div>

            {/* Collections strip */}
            {!isMobile && (
              <div
                style={{
                  padding: "32px 32px 0",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                }}
              >
                {[
                  { label: "Women's wear", img: mockProducts[0].img },
                  { label: "Men's wear", img: mockProducts[3].img },
                  { label: "Accessories", img: mockProducts[4].img },
                ].map((c) => (
                  <div
                    key={c.label}
                    style={{
                      position: "relative",
                      borderRadius: "10px",
                      overflow: "hidden",
                      aspectRatio: "4/3",
                      cursor: "pointer",
                    }}
                  >
                    <img
                      src={c.img}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "flex-end",
                        padding: "14px",
                      }}
                    >
                      <p
                        style={{
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: "14px",
                        }}
                      >
                        {c.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products */}
            <div style={{ padding: isMobile ? "24px 16px" : "32px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: colors.text,
                    letterSpacing: "-0.3px",
                  }}
                >
                  New arrivals
                </h2>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: colors.primary,
                    cursor: "pointer",
                  }}
                >
                  See all →
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, 1fr)"
                    : "repeat(4, 1fr)",
                  gap: "12px",
                }}
              >
                {mockProducts.slice(0, 4).map((p) => (
                  <div
                    key={p.name}
                    style={{
                      borderRadius: "10px",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: "3/4",
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
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: colors.text,
                        marginTop: "8px",
                      }}
                    >
                      {p.name}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: colors.primary,
                      }}
                    >
                      {p.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                background: colors.bg,
                padding: "20px 32px",
                marginTop: "12px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "11px",
                  textAlign: "center",
                }}
              >
                © 2026 {storeName} · Powered by GoMarket
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
