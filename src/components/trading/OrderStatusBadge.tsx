import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle, TrendingUp } from 'lucide-react';
import { OrderStatus, classifyOrderStatus, calculateFillPercentage } from '@/lib/trading/orderStatusUtils';

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
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          Icon: <Clock className="w-3 h-3" />,
        };
      case 'open':
        return {
          label: 'Open',
          className: 'bg-blue-100 text-blue-800 border-blue-300',
          Icon: <TrendingUp className="w-3 h-3" />,
        };
      case 'partially_filled':
        return {
          label: `Partial (${fillPercentage}%)`,
          className: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          Icon: <Clock className="w-3 h-3" />,
        };
      case 'filled':
        return {
          label: 'Filled',
          className: 'bg-green-100 text-green-800 border-green-300',
          Icon: <CheckCircle className="w-3 h-3" />,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          Icon: <XCircle className="w-3 h-3" />,
        };
      case 'rejected':
        return {
          label: 'Rejected',
          className: 'bg-red-100 text-red-800 border-red-300',
          Icon: <AlertCircle className="w-3 h-3" />,
        };
      case 'expired':
        return {
          label: 'Expired',
          className: 'bg-orange-100 text-orange-800 border-orange-300',
          Icon: <AlertCircle className="w-3 h-3" />,
        };
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          Icon: <AlertCircle className="w-3 h-3" />,
        };
    }
  };

  const config = getStatusConfig(status);

  const tooltipText = timestamp
    ? `Status: ${config.label} (${new Date(timestamp).toLocaleTimeString()})`
    : `Status: ${config.label}`;

  return (
    <div className="flex items-center gap-1" title={tooltipText}>
      <Badge
        variant="outline"
        className={`${config.className} flex items-center gap-1 whitespace-nowrap`}
      >
        {config.Icon}
        {config.label}
      </Badge>
      {status === 'partially_filled' && fillPercentage > 0 && (
        <div
          className="h-1 bg-indigo-400 rounded-full"
          style={{ width: `${Math.min(fillPercentage, 100)}px` }}
        />
      )}
    </div>
  );
};
