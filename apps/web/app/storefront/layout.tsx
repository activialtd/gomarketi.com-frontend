import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { CartProvider } from "@/lib/cartContext";
import { STORE_CONFIG } from "@/lib/storeConfig";
import EkoLayout from "@/components/storefront/eko/EkoLayout";
import LagosLayout from "@/components/storefront/lagos/LagosLayout";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: STORE_CONFIG.storeName,
  description: STORE_CONFIG.tagline,
};

function TemplateLayout({ children }: { children: React.ReactNode }) {
  switch (STORE_CONFIG.template) {
    case "lagos":
      return <LagosLayout>{children}</LagosLayout>;
    case "eko":
    default:
      return <EkoLayout>{children}</EkoLayout>;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} min-h-full font-[family-name:var(--font-jakarta)] antialiased`}
      >
        <CartProvider>
          <TemplateLayout>{children}</TemplateLayout>
        </CartProvider>
      </body>
    </html>
  );
}
