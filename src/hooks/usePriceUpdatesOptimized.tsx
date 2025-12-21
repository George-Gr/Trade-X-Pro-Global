/**
 * Optimized Price Updates Hook
 *
 * Enhanced version with throttling, batching, and memory optimization
 */

import { supabase } from '@/integrations/supabase/client';
import { throttle } from '@/lib/performanceUtils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface PriceData {
  symbol: string;
  currentPrice: number;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
  isStale?: boolean;
}

interface UsePriceUpdatesOptimizedOptions {
  symbols: string[];
  intervalMs?: number;
  enabled?: boolean;
  throttleMs?: number; // Throttle state updates
  maxConcurrent?: number; // Max concurrent API calls
}

// Global price cache with TTL
const priceCache = new Map<string, { data: PriceData; timestamp: number }>();
const CACHE_TTL_MS = 1000;

// Symbol mapping for Finnhub
const mapSymbolToFinnhub = (symbol: string): string => {
  if (symbol.length === 6 && !symbol.includes(':')) {
    const base = symbol.substring(0, 3);
    const quote = symbol.substring(3, 6);
    return `OANDA:${base}_${quote}`;
  }
  return symbol;
};

// Fetch with caching
const fetchPriceData = async (symbol: string): Promise<PriceData | null> => {
  const now = Date.now();
  const cached = priceCache.get(symbol);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const finnhubSymbol = mapSymbolToFinnhub(symbol);
    const { data, error } = await supabase.functions.invoke('get-stock-price', {
      body: { symbol: finnhubSymbol },
    });

    if (error || !data?.c || data.c <= 0) {
      return cached?.data || null;
    }

    const priceData: PriceData = {
      symbol,
      currentPrice: data.c,
      bid: data.c * 0.9999,
      ask: data.c * 1.0001,
      change: data.c - data.pc,
      changePercent: data.pc > 0 ? ((data.c - data.pc) / data.pc) * 100 : 0,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      timestamp: now,
    };

    priceCache.set(symbol, { data: priceData, timestamp: now });
    return priceData;
  } catch {
    return cached?.data || null;
  }
};

// Batch fetch with concurrency limit
const fetchPricesBatched = async (
  symbols: string[],
  maxConcurrent: number
): Promise<Map<string, PriceData>> => {
  const results = new Map<string, PriceData>();

  // Process in batches
  for (let i = 0; i < symbols.length; i += maxConcurrent) {
    const batch = symbols.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(batch.map(fetchPriceData));

    batchResults.forEach((data, index) => {
      if (data) {
        results.set(batch[index], data);
      }
    });
  }

  return results;
};

export const usePriceUpdatesOptimized = ({
  symbols,
  intervalMs = 2000,
  enabled = true,
  throttleMs = 200,
  maxConcurrent = 5,
}: UsePriceUpdatesOptimizedOptions) => {
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Memoize symbol list to prevent unnecessary re-renders
  const symbolList = useMemo(
    () => [...new Set(symbols)].sort().join(','),
    [symbols]
  );

  // Throttled state update to prevent excessive re-renders
  const updatePricesThrottled = useMemo(() => {
    const updater = (newPrices: Map<string, PriceData>) => {
      if (isMountedRef.current) {
        setPrices(newPrices);
      }
    };

    // The throttle utility expects a general function signature; cast to satisfy its typing,
    // then cast the returned throttled function back to the specific signature we expect.
    const throttled = throttle(
      updater as unknown as (...args: unknown[]) => void,
      throttleMs
    ) as unknown;
    return throttled as (p: Map<string, PriceData>) => void;
  }, [throttleMs]);

  const updatePrices = useCallback(async () => {
    if (!enabled || symbolList === '') {
      setIsLoading(false);
      return;
    }

    try {
      const symbolArray = symbolList.split(',').filter(Boolean);
      if (symbolArray.length === 0) {
        setIsLoading(false);
        return;
      }

      const newPrices = await fetchPricesBatched(symbolArray, maxConcurrent);
      updatePricesThrottled(newPrices);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      setIsLoading(false);
    }
  }, [symbolList, enabled, maxConcurrent, updatePricesThrottled]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled || symbolList === '') {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    updatePrices();

    // Set up polling with longer interval for performance
    intervalRef.current = setInterval(updatePrices, intervalMs);

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbolList, intervalMs, enabled, updatePrices]);
  const getPrice = useCallback(
    (symbol: string): PriceData | null => {
      const priceData = prices.get(symbol);
      if (priceData) {
        const isStale = Date.now() - priceData.timestamp > intervalMs + 500;
        return { ...priceData, isStale };
      }
      return null;
    },
    [prices, intervalMs]
  );

  const refreshPrice = useCallback(async (symbol: string) => {
    const priceData = await fetchPriceData(symbol);
    if (priceData && isMountedRef.current) {
      setPrices((prev) => new Map(prev).set(symbol, priceData));
    }
  }, []);

  return {
    prices,
    getPrice,
    refreshPrice,
    isLoading,
    error,
  };
};

export default usePriceUpdatesOptimized;
