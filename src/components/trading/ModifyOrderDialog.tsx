import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, X } from 'lucide-react';

export interface Order {
  id: string;
  symbol: string;
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  side: 'buy' | 'sell';
  quantity: number;
  filled_quantity: number;
  price?: number;
  limit_price?: number;
  stop_price?: number;
  status: string;
  created_at: Date;
  updated_at: Date;
  average_fill_price?: number;
  commission?: number;
  slippage?: number;
  realized_pnl?: number;
}

interface ModifyOrderDialogProps {
  order: Order | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (updates: OrderModification) => Promise<boolean>;
}

export interface OrderModification {
  quantity?: number;
  price?: number;
  limit_price?: number;
  stop_price?: number;
}

/**
 * ModifyOrderDialog Component
 *
 * Allows users to modify open orders by changing quantity and price levels.
 * Validates changes and submits modifications via callback.
 *
 * @param order - Order to modify
 * @param isOpen - Whether dialog is open
 * @param isLoading - Whether submission is in progress
 * @param onClose - Callback when dialog closes
 * @param onSubmit - Callback when form is submitted
 */
export const ModifyOrderDialog = ({
  order,
  isOpen,
  isLoading = false,
  onClose,
  onSubmit,
}: ModifyOrderDialogProps) => {
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  const remainingQuantity = order?.quantity
    ? order.quantity - order.filled_quantity
    : 0;
  const maxQuantity = order?.quantity || 0;

  const canModifyQuantity = order
    ? ['open', 'partially_filled'].includes(order.status)
    : false;
  const canModifyPrice = order
    ? ['limit', 'stop', 'stop_limit', 'trailing_stop'].includes(order.type)
    : false;

  // Calculate if modifications are valid
  const validation = useMemo(() => {
    const errors: string[] = [];
    const updates: OrderModification = {};

    if (quantity) {
      const newQty = parseFloat(quantity);
      if (isNaN(newQty) || newQty <= 0) {
        errors.push('Quantity must be a positive number');
      } else if (newQty > maxQuantity) {
        errors.push(
          `Quantity cannot exceed original order size (${maxQuantity})`
        );
      } else {
        updates.quantity = newQty;
      }
    }

    if (limitPrice) {
      const newPrice = parseFloat(limitPrice);
      if (isNaN(newPrice) || newPrice <= 0) {
        errors.push('Limit price must be a positive number');
      } else {
        updates.limit_price = newPrice;
      }
    }

    if (stopPrice) {
      const newPrice = parseFloat(stopPrice);
      if (isNaN(newPrice) || newPrice <= 0) {
        errors.push('Stop price must be a positive number');
      } else {
        updates.stop_price = newPrice;
      }
    }

    // Check if at least one field is modified
    if (Object.keys(updates).length === 0) {
      errors.push('Please modify at least one field');
    }

    return { updates, errors, isValid: errors.length === 0 };
  }, [quantity, limitPrice, stopPrice, maxQuantity]);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    try {
      const success = await onSubmit(validation.updates);
      if (success) {
        // Reset form
        setQuantity('');
        setLimitPrice('');
        setStopPrice('');
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to modify order');
    }
  };

  const handleClose = () => {
    setQuantity('');
    setLimitPrice('');
    setStopPrice('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[90vw] md:max-w-md">
        <DialogHeader className="flex flex-row items-start justify-between">
          <div className="flex-1">
            <DialogTitle>Modify Order</DialogTitle>
            <DialogDescription>
              Update {order.symbol} {order.type} order ({order.side})
            </DialogDescription>
          </div>
          <button
            onClick={handleClose}
            className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            disabled={isLoading}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="flex gap-4 items-start p-4 bg-background border border-destructive/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-2.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Quantity Field */}
          {canModifyQuantity && (
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </Label>
              <p className="text-xs text-muted-foreground mt-2">
                Current: {order.quantity} | Filled: {order.filled_quantity} |
                Remaining: {remainingQuantity}
              </p>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                placeholder={order.quantity.toString()}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can modify the total order quantity (max: {maxQuantity})
              </p>
            </div>
          )}

          {/* Limit Price Field */}
          {canModifyPrice && order.limit_price !== undefined && (
            <div>
              <Label htmlFor="limitPrice" className="text-sm font-medium">
                Limit Price
              </Label>
              <p className="text-xs text-muted-foreground mt-2">
                Current: {order.limit_price?.toFixed(4)}
              </p>
              <Input
                id="limitPrice"
                type="number"
                min="0.0001"
                step="0.0001"
                placeholder={order.limit_price?.toFixed(4) || ''}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Price level at which limit order will execute
              </p>
            </div>
          )}

          {/* Stop Price Field */}
          {canModifyPrice && order.stop_price !== undefined && (
            <div>
              <Label htmlFor="stopPrice" className="text-sm font-medium">
                Stop Price
              </Label>
              <p className="text-xs text-muted-foreground mt-2">
                Current: {order.stop_price?.toFixed(4)}
              </p>
              <Input
                id="stopPrice"
                type="number"
                min="0.0001"
                step="0.0001"
                placeholder={order.stop_price?.toFixed(4) || ''}
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Price level that triggers the stop order
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-background border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> You can only modify open or partially
              filled orders. Market orders cannot be modified.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !validation.isValid}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Modify Order'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
