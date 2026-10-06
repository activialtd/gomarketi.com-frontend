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
export type StatusStep = { key: OrderStatus; label: string; icon: string };

export const STATUS_STEPS: StatusStep[] = [
  { key: "confirmed", label: "Confirmed", icon: "checkmark-circle" },
  { key: "at_hub", label: "At GoMarketi hub", icon: "business" },
  { key: "shipped", label: "Out for delivery", icon: "bicycle" },
  { key: "delivered", label: "Delivered", icon: "home" },
];

// An order the buyer is collecting never goes out for delivery, and never
// passes through the hub — the vendor sets it aside and the buyer walks in.
// Showing it the delivery timeline would promise a rider who isn't coming.
const PICKUP_STEPS: StatusStep[] = [
  { key: "confirmed", label: "Confirmed", icon: "checkmark-circle" },
  { key: "ready_for_collection", label: "Ready to collect", icon: "bag-check" },
  { key: "delivered", label: "Collected", icon: "checkmark-done" },
];

export function stepsFor(isPickup: boolean): StatusStep[] {
  return isPickup ? PICKUP_STEPS : STATUS_STEPS;
}

function stepIndex(steps: StatusStep[], status: OrderStatus): number {
  const i = steps.findIndex((s) => s.key === status);
  return i === -1 ? 0 : i; // "pending"/"cancelled" fall back to the first step visually
}

// The buyer confirms receipt on anything the vendor has handed over: a
// dispatched parcel, or one waiting to be collected.
export function awaitsConfirmation(o: OrderResp): boolean {
  return (o.status === "shipped" || o.status === "ready_for_collection") && !o.delivery_confirmed_at;
}

export type BatchSummary = {
  label: string;
  activeIdx: number;
  steps: StatusStep[];
  isPickup: boolean;
  allCancelled: boolean;
  anyCancelled: boolean;
  anyAwaitingConfirmation: boolean; // at least one handed-over order the buyer hasn't confirmed yet
};

// A batch is only as far along as its least-advanced (non-cancelled) order —
// GoMarketi dispatches vendors together, so the honest customer-facing
// status is "what's the slowest part of my order doing".
export function summarizeBatch(orders: OrderResp[]): BatchSummary {
  const live = orders.filter((o) => o.status !== "cancelled");
  const allCancelled = live.length === 0;
  const anyCancelled = orders.some((o) => o.status === "cancelled");

  // Only a wholly collected basket gets the collection timeline. A mixed
  // basket still involves a rider for part of it, so the delivery steps are
  // the ones that describe it.
  const isPickup = live.length > 0 && live.every((o) => !!o.is_pickup);
  const steps = stepsFor(isPickup);

  if (allCancelled) {
    return {
      label: "Cancelled", activeIdx: -1, steps, isPickup: false,
      allCancelled: true, anyCancelled: true, anyAwaitingConfirmation: false,
    };
  }

  const activeIdx = Math.min(...live.map((o) => stepIndex(steps, o.status)));
  const anyAwaitingConfirmation = live.some(awaitsConfirmation);

  return {
    label: steps[activeIdx]?.label ?? "Confirmed",
    activeIdx,
    steps,
    isPickup,
    allCancelled: false,
    anyCancelled,
    anyAwaitingConfirmation,
  };
}
