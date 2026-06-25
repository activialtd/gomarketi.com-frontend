import { Suspense } from "react";
import { Metadata } from "next";
import ProductsPage from "@/components/merchant/products/Products";
import ProductsSkeleton from "@/components/skeletons/ProductsSkeleton";

export const metadata: Metadata = {
  title: "Products — GoMarketi",
  description: "Manage your store products",
};

const page = () => (
  <Suspense fallback={<ProductsSkeleton />}>
    <ProductsPage />
  </Suspense>
);

export default page;
