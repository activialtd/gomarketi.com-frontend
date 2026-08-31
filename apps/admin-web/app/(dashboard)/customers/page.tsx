"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useCustomers } from "@/lib/swr/hooks";
import { fmtNaira, fmtDate } from "@/lib/format";
import { Avatar } from "@/components/Avatar";

export default function CustomersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCustomers({ q: q || undefined, page, per_page: 20 });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-extrabold tracking-tight text-foreground">Customers</h1>
          <p className="mt-0.5 text-[13px] text-muted">
            {data ? `${data.total} customer${data.total === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>
        <div className="relative w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-soft" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search name or email…"
            className="input pl-9"
          />
        </div>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Total spent</th>
              <th>Joined</th>
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
            {!isLoading && data?.customers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-soft">
                  No customers found.
                </td>
              </tr>
            )}
            {data?.customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={`/customers/${c.id}`} className="flex items-center gap-2.5 group">
                    <Avatar name={c.full_name} size={30} />
                    <span className="font-semibold text-foreground group-hover:underline">
                      {c.full_name ?? "—"}
                    </span>
                  </Link>
                </td>
                <td className="text-muted">{c.email ?? "—"}</td>
                <td className="text-muted">{c.total_orders}</td>
                <td className="font-semibold text-foreground">{fmtNaira(c.total_spent)}</td>
                <td className="text-muted-soft">{fmtDate(c.created_at)}</td>
              </tr>
            ))}
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
