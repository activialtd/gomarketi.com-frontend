import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShippingMethod,
} from "@gomarket/shared-types";

export const RECENT_ORDERS = [
  {
    id: "#ORD-4821",
    customer: "Adaeze Okonkwo",
    product: "Ankara Crop Top",
    amount: "₦14,500",
    status: "delivered",
    date: "Today, 9:41am",
  },
  {
    id: "#ORD-4820",
    customer: "Emeka Nwosu",
    product: "Aso-Oke Set (2 pcs)",
    amount: "₦38,000",
    status: "processing",
    date: "Today, 8:12am",
  },
  {
    id: "#ORD-4819",
    customer: "Fatima Al-Hassan",
    product: "Kaftan Dress",
    amount: "₦22,750",
    status: "shipped",
    date: "Yesterday",
  },
  {
    id: "#ORD-4818",
    customer: "Chukwuemeka Eze",
    product: "Agbada 3-piece",
    amount: "₦67,000",
    status: "delivered",
    date: "Yesterday",
  },
  {
    id: "#ORD-4817",
    customer: "Ngozi Adeyemi",
    product: "Lace Blouse",
    amount: "₦9,800",
    status: "cancelled",
    date: "Jun 4",
  },
];

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  variantLabel?: string; // e.g. "Size: M / Color: Black"
  sku: string;
  quantity: number;
  unitPrice: number; // kobo
  totalPrice: number; // kobo
  image?: string;
};

export type Address = {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    isReturning: boolean;
  };
  items: OrderItem[];
  subtotal: number; // kobo
  shipping: number; // kobo
  discount: number; // kobo
  total: number; // kobo
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  shippingMethod: ShippingMethod;
  shippingAddress?: Address;
  trackingNumber?: string;
  note?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type AbandonedOrder = {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  lastActivity: string; // ISO
  recoveryEmailSent: boolean;
  recoveryEmailSentAt?: string;
  recoverySMSSent: boolean;
  recovered: boolean;
  recoveredAt?: string;
  source: "storefront" | "whatsapp" | "direct";
};

export const ORDERS: Order[] = [
  {
    id: "ord-001",
    orderNumber: "#ORD-4821",
    customer: {
      id: "cus-1",
      name: "Adaeze Okonkwo",
      email: "adaeze@gmail.com",
      phone: "08031234567",
      isReturning: true,
    },
    items: [
      {
        id: "oi-1",
        productId: "prod-001",
        productName: "Ankara Crop Top",
        variantLabel: "Size: M / Color: Classic Blue",
        sku: "ANK-M-CB",
        quantity: 2,
        unitPrice: 1250000,
        totalPrice: 2500000,
        image:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=80",
      },
    ],
    subtotal: 2500000,
    shipping: 150000,
    discount: 0,
    total: 2650000,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "card",
    paymentRef: "PSK_ref_abc123",
    shippingMethod: "delivery",
    shippingAddress: {
      name: "Adaeze Okonkwo",
      phone: "08031234567",
      street: "14 Bode Thomas Street",
      city: "Surulere",
      state: "Lagos",
    },
    trackingNumber: "GIG-00144821",
    tags: ["vip", "repeat"],
    createdAt: "2026-06-06T09:41:00Z",
    updatedAt: "2026-06-06T14:22:00Z",
  },
  {
    id: "ord-002",
    orderNumber: "#ORD-4820",
    customer: {
      id: "cus-2",
      name: "Emeka Nwosu",
      email: "emeka.n@yahoo.com",
      phone: "07025671234",
      isReturning: false,
    },
    items: [
      {
        id: "oi-2",
        productId: "prod-002",
        productName: "Aso-Oke 3-Piece Set",
        sku: "ASO-001",
        quantity: 1,
        unitPrice: 8500000,
        totalPrice: 8500000,
        image:
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=120&q=80",
      },
    ],
    subtotal: 8500000,
    shipping: 300000,
    discount: 0,
    total: 8800000,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "transfer",
    paymentRef: "TRF_9928811",
    shippingMethod: "delivery",
    shippingAddress: {
      name: "Emeka Nwosu",
      phone: "07025671234",
      street: "Plot 33, Trans Amadi Industrial Layout",
      city: "Port Harcourt",
      state: "Rivers",
    },
    note: "Please wrap nicely — wedding gift",
    tags: ["wedding"],
    createdAt: "2026-06-06T08:12:00Z",
    updatedAt: "2026-06-06T08:45:00Z",
  },
  {
    id: "ord-003",
    orderNumber: "#ORD-4819",
    customer: {
      id: "cus-3",
      name: "Fatima Al-Hassan",
      email: "fatima.alh@gmail.com",
      phone: "08166789012",
      isReturning: true,
    },
    items: [
      {
        id: "oi-3",
        productId: "prod-003",
        productName: "Luxury Kaftan Dress",
        variantLabel: "Size: L/XL / Fabric: Chiffon",
        sku: "KAF-LX-CH",
        quantity: 1,
        unitPrice: 2800000,
        totalPrice: 2800000,
        image:
          "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=120&q=80",
      },
    ],
    subtotal: 2800000,
    shipping: 150000,
    discount: 280000,
    total: 2670000,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    shippingMethod: "express",
    shippingAddress: {
      name: "Fatima Al-Hassan",
      phone: "08166789012",
      street: "72 Sultan Road",
      city: "Kaduna",
      state: "Kaduna",
    },
    trackingNumber: "DHL-773901",
    tags: [],
    createdAt: "2026-06-05T17:30:00Z",
    updatedAt: "2026-06-06T07:00:00Z",
  },
  {
    id: "ord-004",
    orderNumber: "#ORD-4818",
    customer: {
      id: "cus-4",
      name: "Chukwuemeka Eze",
      email: "c.eze@work.ng",
      phone: "09012345678",
      isReturning: true,
    },
    items: [
      {
        id: "oi-4a",
        productId: "prod-005",
        productName: "Royal Agbada 3-Piece",
        sku: "AGB-001",
        quantity: 1,
        unitPrice: 9500000,
        totalPrice: 9500000,
        image:
          "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=120&q=80",
      },
      {
        id: "oi-4b",
        productId: "prod-008",
        productName: "Gele Head-tie",
        variantLabel: "Color: Gold/Wine",
        sku: "GEL-GW",
        quantity: 2,
        unitPrice: 750000,
        totalPrice: 1500000,
        image:
          "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=120&q=80",
      },
    ],
    subtotal: 11000000,
    shipping: 0,
    discount: 500000,
    total: 10500000,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "transfer",
    shippingMethod: "pickup",
    note: "Customer will collect in person on Saturday",
    tags: ["vip", "bulk"],
    createdAt: "2026-06-05T11:00:00Z",
    updatedAt: "2026-06-06T10:00:00Z",
  },
  {
    id: "ord-005",
    orderNumber: "#ORD-4817",
    customer: {
      id: "cus-5",
      name: "Ngozi Adeyemi",
      email: "ngozi.a@hotmail.com",
      phone: "08099876543",
      isReturning: false,
    },
    items: [
      {
        id: "oi-5",
        productId: "prod-006",
        productName: "Guipure Lace Blouse",
        variantLabel: "Size: M",
        sku: "LBL-M",
        quantity: 1,
        unitPrice: 1850000,
        totalPrice: 1850000,
        image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=120&q=80",
      },
    ],
    subtotal: 1850000,
    shipping: 150000,
    discount: 0,
    total: 2000000,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "card",
    shippingMethod: "delivery",
    shippingAddress: {
      name: "Ngozi Adeyemi",
      phone: "08099876543",
      street: "5 Awolowo Way",
      city: "Ikoyi",
      state: "Lagos",
    },
    note: "Customer changed mind — full refund issued",
    tags: [],
    createdAt: "2026-06-04T14:00:00Z",
    updatedAt: "2026-06-04T16:30:00Z",
  },
  {
    id: "ord-006",
    orderNumber: "#ORD-4816",
    customer: {
      id: "cus-6",
      name: "Bola Tinubu-Martins",
      email: "bola.tm@gmail.com",
      phone: "07031122334",
      isReturning: true,
    },
    items: [
      {
        id: "oi-6a",
        productId: "prod-007",
        productName: "Kids Ankara Party Set",
        variantLabel: "Age: 4–6yrs",
        sku: "KAP-4-6",
        quantity: 3,
        unitPrice: 950000,
        totalPrice: 2850000,
        image:
          "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=120&q=80",
      },
      {
        id: "oi-6b",
        productId: "prod-007",
        productName: "Kids Ankara Party Set",
        variantLabel: "Age: 6–8yrs",
        sku: "KAP-6-8",
        quantity: 2,
        unitPrice: 1000000,
        totalPrice: 2000000,
      },
    ],
    subtotal: 4850000,
    shipping: 200000,
    discount: 485000,
    total: 4565000,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "transfer",
    shippingMethod: "delivery",
    shippingAddress: {
      name: "Bola Tinubu-Martins",
      phone: "07031122334",
      street: "10 Ademola Adetokunbo Crescent",
      city: "Wuse II",
      state: "FCT Abuja",
    },
    tags: ["bulk"],
    createdAt: "2026-06-06T11:55:00Z",
    updatedAt: "2026-06-06T11:55:00Z",
  },
  {
    id: "ord-007",
    orderNumber: "#ORD-4815",
    customer: {
      id: "cus-7",
      name: "Taiwo Akinwande",
      email: "taiwo.a@ng.com",
      phone: "08155443322",
      isReturning: false,
    },
    items: [
      {
        id: "oi-7",
        productId: "prod-004",
        productName: "Men's Senator Suit",
        variantLabel: "Size: L / Color: Ivory White",
        sku: "SEN-L-IW",
        quantity: 1,
        unitPrice: 4200000,
        totalPrice: 4200000,
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
      },
    ],
    subtotal: 4200000,
    shipping: 150000,
    discount: 0,
    total: 4350000,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "card",
    paymentRef: "PSK_ref_def456",
    shippingMethod: "delivery",
    shippingAddress: {
      name: "Taiwo Akinwande",
      phone: "08155443322",
      street: "23 Allen Avenue",
      city: "Ikeja",
      state: "Lagos",
    },
    tags: [],
    createdAt: "2026-06-05T09:10:00Z",
    updatedAt: "2026-06-05T10:30:00Z",
  },
];

export const ABANDONED_ORDERS: AbandonedOrder[] = [
  {
    id: "ab-001",
    customer: {
      name: "Chisom Eze",
      email: "chisom.e@gmail.com",
      phone: "08021234567",
    },
    items: [
      {
        id: "ab-oi-1",
        productId: "prod-001",
        productName: "Ankara Crop Top",
        variantLabel: "Size: M / Color: Red Flame",
        sku: "ANK-M-RF",
        quantity: 1,
        unitPrice: 1250000,
        totalPrice: 1250000,
        image:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&q=80",
      },
    ],
    subtotal: 1250000,
    lastActivity: "2026-06-06T07:30:00Z",
    recoveryEmailSent: true,
    recoveryEmailSentAt: "2026-06-06T08:00:00Z",
    recoverySMSSent: false,
    recovered: false,
    source: "storefront",
  },
  {
    id: "ab-002",
    customer: {
      name: "Kemi Adesanya",
      email: "kemi.a@yahoo.com",
      phone: "07033456789",
    },
    items: [
      {
        id: "ab-oi-2a",
        productId: "prod-003",
        productName: "Luxury Kaftan Dress",
        variantLabel: "Size: S/M / Fabric: Silk Blend",
        sku: "KAF-SM-SB",
        quantity: 1,
        unitPrice: 3800000,
        totalPrice: 3800000,
        image:
          "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=120&q=80",
      },
      {
        id: "ab-oi-2b",
        productId: "prod-008",
        productName: "Gele Head-tie",
        variantLabel: "Color: Gold/Navy",
        sku: "GEL-GN",
        quantity: 1,
        unitPrice: 750000,
        totalPrice: 750000,
      },
    ],
    subtotal: 4550000,
    lastActivity: "2026-06-05T18:45:00Z",
    recoveryEmailSent: false,
    recoverySMSSent: false,
    recovered: false,
    source: "whatsapp",
  },
  {
    id: "ab-003",
    customer: {
      name: "Musa Ibrahim",
      email: "musa.ib@gmail.com",
      phone: "08099001122",
    },
    items: [
      {
        id: "ab-oi-3",
        productId: "prod-004",
        productName: "Men's Senator Suit",
        variantLabel: "Size: XL / Color: Navy Blue",
        sku: "SEN-XL-NB",
        quantity: 1,
        unitPrice: 4200000,
        totalPrice: 4200000,
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
      },
    ],
    subtotal: 4200000,
    lastActivity: "2026-06-05T12:00:00Z",
    recoveryEmailSent: true,
    recoveryEmailSentAt: "2026-06-05T12:30:00Z",
    recoverySMSSent: true,
    recovered: true,
    recoveredAt: "2026-06-05T14:10:00Z",
    source: "storefront",
  },
  {
    id: "ab-004",
    customer: {
      name: "Amaka Obi",
      email: "amaka.obi@outlook.com",
      phone: "08122334455",
    },
    items: [
      {
        id: "ab-oi-4",
        productId: "prod-002",
        productName: "Aso-Oke 3-Piece Set",
        sku: "ASO-001",
        quantity: 1,
        unitPrice: 8500000,
        totalPrice: 8500000,
        image:
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=120&q=80",
      },
    ],
    subtotal: 8500000,
    lastActivity: "2026-06-04T20:00:00Z",
    recoveryEmailSent: false,
    recoverySMSSent: false,
    recovered: false,
    source: "direct",
  },
  {
    id: "ab-005",
    customer: {
      name: "Segun Adeleke",
      email: "segun.adeleke@gmail.com",
      phone: "07011223344",
    },
    items: [
      {
        id: "ab-oi-5a",
        productId: "prod-007",
        productName: "Kids Ankara Party Set",
        variantLabel: "Age: 2–4yrs",
        sku: "KAP-2-4",
        quantity: 2,
        unitPrice: 950000,
        totalPrice: 1900000,
        image:
          "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=120&q=80",
      },
      {
        id: "ab-oi-5b",
        productId: "prod-007",
        productName: "Kids Ankara Party Set",
        variantLabel: "Age: 4–6yrs",
        sku: "KAP-4-6",
        quantity: 1,
        unitPrice: 950000,
        totalPrice: 950000,
      },
    ],
    subtotal: 2850000,
    lastActivity: "2026-06-04T16:00:00Z",
    recoveryEmailSent: true,
    recoveryEmailSentAt: "2026-06-04T16:30:00Z",
    recoverySMSSent: false,
    recovered: false,
    source: "storefront",
  },
];

export const ORDER_STATS = {
  total: ORDERS.length,
  pending: ORDERS.filter((o) => o.status === "pending").length,
  processing: ORDERS.filter((o) => o.status === "processing").length,
  shipped: ORDERS.filter((o) => o.status === "shipped").length,
  delivered: ORDERS.filter((o) => o.status === "delivered").length,
  cancelled: ORDERS.filter((o) => o.status === "cancelled").length,
  totalRevenue: ORDERS.filter((o) => o.paymentStatus === "paid").reduce(
    (s, o) => s + o.total,
    0,
  ),
};

export const ABANDONED_STATS = {
  total: ABANDONED_ORDERS.length,
  recovered: ABANDONED_ORDERS.filter((o) => o.recovered).length,
  pending: ABANDONED_ORDERS.filter((o) => !o.recovered).length,
  totalValue: ABANDONED_ORDERS.filter((o) => !o.recovered).reduce(
    (s, o) => s + o.subtotal,
    0,
  ),
  recoveryRate: Math.round(
    (ABANDONED_ORDERS.filter((o) => o.recovered).length /
      ABANDONED_ORDERS.length) *
      100,
  ),
};
