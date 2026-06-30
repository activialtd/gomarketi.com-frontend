import { z } from "zod";

// ─── Business Schema ──────────────────────────────────────────────────────────

export const businessSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(120),
  businessType: z.enum(
    ["sole_trader", "partnership", "limited_company", "ngo"],
    { message: "Please select a business type" },
  ),
  employeeRange: z.enum(["1", "2-5", "6-20", "21-50", "50+"]).optional(),

  yearEstablished: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) =>
      val === "" || val === undefined ? undefined : Number(val),
    )
    .pipe(z.number().min(1900).max(new Date().getFullYear()).optional()),
});

// ─── Store Schema ─────────────────────────────────────────────────────────────

export const storeSchema = z.object({
  storeName: z
    .string()
    .min(2, "Store name must be at least 2 characters")
    .max(80),
  storeSlug: z
    .string()
    .min(3, "Store URL must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  storeTagline: z.string().max(100).optional(),
  supportPhone: z
    .string()
    .regex(
      /^(0|\+234)[789][01]\d{8}$/,
      "Must be a valid Nigerian phone number",
    ),
});

// ─── Store Setup Schema (Onboarding Step 1) ───────────────────────────────────

export const storeSetupSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(120, "Max 120 characters"),

  slug: z
    .string()
    .min(2, "Store URL must be at least 2 characters")
    .max(40, "Max 40 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),

  category: z.string().min(1, "Please select a store category"),

  currency: z.enum(["NGN", "USD"]),

  teamSize: z.string().optional(),

  businessPhone: z.string().optional(),
});

const variantOptionSchema = z.object({
  name: z.string().min(1, "Option name required"),
  values: z.array(z.string().min(1)).min(1, "Add at least one value"),
});

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Select a category"),
  collectionIds: z.array(z.string()).optional(),
  tags: z.string().optional(),

  price: z.coerce.number().min(1, "Enter a price"),
  compareAtPrice: z.coerce.number().optional(),
  costPerItem: z.coerce.number().optional(),

  hasVariants: z.boolean().default(false),
  variantOptions: z.array(variantOptionSchema).optional(),

  stock: z.coerce.number().min(0).default(0),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  trackInventory: z.boolean().default(true),
  weight: z.coerce.number().optional(),

  status: z.enum(["active", "draft"]).default("draft"),
  featured: z.boolean().default(false),

  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  slug: z.string().optional(),
});

export const createCollectionSchema = z.object({
  name: z.string().min(2, "Collection name must be at least 2 characters"),
  description: z.string().optional(),
  productIds: z.array(z.string()).min(1, "Add at least one product"),
  status: z.enum(["active", "draft"]).default("active"),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Max 60 characters"),
  description: z.string().max(200, "Max 200 characters").optional(),
  emoji: z.string().min(1, "Pick an emoji"),
  color: z.string().min(1, "Pick a color"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only")
    .optional(),
});

export const storeInfoSchema = z.object({
  storeName: z.string().min(2, "At least 2 characters").max(80),
  storeTagline: z.string().max(120).optional(),
  storePhone: z
    .string()
    .regex(/^(0|\+234)[789][01]\d{8}$/, "Enter a valid Nigerian number"),
  storeAddress: z.string().min(5, "Enter a full address"),
  storeCity: z.string().min(2, "Required"),
  storeState: z.string().min(2, "Required"),
});

export const ninSchema = z.object({
  nin: z
    .string()
    .length(11, "NIN must be exactly 11 digits")
    .regex(/^\d{11}$/, "NIN must contain only numbers"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export type NINValues = z.infer<typeof ninSchema>;

export type BusinessFormValues = z.infer<typeof businessSchema>;
export type StoreFormValues = z.infer<typeof storeSchema>;
export type StoreSetupFormValues = z.infer<typeof storeSetupSchema>;
export type CreateProductFormValues = z.infer<typeof createProductSchema>;
export type CreateCollectionFormValues = z.infer<typeof createCollectionSchema>;
export type CategoryFormValues = z.infer<typeof categorySchema>;
export type StoreInfoValues = z.infer<typeof storeInfoSchema>;
