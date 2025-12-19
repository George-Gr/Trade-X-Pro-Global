/**
 * Position Closure Automation Engine - Deno Library
 *
 * Mirror of /src/lib/trading/positionClosureEngine.ts
 * Used by Edge Functions in Deno runtime
 *
 * This is a canonical copy maintained in sync with the TypeScript version
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum ClosureReason {
  TAKE_PROFIT = 'take_profit',
  STOP_LOSS = 'stop_loss',
  TRAILING_STOP = 'trailing_stop',
  TIME_EXPIRY = 'time_expiry',
  MANUAL_USER = 'manual_user',
  MARGIN_CALL = 'margin_call',
  LIQUIDATION = 'liquidation',
  ADMIN_FORCED = 'admin_forced',
}

export enum ClosureStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PARTIAL = 'partial',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  margin_used: number;
  margin_level: number;
  status: 'open' | 'closing' | 'closed';
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
  entry_price: number;
  exit_price: number;
  quantity: number;
  partial_quantity?: number;
  realized_pnl: number;
  pnl_percentage: number;
  commission: number;
  slippage: number;
  initiated_at: string;
  completed_at?: string;
  hold_duration_seconds: number;
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
  entry_price: number;
  exit_price: number;
  quantity_closed: number;
  quantity_remaining?: number;
  realized_pnl: number;
  pnl_percentage: number;
  commission: number;
  slippage: number;
  new_margin_level: number;
  new_available_margin: number;
  hold_duration_seconds: number;
  message: string;
  notification_sent: boolean;
  error?: string;
}

// ============================================================================
// TRIGGER DETECTION
// ============================================================================

export function checkTakeProfitTriggered(
  position: Position,
  currentPrice: number
): boolean {
  if (!position.take_profit_level) return false;

  if (position.side === 'long') {
    return currentPrice >= position.take_profit_level;
  } else {
    return currentPrice <= position.take_profit_level;
  }
}

export function checkStopLossTriggered(
  position: Position,
  currentPrice: number
): boolean {
  if (!position.stop_loss_level) return false;

  if (position.side === 'long') {
    return currentPrice <= position.stop_loss_level;
  } else {
    return currentPrice >= position.stop_loss_level;
  }
}

export function checkTrailingStopTriggered(
  position: Position,
  currentPrice: number,
  priceHistory: number[] = []
): boolean {
  if (!position.trailing_stop_distance || !position.trailing_stop_peak_price) {
    return false;
  }

  const peakPrice = position.trailing_stop_peak_price;
  const stopDistance = position.trailing_stop_distance;

  if (position.side === 'long') {
    return currentPrice <= peakPrice - stopDistance;
  } else {
    return currentPrice >= peakPrice + stopDistance;
  }
}

export function checkTimeBasedExpiryTriggered(
  position: Position,
  maxHoldDurationMs: number
): boolean {
  const createdAtMs = new Date(position.created_at).getTime();
  const nowMs = Date.now();
  const holdDurationMs = nowMs - createdAtMs;

  return holdDurationMs >= maxHoldDurationMs;
}

export function shouldForceClosure(
  position: Position,
  marginLevel: number,
  liquidationTrigger: boolean = false
): boolean {
  if (liquidationTrigger) return true;
  if (marginLevel < 50) return true;
  return false;
}

export function getPrimaryClosureTrigger(
  position: Position,
  currentPrice: number,
  marginLevel: number = 100,
  maxHoldDurationMs: number = Infinity,
  liquidationTrigger: boolean = false
): ClosureReason | null {
  if (shouldForceClosure(position, marginLevel, liquidationTrigger)) {
    return liquidationTrigger
      ? ClosureReason.LIQUIDATION
      : ClosureReason.MARGIN_CALL;
  }

  if (checkTakeProfitTriggered(position, currentPrice)) {
    return ClosureReason.TAKE_PROFIT;
  }

  if (checkStopLossTriggered(position, currentPrice)) {
    return ClosureReason.STOP_LOSS;
  }

  if (checkTrailingStopTriggered(position, currentPrice)) {
    return ClosureReason.TRAILING_STOP;
  }

  if (checkTimeBasedExpiryTriggered(position, maxHoldDurationMs)) {
    return ClosureReason.TIME_EXPIRY;
  }

  return null;
}

// ============================================================================
// PRICE & SLIPPAGE CALCULATION
// ============================================================================

export function calculateClosureSlippage(
  symbol: string,
  closureReason: ClosureReason,
  normalSlippage: number = 0.1
): number {
  if (
    closureReason === ClosureReason.LIQUIDATION ||
    closureReason === ClosureReason.MARGIN_CALL
  ) {
    return normalSlippage * 1.5;
  }

  if (closureReason === ClosureReason.STOP_LOSS) {
    return normalSlippage * 1.2;
  }

  return normalSlippage;
}

export function calculateClosurePrice(
  position: Position,
  currentPrice: number,
  closureReason: ClosureReason,
  normalSlippage: number = 0.1
): number {
  const slippagePercent = calculateClosureSlippage(
    position.symbol,
    closureReason,
    normalSlippage
  );

  const slippageAmount = currentPrice * (slippagePercent / 100);

  if (position.side === 'long') {
    return Math.max(0, currentPrice - slippageAmount);
  } else {
    return currentPrice + slippageAmount;
  }
}

export function calculateRealizedPnLOnClosure(
  position: Position,
  exitPrice: number
): { pnl: number; pnlPercentage: number } {
  const priceDifference = exitPrice - position.entry_price;

  if (position.side === 'long') {
    const pnl = priceDifference * position.quantity;
    const pnlPercentage = (priceDifference / position.entry_price) * 100;
    return { pnl, pnlPercentage };
  } else {
    const pnl = (position.entry_price - exitPrice) * position.quantity;
    const pnlPercentage =
      ((position.entry_price - exitPrice) / position.entry_price) * 100;
    return { pnl, pnlPercentage };
  }
}

export function calculateCommissionOnClosure(
  symbol: string,
  quantity: number,
  exitPrice: number,
  commissionRate: number = 0.1
): number {
  const notionalValue = quantity * exitPrice;
  return (notionalValue * commissionRate) / 100;
}

export function calculateAvailableMarginAfterClosure(
  position: Position,
  leverage: number = 2
): number {
  return position.margin_used;
}

// ============================================================================
// EXECUTION
// ============================================================================

export function executePositionClosure(
  position: Position,
  currentPrice: number,
  reason: ClosureReason
): ClosureResult {
  // Validate preconditions
  if (position.status !== 'open') {
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
      message: `Position status is ${position.status}, not open`,
      notification_sent: false,
      error: `Position is not open`,
    };
  }

  if (
    position.quantity <= 0 ||
    position.entry_price <= 0 ||
    currentPrice <= 0
  ) {
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
      message: 'Invalid position or price data',
      notification_sent: false,
      error: 'Invalid data',
    };
  }

  // Calculate closure price
  const exitPrice = calculateClosurePrice(position, currentPrice, reason);

  // Calculate P&L
  const { pnl, pnlPercentage } = calculateRealizedPnLOnClosure(
    position,
    exitPrice
  );

  // Calculate costs
  const commission = calculateCommissionOnClosure(
    position.symbol,
    position.quantity,
    exitPrice
  );
  const slippageAmount = Math.abs(currentPrice - exitPrice) * position.quantity;

  // Calculate hold duration
  const createdAt = new Date(position.created_at).getTime();
  const now = Date.now();
  const holdDurationSeconds = Math.floor((now - createdAt) / 1000);

  // Calculate freed margin
  const freedMargin = calculateAvailableMarginAfterClosure(position);

  const netPnL = pnl - commission;

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
    slippage: slippageAmount / position.quantity,
    new_margin_level: 100,
    new_available_margin: position.margin_used + freedMargin,
    hold_duration_seconds: holdDurationSeconds,
    message: `Position closed successfully. Realized P&L: $${netPnL.toFixed(2)}`,
    notification_sent: false,
  };
}

export function executePartialClosure(
  position: Position,
  quantityToClose: number,
  currentPrice: number,
  reason: ClosureReason
): ClosureResult {
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
      error: 'Invalid partial close quantity',
    };
  }

  // Calculate closure price
  const exitPrice = calculateClosurePrice(position, currentPrice, reason);

  // Calculate P&L for partial
  const priceDifference = exitPrice - position.entry_price;
  const partialPnL = priceDifference * quantityToClose;
  const pnlPercentage = (priceDifference / position.entry_price) * 100;

  // Calculate costs
  const commission = calculateCommissionOnClosure(
    position.symbol,
    quantityToClose,
    exitPrice
  );
  const slippageAmount = Math.abs(currentPrice - exitPrice) * quantityToClose;

  // Calculate hold duration
  const createdAt = new Date(position.created_at).getTime();
  const now = Date.now();
  const holdDurationSeconds = Math.floor((now - createdAt) / 1000);

  // Calculate freed margin
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
    new_margin_level: 100,
    new_available_margin: freedMargin,
    hold_duration_seconds: holdDurationSeconds,
    message: `Partially closed ${quantityToClose} of ${position.quantity}. P&L: $${netPnL.toFixed(2)}`,
    notification_sent: false,
  };
}

export function updateTrailingStop(
  position: Position,
  currentPrice: number,
  highPrice: number
): Position {
  if (!position.trailing_stop_distance) {
    return position;
  }

  const updated = { ...position };

  if (position.side === 'long') {
    if (
      highPrice > (position.trailing_stop_peak_price || position.entry_price)
    ) {
      updated.trailing_stop_peak_price = highPrice;
      updated.stop_loss_level = highPrice - position.trailing_stop_distance;
    }
  } else {
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

// ============================================================================
// FORMATTING & UTILITIES
// ============================================================================

export function formatClosureReason(reason: ClosureReason): string {
  const reasons: Record<ClosureReason, string> = {
    [ClosureReason.TAKE_PROFIT]: 'Take Profit',
    [ClosureReason.STOP_LOSS]: 'Stop Loss',
    [ClosureReason.TRAILING_STOP]: 'Trailing Stop',
    [ClosureReason.TIME_EXPIRY]: 'Position Expired',
    [ClosureReason.MANUAL_USER]: 'Manual Close',
    [ClosureReason.MARGIN_CALL]: 'Margin Call',
    [ClosureReason.LIQUIDATION]: 'Liquidation',
    [ClosureReason.ADMIN_FORCED]: 'Admin Forced',
  };
  return reasons[reason] || 'Unknown';
}

export function formatClosureStatus(status: ClosureStatus): {
  label: string;
  color: string;
  icon: string;
} {
  const statuses: Record<
    ClosureStatus,
    { label: string; color: string; icon: string }
  > = {
    [ClosureStatus.PENDING]: { label: 'Pending', color: 'gray', icon: 'clock' },
    [ClosureStatus.IN_PROGRESS]: {
      label: 'In Progress',
      color: 'blue',
      icon: 'loader',
    },
    [ClosureStatus.COMPLETED]: {
      label: 'Completed',
      color: 'green',
      icon: 'check',
    },
    [ClosureStatus.PARTIAL]: {
      label: 'Partial',
      color: 'yellow',
      icon: 'activity',
    },
    [ClosureStatus.FAILED]: { label: 'Failed', color: 'red', icon: 'x' },
    [ClosureStatus.CANCELLED]: {
      label: 'Cancelled',
      color: 'orange',
      icon: 'ban',
    },
  };
  return statuses[status];
}

export function getClosureImpact(
  position: Position,
  exitPrice: number
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
    exitPrice
  );
  const marginRecovered = calculateAvailableMarginAfterClosure(position);

  return {
    realizedPnL: pnl,
    commission,
    netImpact: pnl - commission,
    marginRecovered,
  };
}
