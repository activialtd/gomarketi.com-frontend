"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Apple,
  Eye,
  EyeOff,
  Mail,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@gomarket/ui";
import { authApi, identityApi, ApiError } from "@gomarket/api-client";
import { useAuthStore } from "@/store/useAuthStore";
import { setAuthSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/config/routes";
import { GoogleIcon } from "../common/GoogleIcon";
import { useGoogleAuth } from "@/lib/auth/useGoogleAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "METHOD_SELECT" | "SIGNUP_FORM" | "VERIFY_EMAIL" | "OAUTH_PROFILE";

interface OAuthUser {
  provider: "google" | "apple";
  firstName: string;
  lastName: string;
  email: string;
  credential?: string; // id_token from Google/Apple — used on profile submit
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

const signupSchema = z
  .object({
    firstName: z.string().min(1, "Required"),
    lastName: z.string().min(1, "Required"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: z
      .string()
      .min(6, "Enter a valid number")
      .regex(/^[\d\s\-()]+$/, "Digits only"),
    terms: z.boolean().refine((value) => value, "You must accept the terms"),
    marketing: z.boolean().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const oauthProfileSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phone: z
    .string()
    .min(7, "Enter a valid number")
    .regex(/^\+?[\d\s\-()+]+$/, "Invalid number"),
  heardAbout: z.string().min(1, "Please select an option"),
  terms: z.boolean().refine((value) => value, "You must accept the terms"),
  marketing: z.boolean().optional(),
});

type SignupData = z.infer<typeof signupSchema>;
type OAuthProfileData = z.infer<typeof oauthProfileSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseOAuthParams(params: URLSearchParams): OAuthUser | null {
  const provider = params.get("provider") as "google" | "apple" | null;
  const email = params.get("email");
  if (!provider || !email) return null;
  return {
    provider,
    firstName: params.get("firstName") ?? "",
    lastName: params.get("lastName") ?? "",
    email,
  };
}

function computeStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const STR_LABEL = ["", "Weak", "Fair", "Good", "Strong"];
const STR_COLOR = ["", "#ef4444", "#f59e0b", "#3b82f6", "#1A7A42"];

// ─── Component ───────────────────────────────────────────────────────────────

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setSignupPhone = useAuthStore((s) => s.setSignupPhone);
  const { signIn: googleSignIn, buttonRef: googleButtonRef } = useGoogleAuth();

  const [step, setStep] = useState<Step>("METHOD_SELECT");
  const [oauthUser, setOauthUser] = useState<OAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [oauthApiError, setOauthApiError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [pwStrength, setPwStrength] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dialCode, setDialCode] = useState("+234");

  // OTP state
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [signupEmail, setSignupEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Form-level API error
  const [apiError, setApiError] = useState<string | null>(null);

  const busy = isLoading || !!oauthLoading;

  // Countdown tick for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  // Read OAuth params from callback URL on mount
  useEffect(() => {
    const parsed = parseOAuthParams(searchParams);
    if (parsed) {
      setOauthUser(parsed);
      oauthForm.reset({
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        marketing: false,
      });
      setStep("OAUTH_PROFILE");
    }
  }, []);

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { marketing: false },
  });
  const oauthForm = useForm<OAuthProfileData>({
    resolver: zodResolver(oauthProfileSchema),
    defaultValues: { marketing: false },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleOAuth(provider: "google" | "apple") {
    setOauthLoading(provider);
    setOauthApiError(null);
    try {
      if (provider === "google") {
        const result = await googleSignIn();

        // Authenticate with Google — creates account on first visit, logs in on return.
        // We can't tell new vs returning from this response alone.
        const resp = await authApi.googleAuth(result.credential);
        setAuth(resp.user, resp.access_token);
        setAuthSession();

        // Detect new vs returning user by checking vendor profile existence.
        // New users have no vendor profile yet (returns 404).
        let isNewUser = true;
        try {
          const profile = await identityApi.getVendorProfile(resp.access_token);
          // Returning user only if they completed onboarding
          isNewUser = !profile.is_active;
        } catch {
          // No vendor profile at all — definitely a new user
          isNewUser = true;
        }

        if (isNewUser) {
          // New user — show profile step to collect missing info (phone, marketing)
          // then send them through the full onboarding flow
          const nameParts = result.name.trim().split(" ");
          const firstName = nameParts[0] ?? "";
          const lastName = nameParts.slice(1).join(" ") || "";
          const newUser: OAuthUser = { provider, firstName, lastName, email: result.email, credential: result.credential };
          setOauthUser(newUser);
          oauthForm.reset({ firstName, lastName, marketing: false });
          setStep("OAUTH_PROFILE");
        } else {
          // Returning user who already set up their store
          router.push(ROUTES.MERCHANT.OVERVIEW);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.message !== "one_tap_unavailable" && err.message !== "Google Sign-In was cancelled") {
        setOauthApiError(
          err instanceof ApiError ? err.message : "Google sign-in failed. Please try again."
        );
      }
    } finally {
      setOauthLoading(null);
    }
  }

  async function onSignupSubmit(data: SignupData) {
    setIsLoading(true);
    setApiError(null);
    try {
      // 1. Register account
      const authResp = await authApi.register({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        terms_accepted: data.terms,
        marketing_consent: data.marketing ?? false,
      });
      setAuth(authResp.user, authResp.access_token);
      setAuthSession();
      setSignupEmail(data.email);

      // 2. Request OTP to trigger verification email
      try {
        const otpResp = await authApi.requestOTP(data.email);
        setSessionToken(otpResp.session_token);
        setResendCooldown(60);
      } catch {
        // User is registered; they can use the resend button
      }

      setStep("VERIFY_EMAIL");
    } catch (err) {
      setApiError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOTPSubmit() {
    if (!sessionToken || otpValue.length !== 6) return;
    setIsLoading(true);
    setOtpError(null);
    try {
      const authResp = await authApi.verifyOTP({
        session_token: sessionToken,
        otp: otpValue,
      });
      setAuth(authResp.user, authResp.access_token);
      setAuthSession();
      // Persist the signup phone so store setup can pre-fill the WhatsApp field.
      const rawPhone = signupForm.getValues("phone");
      if (rawPhone) setSignupPhone(`${dialCode}${rawPhone.replace(/\D/g, "")}`);
      router.push(ROUTES.ONBOARDING.WELCOME);
    } catch (err) {
      setOtpError(
        err instanceof ApiError
          ? err.message
          : "Invalid code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleResendOTP = useCallback(async () => {
    if (!signupEmail || isLoading || resendCooldown > 0) return;
    setIsLoading(true);
    setOtpError(null);
    setResendSuccess(false);
    try {
      const resp = await authApi.requestOTP(signupEmail);
      setSessionToken(resp.session_token);
      setOtpValue("");
      setResendSuccess(true);
      setResendCooldown(60);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err) {
      setOtpError(
        err instanceof ApiError
          ? err.message
          : "Failed to resend. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [signupEmail, isLoading, resendCooldown]);

  async function onOAuthProfileSubmit(data: OAuthProfileData) {
    // Auth was already set in handleOAuth — just save phone and begin onboarding.
    if (data.phone) setSignupPhone(data.phone);
    router.push(ROUTES.ONBOARDING.WELCOME);
  }

  function onPasswordChange(val: string) {
    setPwStrength(computeStrength(val));
    if (val.length >= 8 && !showConfirm) setShowConfirm(true);
    if (val.length === 0) setShowConfirm(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="animate-in fade-in duration-500 w-full">
      {/* ── Back button ─────────────────────────────────────── */}
      {step === "SIGNUP_FORM" && (
        <button
          type="button"
          onClick={() => setStep("METHOD_SELECT")}
          className="flex items-center gap-1.5 text-xs font-medium mb-6 transition-colors group"
          style={{ color: "#3D6B4F" }}
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>
      )}

      {/* ── Header ──────────────────────────────────────────── */}
      <p
        className="text-[10px] font-extrabold uppercase mb-2.5"
        style={{ letterSpacing: "0.18em", color: "#1A7A42" }}
      >
        Vendor account
      </p>
      <h1
        className="text-[26px] font-extrabold mb-1.5 leading-tight"
        style={{ letterSpacing: "-0.5px", color: "#1C1C1C" }}
      >
        {step === "VERIFY_EMAIL"
          ? "Check your inbox"
          : step === "OAUTH_PROFILE"
            ? "Finish your profile"
            : "Start selling today"}
      </h1>
      <p
        className="text-[13px] leading-relaxed mb-6"
        style={{ color: "#3D6B4F" }}
      >
        {step === "VERIFY_EMAIL"
          ? `Enter the 6-digit code we sent to ${signupEmail}.`
          : step === "OAUTH_PROFILE"
            ? `Connected via ${
                oauthUser?.provider === "google" ? "Google" : "Apple"
              }. Fill in the rest.`
            : "Create your GoMarket vendor account in seconds."}
      </p>

      {/* ═══ METHOD SELECT ════════════════════════════════════ */}
      {step === "METHOD_SELECT" && (
        <div className="space-y-3">
          {/* Hidden div where GSI renders the real Google button */}
          {/* Off-screen div where GSI renders the real Google button (needs real dimensions, not 0×0) */}
          <div ref={googleButtonRef} style={{ position: "fixed", left: -9999, top: -9999, width: 360, height: 44 }} aria-hidden />
          {oauthApiError && (
            <p className="text-[12px] text-center font-medium" style={{ color: "#dc2626" }}>
              {oauthApiError}
            </p>
          )}
          <OAuthBtn
            onClick={() => handleOAuth("google")}
            loading={oauthLoading === "google"}
            disabled={busy}
            icon={<GoogleIcon />}
            label="Sign up with Google"
          />
          <OAuthBtn
            onClick={() => handleOAuth("apple")}
            loading={oauthLoading === "apple"}
            disabled={busy}
            icon={<Apple className="w-4 h-4 fill-current" />}
            label="Sign up with Apple"
          />

          <OrDivider />

          <button
            type="button"
            disabled={busy}
            onClick={() => setStep("SIGNUP_FORM")}
            className="w-full h-[42px] flex items-center justify-center gap-2 rounded-[10px] border-2 text-[13px] font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
            style={{
              borderColor: "#1A7A42",
              color: "#1A7A42",
              background: "transparent",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(26,122,66,0.05)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <Mail className="w-4 h-4" />
            Continue with email
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <p
            className="text-center text-[11px] pt-3"
            style={{ color: "#3D6B4F" }}
          >
            Have an account?{" "}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="font-bold"
              style={{ color: "#1A7A42" }}
            >
              Sign in →
            </Link>
          </p>
        </div>
      )}

      {/* ═══ SIGNUP FORM (email path) ════════════════════════ */}
      {step === "SIGNUP_FORM" && (
        <form
          onSubmit={signupForm.handleSubmit(onSignupSubmit)}
          className="space-y-3"
          noValidate
        >
          {/* First + Last name */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="First name"
              error={signupForm.formState.errors.firstName?.message}
            >
              <Input
                id="firstName"
                autoComplete="given-name"
                placeholder="Ada"
                {...signupForm.register("firstName")}
              />
            </Field>
            <Field
              label="Last name"
              error={signupForm.formState.errors.lastName?.message}
            >
              <Input
                id="lastName"
                autoComplete="family-name"
                placeholder="Okafor"
                {...signupForm.register("lastName")}
              />
            </Field>
          </div>

          {/* Email */}
          <Field
            label="Email address"
            error={signupForm.formState.errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...signupForm.register("email")}
            />
          </Field>

          {/* Password */}
          <Field
            label="Password"
            error={signupForm.formState.errors.password?.message}
          >
            <div className="relative">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                style={{ paddingRight: "2.75rem" }}
                {...signupForm.register("password", {
                  onChange: (e) => onPasswordChange(e.target.value),
                })}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "#3D6B4F" }}
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {/* Strength meter */}
            {pwStrength > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor:
                          i <= pwStrength ? STR_COLOR[pwStrength] : "#e2e8f0",
                      }}
                    />
                  ))}
                </div>
                <p
                  className="text-[11px] font-semibold"
                  style={{ color: STR_COLOR[pwStrength] }}
                >
                  {STR_LABEL[pwStrength]}
                </p>
              </div>
            )}
          </Field>

          {/* Confirm password — reveals after 8+ chars */}
          {showConfirm && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
              <Field
                label="Confirm password"
                error={signupForm.formState.errors.confirmPassword?.message}
              >
                <Input
                  id="confirmPassword"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  {...signupForm.register("confirmPassword")}
                />
              </Field>
            </div>
          )}

          {/* Phone */}
          <Field
            label="Phone number"
            error={signupForm.formState.errors.phone?.message}
          >
            <PhoneInput
              dialCode={dialCode}
              onDialCodeChange={setDialCode}
              inputProps={signupForm.register("phone")}
            />
          </Field>

          <TermsBlock
            control={signupForm.control}
            errors={signupForm.formState.errors}
          />

          {/* API error */}
          {apiError && (
            <p
              className="text-[12px] rounded-[8px] px-3 py-2 border"
              style={{
                color: "#dc2626",
                background: "#fef2f2",
                borderColor: "#fecaca",
              }}
            >
              {apiError}
            </p>
          )}

          <PrimaryButton loading={isLoading} label="Create account" />

          <p
            className="text-center text-[11px] pt-1"
            style={{ color: "#3D6B4F" }}
          >
            Have an account?{" "}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="font-bold"
              style={{ color: "#1A7A42" }}
            >
              Sign in →
            </Link>
          </p>
        </form>
      )}

      {/* ═══ VERIFY EMAIL (OTP) ══════════════════════════════ */}
      {step === "VERIFY_EMAIL" && (
        <div className="space-y-5">
          {/* Icon */}
          <div className="flex justify-center py-4">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full scale-[1.65]"
                style={{ background: "rgba(26,122,66,0.05)" }}
              />
              <div
                className="absolute inset-0 rounded-full scale-[1.3]"
                style={{ background: "rgba(26,122,66,0.08)" }}
              />
              <div
                className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center border"
                style={{
                  background: "#F0FAF3",
                  borderColor: "rgba(26,122,66,0.2)",
                }}
              >
                <Mail className="w-8 h-8" style={{ color: "#1A7A42" }} />
              </div>
              <div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#1A7A42" }}
              >
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          {/* Info box */}
          <div
            className="rounded-[10px] border p-4 space-y-1.5"
            style={{
              background: "#F0FAF3",
              borderColor: "rgba(26,122,66,0.15)",
            }}
          >
            <p className="text-sm font-semibold" style={{ color: "#1C1C1C" }}>
              Enter your verification code
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "#3D6B4F" }}>
              We sent a 6-digit code to{" "}
              <span className="font-semibold">{signupEmail}</span>. It expires
              in 10 minutes. Check your spam folder if you don&apos;t see it.
            </p>
          </div>

          {/* OTP input */}
          <div className="space-y-1.5">
            <span
              className="text-[10px] font-extrabold uppercase block"
              style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
            >
              Verification code
            </span>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={otpValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6));
                setOtpError(null);
              }}
              style={{
                textAlign: "center",
                fontSize: "22px",
                letterSpacing: "0.4em",
              }}
            />
            {otpError && (
              <p className="text-[11px] text-red-500 mt-0.5">{otpError}</p>
            )}
          </div>

          <PrimaryButton
            loading={isLoading}
            disabled={otpValue.length !== 6}
            label="Verify email →"
            onClick={handleOTPSubmit}
          />

          {resendSuccess && (
            <p
              className="text-center text-[12px] rounded-[8px] px-3 py-2 border"
              style={{
                color: "#15803d",
                background: "#f0fdf4",
                borderColor: "#bbf7d0",
              }}
            >
              A new code was sent to {signupEmail}
            </p>
          )}

          <p className="text-center text-[11px]" style={{ color: "#3D6B4F" }}>
            Didn&apos;t receive it?{" "}
            {resendCooldown > 0 ? (
              <span
                className="font-semibold"
                style={{ color: "rgba(61,107,79,0.5)" }}
              >
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                className="font-bold transition-colors disabled:opacity-50"
                style={{ color: "#1A7A42" }}
                onClick={handleResendOTP}
              >
                Resend code
              </button>
            )}
          </p>
        </div>
      )}

      {/* ═══ OAUTH PROFILE ═══════════════════════════════════ */}
      {step === "OAUTH_PROFILE" && oauthUser && (
        <form
          onSubmit={oauthForm.handleSubmit(onOAuthProfileSubmit)}
          className="space-y-3"
          noValidate
        >
          {/* Provider badge */}
          <div className="flex items-center gap-2 mb-1">
            <div
              className="flex items-center gap-1.5 rounded-full border px-3 py-1"
              style={{ borderColor: "#e2e8f0", background: "#F0FAF3" }}
            >
              {oauthUser.provider === "google" ? (
                <GoogleIcon />
              ) : (
                <Apple className="w-3.5 h-3.5 fill-current" />
              )}
              <span
                className="text-xs font-semibold capitalize"
                style={{ color: "#1C1C1C" }}
              >
                {oauthUser.provider}
              </span>
            </div>
            <span className="text-xs" style={{ color: "#3D6B4F" }}>
              account connected
            </span>
          </div>

          {/* Name — prefilled, editable */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="First name"
              error={oauthForm.formState.errors.firstName?.message}
            >
              <Input
                id="oFirst"
                autoComplete="given-name"
                defaultValue={oauthUser.firstName}
                {...oauthForm.register("firstName")}
              />
            </Field>
            <Field
              label="Last name"
              error={oauthForm.formState.errors.lastName?.message}
            >
              <Input
                id="oLast"
                autoComplete="family-name"
                defaultValue={oauthUser.lastName}
                {...oauthForm.register("lastName")}
              />
            </Field>
          </div>

          {/* Email — locked */}
          <Field label="Email address">
            <div className="relative">
              <input
                id="oEmail"
                type="email"
                value={oauthUser.email}
                readOnly
                disabled
                className="w-full h-[42px] px-3.5 pr-10 rounded-[10px] border text-[13px] cursor-not-allowed"
                style={{
                  borderColor: "#e2e8f0",
                  background: "#F0FAF3",
                  color: "#3D6B4F",
                  outline: "none",
                }}
              />
              <CheckCircle2
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#1A7A42" }}
              />
            </div>
            <p className="text-[11px] mt-1" style={{ color: "#3D6B4F" }}>
              Verified by {oauthUser.provider === "google" ? "Google" : "Apple"}{" "}
              — cannot be changed here.
            </p>
          </Field>

          {/* Phone */}
          <Field
            label="Phone number"
            error={oauthForm.formState.errors.phone?.message}
          >
            <Input
              id="oPhone"
              type="tel"
              autoComplete="tel"
              placeholder="+234 800 000 0000"
              {...oauthForm.register("phone")}
            />
          </Field>

          {/* How did you hear */}
          <Field
            label="How did you hear about us?"
            error={oauthForm.formState.errors.heardAbout?.message}
          >
            <Controller
              control={oauthForm.control}
              name="heardAbout"
              render={({ field }) => (
                <select
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full h-[42px] px-3.5 rounded-[10px] border text-[13px] transition-all appearance-none"
                  style={{
                    borderColor: "#e2e8f0",
                    background: "#F0FAF3",
                    color: field.value ? "#1C1C1C" : "#3D6B4F",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#1A7A42";
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.outline = "2px solid #1A7A42";
                    e.currentTarget.style.outlineOffset = "-2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.background = "#F0FAF3";
                    e.currentTarget.style.outline = "none";
                  }}
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option value="social">Social media (X / Instagram)</option>
                  <option value="friend">Friend or colleague</option>
                  <option value="search">Google search</option>
                  <option value="event">Tech event / conference</option>
                  <option value="ad">Online advertisement</option>
                  <option value="other">Other</option>
                </select>
              )}
            />
          </Field>

          <TermsBlock
            control={oauthForm.control}
            errors={oauthForm.formState.errors}
          />
          <PrimaryButton loading={isLoading} label="Complete profile →" />
        </form>
      )}
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

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

function OrDivider() {
  return (
    <div className="flex items-center gap-2.5 my-1">
      <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
      <span
        className="text-[10px] font-bold uppercase"
        style={{ letterSpacing: "0.12em", color: "rgba(61,107,79,0.5)" }}
      >
        or
      </span>
      <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <span
        className="text-[10px] font-extrabold uppercase block"
        style={{ letterSpacing: "0.1em", color: "#3D6B4F" }}
      >
        {label}
      </span>
      {children}
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

function TermsBlock({ control, errors }: { control: any; errors: any }) {
  return (
    <div className="space-y-2 pt-1">
      {/* Terms */}
      <div className="space-y-1">
        <Controller
          control={control}
          name="terms"
          render={({ field }) => (
            <label
              htmlFor="terms"
              className="flex items-start gap-3 cursor-pointer rounded-[10px] p-3 border transition-all"
              style={{
                background: "rgba(240,250,243,0.6)",
                borderColor: "rgba(226,232,240,0.7)",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(26,122,66,0.3)";
                (e.currentTarget as HTMLElement).style.background = "#F0FAF3";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(226,232,240,0.7)";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(240,250,243,0.6)";
              }}
            >
              <input
                id="terms"
                type="checkbox"
                checked={field.value === true}
                onChange={(e) => field.onChange(e.target.checked)}
                className="mt-0.5 shrink-0 accent-[#1A7A42]"
              />
              <span
                className="text-xs leading-relaxed"
                style={{ color: "#3D6B4F" }}
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="font-bold hover:underline"
                  style={{ color: "#1A7A42" }}
                >
                  Terms of Use
                </a>
                {", "}
                <a
                  href="#"
                  className="font-bold hover:underline"
                  style={{ color: "#1A7A42" }}
                >
                  Merchant Terms
                </a>
                {" & "}
                <a
                  href="#"
                  className="font-bold hover:underline"
                  style={{ color: "#1A7A42" }}
                >
                  Privacy Policy
                </a>
                {" of GoMarket."}
              </span>
            </label>
          )}
        />
        {errors.terms && (
          <p className="text-[11px] text-red-500 pl-1">
            {errors.terms.message as string}
          </p>
        )}
      </div>

      {/* Marketing */}
      <Controller
        control={control}
        name="marketing"
        render={({ field }) => (
          <label
            htmlFor="marketing"
            className="flex items-start gap-3 cursor-pointer rounded-[10px] p-3 border transition-all"
            style={{
              background: "rgba(240,250,243,0.6)",
              borderColor: "rgba(226,232,240,0.7)",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(26,122,66,0.3)";
              (e.currentTarget as HTMLElement).style.background = "#F0FAF3";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(226,232,240,0.7)";
              (e.currentTarget as HTMLElement).style.background =
                "rgba(240,250,243,0.6)";
            }}
          >
            <input
              id="marketing"
              type="checkbox"
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              className="mt-0.5 shrink-0 accent-[#1A7A42]"
            />
            <span
              className="text-xs leading-relaxed"
              style={{ color: "#3D6B4F" }}
            >
              I&apos;d like to receive marketing tips and business updates from
              GoMarket.
            </span>
          </label>
        )}
      />
    </div>
  );
}

// ─── Country dial codes ───────────────────────────────────────────────────────

const COUNTRIES = [
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+233", flag: "🇬🇭", name: "Ghana" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+251", flag: "🇪🇹", name: "Ethiopia" },
  { code: "+255", flag: "🇹🇿", name: "Tanzania" },
  { code: "+256", flag: "🇺🇬", name: "Uganda" },
  { code: "+237", flag: "🇨🇲", name: "Cameroon" },
  { code: "+225", flag: "🇨🇮", name: "Côte d'Ivoire" },
  { code: "+221", flag: "🇸🇳", name: "Senegal" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
];

function PhoneInput({
  dialCode,
  onDialCodeChange,
  inputProps,
}: {
  dialCode: string;
  onDialCodeChange: (code: string) => void;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const selected = COUNTRIES.find((c) => c.code === dialCode) ?? COUNTRIES[0];

  return (
    <div
      className="flex rounded-[10px] border overflow-hidden transition-all focus-within:outline focus-within:outline-2 focus-within:outline-offset-[-2px]"
      style={
        {
          borderColor: "#e2e8f0",
          outlineColor: "#1A7A42",
        } as React.CSSProperties
      }
    >
      {/* Country selector */}
      <div
        className="relative shrink-0 border-r"
        style={{ borderColor: "#e2e8f0" }}
      >
        <select
          value={dialCode}
          onChange={(e) => onDialCodeChange(e.target.value)}
          aria-label="Country code"
          className="h-[42px] pl-3 pr-7 text-[13px] font-semibold appearance-none bg-transparent cursor-pointer focus:outline-none"
          style={{ color: "#1C1C1C" }}
        >
          {COUNTRIES.map((c, i) => (
            <option key={`${c.code}-${i}`} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        {/* Chevron icon */}
        <span
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px]"
          style={{ color: "#9ca3af" }}
        >
          ▾
        </span>
      </div>

      {/* Local number */}
      <input
        type="tel"
        autoComplete="tel-national"
        placeholder={selected.code === "+234" ? "800 000 0000" : "Local number"}
        className="flex-1 h-[42px] px-3 text-[13px] bg-white focus:outline-none placeholder:text-[#9ca3af]"
        style={{ color: "#1C1C1C" }}
        {...inputProps}
      />
    </div>
  );
}

function PrimaryButton({
  loading,
  label,
  onClick,
  disabled,
}: {
  loading: boolean;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full h-[42px] rounded-[10px] text-white text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      style={{
        background: "#0A2E1A",
        letterSpacing: "0.04em",
        boxShadow: "0 4px 14px rgba(26,122,66,0.3)",
      }}
      onMouseOver={(e) =>
        !(loading || disabled) && (e.currentTarget.style.background = "#239452")
      }
      onMouseOut={(e) => (e.currentTarget.style.background = "#0A2E1A")}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : label}
    </button>
  );
}
