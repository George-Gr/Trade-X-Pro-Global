import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { OrderFormData } from "./OrderForm";

interface OrderPreviewProps {
  formData: Partial<OrderFormData>;
  currentPrice: number;
  commission?: number; // as percentage
  slippage?: number; // as percentage
}

/**
 * OrderPreview Component
 * 
 * Displays real-time order preview with:
 * - Execution price (with slippage)
 * - Total commission
 * - Risk/reward ratio
 * - Estimated P&L at TP/SL levels
 */
export const OrderPreview = ({
  formData,
  currentPrice,
  commission = 0.0005, // 0.05% default
  slippage = 0.0001, // 0.01% default
}: OrderPreviewProps) => {
  const quantity = formData.quantity || 0;
  const leverage = formData.leverage || 100;
  const side = formData.side || 'buy';

  // Calculate execution price with slippage
  const executionPrice = useMemo(() => {
    if (formData.type === 'market') {
      const slippageAmount = currentPrice * slippage;
      return side === 'buy' ? currentPrice + slippageAmount : currentPrice - slippageAmount;
    }
    
    // For limit/stop orders, use specified price
    if (formData.type === 'limit' && formData.limitPrice) {
      return formData.limitPrice;
    }
    if ((formData.type === 'stop' || formData.type === 'stop_limit') && formData.stopPrice) {
      return formData.stopPrice;
    }
    
    return currentPrice;
  }, [currentPrice, formData, side, slippage]);

  // Calculate total cost/position value
  const contractSize = 100000;
  const positionValue = quantity * contractSize * executionPrice;
  
  // Calculate commission
  const commissionAmount = positionValue * commission;
  
  // Calculate margin requirement
  const marginRequired = positionValue / leverage;

  // Calculate P&L at take profit
  const tpPnL = useMemo(() => {
    if (!formData.takeProfitPrice) return null;
    const pips = side === 'buy' 
      ? (formData.takeProfitPrice - executionPrice) / 0.0001
      : (executionPrice - formData.takeProfitPrice) / 0.0001;
    const pipValue = quantity * contractSize * 0.0001;
    return pips * pipValue - commissionAmount;
  }, [formData.takeProfitPrice, executionPrice, side, quantity, contractSize, commissionAmount]);

  // Calculate P&L at stop loss
  const slPnL = useMemo(() => {
    if (!formData.stopLossPrice) return null;
    const pips = side === 'buy'
      ? (formData.stopLossPrice - executionPrice) / 0.0001
      : (executionPrice - formData.stopLossPrice) / 0.0001;
    const pipValue = quantity * contractSize * 0.0001;
    return pips * pipValue - commissionAmount;
  }, [formData.stopLossPrice, executionPrice, side, quantity, contractSize, commissionAmount]);

  // Calculate risk/reward ratio
  const riskRewardRatio = useMemo(() => {
    if (!tpPnL || !slPnL || slPnL >= 0) return null;
    return Math.abs(tpPnL / slPnL);
  }, [tpPnL, slPnL]);

  // Warn if no TP/SL set
  const hasRiskManagement = !!(formData.takeProfitPrice && formData.stopLossPrice);

  return (
    <Card className="p-4 space-y-4 bg-secondary/30 border-secondary">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Order Preview</h3>
        {!hasRiskManagement && (
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <AlertCircle className="h-3 w-3" />
            <span>No TP/SL set</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Entry Price */}
        <div className="space-y-1">
          <p className="text-muted-foreground">Entry Price</p>
          <p className="font-mono font-semibold">{executionPrice.toFixed(5)}</p>
          {formData.type === 'market' && (
            <p className="text-muted-foreground text-xs">
              +{(slippage * 100).toFixed(3)}% slippage
            </p>
          )}
        </div>

        {/* Position Value */}
        <div className="space-y-1">
          <p className="text-muted-foreground">Position Value</p>
          <p className="font-mono font-semibold">${positionValue.toFixed(2)}</p>
          <p className="text-muted-foreground text-xs">
            {quantity} lots @ {leverageLabelify(leverage)}
          </p>
        </div>

        {/* Commission */}
        <div className="space-y-1">
          <p className="text-muted-foreground">Commission</p>
          <p className="font-mono font-semibold text-loss">${commissionAmount.toFixed(2)}</p>
          <p className="text-muted-foreground text-xs">
            ({(commission * 100).toFixed(3)}%)
          </p>
        </div>

        {/* Margin Required */}
        <div className="space-y-1">
          <p className="text-muted-foreground">Margin Required</p>
          <p className="font-mono font-semibold">${marginRequired.toFixed(2)}</p>
        </div>
      </div>

      {/* Risk/Reward if TP and SL are set */}
      {tpPnL !== null && slPnL !== null && (
        <div className="border-t border-border pt-3 space-y-2">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Take Profit P&L */}
            <div className="space-y-1 bg-profit/5 rounded p-2">
              <p className="text-muted-foreground">At Take Profit</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-profit" />
                <p className="font-mono font-semibold text-profit">
                  +${tpPnL.toFixed(2)}
                </p>
              </div>
              <p className="text-muted-foreground text-xs">
                {((tpPnL / marginRequired) * 100).toFixed(1)}% ROI
              </p>
            </div>

            {/* Stop Loss P&L */}
            <div className="space-y-1 bg-loss/5 rounded p-2">
              <p className="text-muted-foreground">At Stop Loss</p>
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-loss" />
                <p className="font-mono font-semibold text-loss">
                  ${slPnL.toFixed(2)}
                </p>
              </div>
              <p className="text-muted-foreground text-xs">
                {((slPnL / marginRequired) * 100).toFixed(1)}% ROI
              </p>
            </div>
          </div>

          {/* Risk/Reward Ratio */}
          {riskRewardRatio && (
            <div className="bg-card border border-border rounded p-2">
              <div className="flex items-center justify-between text-xs">
                <p className="text-muted-foreground">Risk/Reward Ratio</p>
                <p className={`font-mono font-semibold ${
                  riskRewardRatio >= 1.5 ? 'text-profit' : 'text-amber-500'
                }`}>
                  1:{riskRewardRatio.toFixed(2)}
                </p>
              </div>
              {riskRewardRatio < 1 && (
                <p className="text-muted-foreground text-xs mt-1">
                  ⚠️ Risk exceeds reward
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Order Type Info */}
      <div className="border-t border-border pt-3 text-xs">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Order Type</p>
          <p className="font-semibold capitalize">{formatOrderType(formData.type)}</p>
        </div>
        {formData.type !== 'market' && (
          <div className="mt-2 p-2 bg-card rounded text-muted-foreground text-xs">
            <p>
              {getOrderTypeDescription(
                formData.type,
                formData.limitPrice,
                formData.stopPrice,
                formData.trailingDistance
              )}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Helper functions
function leverageLabelify(leverage: number): string {
  return `1:${leverage}`;
}

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
      return `Will execute at ${limitPrice?.toFixed(5)} or better`;
    case 'stop':
      return `Market order triggered when price reaches ${stopPrice?.toFixed(5)}`;
    case 'stop_limit':
      return `Limit order at ${limitPrice?.toFixed(5)} triggered at ${stopPrice?.toFixed(5)}`;
    case 'trailing_stop':
      return `Stop distance: ${trailingDistance} pips (dynamically adjusts)`;
    default:
      return 'Executes immediately at current market price';
  }
}

export default OrderPreview;
