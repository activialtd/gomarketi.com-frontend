import StoreInformation from "@/components/store-setup/StoreInfo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store Information - Vendor Dashboard",
  description: "Manage your store information on Wojalo",
};

const page = () => {
  return <StoreInformation />;
};

export default page;
