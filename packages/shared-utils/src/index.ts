export const formatKobo = (amount: number) => `₦${(amount / 100).toFixed(2)}`;
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
