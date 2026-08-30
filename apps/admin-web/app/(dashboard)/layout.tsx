"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/vendors", label: "Vendors" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, hydrated, clearAuth } = useAuthStore();

  useEffect(() => {
    if (hydrated && !admin) {
      router.replace("/login");
    }
  }, [hydrated, admin, router]);

  if (!hydrated || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[13px] text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8]">
      <header className="flex items-center justify-between border-b border-[#e2e8f0] bg-white px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0A2E1A]">
            <span className="text-[13px] font-extrabold text-white">G</span>
          </div>
          <span className="text-[14px] font-extrabold text-[#0A2E1A]">Admin Center</span>
          <nav className="ml-6 flex items-center gap-1">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[7px] px-3 py-1.5 text-[13px] font-semibold transition-colors"
                  style={{
                    background: active ? "#F0FAF3" : "transparent",
                    color: active ? "#1A7A42" : "#64748b",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold text-slate-500">
            {admin.full_name} · <span className="uppercase text-slate-400">{admin.role}</span>
          </span>
          <button
            onClick={() => {
              clearAuth();
              router.push("/login");
            }}
            className="text-[12px] font-semibold text-slate-500 hover:text-slate-700"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="px-6 py-6">{children}</main>
    </div>
  );
}
