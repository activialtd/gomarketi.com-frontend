"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useBatches } from "@/lib/swr/hooks";
import { fmtNaira, fmtDate } from "@/lib/format";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useBatches({ page, per_page: 20 });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[20px] font-extrabold tracking-tight text-foreground">Orders</h1>
        <p className="mt-0.5 text-[13px] text-muted">
          {data ? `${data.total} order${data.total === 1 ? "" : "es"}` : "Loading…"} — each row is one
          customer's checkout, possibly spanning several vendors
        </p>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Vendors</th>
              <th>Hub status</th>
              <th>Total</th>
              <th>Placed</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-soft">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && data?.batches.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-soft">
                  No orders yet.
                </td>
              </tr>
            )}
            {data?.batches.map((b) => {
              const ready = b.at_hub_count + b.shipped_count + b.delivered_count + b.cancelled_count >= b.order_count;
              const allDone = b.shipped_count + b.delivered_count + b.cancelled_count >= b.order_count;
              return (
                <tr key={b.payment_reference}>
                  <td>
                    <Link
                      href={`/orders/${encodeURIComponent(b.payment_reference)}`}
                      className="flex items-center gap-2.5 font-semibold text-foreground hover:underline"
                    >
                      <Package className="h-4 w-4 text-muted-soft" />
                      {b.customer_name}
                    </Link>
                    <p className="ml-6 text-[11px] text-muted-soft">{b.customer_email}</p>
                  </td>
                  <td className="text-muted">
                    {b.order_count} vendor{b.order_count === 1 ? "" : "s"}
                  </td>
                  <td>
                    {allDone ? (
                      <span className="badge" style={{ background: "var(--input)", color: "var(--muted)" }}>
                        Complete
                      </span>
                    ) : ready ? (
                      <span className="badge" style={{ background: "rgba(34,197,94,0.12)", color: "#15803d" }}>
                        Ready to dispatch
                      </span>
                    ) : (
                      <span className="badge" style={{ background: "rgba(245,158,11,0.14)", color: "#b45309" }}>
                        {b.at_hub_count}/{b.order_count} at hub
                      </span>
                    )}
                  </td>
                  <td className="font-semibold text-foreground">{fmtNaira(b.total_kobo)}</td>
                  <td className="text-muted-soft">{fmtDate(b.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.total > data.per_page && (
        <div className="mt-4 flex items-center justify-between text-[12.5px] text-muted">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn btn-outline h-8 px-3"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={page * data.per_page >= data.total}
            onClick={() => setPage((p) => p + 1)}
            className="btn btn-outline h-8 px-3"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
