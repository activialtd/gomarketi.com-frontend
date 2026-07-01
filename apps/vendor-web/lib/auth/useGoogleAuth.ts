"use client";

import { useEffect, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type G = any;

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export interface GoogleAuthResult {
  /** Raw Google id_token — send this to POST /v1/auth/oauth/google */
  credential: string;
  email: string;
  name: string;
  picture: string;
}

/**
 * Wraps Google Identity Services (GSI) One Tap.
 *
 * Returns:
 *   - signIn(): triggers Google sign-in, resolves with credential on success
 *   - ready: true once the GSI script is loaded and CLIENT_ID is set
 *
 * Setup: set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local and
 * add http://localhost:3000 + your production URL as authorized origins
 * in Google Cloud Console → OAuth 2.0 credentials.
 */
export function useGoogleAuth() {
  const [ready, setReady] = useState(false);
  const callbackRef = useRef<((r: GoogleAuthResult | null) => void) | null>(null);

  useEffect(() => {
    if (!CLIENT_ID) return;

    function initGSI() {
      const g: G = (window as G).google;
      if (!g?.accounts?.id) return;

      g.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response: G) => {
          if (!response?.credential) {
            callbackRef.current?.(null);
            return;
          }
          // Decode JWT payload to get display info (signature verified by backend)
          let email = "";
          let name = "";
          let picture = "";
          try {
            const payload = JSON.parse(
              atob(response.credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
            );
            email = payload.email ?? "";
            name = payload.name ?? "";
            picture = payload.picture ?? "";
          } catch { /* non-fatal */ }

          callbackRef.current?.({ credential: response.credential, email, name, picture });
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
      });

      setReady(true);
    }

    const id = "google-gsi-script";
    if ((window as G).google?.accounts?.id) {
      initGSI();
    } else if (!document.getElementById(id)) {
      const el = document.createElement("script");
      el.id = id;
      el.src = "https://accounts.google.com/gsi/client";
      el.async = true;
      el.onload = initGSI;
      document.head.appendChild(el);
    } else {
      document.getElementById(id)!.addEventListener("load", initGSI, { once: true });
    }
  }, []);

  function signIn(): Promise<GoogleAuthResult> {
    return new Promise((resolve, reject) => {
      if (!CLIENT_ID) {
        reject(new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured"));
        return;
      }
      const g: G = (window as G).google;
      if (!g?.accounts?.id) {
        reject(new Error("Google Sign-In is still loading — please try again"));
        return;
      }

      callbackRef.current = (result) => {
        callbackRef.current = null;
        if (result) resolve(result);
        else reject(new Error("Google Sign-In was cancelled"));
      };

      g.accounts.id.prompt((notification: G) => {
        // One Tap may be suppressed (e.g. user dismissed it before, browser settings).
        // Fall back to the Google OAuth popup in that case.
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          callbackRef.current = null;
          reject(new Error("one_tap_unavailable"));
        }
      });
    });
  }

  return { signIn, ready: ready && !!CLIENT_ID, configured: !!CLIENT_ID };
}
