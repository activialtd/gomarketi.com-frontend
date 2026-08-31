"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, AlertTriangle, AlertCircle } from "lucide-react";
import { useErrors } from "@/lib/swr/hooks";
import { fmtDate } from "@/lib/format";

const SERVICES = ["auth", "identity", "storefront", "catalogue", "orders", "vendor-web", "consumer-app"];

export default function ErrorsPage() {
  const [page, setPage] = useState(1);
  const [service, setService] = useState<string | undefined>(undefined);
  const [resolved, setResolved] = useState(false);
  const { data, isLoading } = useErrors({ page, per_page: 30, service, resolved });

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-foreground">Errors</h1>
          <p className="mt-0.5 text-[13px] text-muted">
            {data ? `${data.total} ${resolved ? "resolved" : "unresolved"} error${data.total === 1 ? "" : "s"}` : "Loading…"} — backend
            5xx/panics and self-reported frontend crashes, one queue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={service ?? ""}
            onChange={(e) => {
              setService(e.target.value || undefined);
              setPage(1);
            }}
            className="input h-8 w-[170px] text-[12.5px]"
          >
            <option value="">All services</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="flex overflow-hidden rounded-[8px] border" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => {
                setResolved(false);
                setPage(1);
              }}
              className="px-3 py-1.5 text-[12.5px] font-semibold"
              style={{
                background: !resolved ? "var(--foreground)" : "transparent",
                color: !resolved ? "var(--background)" : "var(--muted)",
              }}
            >
              Unresolved
            </button>
            <button
              onClick={() => {
                setResolved(true);
                setPage(1);
              }}
              className="px-3 py-1.5 text-[12.5px] font-semibold"
              style={{
                background: resolved ? "var(--foreground)" : "transparent",
                color: resolved ? "var(--background)" : "var(--muted)",
              }}
            >
              Resolved
            </button>
          </div>
        </div>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Message</th>
              <th>Path</th>
              <th>Status</th>
              <th>When</th>
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
            {!isLoading && data?.errors.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-soft">
                  {resolved ? "No resolved errors." : "No unresolved errors — clean queue."}
                </td>
              </tr>
            )}
            {data?.errors.map((e) => (
              <tr key={e.id}>
                <td>
                  <Link
                    href={`/errors/${e.id}`}
                    className="flex items-center gap-2 font-semibold text-foreground hover:underline"
                  >
                    {e.level === "error" ? (
                      <AlertTriangle className="h-4 w-4 text-[#dc2626]" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-[#b45309]" />
                    )}
                    {e.service}
                  </Link>
                </td>
                <td className="max-w-[380px] truncate text-muted">{e.message}</td>
                <td className="text-muted-soft">{e.request_path ?? "—"}</td>
                <td className="text-muted-soft">{e.status_code ?? "—"}</td>
                <td className="text-muted-soft">{fmtDate(e.created_at)}</td>
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
