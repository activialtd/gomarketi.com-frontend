import { PaymentStatus } from "../../shared-types/src";

export const fmtK = (kobo: number): string => {
  const n = kobo / 100;
  if (n >= 1000000) return `₦${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₦${(n / 1000).toFixed(0)}k`;
  return `₦${n.toFixed(0)}`;
};
export const toKobo = (amount: number) => Math.round(amount * 100);

export const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

export const fmt = (n: number) => "₦" + n.toLocaleString("en-NG");

export const PRODUCTS_STATUS_CONFIG = {
  active: { label: "Active", bg: "#dcfce7", color: "#15803d" },
  draft: { label: "Draft", bg: "#f1f5f9", color: "#64748b" },
  out_of_stock: { label: "Out of stock", bg: "#fee2e2", color: "#dc2626" },
  archived: { label: "Archived", bg: "#f1f5f9", color: "#94a3b8" },
} as const;

export const ORDER_STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  delivered: { bg: "#dcfce7", color: "#15803d", label: "Delivered" },
  processing: { bg: "#fef3c7", color: "#92400e", label: "Processing" },
  shipped: { bg: "#dbeafe", color: "#1e40af", label: "Shipped" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
};

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export const PAYMENT_CFG: Record<
  PaymentStatus,
  { label: string; bg: string; color: string }
> = {
  paid: { label: "Paid", bg: "#dcfce7", color: "#15803d" },
  pending: { label: "Awaiting", bg: "#fef3c7", color: "#92400e" },
  failed: { label: "Failed", bg: "#fee2e2", color: "#dc2626" },
  refunded: { label: "Refunded", bg: "#f3f4f6", color: "#374151" },
};

export function fmtNaira(kobo: number): string {
  return (
    "₦" +
    (kobo / 100).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export const BANKS = [
  { code: "058", name: "GTBank" },
  { code: "011", name: "First Bank" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "044", name: "Access Bank" },
  { code: "014", name: "Union Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "000013", name: "Guaranty Trust Bank" },
  { code: "000019", name: "Ecobank Nigeria" },
  { code: "999240", name: "Opay" },
  { code: "999992", name: "Palmpay" },
  { code: "100004", name: "Paycom (Opay)" },
];

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];
