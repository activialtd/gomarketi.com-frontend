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

  currency: z.literal("NGN"),

  teamSize: z.string().min(1, "Please select your team size"),

  staffRange: z.string().min(1, "Please select a staff range"),
});

export type BusinessFormValues = z.infer<typeof businessSchema>;
export type StoreFormValues = z.infer<typeof storeSchema>;
export type StoreSetupFormValues = z.infer<typeof storeSetupSchema>;
