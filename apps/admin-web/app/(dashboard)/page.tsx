"use client";

import Link from "next/link";
import { Users, Store, Ticket, BarChart3, ArrowUpRight, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCustomers, useVendors } from "@/lib/swr/hooks";
import { StatCard } from "@/components/StatCard";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHome() {
  const admin = useAuthStore((s) => s.admin);
  const { data: customers } = useCustomers({ per_page: 1 });
  const { data: vendors } = useVendors({ per_page: 1 });

  const firstName = admin?.full_name?.split(" ")[0] ?? "there";

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[22px] font-extrabold tracking-tight text-foreground">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-1 text-[13.5px] text-muted">
          Here's what's happening across GoMarketi right now.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total customers"
          value={customers ? String(customers.total) : "—"}
          icon={Users}
        />
        <StatCard label="Total vendors" value={vendors ? String(vendors.total) : "—"} icon={Store} />
        <StatCard label="Open tickets" value="—" icon={Ticket} hint="Phase 3" />
        <StatCard label="GMV (30d)" value="—" icon={BarChart3} hint="Phase 4" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <p className="mb-3 text-[13px] font-bold text-foreground">Jump in</p>
          <div className="space-y-1">
            <QuickLink href="/customers" icon={Users} label="Browse customers" />
            <QuickLink href="/vendors" icon={Store} label="Browse vendors" />
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-1 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" style={{ color: "var(--primary-soft)" }} />
            <p className="text-[13px] font-bold text-foreground">Roadmap</p>
          </div>
          <p className="mb-3 text-[12.5px] text-muted">
            Ticketing, the customer-care queue, the platform activity feed, and analytics are
            being built next.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <span className="badge" style={{ background: "var(--input)", color: "var(--muted)" }}>
              Tickets — Phase 3
            </span>
            <span className="badge" style={{ background: "var(--input)", color: "var(--muted)" }}>
              Activity feed — Phase 4
            </span>
            <span className="badge" style={{ background: "var(--input)", color: "var(--muted)" }}>
              Analytics — Phase 4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-[var(--input)]"
    >
      <Icon className="h-[15px] w-[15px]" style={{ color: "var(--primary-soft)" }} />
      <span className="flex-1">{label}</span>
      <ArrowUpRight className="h-3.5 w-3.5 text-muted-soft" />
    </Link>
  );
}
