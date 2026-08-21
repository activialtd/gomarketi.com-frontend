import { useCallback, useEffect, useRef, useState } from "react";

export type Page<T> = { items: T[]; hasMore: boolean };
export type Fetcher<T> = (offset: number, limit: number) => Promise<Page<T>>;

/**
 * Pagination with the next page silently prefetched in the background as
 * soon as the current one lands — the same idea as Instagram staging the
 * next few items before you scroll to them, so "load more" resolves
 * instantly from cache instead of showing a spinner mid-scroll.
 */
export function usePaginatedList<T>(fetcher: Fetcher<T>, pageSize: number, deps: unknown[]) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true); // first page only
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);
  const prefetchRef = useRef<Promise<Page<T>> | null>(null);
  const requestIDRef = useRef(0);

  const prefetchNext = useCallback(
    (offset: number) => {
      if (!hasMoreRef.current) {
        prefetchRef.current = null;
        return;
      }
      prefetchRef.current = fetcher(offset, pageSize);
    },
    [fetcher, pageSize],
  );

  const reset = useCallback(() => {
    const requestID = ++requestIDRef.current;
    offsetRef.current = 0;
    hasMoreRef.current = true;
    prefetchRef.current = null;
    setItems([]);
    setHasMore(true);
    setLoading(true);

    fetcher(0, pageSize).then((page) => {
      if (requestID !== requestIDRef.current) return; // a newer reset superseded this one
      setItems(page.items);
      setHasMore(page.hasMore);
      setLoading(false);
      offsetRef.current = page.items.length;
      hasMoreRef.current = page.hasMore;
      prefetchNext(offsetRef.current);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(reset, [reset]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMoreRef.current) return;
    setLoadingMore(true);
    const requestID = requestIDRef.current;

    // Already fetched ahead of time — apply instantly, no spinner wait.
    const pending = prefetchRef.current ?? fetcher(offsetRef.current, pageSize);
    const page = await pending;
    if (requestID !== requestIDRef.current) return; // stale

    setItems((prev) => [...prev, ...page.items]);
    offsetRef.current += page.items.length;
    hasMoreRef.current = page.hasMore;
    setHasMore(page.hasMore);
    setLoadingMore(false);
    prefetchNext(offsetRef.current);
  }, [loadingMore, fetcher, pageSize, prefetchNext]);

  return { items, loading, loadingMore, hasMore, loadMore };
}
