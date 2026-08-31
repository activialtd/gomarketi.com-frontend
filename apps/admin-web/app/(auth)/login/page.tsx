"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ShieldCheck, Users, BarChart3 } from "lucide-react";
import { adminApi, ApiError } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, admin } = await adminApi.login(email, password);
      setAuth(admin, token);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex"
        style={{ background: "var(--sidebar-bg)" }}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.16), transparent 70%)" }}
        />
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[10px]"
            style={{ background: "var(--sidebar-accent-soft)" }}
          >
            <Sparkles className="h-[18px] w-[18px]" style={{ color: "var(--sidebar-accent)" }} />
          </div>
          <span className="text-[16px] font-extrabold text-white">GoMarketi</span>
        </div>

        <div>
          <h1 className="mb-3 max-w-sm text-[30px] font-extrabold leading-[1.15] text-white">
            Everything the team needs to run the platform.
          </h1>
          <p className="mb-8 max-w-sm text-[13.5px] leading-relaxed" style={{ color: "var(--sidebar-fg)" }}>
            Customer and vendor accounts, support tickets, and platform-wide analytics — all in
            one console.
          </p>
          <div className="space-y-3">
            <Feature icon={Users} label="Full customer & vendor directory" />
            <Feature icon={ShieldCheck} label="Tiered access for every role" />
            <Feature icon={BarChart3} label="Platform-wide activity & analytics" />
          </div>
        </div>

        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          © {new Date().getFullYear()} GoMarketi
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background px-6 py-16">
        <form onSubmit={handleSubmit} className="w-full max-w-[360px]">
          <div className="mb-2 flex items-center gap-2.5 lg:hidden">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-[9px]"
              style={{ background: "var(--primary)" }}
            >
              <Sparkles className="h-[15px] w-[15px] text-white" />
            </div>
            <span className="text-[15px] font-extrabold text-foreground">GoMarketi</span>
          </div>

          <h2 className="mb-1 text-[20px] font-extrabold text-foreground">Sign in</h2>
          <p className="mb-7 text-[13px] text-muted">Use your GoMarketi staff credentials.</p>

          <label className="label mb-1.5 block text-[12px] font-semibold text-muted">Email</label>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mb-4"
            placeholder="you@gomarketi.com"
          />

          <label className="label mb-1.5 block text-[12px] font-semibold text-muted">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mb-5"
            placeholder="••••••••"
          />

          {error && (
            <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary h-11 w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ background: "var(--sidebar-accent-soft)" }}
      >
        <Icon className="h-[13px] w-[13px]" style={{ color: "var(--sidebar-accent)" }} />
      </div>
      <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>
        {label}
      </span>
    </div>
  );
}
