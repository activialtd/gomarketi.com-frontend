"use client";

import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type G = any;

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// Key stored on window so it persists across HMR module re-evaluations.
// Module-level variables reset on hot reload; window does not.
const WIN_KEY = "__gm_gsi_initialized__";

export interface GoogleAuthResult {
  credential: string;
  email: string;
  name: string;
  picture: string;
}

// ── Module-level state (fast path; backed by window for HMR resilience) ──────
let gsiLoading = false;
const readyCallbacks: Array<() => void> = [];
let pendingResolve: ((r: GoogleAuthResult) => void) | null = null;
let pendingReject: ((e: Error) => void) | null = null;

function isInitialized(): boolean {
  return typeof window !== "undefined" && !!(window as G)[WIN_KEY];
}

function markInitialized() {
  if (typeof window !== "undefined") (window as G)[WIN_KEY] = true;
}

function decodeCredential(credential: string) {
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
  if (!g?.accounts?.id) return;

  // Guard against calling initialize() more than once — the warning
  // "initialized multiple times" fires even when the SAME config is passed.
  // We store the flag on window so HMR module reloads don't reset it.
  if (isInitialized()) {
    // Script already loaded and initialized; just fire pending callbacks.
    readyCallbacks.splice(0).forEach((cb) => cb());
    return;
  }

  g.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: onCredential,
    auto_select: false,
    cancel_on_tap_outside: true,
    // Do NOT set use_fedcm_for_prompt — causes NetworkError when FedCM is
    // disabled in the user's browser settings.
  });

  markInitialized();
  readyCallbacks.splice(0).forEach((cb) => cb());
}

function ensureGSI(onReady: () => void) {
  if (isInitialized()) { onReady(); return; }
  readyCallbacks.push(onReady);
  if (gsiLoading) return;
  gsiLoading = true;

  // Script may already be on the page (e.g. after HMR) but not yet executed.
  if ((window as G).google?.accounts?.id) {
    initGSI();
    return;
  }

  const id = "google-gsi-script";
  if (!document.getElementById(id)) {
    const el = document.createElement("script");
    el.id = id;
    el.src = "https://accounts.google.com/gsi/client";
    el.async = true;
    el.onload = initGSI;
    document.head.appendChild(el);
  } else {
    // Script tag exists (added by a previous render cycle) — wait for it
    document.getElementById(id)!.addEventListener("load", initGSI, { once: true });
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGoogleAuth() {
  const [ready, setReady] = useState(isInitialized);

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
      if (!isInitialized()) {
        reject(new Error("Google Sign-In is still loading — please try again"));
        return;
      }

      pendingResolve = resolve;
      pendingReject = reject;

      (window as G).google.accounts.id.prompt((notification: G) => {
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
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

      setTimeout(() => {
        if (pendingReject === reject) {
          pendingResolve = null;
          pendingReject = null;
          reject(new Error("Google Sign-In timed out"));
        }
      }, 120_000);
    });
  }

  const buttonRef = { current: null as HTMLDivElement | null };
  return { signIn, buttonRef, ready: ready && !!CLIENT_ID, configured: !!CLIENT_ID };
}
