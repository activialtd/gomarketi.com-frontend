import { Ionicons } from "@expo/vector-icons";
import { TintKey } from "../theme/tokens";

/** Maps a backend store category to a display icon + tint + label. */
const CATEGORY_META: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; tint: TintKey; label: string }
> = {
  fashion: { icon: "shirt-outline", tint: "fashion", label: "Fashion" },
  thrift: { icon: "shirt-outline", tint: "thrift", label: "Thrift" },
  electronics: { icon: "hardware-chip-outline", tint: "electronics", label: "Electronics" },
  digital: { icon: "laptop-outline", tint: "electronics", label: "Digital" },
  groceries: { icon: "basket-outline", tint: "groceries", label: "Groceries" },
  food: { icon: "restaurant-outline", tint: "food", label: "Food" },
  jewelry: { icon: "diamond-outline", tint: "jewelry", label: "Jewelry" },
  beauty: { icon: "sparkles-outline", tint: "pharmacy", label: "Beauty" },
  health: { icon: "medkit-outline", tint: "pharmacy", label: "Health" },
  home: { icon: "home-outline", tint: "home", label: "Home" },
  sports: { icon: "basketball-outline", tint: "drink", label: "Sports" },
  books: { icon: "book-outline", tint: "bakery", label: "Books" },
  auto: { icon: "car-outline", tint: "home", label: "Auto" },
  kids: { icon: "happy-outline", tint: "produce", label: "Kids" },
  agriculture: { icon: "leaf-outline", tint: "produce", label: "Agriculture" },
  art: { icon: "color-palette-outline", tint: "bakery", label: "Art" },
  other: { icon: "storefront-outline", tint: "home", label: "Other" },
};

const DEFAULT_META = { icon: "storefront-outline" as const, tint: "home" as const, label: "Store" };

export function categoryMeta(category: string) {
  return CATEGORY_META[category] ?? DEFAULT_META;
}
