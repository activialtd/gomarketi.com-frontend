// The root app/layout.tsx already provides <html>, <body>, CartProvider, and fonts.
// This nested layout only needs to pass children through.
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
