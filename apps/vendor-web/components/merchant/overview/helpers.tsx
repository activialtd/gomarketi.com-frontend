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
        <div key={i} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: p.color }}
            />
            <span style={{ color: "#374151" }}>{p.name}</span>
          </div>
          <span className="font-bold tabular-nums" style={{ color: "#1C1C1C" }}>
            ₦{p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
