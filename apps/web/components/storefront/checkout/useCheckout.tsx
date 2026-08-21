"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart, type CustomerInfo } from "@/lib/cartContext";
import { ordersApi } from "@gomarket/api-client";

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

export const FREE_SHIPPING_THRESHOLD_KOBO = 5_000_000;
export const FLAT_SHIPPING_KOBO = 150_000;

export type CheckoutProps = {
  storeId: string | null;
  storeSlug?: string;
  storeName?: string;
};

export function useCheckout({ storeId, storeSlug = "" }: CheckoutProps) {
  const router = useRouter();
  const { lines, subtotal, setCustomer, clearCart } = useCart();

  const [isPlacing, setIsPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [showPaystack, setShowPaystack] = useState(false);
  const [pendingCustomer, setPendingCustomer] = useState<CustomerInfo | null>(
    null,
  );
  const [orderError, setOrderError] = useState("");

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
  });

  const allDigital = lines.every((l) => l.isDigital);
  const shipping = allDigital
    ? 0
    : subtotal > FREE_SHIPPING_THRESHOLD_KOBO
      ? 0
      : FLAT_SHIPPING_KOBO;
  const total = subtotal + shipping;

  async function onSubmit(data: CheckoutValues) {
    if (lines.length === 0) return;
    const customerInfo: CustomerInfo = { ...data };
    setCustomer(customerInfo);
    setPendingCustomer(customerInfo);
    setShowPaystack(true);
  }

  async function handlePaystackSuccess(ref: string) {
    setShowPaystack(false);
    if (!storeId || !pendingCustomer) {
      setOrderError(
        "Something went wrong placing your order. Please try again.",
      );
      return;
    }
    setIsPlacing(true);
    try {
      const order = await ordersApi.createOrder({
        store_id: storeId,
        customer_name: pendingCustomer.fullName,
        customer_email: pendingCustomer.email,
        customer_phone: pendingCustomer.phone,
        delivery_address: `${pendingCustomer.address}, ${pendingCustomer.city}, ${pendingCustomer.state}`,
        items: lines.map((l) => ({
          product_id: l.productId,
          name: l.productName,
          image_url: l.productImage,
          quantity: l.quantity,
          price_kobo: l.unitPrice,
        })),
        payment_reference: ref,
      });
      setOrderNumber(`#${order.id.slice(0, 8).toUpperCase()}`);
      clearCart();
      if (storeSlug) {
        router.push(
          `/orders/${order.id}?email=${encodeURIComponent(pendingCustomer.email)}`,
        );
      } else {
        setOrderPlaced(true);
      }
    } catch {
      setOrderError(
        `Your payment succeeded but we couldn't save your order. Please contact the store with reference ${ref}.`,
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
