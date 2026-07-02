"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, CheckCircle2, ArrowLeft, RefreshCw } from "lucide-react";
import { Input } from "@gomarket/ui";
import { authApi, ApiError } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { setAuthSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/config/routes";

type Step = "EMAIL" | "OTP";

function CountdownRing({ seconds, total }: { seconds: number; total: number }) {
  const r = 7;
  const circumference = 2 * Math.PI * r;
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="9" cy="9" r={r} fill="none" stroke="#e2e8f0" strokeWidth="2" />
      <circle cx="9" cy="9" r={r} fill="none" stroke="#94a3b8" strokeWidth="2"
        strokeDasharray={circumference} strokeDashoffset={circumference * (seconds / total)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
    </svg>
  );
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      const resp = await authApi.requestOTP(email);
      setSessionToken(resp.session_token);
      setResendCooldown(60);
      setStep("OTP");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send code. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOTP() {
    if (!sessionToken || otp.length !== 6) return;
    setIsLoading(true);
    setError(null);
    try {
      const resp = await authApi.verifyOTP({ session_token: sessionToken, otp });
      setAuth(resp.user, resp.access_token);
      setAuthSession();
      router.push(ROUTES.MERCHANT.OVERVIEW);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleResend = useCallback(async () => {
    if (!email || isResending || resendCooldown > 0) return;
    setIsResending(true);
    setError(null);
    setResendSuccess(false);
    try {
      const resp = await authApi.requestOTP(email);
      setSessionToken(resp.session_token);
      setOtp("");
      setResendSuccess(true);
      setResendCooldown(60);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to resend. Try again.");
    } finally {
      setIsResending(false);
    }
  }, [email, isResending, resendCooldown]);

  return (
    <div className="animate-in fade-in duration-500 w-full">
      {step === "OTP" && (
        <button type="button" onClick={() => { setStep("EMAIL"); setError(null); setOtp(""); }}
          className="flex items-center gap-1.5 text-xs font-medium mb-6 transition-colors group" style={{ color: "#3D6B4F" }}>
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      )}

      <p className="text-[10px] font-extrabold uppercase mb-2.5" style={{ letterSpacing: "0.18em", color: "#1A7A42" }}>
        Account recovery
      </p>
      <h1 className="text-[26px] font-extrabold mb-1.5 leading-tight" style={{ letterSpacing: "-0.5px", color: "#1C1C1C" }}>
        {step === "EMAIL" ? "Forgot password?" : "Check your inbox"}
      </h1>
      <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#3D6B4F" }}>
        {step === "EMAIL"
          ? "Enter your email and we'll send a verification code to regain access."
          : `Enter the 6-digit code we sent to ${email}.`}
      </p>

      {step === "EMAIL" && (
        <form onSubmit={handleSendCode} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase block" style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}>
              Email address
            </span>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); setError(null); }}
            />
          </div>
          {error && (
            <p className="text-[12px] rounded-[8px] px-3 py-2 border" style={{ color: "#dc2626", background: "#fef2f2", borderColor: "#fecaca" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full h-[42px] rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "#0A2E1A", letterSpacing: "0.04em", boxShadow: "0 4px 14px rgba(26,122,66,0.3)" }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send verification code"}
          </button>
        </form>
      )}

      {step === "OTP" && (
        <div className="space-y-5">
          <div className="flex justify-center py-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full scale-[1.3]" style={{ background: "rgba(26,122,66,0.08)" }} />
              <div className="relative w-[64px] h-[64px] rounded-full flex items-center justify-center border" style={{ background: "#F0FAF3", borderColor: "rgba(26,122,66,0.2)" }}>
                <Mail className="w-7 h-7" style={{ color: "#1A7A42" }} />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#1A7A42" }}>
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase block" style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}>
              Verification code
            </span>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError(null);
              }}
              style={{ textAlign: "center", fontSize: "22px", letterSpacing: "0.4em" }}
            />
            {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
          </div>

          <button
            type="button"
            disabled={isLoading || otp.length !== 6}
            onClick={handleVerifyOTP}
            className="w-full h-[42px] rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "#0A2E1A", letterSpacing: "0.04em", boxShadow: "0 4px 14px rgba(26,122,66,0.3)" }}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & sign in →"}
          </button>

          <div className="flex flex-col items-center gap-2 pt-1">
            <p className="text-[11px]" style={{ color: "#3D6B4F" }}>Didn&apos;t receive the code?</p>
            <button
              type="button"
              disabled={isResending || resendCooldown > 0}
              onClick={handleResend}
              className="flex items-center justify-center gap-2 h-10 px-5 rounded-[10px] border text-[12px] font-semibold transition-all active:scale-[0.97] disabled:cursor-not-allowed"
              style={{
                borderColor: resendCooldown > 0 ? "#e2e8f0" : "#1A7A42",
                background: resendCooldown > 0 ? "#fafafa" : "#fff",
                color: resendCooldown > 0 ? "#94a3b8" : "#1A7A42",
              }}
            >
              {isResending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
               resendCooldown > 0 ? <><CountdownRing seconds={resendCooldown} total={60} /> Resend in {resendCooldown}s</> :
               <><RefreshCw className="w-3.5 h-3.5" /> Resend code</>}
            </button>
            {resendSuccess && (
              <p className="text-center text-[12px] rounded-[8px] px-3 py-2 border w-full" style={{ color: "#15803d", background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                ✓ A new code was sent to {email}
              </p>
            )}
          </div>
        </div>
      )}

      <p className="text-center text-[11px] mt-6" style={{ color: "#3D6B4F" }}>
        Remember your password?{" "}
        <Link href={ROUTES.AUTH.LOGIN} className="font-bold" style={{ color: "#1A7A42" }}>Sign in →</Link>
      </p>
    </div>
  );
}
