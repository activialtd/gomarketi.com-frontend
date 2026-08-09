import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  resolveSearchScope,
  searchProductsAcrossStores,
  buildCarouselData,
  SearchScope,
  CarouselItem,
} from "../lib/search-orchestrator";
import { usePaginatedList } from "./usePaginatedList";
import { catalogueProductsToAppProducts } from "../lib/catalogue-adapter";
import { CatalogueProduct, MatchType, StoreResult } from "../lib/api-client";

const DEBOUNCE_MS = 350; // matches SearchModal's existing refine debounce
const PAGE_SIZE = 24;

/**
 * Drives the product-first search results: resolves which stores are in
 * scope for the query (a named vendor, a named market, or the nearest
 * stores to the buyer), paginates cross-vendor product results within that
 * scope, and derives the "who else has this" carousel from whatever's been
 * loaded so far. The carousel is hidden for "vendor"/"market" matches — the
 * user already named who they want, so showing other vendors is noise.
 */
export function useProductSearch(query: string, location?: { lat?: number; lng?: number }) {
  const [scope, setScope] = useState<SearchScope | null>(null);
  const [resolvingScope, setResolvingScope] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIDRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const requestID = ++requestIDRef.current;
    setResolvingScope(true);
    debounceRef.current = setTimeout(() => {
      resolveSearchScope(query, location)
        .then((s) => {
          if (requestID !== requestIDRef.current) return; // superseded by a newer query
          setScope(s);
          setResolvingScope(false);
        })
        .catch(() => {
          if (requestID !== requestIDRef.current) return;
          setScope(null);
          setResolvingScope(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, location?.lat, location?.lng]);

  const storeById = useMemo(
    () => new Map((scope?.allStores ?? []).map((s: StoreResult) => [s.id, s])),
    [scope],
  );

  // usePaginatedList's `deps` reset the list when they change — a plain
  // string key so a same-shaped-but-different scope (e.g. remainingQuery
  // changed but storeIds didn't) still triggers a reset.
  const scopeKey = scope ? `${scope.storeIds.join(",")}|${scope.remainingQuery}` : "";

  const fetcher = useCallback(
    (offset: number, limit: number) => {
      if (!scope || scope.storeIds.length === 0) {
        return Promise.resolve({ items: [] as CatalogueProduct[], hasMore: false });
      }
      const page = Math.floor(offset / limit) + 1;
      return searchProductsAcrossStores(scope.remainingQuery, scope.storeIds, page, limit).then(
        (res) => ({ items: res.products, hasMore: res.hasMore }),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scopeKey],
  );

  const {
    items: rawProducts,
    loading: loadingProducts,
    loadingMore,
    hasMore,
    loadMore,
  } = usePaginatedList<CatalogueProduct>(fetcher, PAGE_SIZE, [scopeKey]);

  const gridProducts = useMemo(
    () => catalogueProductsToAppProducts(rawProducts, storeById),
    [rawProducts, storeById],
  );

  // Carousel is derived from whatever's been loaded so far, not a separate
  // fetch — it grows richer as more pages load in, no extra round trip.
  const carouselItems: CarouselItem[] = useMemo(() => {
    if (!scope) return [];
    return buildCarouselData(rawProducts, scope.allStores);
  }, [rawProducts, scope]);

  const showCarousel =
    !!scope &&
    (scope.matchType === "city" || scope.matchType === "distance" || scope.matchType === "none") &&
    carouselItems.length > 1;

  return {
    gridProducts,
    loading: resolvingScope || loadingProducts,
    loadingMore,
    hasMore,
    loadMore,
    carouselItems,
    showCarousel,
    matchType: (scope?.matchType ?? "none") as MatchType,
    matchedStore: scope?.matchedStore,
    matchedMarketName: scope?.matchedMarketName,
  };
}
