"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  Package,
  Loader2,
  BarChart3,
} from "lucide-react";
import { fmtK } from "@gomarket/shared-utils";
import { analyticsApi, type AnalyticsOverviewResp, type TopProductResp } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { KPICard } from "./helpers";

export default function Analytics() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [overview, setOverview] = useState<AnalyticsOverviewResp | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductResp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    Promise.all([
      analyticsApi.getOverview(accessToken),
      analyticsApi.getTopProducts(5, accessToken),
    ])
      .then(([ov, products]) => {
        if (cancelled) return;
        setOverview(ov);
        setTopProducts(products);
      })
      .catch(() => {
        if (!cancelled) {
          setOverview(null);
          setTopProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="px-6 lg:px-8 py-4 border-b flex flex-wrap items-center justify-between gap-3"
        style={{ background: "#fff", borderColor: "#e2e8f0" }}
      >
        <h1
          className="text-[20px] font-extrabold"
          style={{ color: "#1C1C1C", letterSpacing: "-0.3px" }}
        >
          Analytics
        </h1>
      </div>

      <div className="px-6 lg:px-8 py-5 space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Total revenue"
            value={loading ? "—" : fmtK(overview?.total_revenue_kobo ?? 0)}
            sub="Delivered orders"
            icon={TrendingUp}
            iconBg="#F0FAF3"
            iconColor="#1A7A42"
          />
          <KPICard
            label="Total orders"
            value={loading ? "—" : String(overview?.total_orders ?? 0)}
            sub={
              !loading && overview && overview.total_orders > 0
                ? `${fmtK(overview.total_revenue_kobo / overview.total_orders)} avg`
                : undefined
            }
            icon={ShoppingBag}
            iconBg="#dbeafe"
            iconColor="#3b82f6"
          />
          <KPICard
            label="Customers"
            value={loading ? "—" : String(overview?.total_customers ?? 0)}
            sub="Unique buyers"
            icon={Users}
            iconBg="#dcfce7"
            iconColor="#15803d"
          />
          <KPICard
            label="Pending orders"
            value={loading ? "—" : String(overview?.pending_orders ?? 0)}
            sub="Awaiting action"
            icon={AlertTriangle}
            iconBg="#fef3c7"
            iconColor="#f59e0b"
          />
        </div>

        {/* Top products */}
        <div
          className="rounded-[14px] border p-5"
          style={{ background: "#fff", borderColor: "#e2e8f0" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p
                className="text-[15px] font-extrabold"
                style={{ color: "#1C1C1C" }}
              >
                Top products
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
                By revenue generated
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2" style={{ color: "#94a3b8" }}>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[13px]">Loading…</span>
            </div>
          ) : topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Package className="w-8 h-8" style={{ color: "#d1fae5" }} />
              <p className="text-[13px] font-medium" style={{ color: "#6b7280" }}>
                No sales yet — this fills in once orders come through.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const maxRev = topProducts[0].revenue_kobo || 1;
                const pct = Math.round((p.revenue_kobo / maxRev) * 100);
                return (
                  <div key={p.product_id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-[11px] font-bold w-4 shrink-0"
                          style={{ color: i === 0 ? "#1A7A42" : "#94a3b8" }}
                        >
                          #{i + 1}
                        </span>
                        <p
                          className="text-[12px] font-semibold truncate"
                          style={{ color: "#374151" }}
                        >
                          {p.name}
                        </p>
                      </div>
                      <span
                        className="text-[12px] font-bold shrink-0"
                        style={{ color: "#1C1C1C" }}
                      >
                        {fmtK(p.revenue_kobo)}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "#f1f5f9" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: i === 0 ? "#1A7A42" : i === 1 ? "#22c55e" : "#86efac",
                        }}
                      />
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>
                      {p.units_sold} unit{p.units_sold !== 1 ? "s" : ""} sold
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Honest placeholder for charts that need more data history */}
        <div
          className="rounded-[14px] border p-6 flex flex-col items-center justify-center text-center gap-2"
          style={{ background: "#fafafa", borderColor: "#e2e8f0" }}
        >
          <BarChart3 className="w-6 h-6" style={{ color: "#94a3b8" }} />
          <p className="text-[12px] font-semibold" style={{ color: "#374151" }}>
            Revenue trends & traffic charts coming soon
          </p>
          <p className="text-[11px]" style={{ color: "#94a3b8" }}>
            We're collecting more order history to power these views.
          </p>
        </div>
      </div>
    </div>
  );
}
