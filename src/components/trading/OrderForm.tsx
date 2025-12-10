import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatFieldError } from "@/lib/errorMessageService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Plus, Minus, Info, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { OrderType } from "./OrderTypeSelector";
import { cn } from "@/lib/utils";

export interface OrderFormData {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  type: OrderType;
  limitPrice?: number;
  stopPrice?: number;
  trailingDistance?: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
  timeInForce?: 'GTC' | 'GTD' | 'FOK' | 'IOC';
}

interface OrderFormProps {
  symbol: string;
  orderType: OrderType;
  onOrderTypeChange: (type: OrderType) => void;
  onSubmit: (formData: OrderFormData, side: 'buy' | 'sell') => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  currentPrice: number;
  assetLeverage?: number;
}

/**
 * OrderForm Component (Enhanced)
 * 
 * Improved form with:
 * - Better visual hierarchy and spacing
 * - Volume increment/decrement buttons
 * - Risk management warnings
 * - Sticky Buy/Sell buttons
 * - Quick TP/SL percentage presets
 */
export const OrderForm = ({
  symbol,
  orderType,
  onOrderTypeChange,
  onSubmit,
  isLoading = false,
  error = null,
  currentPrice,
  assetLeverage = 500,
}: OrderFormProps) => {
  const [volume, setVolume] = useState("0.01");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [trailingDistance, setTrailingDistance] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [timeInForce, setTimeInForce] = useState<'GTC' | 'GTD' | 'FOK' | 'IOC'>('GTC');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculations
  const marginRequired = useMemo(() => {
    const qty = parseFloat(volume) || 0;
    const contractSize = 100000;
    if (qty <= 0 || assetLeverage <= 0) return 0;
    return (qty * contractSize * currentPrice) / assetLeverage;
  }, [volume, assetLeverage, currentPrice]);

  const positionValue = useMemo(() => {
    const qty = parseFloat(volume) || 0;
    const contractSize = 100000;
    return qty * contractSize * currentPrice;
  }, [volume, currentPrice]);

  const pipValue = useMemo(() => {
    const qty = parseFloat(volume) || 0;
    const pipSize = 0.0001;
    const contractSize = 100000;
    return qty * contractSize * pipSize;
  }, [volume]);

  // Volume adjustment handlers
  const adjustVolume = (delta: number) => {
    const current = parseFloat(volume) || 0;
    const newValue = Math.max(0.01, Math.min(1000, current + delta));
    setVolume(newValue.toFixed(2));
  };

  // Quick TP/SL percentage presets
  const applyTPPreset = (percent: number, side: 'buy' | 'sell') => {
    const movement = currentPrice * (percent / 100);
    const tp = side === 'buy' ? currentPrice + movement : currentPrice - movement;
    setTakeProfit(tp.toFixed(5));
  };

  const applySLPreset = (percent: number, side: 'buy' | 'sell') => {
    const movement = currentPrice * (percent / 100);
    const sl = side === 'buy' ? currentPrice - movement : currentPrice + movement;
    setStopLoss(sl.toFixed(5));
  };

  const validateForm = (): boolean => {
    setValidationError(null);

    const qty = parseFloat(volume);
    if (isNaN(qty) || qty <= 0) {
      setValidationError("Volume must be greater than 0");
      return false;
    }

    if (qty < 0.01) {
      setValidationError("Minimum volume is 0.01 lots");
      return false;
    }

    if (qty > 1000) {
      setValidationError("Maximum volume is 1000 lots");
      return false;
    }

    if (orderType === 'limit' || orderType === 'stop_limit') {
      const lp = parseFloat(limitPrice);
      if (isNaN(lp) || lp <= 0) {
        setValidationError("Limit price must be greater than 0");
        return false;
      }
    }

    if (orderType === 'stop' || orderType === 'stop_limit') {
      const sp = parseFloat(stopPrice);
      if (isNaN(sp) || sp <= 0) {
        setValidationError("Stop price must be greater than 0");
        return false;
      }
    }

    if (orderType === 'trailing_stop') {
      const td = parseFloat(trailingDistance);
      if (isNaN(td) || td <= 0) {
        setValidationError("Trailing distance must be greater than 0");
        return false;
      }
    }

    if (takeProfit) {
      const tp = parseFloat(takeProfit);
      if (isNaN(tp) || tp <= 0) {
        setValidationError("Take profit price must be greater than 0");
        return false;
      }
    }

    if (stopLoss) {
      const sl = parseFloat(stopLoss);
      if (isNaN(sl) || sl <= 0) {
        setValidationError("Stop loss price must be greater than 0");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (side: 'buy' | 'sell') => {
    if (!validateForm()) return;

    const formData: OrderFormData = {
      symbol,
      side,
      quantity: parseFloat(volume),
      type: orderType,
      limitPrice: limitPrice ? parseFloat(limitPrice) : undefined,
      stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
      trailingDistance: trailingDistance ? parseFloat(trailingDistance) : undefined,
      takeProfitPrice: takeProfit ? parseFloat(takeProfit) : undefined,
      stopLossPrice: stopLoss ? parseFloat(stopLoss) : undefined,
      timeInForce,
    };

    try {
      await onSubmit(formData, side);
      setVolume("0.01");
      setLimitPrice("");
      setStopPrice("");
      setTrailingDistance("");
      setTakeProfit("");
      setStopLoss("");
    } catch (err) {
      // Error handled by parent
    }
  };

  const hasRiskManagement = !!(takeProfit || stopLoss);

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {(error || validationError) && (
        <ErrorState
          error={error || validationError}
          context="order_submission"
          showRetry={false}
          showSupport={true}
          className="mb-4"
        />
      )}

      {/* Volume Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="volume" className="text-sm font-medium">
            Volume (Lots)
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[200px]">
                <p className="text-xs">
                  Min: 0.01 lots | Max: 1000 lots<br />
                  1 lot = 100,000 units
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => adjustVolume(-0.01)}
            disabled={isLoading || parseFloat(volume) <= 0.01}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id="volume"
            type="number"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            step="0.01"
            min="0.01"
            max="1000"
            placeholder="0.01"
            disabled={isLoading}
            className="text-center font-mono text-base"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => adjustVolume(0.01)}
            disabled={isLoading || parseFloat(volume) >= 1000}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Pip value: <span className="font-mono">${pipValue.toFixed(2)}</span>
        </p>
      </div>

      {/* Margin & Position Info Card */}
      <div className="bg-muted/30 border border-border rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Leverage</span>
          <span className="font-mono font-medium">1:{assetLeverage}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Position Value</span>
          <span className="font-mono font-medium">${positionValue.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm border-t border-border pt-2">
          <span className="text-muted-foreground font-medium">Margin Required</span>
          <span className="font-mono font-semibold text-primary">${marginRequired.toFixed(2)}</span>
        </div>
      </div>

      {/* Order Type Specific Fields */}
      {(orderType === 'limit' || orderType === 'stop_limit') && (
        <div className="space-y-2">
          <Label htmlFor="limitPrice" className="text-sm font-medium">
            Limit Price
          </Label>
          <Input
            id="limitPrice"
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            step="0.0001"
            min="0"
            placeholder={currentPrice.toFixed(5)}
            disabled={isLoading}
            className="font-mono"
          />
        </div>
      )}

      {(orderType === 'stop' || orderType === 'stop_limit') && (
        <div className="space-y-2">
          <Label htmlFor="stopPrice" className="text-sm font-medium">
            Stop Price
          </Label>
          <Input
            id="stopPrice"
            type="number"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            step="0.0001"
            min="0"
            placeholder={currentPrice.toFixed(5)}
            disabled={isLoading}
            className="font-mono"
          />
        </div>
      )}

      {orderType === 'trailing_stop' && (
        <div className="space-y-2">
          <Label htmlFor="trailingDistance" className="text-sm font-medium">
            Trailing Distance (pips)
          </Label>
          <Input
            id="trailingDistance"
            type="number"
            value={trailingDistance}
            onChange={(e) => setTrailingDistance(e.target.value)}
            step="1"
            min="1"
            placeholder="10"
            disabled={isLoading}
            className="font-mono"
          />
        </div>
      )}

      {/* Take Profit & Stop Loss Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Risk Management</Label>
          {!hasRiskManagement && (
            <div className="flex items-center gap-1 text-xs text-warning">
              <AlertTriangle className="h-3 w-3" />
              <span>Recommended</span>
            </div>
          )}
        </div>
        
        {/* Take Profit */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="takeProfit" className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-profit" />
              Take Profit
            </Label>
            <div className="flex gap-1">
              {[1, 2, 5].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => applyTPPreset(pct, 'buy')}
                  disabled={isLoading}
                  className="text-xs px-1.5 py-0.5 rounded bg-profit/10 text-profit hover:bg-profit/20 transition-colors"
                >
                  +{pct}%
                </button>
              ))}
            </div>
          </div>
          <Input
            id="takeProfit"
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            step="0.0001"
            min="0"
            placeholder="Optional"
            disabled={isLoading}
            className="font-mono h-9"
          />
        </div>

        {/* Stop Loss */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="stopLoss" className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-loss" />
              Stop Loss
            </Label>
            <div className="flex gap-1">
              {[1, 2, 5].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => applySLPreset(pct, 'buy')}
                  disabled={isLoading}
                  className="text-xs px-1.5 py-0.5 rounded bg-loss/10 text-loss hover:bg-loss/20 transition-colors"
                >
                  -{pct}%
                </button>
              ))}
            </div>
          </div>
          <Input
            id="stopLoss"
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            step="0.0001"
            min="0"
            placeholder="Optional"
            disabled={isLoading}
            className="font-mono h-9"
          />
        </div>
      </div>

      {/* Time in Force */}
      <div className="space-y-2">
        <Label htmlFor="timeInForce" className="text-sm font-medium">
          Time in Force
        </Label>
        <Select
          value={timeInForce}
          onValueChange={(v) => setTimeInForce(v as 'GTC' | 'GTD' | 'FOK' | 'IOC')}
          disabled={isLoading}
        >
          <SelectTrigger id="timeInForce" className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GTC">GTC (Good Till Canceled)</SelectItem>
            <SelectItem value="FOK">FOK (Fill or Kill)</SelectItem>
            <SelectItem value="IOC">IOC (Immediate or Cancel)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Buy/Sell Buttons - Sticky on mobile */}
      <div className="grid grid-cols-2 gap-3 pt-2 sticky bottom-0 bg-background pb-2 -mb-2 border-t border-border md:border-0 md:static md:bg-transparent">
        <LoadingButton
          onClick={() => handleSubmit('buy')}
          isLoading={isLoading}
          loadingText="Buying..."
          className="h-12 bg-profit hover:bg-profit/90 text-profit-foreground font-semibold text-base shadow-lg shadow-profit/20"
          size="lg"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Buy
        </LoadingButton>
        <LoadingButton
          onClick={() => handleSubmit('sell')}
          isLoading={isLoading}
          loadingText="Selling..."
          className="h-12 bg-loss hover:bg-loss/90 text-loss-foreground font-semibold text-base shadow-lg shadow-loss/20"
          size="lg"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sell
        </LoadingButton>
      </div>
    </div>
  );
};

export default OrderForm;
