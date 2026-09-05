"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useDisputes } from "@/lib/swr/hooks";
import { fmtNaira, fmtDate } from "@/lib/format";

export default function DisputesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDisputes({ page, per_page: 20 });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[20px] font-extrabold tracking-tight text-foreground">Disputes</h1>
        <p className="mt-0.5 text-[13px] text-muted">
          {data ? `${data.total} open dispute${data.total === 1 ? "" : "s"}` : "Loading…"} — buyers who say a
          dispatched order never arrived, oldest first
        </p>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Vendor</th>
              <th>Reason</th>
              <th>Amount</th>
              <th>Reported</th>
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
            {!isLoading && data?.disputes.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-soft">
                  No open disputes — clean queue.
                </td>
              </tr>
            )}
            {data?.disputes.map((d) => (
              <tr key={d.id}>
                <td>
                  <Link
                    href={d.payment_reference ? `/orders/${encodeURIComponent(d.payment_reference)}` : "#"}
                    className="flex items-center gap-2.5 font-semibold text-foreground hover:underline"
                  >
                    <AlertTriangle className="h-4 w-4 text-[#dc2626]" />
                    {d.customer_name}
                  </Link>
                  <p className="ml-6 text-[11px] text-muted-soft">{d.customer_email}</p>
                </td>
                <td className="text-muted">{d.store_name}</td>
                <td className="max-w-[280px] truncate text-muted">{d.dispute_reason ?? "—"}</td>
                <td className="font-semibold text-foreground">{fmtNaira(d.total_kobo)}</td>
                <td className="text-muted-soft">{fmtDate(d.disputed_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.total > data.per_page && (
        <div className="mt-4 flex items-center justify-between text-[12.5px] text-muted">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-outline h-8 px-3">
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
