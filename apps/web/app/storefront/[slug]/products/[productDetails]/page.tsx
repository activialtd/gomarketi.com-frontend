import { use } from "react";
import { STORE_CONFIG } from "@/lib/storeConfig";
import EkoProductDetail from "@/components/storefront/eko/EkoProductDetails";
import LagosProductDetail from "@/components/storefront/lagos/LagosProductDetails";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ productDetails: string }>;
}) {
  const { productDetails } = use(params);

  switch (STORE_CONFIG.template) {
    case "lagos":
      return <LagosProductDetail slug={productDetails} />;
    case "eko":
    default:
      return <EkoProductDetail slug={productDetails} />;
  }
}
