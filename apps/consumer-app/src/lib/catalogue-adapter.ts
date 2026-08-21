import { CatalogueProduct, StoreResult } from "./api-client";
import { Product } from "./mock-products";
import { NGN_RATE } from "./cart-context";
import { categoryMeta } from "./store-category";

/**
 * cart-context multiplies Product.price by NGN_RATE to display Naira
 * (it was built assuming a fake USD catalog). Real products are priced in
 * kobo, so the price handed to Product here is pre-divided by NGN_RATE to
 * compensate — the displayed Naira amount still comes out correct without
 * touching the cart's pricing model.
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
    price: p.price_kobo / 100 / NGN_RATE,
    rating: 4.5,
    reviews: 0,
    unit: "unit",
    description: p.description ?? "",
    images: p.images,
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
