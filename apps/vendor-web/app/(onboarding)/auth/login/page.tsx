import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | Wojalo Vendor",
  description: "Log in to your Wojalo vendor dashboard.",
};

export default function LoginPage() {
  return <LoginForm />;
}
