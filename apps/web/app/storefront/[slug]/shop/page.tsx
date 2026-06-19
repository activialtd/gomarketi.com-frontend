import Shop from "@/components/storefront/Shop";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop",
};

const page = () => {
  return <Shop />;
};

export default page;
