"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { fmtNaira, type Offer } from "@/lib/offers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// The offer does not say whether the product is digital, and the cart needs
// to know (digital orders skip delivery). Ask the catalogue when the caller
// could not tell us; a failed lookup falls back to physical, which at worst
// asks for an address that was not needed.
async function lookupIsDigital(offer: Offer): Promise<boolean> {
  try {
    const res = await fetch(
      `${API_URL}/v1/catalogue/public/stores/${offer.store_id}/products/${offer.product_id}`,
      { cache: "no-store" },
    );
    if (!res.ok) return false;
    const p = (await res.json()) as { is_digital?: boolean };
    return !!p.is_digital;
  } catch {
    return false;
  }
}

/**
 * "Buy at ₦X" for an accepted deal: puts the item in the cart at the agreed
 * price, carrying the offer id and the deal's quantity, then goes straight to
 * checkout. Used by the offer sheet, the offer page and the offers list.
 */
export function BuyDealButton({
  offer,
  isDigital,
  className = "",
}: {
  offer: Offer;
  isDigital?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { addOfferToCart, customer, setCustomer } = useCart();
  const [busy, setBusy] = useState(false);

  if (offer.status !== "accepted" || offer.agreed_kobo == null) return null;

  async function buy() {
    setBusy(true);
    const digital = isDigital ?? (await lookupIsDigital(offer));
    addOfferToCart(offer, digital);
    // The server only honours the deal for the email it was agreed with, so
    // make that the checkout's email. Everything else the buyer saved before
    // (address, city) is kept.
    if (!customer) {
      setCustomer({
        fullName: offer.customer_name,
        email: offer.customer_email,
        phone: offer.customer_phone ?? "",
        address: "",
        city: "",
        state: "",
      });
    } else if (customer.email.toLowerCase() !== offer.customer_email.toLowerCase()) {
      setCustomer({ ...customer, email: offer.customer_email });
    }
    // Clean path — proxy.ts rewrites this on the store's subdomain.
    router.push("/checkout");
  }

  return (
    <button
      type="button"
      onClick={() => void buy()}
      disabled={busy}
      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--store-primary,#1A7A42)] px-5 text-[15px] font-extrabold text-white shadow-lg shadow-black/10 transition-opacity hover:opacity-90 disabled:opacity-60 ${className}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
      Buy at {fmtNaira(offer.agreed_kobo)}
      {offer.quantity > 1 && <span className="font-semibold opacity-80">× {offer.quantity}</span>}
    </button>
  );
}
