import { TrendingUp, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { usePriceUpdates } from "@/hooks/usePriceUpdates";

const PortfolioDashboard = () => {
  const {
    profile,
    positions,
    loading,
    updatePositionPrices,
    getTotalUnrealizedPnL,
    calculateEquity,
    calculateFreeMargin,
    calculateMarginLevel,
  } = usePortfolioData();

  const symbols = positions.map((p) => p.symbol);
  const { prices } = usePriceUpdates({
    symbols,
    intervalMs: 3000,
    enabled: symbols.length > 0,
  });

  useEffect(() => {
    if (prices.size > 0) {
      updatePositionPrices(prices);
    }
  }, [prices, updatePositionPrices]);

  if (loading) {
    return (
      <div className="h-full bg-card px-4 py-3 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const balance = profile?.balance || 0;
  const equity = calculateEquity();
  const marginUsed = profile?.margin_used || 0;
  const freeMargin = calculateFreeMargin();
  const floatingPnL = getTotalUnrealizedPnL();
  const marginLevel = calculateMarginLevel();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatMarginLevel = (level: number) => {
    if (!isFinite(level)) return "∞";
    return `${level.toFixed(0)}%`;
  };

  return (
    <div className="h-full bg-card px-4 py-3 flex items-center gap-6 overflow-x-auto">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Balance</div>
          <div className="text-lg font-bold">{formatCurrency(balance)}</div>
        </div>
      </div>

      <div className="h-12 w-px bg-border" />

      <div>
        <div className="text-xs text-muted-foreground">Equity</div>
        <div className="text-sm font-semibold">{formatCurrency(equity)}</div>
      </div>

      <div>
        <div className="text-xs text-muted-foreground">Margin Used</div>
        <div className="text-sm font-semibold">{formatCurrency(marginUsed)}</div>
      </div>

      <div>
        <div className="text-xs text-muted-foreground">Free Margin</div>
        <div className="text-sm font-semibold">{formatCurrency(freeMargin)}</div>
      </div>

      <div className="h-12 w-px bg-border" />

      <div>
        <div className="text-xs text-muted-foreground">Floating P&L</div>
        <div
          className={`text-sm font-semibold ${
            floatingPnL >= 0 ? "text-profit" : "text-loss"
          }`}
        >
          {floatingPnL >= 0 ? "+" : ""}
          {formatCurrency(floatingPnL)}
        </div>
      </div>

      <div>
        <div className="text-xs text-muted-foreground">Margin Level</div>
        <div className="text-sm font-semibold">{formatMarginLevel(marginLevel)}</div>
      </div>

      <div className="ml-auto">
        <div className="text-xs text-muted-foreground">Open Positions</div>
        <div className="text-sm font-semibold">{positions.length}</div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
