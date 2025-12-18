/**
 * Position Closure Automation Engine
 *
 * Manages automated position closure via multiple triggers:
 * - Take-Profit: Close when unrealized profit reaches target
 * - Stop-Loss: Close when unrealized loss reaches limit
 * - Trailing Stop: Dynamically adjust stop as price moves favorably
 * - Time-Based Expiry: Close positions exceeding max hold time
 * - Manual User Closure: User-initiated closure with optional partial close
 * - Force Closure: System-initiated (margin calls, liquidation, admin)
 *
 * All closures are atomic via stored procedure to ensure atomicity.
 * Calculates realized P&L, commissions, slippage, and margin recovery.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum ClosureReason {
  TAKE_PROFIT = "take_profit",
  STOP_LOSS = "stop_loss",
  TRAILING_STOP = "trailing_stop",
  TIME_EXPIRY = "time_expiry",
  MANUAL_USER = "manual_user",
  MARGIN_CALL = "margin_call",
  LIQUIDATION = "liquidation",
  ADMIN_FORCED = "admin_forced",
}

export enum ClosureStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  PARTIAL = "partial",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  side: "long" | "short";
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  margin_used: number;
  margin_level: number;
  status: "open" | "closing" | "closed";
  take_profit_level?: number;
  stop_loss_level?: number;
  trailing_stop_distance?: number;
  trailing_stop_peak_price?: number;
  created_at: string;
  updated_at: string;
}

export interface PositionClosure {
  id: string;
  position_id: string;
  user_id: string;
  reason: ClosureReason;
  status: ClosureStatus;

  // Closure Details
  entry_price: number;
  exit_price: number;
  quantity: number;
  partial_quantity?: number;

  // P&L
  realized_pnl: number;
  pnl_percentage: number;

  // Costs
  commission: number;
  slippage: number;

  // Timing
  initiated_at: string;
  completed_at?: string;
  hold_duration_seconds: number;

  // Metadata
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClosureResult {
  success: boolean;
  closure_id?: string;
  position_id: string;
  reason: ClosureReason;
  status: ClosureStatus;

  // Closure Details
  entry_price: number;
  exit_price: number;
  quantity_closed: number;
  quantity_remaining?: number;

  // P&L
  realized_pnl: number;
  pnl_percentage: number;

  // Costs
  commission: number;
  slippage: number;

  // State
  new_margin_level: number;
  new_available_margin: number;
  hold_duration_seconds: number;

  // Messaging
  message: string;
  notification_sent: boolean;
  error?: string;
}

export interface ClosurePreConditions {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ClosureSummary {
  position_id: string;
  closures: PositionClosure[];
  total_realized_pnl: number;
  total_commissions: number;
  total_slippage: number;
  avg_hold_duration_seconds: number;
  win_count: number;
  loss_count: number;
  win_rate: number;
}

// ============================================================================
// CLOSURE TRIGGER DETECTION
// ============================================================================

/**
 * Check if take-profit level has been reached
 * @param position - Current position
 * @param currentPrice - Current market price
 * @returns true if take-profit triggered
 */
export function checkTakeProfitTriggered(
  position: Position,
  currentPrice: number,
): boolean {
  if (!position.take_profit_level) return false;

  if (position.side === "long") {
    return currentPrice >= position.take_profit_level;
  } else {
    return currentPrice <= position.take_profit_level;
  }
}

/**
 * Check if stop-loss level has been reached
 * @param position - Current position
 * @param currentPrice - Current market price
 * @returns true if stop-loss triggered
 */
export function checkStopLossTriggered(
  position: Position,
  currentPrice: number,
): boolean {
  if (!position.stop_loss_level) return false;

  if (position.side === "long") {
    return currentPrice <= position.stop_loss_level;
  } else {
    return currentPrice >= position.stop_loss_level;
  }
}

/**
 * Check if trailing stop has been triggered
 * Compares current price to trailing stop peak
 * @param position - Current position with trailing stop tracking
 * @param currentPrice - Current market price
 * @param priceHistory - Recent price history for validation
 * @returns true if trailing stop triggered (price reversed from peak)
 */
export function checkTrailingStopTriggered(
  position: Position,
  currentPrice: number,
  priceHistory: number[] = [],
): boolean {
  if (!position.trailing_stop_distance || !position.trailing_stop_peak_price) {
    return false;
  }

  const peakPrice = position.trailing_stop_peak_price;
  const stopDistance = position.trailing_stop_distance;

  if (position.side === "long") {
    // For long: trailing stop is below peak
    // Triggered when price falls below (peak - distance)
    return currentPrice <= peakPrice - stopDistance;
  } else {
    // For short: trailing stop is above peak
    // Triggered when price rises above (peak + distance)
    return currentPrice >= peakPrice + stopDistance;
  }
}

/**
 * Check if time-based expiry has been reached
 * @param position - Current position
 * @param maxHoldDurationMs - Maximum hold duration in milliseconds
 * @returns true if position has exceeded max hold time
 */
export function checkTimeBasedExpiryTriggered(
  position: Position,
  maxHoldDurationMs: number,
): boolean {
  const createdAtMs = new Date(position.created_at).getTime();
  const nowMs = Date.now();
  const holdDurationMs = nowMs - createdAtMs;

  return holdDurationMs >= maxHoldDurationMs;
}

/**
 * Check if position should be force-closed
 * @param position - Current position
 * @param marginLevel - Current account margin level
 * @param liquidationTrigger - Whether liquidation has been triggered
 * @returns true if force closure should occur
 */
export function shouldForceClosure(
  position: Position,
  marginLevel: number,
  liquidationTrigger: boolean = false,
): boolean {
  // Force close if liquidation triggered (system emergency)
  if (liquidationTrigger) return true;

  // Force close if margin critical (system emergency)
  if (marginLevel < 50) return true;

  return false;
}

/**
 * Get the primary closure trigger for a position
 * Checks in priority order: force > take-profit > stop-loss > trailing-stop > time-expiry
 * @param position - Current position
 * @param currentPrice - Current market price
 * @param marginLevel - Current margin level
 * @param maxHoldDurationMs - Max hold time
 * @param liquidationTrigger - Whether liquidation triggered
 * @returns ClosureReason if closure triggered, null otherwise
 */
export function getPrimaryClosureTrigger(
  position: Position,
  currentPrice: number,
  marginLevel: number = 100,
  maxHoldDurationMs: number = Infinity,
  liquidationTrigger: boolean = false,
): ClosureReason | null {
  // Priority 1: Force closure (margin call, liquidation)
  if (shouldForceClosure(position, marginLevel, liquidationTrigger)) {
    return liquidationTrigger
      ? ClosureReason.LIQUIDATION
      : ClosureReason.MARGIN_CALL;
  }

  // Priority 2: Take-profit
  if (checkTakeProfitTriggered(position, currentPrice)) {
    return ClosureReason.TAKE_PROFIT;
  }

  // Priority 3: Stop-loss
  if (checkStopLossTriggered(position, currentPrice)) {
    return ClosureReason.STOP_LOSS;
  }

  // Priority 4: Trailing stop
  if (checkTrailingStopTriggered(position, currentPrice)) {
    return ClosureReason.TRAILING_STOP;
  }

  // Priority 5: Time-based expiry
  if (checkTimeBasedExpiryTriggered(position, maxHoldDurationMs)) {
    return ClosureReason.TIME_EXPIRY;
  }

  return null;
}

// ============================================================================
// CLOSURE PRICE & SLIPPAGE CALCULATION
// ============================================================================

/**
 * Calculate closure slippage multiplier based on closure reason
 * Force closures (liquidation, margin call) get worst-case pricing (1.5x)
 * Regular closures get standard slippage
 * @param symbol - Trading symbol
 * @param closureReason - Why position is being closed
 * @param normalSlippage - Normal market slippage percentage (0.1 = 0.1%)
 * @returns Slippage multiplier to apply
 */
export function calculateClosureSlippage(
  symbol: string,
  closureReason: ClosureReason,
  normalSlippage: number = 0.1,
): number {
  // Force closures get worst-case pricing (1.5x normal slippage)
  if (
    closureReason === ClosureReason.LIQUIDATION ||
    closureReason === ClosureReason.MARGIN_CALL
  ) {
    return normalSlippage * 1.5;
  }

  // Stop-loss might trigger during volatility (1.2x multiplier)
  if (closureReason === ClosureReason.STOP_LOSS) {
    return normalSlippage * 1.2;
  }

  // Regular closures use standard slippage
  return normalSlippage;
}

/**
 * Calculate closure execution price with slippage
 * Applies adverse slippage (buyer pays more, seller gets less)
 * @param position - Position being closed
 * @param currentPrice - Current market price
 * @param closureReason - Why position is being closed
 * @param normalSlippage - Normal market slippage percentage
 * @returns Execution price after slippage adjustment
 */
export function calculateClosurePrice(
  position: Position,
  currentPrice: number,
  closureReason: ClosureReason,
  normalSlippage: number = 0.1,
): number {
  const slippagePercent = calculateClosureSlippage(
    position.symbol,
    closureReason,
    normalSlippage,
  );

  const slippageAmount = currentPrice * (slippagePercent / 100);

  if (position.side === "long") {
    // Selling long position: worse price (lower) when buying at closure
    return Math.max(0, currentPrice - slippageAmount);
  } else {
    // Buying short position: worse price (higher) when selling at closure
    return currentPrice + slippageAmount;
  }
}

/**
 * Calculate realized P&L from position closure
 * @param position - Position being closed
 * @param exitPrice - Price at which position is closed
 * @returns { pnl: number, pnlPercentage: number }
 */
export function calculateRealizedPnLOnClosure(
  position: Position,
  exitPrice: number,
): { pnl: number; pnlPercentage: number } {
  const priceDifference = exitPrice - position.entry_price;

  if (position.side === "long") {
    // Long: profit when price increases
    const pnl = priceDifference * position.quantity;
    const pnlPercentage = (priceDifference / position.entry_price) * 100;
    return { pnl, pnlPercentage };
  } else {
    // Short: profit when price decreases
    const pnl = (position.entry_price - exitPrice) * position.quantity;
    const pnlPercentage =
      ((position.entry_price - exitPrice) / position.entry_price) * 100;
    return { pnl, pnlPercentage };
  }
}

/**
 * Calculate commission on position closure
 * Standard commission: 0.1% of position value
 * @param symbol - Trading symbol
 * @param quantity - Position quantity
 * @param exitPrice - Closure price
 * @param commissionRate - Commission percentage (default 0.1%)
 * @returns Commission amount
 */
export function calculateCommissionOnClosure(
  symbol: string,
  quantity: number,
  exitPrice: number,
  commissionRate: number = 0.1,
): number {
  const notionalValue = quantity * exitPrice;
  return (notionalValue * commissionRate) / 100;
}

/**
 * Calculate available margin after position closure
 * Freed margin = (quantity * entry_price) / leverage
 * @param position - Position being closed
 * @param leverage - Account leverage (default 2x)
 * @returns Freed margin amount
 */
export function calculateAvailableMarginAfterClosure(
  position: Position,
  leverage: number = 2,
): number {
  // Margin used = (quantity * entry_price) / leverage
  // When position closes, this margin is freed
  return position.margin_used;
}

// ============================================================================
// CLOSURE VALIDATION & SAFETY CHECKS
// ============================================================================

/**
 * Validate closure preconditions
 * @param position - Position to close
 * @param currentPrice - Current market price
 * @param marginLevel - Current account margin level
 * @returns Validation result with errors/warnings
 */
export function validateClosurePreConditions(
  position: Position,
  currentPrice: number,
  marginLevel: number = 100,
): ClosurePreConditions {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check position exists and is open
  if (position.status !== "open") {
    errors.push(`Position status is ${position.status}, not open`);
  }

  // Check quantity is positive
  if (position.quantity <= 0) {
    errors.push("Position quantity must be positive");
  }

  // Check entry price is valid
  if (position.entry_price <= 0) {
    errors.push("Position entry price must be positive");
  }

  // Check current price is available
  if (currentPrice <= 0) {
    errors.push("Current market price must be available");
  }

  // Warn if closing at unfavorable price
  const unrealizedPnL = calculateRealizedPnLOnClosure(
    position,
    currentPrice,
  ).pnl;
  if (unrealizedPnL < 0 && unrealizedPnL < position.unrealized_pnl * 0.9) {
    warnings.push(
      "Closure price is significantly worse than current market price",
    );
  }

  // Warn if margin is critical
  if (marginLevel < 100) {
    warnings.push("Account margin level is critical");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check closure safety before execution
 * @param position - Position to close
 * @param marketPrices - Available market prices
 * @returns Safety check result
 */
export function checkClosureSafety(
  position: Position,
  marketPrices: Record<string, number>,
): { safe: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check market price available for symbol
  if (!marketPrices[position.symbol]) {
    issues.push(`No market price available for ${position.symbol}`);
  }

  // Check price is not stale (older than 1 minute)
  // This would require timestamp in marketPrices, so we skip for now

  // Check position quantity matches expected
  if (position.quantity <= 0) {
    issues.push("Position quantity invalid");
  }

  return {
    safe: issues.length === 0,
    issues,
  };
}

// ============================================================================
// CLOSURE EXECUTION
// ============================================================================

/**
 * Execute full position closure
 * Calculates all costs, P&L, and returns closure result
 * NOTE: Actual database update happens in Edge Function via stored procedure
 * @param position - Position to close
 * @param currentPrice - Current market price
 * @param reason - Why position is being closed
 * @returns Closure result with all details
 */
export function executePositionClosure(
  position: Position,
  currentPrice: number,
  reason: ClosureReason,
): ClosureResult {
  // Validate preconditions
  const validation = validateClosurePreConditions(position, currentPrice);
  if (!validation.isValid) {
    return {
      success: false,
      position_id: position.id,
      reason,
      status: ClosureStatus.FAILED,
      entry_price: position.entry_price,
      exit_price: 0,
      quantity_closed: 0,
      realized_pnl: 0,
      pnl_percentage: 0,
      commission: 0,
      slippage: 0,
      new_margin_level: position.margin_level,
      new_available_margin: 0,
      hold_duration_seconds: 0,
      message: validation.errors.join("; "),
      notification_sent: false,
      error: validation.errors[0],
    };
  }

  // Calculate closure price with slippage
  const exitPrice = calculateClosurePrice(position, currentPrice, reason);

  // Calculate P&L
  const { pnl, pnlPercentage } = calculateRealizedPnLOnClosure(
    position,
    exitPrice,
  );

  // Calculate costs
  const commission = calculateCommissionOnClosure(
    position.symbol,
    position.quantity,
    exitPrice,
  );
  const slippageAmount = Math.abs(currentPrice - exitPrice) * position.quantity;

  // Calculate net P&L (after costs)
  const netPnL = pnl - commission;

  // Calculate hold duration
  const createdAt = new Date(position.created_at).getTime();
  const now = Date.now();
  const holdDurationSeconds = Math.floor((now - createdAt) / 1000);

  // Calculate freed margin
  const freedMargin = calculateAvailableMarginAfterClosure(position);

  return {
    success: true,
    position_id: position.id,
    reason,
    status: ClosureStatus.COMPLETED,
    entry_price: position.entry_price,
    exit_price: exitPrice,
    quantity_closed: position.quantity,
    realized_pnl: netPnL,
    pnl_percentage: pnlPercentage,
    commission,
    slippage: slippageAmount / position.quantity, // Per-unit slippage
    new_margin_level: 100, // Will be recalculated by Edge Function
    new_available_margin: position.margin_used + freedMargin,
    hold_duration_seconds: holdDurationSeconds,
    message: `Position closed successfully. Realized P&L: $${netPnL.toFixed(2)}`,
    notification_sent: false,
  };
}

/**
 * Execute partial position closure
 * Closes portion of position, leaves remainder open
 * @param position - Position to partially close
 * @param quantityToClose - Amount to close
 * @param currentPrice - Current market price
 * @param reason - Why position is being closed
 * @returns Closure result for the closed portion
 */
export function executePartialClosure(
  position: Position,
  quantityToClose: number,
  currentPrice: number,
  reason: ClosureReason,
): ClosureResult {
  // Validate quantity
  if (quantityToClose <= 0 || quantityToClose > position.quantity) {
    return {
      success: false,
      position_id: position.id,
      reason,
      status: ClosureStatus.FAILED,
      entry_price: position.entry_price,
      exit_price: 0,
      quantity_closed: 0,
      realized_pnl: 0,
      pnl_percentage: 0,
      commission: 0,
      slippage: 0,
      new_margin_level: position.margin_level,
      new_available_margin: 0,
      hold_duration_seconds: 0,
      message: `Cannot close ${quantityToClose} of ${position.quantity} quantity`,
      notification_sent: false,
      error: "Invalid partial close quantity",
    };
  }

  // Calculate closure price
  const exitPrice = calculateClosurePrice(position, currentPrice, reason);

  // Calculate P&L for partial position
  const priceDifference = exitPrice - position.entry_price;
  const partialPnL = priceDifference * quantityToClose;
  const pnlPercentage = (priceDifference / position.entry_price) * 100;

  // Calculate costs for partial
  const commission = calculateCommissionOnClosure(
    position.symbol,
    quantityToClose,
    exitPrice,
  );
  const slippageAmount = Math.abs(currentPrice - exitPrice) * quantityToClose;

  // Calculate hold duration
  const createdAt = new Date(position.created_at).getTime();
  const now = Date.now();
  const holdDurationSeconds = Math.floor((now - createdAt) / 1000);

  // Calculate freed margin (proportional)
  const freedMargin =
    (position.margin_used * quantityToClose) / position.quantity;

  const netPnL = partialPnL - commission;

  return {
    success: true,
    position_id: position.id,
    reason,
    status: ClosureStatus.PARTIAL,
    entry_price: position.entry_price,
    exit_price: exitPrice,
    quantity_closed: quantityToClose,
    quantity_remaining: position.quantity - quantityToClose,
    realized_pnl: netPnL,
    pnl_percentage: pnlPercentage,
    commission,
    slippage: slippageAmount / quantityToClose,
    new_margin_level: 100, // Recalculated by Edge Function
    new_available_margin: freedMargin,
    hold_duration_seconds: holdDurationSeconds,
    message: `Partially closed ${quantityToClose} of ${position.quantity}. P&L: $${netPnL.toFixed(2)}`,
    notification_sent: false,
  };
}

/**
 * Update trailing stop peak and trigger levels
 * @param position - Position with trailing stop
 * @param currentPrice - Current market price
 * @param highPrice - Highest price reached in period
 * @returns Updated position with new trailing stop levels
 */
export function updateTrailingStop(
  position: Position,
  currentPrice: number,
  highPrice: number,
): Position {
  if (!position.trailing_stop_distance) {
    return position;
  }

  const updated = { ...position };

  if (position.side === "long") {
    // For long: peak is the highest price reached
    // Stop is always below peak by trailing distance
    if (
      highPrice > (position.trailing_stop_peak_price || position.entry_price)
    ) {
      updated.trailing_stop_peak_price = highPrice;
      updated.stop_loss_level = highPrice - position.trailing_stop_distance;
    }
  } else {
    // For short: peak is the lowest price reached
    // Stop is always above peak by trailing distance
    if (
      !position.trailing_stop_peak_price ||
      highPrice < position.trailing_stop_peak_price
    ) {
      updated.trailing_stop_peak_price = highPrice;
      updated.stop_loss_level = highPrice + position.trailing_stop_distance;
    }
  }

  return updated;
}

/**
 * Get position closure summary for analytics
 * @param positionId - Position ID
 * @param closures - All closures for this position
 * @returns Summary statistics
 */
export function getPositionClosureSummary(
  positionId: string,
  closures: PositionClosure[],
): ClosureSummary {
  const wins = closures.filter((c) => c.realized_pnl > 0).length;
  const losses = closures.filter((c) => c.realized_pnl < 0).length;
  const totalPnL = closures.reduce((sum, c) => sum + c.realized_pnl, 0);
  const totalCommissions = closures.reduce((sum, c) => sum + c.commission, 0);
  const totalSlippage = closures.reduce((sum, c) => sum + c.slippage, 0);
  const avgHoldDuration =
    closures.length > 0
      ? closures.reduce((sum, c) => sum + c.hold_duration_seconds, 0) /
        closures.length
      : 0;

  return {
    position_id: positionId,
    closures,
    total_realized_pnl: totalPnL,
    total_commissions: totalCommissions,
    total_slippage: totalSlippage,
    avg_hold_duration_seconds: avgHoldDuration,
    win_count: wins,
    loss_count: losses,
    win_rate: closures.length > 0 ? (wins / closures.length) * 100 : 0,
  };
}

// ============================================================================
// FORMATTING & UTILITIES
// ============================================================================

/**
 * Format closure reason for display
 * @param reason - Closure reason enum
 * @returns Human-readable string
 */
export function formatClosureReason(reason: ClosureReason): string {
  const reasons: Record<ClosureReason, string> = {
    [ClosureReason.TAKE_PROFIT]: "Take Profit",
    [ClosureReason.STOP_LOSS]: "Stop Loss",
    [ClosureReason.TRAILING_STOP]: "Trailing Stop",
    [ClosureReason.TIME_EXPIRY]: "Position Expired",
    [ClosureReason.MANUAL_USER]: "Manual Close",
    [ClosureReason.MARGIN_CALL]: "Margin Call",
    [ClosureReason.LIQUIDATION]: "Liquidation",
    [ClosureReason.ADMIN_FORCED]: "Admin Forced",
  };
  return reasons[reason] || "Unknown";
}

/**
 * Format closure status with display information
 * @param status - Closure status enum
 * @returns { label, color, icon }
 */
export function formatClosureStatus(status: ClosureStatus): {
  label: string;
  color: string;
  icon: string;
} {
  const statuses: Record<
    ClosureStatus,
    { label: string; color: string; icon: string }
  > = {
    [ClosureStatus.PENDING]: {
      label: "Pending",
      color: "gray",
      icon: "clock",
    },
    [ClosureStatus.IN_PROGRESS]: {
      label: "In Progress",
      color: "blue",
      icon: "loader",
    },
    [ClosureStatus.COMPLETED]: {
      label: "Completed",
      color: "green",
      icon: "check",
    },
    [ClosureStatus.PARTIAL]: {
      label: "Partial",
      color: "yellow",
      icon: "activity",
    },
    [ClosureStatus.FAILED]: {
      label: "Failed",
      color: "red",
      icon: "x",
    },
    [ClosureStatus.CANCELLED]: {
      label: "Cancelled",
      color: "orange",
      icon: "ban",
    },
  };
  return statuses[status];
}

/**
 * Get closure impact summary
 * @param position - Position being closed
 * @param exitPrice - Closure price
 * @returns Impact metrics
 */
export function getClosureImpact(
  position: Position,
  exitPrice: number,
): {
  realizedPnL: number;
  commission: number;
  netImpact: number;
  marginRecovered: number;
} {
  const { pnl } = calculateRealizedPnLOnClosure(position, exitPrice);
  const commission = calculateCommissionOnClosure(
    position.symbol,
    position.quantity,
    exitPrice,
  );
  const marginRecovered = calculateAvailableMarginAfterClosure(position);

  return {
    realizedPnL: pnl,
    commission,
    netImpact: pnl - commission,
    marginRecovered,
  };
}
