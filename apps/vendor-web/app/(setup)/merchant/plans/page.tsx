import { Metadata } from "next";
import PlanSelection from "@/components/merchant/onboarding/PlanSelection";

export const metadata: Metadata = { title: "Choose Your Plan | Wojalo" };

export default function PlansPage() {
  return <PlanSelection />;
}
