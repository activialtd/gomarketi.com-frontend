import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | GoMarket Vendor",
  description: "Log in to your GoMarket vendor dashboard.",
};

export default function LoginPage() {
  return <LoginForm />;
}
