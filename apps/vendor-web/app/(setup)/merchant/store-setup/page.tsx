import { Metadata } from "next";
import { StoreSetupForm } from "@/components/merchant/store-setup/StoreSetupForm";

export const metadata: Metadata = {
  title: "Set Up Your Store | Wojalo",
};

export default function StoreSetupPage() {
  return <StoreSetupForm />;
}
