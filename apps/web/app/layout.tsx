import type { Metadata } from "next";
import { Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cartContext";
import { ErrorReporter } from "@/components/ErrorReporter";

// Montserrat is the brand's secondary typeface and carries display headings;
// the primary face (Blatant) is not licensed for web use here.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GoMarket — Shop your local market without the trip",
  description:
    "Order from the traders you already buy from. Vendors bring your items to our hub, we check them, and one delivery brings everything to your door.",
  openGraph: {
    title: "GoMarket — Shop your local market without the trip",
    description:
      "Order from real market traders. One delivery brings everything to your door.",
    url: "https://gomarketi.com",
    siteName: "GoMarketi",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full font-[family-name:var(--font-jakarta)]">
        <ErrorReporter />
        {/* Nothing visual belongs here: this layout wraps the storefront tree
            too, and a vendor's store must render only their own chrome. The
            marketing navbar and footer live in app/(site)/layout.tsx. */}
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
