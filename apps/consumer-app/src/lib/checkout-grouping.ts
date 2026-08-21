import { CartLine, NGN_RATE } from "./cart-context";
import { CheckoutOrderItem, CheckoutStoreOrder } from "./api-client";

export type GroupCartResult =
  | { ok: true; stores: CheckoutStoreOrder[]; linesByStore: Record<string, CartLine[]> }
  | { ok: false; error: string };

// groupCartByStore splits a cart that may span multiple vendors into the
// per-store shape POST /v1/orders/public/checkout expects — one order per
// vendor store, from one payment. Pulled out of CheckoutScreen as a pure
// function so this logic (the one part of checkout risky enough to want
// tested) is testable without a React Native runtime.
//
// Blocks checkout outright if any line is missing storeId rather than
// silently dropping or mis-grouping it — reachable in practice via
// ProductDetailsScreen's mock-catalogue fallback when no product prop is
// passed (e.g. a deep link carrying only a product id).
export function groupCartByStore(items: CartLine[]): GroupCartResult {
  if (items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (items.some((line) => !line.product.storeId)) {
    return {
      ok: false,
      error:
        "One or more items in your cart can't be checked out right now — please remove and re-add them from the store page.",
    };
  }

  const stores = new Map<string, CheckoutStoreOrder>();
  const linesByStore: Record<string, CartLine[]> = {};

  for (const line of items) {
    const storeId = line.product.storeId as string;

    // Product.price is pre-divided by NGN_RATE (see catalogue-adapter.ts)
    // so cart-context's USD-flavored math displays the right Naira amount —
    // reverse that here to recover the real price_kobo the backend expects.
    const priceKobo = Math.round(line.product.price * NGN_RATE * 100);

    const item: CheckoutOrderItem = {
      product_id: line.product.id,
      name: line.product.name,
      image_url: line.product.images?.[0],
      quantity: line.qty,
      price_kobo: priceKobo,
    };

    const existing = stores.get(storeId);
    if (existing) {
      existing.items.push(item);
      linesByStore[storeId].push(line);
    } else {
      stores.set(storeId, {
        store_id: storeId,
        store_slug: line.product.storeSlug,
        store_name: line.product.storeName,
        items: [item],
      });
      linesByStore[storeId] = [line];
    }
  }

  return { ok: true, stores: Array.from(stores.values()), linesByStore };
}
