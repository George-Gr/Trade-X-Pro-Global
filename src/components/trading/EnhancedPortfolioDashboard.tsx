import * as React from "react";
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  Info,
  LayoutList,
  Clock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { usePnLCalculations } from "@/hooks/usePnLCalculations";
import EnhancedPositionsTable from "./EnhancedPositionsTable";
import OrderHistory from "./OrderHistory";
import { cn } from "@/lib/utils";

const EnhancedPortfolioDashboard: React.FC = () => {
  const { profile, positions = [], loading, error } = usePortfolioData();

  const mappedPositions = useMemo(() => {
    return positions.map((pos) => ({
      ...pos,
      entryPrice: pos.entry_price,
      currentPrice: pos.current_price,
      side: (pos.side === "buy" ? "long" : "short") as "long" | "short",
      margin_required: pos.margin_used || 0,
    }));
  }, [positions]);

  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    positions.forEach((pos) => {
      if (pos.current_price !== null) {
        map.set(pos.symbol, pos.current_price);
      }
    });
    return map;
  }, [positions]);

  const { positionPnLMap } = usePnLCalculations(
    mappedPositions,
    priceMap,
    undefined,
    {},
  );

  const metrics = useMemo(() => {
    if (!profile) {
      return {
        equity: 0,
        balance: 0,
        usedMargin: 0,
        freeMargin: 0,
        pnl: 0,
        roi: 0,
        marginLevel: 100,
      };
    }

    const balance = profile.balance || 0;
    const usedMargin = profile.margin_used || 0;
    const freeMargin = balance - usedMargin;

    const unrealizedPnL = (positions || []).reduce((sum, pos) => {
      const pnlData = positionPnLMap.get(pos.id);
      if (pnlData) return sum + (pnlData.unrealizedPnL || 0);
      const posValue = (pos.current_price || 0) * pos.quantity * 100000;
      const entryValue = (pos.entry_price || 0) * pos.quantity * 100000;
      const isLong = pos.side === "buy";
      return sum + (isLong ? posValue - entryValue : entryValue - posValue);
    }, 0);

    const equity = balance + unrealizedPnL;
    const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : 100;
    const roi = balance > 0 ? (unrealizedPnL / balance) * 100 : 0;

    return {
      equity,
      balance,
      usedMargin,
      freeMargin,
      pnl: unrealizedPnL,
      roi,
      marginLevel,
    };
  }, [profile, positions, positionPnLMap]);

  const getMarginStatus = (level: number) => {
    if (level >= 100)
      return { color: "text-profit", bg: "bg-profit", label: "Safe" };
    if (level >= 50)
      return { color: "text-warning", bg: "bg-warning", label: "Warning" };
    return { color: "text-loss", bg: "bg-loss", label: "Danger" };
  };

  const marginStatus = getMarginStatus(metrics.marginLevel);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Account Metrics Bar */}
      <div className="border-b border-border bg-card/30 px-4 py-3 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Equity */}
          <MetricItem
            label="Total Equity"
            value={`$${metrics.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<Wallet className="h-3.5 w-3.5" />}
            tooltip="Account value including unrealized P&L"
          />

          {/* Balance */}
          <MetricItem
            label="Balance"
            value={`$${metrics.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            tooltip="Cash balance"
          />

          {/* Used Margin */}
          <MetricItem
            label="Used Margin"
            value={`$${metrics.usedMargin.toFixed(2)}`}
            tooltip="Margin locked in positions"
          />

          {/* Free Margin */}
          <MetricItem
            label="Free Margin"
            value={`$${metrics.freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            valueClassName={
              metrics.freeMargin < 100 ? "text-warning" : undefined
            }
            tooltip="Available for new trades"
          />

          {/* P&L */}
          <MetricItem
            label="Total P&L"
            value={`${metrics.pnl >= 0 ? "+" : ""}$${metrics.pnl.toFixed(2)}`}
            valueClassName={metrics.pnl >= 0 ? "text-profit" : "text-loss"}
            icon={
              metrics.pnl >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )
            }
            tooltip="Unrealized profit/loss"
          />

          {/* ROI */}
          <MetricItem
            label="ROI"
            value={`${metrics.roi >= 0 ? "+" : ""}${metrics.roi.toFixed(2)}%`}
            valueClassName={metrics.roi >= 0 ? "text-profit" : "text-loss"}
            tooltip="Return on investment"
          />

          {/* Margin Level */}
          <div className="rounded-lg bg-muted/30 p-2.5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Margin Level
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <div className="text-xs space-y-0.5">
                      <p className="text-profit">≥100%: Safe</p>
                      <p className="text-warning">50-99%: Warning</p>
                      <p className="text-loss">&lt;50%: Liquidation risk</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              {metrics.marginLevel >= 100 ? (
                <ShieldCheck className={cn("h-4 w-4", marginStatus.color)} />
              ) : (
                <AlertTriangle className={cn("h-4 w-4", marginStatus.color)} />
              )}
              <span
                className={cn(
                  "font-mono text-sm font-bold",
                  marginStatus.color,
                )}
              >
                {metrics.marginLevel.toFixed(0)}%
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded",
                  marginStatus.color,
                  marginStatus.bg + "/10",
                )}
              >
                {marginStatus.label}
              </span>
            </div>
            <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  marginStatus.bg,
                )}
                style={{ width: `${Math.min(metrics.marginLevel, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Positions / Orders Tabs */}
      <Tabs
        defaultValue="positions"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="w-full border-b border-border bg-transparent rounded-none h-10 px-4 justify-start gap-4">
          <TabsTrigger
            value="positions"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2"
          >
            <LayoutList className="h-4 w-4 mr-1.5" />
            Positions
            {positions.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                {positions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2"
          >
            <Clock className="h-4 w-4 mr-1.5" />
            Orders
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="positions" className="h-full m-0 overflow-auto">
            <div className="p-4">
              <EnhancedPositionsTable />
            </div>
          </TabsContent>

          <TabsContent value="orders" className="h-full m-0 overflow-auto">
            <div className="p-4">
              <OrderHistory />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

interface MetricItemProps {
  label: string;
  value: string;
  tooltip?: string;
  icon?: React.ReactNode;
  valueClassName?: string;
}

const MetricItem: React.FC<MetricItemProps> = ({
  label,
  value,
  tooltip,
  icon,
  valueClassName,
}) => (
  <div className="rounded-lg bg-muted/30 p-2.5">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="bottom">
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
