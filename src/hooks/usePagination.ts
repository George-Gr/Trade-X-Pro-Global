/**
 * Hook: usePagination
 *
 * Cursor-based pagination for Supabase queries
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { useCallback, useEffect, useRef, useState } from 'react';

interface PaginationOptions {
  table: string;
  select?: string;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
  filter?: Record<string, unknown>;
  enabled?: boolean;
}

interface PaginationState<T> {
  data: T[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number | null;
  currentPage: number;
}

export function usePagination<T = unknown>(options: PaginationOptions) {
  const {
    table,
    select = '*',
    pageSize = 20,
    orderBy = 'created_at',
    ascending = false,
    filter = {},
    enabled = true,
  } = options;

  const [state, setState] = useState<PaginationState<T>>({
    data: [],
    loading: true,
    loadingMore: false,
    error: null,
    hasMore: true,
    totalCount: null,
    currentPage: 0,
  });

  const cursorRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchInitial = useCallback(async () => {
    if (!enabled) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    cursorRef.current = null;

    try {
      let query = supabase
        .from(table as never)
        .select(select, { count: 'exact' }) as never;
      Object.entries(filter).forEach(([k, v]) => {
        if (v != null)
          query = (query as { eq: (k: string, v: unknown) => unknown }).eq(
            k,
            v
          ) as never;
      });
      query = (
        query as {
          order: (col: string, opts: { ascending: boolean }) => unknown;
        }
      ).order(orderBy, { ascending }) as never;
      query = (query as { limit: (n: number) => unknown }).limit(
        pageSize
      ) as never;

      const { data, error, count } = await (query as Promise<{
        data: unknown;
        error: unknown;
        count: number | null;
      }>);
      if (!isMountedRef.current) return;
      if (error) throw error;

      const items = (data || []) as T[];
      if (items.length > 0)
        cursorRef.current = String(
          (items[items.length - 1] as Record<string, unknown>)[orderBy] ?? ''
        );

      setState({
        data: items,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: items.length === pageSize,
        totalCount: count,
        currentPage: 1,
      });
    } catch (err) {
      if (!isMountedRef.current) return;
      logger.error('Pagination error', err);
      setState((prev) => ({
        ...prev,
        loading: false,
        loadingMore: false,
        error: err instanceof Error ? err.message : 'Failed',
      }));
    }
  }, [enabled, table, select, orderBy, ascending, pageSize, filter]);

  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loadingMore || !cursorRef.current) return;
    setState((prev) => ({ ...prev, loadingMore: true }));

    try {
      let query = supabase.from(table as never).select(select) as never;
      Object.entries(filter).forEach(([k, v]) => {
        if (v != null)
          query = (query as { eq: (k: string, v: unknown) => unknown }).eq(
            k,
            v
          ) as never;
      });
      query = (
        query as {
          order: (col: string, opts: { ascending: boolean }) => unknown;
        }
      ).order(orderBy, { ascending }) as never;
      query = ascending
        ? ((query as { gt: (col: string, v: string) => unknown }).gt(
            orderBy,
            cursorRef.current!
          ) as never)
        : ((query as { lt: (col: string, v: string) => unknown }).lt(
            orderBy,
            cursorRef.current!
          ) as never);
      query = (query as { limit: (n: number) => unknown }).limit(
        pageSize
      ) as never;

      const { data, error } = await (query as Promise<{
        data: unknown;
        error: unknown;
      }>);
      if (!isMountedRef.current) return;
      if (error) throw error;

      const items = (data || []) as T[];
      if (items.length > 0)
        cursorRef.current = String(
          (items[items.length - 1] as Record<string, unknown>)[orderBy] ?? ''
        );

      setState((prev) => ({
        ...prev,
        data: [...prev.data, ...items],
        loadingMore: false,
        hasMore: items.length === pageSize,
        currentPage: prev.currentPage + 1,
      }));
    } catch (err) {
      if (!isMountedRef.current) return;
      setState((prev) => ({
        ...prev,
        loadingMore: false,
        error: err instanceof Error ? err.message : 'Failed',
      }));
    }
  }, [
    state.hasMore,
    state.loadingMore,
    table,
    select,
    orderBy,
    ascending,
    pageSize,
    filter,
  ]);

  const refresh = useCallback(() => fetchInitial(), [fetchInitial]);
  const reset = useCallback(() => {
    cursorRef.current = null;
    setState({
      data: [],
      loading: true,
      loadingMore: false,
      error: null,
      hasMore: true,
      totalCount: null,
      currentPage: 0,
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchInitial();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchInitial, enabled]);

  return { ...state, loadMore, loadPage: async () => {}, refresh, reset };
}

/**
 * Hook: useInfiniteScroll
 *
 * Extends usePagination with IntersectionObserver for infinite scroll functionality
 */
export function useInfiniteScroll<T = unknown>(
  options: PaginationOptions & { threshold?: number }
) {
  const { threshold = 0.1, ...rest } = options;
  const pagination = usePagination<T>(rest);
  const { hasMore, loadingMore, loadMore } = pagination;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting && hasMore && !loadingMore) loadMore();
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loadMore, threshold]);

  return { ...pagination, loadMoreRef };
}

export default usePagination;
