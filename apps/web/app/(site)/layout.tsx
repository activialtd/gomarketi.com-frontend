import { Footer } from "@/components/site/common/Footer";
import { Navbar } from "@/components/site/common/Navbar";

// The marketing chrome lives here, not in the root layout.
//
// Anything in the root layout renders on every route in the app — including
// /storefront/[slug], where each vendor already gets their own themed header
// and footer from EkoLayout/LagosLayout. A published store was therefore
// showing GoMarketi's navbar and footer stacked around the vendor's own,
// which is not a store the vendor designed.
//
// (site) is a route group: the parentheses keep it out of the URL, so "/",
// "/about", "/help" and "/legal/*" are unchanged — they simply pick up this
// layout, and the storefront tree no longer can.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
