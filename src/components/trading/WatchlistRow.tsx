import React from "react";
import { TrendingUp, TrendingDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PriceAlertDialog } from "./PriceAlertDialog";

interface WatchlistRowProps {
  id: string;
  symbol: string;
  priceData?: {
    currentPrice: number;
    change: number;
    changePercent: number;
  };
  onSymbolClick: (symbol: string) => void;
  onQuickTrade: (
    symbol: string,
    side: "buy" | "sell",
    e: React.MouseEvent,
  ) => void;
  onRemove: (e: React.MouseEvent) => void;
}

/**
 * WatchlistRow Component (Memoized)
 *
 * Individual watchlist item row with price display and quick actions.
 * Wrapped with React.memo to prevent unnecessary re-renders when prices update
 * at parent level.
 */
const WatchlistRow = React.memo(
  ({
    id,
    symbol,
    priceData,
    onSymbolClick,
    onQuickTrade,
    onRemove,
  }: WatchlistRowProps) => {
    const isPositive = (priceData?.change || 0) >= 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    const formatPrice = (price: number) => {
      if (symbol.includes("JPY")) return price.toFixed(2);
      if (
        symbol.includes("BTC") ||
        symbol.includes("ETH") ||
        symbol.includes("XAU")
      )
        return price.toFixed(2);
      return price.toFixed(5);
    };

    return (
      <div
        onClick={() => onSymbolClick(symbol)}
        className="group relative flex items-center gap-4 p-4 rounded-md bg-secondary/50 hover:bg-secondary transition-colors border border-border/50 hover:border-border cursor-pointer"
      >
        {/* Symbol & Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-sm">{symbol}</span>
            <TrendIcon
              className={cn(
                "h-3 w-3",
                isPositive ? "text-profit" : "text-loss",
              )}
            />
          </div>
        </div>

        {/* Prices */}
        <div className="text-right">
          <div className="font-mono font-semibold text-sm">
            {priceData ? (
              formatPrice(priceData.currentPrice)
            ) : (
              <div className="h-5 bg-muted/50 rounded animate-pulse" />
            )}
          </div>
          {priceData ? (
            <div
              className={cn(
                "text-xs font-medium",
                isPositive ? "text-profit" : "text-loss",
              )}
            >
              {isPositive ? "+" : ""}
              {priceData.changePercent.toFixed(2)}%
            </div>
          ) : (
            <div className="h-3 w-12 bg-muted/50 rounded animate-pulse mt-1" />
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => onQuickTrade(symbol, "buy", e)}
            className="h-7 px-4 text-xs bg-buy/10 hover:bg-buy/20 text-buy-foreground"
          >
            Buy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => onQuickTrade(symbol, "sell", e)}
            className="h-7 px-4 text-xs bg-sell/10 hover:bg-sell/20 text-sell-foreground"
          >
            Sell
          </Button>
          {priceData && (
            <PriceAlertDialog
              symbol={symbol}
              currentPrice={priceData.currentPrice}
            />
          )}
          <button
            onClick={onRemove}
            className="hover:bg-destructive/20 rounded p-4"
            aria-label={`Remove ${symbol} from watchlist`}
          >
            <X
              className="h-4 w-4 text-muted-foreground hover:text-destructive"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if these specific props change
    return (
      prevProps.symbol === nextProps.symbol &&
      prevProps.id === nextProps.id &&
      prevProps.priceData?.currentPrice === nextProps.priceData?.currentPrice &&
      prevProps.priceData?.changePercent === nextProps.priceData?.changePercent
    );
  },
);

WatchlistRow.displayName = "WatchlistRow";

export default WatchlistRow;
