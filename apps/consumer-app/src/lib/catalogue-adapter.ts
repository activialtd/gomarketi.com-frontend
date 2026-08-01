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
