"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Apple, Eye, EyeOff } from "lucide-react";
import { Input } from "@gomarket/ui";
import { ROUTES } from "@/lib/config/routes";
import { GoogleIcon } from "../common/GoogleIcon";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  const busy = isLoading || !!oauthLoading;

  async function onSubmit(_data: LoginData) {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);
    router.push(ROUTES.MERCHANT.OVERVIEW);
  }

  async function handleOAuth(provider: string) {
    setOauthLoading(provider);
    await new Promise((r) => setTimeout(r, 800));
    setOauthLoading(null);
    router.push(ROUTES.MERCHANT.OVERVIEW);
  }

  return (
    <div className="animate-in fade-in duration-500 w-full">
      {/* ── Header ──────────────────────────────────────────── */}
      <p
        className="text-[10px] font-extrabold uppercase mb-2.5"
        style={{ letterSpacing: "0.18em", color: "#1A7A42" }}
      >
        Vendor portal
      </p>
      <h1
        className="text-[26px] font-extrabold leading-tight mb-1.5"
        style={{ letterSpacing: "-0.5px", color: "#1C1C1C" }}
      >
        Welcome back
      </h1>
      <p
        className="text-[13px] leading-relaxed mb-6"
        style={{ color: "#3D6B4F" }}
      >
        Sign in to access your GoMarket dashboard.
      </p>

      {/* ── OAuth buttons ───────────────────────────────────── */}
      <OAuthBtn
        onClick={() => handleOAuth("google")}
        loading={oauthLoading === "google"}
        disabled={busy}
        icon={<GoogleIcon />}
        label="Continue with Google"
      />
      <div className="mb-2" />
      <OAuthBtn
        onClick={() => handleOAuth("apple")}
        loading={oauthLoading === "apple"}
        disabled={busy}
        icon={<Apple className="w-4 h-4 fill-current" />}
        label="Continue with Apple"
      />

      {/* ── Divider ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 my-[18px]">
        <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
        <span
          className="text-[10px] font-bold uppercase"
          style={{ letterSpacing: "0.12em", color: "rgba(61,107,79,0.5)" }}
        >
          or
        </span>
        <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
      </div>

      {/* ── Form ────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
        {/* Email */}
        <Field label="Email address" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            {...register("email")}
          />
        </Field>

        {/* Password */}
        <Field
          label="Password"
          error={errors.password?.message}
          labelRight={
            <Link
              href="#"
              className="text-[11px] font-semibold"
              style={{ color: "#1A7A42" }}
            >
              Forgot password?
            </Link>
          }
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              style={{ paddingRight: "2.75rem" }}
              {...register("password")}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "#3D6B4F" }}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </Field>

        {/* Submit */}
        <button
          type="submit"
          disabled={busy}
          className="w-full h-[42px] rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: "#1A7A42",
            letterSpacing: "0.04em",
            boxShadow: "0 4px 14px rgba(26,122,66,0.3)",
          }}
          onMouseOver={(e) =>
            !busy && (e.currentTarget.style.background = "#239452")
          }
          onMouseOut={(e) => (e.currentTarget.style.background = "#1A7A42")}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
        </button>
      </form>

      <p className="text-center text-[11px] mt-5" style={{ color: "#3D6B4F" }}>
        No account yet?{" "}
        <Link
          href={ROUTES.AUTH.SIGNUP}
          className="font-bold"
          style={{ color: "#1A7A42" }}
        >
          Create one free →
        </Link>
      </p>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Field({
  label,
  labelRight,
  error,
  children,
}: {
  label: string;
  labelRight?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-extrabold uppercase block"
          style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
        >
          {label}
        </span>
        {labelRight}
      </div>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

function OAuthBtn({
  onClick,
  loading,
  disabled,
  icon,
  label,
}: {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-[42px] flex items-center justify-center gap-2.5 rounded-[10px] border text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ borderColor: "#e2e8f0", background: "#fff", color: "#1C1C1C" }}
      onMouseOver={(e) =>
        !disabled && (e.currentTarget.style.background = "#F0FAF3")
      }
      onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {label}
    </button>
  );
}
