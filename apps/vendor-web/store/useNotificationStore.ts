"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotificationKind = "order" | "wallet" | "system" | "success";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  /** ISO timestamp — formatted for display at render time, not stored pre-formatted. */
  createdAt: string;
  read: boolean;
  href?: string;
}

export interface Toast {
  id: string;
  title: string;
  body?: string;
}

/**
 * How many notifications to keep. The bell is a recent-activity list, not an
 * archive: orders and payouts have their own pages, which is where the
 * notification links to.
 */
const MAX_ITEMS = 50;

interface NotificationState {
  items: AppNotification[];
  /** Transient — never persisted, or a refresh would replay old toasts. */
  toasts: Toast[];
  push: (n: {
    kind?: NotificationKind;
    title: string;
    body?: string;
    href?: string;
    /** Some events are worth recording without interrupting the vendor. */
    silent?: boolean;
  }) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      items: [],
      toasts: [],

      push: ({ kind = "system", title, body, href, silent }) =>
        set((state) => {
          const entry: AppNotification = {
            // randomUUID is unavailable on insecure origins, which is exactly
            // where a vendor on a LAN IP tests the dashboard.
            id:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            kind,
            title,
            body,
            href,
            createdAt: new Date().toISOString(),
            read: false,
          };
          return {
            items: [entry, ...state.items].slice(0, MAX_ITEMS),
            toasts: silent ? state.toasts : [...state.toasts, { id: entry.id, title, body }],
          };
        }),

      markAllRead: () =>
        set((state) => ({ items: state.items.map((n) => ({ ...n, read: true })) })),

      markRead: (id) =>
        set((state) => ({
          items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      dismissToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      clearAll: () => set({ items: [] }),
    }),
    {
      name: "gm-vendor-notifications",
      // Only the inbox survives a reload; toasts are a momentary interruption
      // and replaying them on every refresh would be noise.
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

/** Unread count, derived rather than stored so it cannot drift from the list. */
export const selectUnreadCount = (s: NotificationState) =>
  s.items.reduce((n, i) => n + (i.read ? 0 : 1), 0);

/** "just now" / "4m" / "3h" / "2d" — compact enough for the popover rows. */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return "just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
