import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildCarouselData, CarouselItem } from "../lib/search-orchestrator";
import { usePaginatedList } from "./usePaginatedList";
import { catalogueProductsToAppProducts } from "../lib/catalogue-adapter";
import {
  searchAll,
  CatalogueProduct,
  StoreResult,
  VendorResult,
} from "../lib/api-client";

const DEBOUNCE_MS = 350; // matches SearchModal's existing refine debounce
const PAGE_SIZE = 24;

// vendorToStore lets a search vendor flow into anything that already takes a
// StoreResult — the carousel, the open-store handler — without a second fetch.
function vendorToStore(v: VendorResult): StoreResult {
  return {
    id: v.id,
    name: v.name,
    slug: v.slug,
    category: v.category,
    tagline: v.tagline,
    logo_url: v.logo_url,
    city: v.city,
    state: v.state,
    market_id: v.market_id,
    market_name: v.market_name,
  };
}

/**
 * Drives search results: one backend call returns matching products and
 * matching vendors for the same query, plus related products and query
 * suggestions.
 *
 * Matching (trigram + full-text, so misspellings and partial words still
 * hit) and ranking both happen in the catalogue service. This hook no longer
 * resolves a store scope first — that older two-step flow meant a query had
 * to name a store before its products could be found.
 */
export function useProductSearch(query: string, location?: { lat?: number; lng?: number }) {
  const [vendors, setVendors] = useState<VendorResult[]>([]);
  const [related, setRelated] = useState<CatalogueProduct[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // Every product's seller, gathered from each response's `stores`. The
  // vendor results alone can't label a product: searching "suit" finds the
  // suit but not its shop, and a product with no store was dropped.
  const [productStores, setProductStores] = useState<Map<string, VendorResult>>(new Map());
  const rememberStores = useCallback((stores: VendorResult[]) => {
    if (!stores.length) return;
    setProductStores((prev) => {
      const next = new Map(prev);
      for (const st of stores) next.set(st.id, st);
      return next;
    });
  }, []);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIDRef = useRef(0);

  // Vendors, related products and suggestions come from the first page of the
  // same query; products paginate separately below.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const requestID = ++requestIDRef.current;
    setLoadingMeta(true);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      searchAll({ q: query || undefined, limit: PAGE_SIZE })
        .then((res) => {
          if (requestID !== requestIDRef.current) return; // superseded
          setVendors(res.vendors);
          setRelated(res.relatedProducts);
          setSuggestions(res.suggestions);
          rememberStores(res.stores);
          setLoadingMeta(false);
        })
        .catch(() => {
          if (requestID !== requestIDRef.current) return;
          setVendors([]);
          setRelated([]);
          setSuggestions([]);
          setLoadingMeta(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const fetcher = useCallback(
    (offset: number, limit: number) =>
      searchAll({
        q: debouncedQuery || undefined,
        type: "products",
        limit,
        offset,
      }).then((res) => {
        rememberStores(res.stores);
        return { items: res.products, hasMore: res.productsHasMore };
      }),
    [debouncedQuery],
  );

  const {
    items: rawProducts,
    loading: loadingProducts,
    loadingMore,
    hasMore,
    loadMore,
    error,
    retry,
  } = usePaginatedList<CatalogueProduct>(fetcher, PAGE_SIZE, [debouncedQuery]);

  // Vendor lookup for product cards: the matched vendors, then the sellers
  // the responses named for their products.
  const storeById = useMemo(() => {
    const map = new Map<string, StoreResult>();
    for (const v of productStores.values()) map.set(v.id, vendorToStore(v));
    for (const v of vendors) map.set(v.id, vendorToStore(v));
    return map;
  }, [vendors, productStores]);

  const gridProducts = useMemo(
    () => catalogueProductsToAppProducts(rawProducts, storeById),
    [rawProducts, storeById],
  );

  const relatedProducts = useMemo(
    () => catalogueProductsToAppProducts(related, storeById),
    [related, storeById],
  );

  // "Also sold by" is derived from the products already loaded — no extra
  // round trip. It is noise when the query named one vendor, which is the
  // case when a single vendor dominates the vendor results.
  const carouselItems: CarouselItem[] = useMemo(
    () => buildCarouselData(rawProducts, vendors.map(vendorToStore)),
    [rawProducts, vendors],
  );
  const showCarousel = vendors.length !== 1 && carouselItems.length > 1;

  return {
    gridProducts,
    vendors,
    relatedProducts,
    suggestions,
    loading: loadingProducts || loadingMeta,
    loadingMore,
    hasMore,
    loadMore,
    // Products failing to load is the search failing — the vendor/related
    // half degrades to empty on its own.
    error,
    retry,
    carouselItems,
    showCarousel,
    vendorToStore,
  };
}
