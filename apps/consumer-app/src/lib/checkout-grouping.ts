import { CartLine, lineUnitKobo } from "./cart-context";
import { CheckoutOrderItem, CheckoutStoreOrder } from "./api-client";

export type GroupCartResult =
  | {
      ok: true;
      stores: CheckoutStoreOrder[];
      linesByStore: Record<string, CartLine[]>;
    }
  | { ok: false; error: string };

// groupCartByStore splits a cart that may span multiple vendors into the
// per-store shape POST /v1/orders/public/checkout expects — one order per
// vendor store, from one payment. Pulled out of CheckoutScreen as a pure
// function so this logic (the one part of checkout risky enough to want
// tested) is testable without a React Native runtime.
//
// Still blocks checkout outright if a line somehow has no storeId rather
// than silently dropping or mis-grouping it.
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
    const storeId = line.product.storeId;

    // The server prices every line itself: a plain line must carry the
    // product's current price, a deal line the offer's agreed price plus its
    // offer_id. Anything else is refused with a message checkout shows.
    const item: CheckoutOrderItem = {
      product_id: line.product.id,
      name: line.product.name,
      image_url: line.product.images?.[0],
      quantity: line.qty,
      price_kobo: lineUnitKobo(line),
      ...(line.deal ? { offer_id: line.deal.offerId } : {}),
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
