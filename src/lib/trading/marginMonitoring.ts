/**
 * Margin Level Monitoring
 *
 * Implements margin level classification, threshold detection, and alert logic.
 * Monitors account equity vs. margin used to trigger warnings and restrictions
 * at critical thresholds.
 *
 * Margin Level = (Account Equity / Margin Used) × 100
 *
 * Status Classifications:
 * - SAFE: ≥ 200% (Green) - No restrictions
 * - WARNING: 100-199% (Yellow) - Alert user
 * - CRITICAL: 50-99% (Orange) - Restrict new orders
 * - LIQUIDATION: < 50% (Red) - Close-only mode, force liquidation
 *
 * Thresholds Map to Leverage:
 * - 200% margin level = 0.5x leverage (1:1 collateral)
 * - 100% margin level = 1.0x leverage (1:1 margin required)
 * - 50% margin level = 2.0x leverage (50% margin required)
 * - 25% margin level = 4.0x leverage (25% margin required)
 */

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export enum MarginStatus {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  LIQUIDATION = 'LIQUIDATION',
}

export interface MarginLevel {
  marginLevel: number; // Percentage (0-∞)
  status: MarginStatus;
  percentage: number; // Same as marginLevel for clarity
}

export interface MarginCheckResult {
  userId: string;
  status: MarginStatus;
  previousStatus: MarginStatus | null;
  marginLevel: number;
  accountEquity: number;
  marginUsed: number;
  freeMargin: number;
  statusChanged: boolean;
  requiresAlert: boolean;
  actions: MarginAction[];
  timestamp: string;
}

export interface MarginAction {
  action: string;
  urgency: 'info' | 'warning' | 'critical' | 'emergency';
  description: string;
  recommendation?: string;
}

export interface MarginAlert {
  id: string;
  userId: string;
  status: MarginStatus;
  previousStatus: MarginStatus | null;
  marginLevel: number;
  actionRequired: string[];
  notifiedAt: string;
  resolvedAt: string | null;
  createdAt: string;
}

// ============================================================================
// MARGIN LEVEL CLASSIFICATION
// ============================================================================

/**
 * Classify margin status based on margin level percentage
 *
 * Margin Level = (Account Equity / Margin Used) × 100
 *
 * SAFE:        ≥ 200%  (0.5x leverage max)
 * WARNING:     100-199% (0.5x-1.0x leverage)
 * CRITICAL:    50-99%  (1.0x-2.0x leverage)
 * LIQUIDATION: < 50%   (>2.0x leverage)
 */
export function getMarginStatus(marginLevel: number): MarginStatus {
  if (marginLevel >= 200) {
    return MarginStatus.SAFE;
  } else if (marginLevel >= 100) {
    return MarginStatus.WARNING;
  } else if (marginLevel >= 50) {
    return MarginStatus.CRITICAL;
  } else {
    return MarginStatus.LIQUIDATION;
  }
}

/**
 * Check if margin level is in WARNING state
 * WARNING: 100-199% margin level
 */
export function isMarginWarning(marginLevel: number): boolean {
  return marginLevel >= 100 && marginLevel < 200;
}

/**
 * Check if margin level is in CRITICAL state
 * CRITICAL: 50-99% margin level
 */
export function isMarginCritical(marginLevel: number): boolean {
  return marginLevel >= 50 && marginLevel < 100;
}

/**
 * Check if margin level is in LIQUIDATION state
 * LIQUIDATION: < 50% margin level
 */
export function isLiquidationRisk(marginLevel: number): boolean {
  return marginLevel < 50;
}

/**
 * Calculate margin level from account equity and margin used
 * Margin Level (%) = (Account Equity / Margin Used) × 100
 *
 * Handles division by zero gracefully
 */
export function calculateMarginLevel(
  accountEquity: number,
  marginUsed: number
): number {
  if (marginUsed <= 0) {
    // No margin used = infinite safety
    return Infinity;
  }

  const marginLevel = (accountEquity / marginUsed) * 100;
  return Math.round(marginLevel * 100) / 100; // Round to 2 decimals
}

/**
 * Get complete margin level information
 */
export function getMarginLevelInfo(
  accountEquity: number,
  marginUsed: number
): MarginLevel {
  const marginLevel = calculateMarginLevel(accountEquity, marginUsed);
  const status = getMarginStatus(marginLevel);

  return {
    marginLevel,
    status,
    percentage: marginLevel,
  };
}

// ============================================================================
// MARGIN MONITORING & ALERTS
// ============================================================================

/**
 * Determine if new orders should be restricted based on margin status
 *
 * - SAFE: Allow all orders
 * - WARNING: Allow orders but show warning
 * - CRITICAL: Reject new opens, allow closes
 * - LIQUIDATION: Close-only, force liquidation
 */
export function shouldRestrictNewOrders(marginStatus: MarginStatus): boolean {
  return (
    marginStatus === MarginStatus.CRITICAL ||
    marginStatus === MarginStatus.LIQUIDATION
  );
}

/**
 * Determine if close-only mode should be enforced
 * Only LIQUIDATION status prevents new orders entirely
 */
export function shouldEnforceCloseOnly(marginStatus: MarginStatus): boolean {
  return marginStatus === MarginStatus.LIQUIDATION;
}

/**
 * Get recommended actions based on margin status
 */
export function getMarginActionRequired(
  marginStatus: MarginStatus
): MarginAction[] {
  switch (marginStatus) {
    case MarginStatus.SAFE:
      return [
        {
          action: 'monitor',
          urgency: 'info',
          description: 'Your account is in good standing',
        },
      ];

    case MarginStatus.WARNING:
      return [
        {
          action: 'reduce_size',
          urgency: 'warning',
          description: 'Reduce position sizes to improve margin level',
          recommendation: 'Close some positions or reduce leverage',
        },
        {
          action: 'add_funds',
          urgency: 'warning',
          description: 'Add funds to increase available margin',
          recommendation: 'Deposit additional capital',
        },
      ];

    case MarginStatus.CRITICAL:
      return [
        {
          action: 'close_positions',
          urgency: 'critical',
          description: 'Close positions immediately to avoid liquidation',
          recommendation: 'Close one or more positions',
        },
        {
          action: 'add_funds_urgent',
          urgency: 'critical',
          description: 'Add funds urgently to prevent forced liquidation',
          recommendation: 'Deposit capital immediately',
        },
        {
          action: 'order_restriction',
          urgency: 'critical',
          description:
            'New orders are restricted - close-only mode enabled for losing positions',
          recommendation: 'Can only close positions at this level',
        },
      ];

    case MarginStatus.LIQUIDATION:
      return [
        {
          action: 'force_liquidation',
          urgency: 'emergency',
          description: 'Liquidation may be forced automatically',
          recommendation: 'Close all positions immediately',
        },
        {
          action: 'emergency_deposit',
          urgency: 'emergency',
          description: 'Emergency deposit required to prevent liquidation',
          recommendation: 'Deposit funds now to stay solvent',
        },
      ];
  }
}

/**
 * Determine if an alert should be created (avoid spam)
 * Returns true if status changed or enough time has passed since last alert
 */
export function shouldCreateAlert(
  currentStatus: MarginStatus,
  previousStatus: MarginStatus | null,
  lastAlertTime: string | null,
  minAlertIntervalMinutes = 5
): boolean {
  // Always alert on status change
  if (!previousStatus || currentStatus !== previousStatus) {
    return true;
  }

  // If status unchanged, only alert if enough time has passed
  if (lastAlertTime) {
    const lastAlert = new Date(lastAlertTime);
    const now = new Date();
    const minutesSinceAlert =
      (now.getTime() - lastAlert.getTime()) / (1000 * 60);
    return minutesSinceAlert >= minAlertIntervalMinutes;
  }

  return true;
}

/**
 * Format margin status as human-readable text
 */
export function formatMarginStatus(status: MarginStatus): string {
  const labels: Record<MarginStatus, string> = {
    [MarginStatus.SAFE]: 'Safe',
    [MarginStatus.WARNING]: 'Warning',
    [MarginStatus.CRITICAL]: 'Critical',
    [MarginStatus.LIQUIDATION]: 'Liquidation Risk',
  };
  return labels[status] || 'Unknown';
}

/**
 * Format margin level as percentage string
 */
export function formatMarginLevel(marginLevel: number): string {
  if (!isFinite(marginLevel)) {
    return '∞%';
  }
  return `${marginLevel.toFixed(2)}%`;
}

/**
 * Get CSS class name for margin status (for UI styling)
 */
export function getMarginStatusClass(status: MarginStatus): string {
  const classes: Record<MarginStatus, string> = {
    [MarginStatus.SAFE]: 'margin-safe',
    [MarginStatus.WARNING]: 'margin-warning',
    [MarginStatus.CRITICAL]: 'margin-critical',
    [MarginStatus.LIQUIDATION]: 'margin-liquidation',
  };
  return classes[status] || 'margin-unknown';
}

/**
 * Get color for margin status (Tailwind classes)
 */
export function getMarginStatusColor(status: MarginStatus): string {
  const colors: Record<MarginStatus, string> = {
    [MarginStatus.SAFE]: 'green',
    [MarginStatus.WARNING]: 'yellow',
    [MarginStatus.CRITICAL]: 'orange',
    [MarginStatus.LIQUIDATION]: 'red',
  };
  return colors[status] || 'gray';
}

/**
 * Get icon for margin status
 */
export function getMarginStatusIcon(status: MarginStatus): string {
  const icons: Record<MarginStatus, string> = {
    [MarginStatus.SAFE]: '✓',
    [MarginStatus.WARNING]: '⚠',
    [MarginStatus.CRITICAL]: '⚠',
    [MarginStatus.LIQUIDATION]: '✕',
  };
  return icons[status] || '?';
}

/**
 * Estimate time to liquidation (in minutes)
 * Based on current margin level and assuming linear deterioration
 * This is a rough estimate for UI display
 */
export function estimateTimeToLiquidation(marginLevel: number): number | null {
  if (marginLevel >= 100) {
    // Not at risk
    return null;
  }

  // Rough estimate: assume level drops 1% per minute at critical level
  // This is highly variable based on position volatility
  const minutesToLiquidation = Math.ceil(marginLevel);
  return Math.max(1, minutesToLiquidation);
}

/**
 * Check if margin level has crossed a significant threshold
 * Used to detect when alerts should be triggered
 */
export function hasMarginThresholdCrossed(
  currentLevel: number,
  previousLevel: number
): boolean {
  const thresholds = [200, 100, 50];

  for (const threshold of thresholds) {
    // Check if crossed above or below threshold
    if (
      (currentLevel > threshold && previousLevel <= threshold) ||
      (currentLevel <= threshold && previousLevel > threshold)
    ) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// VALIDATION & ERROR HANDLING
// ============================================================================

/**
 * Validate margin calculation inputs
 */
export function validateMarginInputs(
  accountEquity: number,
  marginUsed: number
): { valid: boolean; error?: string } {
  if (typeof accountEquity !== 'number' || !isFinite(accountEquity)) {
    return { valid: false, error: 'Invalid account equity' };
  }

  if (typeof marginUsed !== 'number' || !isFinite(marginUsed)) {
    return { valid: false, error: 'Invalid margin used' };
  }

  if (accountEquity < 0) {
    return { valid: false, error: 'Account equity cannot be negative' };
  }

  if (marginUsed < 0) {
    return { valid: false, error: 'Margin used cannot be negative' };
  }

  return { valid: true };
}

/**
 * Calculate free margin (equity available for new positions)
 */
export function calculateFreeMargin(
  accountEquity: number,
  marginUsed: number
): number {
  return Math.max(0, accountEquity - marginUsed);
}

/**
 * Calculate available leverage based on margin level
 * Leverage = 1 / (Margin Level / 100)
 */
export function calculateAvailableLeverage(marginLevel: number): number {
  if (marginLevel <= 0) {
    return 0;
  }
  return Math.round((100 / marginLevel) * 100) / 100; // Round to 2 decimals
}

/**
 * Quick validation: is account in liquidation risk?
 */
export function isAccountInDanger(
  accountEquity: number,
  marginUsed: number
): boolean {
  const marginLevel = calculateMarginLevel(accountEquity, marginUsed);
  return isLiquidationRisk(marginLevel) || isMarginCritical(marginLevel);
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Check margin status for a trade
 *
 * const accountEquity = 10000;
 * const marginUsed = 5000;
 * const marginLevel = calculateMarginLevel(accountEquity, marginUsed);
 * const status = getMarginStatus(marginLevel);
 *
 * if (shouldRestrictNewOrders(status)) {
 *   console.log("Cannot open new positions");
 * }
 */

/**
 * EXAMPLE 2: Get margin info for UI display
 *
 * const info = getMarginLevelInfo(10000, 5000);
 * console.log(`Margin Level: ${formatMarginLevel(info.marginLevel)}`);
 * console.log(`Status: ${formatMarginStatus(info.status)}`);
 * console.log(`Color: ${getMarginStatusColor(info.status)}`);
 */

/**
 * EXAMPLE 3: Determine if alert should be created
 *
 * const shouldAlert = shouldCreateAlert(
 *   currentStatus,
 *   previousStatus,
 *   lastAlertTime,
 *   5 // min 5 minutes between alerts
 * );
 *
 * if (shouldAlert) {
 *   const actions = getMarginActionRequired(currentStatus);
 *   // Create notification with actions
 * }
 */
