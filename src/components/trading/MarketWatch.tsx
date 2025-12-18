import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { usePriceUpdates } from "@/hooks/usePriceUpdates";

interface MarketWatchProps {
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

interface MarketData {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
}

const DEFAULT_WATCHED_SYMBOLS = [
  { symbol: "EURUSD", name: "Euro vs US Dollar" },
  { symbol: "GBPUSD", name: "British Pound vs US Dollar" },
  { symbol: "USDJPY", name: "US Dollar vs Japanese Yen" },
  { symbol: "XAUUSD", name: "Gold vs US Dollar" },
  { symbol: "AAPL", name: "Apple Inc" },
  { symbol: "TSLA", name: "Tesla Inc" },
  { symbol: "GOOGL", name: "Alphabet Inc" },
  { symbol: "MSFT", name: "Microsoft Corp" },
];

const MarketWatch = ({ onSelectSymbol, selectedSymbol }: MarketWatchProps) => {
  // Get real-time prices for all symbols
  const { prices, isLoading } = usePriceUpdates({
    symbols: DEFAULT_WATCHED_SYMBOLS.map((s) => s.symbol),
    intervalMs: 3000, // Update every 3 seconds
    enabled: true,
  });

  // Combine symbol info with price data
  const marketData = useMemo(() => {
    return DEFAULT_WATCHED_SYMBOLS.map((item) => {
      const priceData = prices.get(item.symbol);
      return {
        symbol: item.symbol,
        name: item.name,
        bid: priceData?.bid || 0,
        ask: priceData?.ask || 0,
        change: priceData?.change || 0,
        changePercent: priceData?.changePercent || 0,
        hasData: !!priceData,
      };
    });
  }, [prices]);

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Market Watch</h2>
            <p className="text-xs text-muted-foreground mt-2">
              Real-time quotes
            </p>
          </div>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {marketData.map((data) => {
          const decimalPlaces = data.symbol.includes("JPY")
            ? 2
            : data.symbol.length === 6
              ? 5
              : 2;
          const spread = data.hasData
            ? (
                (data.ask - data.bid) *
                (decimalPlaces === 5 ? 100000 : 100)
              ).toFixed(1)
            : "-";

          return (
            <button
              key={data.symbol}
              onClick={() => onSelectSymbol(data.symbol)}
              className={`w-full p-4 border-b border-border hover:bg-secondary/50 transition-colors text-left ${
                selectedSymbol === data.symbol
                  ? "bg-primary/10 border-l-2 border-l-primary"
                  : ""
              }`}
              disabled={!data.hasData}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-sm">{data.symbol}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {data.name}
                  </div>
                </div>
                {data.hasData ? (
                  <div
                    className={`flex items-center gap-4 text-xs ${data.change >= 0 ? "text-profit" : "text-loss"}`}
                  >
                    {data.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                      {data.changePercent >= 0 ? "+" : ""}
                      {data.changePercent.toFixed(2)}%
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Loading...
                  </div>
                )}
              </div>
              {data.hasData && (
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Bid</div>
                      <div className="text-sm font-mono font-semibold">
                        {data.bid.toFixed(decimalPlaces)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Ask</div>
                      <div className="text-sm font-mono font-semibold">
                        {data.ask.toFixed(decimalPlaces)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Spread: {spread}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MarketWatch;
