import { Plus_Jakarta_Sans } from "next/font/google";
import { CartProvider } from "@/lib/cartContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

// Each page (EkoHome, LagosHome, StoreSkeleton) owns its own header and footer
// so the layout only provides the font + cart context.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} min-h-full font-[family-name:var(--font-jakarta)] antialiased`}
        suppressHydrationWarning
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
