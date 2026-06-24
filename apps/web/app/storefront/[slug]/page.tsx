import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EkoHome from "@/components/storefront/eko/EkoHome";
import LagosHome from "@/components/storefront/lagos/LagosHome";
import StoreSkeleton from "@/components/storefront/StoreSkeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface ThemeSections {
  announcement: { enabled: boolean; text: string; bgColor: string };
  hero: { enabled: boolean; headline: string; subheadline: string; ctaText: string; imageUrl?: string };
  collections: { enabled: boolean; title: string };
  featured: { enabled: boolean; title: string; count: number };
  ctaBand: { enabled: boolean; headline: string; text: string; btnText: string };
  footer: { tagline: string; whatsapp?: string; instagram?: string };
}

export interface ThemeConfig {
  template: "eko" | "lagos";
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

async function getStore(slug: string): Promise<StoreData | null> {
  try {
    const res = await fetch(`${API_URL}/v1/storefront/public/stores/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API error ${res.status}`);
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

  // No published config → show skeleton
  if (!themeConfig) {
    return <StoreSkeleton store={store} />;
  }

  const template = themeConfig.template ?? "eko";

  switch (template) {
    case "lagos":
    case "abuja": // Abuja layout coming — uses Lagos as base until its own component is built
      return <LagosHome store={store} themeConfig={themeConfig} />;
    case "eko":
    default:
      return <EkoHome store={store} themeConfig={themeConfig} />;
  }
}
