"use client";

import { create } from "zustand";

export interface Toast {
  id: string;
  title: string;
  body?: string;
}

interface NotificationState {
  unreadCount: number;
  toasts: Toast[];
  // Ephemeral, in-memory only — no persisted notification history/inbox.
  // A page refresh clears everything, same as the WebSocket connection
  // itself having to reconnect.
  push: (n: { title: string; body?: string }) => void;
  markAllRead: () => void;
  dismissToast: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 0,
  toasts: [],
  push: (n) =>
    set((state) => ({
      unreadCount: state.unreadCount + 1,
      toasts: [...state.toasts, { id: crypto.randomUUID(), ...n }],
    })),
  markAllRead: () => set({ unreadCount: 0 }),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
