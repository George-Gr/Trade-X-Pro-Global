/**
 * Trading Input Validation Module
 * 
 * Provides comprehensive input validation for trading operations including
 * order quantities, price values, symbol inputs, and other trading parameters.
 */

import { z } from 'zod';

/**
 * Trading symbol validation
 */
export const symbolSchema = z.string()
  .min(2, 'Symbol must be at least 2 characters')
  .max(10, 'Symbol too long')
  .regex(/^[A-Z0-9/]+$/, 'Symbol can only contain uppercase letters, numbers, and forward slashes')
  .transform(val => val.toUpperCase());

/**
 * Order quantity validation
 */
export const quantitySchema = z.number()
  .min(0.001, 'Minimum order quantity is 0.001')
  .max(1000000, 'Maximum order quantity is 1,000,000')
  .refine(val => val > 0, 'Quantity must be positive')
  .refine(val => Math.abs(val) === val, 'Quantity cannot be negative');

/**
 * Price validation
 */
export const priceSchema = z.number()
  .min(0.00000001, 'Price too low')
  .max(999999.99999999, 'Price too high')
  .refine(val => val >= 0, 'Price cannot be negative');

/**
 * Leverage validation
 */
export const leverageSchema = z.number()
  .min(1, 'Minimum leverage is 1x')
  .max(500, 'Maximum leverage is 500x')
  .refine(val => Number.isInteger(val), 'Leverage must be a whole number');

/**
 * Stop loss/take profit validation
 */
export const sltpSchema = z.number()
  .min(0.00000001, 'SL/TP value too low')
  .max(999999.99999999, 'SL/TP value too high')
  .refine(val => val >= 0, 'SL/TP cannot be negative');

/**
 * Order type validation
 */
export const orderTypeSchema = z.enum(['market', 'limit', 'stop', 'stop_limit'] as const);

/**
 * Order side validation
 */
export const orderSideSchema = z.enum(['buy', 'sell'] as const);

/**
 * Time in force validation
 */
export const timeInForceSchema = z.enum(['GTC', 'IOC', 'FOK'] as const);

/**
 * Trading account validation
 */
export const accountIdSchema = z.string()
  .min(1, 'Account ID is required')
  .regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid account ID format');

/**
 * Complete order request schema
 */
export const orderRequestSchema = z.object({
  symbol: symbolSchema,
  side: orderSideSchema,
  quantity: quantitySchema,
  orderType: orderTypeSchema,
  price: priceSchema.optional(),
  stopPrice: priceSchema.optional(),
  leverage: leverageSchema.optional().default(1),
  stopLoss: sltpSchema.optional(),
  takeProfit: sltpSchema.optional(),
  timeInForce: timeInForceSchema.optional().default('GTC'),
  accountId: accountIdSchema,
  userId: z.string().optional(),
});

/**
 * Price alert request schema
 */
export const priceAlertSchema = z.object({
  symbol: symbolSchema,
  targetPrice: priceSchema,
  alertType: z.enum(['above', 'below'] as const),
  userId: z.string(),
  email: z.string().email('Invalid email format').optional(),
  notificationType: z.enum(['email', 'push', 'both'] as const).default('both'),
});

/**
 * Withdrawal request schema
 */
export const withdrawalRequestSchema = z.object({
  amount: z.number()
    .min(10, 'Minimum withdrawal amount is 10')
    .max(1000000, 'Maximum withdrawal amount is 1,000,000'),
  currency: z.string().regex(/^[A-Z]{2,4}$/, 'Invalid currency format'),
  walletAddress: z.string()
    .min(26, 'Invalid wallet address format')
    .max(100, 'Wallet address too long'),
  userId: z.string(),
  password: z.string().min(8, 'Password required for withdrawal'),
});

/**
 * Deposit request schema
 */
export const depositRequestSchema = z.object({
  amount: z.number()
    .min(1, 'Minimum deposit amount is 1')
    .max(1000000, 'Maximum deposit amount is 1,000,000'),
  currency: z.string().regex(/^[A-Z]{2,4}$/, 'Invalid currency format'),
  userId: z.string(),
});

/**
 * Risk management settings schema
 */
export const riskSettingsSchema = z.object({
  maxPositionSize: z.number().min(0.001, 'Invalid max position size'),
  maxTotalExposure: z.number().min(0.001, 'Invalid max total exposure'),
  marginCallLevel: z.number().min(0, 'Invalid margin call level').max(100, 'Margin call level cannot exceed 100%'),
  stopOutLevel: z.number().min(0, 'Invalid stop out level').max(100, 'Stop out level cannot exceed 100%'),
  dailyLossLimit: z.number().min(0, 'Invalid daily loss limit').max(100, 'Daily loss limit cannot exceed 100%'),
  dailyTradeLimit: z.number().min(1, 'Invalid daily trade limit').max(1000, 'Daily trade limit too high'),
  enforceStopLoss: z.boolean(),
  minStopLossDistance: z.number().min(0.00000001, 'Invalid minimum stop loss distance'),
  userId: z.string(),
});

/**
 * Watchlist item schema
 */
export const watchlistItemSchema = z.object({
  symbol: symbolSchema,
  orderIndex: z.number().min(0, 'Invalid order index').int(),
  watchlistId: z.string(),
});

/**
 * Watchlist schema
 */
export const watchlistSchema = z.object({
  name: z.string().min(1, 'Watchlist name is required').max(50, 'Watchlist name too long'),
  isDefault: z.boolean().default(false),
  userId: z.string(),
});

/**
 * Trading strategy schema
 */
export const strategySchema = z.object({
  name: z.string().min(2, 'Strategy name too short').max(50, 'Strategy name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  parameters: z.record(z.unknown()).optional(),
  isActive: z.boolean().default(true),
  userId: z.string(),
});

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate trading symbol
 */
export function validateSymbol(symbol: string): string {
  try {
    return symbolSchema.parse(symbol);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(400, 'Invalid symbol', error.errors[0]?.message);
    }
    throw new ValidationError(400, 'Invalid symbol format');
  }
}

/**
 * Validate order quantity
 */
export function validateQuantity(quantity: number): number {
  try {
    return quantitySchema.parse(quantity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(400, 'Invalid quantity', error.errors[0]?.message);
    }
    throw new ValidationError(400, 'Invalid quantity format');
  }
}

/**
 * Validate price
 */
export function validatePrice(price: number): number {
  try {
    return priceSchema.parse(price);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(400, 'Invalid price', error.errors[0]?.message);
    }
    throw new ValidationError(400, 'Invalid price format');
  }
}

/**
 * Validate leverage
 */
export function validateLeverage(leverage: number): number {
  try {
    return leverageSchema.parse(leverage);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(400, 'Invalid leverage', error.errors[0]?.message);
    }
    throw new ValidationError(400, 'Invalid leverage format');
  }
}

/**
 * Validate order request
 */
export function validateOrderRequest(data: unknown) {
  try {
    return orderRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new ValidationError(400, 'Invalid order request', details);
    }
    throw new ValidationError(400, 'Invalid order request format');
  }
}

/**
 * Validate price alert
 */
export function validatePriceAlert(data: unknown) {
  try {
    return priceAlertSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new ValidationError(400, 'Invalid price alert', details);
    }
    throw new ValidationError(400, 'Invalid price alert format');
  }
}

/**
 * Validate withdrawal request
 */
export function validateWithdrawalRequest(data: unknown) {
  try {
    return withdrawalRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new ValidationError(400, 'Invalid withdrawal request', details);
    }
    throw new ValidationError(400, 'Invalid withdrawal request format');
  }
}

/**
 * Validate deposit request
 */
export function validateDepositRequest(data: unknown) {
  try {
    return depositRequestSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new ValidationError(400, 'Invalid deposit request', details);
    }
    throw new ValidationError(400, 'Invalid deposit request format');
  }
}

/**
 * Validate risk settings
 */
export function validateRiskSettings(data: unknown) {
  try {
    return riskSettingsSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new ValidationError(400, 'Invalid risk settings', details);
    }
    throw new ValidationError(400, 'Invalid risk settings format');
  }
}

/**
 * Validate watchlist item
 */
export function validateWatchlistItem(data: unknown) {
  try {
    return watchlistItemSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new ValidationError(400, 'Invalid watchlist item', details);
    }
    throw new ValidationError(400, 'Invalid watchlist item format');
  }
}

/**
 * Validate watchlist
 */
export function validateWatchlist(data: unknown) {
  try {
    return watchlistSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new ValidationError(400, 'Invalid watchlist', details);
    }
    throw new ValidationError(400, 'Invalid watchlist format');
  }
}

/**
 * Validate trading strategy
 */
export function validateStrategy(data: unknown) {
  try {
    return strategySchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new ValidationError(400, 'Invalid strategy', details);
    }
    throw new ValidationError(400, 'Invalid strategy format');
  }
}

/**
 * Sanitize input string (remove potentially dangerous characters)
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 1000); // Limit length
}

/**
 * Validate and sanitize trading input
 */
export function validateTradingInput(input: string, type: 'symbol' | 'quantity' | 'price' | 'leverage'): unknown {
  const sanitized = sanitizeInput(input);

  switch (type) {
    case 'symbol':
      return validateSymbol(sanitized);
    case 'quantity':
      return validateQuantity(Number(sanitized));
    case 'price':
      return validatePrice(Number(sanitized));
    case 'leverage':
      return validateLeverage(Number(sanitized));
    default:
      throw new ValidationError(400, 'Unknown input type');
  }
}