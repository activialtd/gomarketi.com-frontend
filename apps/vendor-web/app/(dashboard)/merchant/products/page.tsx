import { Metadata } from "next";
import ProductsPage from "@/components/merchant/products/Products";

export const metadata: Metadata = {
  title: "Products",
  description: "Products",
};

const page = () => {
  return (
    <>
      <ProductsPage />
    </>
  );
};

export default page;
