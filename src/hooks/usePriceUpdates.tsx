import { useState, useEffect, useRef } from "react";

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
}

interface UsePriceUpdatesOptions {
  symbols: string[];
  intervalMs?: number;
  enabled?: boolean;
}

import { supabase } from '@/integrations/supabase/client';

const CACHE_DURATION_MS = 1000; // Cache prices for 1 second to avoid excessive API calls

// Price cache to prevent duplicate requests
const priceCache = new Map<string, { data: PriceData; timestamp: number }>();

const mapSymbolToFinnhub = (symbol: string): string => {
  // Map common trading symbols to Finnhub format
  if (symbol.length === 6 && !symbol.includes(':')) {
    // Forex pair (e.g., EURUSD -> OANDA:EUR_USD)
    const base = symbol.substring(0, 3);
    const quote = symbol.substring(3, 6);
    return `OANDA:${base}_${quote}`;
  }
  
  // For stocks, commodities, etc., pass through as-is
  // Finnhub expects format like "AAPL" for stocks, "BINANCE:BTCUSDT" for crypto
  return symbol;
};

const fetchPriceData = async (symbol: string): Promise<PriceData | null> => {
  const now = Date.now();
  const cached = priceCache.get(symbol);
  
  // Return cached data if still valid
  if (cached && (now - cached.timestamp) < CACHE_DURATION_MS) {
    return cached.data;
  }

  try {
    const finnhubSymbol = mapSymbolToFinnhub(symbol);
    const { data, error } = await supabase.functions.invoke('get-stock-price', {
      body: { symbol: finnhubSymbol }
    });

    if (error || !data) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return null;
    }

    // Finnhub returns: c (current), h (high), l (low), o (open), pc (previous close)
    if (!data.c || data.c <= 0) {
      console.warn(`Invalid price data for ${symbol}:`, data);
      return null;
    }

    const priceData: PriceData = {
      symbol,
      currentPrice: data.c,
      bid: data.c * 0.9999, // Simulate bid slightly below current
      ask: data.c * 1.0001, // Simulate ask slightly above current
      change: data.c - data.pc,
      changePercent: data.pc > 0 ? ((data.c - data.pc) / data.pc) * 100 : 0,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      timestamp: now,
    };

    // Cache the result
    priceCache.set(symbol, { data: priceData, timestamp: now });

    return priceData;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
};

export const usePriceUpdates = ({
  symbols,
  intervalMs = 2000, // Update every 2 seconds
  enabled = true,
}: UsePriceUpdatesOptions) => {
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || symbols.length === 0) {
      setIsLoading(false);
      return;
    }

    const updatePrices = async () => {
      try {
        const pricePromises = symbols.map(symbol => fetchPriceData(symbol));
        const results = await Promise.all(pricePromises);

        const newPrices = new Map<string, PriceData>();
        results.forEach((priceData, index) => {
          if (priceData) {
            newPrices.set(symbols[index], priceData);
          }
        });

        setPrices(newPrices);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error('Error updating prices:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch prices');
        setIsLoading(false);
      }
    };

    // Initial fetch
    updatePrices();

    // Set up polling interval
    intervalRef.current = setInterval(updatePrices, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbols, intervalMs, enabled]);

  const getPrice = (symbol: string): PriceData | null => {
    return prices.get(symbol) || null;
  };

  const refreshPrice = async (symbol: string) => {
    const priceData = await fetchPriceData(symbol);
    if (priceData) {
      setPrices(prev => new Map(prev).set(symbol, priceData));
    }
  };

  return {
    prices,
    getPrice,
    refreshPrice,
    isLoading,
    error,
  };
};