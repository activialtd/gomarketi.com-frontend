import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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

async function getStoreByDomain(domain: string): Promise<Store | null> {
  try {
    const res = await fetch(
      `${API_URL}/v1/storefront/public/stores/by-domain?domain=${encodeURIComponent(domain)}`,
      { next: { revalidate: 60 } },
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const domain = headersList.get("x-custom-domain") ?? "";
  const store = await getStoreByDomain(domain);
  if (!store) return { title: "Store not found" };
  return {
    title: store.name,
    description: store.tagline ?? `Shop at ${store.name}`,
  };
}

export default async function CustomDomainStorefrontPage() {
  const headersList = await headers();
  const domain = headersList.get("x-custom-domain") ?? "";

  const store = await getStoreByDomain(domain);
  if (!store || !store.is_active) notFound();

  // Reuse the same store UI — just a different lookup path
  return (
    <main className="min-h-screen bg-white">
      <header className="px-6 py-4 border-b flex items-center gap-3" style={{ borderColor: "#e2e8f0" }}>
        {store.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.logo_url} alt={store.name} className="w-10 h-10 rounded-xl object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-lg" style={{ background: "#1A7A42" }}>
            {store.name[0].toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="font-extrabold text-[17px]" style={{ color: "#1C1C1C" }}>{store.name}</h1>
          {store.tagline && <p className="text-[12px]" style={{ color: "#6b7280" }}>{store.tagline}</p>}
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-400 text-sm">Products coming soon…</p>
      </div>
    </main>
  );
}
