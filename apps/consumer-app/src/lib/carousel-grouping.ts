import { CatalogueProduct, StoreResult } from "./api-client";

export type CarouselItem = {
  store: StoreResult;
  product: CatalogueProduct;
};

// buildCarouselData groups cross-vendor results by store and picks one
// random product per vendor, so the carousel reads as "here's who else has
// this" instead of repeating one vendor's whole catalog. Vendors with zero
// matches are dropped. Pure and RNG-injectable so it's testable without a
// React Native runtime — same shape as groupCartByStore in checkout-grouping.ts,
// and kept in its own file for the same reason: CatalogueProduct/StoreResult
// are used here only as types (elided at build time), so this module never
// pulls in api-client.ts's runtime (Expo Constants/SecureStore) the way
// importing it alongside resolveSearchScope/searchProductsAcrossStores would.
export function buildCarouselData(
  products: CatalogueProduct[],
  stores: StoreResult[],
  rng: () => number = Math.random,
): CarouselItem[] {
  const storeById = new Map(stores.map((s) => [s.id, s]));
  const byStore = new Map<string, CatalogueProduct[]>();
  for (const p of products) {
    const list = byStore.get(p.store_id);
    if (list) list.push(p);
    else byStore.set(p.store_id, [p]);
  }

  const items: CarouselItem[] = [];
  for (const [storeId, storeProducts] of byStore) {
    const store = storeById.get(storeId);
    if (!store) continue; // shouldn't happen — storeIds came from allStores
    const pick = storeProducts[Math.floor(rng() * storeProducts.length)];
    items.push({ store, product: pick });
  }
  return items;
}
