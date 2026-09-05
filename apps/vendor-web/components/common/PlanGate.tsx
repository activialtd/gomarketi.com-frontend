"use client";

import { Lock, Zap } from "lucide-react";

// Order matters — higher index = higher tier. Missing "scale" here used to
// make planGte("scale", "starter") evaluate the unknown key as 0 and
// incorrectly gate Scale-tier vendors out of Starter-tier features.
const PLAN_ORDER: Record<string, number> = { free: 0, starter: 1, growth: 2, scale: 3 };

export function planGte(current: string | undefined, required: string) {
  return (PLAN_ORDER[current ?? "free"] ?? 0) >= (PLAN_ORDER[required] ?? 0);
}

// Compact, dashed-border card — fits inside a grid cell or narrow column in
// place of a locked option (e.g. a customization setting the current plan
// doesn't unlock).
export function UpgradeLockCard({ label, message }: { label: string; message?: string }) {
  return (
    <div
      className="rounded-[8px] border border-dashed p-3 flex flex-col items-center gap-1.5 text-center"
      style={{ borderColor: "#e2e8f0", background: "#fafafa" }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center"
        style={{ background: "#fef3c7" }}
      >
        <Lock className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
      </div>
      <p className="text-[11px] font-bold" style={{ color: "#374151" }}>{label}</p>
      {message && (
        <p className="text-[10px]" style={{ color: "#6b7280" }}>{message}</p>
      )}
      <a
        href="/merchant/plans"
        className="text-[10px] font-bold px-3 py-1 rounded-[5px] text-white"
        style={{ background: "#1A7A42" }}
      >
        Upgrade <Zap className="w-2.5 h-2.5 inline" />
      </a>
    </div>
  );
}

// Full-width horizontal banner — for a limit hit mid-page (product/team
// count reached), where the compact vertical card would feel cramped
// squeezed into a toolbar or header row.
export function UpgradeBanner({ label, message }: { label: string; message?: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-[10px] border p-3.5"
      style={{ borderColor: "#fde68a", background: "#fffbeb" }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "#fef3c7" }}
      >
        <Lock className="w-4 h-4" style={{ color: "#f59e0b" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-bold" style={{ color: "#92400e" }}>{label}</p>
        {message && (
          <p className="text-[11px] mt-0.5" style={{ color: "#b45309" }}>{message}</p>
        )}
      </div>
      <a
        href="/merchant/plans"
        className="flex items-center gap-1 text-[12px] font-bold px-3.5 py-2 rounded-[8px] text-white shrink-0 transition-all active:scale-[0.98]"
        style={{ background: "#0A2E1A" }}
      >
        Upgrade <Zap className="w-3 h-3" />
      </a>
    </div>
  );
}

// Conditionally renders children only when `current` plan meets `required`;
// otherwise shows the compact locked card in their place. Pass no children
// to use purely as a standalone "you've hit a limit" notice.
export function PlanGate({
  required,
  current,
  label,
  children,
}: {
  required: string;
  current?: string;
  label?: string;
  children?: React.ReactNode;
}) {
  if (planGte(current, required)) return <>{children}</>;
  const planLabel = required.charAt(0).toUpperCase() + required.slice(1);
  return <UpgradeLockCard label={label ?? `${planLabel} plan required`} />;
}
