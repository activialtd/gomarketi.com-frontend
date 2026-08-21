import { notFound } from "next/navigation";
import { Metadata } from "next";
import EkoCheckout from "@/components/storefront/eko/EkoCheckout";
import LagosCheckout from "@/components/storefront/lagos/LagosCheckout";
import { STORE_CONFIG } from "@/lib/storeConfig";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function getStoreData(slug: string) {
  try {
    const res = await fetch(`${API_URL}/v1/storefront/public/stores/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as {
      id: string;
      name: string;
      theme_config?: string;
    };
  } catch {
    return null;
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreData(slug);
  if (!store) notFound();

  const props = { storeId: store.id, storeSlug: slug, storeName: store.name };

  switch (STORE_CONFIG.template) {
    case "lagos":
      return <LagosCheckout {...props} />;
    case "eko":
      return <EkoCheckout {...props} />;
    default:
      return <EkoCheckout {...props} />;
  }
}
