/**
 * API Response Validation
 *
 * Runtime validation of Supabase API responses using Zod schemas
 * Ensures type safety and catches data inconsistencies early
 */

import { reportError } from '@/lib/errorService';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Base schemas for common types
const uuidSchema = z.string().uuid();
const timestampSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/));

// Profile schema
export const profileSchema = z.object({
  id: uuidSchema,
  email: z.string().email(),
  full_name: z.string().nullable(),
  balance: z.number(),
  equity: z.number(),
  margin_used: z.number(),
  free_margin: z.number().nullable(),
  margin_level: z.number().nullable(),
  kyc_status: z
    .enum(['pending', 'approved', 'rejected', 'resubmitted'])
    .nullable(),
  account_status: z.enum(['active', 'suspended', 'closed']).nullable(),
  country: z.string().nullable(),
  phone: z.string().nullable(),
  created_at: timestampSchema.nullable(),
  updated_at: timestampSchema.nullable(),
});

// Position schema
export const positionSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  symbol: z.string(),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
  entry_price: z.number().positive(),
  current_price: z.number().nullable(),
  unrealized_pnl: z.number().nullable(),
  realized_pnl: z.number().nullable(),
  margin_used: z.number(),
  status: z.enum(['open', 'closed']).nullable(),
  opened_at: timestampSchema.nullable(),
  closed_at: timestampSchema.nullable(),
  trailing_stop_enabled: z.boolean(),
  trailing_stop_distance: z.number().nullable(),
  trailing_stop_price: z.number().nullable(),
  highest_price: z.number().nullable(),
  lowest_price: z.number().nullable(),
});

// Order schema
export const orderSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  symbol: z.string(),
  order_type: z.enum(['market', 'limit', 'stop', 'stop_limit']),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
  price: z.number().nullable(),
  fill_price: z.number().nullable(),
  stop_loss: z.number().nullable(),
  take_profit: z.number().nullable(),
  status: z
    .enum(['pending', 'filled', 'partial', 'cancelled', 'rejected'])
    .nullable(),
  commission: z.number().nullable(),
  idempotency_key: z.string(),
  created_at: timestampSchema.nullable(),
  filled_at: timestampSchema.nullable(),
});

// Fill schema
export const fillSchema = z.object({
  id: uuidSchema,
  order_id: uuidSchema,
  user_id: uuidSchema,
  symbol: z.string(),
  quantity: z.number().positive(),
  price: z.number().positive(),
  commission: z.number(),
  executed_at: timestampSchema.nullable(),
});

// Ledger schema
export const ledgerSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  transaction_type: z.enum([
    'deposit',
    'withdrawal',
    'commission',
    'profit',
    'loss',
    'swap',
    'adjustment',
  ]),
  amount: z.number(),
  balance_before: z.number(),
  balance_after: z.number(),
  description: z.string().nullable(),
  reference_id: z.string().nullable(),
  created_at: timestampSchema.nullable(),
});

// Asset specs schema
export const assetSpecsSchema = z.object({
  symbol: z.string(),
  asset_class: z.string(),
  leverage: z.number().nullable(),
  min_quantity: z.number().nullable(),
  max_quantity: z.number().nullable(),
  pip_size: z.number().nullable(),
  base_commission: z.number().nullable(),
  commission_type: z.string().nullable(),
  is_tradable: z.boolean().nullable(),
  created_at: timestampSchema.nullable(),
});

// Risk settings schema
export const riskSettingsSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  max_position_size: z.number(),
  max_positions: z.number(),
  daily_loss_limit: z.number(),
  daily_trade_limit: z.number(),
  margin_call_level: z.number(),
  stop_out_level: z.number(),
  max_total_exposure: z.number(),
  enforce_stop_loss: z.boolean(),
  min_stop_loss_distance: z.number(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

// Notification schema
export const notificationSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  type: z.string(),
  title: z.string(),
  message: z.string(),
  data: z.unknown().nullable(),
  read: z.boolean(),
  sent_email: z.boolean(),
  created_at: timestampSchema,
});

// Order execution result schema
export const orderExecutionResultSchema = z.object({
  order_id: uuidSchema,
  position_id: uuidSchema,
  fill_id: uuidSchema,
  fill_price: z.number(),
  slippage: z.number(),
  commission: z.number(),
  margin_required: z.number(),
  status: z.string(),
});

// Close position result schema
export const closePositionResultSchema = z.object({
  order_id: uuidSchema,
  fill_id: uuidSchema,
  position_id: uuidSchema,
  closed_quantity: z.number(),
  close_price: z.number(),
  realized_pnl: z.number(),
  commission: z.number(),
  margin_released: z.number(),
  lots_closed: z.array(
    z.object({
      lot_id: uuidSchema,
      quantity_closed: z.number(),
      entry_price: z.number(),
      exit_price: z.number(),
      pnl: z.number(),
    })
  ),
  position_status: z.string(),
});

// Array schemas
export const profilesArraySchema = z.array(profileSchema);
export const positionsArraySchema = z.array(positionSchema);
export const ordersArraySchema = z.array(orderSchema);
export const fillsArraySchema = z.array(fillSchema);
export const ledgerArraySchema = z.array(ledgerSchema);
export const assetSpecsArraySchema = z.array(assetSpecsSchema);
export const notificationsArraySchema = z.array(notificationSchema);

// Validation result type
interface ValidationResult<T> {
  success: boolean;
  data: T | null;
  errors: z.ZodError | null;
}

/**
 * Validate data against a schema
 */
export function validateData<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context?: { source: string; userId?: string }
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }

  // Log validation errors
  logger.warn('API response validation failed', {
    metadata: {
      errors: result.error.errors,
      source: context?.source,
      userId: context?.userId,
      sampleData: JSON.stringify(data).slice(0, 200),
    },
  });

  // Report to Sentry in production
  if (import.meta.env.PROD) {
    reportError(result.error, {
      source: context?.source,
      validationErrors: result.error.errors,
    });
  }

  return { success: false, data: null, errors: result.error };
}

/**
 * Validate with fallback - returns data even if validation fails (with warning)
 */
export function validateWithFallback<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context?: { source: string; userId?: string }
): T | null {
  const result = validateData(schema, data, context);

  if (result.success) {
    return result.data;
  }

  // In development, still return data for easier debugging
  if (import.meta.env.DEV) {
    logger.warn('Returning unvalidated data in dev mode', {
      metadata: { source: context?.source },
    });
    return data as T;
  }

  return null;
}

/**
 * Validate array with partial success - filters out invalid items
 */
export function validateArrayPartial<T>(
  itemSchema: z.ZodType<T>,
  data: unknown[],
  context?: { source: string; userId?: string }
): T[] {
  const validItems: T[] = [];
  const invalidIndices: number[] = [];

  data.forEach((item, index) => {
    const result = itemSchema.safeParse(item);
    if (result.success) {
      validItems.push(result.data);
    } else {
      invalidIndices.push(index);
    }
  });

  if (invalidIndices.length > 0) {
    logger.warn('Some array items failed validation', {
      metadata: {
        source: context?.source,
        invalidCount: invalidIndices.length,
        totalCount: data.length,
        invalidIndices: invalidIndices.slice(0, 10),
      },
    });
  }

  return validItems;
}

// Export all schemas for external use
export const schemas = {
  profile: profileSchema,
  position: positionSchema,
  order: orderSchema,
  fill: fillSchema,
  ledger: ledgerSchema,
  assetSpecs: assetSpecsSchema,
  riskSettings: riskSettingsSchema,
  notification: notificationSchema,
  orderExecutionResult: orderExecutionResultSchema,
  closePositionResult: closePositionResultSchema,
  // Arrays
  profiles: profilesArraySchema,
  positions: positionsArraySchema,
  orders: ordersArraySchema,
  fills: fillsArraySchema,
  ledgerEntries: ledgerArraySchema,
  assetSpecsList: assetSpecsArraySchema,
  notifications: notificationsArraySchema,
};

// Type exports
export type Profile = z.infer<typeof profileSchema>;
export type Position = z.infer<typeof positionSchema>;
export type Order = z.infer<typeof orderSchema>;
export type Fill = z.infer<typeof fillSchema>;
export type LedgerEntry = z.infer<typeof ledgerSchema>;
export type AssetSpecs = z.infer<typeof assetSpecsSchema>;
export type RiskSettings = z.infer<typeof riskSettingsSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type OrderExecutionResult = z.infer<typeof orderExecutionResultSchema>;
export type ClosePositionResult = z.infer<typeof closePositionResultSchema>;
