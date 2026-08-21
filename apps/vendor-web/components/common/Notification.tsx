import { Popover, PopoverContent, PopoverTrigger } from "@gomarket/ui";
import {
  ShoppingBag,
  Store,
  AlertCircle,
  CheckCircle2,
  Bell,
  Link,
} from "lucide-react";
import { useState } from "react";

type NotificationKind = "order" | "vendor" | "system" | "success";
type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    kind: "order",
    title: "New order received",
    body: "Order #93000074 from Chidera A. — ₦12,500",
    time: "2m ago",
    read: false,
    href: "/merchant/orders",
  },
  {
    id: "n2",
    kind: "success",
    title: "Payout completed",
    body: "₦85,000 sent to Paystack-Titan · 9740176746",
    time: "1h ago",
    read: false,
    href: "/merchant/wallet",
  },
  {
    id: "n3",
    kind: "vendor",
    title: "Store view spike",
    body: "westside.gomarketi.com has 3× normal traffic today",
    time: "4h ago",
    read: true,
    href: "/merchant/analytics",
  },
];

const KIND_STYLES: Record<
  NotificationKind,
  { bg: string; icon: React.ReactNode }
> = {
  order: {
    bg: "bg-emerald-50 text-emerald-700",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  vendor: {
    bg: "bg-blue-50 text-blue-700",
    icon: <Store className="h-4 w-4" />,
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
  const [items, setItems] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    // TODO(backend): POST /api/notifications/read-all
    setItems((cur) => cur.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id: string) => {
    // TODO(backend): POST /api/notifications/:id/read
    setItems((cur) => cur.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-muted transition hover:bg-surface hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[340px] p-0" sideOffset={8}>
        {/* header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Notifications
            </p>
            <p className="text-xs text-muted">
              {unreadCount === 0
                ? "You're all caught up"
                : `${unreadCount} unread`}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* list */}
        {items.length === 0 ? (
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
            {items.map((n) => {
              const style = KIND_STYLES[n.kind];
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
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[11px] text-muted/80">{n.time}</p>
                  </div>
                </div>
              );

              return (
                <li key={n.id}>
                  {n.href ? (
                    <Link
                      href={n.href}
                      onClick={() => markOneRead(n.id)}
                      className="block transition hover:bg-surface"
                    >
                      {Row}
                    </Link>
                  ) : (
                    <button
                      onClick={() => markOneRead(n.id)}
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

        {/* footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-2">
            <Link
              href="/merchant/notifications"
              className="block rounded-md py-2 text-center text-xs font-medium text-primary hover:bg-surface"
            >
              View all notifications
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
