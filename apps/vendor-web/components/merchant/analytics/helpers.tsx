// ─── KPI Card ─────────────────────────────────────────────────────────────────
export function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
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
      <div
        className="w-9 h-9 rounded-[9px] flex items-center justify-center"
        style={{ background: iconBg }}
      >
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
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
