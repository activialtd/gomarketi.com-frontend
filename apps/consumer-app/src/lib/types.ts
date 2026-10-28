import { Ionicons } from "@expo/vector-icons";
import { TintKey } from "../theme/tokens";

/**
 * A product as the app displays and carts it — always built from a real
 * catalogue product by catalogue-adapter.ts (or from an offer, see
 * offerToProduct in offers.ts). Money is integer kobo, exactly as the API
 * sends it.
 *
 * Only fields the API actually provides live here. Ratings, review counts,
 * units, colour swatches and sizes used to sit on this type for a placeholder
 * catalogue; the catalogue has none of them, so the UI that showed them went
 * with it.
 */
export type Product = {
  id: string;
  name: string;
  /** Store display name — what cards show under the product name. */
  vendor: string;
  // Store identity: checkout needs it to know which vendor each cart line
  // belongs to, and the delivery options are looked up by slug.
  storeId: string;
  storeSlug?: string;
  storeName?: string;
  category: string;
  priceKobo: number;
  /** The vendor accepts offers on this product ("Make an offer"). */
  isNegotiable: boolean;
  description: string;
  images: string[];
  icon: keyof typeof Ionicons.glyphMap;
  tint: TintKey;
};
