import { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Account | GoMarket Vendor",
  description: "Sign up and start selling your products globally on GoMarket.",
};

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-6 h-6 animate-spin text-[#1A7A42]" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
