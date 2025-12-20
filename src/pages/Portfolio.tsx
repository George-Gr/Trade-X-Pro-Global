import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { PortfolioLoading } from '@/components/portfolio/PortfolioLoading';
import { PriceAlertsManager } from '@/components/trading/PriceAlertsManager';
import { TrailingStopDialog } from '@/components/trading/TrailingStopDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { usePnLCalculations } from '@/hooks/usePnLCalculations';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { usePositionClose } from '@/hooks/usePositionClose';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';
import { formatCurrency, formatMarginLevel } from '@/lib/format';
import { Loader2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

/**
 * Portfolio component - Displays user's trading positions with real-time price updates and P&L calculations
 *
 * Manages position data, handles position closing operations, and displays portfolio metrics including
 * equity, margin levels, and profit/loss. Subscribes to real-time price updates and automatically
 * recalculates P&L values. Shows loading skeleton while fetching initial data.
 *
 * @component
 * @returns {JSX.Element} The rendered portfolio page with positions table and portfolio summary
 */
const Portfolio = () => {
  const { toast } = useToast();
  const {
    profile,
    positions,
    loading,
    calculateEquity,
    calculateFreeMargin,
    calculateMarginLevel,
    refresh,
  } = usePortfolioData();

  // Always call hooks at the top level (React Hook Rules)
  const { closePosition, isClosing } = usePositionClose();
  const [closingPositions, setClosingPositions] = useState<Set<string>>(
    new Set()
  );

  // Memoize position mapping to avoid unnecessary recalculations
  const mappedPositions = useMemo(
    () =>
      positions.map((position) => ({
        ...position,
        entryPrice: position.entry_price,
        currentPrice: position.current_price,
        side: (position.side === 'buy' ? 'long' : 'short') as 'long' | 'short', // Explicit type assertion
      })),
    [positions]
  );

  const priceMap = useMemo(
    () => new Map(mappedPositions.map((p) => [p.symbol, p.currentPrice])),
    [mappedPositions]
  );

  const { positionPnLMap, portfolioPnL, formatPnL, getPnLColor } =
    usePnLCalculations(
      mappedPositions.map((p) => ({
        ...p,
        currentPrice: p.currentPrice ?? p.entryPrice,
      })),
      priceMap,
      undefined,
      { enabled: positions.length > 0 }
    );

  const symbols = positions.map((p) => p.symbol);
  const { getPrice } = usePriceUpdates({
    symbols,
    intervalMs: 3000,
    enabled: symbols.length > 0 && !loading,
  });

  // Show loading skeleton while data is being fetched
  if (loading) {
    return <PortfolioLoading />;
  }

  const handleClosePosition = async (positionId: string, symbol: string) => {
    setClosingPositions((prev) => new Set(prev).add(positionId));

    const priceData = getPrice(symbol);
    if (!priceData) {
      toast({
        title: 'Error',
        description: 'Unable to get current price for position',
        variant: 'destructive',
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

  const balance = profile?.balance || 0;
  const equity = calculateEquity();
  const marginUsed = profile?.margin_used || 0;
  const freeMargin = calculateFreeMargin();
  const marginLevel = calculateMarginLevel();

  // Use memoized P&L calculations for portfolio metrics
  const realizedPnL = portfolioPnL.totalRealizedPnL || 0;
  const unrealizedPnL = portfolioPnL.totalUnrealizedPnL || 0;
  const totalPnL = unrealizedPnL + realizedPnL;
  const pnLColor = getPnLColor(totalPnL);

  const portfolioMetrics = [
    { label: 'Balance', value: formatCurrency(balance) },
    { label: 'Equity', value: formatCurrency(equity) },
    {
      label: 'Unrealized P&L',
      value: formatPnL(unrealizedPnL),
      color: getPnLColor(unrealizedPnL),
    },
    {
      label: 'Realized P&L',
      value: formatPnL(realizedPnL),
      color: getPnLColor(realizedPnL),
    },
    { label: 'Margin Used', value: formatCurrency(marginUsed) },
    { label: 'Free Margin', value: formatCurrency(freeMargin) },
    { label: 'Margin Level', value: formatMarginLevel(marginLevel) },
  ];

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto">
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
            <p className="text-muted-foreground">
              Monitor your positions and account metrics
            </p>
          </div>

          {/* Account Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {portfolioMetrics.map((metric) => (
              <Card key={metric.label}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {metric.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-lg font-bold ${metric.color || ''}`}>
                    {metric.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Open Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg">No open positions</p>
                  <p className="text-sm mt-2">
                    Start trading to see your positions here
                  </p>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.map((position) => {
                      const isPositionClosing = closingPositions.has(
                        position.id
                      );
                      const positionPnL = positionPnLMap.get(position.id);
                      const pnLValue = positionPnL?.unrealizedPnL || 0;
                      const pnLPercentage =
                        positionPnL?.unrealizedPnLPercentage || 0;
                      const pnLColor = positionPnL ? getPnLColor(pnLValue) : '';
                      const currentPrice =
                        positionPnL?.currentPrice ||
                        position.current_price ||
                        position.entry_price;

                      function formatPriceBySymbol(price: number, symbol: string): string {
                        // Determine decimal places based on symbol type
                        const symbolLower = symbol.toLowerCase();
                        
                        // Forex pairs typically use 4-5 decimal places
                        if (symbolLower.includes('eur') || symbolLower.includes('usd') || 
                            symbolLower.includes('gbp') || symbolLower.includes('jpy') ||
                            symbolLower.includes('aud') || symbolLower.includes('nzd') ||
                            symbolLower.includes('cad') || symbolLower.includes('chf')) {
                          // JPY pairs use 2-3 decimal places, others use 4-5
                          const isJPY = symbolLower.includes('jpy');
                          const decimals = isJPY ? 2 : 4;
                          return price.toFixed(decimals);
                        }
                        
                        // Crypto typically uses 2-8 decimal places depending on the coin
                        if (symbolLower.includes('btc') || symbolLower.includes('eth')) {
                          return price.toFixed(2);
                        }
                        
                        if (symbolLower.includes('ltc') || symbolLower.includes('xrp')) {
                          return price.toFixed(4);
                        }
                        
                        // Stocks and indices typically use 2 decimal places
                        return price.toFixed(2);
                      }
                      return (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">
                            {position.symbol}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                position.side === 'buy'
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {position.side.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{position.quantity.toFixed(2)}</TableCell>
                          <TableCell>
                            {formatPriceBySymbol(
                              position.entry_price,
                              position.symbol
                            )}
                          </TableCell>
                          <TableCell>
                            {formatPriceBySymbol(currentPrice, position.symbol)}
                          </TableCell>
                          <TableCell className={pnLColor}>
                            <div className="font-medium">
                              {formatPnL(pnLValue)}
                            </div>
                            <div className="text-xs opacity-75">
                              {pnLPercentage.toFixed(2)}%
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(position.margin_used)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-4 justify-end">
                              <TrailingStopDialog
                                positionId={position.id}
                                symbol={position.symbol}
                                side={position.side}
                                currentPrice={currentPrice}
                                trailingStopEnabled={
                                  position.trailing_stop_enabled || false
                                }
                                trailingStopDistance={
                                  position.trailing_stop_distance ?? undefined
                                }
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleClosePosition(
                                    position.id,
                                    position.symbol
                                  )
                                }
                                disabled={isPositionClosing || isClosing}
                              >
                                {isPositionClosing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-2" />
                                    Close
                                  </>
                                )}
                              </Button>
                            </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Open Positions
                    </div>
                    <div className="text-2xl font-bold">{positions.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total Volume
                    </div>
                    <div className="text-2xl font-bold">
                      {positions
                        .reduce((sum, p) => sum + p.quantity, 0)
                        .toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Avg Margin per Position
                    </div>
                    <div className="text-2xl font-bold">
                      {positions.length > 0
                        ? formatCurrency(marginUsed / positions.length)
                        : '$0.00'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Risk Level
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        marginLevel > 300
                          ? 'text-profit'
                          : marginLevel > 150
                          ? 'text-yellow-500'
                          : 'text-loss'
                      }`}
                    >
                      {marginLevel > 300
                        ? 'Low'
                        : marginLevel > 150
                        ? 'Medium'
                        : 'High'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* P&L Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>P&L Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Unrealized P&L
                    </div>
                    <div
                      className={`text-2xl font-bold ${getPnLColor(
                        unrealizedPnL
                      )}`}
                    >
                      {formatPnL(unrealizedPnL)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Realized P&L
                    </div>
                    <div
                      className={`text-2xl font-bold ${getPnLColor(
                        realizedPnL
                      )}`}
                    >
                      {formatPnL(realizedPnL)}
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Total P&L
                    </div>
                    <div className={`text-2xl font-bold ${pnLColor}`}>
                      {formatPnL(totalPnL)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics Card */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Win Rate
                    </div>
                    <div className="text-xl font-bold">
                      {portfolioPnL.positionCount > 0
                        ? (
                            (portfolioPnL.profitablePositions /
                              portfolioPnL.positionCount) *
                            100
                          ).toFixed(1)
                        : '0'}
                      %
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Profit Factor
                    </div>
                    <div className="text-xl font-bold">
                      {portfolioPnL.profitFactor > 0
                        ? portfolioPnL.profitFactor.toFixed(2)
                        : '0.00'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Largest Win / Loss
                    </div>
                    <div className="flex gap-4 text-sm font-medium">
                      <span className="text-profit">
                        {formatPnL(portfolioPnL.largestWin)}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-loss">
                        {formatPnL(portfolioPnL.largestLoss)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Alerts */}
            <PriceAlertsManager />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Portfolio;
