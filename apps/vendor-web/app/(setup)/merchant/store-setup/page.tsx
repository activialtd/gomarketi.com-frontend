import { Metadata } from "next";
import { StoreSetupForm } from "@/components/merchant/store-setup/StoreSetupForm";

export const metadata: Metadata = {
  title: "Set Up Your Store | GoMarket",
};

export default function StoreSetupPage() {
  return <StoreSetupForm />;
}
