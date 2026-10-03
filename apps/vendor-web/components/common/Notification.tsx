"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@gomarket/ui";
import {
  ShoppingBag,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  formatRelative,
  selectUnreadCount,
  useNotificationStore,
  type NotificationKind,
} from "@/store/useNotificationStore";

const KIND_STYLES: Record<
  NotificationKind,
  { bg: string; icon: React.ReactNode }
> = {
  order: {
    bg: "bg-emerald-50 text-emerald-700",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  wallet: {
    bg: "bg-blue-50 text-blue-700",
    icon: <Wallet className="h-4 w-4" />,
  },
  system: {
    bg: "bg-amber-50 text-amber-700",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  success: {
    bg: "bg-emerald-50 text-emerald-700",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
};

export default function NotificationsPopover() {
  const items = useNotificationStore((s) => s.items);
  const unreadCount = useNotificationStore(selectUnreadCount);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const markRead = useNotificationStore((s) => s.markRead);

  // The list is persisted, so the server renders an empty one and the client
  // rehydrates with the vendor's own. Gate on mount to keep the two agreeing.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Relative timestamps go stale while the dashboard sits open all day.
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const shown = hydrated ? items : [];
  const badge = hydrated ? unreadCount : 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={`Notifications${badge ? `, ${badge} unread` : ""}`}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-muted transition hover:bg-surface hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {badge > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[340px] p-0" sideOffset={8}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="text-xs text-muted">
              {badge === 0 ? "You're all caught up" : `${badge} unread`}
            </p>
          </div>
          {badge > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        {shown.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
              <Bell className="h-5 w-5 text-muted" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              No notifications yet
            </p>
            <p className="mt-1 text-xs text-muted">
              Orders, payouts and alerts will show up here.
            </p>
          </div>
        ) : (
          <ul className="max-h-[360px] divide-y divide-border overflow-y-auto">
            {shown.map((n) => {
              const style = KIND_STYLES[n.kind] ?? KIND_STYLES.system;
              const Row = (
                <div className="flex gap-3 px-4 py-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.bg}`}
                  >
                    {style.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                        {n.body}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-muted/80">
                      {formatRelative(n.createdAt)}
                    </p>
                  </div>
                </div>
              );

              return (
                <li key={n.id}>
                  {n.href ? (
                    <Link
                      href={n.href}
                      onClick={() => markRead(n.id)}
                      className="block transition hover:bg-surface"
                    >
                      {Row}
                    </Link>
                  ) : (
                    <button
                      onClick={() => markRead(n.id)}
                      className="block w-full text-left transition hover:bg-surface"
                    >
                      {Row}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
