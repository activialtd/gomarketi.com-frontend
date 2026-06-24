import StoreCustomize from "@/components/store-setup/store-customization/StoreCustomize";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store customization - Merchant dashboard",
  description: "Customize your store",
};

const page = () => {
  return <StoreCustomize />;
};

export default page;
