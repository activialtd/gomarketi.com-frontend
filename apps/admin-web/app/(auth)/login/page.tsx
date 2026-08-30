"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9F8] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[380px] rounded-[16px] border border-[#e2e8f0] bg-white p-8 shadow-sm"
      >
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#0A2E1A]">
            <span className="text-[14px] font-extrabold text-white">G</span>
          </div>
          <div>
            <p className="text-[15px] font-extrabold text-[#0A2E1A] leading-tight">GoMarketi</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Admin Center</p>
          </div>
        </div>

        <label className="mb-1.5 block text-[12px] font-semibold text-slate-600">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-[8px] border border-[#e2e8f0] px-3 py-2.5 text-[14px] outline-none focus:border-[#1A7A42]"
          placeholder="you@gomarketi.com"
        />

        <label className="mb-1.5 block text-[12px] font-semibold text-slate-600">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-[8px] border border-[#e2e8f0] px-3 py-2.5 text-[14px] outline-none focus:border-[#1A7A42]"
          placeholder="••••••••"
        />

        {error && (
          <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-[10px] bg-[#0A2E1A] text-[14px] font-bold text-white transition-opacity disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
