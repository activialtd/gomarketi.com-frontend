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
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
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
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80",
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
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80",
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

  // ── 2: Aso-Oke Set (now with colour variants) ──────────
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
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
    ],
    price: 85000,
    currency: "NGN",
    hasVariants: true,
    variantOptions: [
      {
        name: "Color",
        values: ["Royal Wine", "Gold Brocade", "Emerald Green"],
      },
    ],
    variants: [
      {
        id: "v-002-01",
        sku: "ASO-RW",
        options: { Color: "Royal Wine" },
        price: 85000,
        stock: 5,
      },
      {
        id: "v-002-02",
        sku: "ASO-GB",
        options: { Color: "Gold Brocade" },
        price: 92000,
        stock: 4,
      },
      {
        id: "v-002-03",
        sku: "ASO-EG",
        options: { Color: "Emerald Green" },
        price: 85000,
        stock: 5,
      },
    ],
    stock: 14,
    sold: 22,
    status: "active",
    featured: true,
    createdAt: "2026-04-02T09:00:00Z",
    weight: 1.2,
    tags: ["aso-oke", "wedding", "ceremony", "yoruba"],
  },

  // ── 3: Kaftan Dress (size + fabric variants) ───────────────────
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
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&q=80",
      "https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=600&q=80",
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

  // ── 4: Men's Senator (size + colour, gaps fixed: full 2XL row, full Navy XL) ──
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
      "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=600&q=80",
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&q=80",
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
        sku: "SEN-S-IW",
        options: { Size: "S", Color: "Ivory White" },
        price: 42000,
        stock: 3,
      },
      {
        id: "v-004-02",
        sku: "SEN-M-IW",
        options: { Size: "M", Color: "Ivory White" },
        price: 42000,
        stock: 6,
      },
      {
        id: "v-004-03",
        sku: "SEN-L-IW",
        options: { Size: "L", Color: "Ivory White" },
        price: 42000,
        stock: 8,
      },
      {
        id: "v-004-04",
        sku: "SEN-XL-IW",
        options: { Size: "XL", Color: "Ivory White" },
        price: 42000,
        stock: 4,
      },
      {
        id: "v-004-05",
        sku: "SEN-2X-IW",
        options: { Size: "2XL", Color: "Ivory White" },
        price: 44000,
        stock: 2,
      },
      {
        id: "v-004-06",
        sku: "SEN-M-NB",
        options: { Size: "M", Color: "Navy Blue" },
        price: 42000,
        stock: 3,
      },
      {
        id: "v-004-07",
        sku: "SEN-L-NB",
        options: { Size: "L", Color: "Navy Blue" },
        price: 42000,
        stock: 5,
      },
      {
        id: "v-004-08",
        sku: "SEN-XL-NB",
        options: { Size: "XL", Color: "Navy Blue" },
        price: 42000,
        stock: 3,
      },
      {
        id: "v-004-09",
        sku: "SEN-L-AG",
        options: { Size: "L", Color: "Ash Grey" },
        price: 44000,
        stock: 2,
      },
      {
        id: "v-004-10",
        sku: "SEN-XL-AG",
        options: { Size: "XL", Color: "Ash Grey" },
        price: 44000,
        stock: 0,
      },
      {
        id: "v-004-11",
        sku: "SEN-2X-AG",
        options: { Size: "2XL", Color: "Ash Grey" },
        price: 46000,
        stock: 0,
      },
    ],
    stock: 36,
    sold: 14,
    status: "active",
    featured: false,
    createdAt: "2026-05-30T08:00:00Z",
    weight: 0.9,
    tags: ["senator", "men", "linen", "classic"],
  },

  // ── 5: Agbada (draft, now with Size × Embroidery variants, all zero-stock) ─────────
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
      "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
    ],
    price: 95000,
    currency: "NGN",
    hasVariants: true,
    variantOptions: [
      { name: "Size", values: ["M", "L", "XL", "2XL"] },
      {
        name: "Embroidery",
        values: ["Classic Gold", "Silver Thread", "Minimal"],
      },
    ],
    variants: [
      {
        id: "v-005-01",
        sku: "AGB-M-CG",
        options: { Size: "M", Embroidery: "Classic Gold" },
        price: 95000,
        stock: 0,
      },
      {
        id: "v-005-02",
        sku: "AGB-L-CG",
        options: { Size: "L", Embroidery: "Classic Gold" },
        price: 95000,
        stock: 0,
      },
      {
        id: "v-005-03",
        sku: "AGB-XL-CG",
        options: { Size: "XL", Embroidery: "Classic Gold" },
        price: 98000,
        stock: 0,
      },
      {
        id: "v-005-04",
        sku: "AGB-L-ST",
        options: { Size: "L", Embroidery: "Silver Thread" },
        price: 102000,
        stock: 0,
      },
      {
        id: "v-005-05",
        sku: "AGB-XL-MN",
        options: { Size: "XL", Embroidery: "Minimal" },
        price: 89000,
        stock: 0,
      },
    ],
    stock: 0,
    sold: 6,
    status: "draft",
    featured: false,
    createdAt: "2026-06-01T16:00:00Z",
    weight: 1.8,
    tags: ["agbada", "men", "ceremony", "embroidered"],
  },

  // ── 6: Lace Blouse (size + colour, two combos back in stock) ─────────────────
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
      "https://images.unsplash.com/photo-1551048632-24e444b48a3e?w=600&q=80",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80",
    ],
    price: 18500,
    currency: "NGN",
    hasVariants: true,
    variantOptions: [
      { name: "Size", values: ["S", "M", "L", "XL"] },
      { name: "Color", values: ["Ivory", "Black"] },
    ],
    variants: [
      {
        id: "v-006-01",
        sku: "LBL-S-IV",
        options: { Size: "S", Color: "Ivory" },
        price: 18500,
        stock: 0,
      },
      {
        id: "v-006-02",
        sku: "LBL-M-IV",
        options: { Size: "M", Color: "Ivory" },
        price: 18500,
        stock: 3,
      },
      {
        id: "v-006-03",
        sku: "LBL-L-IV",
        options: { Size: "L", Color: "Ivory" },
        price: 18500,
        stock: 0,
      },
      {
        id: "v-006-04",
        sku: "LBL-XL-IV",
        options: { Size: "XL", Color: "Ivory" },
        price: 18500,
        stock: 0,
      },
      {
        id: "v-006-05",
        sku: "LBL-S-BK",
        options: { Size: "S", Color: "Black" },
        price: 18500,
        stock: 0,
      },
      {
        id: "v-006-06",
        sku: "LBL-M-BK",
        options: { Size: "M", Color: "Black" },
        price: 18500,
        stock: 2,
      },
      {
        id: "v-006-07",
        sku: "LBL-L-BK",
        options: { Size: "L", Color: "Black" },
        price: 18500,
        stock: 0,
      },
      {
        id: "v-006-08",
        sku: "LBL-XL-BK",
        options: { Size: "XL", Color: "Black" },
        price: 18500,
        stock: 0,
      },
    ],
    stock: 5,
    sold: 41,
    status: "active",
    featured: false,
    createdAt: "2026-01-20T10:00:00Z",
    weight: 0.4,
    tags: ["lace", "blouse", "women", "guipure"],
  },

  // ── 7: Kids' Ankara Set (age range + colour variants) ────────────────────────────
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
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80",
      "https://images.unsplash.com/photo-1604004555489-723a93d6ce74?w=600&q=80",
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
      {
        name: "Color",
        values: ["Sunset Orange", "Royal Blue", "Forest Green"],
      },
    ],
    variants: [
      {
        id: "v-007-01",
        sku: "KAP-2-4-SO",
        options: { "Age Range": "2–4yrs", Color: "Sunset Orange" },
        price: 9500,
        compareAtPrice: 12000,
        stock: 4,
      },
      {
        id: "v-007-02",
        sku: "KAP-4-6-SO",
        options: { "Age Range": "4–6yrs", Color: "Sunset Orange" },
        price: 9500,
        compareAtPrice: 12000,
        stock: 5,
      },
      {
        id: "v-007-03",
        sku: "KAP-6-8-SO",
        options: { "Age Range": "6–8yrs", Color: "Sunset Orange" },
        price: 10000,
        compareAtPrice: 12000,
        stock: 3,
      },
      {
        id: "v-007-04",
        sku: "KAP-2-4-RB",
        options: { "Age Range": "2–4yrs", Color: "Royal Blue" },
        price: 9500,
        compareAtPrice: 12000,
        stock: 6,
      },
      {
        id: "v-007-05",
        sku: "KAP-4-6-RB",
        options: { "Age Range": "4–6yrs", Color: "Royal Blue" },
        price: 9500,
        compareAtPrice: 12000,
        stock: 9,
      },
      {
        id: "v-007-06",
        sku: "KAP-8-10-RB",
        options: { "Age Range": "8–10yrs", Color: "Royal Blue" },
        price: 10000,
        compareAtPrice: 12000,
        stock: 6,
      },
      {
        id: "v-007-07",
        sku: "KAP-6-8-FG",
        options: { "Age Range": "6–8yrs", Color: "Forest Green" },
        price: 10000,
        compareAtPrice: 12000,
        stock: 6,
      },
      {
        id: "v-007-08",
        sku: "KAP-10-12-FG",
        options: { "Age Range": "10–12yrs", Color: "Forest Green" },
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

  // ── 8: Gele Head-tie (colour variants) ──────────────────────────
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
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
      "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80",
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
