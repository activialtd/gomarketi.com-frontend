/**
 * GoMarketi tokens — single source of truth. No hex outside this file.
 * Canonical names first; component aliases derived below them.
 */

const brand = {
  primary: "#239452", // primary actions
  primaryDark: "#1e8f4d", // pressed state
  secondary: "#0a4d2a", // deep forest — display type
  accent: "#22c55e", // mic, active dot

  background: "#ffffff",
  surface: "#f0faf3", // mint panels
  foreground: "#1c1c1c",
  muted: "#3d6b4f", // body copy
  border: "#e2e8f0",
  input: "#f1f5f9",
  ring: "#1a7a42",

  onPrimary: "#ffffff",

  danger: "#dc2626", // form/auth error text

  // ---- cartoon accent pops — bright, saturated, used sparingly ----
  sunshine: "#FFC93C", // badges, sparkle accents
  coral: "#FF6B5E", // playful highlights, mic ring
  sky: "#3EC1F3", // secondary accent pop
  ink900: "#0A2E1A", // hard "sticker" shadow colour
} as const;

export const color = {
  ...brand,

  // ---- aliases used by screens/components ----
  ink: brand.secondary, // dark CTA fills, icons on light
  canvas: "#F4F6F4", // app background (off-white)
  card: brand.background, // white cards
  panel: brand.surface, // inset/mint surfaces
  text: brand.foreground,
  textMuted: "#6E766F",
  textFaint: "#9AA39B",
  line: brand.border, // hairline borders
  lineStrong: "#D3D9D4",
  onInk: brand.onPrimary, // text/icon on dark green
} as const;

/**
 * "Sticker" look: thick border + hard offset shadow (no blur) instead of a
 * soft drop shadow — the cartoon signature applied to cards/buttons/chips
 * that should feel poppy and tactile rather than flat/corporate.
 */
export function stickerShadow(borderColor: string = color.ink900, offset = 4) {
  return {
    borderWidth: 2.5,
    borderColor,
    shadowColor: borderColor,
    shadowOffset: { width: offset, height: offset },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: offset,
  } as const;
}

/** Category tints for product image slots — low saturation, calm wall. */
export const tint = {
  produce: "#E6F0E9",
  drink: "#EBEEF1",
  bakery: "#F3EDE3",
  pharmacy: "#E7EFF5",
  fashion: "#EFEFF1",
  home: "#EFECF3",
  electronics: "#E8EEF7",
  jewelry: "#F6EEDD",
  groceries: "#EAF3E3",
  thrift: "#EFE9E2",
  food: "#F5E9E3",
} as const;

export type TintKey = keyof typeof tint;

export const radius = {
  chip: 999,
  input: 14,
  button: 16,
  card: 20,
  panel: 32,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  gutter: 20,
} as const;

/** Plus Jakarta Sans. Body ≥14, line-height ~1.5. */
export const type = {
  eyebrow: {
    fontFamily: "Jakarta_600",
    fontSize: 11,
    letterSpacing: 1.4,
    color: color.muted,
  },
  display: {
    // Fredoka (not Jakarta) — its rounded shapes are the "cartoon" headline
    // treatment, used consistently across splash/onboarding/auth/home.
    fontFamily: "Fredoka_600",
    fontSize: 28,
    lineHeight: 36,
    color: color.secondary,
  },
  title: {
    fontFamily: "Jakarta_700",
    fontSize: 20,
    lineHeight: 27,
    color: color.foreground,
  },
  section: { fontFamily: "Jakarta_600", fontSize: 16, color: color.foreground },
  body: {
    fontFamily: "Jakarta_400",
    fontSize: 14,
    lineHeight: 21,
    color: color.muted,
  },
  label: { fontFamily: "Jakarta_500", fontSize: 13, color: color.foreground },
  button: { fontFamily: "Jakarta_600", fontSize: 15 },
  meta: { fontFamily: "Jakarta_400", fontSize: 12, color: color.muted },
} as const;

export const HIT = { top: 10, bottom: 10, left: 10, right: 10 };
