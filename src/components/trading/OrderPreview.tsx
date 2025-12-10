import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, Target, Shield } from "lucide-react";
import { OrderFormData } from "./OrderForm";
import { cn } from "@/lib/utils";

interface OrderPreviewProps {
  formData: Partial<OrderFormData>;
  currentPrice: number;
  assetLeverage?: number;
  commission?: number;
  slippage?: number;
}

/**
 * OrderPreview Component (Enhanced)
 * 
 * Displays real-time order preview with improved visual hierarchy:
 * - Consolidated margin information
 * - Clear risk/reward visualization
 * - Better color contrast
 * - Responsive grid layout
 */
export const OrderPreview = ({
  formData,
  currentPrice,
  assetLeverage = 500,
  commission = 0.0005,
  slippage = 0.0001,
}: OrderPreviewProps) => {
  const quantity = formData.quantity || 0;
  const side = formData.side || 'buy';

  const executionPrice = useMemo(() => {
    if (formData.type === 'market') {
      const slippageAmount = currentPrice * slippage;
      return side === 'buy' ? currentPrice + slippageAmount : currentPrice - slippageAmount;
    }
    
    if (formData.type === 'limit' && formData.limitPrice) {
      return formData.limitPrice;
    }
    if ((formData.type === 'stop' || formData.type === 'stop_limit') && formData.stopPrice) {
      return formData.stopPrice;
    }
    
    return currentPrice;
  }, [currentPrice, formData, side, slippage]);

  const contractSize = 100000;
  const positionValue = quantity * contractSize * executionPrice;
  const commissionAmount = positionValue * commission;
  const marginRequired = positionValue / assetLeverage;

  const tpPnL = useMemo(() => {
    if (!formData.takeProfitPrice) return null;
    const pips = side === 'buy' 
      ? (formData.takeProfitPrice - executionPrice) / 0.0001
      : (executionPrice - formData.takeProfitPrice) / 0.0001;
    const pipValue = quantity * contractSize * 0.0001;
    return pips * pipValue - commissionAmount;
  }, [formData.takeProfitPrice, executionPrice, side, quantity, contractSize, commissionAmount]);

  const slPnL = useMemo(() => {
    if (!formData.stopLossPrice) return null;
    const pips = side === 'buy'
      ? (formData.stopLossPrice - executionPrice) / 0.0001
      : (executionPrice - formData.stopLossPrice) / 0.0001;
    const pipValue = quantity * contractSize * 0.0001;
    return pips * pipValue - commissionAmount;
  }, [formData.stopLossPrice, executionPrice, side, quantity, contractSize, commissionAmount]);

  const riskRewardRatio = useMemo(() => {
    if (!tpPnL || !slPnL || slPnL >= 0) return null;
    return Math.abs(tpPnL / slPnL);
  }, [tpPnL, slPnL]);

  const hasRiskManagement = !!(formData.takeProfitPrice || formData.stopLossPrice);

  return (
    <div className="space-y-4">
      {/* Warning Banner if no TP/SL */}
      {!hasRiskManagement && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
          <AlertCircle className="h-4 w-4 text-warning shrink-0" />
          <p className="text-xs text-warning">
            Set Take Profit and Stop Loss to manage your risk
          </p>
        </div>
      )}

      {/* Entry & Position Summary */}
      <Card className="p-4 bg-card/50 border-border">
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Order Summary</span>
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded",
              side === 'buy' ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
            )}>
              {side.toUpperCase()}
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Entry Price</p>
              <p className="font-mono text-sm font-semibold">{executionPrice.toFixed(5)}</p>
              {formData.type === 'market' && (
                <p className="text-xs text-muted-foreground">
                  incl. {(slippage * 100).toFixed(3)}% slippage
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Position Value</p>
              <p className="font-mono text-sm font-semibold">${positionValue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {quantity} lots @ 1:{assetLeverage}
              </p>
            </div>
          </div>

          {/* Margin & Commission */}
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Margin Required
              </span>
              <span className="font-mono font-semibold text-primary">${marginRequired.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Commission</span>
              <span className="font-mono text-loss">${commissionAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Risk/Reward Section */}
      {(tpPnL !== null || slPnL !== null) && (
        <Card className="p-4 bg-card/50 border-border">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Risk/Reward Analysis</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Take Profit */}
              {tpPnL !== null && (
                <div className="p-3 rounded-lg bg-profit/5 border border-profit/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-profit" />
                    <span className="text-xs text-muted-foreground">At Take Profit</span>
                  </div>
                  <p className="font-mono text-lg font-bold text-profit">
                    +${tpPnL.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {marginRequired > 0 ? `${((tpPnL / marginRequired) * 100).toFixed(1)}% ROI` : '—'}
                  </p>
                </div>
              )}

              {/* Stop Loss */}
              {slPnL !== null && (
                <div className="p-3 rounded-lg bg-loss/5 border border-loss/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown className="h-3.5 w-3.5 text-loss" />
                    <span className="text-xs text-muted-foreground">At Stop Loss</span>
                  </div>
                  <p className="font-mono text-lg font-bold text-loss">
                    ${slPnL.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {marginRequired > 0 ? `${((slPnL / marginRequired) * 100).toFixed(1)}% ROI` : '—'}
                  </p>
                </div>
              )}
            </div>

            {/* Risk/Reward Ratio */}
            {riskRewardRatio !== null && (
              <div className={cn(
                "p-3 rounded-lg border",
                riskRewardRatio >= 2 
                  ? "bg-profit/5 border-profit/20" 
                  : riskRewardRatio >= 1 
                    ? "bg-warning/5 border-warning/20" 
                    : "bg-loss/5 border-loss/20"
              )}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk/Reward Ratio</span>
                  <span className={cn(
                    "font-mono text-lg font-bold",
                    riskRewardRatio >= 2 
                      ? "text-profit" 
                      : riskRewardRatio >= 1 
                        ? "text-warning" 
                        : "text-loss"
                  )}>
                    1:{riskRewardRatio.toFixed(2)}
                  </span>
                </div>
                {riskRewardRatio < 1 && (
                  <p className="text-xs text-loss mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Risk exceeds potential reward
                  </p>
                )}
                {riskRewardRatio >= 2 && (
                  <p className="text-xs text-profit mt-1">
                    Excellent risk/reward ratio
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Order Type Info */}
      <Card className="p-3 bg-muted/30 border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Order Type</span>
          <span className="font-medium">{formatOrderType(formData.type)}</span>
        </div>
        {formData.type !== 'market' && (
          <p className="text-xs text-muted-foreground mt-2">
            {getOrderTypeDescription(
              formData.type,
              formData.limitPrice,
              formData.stopPrice,
              formData.trailingDistance
            )}
          </p>
        )}
      </Card>
    </div>
  );
};

function formatOrderType(type?: string): string {
  const types: Record<string, string> = {
    market: 'Market Order',
    limit: 'Limit Order',
    stop: 'Stop Order',
    stop_limit: 'Stop-Limit Order',
    trailing_stop: 'Trailing Stop',
  };
  return types[type || 'market'] || 'Unknown';
}

function getOrderTypeDescription(
  type?: string,
  limitPrice?: number,
  stopPrice?: number,
  trailingDistance?: number
): string {
  switch (type) {
    case 'limit':
      return `Executes at ${limitPrice?.toFixed(5)} or better`;
    case 'stop':
      return `Market order triggered at ${stopPrice?.toFixed(5)}`;
    case 'stop_limit':
      return `Limit order at ${limitPrice?.toFixed(5)} triggered at ${stopPrice?.toFixed(5)}`;
    case 'trailing_stop':
      return `Stop distance: ${trailingDistance} pips (dynamically adjusts)`;
    default:
      return 'Executes immediately at current market price';
  }
}

export default OrderPreview;
