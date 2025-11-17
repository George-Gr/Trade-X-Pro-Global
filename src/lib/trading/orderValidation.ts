/**
 * Frontend / Node copy of order validation utilities.
 *
 * Purpose: used by frontend code and local unit tests (Vitest). This file mirrors
 * the Deno/Edge validator implementation used in Supabase functions located at
 * `/supabase/functions/lib/orderValidation.ts`.
 *
 * Sync policy: keep this file as the canonical development copy. Run
 * `npm run sync-validators` to copy it into the Supabase functions folder before
 * deploying Edge Functions (or CI can run the same script).
 */
import { z } from 'zod';

export class ValidationError extends Error {
  status: number;
  details?: string;
  constructor(status: number, message: string, details?: string) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Type definitions for database objects
interface AssetSpec {
  symbol: string;
  min_quantity: number;
  max_quantity: number;
  is_tradable: boolean;
  trading_hours?: { open: string; close: string };
  leverage?: number;
}

interface UserProfile {
  account_status: string;
  kyc_status: string;
  max_leverage?: number;
}

interface SupabaseClient {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string | boolean): {
        maybeSingle(): Promise<{ data: AssetSpec | null; error: Error | null }>;
      };
    };
  };
}

export const OrderRequestSchema = z.object({
  symbol: z.string()
    .trim()
    .min(1, 'Symbol required')
    .max(20, 'Symbol too long')
    .regex(/^[A-Z0-9_]+$/, 'Invalid symbol format'),
  order_type: z.enum(['market', 'limit', 'stop', 'stop_limit']),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive().finite().max(1000000),
  price: z.number().positive().finite().optional(),
  stop_loss: z.number().positive().finite().optional(),
  take_profit: z.number().positive().finite().optional(),
  idempotency_key: z.string().min(1)
});

export function validateOrderInput(body: unknown) {
  const validation = OrderRequestSchema.safeParse(body);
  if (!validation.success) {
    const details = validation.error.issues.map((issue: { path: PropertyKey[]; message: string }) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    throw new ValidationError(400, 'Invalid input', details);
  }
  return validation.data;
}

export async function validateAssetExists(db: SupabaseClient, symbol: string) {
  const { data: assetSpec, error } = await (db as unknown as SupabaseClient)
    .from('asset_specs')
    .select('*')
    .eq('symbol', symbol)
    .eq('is_tradable', true)
    .maybeSingle();

  if (error || !assetSpec) {
    throw new ValidationError(400, 'Invalid or untradable symbol');
  }

  return assetSpec;
}

export function validateQuantity(orderRequest: { quantity: number }, assetSpec: AssetSpec) {
  const minQ = typeof assetSpec.min_quantity === 'number' ? assetSpec.min_quantity : 0;
  const maxQ = typeof assetSpec.max_quantity === 'number' ? assetSpec.max_quantity : Number.MAX_SAFE_INTEGER;

  if (orderRequest.quantity < minQ || orderRequest.quantity > maxQ) {
    throw new ValidationError(400, 'Invalid quantity', `min_quantity=${minQ}, max_quantity=${maxQ}`);
  }
}

export function validateAccountStatus(profile: UserProfile | null) {
  if (!profile) {
    throw new ValidationError(404, 'User profile not found');
  }
  if (profile.account_status !== 'active') {
    throw new ValidationError(403, 'Account suspended or closed');
  }
}

export function validateKYCStatus(profile: UserProfile | null) {
  if (!profile) {
    throw new ValidationError(404, 'User profile not found');
  }
  if (profile.kyc_status !== 'approved') {
    throw new ValidationError(403, 'KYC verification required', profile.kyc_status);
  }
}

export function validateMarketHours(assetSpec: AssetSpec | null, now = new Date()) {
  const hours = assetSpec?.trading_hours;
  if (!hours) return true;
  try {
    const [oh, om] = hours.open.split(':').map(Number);
    const [ch, cm] = hours.close.split(':').map(Number);
    const openDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), oh, om);
    const closeDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ch, cm);
    if (now < openDate || now > closeDate) {
      throw new ValidationError(400, 'Market closed for this asset');
    }
    return true;
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    return true;
  }
}

export function validateLeverage(profile: UserProfile | null, assetSpec: AssetSpec | null) {
  const assetLeverage = assetSpec?.leverage ?? null;
  const userMax = profile?.max_leverage ?? null;
  if (assetLeverage && userMax && assetLeverage > userMax) {
    throw new ValidationError(400, 'Leverage exceeds account limit');
  }
  return true;
}

export default {
  validateOrderInput,
  validateAssetExists,
  validateQuantity,
  validateAccountStatus,
  validateKYCStatus,
  validateMarketHours,
  validateLeverage,
};
