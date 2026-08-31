import type { OrderResp, OrderStatus } from "./api-client";

// Order totals are real kobo from the backend — NOT the mock catalog's
// USD-equivalent unit that cart-context's formatNaira()/toNaira() convert
// via NGN_RATE. Using that helper here would silently multiply real Naira
// amounts by 1500. This is the correct, direct kobo -> Naira formatter.
export function formatKobo(kobo: number): string {
  return `₦${Math.round(kobo / 100).toLocaleString()}`;
}

// The real hub-and-spoke lifecycle, in customer-facing language — see
// services/orders/internal/dto/orders.go for the backend's own naming.
// "pending" isn't shown as a step: an order the buyer can see has already
// been paid for, so it's at minimum "confirmed" by the time it exists here.
export const STATUS_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "confirmed", label: "Confirmed", icon: "checkmark-circle" },
  { key: "at_hub", label: "At GoMarketi hub", icon: "business" },
  { key: "shipped", label: "Out for delivery", icon: "bicycle" },
  { key: "delivered", label: "Delivered", icon: "home" },
];

function stepIndex(status: OrderStatus): number {
  const i = STATUS_STEPS.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i; // "pending"/"cancelled" fall back to the first step visually
}

export type BatchSummary = {
  label: string;
  activeIdx: number;
  allCancelled: boolean;
  anyCancelled: boolean;
  anyAwaitingConfirmation: boolean; // at least one shipped order the buyer hasn't confirmed yet
};

// A batch is only as far along as its least-advanced (non-cancelled) order —
// GoMarketi dispatches vendors together, so the honest customer-facing
// status is "what's the slowest part of my order doing".
export function summarizeBatch(orders: OrderResp[]): BatchSummary {
  const live = orders.filter((o) => o.status !== "cancelled");
  const allCancelled = live.length === 0;
  const anyCancelled = orders.some((o) => o.status === "cancelled");

  if (allCancelled) {
    return { label: "Cancelled", activeIdx: -1, allCancelled: true, anyCancelled: true, anyAwaitingConfirmation: false };
  }

  const activeIdx = Math.min(...live.map((o) => stepIndex(o.status)));
  const anyAwaitingConfirmation = live.some((o) => o.status === "shipped" && !o.delivery_confirmed_at);

  return {
    label: STATUS_STEPS[activeIdx]?.label ?? "Confirmed",
    activeIdx,
    allCancelled: false,
    anyCancelled,
    anyAwaitingConfirmation,
  };
}
