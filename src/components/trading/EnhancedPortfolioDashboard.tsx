import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, PieChart, Zap } from 'lucide-react';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { usePnLCalculations } from '@/hooks/usePnLCalculations';
import EnhancedPositionsTable from './EnhancedPositionsTable';
import OrderHistory from './OrderHistory';
import type { Position } from '@/types/position';

interface PortfolioMetrics {
  totalEquity: number;
  totalBalance: number;
  totalUsedMargin: number;
  totalAvailableMargin: number;
  marginLevel: number;
  unrealizedPnL: number;
  realizedPnL: number;
  totalPnL: number;
  roi: number;
  marginLevelPercent: number;
}

/**
 * EnhancedPortfolioDashboard Component
 *
 * Comprehensive trading dashboard with:
 * - Key portfolio metrics (equity, margin, P&L)
 * - Real-time positions table with sorting/filtering
 * - Order history with filtering
 * - Mobile responsive design
 * - Color-coded metrics
 * - Margin level indicators
 */
const EnhancedPortfolioDashboard: React.FC = () => {
  const { profile, positions = [], loading, error } = usePortfolioData();
  // Build price map from positions
  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    positions.forEach(pos => {
      map.set(pos.symbol, pos.current_price);
    });
    return map;
  }, [positions]);
  const { positionPnLMap } = usePnLCalculations(positions as any, priceMap, undefined, {});

  // Calculate comprehensive portfolio metrics
  const metrics = useMemo((): PortfolioMetrics => {
    if (!profile) {
      return {
        totalEquity: 0,
        totalBalance: 0,
        totalUsedMargin: 0,
        totalAvailableMargin: 0,
        marginLevel: 0,
        unrealizedPnL: 0,
        realizedPnL: 0,
        totalPnL: 0,
        roi: 0,
        marginLevelPercent: 0,
      };
    }

    const balance = profile.balance || 0;
    const usedMargin = profile.margin_used || 0;
    const availableMargin = balance - usedMargin;

    // Calculate unrealized P&L from positions
    const unrealizedPnL = (positions || []).reduce((sum, pos) => {
      const pnlData = positionPnLMap.get(pos.id);
      if (pnlData) return sum + (pnlData.unrealizedPnL || 0);

      const posValue = (pos.current_price || 0) * pos.quantity * 100000;
      const entryValue = (pos.entry_price || 0) * pos.quantity * 100000;
      // Map 'buy'|'sell' to 'long'|'short' for calculations
      const isLong = pos.side === 'buy';
      const pnl = isLong ? posValue - entryValue : entryValue - posValue;
      return sum + pnl;
    }, 0);

    const realizedPnL = (profile as { realized_pnl?: number; realizedPnl?: number; realizedPnL?: number } | null)?.realized_pnl ?? (profile as { realizedPnl?: number })?.realizedPnl ?? (profile as { realizedPnL?: number })?.realizedPnL ?? 0;
    const totalPnL = unrealizedPnL + realizedPnL;
    const totalEquity = balance + unrealizedPnL;

    // Calculate ROI
    const initialDeposit = balance - realizedPnL;
    const roi = initialDeposit > 0 ? (totalPnL / initialDeposit) * 100 : 0;

    // Calculate margin level percentage - avoid division by zero
    const marginLevelPercent = totalEquity > 0 ? ((totalEquity - usedMargin) / totalEquity) * 100 : 0;
    const marginLevel = balance > 0 ? (availableMargin / balance) * 100 : 0;

    return {
      totalEquity,
      totalBalance: balance,
      totalUsedMargin: usedMargin,
      totalAvailableMargin: availableMargin,
      marginLevel,
      unrealizedPnL,
      realizedPnL,
      totalPnL,
      roi,
      marginLevelPercent,
    };
  }, [profile, positions, positionPnLMap]);

  const getMarginLevelColor = (level: number) => {
    if (level >= 100) return '#00BFA5'; // Green - Safe
    if (level >= 50) return '#FDD835'; // Yellow - Warning
    if (level >= 20) return '#FF9800'; // Orange - Urgent
    return '#E53935'; // Red - Liquidation
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Metrics Bar */}
      <div className="border-b border-border bg-muted/20 px-4 py-4 space-y-4 flex-shrink-0">
        {/* First Row - Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-card/50 rounded-lg p-4">
            <span className="text-xs text-muted-foreground">Total Equity</span>
            <div className="font-semibold text-sm mt-2">${metrics.totalEquity.toFixed(2)}</div>
          </div>
          <div className="bg-card/50 rounded-lg p-4">
            <span className="text-xs text-muted-foreground">Balance</span>
            <div className="font-semibold text-sm mt-2">${metrics.totalBalance.toFixed(2)}</div>
          </div>
          <div className="bg-card/50 rounded-lg p-4">
            <span className="text-xs text-muted-foreground">Used Margin</span>
            <div className="font-semibold text-sm mt-2">${metrics.totalUsedMargin.toFixed(2)}</div>
          </div>
          <div className="bg-card/50 rounded-lg p-4">
            <span className="text-xs text-muted-foreground">Available Margin</span>
            <div className="font-semibold text-sm mt-2">${metrics.totalAvailableMargin.toFixed(2)}</div>
          </div>
        </div>

        {/* Second Row - P&L and Margin Level */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-card/50 rounded-lg p-4">
            <span className="text-xs text-muted-foreground">Total P&L</span>
            <div
              className="font-semibold text-sm mt-2"
              style={{ color: metrics.totalPnL >= 0 ? '#00BFA5' : '#E53935' }}
            >
              {metrics.totalPnL >= 0 ? '+' : ''} ${metrics.totalPnL.toFixed(2)}
            </div>
          </div>
          <div className="bg-card/50 rounded-lg p-4">
            <span className="text-xs text-muted-foreground">ROI</span>
            <div
              className="font-semibold text-sm mt-2"
              style={{ color: metrics.roi >= 0 ? '#00BFA5' : '#E53935' }}
            >
              {metrics.roi >= 0 ? '+' : ''} {metrics.roi.toFixed(2)}%
            </div>
          </div>
          <div className="bg-card/50 rounded-lg p-4">
            <span className="text-xs text-muted-foreground">Margin Level</span>
            <div className="mt-2">
              <div
                className="h-2 w-full bg-muted rounded-full overflow-hidden"
                style={{
                  backgroundColor: 'rgba(158, 158, 158, 0.2)',
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(metrics.marginLevelPercent, 100)}%`,
                    backgroundColor: getMarginLevelColor(metrics.marginLevelPercent),
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground mt-2">
                {metrics.marginLevelPercent.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Positions and Orders */}
      <Tabs defaultValue="positions" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full border-b border-border rounded-none bg-muted/20">
          <TabsTrigger value="positions" className="flex-1">
            <Zap className="h-4 w-4 mr-2" />
            Positions
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex-1">
            <TrendingUp className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="positions" className="h-full mt-2 overflow-auto">
            <div className="p-4">
              <EnhancedPositionsTable />
            </div>
          </TabsContent>

          <TabsContent value="orders" className="h-full mt-2 overflow-auto">
            <div className="p-4">
              <OrderHistory />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default EnhancedPortfolioDashboard;
