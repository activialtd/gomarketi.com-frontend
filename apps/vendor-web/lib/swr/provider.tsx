"use client";

import { SWRConfig } from "swr";

/**
 * Wrap the dashboard layout with this to apply global SWR defaults.
 *
 * Key settings:
 * - revalidateOnReconnect: true  — refresh when user comes back online
 * - shouldRetryOnError: true     — retry failed fetches (network blips)
 * - errorRetryCount: 3           — don't retry forever
 * - provider: () => new Map()    — in-memory cache per page session
 *   (swapping to localStorage would persist across hard refreshes too,
 *   but risks showing very stale data — in-memory is safer for a dashboard)
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnReconnect: true,
        revalidateOnFocus: false, // individual hooks override as needed
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        // Keep a fresh in-memory Map per browser session.
        // Data survives navigation but clears on hard refresh — right tradeoff
        // for a real-time dashboard where accuracy matters.
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
}
