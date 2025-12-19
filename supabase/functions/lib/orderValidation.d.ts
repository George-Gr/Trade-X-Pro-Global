export class ValidationError extends Error {
  status: number;
  details?: string;
  constructor(status: number, message: string, details?: string);
}

export function validateOrderInput(
  body: unknown
): Promise<Record<string, unknown>>;
export function validateAssetExists(
  supabase: unknown,
  symbol: string
): Promise<Record<string, unknown>>;
export function validateQuantity(
  orderRequest: unknown,
  assetSpec: unknown
): void;
export function validateAccountStatus(profile: unknown): void;
export function validateKYCStatus(profile: unknown): void;
export function validateMarketHours(assetSpec: unknown, now?: Date): boolean;
export function validateLeverage(profile: unknown, assetSpec: unknown): boolean;

declare const _default: {
  validateOrderInput: typeof validateOrderInput;
  validateAssetExists: typeof validateAssetExists;
  validateQuantity: typeof validateQuantity;
  validateAccountStatus: typeof validateAccountStatus;
  validateKYCStatus: typeof validateKYCStatus;
  validateMarketHours: typeof validateMarketHours;
  validateLeverage: typeof validateLeverage;
};

export default _default;
