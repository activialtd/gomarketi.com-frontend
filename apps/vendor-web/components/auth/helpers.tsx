import useCountUp from "@/hooks/useCountUp";

export function StatCell({
  emoji,
  target,
  label,
  delay,
  isLast,
}: {
  emoji: string;
  target: number;
  label: string;
  delay: number;
  isLast: boolean;
}) {
  const value = useCountUp(target, 1400, delay);

  const display =
    label === "Customers"
      ? value >= 1000
        ? `${(value / 1000).toFixed(1)}k`
        : value.toString()
      : value.toString();

  return (
    <div
      className="flex flex-col items-center py-3"
      style={{ borderRight: !isLast ? "1px solid #f1f5f9" : undefined }}
    >
      <span className="text-[13px] mb-0.5">{emoji}</span>
      <span className="text-[15px] font-extrabold" style={{ color: "#1C1C1C" }}>
        {display}
      </span>
      <span
        className="text-[9px] font-bold uppercase tracking-[0.08em]"
        style={{ color: "#3D6B4F" }}
      >
        {label}
      </span>
    </div>
  );
}
