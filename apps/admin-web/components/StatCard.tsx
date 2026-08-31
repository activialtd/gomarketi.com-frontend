export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  hint?: string;
}) {
  return (
    <div className="card flex items-start justify-between p-4">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-soft">{label}</p>
        <p className="mt-1.5 truncate text-[22px] font-extrabold leading-none text-foreground">{value}</p>
        {hint && <p className="mt-1.5 text-[11.5px] text-muted">{hint}</p>}
      </div>
      {Icon && (
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px]"
          style={{ background: "var(--input)" }}
        >
          <Icon className="h-[16px] w-[16px]" style={{ color: "var(--primary-soft)" }} />
        </div>
      )}
    </div>
  );
}
