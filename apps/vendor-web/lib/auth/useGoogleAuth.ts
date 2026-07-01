"use client";

import { useEffect, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type G = any;

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export interface GoogleAuthResult {
  credential: string; // id_token — send to POST /v1/auth/oauth/google
  email: string;
  name: string;
  picture: string;
}

// ── Module-level singleton ────────────────────────────────────────────────────
// GSI must only be initialized ONCE per page. Storing state at module level
// prevents the "initialized multiple times" warning when the hook is used
// in both LoginForm and SignupForm on the same page.

let gsiReady = false;
let gsiLoading = false;
const readyCallbacks: Array<() => void> = [];
let pendingResolve: ((r: GoogleAuthResult) => void) | null = null;
let pendingReject: ((e: Error) => void) | null = null;

function decodeCredential(credential: string): { email: string; name: string; picture: string } {
  try {
    const payload = JSON.parse(
      atob(credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return { email: payload.email ?? "", name: payload.name ?? "", picture: payload.picture ?? "" };
  } catch {
    return { email: "", name: "", picture: "" };
  }
}

function onCredential(response: G) {
  if (!response?.credential) {
    pendingReject?.(new Error("No credential returned from Google"));
    pendingReject = null; pendingResolve = null;
    return;
  }
  const { email, name, picture } = decodeCredential(response.credential);
  pendingResolve?.({ credential: response.credential, email, name, picture });
  pendingResolve = null; pendingReject = null;
}

function initGSI() {
  const g: G = (window as G).google;
  if (!g?.accounts?.id || gsiReady) return;
  g.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: onCredential,
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: true,
    itp_support: true,
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
    el.id = id; el.src = "https://accounts.google.com/gsi/client"; el.async = true;
    el.onload = initGSI;
    document.head.appendChild(el);
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGoogleAuth() {
  const [ready, setReady] = useState(gsiReady);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    ensureGSI(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !buttonRef.current) return;
    const g: G = (window as G).google;
    if (!g?.accounts?.id) return;
    // Render a native Google button inside the ref div. Clicking it triggers
    // the FedCM-compatible sign-in popup and fires the onCredential callback.
    g.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: buttonRef.current.offsetWidth || 360,
    });
  }, [ready]);

  function signIn(): Promise<GoogleAuthResult> {
    return new Promise((resolve, reject) => {
      if (!CLIENT_ID) {
        reject(new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured")); return;
      }
      if (!gsiReady) {
        reject(new Error("Google Sign-In is still loading — please try again")); return;
      }

      pendingResolve = resolve;
      pendingReject = reject;

      // Click the native Google button rendered inside buttonRef.
      // This is FedCM-safe and avoids the deprecated prompt() flow.
      const nativeBtn = buttonRef.current?.querySelector<HTMLElement>("div[role=button]");
      if (nativeBtn) {
        nativeBtn.click();
      } else {
        // Fallback to prompt() if native button isn't rendered yet
        (window as G).google?.accounts?.id?.prompt((n: G) => {
          if (n?.isNotDisplayed?.() || n?.isSkippedMoment?.()) {
            pendingResolve = null; pendingReject = null;
            reject(new Error("Google Sign-In was cancelled or blocked by the browser. Try disabling any extensions that block sign-in."));
          }
        });
      }

      setTimeout(() => {
        if (pendingReject === reject) {
          pendingResolve = null; pendingReject = null;
          reject(new Error("Google Sign-In timed out"));
        }
      }, 120_000);
    });
  }

  return { signIn, buttonRef, ready: ready && !!CLIENT_ID, configured: !!CLIENT_ID };
}
