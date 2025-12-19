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

// Business logic moved to orderUtils.ts for Fast Refresh compatibility.
