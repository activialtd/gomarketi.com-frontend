import ProductDetails from "@/components/storefront/ProductDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product",
  description: "Product",
};
const page = async ({
  params,
}: {
  params: Promise<{ productDetails: string }>;
}) => {
  const { productDetails } = await params;

  return <ProductDetails params={{ slug: productDetails }} />;
};

export default page;
