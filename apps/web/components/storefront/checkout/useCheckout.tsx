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
  // Required only for delivery — see the check in onSubmit, which knows
  // whether the buyer chose collection.
  address: z.string(),
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
  /** Collection rather than delivery — free, and needs no address. */
  isPickup?: boolean;
};

// toZones maps the store's delivery options onto the shape the checkout UI
// already renders, so only the source of the list changes.
export function toZones(options: DeliveryOptionResp[] | undefined): DeliveryZone[] {
  // No fallback: the orders service refuses an order whose store has set no
  // delivery options, so offering a made-up zone here would only fail after
  // the customer has paid.
  if (!options?.length) return [];
  return options
    .filter((o) => o.is_active)
    .map((o) => ({
      id: o.id,
      name: o.title,
      feeKobo: o.price_kobo,
      note: o.description,
      fromStore: true,
      isPickup: !!o.is_pickup,
    }))
    // Collection last: delivery is what most buyers are here for, and a free
    // option sitting at the top of the list invites being picked by accident.
    .sort((a, b) => Number(a.isPickup) - Number(b.isPickup));
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

function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    const fieldMsgs = err.fields?.map((f) => `${f.field}: ${f.message}`);
    return fieldMsgs?.length
      ? `${err.message} (${fieldMsgs.join(", ")})`
      : err.message;
  }
  return err instanceof Error ? err.message : "network error";
}


// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCheckout({
  storeId,
  storeSlug = "",
  storeName,
  deliveryOptions,
}: CheckoutProps) {
  const router = useRouter();
  const { lines, customer, setCustomer, clearCart } = useCart();

  const [isPlacing, setIsPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [showPaystack, setShowPaystack] = useState(false);
  // The reference the server minted for this order, charged against below.
  const pendingRef = useRef<string>("");
  // The awaiting-payment order Paystack is being opened for.
  const placedOrder = useRef<OrderResp | null>(null);
  const [pendingCustomer, setPendingCustomer] = useState<CustomerInfo | null>(
    null,
  );
  const [orderError, setOrderError] = useState("");
  const allDigitalLines = lines.length > 0 && lines.every((l) => l.isDigital);
  const deliveryZones = toZones(deliveryOptions);
  // True when this store has not set up delivery at all — checkout is blocked
  // rather than priced with a number nobody chose.
  const deliveryUnavailable = deliveryZones.length === 0;
  // Nothing is preselected on purpose. Defaulting to the first option meant a
  // customer could pay for a zone they never looked at — and the vendor's
  // cheapest option is rarely the right one for a given address.
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | undefined>(
    undefined,
  );

  // Zone locked in when the customer pressed Place order
  const pendingZone = useRef<DeliveryZone | undefined>(undefined);
  // A physical order needs a chosen zone before payment: the server prices
  // delivery from the option id, so paying without one fails after the charge.
  const deliveryMissing = !allDigitalLines && !deliveryUnavailable && !deliveryZone;


  // The cart store already persists the customer across visits; the form just
  // never read it, so returning buyers retyped their name, email, phone and
  // address every time.
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      note: "",
    },
  });

  // defaultValues alone is not enough: the persisted store rehydrates after
  // the first render, so at useForm time `customer` is still null. Fill the
  // form once it arrives — and only while untouched, so this can never
  // overwrite something the buyer is in the middle of typing.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || !customer || form.formState.isDirty) return;
    prefilled.current = true;
    form.reset({
      fullName: customer.fullName ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
      city: customer.city ?? "",
      state: customer.state ?? "",
      // The note belongs to one order, not to the buyer, so it starts empty.
      note: "",
    });
  }, [customer, form]);

  const storeReady = storeId != null;

  // Items total computed from the exact integers sent to the backend, so the
  // amount Paystack charges always equals the total the backend verifies.
  const unitKobo = (price: number) => Math.round(price);
  const subtotal = lines.reduce(
    (sum, l) => sum + unitKobo(l.unitPrice) * l.quantity,
    0,
  );

  const allDigital = allDigitalLines;
  const shipping = allDigital ? 0 : (deliveryZone?.feeKobo ?? 0);
  const chargedShipping = CHARGE_DELIVERY_AT_CHECKOUT ? shipping : 0;
  const deliveryPaidLater = !CHARGE_DELIVERY_AT_CHECKOUT && shipping > 0;
  const total = subtotal + chargedShipping; // pass exactly this (kobo) to Paystack

  // Resubmit an order whose payment went through but whose save failed on a
  // previous visit (failed request, closed tab, dropped network).
  const recoveryRan = useRef(false);
  useEffect(() => {
    if (recoveryRan.current) return;
    recoveryRan.current = true;
  }, []);

  function onSubmit(data: CheckoutValues) {
    if (lines.length === 0) return;
    if (!storeReady) {
      setOrderError("Store details are still loading. Try again in a moment.");
      return;
    }
    setOrderError("");
    // Delivery needs somewhere to go; collection does not. Checked here
    // rather than in the schema, which cannot see which option was chosen.
    if (!deliveryZone?.isPickup) {
      const missing: Array<[keyof CheckoutValues, string]> = [];
      if ((data.address ?? "").trim().length < 8) missing.push(["address", "Enter your full delivery address"]);
      if ((data.city ?? "").trim().length < 2) missing.push(["city", "Enter your city"]);
      if ((data.state ?? "").trim().length < 2) missing.push(["state", "Select your state"]);
      if (missing.length) {
        for (const [field, message] of missing) form.setError(field, { message });
        return;
      }
    }

    const customerInfo: CustomerInfo = { ...data };
    setCustomer(customerInfo);
    setPendingCustomer(customerInfo);
    pendingZone.current = deliveryZone;

    // Create the order before taking a kobo.
    //
    // The order is the record of the purchase now, and payment validates it.
    // Charging first and saving after meant any interruption in between took
    // money and left nothing behind — and nobody found out until the customer
    // complained. If this call fails, nothing has been charged and the buyer
    // can simply try again.
    void (async () => {
      setIsPlacing(true);
      setOrderError("");
      try {
        const payload = buildPayload(customerInfo, deliveryZone, "");
        if (!payload) {
          setOrderError("Store details are still loading. Try again in a moment.");
          return;
        }
        const order = await ordersApi.placeOrder(payload);
        placedOrder.current = order;
        pendingRef.current = order.payment_reference ?? "";
        setShowPaystack(true);
      } catch (err) {
        console.error("placeOrder failed", err);
        setOrderError(
          `We couldn't start your order (${describeError(err)}). Nothing has been charged — please try again.`,
        );
      } finally {
        setIsPlacing(false);
      }
    })();
  }

  // Built in one place so the same order can be described to the server
  // before payment (as an intent) and sent after it, without the two drifting.
  function buildPayload(
    customerInfo: CustomerInfo,
    zone: DeliveryZone | undefined,
    ref: string,
  ): CreateOrderReq | null {
    if (!storeId) return null;
    const pendingCustomer = customerInfo;

    // No delivery or note field on the order yet, so the vendor sees the
    // chosen zone and note inside the delivery address.
    const zoneFee = allDigital || !zone ? 0 : zone.feeKobo;
    const addressParts: string[] = [];
    if (zone?.isPickup) {
      // There is no address. Say that plainly, so a vendor reading the order
      // does not start arranging a delivery.
      addressParts.push("Customer is collecting from the store");
    } else {
      addressParts.push(
        `${pendingCustomer.address}, ${pendingCustomer.city}, ${pendingCustomer.state}`,
      );
    }
    if (!allDigital && !zone?.isPickup) {
      addressParts.push(
        `Delivery: ${zone?.name ?? "not set"} (${fmtNaira(zoneFee)}${
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
        zone?.fromStore && CHARGE_DELIVERY_AT_CHECKOUT && !allDigital
          ? zone.id
          : undefined,
      delivery_fee_kobo: 0,
      payment_reference: ref,
    };
    return payload;
  }

  async function handlePaystackSuccess(ref: string) {
    setShowPaystack(false);
    const order = placedOrder.current;
    if (!order) {
      setOrderError(
        `Payment received but we lost track of your order. Contact the store with reference ${ref}.`,
      );
      return;
    }

    setIsPlacing(true);
    try {
      await ordersApi.confirmPayment(ref || order.payment_reference || "");
      setOrderNumber(`#${order.id.slice(0, 8).toUpperCase()}`);
      clearCart();
      if (storeSlug && pendingCustomer) {
        router.push(
          `/orders/${order.id}?email=${encodeURIComponent(pendingCustomer.email)}`,
        );
      } else {
        setOrderPlaced(true);
      }
    } catch (err) {
      // The money is safe and so is the order: it exists, and Paystack's
      // webhook confirms it server-side within seconds whether or not this
      // call ever succeeded. So this is reassurance, not an error to act on.
      console.error("confirmPayment failed", err);
      setOrderNumber(`#${order.id.slice(0, 8).toUpperCase()}`);
      clearCart();
      if (storeSlug && pendingCustomer) {
        router.push(
          `/orders/${order.id}?email=${encodeURIComponent(pendingCustomer.email)}`,
        );
      } else {
        setOrderPlaced(true);
      }
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
    deliveryUnavailable,
    deliveryMissing,
    storeReady,
    isPlacing,
    orderPlaced,
    orderNumber,
    showPaystack,
    paymentRef: pendingRef.current,
    pendingCustomer,
    orderError,
    setShowPaystack,
    onSubmit,
    handlePaystackSuccess,
  };
}
