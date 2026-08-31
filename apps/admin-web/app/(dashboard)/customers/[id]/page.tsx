"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCustomer } from "@/lib/swr/hooks";
import { fmtNaira, fmtDate } from "@/lib/format";
import { Avatar } from "@/components/Avatar";
import { StatCard } from "@/components/StatCard";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useCustomer(id);

  if (isLoading) return <p className="text-[13px] text-muted-soft">Loading…</p>;
  if (error || !data) return <p className="text-[13px] text-red-600">Customer not found.</p>;

  const { profile, orders } = data;

  return (
    <div>
      <Link
        href="/customers"
        className="mb-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <Avatar name={profile.full_name} size={48} />
          <div>
            <h1 className="text-[19px] font-extrabold tracking-tight text-foreground">
              {profile.full_name ?? "Unnamed customer"}
            </h1>
            <p className="text-[13px] text-muted">{profile.email}</p>
          </div>
        </div>
        <span
          className="badge"
          style={
            profile.is_active
              ? { background: "rgba(34,197,94,0.12)", color: "#15803d" }
              : { background: "rgba(239,68,68,0.1)", color: "#dc2626" }
          }
        >
          {profile.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mb-7 grid grid-cols-3 gap-4">
        <StatCard label="Total orders" value={String(profile.total_orders)} />
        <StatCard label="Total spent" value={fmtNaira(profile.total_spent)} />
        <StatCard label="Customer since" value={fmtDate(profile.created_at)} />
      </div>

      <h2 className="mb-3 text-[14px] font-bold text-foreground">Order history</h2>
      <div className="table-shell">
        {orders.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-soft">No orders yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Items</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="text-muted">
                    {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ") || "—"}
                  </td>
                  <td className="capitalize text-muted">{o.status}</td>
                  <td className="font-semibold text-foreground">{fmtNaira(o.total_kobo)}</td>
                  <td className="text-muted-soft">{fmtDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
