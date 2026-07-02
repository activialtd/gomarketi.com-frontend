"use client";

import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type G = any;

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export interface GoogleAuthResult {
  credential: string; // id_token — POST to /v1/auth/oauth/google
  email: string;
  name: string;
  picture: string;
}

// ── Module-level singleton ────────────────────────────────────────────────────
// GSI must only be initialized ONCE per page load. Module-level state prevents
// re-initialization when the hook is used in multiple components simultaneously.

let gsiReady = false;
let gsiLoading = false;
const readyCallbacks: Array<() => void> = [];
let pendingResolve: ((r: GoogleAuthResult) => void) | null = null;
let pendingReject: ((e: Error) => void) | null = null;

function decodeCredential(credential: string) {
  try {
    const payload = JSON.parse(
      atob(credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return {
      email: payload.email ?? "",
      name: payload.name ?? "",
      picture: payload.picture ?? "",
    };
  } catch {
    return { email: "", name: "", picture: "" };
  }
}

function onCredential(response: G) {
  if (!response?.credential) {
    pendingReject?.(new Error("Google did not return a credential"));
    pendingResolve = null;
    pendingReject = null;
    return;
  }
  const { email, name, picture } = decodeCredential(response.credential);
  pendingResolve?.({ credential: response.credential, email, name, picture });
  pendingResolve = null;
  pendingReject = null;
}

function initGSI() {
  const g: G = (window as G).google;
  if (!g?.accounts?.id || gsiReady) return;
  g.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: onCredential,
    auto_select: false,
    cancel_on_tap_outside: true,
    // Do NOT set use_fedcm_for_prompt — it causes NetworkError when FedCM is
    // disabled in the user's browser settings. Without it, GSI uses the
    // standard popup which works across all browsers.
  });
  gsiReady = true;
  readyCallbacks.splice(0).forEach((cb) => cb());
}

function ensureGSI(onReady: () => void) {
  if (gsiReady) { onReady(); return; }
  readyCallbacks.push(onReady);
  if (gsiLoading) return;
  gsiLoading = true;
  if ((window as G).google?.accounts?.id) { initGSI(); return; }
  const id = "google-gsi-script";
  if (!document.getElementById(id)) {
    const el = document.createElement("script");
    el.id = id;
    el.src = "https://accounts.google.com/gsi/client";
    el.async = true;
    el.onload = initGSI;
    document.head.appendChild(el);
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Provides `signIn()` which triggers Google One Tap / popup sign-in and
 * returns the id_token credential on success.
 *
 * Requirements (Google Cloud Console):
 *   Credentials → your OAuth 2.0 Client → Authorized JavaScript Origins:
 *     - http://localhost:3000          (local vendor-web)
 *     - https://vendor.gomarketi.com  (production)
 *     - https://gomarketi-com-frontend-vendor-web.vercel.app  (Vercel preview)
 */
export function useGoogleAuth() {
  const [ready, setReady] = useState(gsiReady);

  useEffect(() => {
    if (!CLIENT_ID) return;
    ensureGSI(() => setReady(true));
  }, []);

  function signIn(): Promise<GoogleAuthResult> {
    return new Promise((resolve, reject) => {
      if (!CLIENT_ID) {
        reject(new Error("Google Sign-In is not configured on this deployment"));
        return;
      }
      if (!gsiReady) {
        reject(new Error("Google Sign-In is still loading — please try again"));
        return;
      }

      pendingResolve = resolve;
      pendingReject = reject;

      // prompt() shows the Google One Tap overlay / standard sign-in popup.
      // We do NOT use renderButton + programmatic click — that approach requires
      // a DOM element and is fragile across production deployments.
      (window as G).google.accounts.id.prompt((notification: G) => {
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
          // One Tap was suppressed (user dismissed it before, browser policy, etc.)
          // Clear pending so the timeout doesn't fire a stale error later.
          pendingResolve = null;
          pendingReject = null;
          reject(
            new Error(
              "Google Sign-In was unavailable. Make sure pop-ups are allowed " +
              "for this site, then try again."
            )
          );
        }
      });

      // Safety timeout — clear state if callback never fires
      setTimeout(() => {
        if (pendingReject === reject) {
          pendingResolve = null;
          pendingReject = null;
          reject(new Error("Google Sign-In timed out"));
        }
      }, 120_000);
    });
  }

  // buttonRef is kept for backward compat with LoginForm/SignupForm but is
  // no longer used for rendering — just a stub so callers don't need changes.
  const buttonRef = { current: null as HTMLDivElement | null };

  return { signIn, buttonRef, ready: ready && !!CLIENT_ID, configured: !!CLIENT_ID };
}
