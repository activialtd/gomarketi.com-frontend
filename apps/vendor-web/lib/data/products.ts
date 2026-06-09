export type VariantOption = {
  name: string; // e.g. "Size", "Color", "Material"
  values: string[]; // e.g. ["S", "M", "L", "XL"]
};

export type Variant = {
  id: string;
  sku: string;
  options: Record<string, string>; // { Size: "M", Color: "Black" }
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  collectionIds: string[];
  description: string;
  images: string[]; // first image = thumbnail
  price: number; // base price (lowest variant or fixed)
  compareAtPrice?: number; // crossed-out price
  currency: "NGN";
  hasVariants: boolean;
  variantOptions?: VariantOption[];
  variants?: Variant[];
  stock: number; // total across all variants
  sold: number;
  status: "active" | "draft" | "out_of_stock" | "archived";
  featured: boolean;
  createdAt: string; // ISO date string
  weight?: number; // kg
  tags: string[];
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  productIds: string[];
  createdAt: string;
};

// ─── Collections ──────────────────────────────────────────────────────────────

export const COLLECTIONS: Collection[] = [
  {
    id: "col-001",
    name: "New Arrivals",
    slug: "new-arrivals",
    description: "Fresh pieces just landed in the store.",
    coverImage:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    productIds: ["prod-001", "prod-004", "prod-007"],
    createdAt: "2026-05-20T10:00:00Z",
  },
  {
    id: "col-002",
    name: "Bestsellers",
    slug: "bestsellers",
    description: "Customer favourites flying off the shelf.",
    coverImage:
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&q=80",
    productIds: ["prod-002", "prod-003", "prod-006"],
    createdAt: "2026-04-10T09:00:00Z",
  },
  {
    id: "col-003",
    name: "Aso-Oke & Ceremonial",
    slug: "aso-oke-ceremonial",
    description:
      "Handwoven luxury for weddings, naming ceremonies, and events.",
    coverImage:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80",
    productIds: ["prod-002", "prod-005", "prod-008"],
    createdAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "col-004",
    name: "Ready-to-Wear",
    slug: "ready-to-wear",
    description: "Everyday Nigerian fashion, ready off the rack.",
    coverImage:
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&q=80",
    productIds: ["prod-001", "prod-003", "prod-006", "prod-007"],
    createdAt: "2026-02-14T07:00:00Z",
  },
];

// ─── Products ─────────────────────────────────────────────────────────────────

export const PRODUCTS: Product[] = [
  // ── 1: Ankara Crop Top (with size + colour variants) ──
  {
    id: "prod-001",
    name: "Ankara Crop Top",
    slug: "ankara-crop-top",
    category: "fashion",
    collectionIds: ["col-001", "col-004"],
    description:
      "Vibrant wax-print crop top, fully lined with a hidden zip. Perfect for casual outings and owambe events.",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80",
    ],
    price: 12500,
    compareAtPrice: 15000,
    currency: "NGN",
    hasVariants: true,
    variantOptions: [
      { name: "Size", values: ["XS", "S", "M", "L", "XL"] },
      { name: "Color", values: ["Classic Blue", "Red Flame", "Earthy Brown"] },
    ],
    variants: [
      {
        id: "v-001-01",
        sku: "ANK-XS-CB",
        options: { Size: "XS", Color: "Classic Blue" },
        price: 12500,
        compareAtPrice: 15000,
        stock: 4,
      },
      {
        id: "v-001-02",
        sku: "ANK-S-CB",
        options: { Size: "S", Color: "Classic Blue" },
        price: 12500,
        compareAtPrice: 15000,
        stock: 8,
      },
      {
        id: "v-001-03",
        sku: "ANK-M-CB",
        options: { Size: "M", Color: "Classic Blue" },
        price: 12500,
        compareAtPrice: 15000,
        stock: 12,
      },
      {
        id: "v-001-04",
        sku: "ANK-L-CB",
        options: { Size: "L", Color: "Classic Blue" },
        price: 12500,
        compareAtPrice: 15000,
        stock: 6,
      },
      {
        id: "v-001-05",
        sku: "ANK-XL-CB",
        options: { Size: "XL", Color: "Classic Blue" },
        price: 12500,
        compareAtPrice: 15000,
        stock: 2,
      },
      {
        id: "v-001-06",
        sku: "ANK-S-RF",
        options: { Size: "S", Color: "Red Flame" },
        price: 12500,
        stock: 5,
      },
      {
        id: "v-001-07",
        sku: "ANK-M-RF",
        options: { Size: "M", Color: "Red Flame" },
        price: 12500,
        stock: 7,
      },
      {
        id: "v-001-08",
        sku: "ANK-L-RF",
        options: { Size: "L", Color: "Red Flame" },
        price: 12500,
        stock: 3,
      },
      {
        id: "v-001-09",
        sku: "ANK-M-EB",
        options: { Size: "M", Color: "Earthy Brown" },
        price: 13500,
        stock: 0,
      },
      {
        id: "v-001-10",
        sku: "ANK-L-EB",
        options: { Size: "L", Color: "Earthy Brown" },
        price: 13500,
        stock: 0,
      },
    ],
    stock: 47,
    sold: 38,
    status: "active",
    featured: true,
    createdAt: "2026-05-18T11:00:00Z",
    weight: 0.3,
    tags: ["ankara", "crop-top", "women", "casual"],
  },

  // ── 2: Aso-Oke Set (no variants, ceremonial) ──────────
  {
    id: "prod-002",
    name: "Aso-Oke 3-Piece Set",
    slug: "aso-oke-3-piece",
    category: "fashion",
    collectionIds: ["col-002", "col-003"],
    description:
      "Handwoven Yoruba Aso-Oke in gele, ipele, and iro. Available in made-to-order custom colours.",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
    ],
    price: 85000,
    currency: "NGN",
    hasVariants: false,
    stock: 14,
    sold: 22,
    status: "active",
    featured: true,
    createdAt: "2026-04-02T09:00:00Z",
    weight: 1.2,
    tags: ["aso-oke", "wedding", "ceremony", "yoruba"],
  },

  // ── 3: Kaftan Dress (size variants) ───────────────────
  {
    id: "prod-003",
    name: "Luxury Kaftan Dress",
    slug: "luxury-kaftan-dress",
    category: "fashion",
    collectionIds: ["col-002", "col-004"],
    description:
      "Flowing chiffon kaftan with hand-embroidered neckline. Lightweight and breathable for the Lagos heat.",
    images: [
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80",
    ],
    price: 28000,
    compareAtPrice: 34000,
    currency: "NGN",
    hasVariants: true,
    variantOptions: [
      { name: "Size", values: ["S/M", "L/XL", "2XL/3XL"] },
      { name: "Fabric", values: ["Chiffon", "Silk Blend"] },
    ],
    variants: [
      {
        id: "v-003-01",
        sku: "KAF-SM-CH",
        options: { Size: "S/M", Fabric: "Chiffon" },
        price: 28000,
        compareAtPrice: 34000,
        stock: 5,
      },
      {
        id: "v-003-02",
        sku: "KAF-LX-CH",
        options: { Size: "L/XL", Fabric: "Chiffon" },
        price: 28000,
        compareAtPrice: 34000,
        stock: 7,
      },
      {
        id: "v-003-03",
        sku: "KAF-2X-CH",
        options: { Size: "2XL/3XL", Fabric: "Chiffon" },
        price: 30000,
        compareAtPrice: 34000,
        stock: 3,
      },
      {
        id: "v-003-04",
        sku: "KAF-SM-SB",
        options: { Size: "S/M", Fabric: "Silk Blend" },
        price: 38000,
        stock: 2,
      },
      {
        id: "v-003-05",
        sku: "KAF-LX-SB",
        options: { Size: "L/XL", Fabric: "Silk Blend" },
        price: 38000,
        stock: 4,
      },
    ],
    stock: 21,
    sold: 17,
    status: "active",
    featured: false,
    createdAt: "2026-03-15T14:00:00Z",
    weight: 0.6,
    tags: ["kaftan", "dress", "women", "flowing"],
  },

  // ── 4: Men's Senator (size + colour) ──────────────────
  {
    id: "prod-004",
    name: "Men's Senator Suit",
    slug: "mens-senator-suit",
    category: "fashion",
    collectionIds: ["col-001"],
    description:
      "Classic two-piece senator with a matching cap. Cut from premium linen for a sharp, breathable look.",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    ],
    price: 42000,
    currency: "NGN",
    hasVariants: true,
    variantOptions: [
      { name: "Size", values: ["S", "M", "L", "XL", "2XL"] },
      { name: "Color", values: ["Ivory White", "Navy Blue", "Ash Grey"] },
    ],
    variants: [
      {
        id: "v-004-01",
        sku: "SEN-M-IW",
        options: { Size: "M", Color: "Ivory White" },
        price: 42000,
        stock: 6,
      },
      {
        id: "v-004-02",
        sku: "SEN-L-IW",
        options: { Size: "L", Color: "Ivory White" },
        price: 42000,
        stock: 8,
      },
      {
        id: "v-004-03",
        sku: "SEN-XL-IW",
        options: { Size: "XL", Color: "Ivory White" },
        price: 42000,
        stock: 4,
      },
      {
        id: "v-004-04",
        sku: "SEN-M-NB",
        options: { Size: "M", Color: "Navy Blue" },
        price: 42000,
        stock: 3,
      },
      {
        id: "v-004-05",
        sku: "SEN-L-NB",
        options: { Size: "L", Color: "Navy Blue" },
        price: 42000,
        stock: 5,
      },
      {
        id: "v-004-06",
        sku: "SEN-L-AG",
        options: { Size: "L", Color: "Ash Grey" },
        price: 44000,
        stock: 2,
      },
      {
        id: "v-004-07",
        sku: "SEN-XL-AG",
        options: { Size: "XL", Color: "Ash Grey" },
        price: 44000,
        stock: 0,
      },
    ],
    stock: 28,
    sold: 14,
    status: "active",
    featured: false,
    createdAt: "2026-05-30T08:00:00Z",
    weight: 0.9,
    tags: ["senator", "men", "linen", "classic"],
  },

  // ── 5: Agbada (draft — not yet published) ─────────────
  {
    id: "prod-005",
    name: "Royal Agbada 3-Piece",
    slug: "royal-agbada-3-piece",
    category: "fashion",
    collectionIds: ["col-003"],
    description:
      "Embroidered agbada with full babariga, sokoto, and cap. Made-to-order, allow 7–10 days.",
    images: [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80",
    ],
    price: 95000,
    currency: "NGN",
    hasVariants: false,
    stock: 0,
    sold: 6,
    status: "draft",
    featured: false,
    createdAt: "2026-06-01T16:00:00Z",
    weight: 1.8,
    tags: ["agbada", "men", "ceremony", "embroidered"],
  },

  // ── 6: Lace Blouse (out of stock) ─────────────────────
  {
    id: "prod-006",
    name: "Guipure Lace Blouse",
    slug: "guipure-lace-blouse",
    category: "fashion",
    collectionIds: ["col-002", "col-004"],
    description:
      "Premium French guipure lace blouse, fully lined. A wardrobe essential for every occasion.",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    ],
    price: 18500,
    currency: "NGN",
    hasVariants: true,
    variantOptions: [{ name: "Size", values: ["S", "M", "L", "XL"] }],
    variants: [
      {
        id: "v-006-01",
        sku: "LBL-S",
        options: { Size: "S" },
        price: 18500,
        stock: 0,
      },
      {
        id: "v-006-02",
        sku: "LBL-M",
        options: { Size: "M" },
        price: 18500,
        stock: 0,
      },
      {
        id: "v-006-03",
        sku: "LBL-L",
        options: { Size: "L" },
        price: 18500,
        stock: 0,
      },
      {
        id: "v-006-04",
        sku: "LBL-XL",
        options: { Size: "XL" },
        price: 18500,
        stock: 0,
      },
    ],
    stock: 0,
    sold: 41,
    status: "out_of_stock",
    featured: false,
    createdAt: "2026-01-20T10:00:00Z",
    weight: 0.4,
    tags: ["lace", "blouse", "women", "guipure"],
  },

  // ── 7: Kids' Ankara Set ────────────────────────────────
  {
    id: "prod-007",
    name: "Kids Ankara Party Set",
    slug: "kids-ankara-party-set",
    category: "kids",
    collectionIds: ["col-001", "col-004"],
    description:
      "Adorable two-piece ankara outfit for kids. Sizes 2–12 years. Perfect for owambe and birthday parties.",
    images: [
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80",
    ],
    price: 9500,
    compareAtPrice: 12000,
    currency: "NGN",
    hasVariants: true,
    variantOptions: [
      {
        name: "Age Range",
        values: ["2–4yrs", "4–6yrs", "6–8yrs", "8–10yrs", "10–12yrs"],
      },
    ],
    variants: [
      {
        id: "v-007-01",
        sku: "KAP-2-4",
        options: { "Age Range": "2–4yrs" },
        price: 9500,
        compareAtPrice: 12000,
        stock: 10,
      },
      {
        id: "v-007-02",
        sku: "KAP-4-6",
        options: { "Age Range": "4–6yrs" },
        price: 9500,
        compareAtPrice: 12000,
        stock: 14,
      },
      {
        id: "v-007-03",
        sku: "KAP-6-8",
        options: { "Age Range": "6–8yrs" },
        price: 10000,
        compareAtPrice: 12000,
        stock: 9,
      },
      {
        id: "v-007-04",
        sku: "KAP-8-10",
        options: { "Age Range": "8–10yrs" },
        price: 10000,
        compareAtPrice: 12000,
        stock: 6,
      },
      {
        id: "v-007-05",
        sku: "KAP-10-12",
        options: { "Age Range": "10–12yrs" },
        price: 10500,
        compareAtPrice: 12000,
        stock: 4,
      },
    ],
    stock: 43,
    sold: 29,
    status: "active",
    featured: true,
    createdAt: "2026-05-25T12:00:00Z",
    weight: 0.35,
    tags: ["kids", "ankara", "party", "children"],
  },

  // ── 8: Gele Head-tie ──────────────────────────────────
  {
    id: "prod-008",
    name: "Gele Head-tie",
    slug: "gele-head-tie",
    category: "accessories",
    collectionIds: ["col-003"],
    description:
      "Pre-tied ceremonial gele in satin-backed brocade. Arrives ready to wear. Perfect wedding guest gift.",
    images: [
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&q=80",
    ],
    price: 7500,
    currency: "NGN",
    hasVariants: true,
    variantOptions: [
      {
        name: "Color",
        values: ["Gold/Wine", "Gold/Navy", "Silver/Grey", "All Black"],
      },
    ],
    variants: [
      {
        id: "v-008-01",
        sku: "GEL-GW",
        options: { Color: "Gold/Wine" },
        price: 7500,
        stock: 15,
      },
      {
        id: "v-008-02",
        sku: "GEL-GN",
        options: { Color: "Gold/Navy" },
        price: 7500,
        stock: 12,
      },
      {
        id: "v-008-03",
        sku: "GEL-SG",
        options: { Color: "Silver/Grey" },
        price: 7500,
        stock: 8,
      },
      {
        id: "v-008-04",
        sku: "GEL-AB",
        options: { Color: "All Black" },
        price: 8000,
        stock: 6,
      },
    ],
    stock: 41,
    sold: 63,
    status: "active",
    featured: false,
    createdAt: "2026-02-08T10:00:00Z",
    weight: 0.2,
    tags: ["gele", "accessories", "headwear", "ceremony"],
  },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────

export const TOTAL_RETAIL_VALUE = PRODUCTS.filter(
  (p) => p.status !== "archived",
).reduce((sum, p) => sum + p.price * p.stock, 0);

export const TOTAL_INVENTORY_VALUE = PRODUCTS.filter(
  (p) => p.status !== "archived",
).reduce((sum, p) => sum + p.price * p.stock * 0.6, 0); // ~60% cost estimate

export const TOTAL_PRODUCTS_SOLD = PRODUCTS.reduce((sum, p) => sum + p.sold, 0);

export const TOTAL_OUT_OF_STOCK = PRODUCTS.filter((p) => p.stock === 0).length;
