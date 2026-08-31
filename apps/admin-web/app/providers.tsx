"use client";

export default function Providers({ children }: { children: React.ReactNode }) {
  // zustand's persist middleware (see store/useAuthStore.ts) rehydrates the
  // session from localStorage on its own — no extra provider work needed
  // yet. This gets a real AuthProvider once admin-api grows a refresh-token
  // flow, mirroring vendor-web's.
  return <>{children}</>;
}
