"use client";

import * as React from "react";
import { ResponsiveContainer, Tooltip, type TooltipProps } from "recharts";
import { cn } from "./utils";

export type ChartConfig = Record<
  string,
  {
    label: string;
    color?: string;
    icon?: React.ComponentType<{ className?: string }>;
  }
>;

type ChartContextValue = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChartContext() {
  const ctx = React.useContext(ChartContext);
  if (!ctx)
    throw new Error("useChartContext must be used within ChartContainer");
  return ctx;
}

const CHART_COLORS = [
  "#1A7A42", // primary green
  "#22c55e", // accent green
  "#86efac", // light green
  "#0A4D2A", // deep green
  "#3b82f6", // blue accent
  "#f59e0b", // amber
  "#e2e8f0", // border (for empty/bg bars)
] as const;

function resolveColor(config: ChartConfig, key: string, index: number): string {
  return config[key]?.color ?? CHART_COLORS[index % CHART_COLORS.length];
}

function buildColorVars(config: ChartConfig): React.CSSProperties {
  return Object.fromEntries(
    Object.entries(config).map(([key, val], i) => [
      `--color-${key}`,
      resolveColor(config, key, i),
    ]),
  ) as React.CSSProperties;
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactElement;
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, children, className, ...props }, ref) => (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn("w-full", className)}
        style={buildColorVars(config)}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  ),
);
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = Tooltip;

interface ChartTooltipContentProps extends Omit<
  TooltipProps<number, string>,
  "content"
> {
  active?: boolean;
  payload?: any[];
  label?: any;
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "dot" | "line" | "dashed";
  labelKey?: string;
  nameKey?: string;
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      label,
      className,
      hideLabel = false,
      hideIndicator = false,
      indicator = "dot",
      labelKey,
      nameKey,
    },
    ref,
  ) => {
    const { config } = useChartContext();
    if (!active || !payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "min-w-[120px] rounded-[10px] border px-3 py-2.5 shadow-lg text-[12px]",
          className,
        )}
        style={{
          background: "#ffffff",
          borderColor: "#e2e8f0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
        }}
      >
        {/* Label row */}
        {!hideLabel && label && (
          <p
            className="mb-1.5 font-semibold text-[11px] uppercase tracking-wide"
            style={{ color: "#6b7280" }}
          >
            {labelKey ? (config[labelKey]?.label ?? label) : label}
          </p>
        )}

        {/* Data rows */}
        <div className="space-y-1">
          {payload.map((entry: any, i: number) => {
            const key = (
              nameKey
                ? String(entry[nameKey as keyof typeof entry])
                : entry.dataKey
            ) as string;
            const itemConfig = config[key];
            const color = entry.color ?? resolveColor(config, key, i);

            return (
              <div
                key={key}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-1.5">
                  {!hideIndicator && (
                    <>
                      {indicator === "dot" && (
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: color }}
                        />
                      )}
                      {indicator === "line" && (
                        <div
                          className="w-3 h-0.5 rounded-full shrink-0"
                          style={{ background: color }}
                        />
                      )}
                      {indicator === "dashed" && (
                        <div
                          className="w-3 shrink-0 border-t-2 border-dashed"
                          style={{ borderColor: color }}
                        />
                      )}
                    </>
                  )}
                  <span style={{ color: "#374151" }}>
                    {itemConfig?.label ?? key}
                  </span>
                </div>
                <span
                  className="font-bold tabular-nums"
                  style={{ color: "#1C1C1C" }}
                >
                  {typeof entry.value === "number"
                    ? entry.value.toLocaleString()
                    : entry.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltipContent";

// ─── ChartLegend (pass-through + styled content) ─────────────────────────────

import { Legend, type LegendProps } from "recharts";

const ChartLegend = Legend;

interface ChartLegendContentProps extends LegendProps {
  payload?: any[];
  className?: string;
  nameKey?: string;
}

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContentProps
>(({ payload, nameKey, className }, ref) => {
  const { config } = useChartContext();
  if (!payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-wrap items-center justify-center gap-4 pt-3",
        className,
      )}
    >
      {payload.map((entry: any, i: number) => {
        const key = (
          nameKey ? String((entry as any)[nameKey]) : entry.dataKey
        ) as string;
        const itemConfig = config[key];
        const color = (entry as any).color ?? resolveColor(config, key, i);

        return (
          <div
            key={key}
            className="flex items-center gap-1.5 text-[12px] font-medium"
            style={{ color: "#374151" }}
          >
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ background: color }}
            />
            {itemConfig?.label ?? key}
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegendContent";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  CHART_COLORS,
};
