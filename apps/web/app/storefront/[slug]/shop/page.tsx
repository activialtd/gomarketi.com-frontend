import EkoShop from "@/components/storefront/eko/EkoShop";
import LagosShop from "@/components/storefront/lagos/LagosShop";
import type { StorefrontProduct, ThemeConfig } from "@/app/storefront/[slug]/page";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function getStoreData(slug: string) {
  try {
    const res = await fetch(`${API_URL}/v1/storefront/public/stores/${slug}`,
      { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json() as { id: string; name: string; theme_config?: string };
  } catch { return null; }
}

async function getProducts(storeId: string): Promise<StorefrontProduct[]> {
  try {
    const res = await fetch(
      `${API_URL}/v1/catalogue/public/stores/${storeId}/products?per_page=50`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const d = await res.json() as { products?: StorefrontProduct[] };
    return d.products ?? [];
  } catch { return []; }
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreData(slug);
  if (!store) return <EkoShop products={[]} />;

  const products = await getProducts(store.id);

  let template: "eko" | "lagos" | "abuja" = "eko";
  if (store.theme_config) {
    try {
      const cfg = JSON.parse(store.theme_config) as ThemeConfig;
      template = cfg.template ?? "eko";
    } catch { /* use default */ }
  }

  switch (template) {
    case "lagos":
    case "abuja":
      return <LagosShop products={products} />;
    case "eko":
    default:
      return <EkoShop products={products} />;
  }
}
