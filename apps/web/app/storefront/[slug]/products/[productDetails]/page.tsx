import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import EkoProductDetails from "@/components/storefront/eko/EkoProductDetails";
import type { StorefrontProduct } from "@/app/storefront/[slug]/page";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function getStoreId(slug: string): Promise<string | null> {
  noStore();
  try {
    const res = await fetch(`${API_URL}/v1/storefront/public/stores/${slug}`);
    if (!res.ok) return null;
    const d = await res.json();
    return (d.id as string) ?? null;
  } catch { return null; }
}

async function getProduct(storeId: string, productId: string): Promise<StorefrontProduct | null> {
  try {
    const res = await fetch(
      `${API_URL}/v1/catalogue/public/stores/${storeId}/products/${productId}`,
    );
    if (!res.ok) return null;
    return await res.json() as StorefrontProduct;
  } catch { return null; }
}

async function getRelated(storeId: string, excludeId: string): Promise<StorefrontProduct[]> {
  try {
    const res = await fetch(
      `${API_URL}/v1/catalogue/public/stores/${storeId}/products?per_page=5`,
    );
    if (!res.ok) return [];
    const d = await res.json() as { products?: StorefrontProduct[] };
    return (d.products ?? []).filter((p) => p.id !== excludeId).slice(0, 4);
  } catch { return []; }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productDetails: string }>;
}): Promise<Metadata> {
  const { slug, productDetails } = await params;
  const storeId = await getStoreId(slug);
  if (!storeId) return { title: "Product" };
  const product = await getProduct(storeId, productDetails);
  return {
    title: product?.name ?? "Product",
    description: product?.description ?? undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productDetails: string }>;
}) {
  const { slug, productDetails } = await params;
  const storeId = await getStoreId(slug);
  if (!storeId) notFound();

  const [product, related] = await Promise.all([
    getProduct(storeId!, productDetails),
    getRelated(storeId!, productDetails),
  ]);

  if (!product) notFound();

  return <EkoProductDetails product={product} related={related} />;
}
