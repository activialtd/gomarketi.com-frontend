"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getSavedOffersServerSnapshot,
  getSavedOffersSnapshot,
  subscribeSavedOffers,
} from "@/lib/offers";

/** Offers this device has made at one store; empty on the server. */
export function useSavedOffers(slug: string) {
  const all = useSyncExternalStore(
    subscribeSavedOffers,
    getSavedOffersSnapshot,
    getSavedOffersServerSnapshot,
  );
  return useMemo(() => all.filter((o) => o.slug === slug), [all, slug]);
}
