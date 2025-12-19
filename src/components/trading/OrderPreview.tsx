import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';
import { OrderFormData } from './OrderForm';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OrderPreviewProps {
  formData: Partial<OrderFormData>;
  currentPrice: number;
  assetLeverage?: number;
  commission?: number;
  slippage?: number;
}

export const OrderPreview = ({
  formData,
  currentPrice,
  assetLeverage = 100,
  commission = 0.0005,
  slippage = 0.0001,
}: OrderPreviewProps) => {
  const quantity = formData.quantity || 0;
  const side = formData.side || 'buy';

  const executionPrice = useMemo(() => {
    if (formData.type === 'market') {
      const slippageAmount = currentPrice * slippage;
      return side === 'buy'
        ? currentPrice + slippageAmount
        : currentPrice - slippageAmount;
    }
    if (formData.type === 'limit' && formData.limitPrice)
      return formData.limitPrice;
    if (
      (formData.type === 'stop' || formData.type === 'stop_limit') &&
      formData.stopPrice
    )
      return formData.stopPrice;
    return currentPrice;
  }, [currentPrice, formData, side, slippage]);

  const positionValue = quantity * 100000 * executionPrice;
  const commissionAmount = positionValue * commission;
  const marginRequired = positionValue / assetLeverage;

  const tpPnL = useMemo(() => {
    if (!formData.takeProfitPrice) return null;
    const pips =
      side === 'buy'
        ? (formData.takeProfitPrice - executionPrice) / 0.0001
        : (executionPrice - formData.takeProfitPrice) / 0.0001;
    return pips * quantity * 100000 * 0.0001 - commissionAmount;
  }, [
    formData.takeProfitPrice,
    executionPrice,
    side,
    quantity,
    commissionAmount,
  ]);

  const slPnL = useMemo(() => {
    if (!formData.stopLossPrice) return null;
    const pips =
      side === 'buy'
        ? (formData.stopLossPrice - executionPrice) / 0.0001
        : (executionPrice - formData.stopLossPrice) / 0.0001;
    return pips * quantity * 100000 * 0.0001 - commissionAmount;
  }, [
    formData.stopLossPrice,
    executionPrice,
    side,
    quantity,
    commissionAmount,
  ]);

  const riskReward = useMemo(() => {
    if (!tpPnL || !slPnL || slPnL >= 0) return null;
    return Math.abs(tpPnL / slPnL);
  }, [tpPnL, slPnL]);

  const hasRiskManagement = !!(
    formData.takeProfitPrice || formData.stopLossPrice
  );

  const formatOrderType = (type?: string) => {
    const types: Record<string, string> = {
      market: 'Market',
      limit: 'Limit',
      stop: 'Stop',
      stop_limit: 'Stop-Limit',
      trailing_stop: 'Trailing',
    };
    return types[type || 'market'] || 'Market';
  };

  return (
    <div className="space-y-4">
      {/* Warning if no TP/SL */}
      {!hasRiskManagement && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warning/10 border border-warning/20">
          <AlertCircle className="h-4 w-4 text-warning shrink-0" />
          <p className="text-xs text-warning">Set TP/SL to manage risk</p>
        </div>
      )}

      {/* Order Summary Card */}
      <div className="rounded-lg border border-border bg-card/50 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Order Summary
          </span>
          <span
            className={cn(
              'text-xs font-bold px-2 py-0.5 rounded',
              side === 'buy'
                ? 'bg-profit/10 text-profit'
                : 'bg-loss/10 text-loss'
            )}
          >
            {side.toUpperCase()}
          </span>
        </div>

        {/* Key Values */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">
              Entry Price
            </p>
            <p className="font-mono text-sm font-semibold">
              {executionPrice.toFixed(5)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">
              Position Value
            </p>
            <p className="font-mono text-sm font-semibold">
              $
              {positionValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-2.5 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              Margin
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs">
                      Required margin at 1:{assetLeverage}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-mono font-semibold text-primary">
              ${marginRequired.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Commission</span>
            <span className="font-mono">${commissionAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Risk/Reward Analysis */}
      {(tpPnL !== null || slPnL !== null) && (
        <div className="rounded-lg border border-border bg-card/50 p-3 space-y-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Potential P&L
          </span>

          <div className="grid grid-cols-2 gap-2">
            {tpPnL !== null && (
              <div className="p-2.5 rounded-lg bg-profit/5 border border-profit/20">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-profit" />
                  <span className="text-[10px] text-muted-foreground uppercase">
                    Take Profit
                  </span>
                </div>
                <p className="font-mono text-base font-bold text-profit">
                  +${tpPnL.toFixed(2)}
                </p>
              </div>
            )}

            {slPnL !== null && (
              <div className="p-2.5 rounded-lg bg-loss/5 border border-loss/20">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown className="h-3 w-3 text-loss" />
                  <span className="text-[10px] text-muted-foreground uppercase">
                    Stop Loss
                  </span>
                </div>
                <p className="font-mono text-base font-bold text-loss">
                  ${slPnL.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {riskReward !== null && (
            <div
              className={cn(
                'p-2.5 rounded-lg border text-center',
                riskReward >= 2
                  ? 'bg-profit/5 border-profit/20'
                  : riskReward >= 1
                    ? 'bg-warning/5 border-warning/20'
                    : 'bg-loss/5 border-loss/20'
              )}
            >
              <span className="text-[10px] text-muted-foreground uppercase block mb-1">
                Risk/Reward
              </span>
              <span
                className={cn(
                  'font-mono text-lg font-bold',
                  riskReward >= 2
                    ? 'text-profit'
                    : riskReward >= 1
                      ? 'text-warning'
                      : 'text-loss'
                )}
              >
                1:{riskReward.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Order Type */}
      <div className="flex justify-between items-center text-xs px-1">
        <span className="text-muted-foreground">Order Type</span>
        <span className="font-medium">
          {formatOrderType(formData.type)} Order
        </span>
      </div>
    </div>
  );
};

export default OrderPreview;
