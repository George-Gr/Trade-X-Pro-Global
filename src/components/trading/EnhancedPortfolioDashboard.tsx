import * as React from 'react';
import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Wallet, 
  ShieldCheck, 
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { usePnLCalculations } from '@/hooks/usePnLCalculations';
import EnhancedPositionsTable from './EnhancedPositionsTable';
import OrderHistory from './OrderHistory';
import { cn } from '@/lib/utils';

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
 * Comprehensive trading dashboard with improved visual hierarchy:
 * - Consolidated account metrics
 * - Clear margin level indicators with thresholds
 * - Responsive design with better color contrast
 * - Tooltips for metric explanations
 */
const EnhancedPortfolioDashboard: React.FC = () => {
  const { profile, positions = [], loading, error } = usePortfolioData();
  
  const mappedPositions = useMemo(() => {
    return positions.map(pos => ({
      ...pos,
      entryPrice: pos.entry_price,
      currentPrice: pos.current_price,
      side: (pos.side === 'buy' ? 'long' : 'short') as 'long' | 'short',
      margin_required: pos.margin_used || 0,
    }));
  }, [positions]);
  
  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    positions.forEach(pos => {
      if (pos.current_price !== null) {
        map.set(pos.symbol, pos.current_price);
      }
    });
    return map;
  }, [positions]);

  const { positionPnLMap } = usePnLCalculations(mappedPositions, priceMap, undefined, {});

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

    const unrealizedPnL = (positions || []).reduce((sum, pos) => {
      const pnlData = positionPnLMap.get(pos.id);
      if (pnlData) return sum + (pnlData.unrealizedPnL || 0);

      const posValue = (pos.current_price || 0) * pos.quantity * 100000;
      const entryValue = (pos.entry_price || 0) * pos.quantity * 100000;
      const isLong = pos.side === 'buy';
      const pnl = isLong ? posValue - entryValue : entryValue - posValue;
      return sum + pnl;
    }, 0);

    const realizedPnL = (profile as { realized_pnl?: number })?.realized_pnl ?? 0;
    const totalPnL = unrealizedPnL + realizedPnL;
    const totalEquity = balance + unrealizedPnL;
    const initialDeposit = balance - realizedPnL;
    const roi = initialDeposit > 0 ? (totalPnL / initialDeposit) * 100 : 0;
    const marginLevelPercent = usedMargin > 0 ? (totalEquity / usedMargin) * 100 : 100;
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

  const getMarginLevelStatus = (level: number) => {
    if (level >= 100) return { color: 'text-profit', bg: 'bg-profit', label: 'Safe', icon: ShieldCheck };
    if (level >= 50) return { color: 'text-warning', bg: 'bg-warning', label: 'Warning', icon: AlertTriangle };
    return { color: 'text-loss', bg: 'bg-loss', label: 'Danger', icon: AlertTriangle };
  };

  const marginStatus = getMarginLevelStatus(metrics.marginLevelPercent);
  const MarginIcon = marginStatus.icon;

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Metrics Bar */}
      <div className="border-b border-border bg-card/50 px-4 py-3 flex-shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Total Equity */}
          <MetricCard
            label="Total Equity"
            value={`$${metrics.totalEquity.toFixed(2)}`}
            tooltip="Your total account value including unrealized P&L"
            icon={<Wallet className="h-4 w-4" />}
          />

          {/* Balance */}
          <MetricCard
            label="Balance"
            value={`$${metrics.totalBalance.toFixed(2)}`}
            tooltip="Your current cash balance"
          />

          {/* Used Margin */}
          <MetricCard
            label="Used Margin"
            value={`$${metrics.totalUsedMargin.toFixed(2)}`}
            tooltip="Margin currently locked in open positions"
          />

          {/* Available Margin */}
          <MetricCard
            label="Free Margin"
            value={`$${metrics.totalAvailableMargin.toFixed(2)}`}
            tooltip="Available funds for new positions"
            valueClassName={metrics.totalAvailableMargin < 100 ? 'text-warning' : undefined}
          />

          {/* Total P&L */}
          <MetricCard
            label="Total P&L"
            value={`${metrics.totalPnL >= 0 ? '+' : ''}$${metrics.totalPnL.toFixed(2)}`}
            tooltip="Combined realized and unrealized profit/loss"
            valueClassName={metrics.totalPnL >= 0 ? 'text-profit' : 'text-loss'}
            icon={metrics.totalPnL >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          />

          {/* ROI */}
          <MetricCard
            label="ROI"
            value={`${metrics.roi >= 0 ? '+' : ''}${metrics.roi.toFixed(2)}%`}
            tooltip="Return on investment percentage"
            valueClassName={metrics.roi >= 0 ? 'text-profit' : 'text-loss'}
          />

          {/* Margin Level */}
          <div className="bg-muted/30 rounded-lg p-2.5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Margin Level</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Info className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[220px]">
                    <div className="text-xs space-y-1">
                      <p>Margin level indicates account health:</p>
                      <p className="text-profit">• Above 100%: Safe</p>
                      <p className="text-warning">• 50-100%: Warning</p>
                      <p className="text-loss">• Below 50%: Liquidation risk</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-2">
              <MarginIcon className={cn("h-4 w-4", marginStatus.color)} />
              <span className={cn("font-mono text-sm font-semibold", marginStatus.color)}>
                {metrics.marginLevelPercent.toFixed(0)}%
              </span>
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                marginStatus.color,
                marginStatus.bg + '/10'
              )}>
                {marginStatus.label}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-300", marginStatus.bg)}
                style={{ width: `${Math.min(metrics.marginLevelPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Positions and Orders */}
      <Tabs defaultValue="positions" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full border-b border-border bg-muted/20 rounded-none h-11">
          <TabsTrigger value="positions" className="flex-1 data-[state=active]:bg-background">
            <Zap className="h-4 w-4 mr-2" />
            Positions
            {positions.length > 0 && (
              <span className="ml-2 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                {positions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex-1 data-[state=active]:bg-background">
            <TrendingUp className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="positions" className="h-full mt-0 overflow-auto">
            <div className="p-4">
              <EnhancedPositionsTable />
            </div>
          </TabsContent>

          <TabsContent value="orders" className="h-full mt-0 overflow-auto">
            <div className="p-4">
              <OrderHistory />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  label: string;
  value: string;
  tooltip?: string;
  icon?: React.ReactNode;
  valueClassName?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  tooltip,
  icon,
  valueClassName,
}) => (
  <div className="bg-muted/30 rounded-lg p-2.5">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <Info className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[180px]">
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    <div className="flex items-center gap-1.5">
      {icon && <span className={valueClassName}>{icon}</span>}
      <span className={cn("font-mono text-sm font-semibold", valueClassName)}>
        {value}
      </span>
    </div>
  </div>
);

export default EnhancedPortfolioDashboard;
