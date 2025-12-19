/**
 * Margin Call Detection Engine
 *
 * Implements real-time margin call detection that monitors account equity
 * and triggers escalating alerts when margin levels fall below thresholds.
 *
 * Margin Call Escalation Path:
 * 1. Margin Level >= 200% → SAFE (no action)
 * 2. Margin Level 100-199% → WARNING (1.2.4 alert sent)
 * 3. Margin Level 50-99% → CRITICAL (margin call created, close-only mode)
 * 4. Margin Level < 50% → LIQUIDATION (1.3.2 triggered)
 *
 * Dependencies:
 * - marginCalculations (1.1.2): For margin level calculations
 * - marginMonitoring (1.2.4): For status classification
 */

import { z } from 'zod';

/**
 * Margin call status enum
 */
export enum MarginCallStatus {
  PENDING = 'pending',
  NOTIFIED = 'notified',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

/**
 * Margin call severity levels
 */
export enum MarginCallSeverity {
  STANDARD = 'standard', // 100-150% margin level
  URGENT = 'urgent', // 50-100% margin level
  CRITICAL = 'critical', // < 50% margin level (escalation imminent)
}

/**
 * Margin call event interface
 */
export interface MarginCallEvent {
  id: string;
  userId: string;
  triggeredAt: Date;
  marginLevelAtTrigger: number;
  status: MarginCallStatus;
  severity: MarginCallSeverity;
  positionsAtRisk: number;
  recommendedActions: string[];
  escalatedToLiquidationAt: Date | null;
  resolvedAt: Date | null;
  resolutionType: 'manual_deposit' | 'position_close' | 'liquidation' | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  timeInCallMinutes?: number;
  estimatedTimeToLiquidationMinutes?: number;
}

/**
 * Margin call detection result
 */
export interface MarginCallDetectionResult {
  isTriggered: boolean;
  marginLevel: number;
  severity: MarginCallSeverity | null;
  shouldEscalate: boolean;
  shouldEnforceCloseOnly: boolean;
  timeToLiquidationMinutes: number | null;
  message: string;
}

/**
 * State change result
 */
export interface StateChangeResult {
  previousStatus: MarginCallStatus;
  newStatus: MarginCallStatus;
  changed: boolean;
  reason: string;
  escalationRequired: boolean;
}

/**
 * Margin call action
 */
export interface MarginCallAction {
  action: string;
  urgency: 'high' | 'medium' | 'low';
  description: string;
  suggestedAmount?: number;
}

/**
 * Risk metrics for account
 */
export interface RiskMetrics {
  marginLevel: number;
  status: MarginCallStatus;
  openPositions: number;
  positionsAtRisk: number;
  averageLeverageUsed: number;
  largestPositionSize: number;
  concentrationRisk: number; // % of largest position to total equity
  estimatedTimeToLiquidation: number | null;
}

/**
 * Account risk summary
 */
export interface RiskSummary {
  userId: string;
  currentMarginLevel: number;
  marginStatus: MarginCallStatus;
  activeMarginCall: MarginCallEvent | null;
  marginCallCount30Days: number;
  totalLiquidationEventsCount: number;
  lastMarginCallAt: Date | null;
  riskMetrics: RiskMetrics;
  recommendations: string[];
}

/**
 * Zod schema for margin call event
 */
export const MarginCallEventSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  triggeredAt: z.date(),
  marginLevelAtTrigger: z.number().min(0).max(1000),
  status: z.nativeEnum(MarginCallStatus),
  severity: z.nativeEnum(MarginCallSeverity),
  positionsAtRisk: z.number().int().min(0),
  recommendedActions: z.array(z.string()),
  escalatedToLiquidationAt: z.date().nullable(),
  resolvedAt: z.date().nullable(),
  resolutionType: z
    .enum(['manual_deposit', 'position_close', 'liquidation'])
    .nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Detects if a margin call should be triggered
 *
 * @param accountEquity - Current account equity
 * @param marginUsed - Current margin used
 * @returns Detection result with severity and actions
 *
 * @example
 * const result = detectMarginCall(10000, 5000);
 * // margin level = (10000 / 5000) * 100 = 200%
 * // result.isTriggered = false (SAFE)
 */
export function detectMarginCall(
  accountEquity: number,
  marginUsed: number
): MarginCallDetectionResult {
  if (marginUsed === 0) {
    return {
      isTriggered: false,
      marginLevel: Infinity,
      severity: null,
      shouldEscalate: false,
      shouldEnforceCloseOnly: false,
      timeToLiquidationMinutes: null,
      message: 'No margin used',
    };
  }

  // Calculate margin level percentage
  const marginLevel = (accountEquity / marginUsed) * 100;

  // Determine if triggered and classify severity
  let isTriggered = false;
  let severity: MarginCallSeverity | null = null;
  let shouldEscalate = false;
  let shouldEnforceCloseOnly = false;

  if (marginLevel < 50) {
    // Liquidation risk - critical emergency
    isTriggered = true;
    severity = MarginCallSeverity.CRITICAL;
    shouldEscalate = true;
    shouldEnforceCloseOnly = true;
  } else if (marginLevel < 100) {
    // Urgent - close-only mode
    isTriggered = true;
    severity = MarginCallSeverity.URGENT;
    shouldEnforceCloseOnly = true;
  } else if (marginLevel < 150) {
    // Standard - margin call triggered
    isTriggered = true;
    severity = MarginCallSeverity.STANDARD;
  }

  // Estimate time to liquidation (simplified)
  // Assuming linear decay of equity at current rate
  const timeToLiquidationMinutes =
    isTriggered && marginLevel > 0
      ? Math.max(0, Math.ceil((marginLevel - 50) / (marginLevel / 60)))
      : null;

  return {
    isTriggered,
    marginLevel: Math.round(marginLevel * 100) / 100,
    severity,
    shouldEscalate,
    shouldEnforceCloseOnly,
    timeToLiquidationMinutes,
    message: isTriggered
      ? `Margin call triggered at ${marginLevel.toFixed(2)}% margin level`
      : 'Account margin level is safe',
  };
}

/**
 * Checks if margin call threshold is triggered
 *
 * @param marginLevel - Margin level percentage
 * @returns true if margin call should be triggered (< 150%)
 *
 * @example
 * isMarginCallTriggered(140); // true (below 150%)
 * isMarginCallTriggered(160); // false (above 150%)
 */
export function isMarginCallTriggered(marginLevel: number): boolean {
  return marginLevel < 150;
}

/**
 * Classifies margin call severity based on margin level
 *
 * @param marginLevel - Margin level percentage
 * @returns Severity level (standard, urgent, critical)
 *
 * @example
 * classifyMarginCallSeverity(140); // 'standard'
 * classifyMarginCallSeverity(75);  // 'urgent'
 * classifyMarginCallSeverity(40);  // 'critical'
 */
export function classifyMarginCallSeverity(
  marginLevel: number
): MarginCallSeverity {
  if (marginLevel < 50) {
    return MarginCallSeverity.CRITICAL;
  }
  if (marginLevel < 100) {
    return MarginCallSeverity.URGENT;
  }
  return MarginCallSeverity.STANDARD;
}

/**
 * Determines if margin call should be escalated to liquidation
 *
 * @param marginLevel - Current margin level percentage
 * @param timeInCallMinutes - How long account has been in margin call
 * @returns true if liquidation should be triggered
 *
 * @example
 * shouldEscalateToLiquidation(40, 30); // true (critical for 30 min)
 * shouldEscalateToLiquidation(120, 10); // false (not critical yet)
 */
export function shouldEscalateToLiquidation(
  marginLevel: number,
  timeInCallMinutes: number
): boolean {
  // Escalate if critical level for 30+ minutes
  if (marginLevel < 50 && timeInCallMinutes >= 30) {
    return true;
  }

  // Immediate escalation if liquidation threshold
  if (marginLevel < 30) {
    return true;
  }

  return false;
}

/**
 * Updates margin call state and detects transitions
 *
 * @param userId - User ID
 * @param previousLevel - Previous margin level
 * @param currentLevel - Current margin level
 * @returns State change result with escalation info
 *
 * @example
 * const result = updateMarginCallState('user-123', 180, 140);
 * // result.changed = true (entered margin call zone)
 * // result.newStatus = NOTIFIED
 */
export function updateMarginCallState(
  userId: string,
  previousLevel: number,
  currentLevel: number
): StateChangeResult {
  const wasCalling = isMarginCallTriggered(previousLevel);
  const isCalling = isMarginCallTriggered(currentLevel);

  if (!wasCalling && isCalling) {
    // Entering margin call
    return {
      previousStatus: MarginCallStatus.PENDING,
      newStatus: MarginCallStatus.NOTIFIED,
      changed: true,
      reason: 'Margin level fell below 150% threshold',
      escalationRequired:
        classifyMarginCallSeverity(currentLevel) !==
        MarginCallSeverity.STANDARD,
    };
  }

  if (wasCalling && !isCalling) {
    // Recovering from margin call
    return {
      previousStatus: MarginCallStatus.NOTIFIED,
      newStatus: MarginCallStatus.RESOLVED,
      changed: true,
      reason: 'Margin level recovered above 150% threshold',
      escalationRequired: false,
    };
  }

  // Severity increase/decrease within margin call
  if (wasCalling && isCalling) {
    const prevSeverity = classifyMarginCallSeverity(previousLevel);
    const currSeverity = classifyMarginCallSeverity(currentLevel);

    if (prevSeverity !== currSeverity) {
      return {
        previousStatus: MarginCallStatus.NOTIFIED,
        newStatus:
          currSeverity === MarginCallSeverity.CRITICAL
            ? MarginCallStatus.ESCALATED
            : MarginCallStatus.NOTIFIED,
        changed: true,
        reason: `Severity changed from ${prevSeverity} to ${currSeverity}`,
        escalationRequired: currSeverity === MarginCallSeverity.CRITICAL,
      };
    }
  }

  // No state change
  return {
    previousStatus: wasCalling
      ? MarginCallStatus.NOTIFIED
      : MarginCallStatus.PENDING,
    newStatus: wasCalling
      ? MarginCallStatus.NOTIFIED
      : MarginCallStatus.PENDING,
    changed: false,
    reason: 'No significant margin level change',
    escalationRequired: false,
  };
}

/**
 * Detects consecutive margin level breaches
 *
 * @param breachCount - Number of consecutive breaches
 * @param window - Time window in minutes
 * @returns true if pattern indicates emergency situation
 *
 * @example
 * hasConsecutiveBreaches(5, 30); // true if 5 breaches in 30 min
 */
export function hasConsecutiveBreaches(
  breachCount: number,
  window: number
): boolean {
  // More than 3 breaches in 30 minutes indicates problem
  return breachCount > 3 && window <= 30;
}

/**
 * Gets duration in margin call state
 *
 * @param startTime - When margin call was triggered
 * @returns Duration in minutes, or null if not in call
 *
 * @example
 * const startTime = new Date(Date.now() - 25 * 60 * 1000); // 25 min ago
 * getMarginCallDuration(startTime); // 25
 */
export function getMarginCallDuration(startTime: Date): number {
  const now = new Date();
  const durationMs = now.getTime() - startTime.getTime();
  return Math.floor(durationMs / (1000 * 60)); // Convert to minutes
}

/**
 * Determines if new trading should be restricted
 *
 * @param marginCallStatus - Current margin call status
 * @returns true if new orders should be rejected
 *
 * @example
 * shouldRestrictNewTrading('critical'); // true
 * shouldRestrictNewTrading('notified'); // true
 * shouldRestrictNewTrading('resolved'); // false
 */
export function shouldRestrictNewTrading(
  marginCallStatus: MarginCallStatus
): boolean {
  return (
    marginCallStatus === MarginCallStatus.NOTIFIED ||
    marginCallStatus === MarginCallStatus.ESCALATED
  );
}

/**
 * Determines if close-only mode should be enforced
 *
 * @param marginCallStatus - Current margin call status
 * @returns true if user can only close positions (no new orders)
 *
 * @example
 * shouldEnforceCloseOnly('critical'); // true
 * shouldEnforceCloseOnly('notified'); // true
 * shouldEnforceCloseOnly('pending'); // false
 */
export function shouldEnforceCloseOnly(
  marginCallStatus: MarginCallStatus
): boolean {
  return (
    marginCallStatus === MarginCallStatus.NOTIFIED ||
    marginCallStatus === MarginCallStatus.ESCALATED
  );
}

/**
 * Generates notification payload for margin call
 *
 * @param call - Margin call event
 * @returns Notification object
 *
 * @example
 * const notification = generateMarginCallNotification(marginCall);
 * // {
 * //   type: 'MARGIN_CALL',
 * //   priority: 'CRITICAL',
 * //   title: 'Margin Call - Account at Risk',
 * //   ...
 * // }
 */
export function generateMarginCallNotification(
  call: MarginCallEvent
): Record<string, unknown> {
  const urgencyMap = {
    [MarginCallSeverity.STANDARD]: { priority: 'HIGH', icon: '⚠️' },
    [MarginCallSeverity.URGENT]: { priority: 'CRITICAL', icon: '🔴' },
    [MarginCallSeverity.CRITICAL]: { priority: 'CRITICAL', icon: '🚨' },
  };

  const { priority, icon } = urgencyMap[call.severity];

  return {
    type: 'MARGIN_CALL',
    priority,
    icon,
    title: `${icon} Margin Call - Account at Risk`,
    message: `Your account margin level is ${call.marginLevelAtTrigger.toFixed(2)}%. ${
      call.estimatedTimeToLiquidationMinutes
        ? `Estimated time to liquidation: ${call.estimatedTimeToLiquidationMinutes} minutes.`
        : ''
    } Add funds or close positions immediately to prevent forced liquidation.`,
    actions: [
      {
        label: 'Deposit Funds',
        action: 'NAVIGATE_WALLET',
        color: 'primary',
      },
      {
        label: 'View Positions',
        action: 'NAVIGATE_POSITIONS',
        color: 'secondary',
      },
      {
        label: 'Risk Management',
        action: 'NAVIGATE_RISK',
        color: 'secondary',
      },
    ],
    metadata: {
      marginLevel: call.marginLevelAtTrigger,
      severity: call.severity,
      positionsAtRisk: call.positionsAtRisk,
      timeToLiquidation: call.estimatedTimeToLiquidationMinutes,
      recommendedActions: call.recommendedActions,
    },
  };
}

/**
 * Gets recommended actions based on margin call severity
 *
 * @param marginLevel - Current margin level
 * @param positionCount - Number of open positions
 * @returns Array of recommended actions
 *
 * @example
 * getRecommendedActions(80, 5);
 * // [
 * //   { action: 'Deposit funds', urgency: 'high' },
 * //   { action: 'Close largest position', urgency: 'high' },
 * //   ...
 * // ]
 */
export function getRecommendedActions(
  marginLevel: number,
  positionCount: number
): MarginCallAction[] {
  const actions: MarginCallAction[] = [];

  if (marginLevel < 50) {
    // Critical - immediate action needed
    actions.push(
      {
        action: 'Deposit funds immediately',
        urgency: 'high',
        description:
          'Add funds to account to bring margin level above 50% and prevent forced liquidation',
      },
      {
        action: 'Close all non-essential positions',
        urgency: 'high',
        description:
          'Close positions with lowest margin contribution to free up margin quickly',
      },
      {
        action: 'Reduce leverage',
        urgency: 'high',
        description:
          'If using high leverage, reduce it to lower margin requirements',
      }
    );
  } else if (marginLevel < 100) {
    // Urgent - immediate action recommended
    actions.push(
      {
        action: 'Deposit funds',
        urgency: 'high',
        description: 'Add funds to account to increase margin level above 100%',
      },
      {
        action: 'Close largest losing positions',
        urgency: 'high',
        description:
          'Close positions with largest unrealized losses to free margin',
      },
      {
        action: 'Set tight stop losses',
        urgency: 'medium',
        description: 'Protect remaining positions with protective stops',
      }
    );
  } else if (marginLevel < 150) {
    // Standard warning - action recommended
    actions.push(
      {
        action: 'Monitor margin level closely',
        urgency: 'medium',
        description: 'Watch margin level throughout trading session',
      },
      {
        action: 'Be ready to deposit funds',
        urgency: 'medium',
        description:
          'Have deposit method ready in case margin level drops further',
      },
      {
        action: 'Avoid new high-leverage trades',
        urgency: 'low',
        description: 'Reduce position size for new trades to preserve margin',
      }
    );
  }

  return actions;
}

/**
 * Calculates risk metrics for an account
 *
 * @param marginLevel - Current margin level
 * @param openPositions - Number of open positions
 * @param averageLeverage - Average leverage across positions
 * @param largestPosition - Size of largest position relative to equity
 * @returns Risk metrics object
 *
 * @example
 * const metrics = calculateRiskMetrics(120, 5, 2.5, 0.35);
 */
export function calculateRiskMetrics(
  marginLevel: number,
  openPositions: number,
  averageLeverage: number = 1,
  largestPosition: number = 0
): RiskMetrics {
  const status = getMarginCallStatusFromLevel(marginLevel);
  const positionsAtRisk =
    openPositions > 0 && marginLevel < 150 ? Math.ceil(openPositions / 2) : 0;

  return {
    marginLevel: Math.round(marginLevel * 100) / 100,
    status,
    openPositions,
    positionsAtRisk,
    averageLeverageUsed: Math.round(averageLeverage * 100) / 100,
    largestPositionSize: largestPosition,
    concentrationRisk:
      largestPosition > 0.3 ? (largestPosition * 100) / 100 : 0,
    estimatedTimeToLiquidation:
      marginLevel > 0 && marginLevel < 150
        ? Math.max(0, Math.ceil((marginLevel - 50) / (marginLevel / 60)))
        : null,
  };
}

/**
 * Helper: Get margin call status from margin level
 *
 * @param marginLevel - Margin level percentage
 * @returns Status enum value
 */
function getMarginCallStatusFromLevel(marginLevel: number): MarginCallStatus {
  if (marginLevel < 50) {
    return MarginCallStatus.ESCALATED;
  }
  if (marginLevel < 150) {
    return MarginCallStatus.NOTIFIED;
  }
  return MarginCallStatus.PENDING;
}

/**
 * Validates margin call event input
 *
 * @param event - Event to validate
 * @returns true if valid
 */
export function validateMarginCallEvent(
  event: Partial<MarginCallEvent>
): boolean {
  try {
    MarginCallEventSchema.parse(event);
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats margin call status for display
 *
 * @param status - Status enum
 * @returns Human-readable string
 *
 * @example
 * formatMarginCallStatus('notified'); // 'Margin Call Active'
 */
export function formatMarginCallStatus(status: MarginCallStatus): string {
  const labels: Record<MarginCallStatus, string> = {
    [MarginCallStatus.PENDING]: 'No Margin Call',
    [MarginCallStatus.NOTIFIED]: 'Margin Call Active',
    [MarginCallStatus.RESOLVED]: 'Margin Call Resolved',
    [MarginCallStatus.ESCALATED]: 'Escalated to Liquidation',
  };
  return labels[status];
}

/**
 * Gets color class for margin call status
 *
 * @param status - Status enum
 * @returns Tailwind color class
 *
 * @example
 * getMarginCallStatusColor('critical'); // 'text-red-600'
 */
export function getMarginCallStatusColor(status: MarginCallStatus): string {
  const colors: Record<MarginCallStatus, string> = {
    [MarginCallStatus.PENDING]: 'text-status-safe',
    [MarginCallStatus.NOTIFIED]: 'text-yellow-600',
    [MarginCallStatus.RESOLVED]: 'text-status-info',
    [MarginCallStatus.ESCALATED]: 'text-red-600',
  };
  return colors[status];
}

/**
 * Gets background color class for margin call severity
 *
 * @param severity - Severity enum
 * @returns Tailwind background color class
 *
 * @example
 * getSeverityBgColor('critical'); // 'bg-red-100'
 */
export function getSeverityBgColor(severity: MarginCallSeverity): string {
  const colors: Record<MarginCallSeverity, string> = {
    [MarginCallSeverity.STANDARD]: 'bg-yellow-100',
    [MarginCallSeverity.URGENT]: 'bg-orange-100',
    [MarginCallSeverity.CRITICAL]: 'bg-red-100',
  };
  return colors[severity];
}
