"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart, type CustomerInfo } from "@/lib/cartContext";
import {
  ApiError,
  ordersApi,
  type CreateOrderReq,
  type DeliveryOptionResp,
  type OrderResp,
} from "@gomarket/api-client";

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^(0|\+234)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  address: z.string().min(8, "Enter your full delivery address"),
  city: z.string().min(2, "Required"),
  state: z.string().min(2, "Required"),
  note: z.string().optional(),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export function fmtNaira(kobo: number) {
  return (
    "₦" + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 })
  );
}

// Kept for any other file that still imports them. Delivery pricing now
// comes from DELIVERY_ZONES below.
export const FREE_SHIPPING_THRESHOLD_KOBO = 5_000_000;
export const FLAT_SHIPPING_KOBO = 150_000;

// ── Delivery zones ────────────────────────────────────────────────────────────
// Zones now come from the store: each vendor defines their own delivery
// options (title, note, price) in the dashboard, and the orders service prices
// the chosen one server-side. DELIVERY_ZONES below is the fallback used only
// for stores that have not configured any options yet.

export type DeliveryZone = {
  id: string;
  name: string;
  feeKobo: number;
  note: string;
  /** True when this zone came from the store's own options. */
  fromStore?: boolean;
};

// toZones maps the store's delivery options onto the shape the checkout UI
// already renders, so only the source of the list changes.
export function toZones(options: DeliveryOptionResp[] | undefined): DeliveryZone[] {
  if (!options?.length) return DELIVERY_ZONES;
  return options
    .filter((o) => o.is_active)
    .map((o) => ({
      id: o.id,
      name: o.title,
      feeKobo: o.price_kobo,
      note: o.description,
      fromStore: true,
    }));
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: "ogba",
    name: "Ogba Busstop",
    feeKobo: 150_000,
    note: "If your package is big, the dispatch company will call you to balance up.",
  },
  {
    id: "festac",
    name: "Festac",
    feeKobo: 400_000,
    note: "If your package is big, you will be called to balance up.",
  },
  {
    id: "abeokuta",
    name: "Abeokuta",
    feeKobo: 300_000,
    note: "If your package is big, you will be called to balance up.",
  },
  {
    id: "ikeja",
    name: "Ikeja",
    feeKobo: 250_000,
    note: "Standard delivery. Dispatch may call for oversized items.",
  },
  {
    id: "lekki",
    name: "Lekki / Ajah",
    feeKobo: 350_000,
    note: "Standard delivery. Dispatch may call for oversized items.",
  },
  {
    id: "vi",
    name: "Victoria Island",
    feeKobo: 300_000,
    note: "Standard delivery",
  },
  {
    id: "yaba",
    name: "Yaba / Surulere",
    feeKobo: 200_000,
    note: "Standard delivery",
  },
  { id: "ikoyi", name: "Ikoyi", feeKobo: 300_000, note: "Standard delivery" },
  { id: "magodo", name: "Magodo", feeKobo: 250_000, note: "Standard delivery" },
  {
    id: "gbagada",
    name: "Gbagada",
    feeKobo: 200_000,
    note: "Standard delivery",
  },
];

// When true, Paystack charges items + delivery and the order sends the same
// delivery_fee_kobo; the orders service verifies Paystack against that sum.
// Requires the backend change that adds delivery_fee_kobo to the verify step.
// Set to false to fall back to charging items only (delivery paid on arrival).
export const CHARGE_DELIVERY_AT_CHECKOUT = true;

export type CheckoutProps = {
  storeId: string | null;
  storeSlug?: string;
  storeName?: string;
  /** Unused while delivery is priced by zone. Kept so callers don't break. */
  deliveryFeeKobo?: number;
  /** Unused while delivery is priced by zone. Kept so callers don't break. */
  freeDeliveryThresholdKobo?: number;
  /** The store's own delivery options, from the public store payload. */
  deliveryOptions?: DeliveryOptionResp[];
};

// ── Pending-order recovery ────────────────────────────────────────────────────
// TODO(backend): temporary pay-then-create flow. Replace with server-side
// checkout init (order created before payment) + webhook verify.

const PENDING_KEY = "gm_pending_order";

function readPending(): CreateOrderReq | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as CreateOrderReq) : null;
  } catch {
    return null;
  }
}

function writePending(payload: CreateOrderReq) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  } catch {
    // storage unavailable; in-session retries still work
  }
}

function clearPending() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    // ignore
  }
}

function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    const fieldMsgs = err.fields?.map((f) => `${f.field}: ${f.message}`);
    return fieldMsgs?.length
      ? `${err.message} (${fieldMsgs.join(", ")})`
      : err.message;
  }
  return err instanceof Error ? err.message : "network error";
}

// Retries transient failures (network / 5xx). A 4xx means the payload is
// wrong, so retrying won't help, except 409, which may mean an earlier
// attempt already saved the order.
async function submitOrder(payload: CreateOrderReq): Promise<OrderResp> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await ordersApi.createOrder(payload);
    } catch (err) {
      lastErr = err;
      console.error(`createOrder attempt ${attempt + 1} failed`, err);
      if (
        err instanceof ApiError &&
        err.status >= 400 &&
        err.status < 500 &&
        err.status !== 409
      ) {
        break;
      }
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastErr;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCheckout({
  storeId,
  storeSlug = "",
  storeName,
  deliveryOptions,
}: CheckoutProps) {
  const router = useRouter();
  const { lines, setCustomer, clearCart } = useCart();

  const [isPlacing, setIsPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [showPaystack, setShowPaystack] = useState(false);
  const [pendingCustomer, setPendingCustomer] = useState<CustomerInfo | null>(
    null,
  );
  const [orderError, setOrderError] = useState("");
  const deliveryZones = toZones(deliveryOptions);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>(
    deliveryZones[0],
  );

  // Zone locked in when the customer pressed Place order
  const pendingZone = useRef<DeliveryZone>(deliveryZones[0]);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const storeReady = storeId != null;

  // Items total computed from the exact integers sent to the backend, so the
  // amount Paystack charges always equals the total the backend verifies.
  const unitKobo = (price: number) => Math.round(price);
  const subtotal = lines.reduce(
    (sum, l) => sum + unitKobo(l.unitPrice) * l.quantity,
    0,
  );

  const allDigital = lines.length > 0 && lines.every((l) => l.isDigital);
  const shipping = allDigital ? 0 : deliveryZone.feeKobo;
  const chargedShipping = CHARGE_DELIVERY_AT_CHECKOUT ? shipping : 0;
  const deliveryPaidLater = !CHARGE_DELIVERY_AT_CHECKOUT && shipping > 0;
  const total = subtotal + chargedShipping; // pass exactly this (kobo) to Paystack

  // Resubmit an order whose payment went through but whose save failed on a
  // previous visit (failed request, closed tab, dropped network).
  const recoveryRan = useRef(false);
  useEffect(() => {
    if (recoveryRan.current) return;
    recoveryRan.current = true;
    const pending = readPending();
    if (!pending) return;
    submitOrder(pending)
      .then(() => clearPending())
      .catch((err) => console.error("pending order recovery failed", err));
  }, []);

  function onSubmit(data: CheckoutValues) {
    if (lines.length === 0) return;
    if (!storeReady) {
      setOrderError("Store details are still loading. Try again in a moment.");
      return;
    }
    setOrderError("");
    const customerInfo: CustomerInfo = { ...data };
    setCustomer(customerInfo);
    setPendingCustomer(customerInfo);
    pendingZone.current = deliveryZone;
    setShowPaystack(true);
  }

  async function handlePaystackSuccess(ref: string) {
    setShowPaystack(false);
    if (!storeId || !pendingCustomer) {
      setOrderError(
        `Payment received but checkout details were lost. Contact the store with reference ${ref}.`,
      );
      return;
    }

    // No delivery or note field on the order yet, so the vendor sees the
    // chosen zone and note inside the delivery address.
    const zone = pendingZone.current;
    const zoneFee = allDigital ? 0 : zone.feeKobo;
    const addressParts = [
      `${pendingCustomer.address}, ${pendingCustomer.city}, ${pendingCustomer.state}`,
    ];
    if (!allDigital) {
      addressParts.push(
        `Delivery: ${zone.name} (${fmtNaira(zone.feeKobo)}${
          CHARGE_DELIVERY_AT_CHECKOUT ? ", paid" : ", pay on delivery"
        })`,
      );
    }
    if (pendingCustomer.note?.trim()) {
      addressParts.push(`Note: ${pendingCustomer.note.trim()}`);
    }

    const payload: CreateOrderReq = {
      store_id: storeId,
      store_slug: storeSlug || undefined,
      store_name: storeName,
      customer_name: pendingCustomer.fullName,
      customer_email: pendingCustomer.email,
      customer_phone: pendingCustomer.phone,
      delivery_address: addressParts.join(" | "),
      items: lines.map((l) => ({
        product_id: l.productId,
        name: l.productName,
        image_url: l.productImage,
        quantity: l.quantity,
        price_kobo: unitKobo(l.unitPrice),
      })),
      // For store-defined zones the server reads the price from its own
      // option row; delivery_fee_kobo is only used by stores with no options.
      delivery_option_id:
        zone.fromStore && CHARGE_DELIVERY_AT_CHECKOUT && !allDigital
          ? zone.id
          : undefined,
      delivery_fee_kobo:
        zone.fromStore || !CHARGE_DELIVERY_AT_CHECKOUT ? 0 : zoneFee,
      payment_reference: ref,
    };

    // Save before the network call so a paid order is never lost.
    writePending(payload);

    setIsPlacing(true);
    try {
      const order = await submitOrder(payload);
      clearPending();
      setOrderNumber(`#${order.id.slice(0, 8).toUpperCase()}`);
      clearCart();
      if (storeSlug) {
        router.push(
          `/orders/${order.id}?email=${encodeURIComponent(pendingCustomer.email)}`,
        );
      } else {
        setOrderPlaced(true);
      }
    } catch (err) {
      console.error("createOrder failed", err);
      setOrderError(
        `Payment received, but the order wasn't saved yet (${describeError(err)}). Reference: ${ref}. We'll retry automatically next time you open checkout.`,
      );
    } finally {
      setIsPlacing(false);
    }
  }

  return {
    form,
    lines,
    subtotal,
    shipping,
    total,
    allDigital,
    deliveryPaidLater,
    deliveryZone,
    setDeliveryZone,
    deliveryZones,
    storeReady,
    isPlacing,
    orderPlaced,
    orderNumber,
    showPaystack,
    pendingCustomer,
    orderError,
    setShowPaystack,
    onSubmit,
    handlePaystackSuccess,
  };
}
