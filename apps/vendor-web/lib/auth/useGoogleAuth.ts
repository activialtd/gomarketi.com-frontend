"use client";

import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type G = any;

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// Store the initialization Promise on window so it is shared across:
//  - multiple components calling useGoogleAuth() at the same time
//  - HMR module re-evaluations (module vars reset, window does not)
//  - React StrictMode double-effect invocations
// Using a Promise guarantees initialize() is called AT MOST ONCE regardless
// of how many concurrent callers there are.
const WIN_KEY = "__gm_gsi_init_promise__";

export interface GoogleAuthResult {
  credential: string;
  email: string;
  name: string;
  picture: string;
}

let pendingResolve: ((r: GoogleAuthResult) => void) | null = null;
let pendingReject: ((e: Error) => void) | null = null;

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

// Returns a Promise that resolves once GSI is loaded and initialized.
// The Promise is stored on window so all callers share the exact same
// instance — initialize() can never be called more than once.
function getGSIPromise(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const win = window as G;

  // Already have a promise (from this or a previous mount/HMR cycle) — reuse it
  if (win[WIN_KEY]) return win[WIN_KEY] as Promise<void>;

  const promise = new Promise<void>((resolve) => {
    function doInitialize() {
      const g = win.google;
      if (!g?.accounts?.id) return;

      // Double-check: if another concurrent call sneaked in and already
      // initialized (shouldn't happen with the Promise guard, but be safe)
      if (win[WIN_KEY + "_done"]) {
        resolve();
        return;
      }

      win[WIN_KEY + "_done"] = true;
      g.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: onCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        // Do NOT set use_fedcm_for_prompt — causes NetworkError when FedCM
        // is disabled in the browser.
      });
      resolve();
    }

    // Script might already be on the page (from a previous mount / HMR cycle)
    if (win.google?.accounts?.id) {
      doInitialize();
      return;
    }

    const scriptId = "google-gsi-script";
    if (!document.getElementById(scriptId)) {
      const el = document.createElement("script");
      el.id = scriptId;
      el.src = "https://accounts.google.com/gsi/client";
      el.async = true;
      el.onload = doInitialize;
      document.head.appendChild(el);
    } else {
      // Script tag exists but hasn't fired onload yet — wait for it
      document.getElementById(scriptId)!
        .addEventListener("load", doInitialize, { once: true });
    }
  });

  // Store on window BEFORE returning so concurrent callers get the same promise
  win[WIN_KEY] = promise;
  return promise;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGoogleAuth() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    getGSIPromise().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  function signIn(): Promise<GoogleAuthResult> {
    return new Promise((resolve, reject) => {
      if (!CLIENT_ID) {
        reject(new Error("Google Sign-In is not configured on this deployment"));
        return;
      }
      if (!(window as G).google?.accounts?.id) {
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
