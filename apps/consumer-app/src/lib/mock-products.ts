import { Ionicons } from "@expo/vector-icons";
import { TintKey } from "../theme/tokens";

/**
 * Placeholder catalog.
 * `images` are Unsplash CDN placeholders (free license) — REPLACE with your
 * product photography URLs from the API. If `images` is empty or fails to
 * load, the UI falls back to tint + icon automatically.
 * TODO(backend): GET /products, /products/:id
 */

export type Variant = { name: string; hex: string };

export type Product = {
  id: string;
  name: string;
  vendor: string;
  // Store identity — undefined for the local mock catalog below; real
  // catalogue products (via catalogue-adapter.ts) always carry this, since
  // checkout needs it to know which vendor each cart line belongs to.
  storeId?: string;
  storeSlug?: string;
  storeName?: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  unit: string;
  description: string;
  images: string[];
  icon: keyof typeof Ionicons.glyphMap;
  tint: TintKey;
  variants?: Variant[]; // e.g. colors
  sizes?: string[];
};

const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Hass Avocados",
    vendor: "Green Grocer",
    category: "groceries",
    price: 4.5,
    rating: 4.8,
    reviews: 214,
    unit: "pack of 4",
    description:
      "Creamy, ripe Hass avocados picked at peak season. Perfect for toast, salads, and guacamole. Stored cool and delivered same-day.",
    images: [
      u("photo-1523049673857-eb18f1d7b578"),
      u("photo-1519162808019-7de1683fa2ad"),
      u("photo-1601039641847-7857b994d704"),
    ],
    icon: "leaf-outline",
    tint: "produce",
  },
  {
    id: "p2",
    name: "Cold Brew Coffee",
    vendor: "Bean Bar",
    category: "drinks",
    price: 6.0,
    rating: 4.9,
    reviews: 187,
    unit: "500 ml bottle",
    description:
      "Slow-steeped for 18 hours for a smooth, low-acid finish. Single-origin beans, brewed and bottled fresh every morning.",
    images: [
      u("photo-1461023058943-07fcbe16d735"),
      u("photo-1517701550927-30cf4ba1dba5"),
    ],
    icon: "cafe-outline",
    tint: "drink",
  },
  {
    id: "p3",
    name: "Sourdough Loaf",
    vendor: "Rise Bakery",
    category: "bakery",
    price: 5.25,
    rating: 4.7,
    reviews: 156,
    unit: "800 g loaf",
    description:
      "Naturally leavened over 24 hours with a crackling crust and open crumb. Baked at dawn, delivered while still warm.",
    images: [
      u("photo-1585478259715-4d3a5f4b5c8a"),
      u("photo-1549931319-a545dcf3bc73"),
    ],
    icon: "pizza-outline",
    tint: "bakery",
  },
  {
    id: "p4",
    name: "Fresh Strawberries",
    vendor: "Green Grocer",
    category: "groceries",
    price: 3.75,
    rating: 4.6,
    reviews: 98,
    unit: "400 g punnet",
    description:
      "Sweet, deep-red strawberries from local farms. Picked this morning — wash and serve.",
    images: [
      u("photo-1464965911861-746a04b4bca6"),
      u("photo-1518635017498-87f514b751ba"),
    ],
    icon: "nutrition-outline",
    tint: "produce",
  },
  {
    id: "p5",
    name: "Running Sneakers",
    vendor: "Stride",
    category: "fashion",
    price: 79.0,
    rating: 4.5,
    reviews: 342,
    unit: "pair",
    description:
      "Lightweight everyday runners with responsive cushioning and a breathable knit upper. True to size.",
    images: [
      u("photo-1542291026-7eec264c27ff"),
      u("photo-1595950653106-6c9ebd614d3a"),
      u("photo-1600185365483-26d7a4cc7519"),
    ],
    icon: "footsteps-outline",
    tint: "fashion",
    variants: [
      { name: "Forest", hex: "#0A4D2A" },
      { name: "Sand", hex: "#D8C3A5" },
      { name: "Slate", hex: "#3D4451" },
      { name: "Cloud", hex: "#EDEDED" },
    ],
    sizes: ["40", "41", "42", "43", "44", "45"],
  },
  {
    id: "p6",
    name: "Vitamin C Tablets",
    vendor: "CareRx",
    category: "pharmacy",
    price: 12.0,
    rating: 4.4,
    reviews: 76,
    unit: "60 tablets",
    description:
      "1000mg vitamin C with rosehip for daily immune support. Sealed and pharmacy-verified.",
    images: [],
    icon: "medkit-outline",
    tint: "pharmacy",
  },
  {
    id: "p7",
    name: "Margherita Pizza",
    vendor: "Napoli",
    category: "food",
    price: 11.5,
    rating: 4.9,
    reviews: 501,
    unit: '12" pizza',
    description:
      "Wood-fired Neapolitan classic — San Marzano tomatoes, fior di latte, fresh basil. Made to order.",
    images: [
      u("photo-1574071318508-1cdbab80d002"),
      u("photo-1513104890138-7c749659a591"),
    ],
    icon: "restaurant-outline",
    tint: "bakery",
  },
  {
    id: "p8",
    name: "Scented Candle",
    vendor: "Hearth",
    category: "home",
    price: 18.0,
    rating: 4.6,
    reviews: 64,
    unit: "220 g soy wax",
    description:
      "Hand-poured soy candle with cedar and bergamot. Roughly 45 hours of burn time.",
    images: [
      u("photo-1602874801006-e26c4c5b5e8a"),
      u("photo-1603006905003-be475563bc59"),
    ],
    icon: "flame-outline",
    tint: "home",
    variants: [
      { name: "Cedar", hex: "#7A5C43" },
      { name: "Bergamot", hex: "#C9A94E" },
      { name: "Sea Salt", hex: "#9FB8C4" },
    ],
  },
  {
    id: "p9",
    name: "Bananas (bunch)",
    vendor: "Green Grocer",
    category: "groceries",
    price: 2.2,
    rating: 4.3,
    reviews: 41,
    unit: "6–7 fingers",
    description: "Naturally ripened bananas, ideal for snacking and smoothies.",
    images: [u("photo-1571771894821-ce9b6c11b08e")],
    icon: "nutrition-outline",
    tint: "produce",
  },
  {
    id: "p10",
    name: "Dark Chocolate",
    vendor: "Cacao Co.",
    category: "food",
    price: 4.0,
    rating: 4.8,
    reviews: 129,
    unit: "100 g bar, 70%",
    description:
      "Single-origin 70% dark chocolate, stone-ground in small batches. Notes of cherry and toasted nuts.",
    images: [
      u("photo-1549007994-cb92caebd54b"),
      u("photo-1511381939415-e44015466834"),
    ],
    icon: "square-outline",
    tint: "bakery",
  },
];

const SUGGESTIONS = ["avocado", "coffee", "pizza", "strawberries", "sneakers"];

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.vendor.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q),
  );
}

export function randomVoiceQuery(): string {
  return SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
}
