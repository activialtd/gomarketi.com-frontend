import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { STORE_CONFIG } from "@/lib/storeConfig";
import EkoHome from "@/components/storefront/eko/EkoHome";
import LagosHome from "@/components/storefront/lagos/LagosHome";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface Store {
  id: string;
  name: string;
  slug: string;
  category: string;
  currency: string;
  tagline: string | null;
  logo_url: string | null;
  is_active: boolean;
}

async function getStore(slug: string): Promise<Store | null> {
  try {
    const res = await fetch(`${API_URL}/v1/storefront/public/stores/${slug}`, {
      next: { revalidate: 60 }, // cache for 60s, refresh in background
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
    description: store.tagline ?? `Shop at ${store.name} on GoMarket`,
  };
}

export default function StorefrontPage() {
  switch (STORE_CONFIG.template) {
    case "lagos":
      return <LagosHome />;
    case "eko":
    default:
      return <EkoHome />;
  }
}
