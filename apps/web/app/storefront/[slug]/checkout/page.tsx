import { notFound } from "next/navigation";
import { Metadata } from "next";
import EkoCheckout from "@/components/storefront/eko/EkoCheckout";
import LagosCheckout from "@/components/storefront/lagos/LagosCheckout";
import { STORE_CONFIG } from "@/lib/storeConfig";
import type { DeliveryOptionResp } from "@gomarket/api-client";

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
      delivery_fee_kobo?: number;
      free_delivery_threshold_kobo?: number;
    };
  } catch {
    return null;
  }
}

// Delivery options come from their own endpoint — the store payload does not
// carry them, which is why reading store.delivery_options silently produced
// "this vendor has not set a delivery fee" on stores that had set several.
// no-store so a vendor's edit shows at the next checkout load, not an hour on.
async function getDeliveryOptions(slug: string): Promise<DeliveryOptionResp[]> {
  try {
    const res = await fetch(
      `${API_URL}/v1/storefront/public/stores/${slug}/delivery-options`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as
      | DeliveryOptionResp[]
      | { delivery_options?: DeliveryOptionResp[] };
    // The endpoint returns a bare array; tolerate a wrapped shape too so a
    // later envelope change cannot empty the checkout without failing a build.
    return Array.isArray(data) ? data : data.delivery_options ?? [];
  } catch {
    return [];
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [store, deliveryOptions] = await Promise.all([
    getStoreData(slug),
    getDeliveryOptions(slug),
  ]);
  if (!store) notFound();

  const props = {
    storeId: store.id,
    storeSlug: slug,
    storeName: store.name,
    deliveryFeeKobo: store.delivery_fee_kobo ?? 150000,
    freeDeliveryThresholdKobo: store.free_delivery_threshold_kobo ?? 5000000,
    // The vendor's own delivery choices. An empty list is meaningful: the
    // checkout blocks rather than inventing a price the orders service would
    // then reject.
    deliveryOptions,
  };

  switch (STORE_CONFIG.template) {
    case "lagos":
      return <LagosCheckout {...props} />;
    case "eko":
      return <EkoCheckout {...props} />;
    default:
      return <EkoCheckout {...props} />;
  }
}
