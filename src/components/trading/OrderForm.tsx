import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatFieldError } from '@/lib/errorMessageService';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Info, Minus, Plus } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { z } from 'zod';
import { OrderType } from './OrderTypeSelector';

// Zod schema for order form validation
const orderFormSchema = z.object({
  volume: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    {
      message: 'Invalid volume',
    }
  ),
  limitPrice: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const num = parseFloat(val);
        return !isNaN(num);
      },
      {
        message: 'Invalid price',
      }
    ),
  stopPrice: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const num = parseFloat(val);
        return !isNaN(num);
      },
      {
        message: 'Invalid price',
      }
    ),
  trailingDistance: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 1;
      },
      {
        message: 'Invalid trailing distance',
      }
    ),
});

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

export const OrderForm: React.FC<OrderFormProps> = ({
  symbol,
  orderType,
  onSubmit,
  isLoading = false,
  error = null,
  currentPrice,
  assetLeverage = 100,
}) => {
  const [volume, setVolume] = useState('0.01');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [trailingDistance, setTrailingDistance] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [timeInForce, setTimeInForce] = useState<'GTC' | 'GTD' | 'FOK' | 'IOC'>(
    'GTC'
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const marginRequired = useMemo(() => {
    const qty = parseFloat(volume) || 0;
    const contractSize = 100000;
    if (qty <= 0 || assetLeverage <= 0) return 0;
    return (qty * contractSize * currentPrice) / assetLeverage;
  }, [volume, assetLeverage, currentPrice]);

  const positionValue = useMemo(() => {
    const qty = parseFloat(volume) || 0;
    return qty * 100000 * currentPrice;
  }, [volume, currentPrice]);

  const pipValue = useMemo(() => {
    const qty = parseFloat(volume) || 0;
    return qty * 100000 * 0.0001;
  }, [volume]);

  const adjustVolume = (delta: number) => {
    const current = parseFloat(volume) || 0;
    const newValue = Math.max(0.01, Math.min(100, current + delta));
    setVolume(newValue.toFixed(2));
    setFieldErrors((prev) => ({ ...prev, volume: '' })); // Clear error
  };

  const applyTPPreset = (percent: number) => {
    const movement = currentPrice * (percent / 100);
    setTakeProfit((currentPrice + movement).toFixed(5));
  };

  const applySLPreset = (percent: number) => {
    const movement = currentPrice * (percent / 100);
    setStopLoss((currentPrice - movement).toFixed(5));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate base fields using Zod schema
    const validationResult = orderFormSchema.safeParse({
      volume,
      limitPrice:
        orderType === 'limit' || orderType === 'stop_limit'
          ? limitPrice
          : undefined,
      stopPrice:
        orderType === 'stop' || orderType === 'stop_limit'
          ? stopPrice
          : undefined,
      trailingDistance:
        orderType === 'trailing_stop' ? trailingDistance : undefined,
    });

    if (!validationResult.success) {
      // Convert Zod validation errors to field errors
      validationResult.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        errors[field] = formatFieldError(error.message, field);
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (side: 'buy' | 'sell') => {
    if (!validateForm()) return;

    const qty = parseFloat(volume);

    const formData: OrderFormData = {
      symbol,
      side,
      quantity: qty,
      type: orderType,
      ...(limitPrice ? { limitPrice: parseFloat(limitPrice) } : {}),
      ...(stopPrice ? { stopPrice: parseFloat(stopPrice) } : {}),
      ...(trailingDistance
        ? { trailingDistance: parseFloat(trailingDistance) }
        : {}),
      ...(takeProfit ? { takeProfitPrice: parseFloat(takeProfit) } : {}),
      ...(stopLoss ? { stopLossPrice: parseFloat(stopLoss) } : {}),
      timeInForce,
    };

    await onSubmit(formData, side);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {/* Global Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* Volume Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Volume (Lots)
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">1 lot = 100,000 units</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 border-border"
              onClick={() => adjustVolume(-0.01)}
              disabled={isLoading || parseFloat(volume) <= 0.01}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <Input
                type="number"
                value={volume}
                onChange={(e) => {
                  setVolume(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, volume: '' }));
                }}
                step="0.01"
                min="0.01"
                max="100"
                disabled={isLoading}
                className={cn(
                  'text-center font-mono text-lg h-10 bg-muted/30',
                  fieldErrors.volume && 'border-destructive ring-destructive/20'
                )}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 border-border"
              onClick={() => adjustVolume(0.01)}
              disabled={isLoading || parseFloat(volume) >= 100}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {fieldErrors.volume && (
            <p className="text-xs text-destructive mt-1">
              {fieldErrors.volume}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Pip value:{' '}
            <span className="font-mono text-foreground">
              ${pipValue.toFixed(2)}
            </span>
          </p>
        </div>

        {/* Trade Info Card */}
        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Leverage</span>
            <span className="font-mono font-medium">1:{assetLeverage}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Position Value</span>
            <span className="font-mono font-medium">
              $
              {positionValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="border-t border-border pt-2.5 flex justify-between text-sm">
            <span className="text-muted-foreground">Margin Required</span>
            <span className="font-mono font-semibold text-primary">
              ${marginRequired.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Order Type Specific Fields */}
        {(orderType === 'limit' || orderType === 'stop_limit') && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Limit Price
            </Label>
            <Input
              type="number"
              value={limitPrice}
              onChange={(e) => {
                setLimitPrice(e.target.value);
                setFieldErrors((prev) => ({ ...prev, limitPrice: '' }));
              }}
              step="0.0001"
              placeholder={currentPrice.toFixed(5)}
              disabled={isLoading}
              className={cn(
                'font-mono h-10 bg-muted/30',
                fieldErrors.limitPrice &&
                  'border-destructive ring-destructive/20'
              )}
            />
            {fieldErrors.limitPrice && (
              <p className="text-xs text-destructive mt-1">
                {fieldErrors.limitPrice}
              </p>
            )}
          </div>
        )}

        {(orderType === 'stop' || orderType === 'stop_limit') && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Stop Price
            </Label>
            <Input
              type="number"
              value={stopPrice}
              onChange={(e) => {
                setStopPrice(e.target.value);
                setFieldErrors((prev) => ({ ...prev, stopPrice: '' }));
              }}
              step="0.0001"
              placeholder={currentPrice.toFixed(5)}
              disabled={isLoading}
              className={cn(
                'font-mono h-10 bg-muted/30',
                fieldErrors.stopPrice &&
                  'border-destructive ring-destructive/20'
              )}
            />
            {fieldErrors.stopPrice && (
              <p className="text-xs text-destructive mt-1">
                {fieldErrors.stopPrice}
              </p>
            )}
          </div>
        )}

        {orderType === 'trailing_stop' && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Trailing Distance (pips)
            </Label>
            <Input
              type="number"
              value={trailingDistance}
              onChange={(e) => setTrailingDistance(e.target.value)}
              step="1"
              min="1"
              placeholder="10"
              disabled={isLoading}
              className="font-mono h-10 bg-muted/30"
            />
          </div>
        )}

        {/* Risk Management Section */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Risk Management
          </Label>

          {/* Take Profit */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-profit font-medium">
                Take Profit
              </span>
              <div className="flex gap-1">
                {[1, 2, 5].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyTPPreset(pct)}
                    disabled={isLoading}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-profit/10 text-profit hover:bg-profit/20 font-medium"
                  >
                    +{pct}%
                  </button>
                ))}
              </div>
            </div>
            <Input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              step="0.0001"
              placeholder="Optional"
              disabled={isLoading}
              className="font-mono h-9 bg-muted/30 text-sm"
            />
          </div>

          {/* Stop Loss */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-loss font-medium">Stop Loss</span>
              <div className="flex gap-1">
                {[1, 2, 5].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applySLPreset(pct)}
                    disabled={isLoading}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-loss/10 text-loss hover:bg-loss/20 font-medium"
                  >
                    -{pct}%
                  </button>
                ))}
              </div>
            </div>
            <Input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              step="0.0001"
              placeholder="Optional"
              disabled={isLoading}
              className="font-mono h-9 bg-muted/30 text-sm"
            />
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          {showAdvanced ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          <span>Advanced Options</span>
        </button>

        {showAdvanced && (
          <div className="space-y-1.5 animate-fade-in">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Time in Force
            </Label>
            <Select
              value={timeInForce}
              onValueChange={(v) =>
                setTimeInForce(v as 'GTC' | 'GTD' | 'FOK' | 'IOC')
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-9 bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GTC">GTC (Good Till Canceled)</SelectItem>
                <SelectItem value="FOK">FOK (Fill or Kill)</SelectItem>
                <SelectItem value="IOC">IOC (Immediate or Cancel)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Buy/Sell Buttons - Fixed at bottom */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border mt-auto">
        <Button
          onClick={() => handleSubmit('buy')}
          disabled={isLoading}
          className="h-12 bg-profit hover:bg-profit/90 text-white font-bold text-base"
        >
          Buy
        </Button>
        <Button
          onClick={() => handleSubmit('sell')}
          disabled={isLoading}
          className="h-12 bg-loss hover:bg-loss/90 text-white font-bold text-base"
        >
          Sell
        </Button>
      </div>
    </div>
  );
};

export default OrderForm;
