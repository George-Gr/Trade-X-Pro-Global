/**
 * Hook: useMarginCallMonitoring
 *
 * Purpose: Monitor margin status and escalate to liquidation when needed
 * Task: TASK 1.2.3 - Margin Call Detection & Escalation Workflow
 *
 * Features:
 * - Real-time margin status monitoring
 * - Automatic escalation from WARNING → CRITICAL → LIQUIDATION
 * - Time-based escalation tracking
 * - Notification integration
 * - Close-only mode enforcement
 * - Recommended actions based on severity
 *
 * Returns:
 * {
 *   marginStatus: MarginCallStatus,
 *   marginLevel: number,
 *   severity: MarginCallSeverity,
 *   timeInCall: number | null,
 *   shouldEscalate: boolean,
 *   recommendedActions: MarginCallAction[],
 *   isLoading: boolean,
 *   error: string | null,
 * }
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useMarginMonitoring } from './useMarginMonitoring';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseBrowserClient';
import {
  detectMarginCall,
  shouldEscalateToLiquidation,
  getRecommendedActions,
  generateMarginCallNotification,
  shouldRestrictNewTrading,
  shouldEnforceCloseOnly,
  classifyMarginCallSeverity,
  type MarginCallEvent,
  MarginCallStatus,
  MarginCallSeverity,
  type MarginCallAction,
} from '@/lib/trading/marginCallDetection';

interface MarginCallState {
  marginStatus: MarginCallStatus;
  marginLevel: number;
  severity: MarginCallSeverity | null;
  timeInCallMinutes: number | null;
  shouldEscalate: boolean;
  shouldEnforceCloseOnly: boolean;
  shouldRestrictOrders: boolean;
  recommendedActions: MarginCallAction[];
  isLoading: boolean;
  error: string | null;
  lastNotificationTime: number | null;
  marginCallEventId: string | null;
}

interface UseMarginCallMonitoringOptions {
  enabled?: boolean;
  notificationInterval?: number; // ms between notifications (default 60000 = 1 min)
  escalationCheckInterval?: number; // ms between escalation checks (default 30000 = 30 sec)
  onStatusChange?: (newStatus: MarginCallStatus, oldStatus: MarginCallStatus) => void;
  onEscalation?: (severity: MarginCallSeverity) => void;
  onLiquidationRisk?: () => void;
}

export function useMarginCallMonitoring(options: UseMarginCallMonitoringOptions = {}) {
  const {
    enabled = true,
    notificationInterval = 60000,
    escalationCheckInterval = 30000,
    onStatusChange,
    onEscalation,
    onLiquidationRisk,
  } = options;

  const { user } = useAuth();
  const { toast } = useToast();

  const {
    marginLevel = 0,
    marginStatus,
    isWarning,
    isCritical,
    isLiquidationRisk,
  } = useMarginMonitoring({
    enabled,
    refreshInterval: escalationCheckInterval,
  });

  // Map MarginStatus to MarginCallStatus for initial state
  function mapMarginStatusToCallStatus(status: unknown): MarginCallStatus {
    switch (status) {
      case 'SAFE':
        return MarginCallStatus.PENDING;
      case 'WARNING':
        return MarginCallStatus.NOTIFIED;
      case 'CRITICAL':
        return MarginCallStatus.ESCALATED;
      case 'LIQUIDATION':
        return MarginCallStatus.RESOLVED;
      default:
        return MarginCallStatus.PENDING;
    }
  }

  const [state, setState] = useState<MarginCallState>({
    marginStatus: mapMarginStatusToCallStatus(marginStatus),
    marginLevel,
    severity: isCritical ? MarginCallSeverity.URGENT : isWarning ? MarginCallSeverity.STANDARD : null,
    timeInCallMinutes: null,
    shouldEscalate: isLiquidationRisk || false,
    shouldEnforceCloseOnly: isLiquidationRisk || false,
    shouldRestrictOrders: isCritical || isWarning || false,
    recommendedActions: [],
    isLoading: false,
    error: null,
    lastNotificationTime: null,
    marginCallEventId: null,
  });

  const marginCallStartTimeRef = useRef<number | null>(null);
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const escalationCheckTimeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Calculate time spent in margin call state
   */
  const getTimeInCall = useCallback((): number | null => {
    if (!marginCallStartTimeRef.current) return null;
    return Math.floor((Date.now() - marginCallStartTimeRef.current) / 60000); // minutes
  }, []);

  /**
   * Detect margin call and classify severity
   */
  const detectMarginCallEvent = useCallback((): MarginCallEvent => {
    const detection = detectMarginCall(
      state.marginLevel > 0 ? 1000 * (100 / state.marginLevel) : 0, // Assume $1000 equity per margin %
      1000 * (100 / Math.max(state.marginLevel, 1)) // Estimate margin used
    );

    return {
      id: `margin-call-${Date.now()}`,
      userId: user?.id || '',
      triggeredAt: new Date(),
      marginLevelAtTrigger: state.marginLevel,
      status: MarginCallStatus.NOTIFIED,
      severity: state.severity || MarginCallSeverity.STANDARD,
      positionsAtRisk: 0,
      recommendedActions: state.recommendedActions.map((a) => a.action),
      escalatedToLiquidationAt: state.shouldEscalate ? new Date() : null,
      resolvedAt: null,
      resolutionType: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      timeInCallMinutes: getTimeInCall(),
      estimatedTimeToLiquidationMinutes: isLiquidationRisk ? 30 : null,
    };
  }, [state.marginLevel, state.severity, state.shouldEscalate, state.recommendedActions, user?.id, getTimeInCall, isLiquidationRisk]);

  /**
   * Track margin call entry and escalation
   */
  useEffect(() => {
    if (!enabled || !user?.id) return;

    const shouldBeInCall = isWarning || isCritical || isLiquidationRisk;

    // Entering margin call
    if (shouldBeInCall && !marginCallStartTimeRef.current) {
      marginCallStartTimeRef.current = Date.now();

      const severity = isLiquidationRisk
        ? MarginCallSeverity.CRITICAL
        : isCritical
        ? MarginCallSeverity.URGENT
        : MarginCallSeverity.STANDARD;

      setState((prev) => {
        const newActions = getRecommendedActions(marginLevel, 5); // Assume 5 positions
        return {
          ...prev,
          marginStatus: MarginCallStatus.NOTIFIED,
          severity,
          shouldRestrictOrders: shouldRestrictNewTrading(MarginCallStatus.NOTIFIED),
          shouldEnforceCloseOnly: shouldEnforceCloseOnly(MarginCallStatus.NOTIFIED),
          recommendedActions: newActions,
        };
      });

      onStatusChange?.(MarginCallStatus.NOTIFIED, MarginCallStatus.PENDING);
    }

    // Exiting margin call
    if (!shouldBeInCall && marginCallStartTimeRef.current) {
      marginCallStartTimeRef.current = null;

      setState((prev) => ({
        ...prev,
        marginStatus: MarginCallStatus.RESOLVED,
        severity: null,
        timeInCallMinutes: null,
        shouldRestrictOrders: false,
        shouldEnforceCloseOnly: false,
        recommendedActions: [],
      }));

      onStatusChange?.(MarginCallStatus.RESOLVED, MarginCallStatus.NOTIFIED);
    }
  }, [enabled, user?.id, isWarning, isCritical, isLiquidationRisk, marginLevel, onStatusChange]);

  /**
   * Check for escalation to liquidation
   */
  useEffect(() => {
    if (!enabled || !marginCallStartTimeRef.current) return;

    const checkEscalation = () => {
      const timeInCallMinutes = getTimeInCall();

      setState((prev) => {
        // Check if should escalate
        const shouldEscalateNow = shouldEscalateToLiquidation(marginLevel, timeInCallMinutes || 0);

        if (shouldEscalateNow && !prev.shouldEscalate) {
          onEscalation?.(MarginCallSeverity.CRITICAL);
          onLiquidationRisk?.();

          // Show critical notification
          toast({
            title: '⚠️ Liquidation Risk',
            description:
              'Your account is in critical margin condition. Liquidation may be forced automatically. Close positions or deposit funds immediately.',
            variant: 'destructive',
          });

          return {
            ...prev,
            timeInCallMinutes,
            shouldEscalate: true,
            marginStatus: MarginCallStatus.ESCALATED,
            severity: MarginCallSeverity.CRITICAL,
            shouldEnforceCloseOnly: true,
          };
        }

        return {
          ...prev,
          timeInCallMinutes,
        };
      });
    };

    escalationCheckTimeoutRef.current = setInterval(checkEscalation, escalationCheckInterval);

    return () => {
      if (escalationCheckTimeoutRef.current) {
        clearInterval(escalationCheckTimeoutRef.current);
      }
    };
  }, [enabled, marginLevel, escalationCheckInterval, getTimeInCall, toast, onEscalation, onLiquidationRisk]);

  /**
   * Send notifications (rate-limited)
   */
  useEffect(() => {
    if (!enabled || !user?.id || state.marginStatus === MarginCallStatus.PENDING) return;

    const now = Date.now();
    const lastNotifTime = state.lastNotificationTime || 0;

    if (now - lastNotifTime > notificationInterval) {
      const notification = generateMarginCallNotification(detectMarginCallEvent());

      toast({
        title: String(notification.title || ''),
        description: String(notification.message || ''),
        variant: notification.priority === 'CRITICAL' ? 'destructive' : 'default',
      });

      setState((prev) => ({
        ...prev,
        lastNotificationTime: now,
      }));
    }
  }, [
    enabled,
    user?.id,
    state.marginStatus,
    state.lastNotificationTime,
    notificationInterval,
    toast,
    detectMarginCallEvent,
  ]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    const notificationTimeoutCopy = notificationTimeoutRef.current;
    const escalationCheckTimeoutCopy = escalationCheckTimeoutRef.current;

    return () => {
      if (notificationTimeoutCopy) {
        clearTimeout(notificationTimeoutCopy);
      }
      if (escalationCheckTimeoutCopy) {
        clearInterval(escalationCheckTimeoutCopy);
      }
    };
  }, []);

  return {
    marginStatus: state.marginStatus,
    marginLevel: state.marginLevel,
    severity: state.severity,
    timeInCallMinutes: state.timeInCallMinutes,
    shouldEscalate: state.shouldEscalate,
    shouldEnforceCloseOnly: state.shouldEnforceCloseOnly,
    shouldRestrictOrders: state.shouldRestrictOrders,
    recommendedActions: state.recommendedActions,
    isLoading: state.isLoading,
    error: state.error,
    marginCallEventId: state.marginCallEventId,
  };
}

export type { MarginCallState, UseMarginCallMonitoringOptions };
