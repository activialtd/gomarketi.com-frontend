import Checkout from "@/components/storefront/Checkout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function getStoreData(slug: string) {
  try {
    const res = await fetch(`${API_URL}/v1/storefront/public/stores/${slug}`,
      { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json() as { id: string; name: string };
    return d;
  } catch { return null; }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreData(slug);
  return <Checkout storeId={store?.id ?? null} storeSlug={slug} storeName={store?.name ?? ""} />;
}
