"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { admin, hydrated } = useAuthStore();

  useEffect(() => {
    if (hydrated && !admin) {
      router.replace("/login");
    }
  }, [hydrated, admin, router]);

  if (!hydrated || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[13px] text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
