import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";
import { OrderType } from "./OrderTypeSelector";

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
  assetLeverage?: number; // Fixed broker-set leverage for this asset
}

/**
 * OrderForm Component
 * 
 * Handles order form input with validation and dynamic field visibility
 * based on order type (Market, Limit, Stop, Stop-Limit, Trailing Stop).
 */
export const OrderForm = ({
  symbol,
  orderType,
  onOrderTypeChange,
  onSubmit,
  isLoading = false,
  error = null,
  currentPrice,
  assetLeverage = 500, // Default to max if not provided
}: OrderFormProps) => {
  const [volume, setVolume] = useState("0.01");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [trailingDistance, setTrailingDistance] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [timeInForce, setTimeInForce] = useState<'GTC' | 'GTD' | 'FOK' | 'IOC'>('GTC');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Margin calculation using FIXED asset leverage (not user-customizable)
  const marginRequired = useMemo(() => {
    const qty = parseFloat(volume) || 0;
    const contractSize = 100000;

    if (qty <= 0 || assetLeverage <= 0) return 0;
    return (qty * contractSize * currentPrice) / assetLeverage;
  }, [volume, assetLeverage, currentPrice]);

  // Pip value calculation
  const pipValue = useMemo(() => {
    const qty = parseFloat(volume) || 0;
    const pipSize = 0.0001;
    const contractSize = 100000;
    return qty * contractSize * pipSize;
  }, [volume]);

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

    // Validate order type specific fields
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

    // Optional TP/SL validation
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
      // Reset form on success
      setVolume("0.01");
      setLimitPrice("");
      setStopPrice("");
      setTrailingDistance("");
      setTakeProfit("");
      setStopLoss("");
    } catch (err) {
      // Error handled by parent component
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {(error || validationError) && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-4">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-2.5" />
          <div>
            <p className="text-sm font-medium text-destructive">
              {error || validationError}
            </p>
          </div>
        </div>
      )}

      {/* Volume Input */}
      <div className="space-y-2">
        <Label htmlFor="volume" className="text-sm font-semibold">
          Volume (Lots)
        </Label>
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
          aria-label="Order volume in lots"
        />
        <p className="text-xs text-muted-foreground">
          Pip value: ${pipValue.toFixed(2)}
        </p>
      </div>

      {/* Fixed Asset Leverage Display (Read-Only) */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          Leverage (Fixed by Broker)
        </Label>
        <div className="bg-muted/50 border border-border rounded-md p-4 flex items-center justify-between">
          <span className="font-mono font-semibold text-foreground">
            1:{assetLeverage.toFixed(0)}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-4 py-4 rounded">
            Fixed
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Margin required: ${marginRequired.toFixed(2)}
        </p>
      </div>

      {/* Order Type Specific Fields */}

      {/* Limit Price - for Limit and Stop-Limit */}
      {(orderType === 'limit' || orderType === 'stop_limit') && (
        <div className="space-y-2">
          <Label htmlFor="limitPrice" className="text-sm font-semibold">
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
            aria-label="Limit price for order"
          />
        </div>
      )}

      {/* Stop Price - for Stop and Stop-Limit */}
      {(orderType === 'stop' || orderType === 'stop_limit') && (
        <div className="space-y-2">
          <Label htmlFor="stopPrice" className="text-sm font-semibold">
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
            aria-label="Stop price for order"
          />
        </div>
      )}

      {/* Trailing Distance - for Trailing Stop */}
      {orderType === 'trailing_stop' && (
        <div className="space-y-2">
          <Label htmlFor="trailingDistance" className="text-sm font-semibold">
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
            aria-label="Trailing stop distance in pips"
          />
        </div>
      )}

      {/* Take Profit & Stop Loss */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="takeProfit" className="text-sm font-semibold">
            Take Profit (Optional)
          </Label>
          <Input
            id="takeProfit"
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            step="0.0001"
            min="0"
            placeholder="Optional"
            disabled={isLoading}
            aria-label="Take profit price"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stopLoss" className="text-sm font-semibold">
            Stop Loss (Optional)
          </Label>
          <Input
            id="stopLoss"
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            step="0.0001"
            min="0"
            placeholder="Optional"
            disabled={isLoading}
            aria-label="Stop loss price"
          />
        </div>
      </div>

      {/* Time in Force */}
      <div className="space-y-2">
        <Label htmlFor="timeInForce" className="text-sm font-semibold">
          Time in Force
        </Label>
        <Select
          value={timeInForce}
          onValueChange={(v) => setTimeInForce(v as 'GTC' | 'GTD' | 'FOK' | 'IOC')}
          disabled={isLoading}
        >
          <SelectTrigger id="timeInForce" aria-label="Select time in force">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GTC">GTC (Good Till Canceled)</SelectItem>
            <SelectItem value="FOK">FOK (Fill or Kill)</SelectItem>
            <SelectItem value="IOC">IOC (Immediate or Cancel)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Buy/Sell Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <LoadingButton
          onClick={() => handleSubmit('buy')}
          isLoading={isLoading}
          loadingText="Buying..."
          className="bg-profit hover:bg-profit/90 text-foreground"
          size="lg"
        >
          Buy
        </LoadingButton>
        <LoadingButton
          onClick={() => handleSubmit('sell')}
          isLoading={isLoading}
          loadingText="Selling..."
          className="bg-loss hover:bg-loss/90 text-foreground"
          size="lg"
        >
          Sell
        </LoadingButton>
      </div>
    </div>
  );
};

export default OrderForm;
