import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { formatToastError } from "@/lib/errorMessageService";

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

interface CancelOrderConfirmationProps {
  order: Order | null;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: (orderId: string) => Promise<boolean>;
  onCancel: () => void;
}

/**
 * CancelOrderConfirmation Component
 *
 * Confirmation dialog for cancelling orders.
 * Displays order details and warnings before proceeding with cancellation.
 *
 * @param order - Order to cancel
 * @param isOpen - Whether dialog is open
 * @param isLoading - Whether cancellation is in progress
 * @param onConfirm - Callback when user confirms cancellation
 * @param onCancel - Callback when user cancels the dialog
 */
export const CancelOrderConfirmation = ({
  order,
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel,
}: CancelOrderConfirmationProps) => {
  if (!order) return null;

  const handleConfirm = async () => {
    const { toast } = useToast();
    try {
      const success = await onConfirm(order.id);
      if (success) {
        onCancel();
      }
    } catch (err) {
      const actionableError = formatToastError(err, 'order_submission');
      toast({
        ...actionableError,
        variant: actionableError.variant as "default" | "destructive"
      });
    }
  };

  const remainingQuantity = order.quantity - order.filled_quantity;
  const isMostlyFilled = order.filled_quantity > order.quantity * 0.75;
  const sideColor = order.side === 'buy' ? 'text-buy' : 'text-sell';

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-[hsl(var(--status-warning))] p-4 mt-2.5 dark:bg-[hsl(var(--status-warning-dark))]">
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--status-warning-foreground))] dark:text-[hsl(var(--status-warning-dark-foreground))]" />
            </div>
            <div>
              <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                Are you sure you want to cancel this order? This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Order Details */}
        <div className="bg-muted rounded-lg p-4 space-y-4 my-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Symbol</span>
            <span className="text-sm font-semibold text-foreground">{order.symbol}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Side</span>
            <span className={`text-sm font-semibold ${sideColor} uppercase`}>{order.side}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Type</span>
            <span className="text-sm font-semibold text-foreground">
              {order.type.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Quantity</span>
            <span className="text-sm font-semibold text-foreground">{order.quantity}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Filled Quantity</span>
            <span className="text-sm font-semibold text-foreground">{order.filled_quantity}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-sm font-medium text-foreground">Remaining to Cancel</span>
            <span className="text-sm font-bold text-sell">{remainingQuantity}</span>
          </div>
        </div>

        {/* Warnings */}
        {isMostlyFilled && (
          <div className="bg-background border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> This order is mostly filled ({(order.filled_quantity / order.quantity * 100).toFixed(0)}%).
              Cancelling will only affect the remaining {remainingQuantity} units.
            </p>
          </div>
        )}

        {order.status === 'partially_filled' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs text-amber-700">
              <strong>Partial Fill:</strong> Existing filled quantity will remain as a position. Only
              the pending quantity will be cancelled.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end mt-6">
          <AlertDialogCancel disabled={isLoading}>
            Keep Order
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-[hsl(var(--status-error-foreground))] hover:bg-[hsl(var(--status-error-foreground)/0.9)] text-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Order'
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
