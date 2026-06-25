import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import EkoHome from "@/components/storefront/eko/EkoHome";
import LagosHome from "@/components/storefront/lagos/LagosHome";
import StoreSkeleton from "@/components/storefront/StoreSkeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface ThemeSections {
  announcement?: { enabled?: boolean; text?: string; bgColor?: string; textColor?: string; dismissible?: boolean };
  header?: { logoUrl?: string; sticky?: boolean; showSearch?: boolean; showStoreName?: boolean };
  nav?: { items?: Array<{ id: string; label: string; url: string }> };
  hero?: { enabled?: boolean; headline?: string; subheadline?: string; ctaText?: string; secondaryCtaText?: string; imageUrl?: string; eyebrow?: string; layout?: string; overlayOpacity?: number };
  collections?: { enabled?: boolean; title?: string; subtitle?: string; columns?: number };
  featured?: { enabled?: boolean; title?: string; subtitle?: string; count?: number; layout?: string };
  newsletter?: { enabled?: boolean; headline?: string; subtext?: string; placeholder?: string };
  ctaBand?: { enabled?: boolean; headline?: string; text?: string; btnText?: string };
  footer?: {
    tagline?: string; showPoweredBy?: boolean; copyright?: string;
    showAbout?: boolean; showLinks?: boolean; showContact?: boolean;
    customLinks?: Array<{ id: string; label: string; url: string }>;
    contact?: { whatsapp?: string; email?: string; phone?: string; address?: string };
    social?: { instagram?: string; twitter?: string; facebook?: string; tiktok?: string; youtube?: string };
    newsletter?: boolean;
  };
}

export interface ThemeConfig {
  template: "eko" | "lagos" | "abuja";
  colors: { primary: string; secondary: string; bg: string; text: string };
  font: string;
  sections: ThemeSections;
}

export interface StoreData {
  id: string;
  name: string;
  slug: string;
  category: string;
  currency: string;
  tagline: string | null;
  logo_url: string | null;
  theme_config: string | null;
  is_active: boolean;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  description?: string;
  price_kobo: number;
  images: string[];
  tags: string[];
  is_digital: boolean;
  category_id?: string;
}

async function getProducts(storeId: string): Promise<StorefrontProduct[]> {
  try {
    const res = await fetch(
      `${API_URL}/v1/catalogue/public/stores/${storeId}/products?per_page=20`,
    );
    if (!res.ok) return [];
    const data = await res.json() as { products?: StorefrontProduct[] };
    return data.products ?? [];
  } catch {
    return [];
  }
}

async function getStore(slug: string): Promise<StoreData | null> {
  noStore(); // opt out of Next.js Data Cache without triggering Turbopack perf bug
  try {
    const res = await fetch(`${API_URL}/v1/storefront/public/stores/${slug}`);
    if (res.status === 404) return null;
    if (!res.ok) return null; // surface as not-found; real errors logged server-side
    const data = await res.json();
    return data.store ?? data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore(slug);
  if (!store) return { title: "Store not found" };
  return {
    title: store.name,
    description: store.tagline ?? `Shop at ${store.name} on GoMarketi`,
  };
}

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStore(slug);

  if (!store || !store.is_active) notFound();

  // Parse published theme config
  let themeConfig: ThemeConfig | null = null;
  if (store.theme_config) {
    try {
      themeConfig = JSON.parse(store.theme_config) as ThemeConfig;
    } catch { /* invalid JSON — treat as no config */ }
  }

  // Fetch published products in parallel with the config parse
  const products = await getProducts(store.id);

  // No published config → show skeleton
  if (!themeConfig) {
    return <StoreSkeleton store={store} products={products} />;
  }

  const template = themeConfig.template ?? "eko";

  switch (template) {
    case "lagos":
    case "abuja":
      return <LagosHome store={store} themeConfig={themeConfig} products={products} />;
    case "eko":
    default:
      return <EkoHome store={store} themeConfig={themeConfig} products={products} />;
  }
}
