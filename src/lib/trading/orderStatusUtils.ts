/**
 * Order Status Utilities
 * 
 * Utilities for classifying and calculating order status metrics.
 * Separated from component to avoid React Fast Refresh issues.
 */

export type OrderStatus = 
  | 'pending' 
  | 'open' 
  | 'partially_filled' 
  | 'filled' 
  | 'cancelled' 
  | 'rejected' 
  | 'expired';

/**
 * Utility function to classify order status
 */
export const classifyOrderStatus = (
  orderState: {
    status: string;
    filled_quantity: number;
    quantity: number;
    created_at?: Date;
    updated_at?: Date;
  }
): OrderStatus => {
  const { status, filled_quantity, quantity } = orderState;

  if (status === 'cancelled') return 'cancelled';
  if (status === 'rejected') return 'rejected';
  if (status === 'expired') return 'expired';
  if (filled_quantity >= quantity) return 'filled';
  if (filled_quantity > 0 && filled_quantity < quantity) return 'partially_filled';
  if (status === 'open' || status === 'active') return 'open';
  if (status === 'pending') return 'pending';

  return 'pending';
};

/**
 * Utility function to calculate fill percentage
 */
export const calculateFillPercentage = (
  filledQuantity: number,
  totalQuantity: number
): number => {
  if (totalQuantity === 0) return 0;
  return Math.round((filledQuantity / totalQuantity) * 100);
};
