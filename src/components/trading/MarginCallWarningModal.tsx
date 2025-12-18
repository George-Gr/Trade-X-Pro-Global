/**
 * Component: MarginCallWarningModal
 *
 * Purpose: Display margin call warning and escalation alerts to user
 * Task: TASK 1.2.5 - User Notifications & UI Components
 *
 * Features:
 * - Shows margin level with color coding
 * - Displays recommended actions
 * - Time-to-liquidation countdown
 * - Quick action buttons (Deposit, Close Position, View Risk)
 * - Modal that appears on margin call escalation
 */

import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle, Clock, TrendingDown } from "lucide-react";
import {
  MarginCallSeverity,
  MarginCallStatus,
} from "@/lib/trading/marginCallDetection";
import { cn } from "@/lib/utils";

interface MarginCallWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  marginLevel: number;
  severity: MarginCallSeverity | null;
  status: MarginCallStatus;
  timeInCallMinutes: number | null;
  timeToLiquidationMinutes: number | null;
  recommendedActions: Array<{
    action: string;
    urgency: string;
    description: string;
  }>;
  onDeposit?: () => void;
  onClosePosition?: () => void;
  onViewRisk?: () => void;
}

export const MarginCallWarningModal: React.FC<MarginCallWarningModalProps> = ({
  isOpen,
  onClose,
  marginLevel,
  severity,
  status,
  timeInCallMinutes,
  timeToLiquidationMinutes,
  recommendedActions,
  onDeposit,
  onClosePosition,
  onViewRisk,
}) => {
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen || !timeToLiquidationMinutes) return;

    const remainingMs = timeToLiquidationMinutes * 60 * 1000;
    setCountdownSeconds(Math.floor(remainingMs / 1000));

    const interval = setInterval(() => {
      setCountdownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timeToLiquidationMinutes]);

  const getMarginColor = (level: number) => {
    if (level >= 200) return "text-buy bg-background";
    if (level >= 100) return "text-yellow-600 bg-background";
    if (level >= 50) return "text-orange-600 bg-background";
    return "text-sell bg-destructive/5";
  };

  const getSeverityIcon = () => {
    if (severity === MarginCallSeverity.CRITICAL) {
      return <AlertTriangle className="w-6 h-6 text-sell" />;
    }
    return <AlertCircle className="w-6 h-6 text-yellow-600" />;
  };

  const getSeverityTitle = () => {
    switch (severity) {
      case MarginCallSeverity.STANDARD:
        return "Margin Call Warning";
      case MarginCallSeverity.URGENT:
        return "Urgent Margin Call";
      case MarginCallSeverity.CRITICAL:
        return "🚨 Critical Liquidation Risk";
      default:
        return "Margin Alert";
    }
  };

  const getSeverityDescription = () => {
    switch (severity) {
      case MarginCallSeverity.STANDARD:
        return `Your account margin level is ${marginLevel.toFixed(2)}%. Add funds or close positions to prevent escalation.`;
      case MarginCallSeverity.URGENT:
        return `Your account is in URGENT margin call status at ${marginLevel.toFixed(2)}%. You can only close positions. Add funds immediately.`;
      case MarginCallSeverity.CRITICAL:
        return `Your account is in CRITICAL condition at ${marginLevel.toFixed(2)}%. Liquidation may be triggered automatically if you don't act immediately.`;
      default:
        return "Your account margin level is low.";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[90vw] md:max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-4 mb-2">
            {getSeverityIcon()}
            <AlertDialogTitle>{getSeverityTitle()}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {getSeverityDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Margin Level Display */}
        <div
          className={cn(
            "p-4 rounded-lg font-mono text-lg",
            getMarginColor(marginLevel),
          )}
        >
          <div className="flex justify-between items-center">
            <span>Margin Level:</span>
            <span className="font-bold text-2xl">
              {marginLevel.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Time Information */}
        {timeInCallMinutes !== null && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-4 p-4 bg-background rounded">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">Time in Call</div>
                <div className="text-blue-700">{timeInCallMinutes} minutes</div>
              </div>
            </div>

            {timeToLiquidationMinutes && (
              <div className="flex items-center gap-4 p-4 bg-background rounded">
                <TrendingDown className="w-4 h-4 text-sell" />
                <div>
                  <div className="font-semibold text-sell">
                    Est. Time to Liquidation
                  </div>
                  <div className="text-sell/80">
                    {Math.floor(countdownSeconds / 60)}:
                    {String(countdownSeconds % 60).padStart(2, "0")}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommended Actions */}
        {recommendedActions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Recommended Actions:</h4>
            <ul className="space-y-2">
              {recommendedActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-4 text-sm">
                  <span className="text-sell font-bold">•</span>
                  <div>
                    <div className="font-medium capitalize">
                      {action.action.replace(/_/g, " ")}
                    </div>
                    <div className="text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Critical Alert */}
        {severity === MarginCallSeverity.CRITICAL && (
          <Alert className="border-sell/30 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-sell" />
            <AlertTitle className="text-sell">Critical Alert</AlertTitle>
            <AlertDescription className="text-sell/80">
              Your account is at severe risk of automatic liquidation. Close
              positions or deposit funds immediately to prevent forced
              liquidation with additional losses.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={onViewRisk}
            className="w-full sm:w-auto"
          >
            View Risk Dashboard
          </Button>
          {severity === MarginCallSeverity.URGENT ||
          severity === MarginCallSeverity.CRITICAL ? (
            <>
              <Button
                variant="secondary"
                onClick={onClosePosition}
                className="w-full sm:w-auto"
              >
                Close Position
              </Button>
              <AlertDialogAction
                onClick={onDeposit}
                className="w-full sm:w-auto bg-[hsl(var(--status-info-foreground))] hover:bg-[hsl(var(--status-info-foreground)/0.9)]"
              >
                Deposit Funds Now
              </AlertDialogAction>
            </>
          ) : (
            <>
              <AlertDialogCancel>Dismiss</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeposit}
                className="w-full sm:w-auto bg-[hsl(var(--status-info-foreground))] hover:bg-[hsl(var(--status-info-foreground)/0.9)]"
              >
                Deposit Funds
              </AlertDialogAction>
            </>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MarginCallWarningModal;
