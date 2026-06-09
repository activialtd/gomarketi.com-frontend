import { Metadata } from "next";
import { StoreSetupForm } from "@/components/merchant/store-setup/StoreSetupForm";

export const metadata: Metadata = {
  title: "Store Profile | GoMarket Vendor Onboarding",
  description: "Configure your public storefront identity.",
};

export default function Page() {
  return (
    <main>
      <StoreSetupForm />
    </main>
  );
}
