import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GoMarketi — Africa's Commerce Platform",
  description:
    "GoMarketi is building the infrastructure for African commerce. Launching soon.",
  openGraph: {
    title: "GoMarketi — Africa's Commerce Platform",
    description: "We're launching soon. Join the waitlist.",
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
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full font-[family-name:var(--font-jakarta)]">
        {children}
      </body>
    </html>
  );
}
