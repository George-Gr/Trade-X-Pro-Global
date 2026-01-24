/**
 * Order Utilities
 * Common utilities for order management and display
 */

export type OrderStatus = 'pending' | 'filled' | 'partial' | 'cancelled' | 'rejected' | 'open' | 'partially_filled' | 'expired';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type OrderSide = 'buy' | 'sell';

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: OrderStatus;
  filledQuantity?: number;
  fillPrice?: number;
  commission?: number;
  stopLoss?: number;
  takeProfit?: number;
  createdAt: string;
  filledAt?: string;
}

/**
 * Format order status for display
 */
export function formatOrderStatus(status: OrderStatus): {
  label: string;
  color: string;
  bgColor: string;
} {
  const statusStyles: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
    pending: {
      label: 'Pending',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    open: {
      label: 'Open',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    filled: {
      label: 'Filled',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    partial: {
      label: 'Partial',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    partially_filled: {
      label: 'Partially Filled',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    rejected: {
      label: 'Rejected',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    expired: {
      label: 'Expired',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  };

  return statusStyles[status] || statusStyles.pending;
}

/**
 * Format order type for display
 */
export function formatOrderType(type: OrderType): string {
  const labels: Record<OrderType, string> = {
    market: 'Market',
    limit: 'Limit',
    stop: 'Stop',
    stop_limit: 'Stop Limit',
  };

  return labels[type] || type;
}

/**
 * Format order side for display
 */
export function formatOrderSide(side: OrderSide): {
  label: string;
  color: string;
} {
  return side === 'buy'
    ? { label: 'Buy', color: 'text-green-600' }
    : { label: 'Sell', color: 'text-red-600' };
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return status === 'pending' || status === 'partial' || status === 'open' || status === 'partially_filled';
}

/**
 * Check if order can be modified
 */
export function canModifyOrder(status: OrderStatus): boolean {
  return status === 'pending' || status === 'open';
}

/**
 * Calculate fill percentage
 */
export function calculateFillPercentage(
  filledQuantity: number,
  totalQuantity: number
): number {
  if (totalQuantity <= 0) return 0;
  return (filledQuantity / totalQuantity) * 100;
}

/**
 * Get order value
 */
export function calculateOrderValue(
  quantity: number,
  price: number
): number {
  return quantity * price;
}

export default {
  formatOrderStatus,
  formatOrderType,
  formatOrderSide,
  canCancelOrder,
  canModifyOrder,
  calculateFillPercentage,
  calculateOrderValue,
};
