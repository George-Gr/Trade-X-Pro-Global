import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { usePriceUpdates } from "@/hooks/usePriceUpdates";
import { usePositionClose } from "@/hooks/usePositionClose";
import { useToast } from "@/hooks/use-toast";

const Portfolio = () => {
  const { toast } = useToast();
  const {
    profile,
    positions,
    loading,
    updatePositionPrices,
    getTotalUnrealizedPnL,
    calculateEquity,
    calculateFreeMargin,
    calculateMarginLevel,
    refresh,
  } = usePortfolioData();

  const { closePosition, isClosing } = usePositionClose();
  const [closingPositions, setClosingPositions] = useState<Set<string>>(new Set());

  const symbols = positions.map((p) => p.symbol);
  const { prices, getPrice } = usePriceUpdates({
    symbols,
    intervalMs: 3000,
    enabled: symbols.length > 0,
  });

  useEffect(() => {
    if (prices.size > 0) {
      updatePositionPrices(prices);
    }
  }, [prices]);

  const handleClosePosition = async (positionId: string, symbol: string) => {
    setClosingPositions((prev) => new Set(prev).add(positionId));
    
    const priceData = getPrice(symbol);
    if (!priceData) {
      toast({
        title: "Error",
        description: "Unable to get current price for position",
        variant: "destructive",
      });
      setClosingPositions((prev) => {
        const next = new Set(prev);
        next.delete(positionId);
        return next;
      });
      return;
    }

    const result = await closePosition({
      position_id: positionId,
    });

    setClosingPositions((prev) => {
      const next = new Set(prev);
      next.delete(positionId);
      return next;
    });

    if (result) {
      await refresh();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPrice = (value: number, symbol: string) => {
    const isJpy = symbol.includes("JPY");
    return value.toFixed(isJpy ? 3 : 5);
  };

  const formatMarginLevel = (level: number) => {
    if (!isFinite(level)) return "∞";
    return `${level.toFixed(0)}%`;
  };

  const balance = profile?.balance || 0;
  const equity = calculateEquity();
  const marginUsed = profile?.margin_used || 0;
  const freeMargin = calculateFreeMargin();
  const floatingPnL = getTotalUnrealizedPnL();
  const marginLevel = calculateMarginLevel();

  const portfolioMetrics = [
    { label: "Balance", value: formatCurrency(balance) },
    { label: "Equity", value: formatCurrency(equity) },
    { label: "Margin Used", value: formatCurrency(marginUsed) },
    { label: "Free Margin", value: formatCurrency(freeMargin) },
    { label: "Margin Level", value: formatMarginLevel(marginLevel) },
    {
      label: "Floating P&L",
      value: formatCurrency(floatingPnL),
      color: floatingPnL >= 0 ? "text-profit" : "text-loss",
    },
  ];

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto">
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
            <p className="text-muted-foreground">Monitor your positions and account metrics</p>
          </div>

          {/* Account Metrics */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {portfolioMetrics.map((metric) => (
                <Card key={metric.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">
                      {metric.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-lg font-bold ${metric.color || ""}`}>
                      {metric.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Open Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : positions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg">No open positions</p>
                  <p className="text-sm mt-2">Start trading to see your positions here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Entry Price</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>Unrealized P&L</TableHead>
                      <TableHead>Margin Used</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.map((position) => {
                      const isPositionClosing = closingPositions.has(position.id);
                      return (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">{position.symbol}</TableCell>
                          <TableCell>
                            <Badge
                              variant={position.side === "buy" ? "default" : "destructive"}
                            >
                              {position.side.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{position.quantity.toFixed(2)}</TableCell>
                          <TableCell>{formatPrice(position.entry_price, position.symbol)}</TableCell>
                          <TableCell>
                            {position.current_price
                              ? formatPrice(position.current_price, position.symbol)
                              : "-"}
                          </TableCell>
                          <TableCell
                            className={
                              (position.unrealized_pnl || 0) >= 0 ? "text-profit" : "text-loss"
                            }
                          >
                            {(position.unrealized_pnl || 0) >= 0 ? "+" : ""}
                            {formatCurrency(position.unrealized_pnl || 0)}
                          </TableCell>
                          <TableCell>{formatCurrency(position.margin_used)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleClosePosition(position.id, position.symbol)}
                              disabled={isPositionClosing || isClosing}
                            >
                              {isPositionClosing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <X className="h-4 w-4 mr-1" />
                                  Close
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Trading Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Trading Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Open Positions</div>
                  <div className="text-2xl font-bold">{positions.length}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Volume</div>
                  <div className="text-2xl font-bold">
                    {positions.reduce((sum, p) => sum + p.quantity, 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Avg Margin per Position</div>
                  <div className="text-2xl font-bold">
                    {positions.length > 0
                      ? formatCurrency(marginUsed / positions.length)
                      : "$0.00"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Risk Level</div>
                  <div
                    className={`text-2xl font-bold ${
                      marginLevel > 300
                        ? "text-profit"
                        : marginLevel > 150
                        ? "text-yellow-500"
                        : "text-loss"
                    }`}
                  >
                    {marginLevel > 300 ? "Low" : marginLevel > 150 ? "Medium" : "High"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Portfolio;
