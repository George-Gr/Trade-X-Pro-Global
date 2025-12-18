/**
 * Margin Call Detection Engine - Deno Edge Function Version
 *
 * This is a canonical copy of marginCallDetection.ts for use in Deno Edge Functions.
 * Synced from /src/lib/trading/marginCallDetection.ts
 *
 * Margin Call Escalation Path:
 * 1. Margin Level >= 200% → SAFE (no action)
 * 2. Margin Level 100-199% → WARNING (1.2.4 alert sent)
 * 3. Margin Level 50-99% → CRITICAL (margin call created, close-only mode)
 * 4. Margin Level < 50% → LIQUIDATION (1.3.2 triggered)
 */

/**
 * Margin call status enum
 */
export enum MarginCallStatus {
  PENDING = "pending",
  NOTIFIED = "notified",
  RESOLVED = "resolved",
  ESCALATED = "escalated",
}

/**
 * Margin call severity levels
 */
export enum MarginCallSeverity {
  STANDARD = "standard", // 100-150% margin level
  URGENT = "urgent", // 50-100% margin level
  CRITICAL = "critical", // < 50% margin level (escalation imminent)
}

/**
 * Detects if a margin call should be triggered
 *
 * @param accountEquity - Current account equity
 * @param marginUsed - Current margin used
 * @returns Detection result with severity and actions
 */
export function detectMarginCall(
  accountEquity: number,
  marginUsed: number,
): {
  isTriggered: boolean;
  marginLevel: number;
  severity: MarginCallSeverity | null;
  shouldEscalate: boolean;
  shouldEnforceCloseOnly: boolean;
  timeToLiquidationMinutes: number | null;
  message: string;
} {
  if (marginUsed === 0) {
    return {
      isTriggered: false,
      marginLevel: Infinity,
      severity: null,
      shouldEscalate: false,
      shouldEnforceCloseOnly: false,
      timeToLiquidationMinutes: null,
      message: "No margin used",
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
      : "Account margin level is safe",
  };
}

/**
 * Checks if margin call threshold is triggered
 *
 * @param marginLevel - Margin level percentage
 * @returns true if margin call should be triggered (< 150%)
 */
export function isMarginCallTriggered(marginLevel: number): boolean {
  return marginLevel < 150;
}

/**
 * Classifies margin call severity based on margin level
 *
 * @param marginLevel - Margin level percentage
 * @returns Severity level (standard, urgent, critical)
 */
export function classifyMarginCallSeverity(
  marginLevel: number,
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
 */
export function shouldEscalateToLiquidation(
  marginLevel: number,
  timeInCallMinutes: number,
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
 */
export function updateMarginCallState(
  userId: string,
  previousLevel: number,
  currentLevel: number,
): {
  previousStatus: MarginCallStatus;
  newStatus: MarginCallStatus;
  changed: boolean;
  reason: string;
  escalationRequired: boolean;
} {
  const wasCalling = isMarginCallTriggered(previousLevel);
  const isCalling = isMarginCallTriggered(currentLevel);

  if (!wasCalling && isCalling) {
    // Entering margin call
    return {
      previousStatus: MarginCallStatus.PENDING,
      newStatus: MarginCallStatus.NOTIFIED,
      changed: true,
      reason: "Margin level fell below 150% threshold",
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
      reason: "Margin level recovered above 150% threshold",
      escalationRequired: false,
    };
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
    reason: "No significant margin level change",
    escalationRequired: false,
  };
}

/**
 * Gets recommended actions based on margin call severity
 *
 * @param marginLevel - Current margin level
 * @param positionCount - Number of open positions
 * @returns Array of recommended actions
 */
export function getRecommendedActions(
  marginLevel: number,
  positionCount: number,
): Array<{
  action: string;
  urgency: "high" | "medium" | "low";
  description: string;
}> {
  const actions: Array<{
    action: string;
    urgency: "high" | "medium" | "low";
    description: string;
  }> = [];

  if (marginLevel < 50) {
    // Critical - immediate action needed
    actions.push(
      {
        action: "Deposit funds immediately",
        urgency: "high",
        description:
          "Add funds to account to bring margin level above 50% and prevent forced liquidation",
      },
      {
        action: "Close all non-essential positions",
        urgency: "high",
        description:
          "Close positions with lowest margin contribution to free up margin quickly",
      },
      {
        action: "Reduce leverage",
        urgency: "high",
        description:
          "If using high leverage, reduce it to lower margin requirements",
      },
    );
  } else if (marginLevel < 100) {
    // Urgent - immediate action recommended
    actions.push(
      {
        action: "Deposit funds",
        urgency: "high",
        description: "Add funds to account to increase margin level above 100%",
      },
      {
        action: "Close largest losing positions",
        urgency: "high",
        description:
          "Close positions with largest unrealized losses to free margin",
      },
      {
        action: "Set tight stop losses",
        urgency: "medium",
        description: "Protect remaining positions with protective stops",
      },
    );
  } else if (marginLevel < 150) {
    // Standard warning - action recommended
    actions.push(
      {
        action: "Monitor margin level closely",
        urgency: "medium",
        description: "Watch margin level throughout trading session",
      },
      {
        action: "Be ready to deposit funds",
        urgency: "medium",
        description:
          "Have deposit method ready in case margin level drops further",
      },
      {
        action: "Avoid new high-leverage trades",
        urgency: "low",
        description: "Reduce position size for new trades to preserve margin",
      },
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
 */
export function calculateRiskMetrics(
  marginLevel: number,
  openPositions: number,
  averageLeverage: number = 1,
  largestPosition: number = 0,
): {
  marginLevel: number;
  status: MarginCallStatus;
  openPositions: number;
  positionsAtRisk: number;
  averageLeverageUsed: number;
  largestPositionSize: number;
  concentrationRisk: number;
  estimatedTimeToLiquidation: number | null;
} {
  const positionsAtRisk =
    openPositions > 0 && marginLevel < 150 ? Math.ceil(openPositions / 2) : 0;

  return {
    marginLevel: Math.round(marginLevel * 100) / 100,
    status:
      marginLevel < 30
        ? MarginCallStatus.ESCALATED
        : marginLevel < 150
          ? MarginCallStatus.NOTIFIED
          : MarginCallStatus.PENDING,
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
 * Gets margin call status label for display
 *
 * @param status - Status enum
 * @returns Human-readable string
 */
export function formatMarginCallStatus(status: MarginCallStatus): string {
  const labels: Record<MarginCallStatus, string> = {
    [MarginCallStatus.PENDING]: "No Margin Call",
    [MarginCallStatus.NOTIFIED]: "Margin Call Active",
    [MarginCallStatus.RESOLVED]: "Margin Call Resolved",
    [MarginCallStatus.ESCALATED]: "Escalated to Liquidation",
  };
  return labels[status];
}

/**
 * Determines if new trading should be restricted
 *
 * @param marginCallStatus - Current margin call status
 * @returns true if new orders should be rejected
 */
export function shouldRestrictNewTrading(
  marginCallStatus: MarginCallStatus,
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
 */
export function shouldEnforceCloseOnly(
  marginCallStatus: MarginCallStatus,
): boolean {
  return (
    marginCallStatus === MarginCallStatus.NOTIFIED ||
    marginCallStatus === MarginCallStatus.ESCALATED
  );
}
