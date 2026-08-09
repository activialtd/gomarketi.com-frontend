import {
  searchStores,
  searchProducts,
  StoreResult,
  MatchType,
} from "./api-client";

export { buildCarouselData, type CarouselItem } from "./carousel-grouping";

export type SearchScope = {
  storeIds: string[];
  matchType: MatchType;
  // Set only when matchType === "vendor" — the one store the query named.
  matchedStore?: StoreResult;
  // Set only when matchType === "market" — read off the returned stores
  // rather than a second API call, since SearchStores already scoped them
  // to that market (every result shares the same market_name).
  matchedMarketName?: string;
  // The query with the matched vendor/market/city phrase stripped out —
  // the leftover product term(s), safe to pass to searchProductsAcrossStores.
  remainingQuery: string;
  // All stores SearchStores resolved for this tier — a single store for
  // "vendor", every store in the market for "market", nearest-N for
  // "city"/"distance"/"none". Doubles as the carousel's store lookup.
  allStores: StoreResult[];
};

// resolveSearchScope is the first call of every product search: it asks
// storefront's SearchStores which stores are eligible (a named vendor, a
// named market, or the nearest N to the buyer) so catalogue's product
// search never has to guess or scan the whole platform.
export async function resolveSearchScope(
  query: string,
  location?: { lat?: number; lng?: number },
): Promise<SearchScope> {
  const page = await searchStores({
    q: query || undefined,
    lat: location?.lat,
    lng: location?.lng,
  });

  return {
    storeIds: page.stores.map((s) => s.id),
    matchType: page.matchType,
    matchedStore: page.matchType === "vendor" ? page.stores[0] : undefined,
    matchedMarketName: page.matchType === "market" ? page.stores[0]?.market_name : undefined,
    remainingQuery: page.remainingQuery,
    allStores: page.stores,
  };
}

// searchProductsAcrossStores is a thin, named pass-through to searchProducts
// so callers read resolveSearchScope → searchProductsAcrossStores as the two
// steps of the dual-algorithm search, matching the plan's naming.
export function searchProductsAcrossStores(
  remainingQuery: string,
  storeIds: string[],
  page = 1,
  perPage = 24,
) {
  return searchProducts(storeIds, remainingQuery, page, perPage);
}

