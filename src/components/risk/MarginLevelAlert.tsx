/**
 * Component: MarginLevelAlert
 *
 * Purpose: Display margin level status and alert notifications
 * Task: TASK 1.2.4 - Margin Level Monitoring & Alerts
 *
 * Features:
 * - Real-time margin status display
 * - Color-coded status indicators (green/yellow/orange/red)
 * - Recommended actions display
 * - Time-to-liquidation countdown
 * - Close-only mode indicator
 * - Alert acknowledgment
 * - Collapsible details panel
 *
 * Usage:
 * ```tsx
 * <MarginLevelAlert
 *   onStatusChange={(status) => console.log(status)}
 *   compact={false}
 * />
 * ```
 */

import { useEffect, useState } from "react";
import { AlertTriangle, TrendingDown, AlertCircle, Clock } from "lucide-react";
import { useMarginMonitoring } from "@/hooks/useMarginMonitoring";
import { MarginStatus, formatMarginLevel, formatMarginStatus } from "@/lib/trading/marginMonitoring";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MarginLevelAlertProps {
  onStatusChange?: (status: MarginStatus) => void;
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function MarginLevelAlert({
  onStatusChange,
  compact = false,
  showDetails = true,
  className,
}: MarginLevelAlertProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [prevStatus, setPrevStatus] = useState<MarginStatus | null>(null);
  
  const {
    marginLevel,
    marginStatus,
    isWarning,
    isCritical,
    isLiquidationRisk,
    timeToLiquidation,
    recommendedActions,
    accountEquity,
    marginUsed,
    refresh,
    acknowledgeAlert,
  } = useMarginMonitoring({
    refreshInterval: 30000, // Refresh every 30 seconds
    onStatusChange: (newStatus, oldStatus) => {
      setPrevStatus(oldStatus);
      onStatusChange?.(newStatus);
    },
    onCritical: () => {
      setIsExpanded(true); // Expand on critical
    },
    onLiquidationRisk: () => {
      setIsExpanded(true); // Expand on liquidation risk
    },
  });

  // Determine alert styling based on status
  const getAlertClass = () => {
    switch (marginStatus) {
      case MarginStatus.SAFE:
        return "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950";
      case MarginStatus.WARNING:
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950";
      case MarginStatus.CRITICAL:
        return "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950";
      case MarginStatus.LIQUIDATION:
        return "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getStatusIcon = () => {
    switch (marginStatus) {
      case MarginStatus.SAFE:
        return <TrendingDown className="h-5 w-5 text-green-600" />;
      case MarginStatus.WARNING:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case MarginStatus.CRITICAL:
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case MarginStatus.LIQUIDATION:
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (marginStatus) {
      case MarginStatus.SAFE:
        return "text-green-700 dark:text-green-300";
      case MarginStatus.WARNING:
        return "text-yellow-700 dark:text-yellow-300";
      case MarginStatus.CRITICAL:
        return "text-orange-700 dark:text-orange-300";
      case MarginStatus.LIQUIDATION:
        return "text-red-700 dark:text-red-300";
      default:
        return "text-gray-700";
    }
  };

  const getProgressColor = () => {
    switch (marginStatus) {
      case MarginStatus.SAFE:
        return "bg-green-500";
      case MarginStatus.WARNING:
        return "bg-yellow-500";
      case MarginStatus.CRITICAL:
        return "bg-orange-500";
      case MarginStatus.LIQUIDATION:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Don't show if margin is null and in safe status
  if (!marginLevel && marginStatus === MarginStatus.SAFE) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4 px-4 py-4 rounded-md border", getAlertClass(), className)}>
        {getStatusIcon()}
        <span className={cn("text-sm font-medium", getStatusColor())}>
          {formatMarginStatus(marginStatus)}: {marginLevel ? formatMarginLevel(marginLevel) : "—"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-auto"
        >
          {isExpanded ? "Hide" : "Show"}
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Alert Card */}
      <Card className={cn("border-2", getAlertClass())}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {getStatusIcon()}
              <div className="space-y-2">
                <CardTitle className={getStatusColor()}>
                  {formatMarginStatus(marginStatus)}
                </CardTitle>
                <CardDescription className="text-xs">
                  {marginStatus === MarginStatus.SAFE && "Your account is in good standing"}
                  {marginStatus === MarginStatus.WARNING && "Please monitor your margin closely"}
                  {marginStatus === MarginStatus.CRITICAL && "Take immediate action to reduce risk"}
                  {marginStatus === MarginStatus.LIQUIDATION && "Your account is at critical risk"}
                </CardDescription>
              </div>
            </div>
            {(isCritical || isLiquidationRisk) && (
              <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                ⚠️ ACTION REQUIRED
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Margin Level Display */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium">Margin Level</span>
              <span className={cn("text-2xl font-bold", getStatusColor())}>
                {marginLevel ? formatMarginLevel(marginLevel) : "—"}
              </span>
            </div>
            {marginLevel && (
              <div className="space-y-2">
                <Progress
                  value={Math.min(marginLevel, 300)}
                  max={300}
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  Target: &geq;200% for SAFE, &geq;100% for WARNING
                </p>
              </div>
            )}
          </div>

          {/* Account Details */}
          {accountEquity && marginUsed && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">Account Equity</p>
                <p className="font-semibold">
                  ${(accountEquity / 100).toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">Margin Used</p>
                <p className="font-semibold">
                  ${(marginUsed / 100).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Time to Liquidation */}
          {timeToLiquidation !== null && timeToLiquidation < Infinity && (
            <div className={cn(
              "flex items-center gap-4 p-4 rounded-md",
              timeToLiquidation <= 30
                ? "bg-red-100 dark:bg-red-900"
                : "bg-orange-100 dark:bg-orange-900"
            )}>
              <Clock className={cn(
                "h-4 w-4",
                timeToLiquidation <= 30
                  ? "text-red-600"
                  : "text-orange-600"
              )} />
              <div className="text-sm">
                <p className="font-medium">
                  Est. Time to Liquidation: <span className="font-bold">{timeToLiquidation} min</span>
                </p>
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {showDetails && recommendedActions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Recommended Actions:</p>
              <ul className="space-y-2">
                {recommendedActions.map((action) => (
                  <li key={action.action} className="text-sm flex items-start gap-4">
                    <span className={cn(
                      "mt-2.5 h-2 w-2 rounded-full flex-shrink-0",
                      action.urgency === "emergency" ? "bg-red-500" :
                      action.urgency === "critical" ? "bg-orange-500" :
                      action.urgency === "warning" ? "bg-yellow-500" :
                      "bg-blue-500"
                    )} />
                    <div>
                      <p className="font-medium capitalize">
                        {action.action.replace(/_/g, " ")}
                      </p>
                      {action.recommendation && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {action.recommendation}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Close-Only Mode Indicator */}
          {isLiquidationRisk && (
            <Alert variant="destructive" className="bg-red-500/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Close-Only Mode Active</AlertTitle>
              <AlertDescription>
                You can only close positions. New orders are restricted.
              </AlertDescription>
            </Alert>
          )}

          {/* Order Restriction Indicator */}
          {isCritical && !isLiquidationRisk && (
            <Alert className="bg-orange-500/10 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-700">Order Restrictions Active</AlertTitle>
              <AlertDescription className="text-orange-600">
                New leveraged orders are restricted. Focus on closing positions.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={refresh}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Refresh
            </Button>
            {(isCritical || isLiquidationRisk) && (
              <Button
                onClick={() => window.location.href = "/risk-management"}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                Risk Management
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Change Notification */}
      {prevStatus && prevStatus !== marginStatus && (
        <div className={cn(
          "mt-2 p-4 rounded-md text-sm font-medium animate-in fade-in",
          marginStatus === MarginStatus.LIQUIDATION
            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
            : marginStatus === MarginStatus.CRITICAL
            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
            : marginStatus === MarginStatus.WARNING
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
        )}>
          Status changed from {formatMarginStatus(prevStatus)} to {formatMarginStatus(marginStatus)}
        </div>
      )}
    </div>
  );
}
