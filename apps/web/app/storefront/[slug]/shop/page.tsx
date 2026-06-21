"use client";

import { STORE_CONFIG } from "@/lib/storeConfig";
import EkoShop from "@/components/storefront/eko/EkoShop";
import LagosShop from "@/components/storefront/lagos/LagosShop";

export default function ShopPage() {
  switch (STORE_CONFIG.template) {
    case "lagos":
      return <LagosShop />;
    case "eko":
    default:
      return <EkoShop />;
  }
}
