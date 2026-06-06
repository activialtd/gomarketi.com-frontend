import { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account | GoMarket Vendor",
  description: "Sign up and start selling your products globally on GoMarket.",
};

export default function SignupPage() {
  return <SignupForm />;
}
