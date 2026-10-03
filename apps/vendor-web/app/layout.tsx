import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  // Needed for app/opengraph-image.png and app/twitter-image.png to resolve to
  // absolute URLs — relative ones are ignored by most link scrapers.
  metadataBase: new URL("https://vendor.gomarketi.com"),
  title: "Vendor Dashboard | GoMarket",
  description: "Manage your GoMarket storefront, products, and orders.",
  openGraph: {
    title: "GoMarket for vendors",
    description: "Manage your GoMarket storefront, products, and orders.",
    siteName: "GoMarket",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
