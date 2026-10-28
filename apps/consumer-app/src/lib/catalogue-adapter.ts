import { CatalogueProduct, StoreResult } from "./api-client";
import { Product } from "./types";
import { categoryMeta } from "./store-category";

/**
 * Turns a catalogue product plus the store it belongs to into the app's
 * Product. Prices stay in kobo end to end — formatKobo (order-status.ts) is
 * the one place they become Naira on screen.
 */
export function catalogueProductToAppProduct(p: CatalogueProduct, store: StoreResult): Product {
  const meta = categoryMeta(store.category);
  return {
    id: p.id,
    name: p.name,
    vendor: store.name,
    storeId: store.id,
    storeSlug: store.slug,
    storeName: store.name,
    category: store.category,
    priceKobo: p.price_kobo,
    // Always present per the API contract; coerced so a catalogue service
    // that predates the field reads as "fixed price" rather than undefined.
    isNegotiable: !!p.is_negotiable,
    description: p.description ?? "",
    images: p.images ?? [],
    icon: meta.icon,
    tint: meta.tint,
  };
}

/**
 * Cross-vendor variant: each product in the list can belong to a different
 * store, so the store comes from a lookup map (built from the SearchStores
 * result that resolved the search scope) instead of one known store. A
 * product whose store_id isn't in the map is dropped rather than crashing —
 * shouldn't happen since storeIds passed to searchProducts always come from
 * that same SearchStores result, but a product is unusable without vendor
 * identity (name, slug, category icon) regardless.
 */
export function catalogueProductsToAppProducts(
  products: CatalogueProduct[],
  storeById: Map<string, StoreResult>,
): Product[] {
  const out: Product[] = [];
  for (const p of products) {
    const store = storeById.get(p.store_id);
    if (!store) continue;
    out.push(catalogueProductToAppProduct(p, store));
  }
  return out;
}
