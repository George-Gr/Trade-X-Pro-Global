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
    try {
      const success = await onConfirm(order.id);
      if (success) {
        onCancel();
      }
    } catch (err) {
      console.error('Error confirming cancellation:', err);
    }
  };

  const remainingQuantity = order.quantity - order.filled_quantity;
  const isMostlyFilled = order.filled_quantity > order.quantity * 0.75;
  const sideColor = order.side === 'buy' ? 'text-blue-600' : 'text-orange-600';

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-yellow-100 p-4 mt-2.5">
              <AlertTriangle className="w-5 h-5 text-yellow-700" />
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
        <div className="bg-gray-50 rounded-lg p-4 space-y-4 my-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Symbol</span>
            <span className="text-sm font-semibold text-gray-900">{order.symbol}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Side</span>
            <span className={`text-sm font-semibold ${sideColor} uppercase`}>{order.side}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Type</span>
            <span className="text-sm font-semibold text-gray-900">
              {order.type.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Quantity</span>
            <span className="text-sm font-semibold text-gray-900">{order.quantity}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Filled Quantity</span>
            <span className="text-sm font-semibold text-gray-900">{order.filled_quantity}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700">Remaining to Cancel</span>
            <span className="text-sm font-bold text-red-600">{remainingQuantity}</span>
          </div>
        </div>

        {/* Warnings */}
        {isMostlyFilled && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
            className="bg-red-600 hover:bg-red-700 text-white"
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
