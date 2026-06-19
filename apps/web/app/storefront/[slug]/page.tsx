import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Home from "@/components/storefront/Home";

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

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // const store = await getStore(slug);

  const store = {
    id: "1",
    name: "Demo Store",
    slug: "demo-store",
    category: "Electronics",
    currency: "NGN",
    tagline: "Best electronics store in Nigeria",
    logo_url: "https://example.com/logo.png",
    is_active: true,
  };

  // if (!store || !store.is_active) notFound();

  return (
    <main className="min-h-screen bg-white">
      {/* Storefront header */}
      <header
        className="px-6 py-4 border-b flex items-center gap-3"
        style={{ borderColor: "#e2e8f0" }}
      >
        {store.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.logo_url}
            alt={store.name}
            className="w-10 h-10 rounded-xl object-cover"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-lg"
            style={{ background: "#1A7A42" }}
          >
            {store.name[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1
            className="font-extrabold text-[17px]"
            style={{ color: "#1C1C1C" }}
          >
            {store.name}
          </h1>
          {store.tagline && (
            <p className="text-[12px]" style={{ color: "#6b7280" }}>
              {store.tagline}
            </p>
          )}
        </div>
        <div className="ml-auto">
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: "#f0fdf4", color: "#1A7A42" }}
          >
            {store.currency}
          </span>
        </div>
      </header>

      {/* Products will go here */}
      <Home />
    </main>
  );
}
