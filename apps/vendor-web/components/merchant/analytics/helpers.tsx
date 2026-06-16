import { fmtK } from "@gomarket/shared-utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export const REVENUE_DATA = [
  { month: "Jan", revenue: 0, orders: 0 },
  { month: "Feb", revenue: 12400000, orders: 4 },
  { month: "Mar", revenue: 18700000, orders: 7 },
  { month: "Apr", revenue: 14200000, orders: 5 },
  { month: "May", revenue: 31500000, orders: 12 },
  { month: "Jun", revenue: 28900000, orders: 11 },
  { month: "Jul", revenue: 0, orders: 0 },
  { month: "Aug", revenue: 0, orders: 0 },
  { month: "Sep", revenue: 0, orders: 0 },
  { month: "Oct", revenue: 0, orders: 0 },
  { month: "Nov", revenue: 0, orders: 0 },
  { month: "Dec", revenue: 0, orders: 0 },
];

export const CATEGORY_DATA = [
  { name: "Fashion", value: 68, color: "#1A7A42" },
  { name: "Kids", value: 14, color: "#22c55e" },
  { name: "Accessories", value: 12, color: "#86efac" },
  { name: "Other", value: 6, color: "#e2e8f0" },
];

export const TOP_PRODUCTS = [
  { name: "Aso-Oke 3-Piece Set", revenue: 18700000, units: 22, trend: 12 },
  { name: "Ankara Crop Top", revenue: 14250000, units: 38, trend: 8 },
  { name: "Royal Agbada 3-Piece", revenue: 10500000, units: 6, trend: -3 },
  { name: "Men's Senator Suit", revenue: 9660000, units: 14, trend: 22 },
  { name: "Luxury Kaftan Dress", revenue: 7980000, units: 17, trend: 5 },
];

export const TRAFFIC_DATA = [
  { day: "Mon", visits: 142 },
  { day: "Tue", visits: 198 },
  { day: "Wed", visits: 176 },
  { day: "Thu", visits: 231 },
  { day: "Fri", visits: 289 },
  { day: "Sat", visits: 344 },
  { day: "Sun", visits: 201 },
];

export const RANGES = ["This week", "This month", "Last 3 months", "This year"];

export function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-[10px] border px-3.5 py-2.5 text-[12px]"
      style={{
        background: "#fff",
        borderColor: "#e2e8f0",
        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      }}
    >
      <p className="font-bold mb-1.5" style={{ color: "#6b7280" }}>
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: p.color }}
            />
            <span style={{ color: "#374151" }}>{p.name}</span>
          </div>
          <span className="font-bold" style={{ color: "#1C1C1C" }}>
            {p.name === "Revenue" ? fmtK(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
export function KPICard({
  label,
  value,
  change,
  positive,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div
      className="rounded-[14px] border p-4 flex flex-col gap-3"
      style={{ background: "#fff", borderColor: "#e2e8f0" }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-[9px] flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <div
          className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: positive ? "#dcfce7" : "#fee2e2",
            color: positive ? "#15803d" : "#dc2626",
          }}
        >
          {positive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {change}
        </div>
      </div>
      <div>
        <p
          className="text-[24px] font-extrabold leading-tight"
          style={{ color: "#1C1C1C", letterSpacing: "-0.5px" }}
        >
          {value}
        </p>
        <p
          className="text-[11px] font-semibold uppercase tracking-wide mt-0.5"
          style={{ color: "#94a3b8" }}
        >
          {label}
        </p>
        {sub && (
          <p className="text-[11px] mt-0.5" style={{ color: "#6b7280" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
