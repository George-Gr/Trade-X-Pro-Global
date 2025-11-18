import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle, TrendingUp } from 'lucide-react';
import type { OrderStatus } from '@/lib/trading/orderStatusUtils';

// Re-export types and utilities for components
export type { OrderStatus } from '@/lib/trading/orderStatusUtils';
export { calculateFillPercentage, classifyOrderStatus } from '@/lib/trading/orderStatusUtils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  fillPercentage?: number;
  timestamp?: Date;
}

/**
 * OrderStatusBadge Component
 * 
 * Displays order status with color coding and optional fill percentage.
 * Provides visual indicator for order state transitions.
 * 
 * @param status - Current order status
 * @param fillPercentage - Percentage of order filled (for partial fills)
 * @param timestamp - Time when status was last updated
 */
export const OrderStatusBadge = ({
  status,
  fillPercentage = 0,
  timestamp,
}: OrderStatusBadgeProps) => {
  const getStatusConfig = (
    status: OrderStatus
  ): {
    label: string;
    className: string;
    Icon: React.ReactNode;
  } => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-[hsl(var(--status-warning))] text-[hsl(var(--status-warning-foreground))] border-[hsl(var(--status-warning-border))] dark:bg-[hsl(var(--status-warning-dark))] dark:text-[hsl(var(--status-warning-dark-foreground))] dark:border-[hsl(var(--status-warning-dark-border))]',
          Icon: <Clock className="w-3 h-3" />,
        };
      case 'open':
        return {
          label: 'Open',
          className: 'bg-[hsl(var(--status-info))] text-[hsl(var(--status-info-foreground))] border-[hsl(var(--status-info-border))] dark:bg-[hsl(var(--status-info-dark))] dark:text-[hsl(var(--status-info-dark-foreground))] dark:border-[hsl(var(--status-info-dark-border))]',
          Icon: <TrendingUp className="w-3 h-3" />,
        };
      case 'partially_filled':
        return {
          label: `Partial (${fillPercentage}%)`,
          className: 'bg-[hsl(var(--status-warning))] text-[hsl(var(--status-warning-foreground))] border-[hsl(var(--status-warning-border))] dark:bg-[hsl(var(--status-warning-dark))] dark:text-[hsl(var(--status-warning-dark-foreground))] dark:border-[hsl(var(--status-warning-dark-border))]',
          Icon: <Clock className="w-3 h-3" />,
        };
      case 'filled':
        return {
          label: 'Filled',
          className: 'bg-[hsl(var(--status-safe))] text-[hsl(var(--status-safe-foreground))] border-[hsl(var(--status-safe-border))] dark:bg-[hsl(var(--status-safe-dark))] dark:text-[hsl(var(--status-safe-dark-foreground))] dark:border-[hsl(var(--status-safe-dark-border))]',
          Icon: <CheckCircle className="w-3 h-3" />,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          className: 'bg-[hsl(var(--status-neutral))] text-[hsl(var(--status-neutral-foreground))] border-[hsl(var(--status-neutral-border))] dark:bg-[hsl(var(--status-neutral-dark))] dark:text-[hsl(var(--status-neutral-dark-foreground))] dark:border-[hsl(var(--status-neutral-dark-border))]',
          Icon: <XCircle className="w-3 h-3" />,
        };
      case 'rejected':
        return {
          label: 'Rejected',
          className: 'bg-[hsl(var(--status-error))] text-[hsl(var(--status-error-foreground))] border-[hsl(var(--status-error-border))] dark:bg-[hsl(var(--status-error-dark))] dark:text-[hsl(var(--status-error-dark-foreground))] dark:border-[hsl(var(--status-error-dark-border))]',
          Icon: <AlertCircle className="w-3 h-3" />,
        };
      case 'expired':
        return {
          label: 'Expired',
          className: 'bg-[hsl(var(--status-critical))] text-[hsl(var(--status-critical-foreground))] border-[hsl(var(--status-critical-border))] dark:bg-[hsl(var(--status-critical-dark))] dark:text-[hsl(var(--status-critical-dark-foreground))] dark:border-[hsl(var(--status-critical-dark-border))]',
          Icon: <AlertCircle className="w-3 h-3" />,
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-[hsl(var(--status-neutral))] text-[hsl(var(--status-neutral-foreground))] border-[hsl(var(--status-neutral-border))] dark:bg-[hsl(var(--status-neutral-dark))] dark:text-[hsl(var(--status-neutral-dark-foreground))] dark:border-[hsl(var(--status-neutral-dark-border))]',
          Icon: <AlertCircle className="w-3 h-3" />,
        };
    }
  };

  const config = getStatusConfig(status);

  const tooltipText = timestamp
    ? `Status: ${config.label} (${new Date(timestamp).toLocaleTimeString()})`
    : `Status: ${config.label}`;

  return (
    <div className="flex items-center gap-4" title={tooltipText}>
      <Badge
        variant="outline"
        className={`${config.className} flex items-center gap-4 whitespace-nowrap`}
      >
        {config.Icon}
        {config.label}
      </Badge>
      {status === 'partially_filled' && fillPercentage > 0 && (
        <div
          className="h-1 bg-[hsl(var(--status-warning-foreground))] rounded-full"
          style={{ width: `${Math.min(fillPercentage, 100)}px` }}
        />
      )}
    </div>
  );
};
