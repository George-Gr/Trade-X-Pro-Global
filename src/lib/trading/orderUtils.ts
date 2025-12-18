/**
 * Order Utilities
 *
 * Pure business logic for order status and fill percentage.
 * Used by components and tests. Keep this file free of React imports for fast refresh.
 */

export type OrderStatus =
  | "pending"
  | "open"
  | "partially_filled"
  | "filled"
  | "cancelled"
  | "rejected"
  | "expired";

/**
 * Classifies the status of an order based on its state.
 */
export const classifyOrderStatus = (orderState: {
  status: string;
  filled_quantity: number;
  quantity: number;
  created_at?: Date;
  updated_at?: Date;
}): OrderStatus => {
  const { status, filled_quantity, quantity } = orderState;

  if (status === "cancelled") return "cancelled";
  if (status === "rejected") return "rejected";
  if (status === "expired") return "expired";
  if (filled_quantity >= quantity) return "filled";
  if (filled_quantity > 0 && filled_quantity < quantity)
    return "partially_filled";
  if (status === "open" || status === "active") return "open";
  if (status === "pending") return "pending";

  return "pending";
};

/**
 * Calculates the fill percentage of an order.
 */
export const calculateFillPercentage = (
  filledQuantity: number,
  totalQuantity: number,
): number => {
  if (totalQuantity === 0) return 0;
  return Math.round((filledQuantity / totalQuantity) * 100);
};
