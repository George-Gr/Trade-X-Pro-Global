import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import type { TradeStatistics } from '@/hooks/useTradingHistory';

interface TradeStatisticsCardsProps {
  statistics: TradeStatistics | null;
}

const TradeStatisticsCards = ({ statistics }: TradeStatisticsCardsProps) => {
  if (!statistics) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-4">
            <Target className="h-4 w-4" />
            Total Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalTrades}</div>
          <p className="text-xs text-muted-foreground mt-2">
            {statistics.winningTrades}W / {statistics.losingTrades}L
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-4">
            <TrendingUp className="h-4 w-4" />
            Win Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercent(statistics.winRate)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Success rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-4">
            <DollarSign className="h-4 w-4" />
            Total P&L
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              statistics.totalPnL >= 0 ? 'text-profit' : 'text-loss'
            }`}
          >
            {statistics.totalPnL >= 0 ? '+' : ''}
            {formatCurrency(statistics.totalPnL)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Net profit/loss</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-4">
            <TrendingDown className="h-4 w-4" />
            Avg Trade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              statistics.averagePnL >= 0 ? 'text-profit' : 'text-loss'
            }`}
          >
            {statistics.averagePnL >= 0 ? '+' : ''}
            {formatCurrency(statistics.averagePnL)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Per trade</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeStatisticsCards;
