export class ValidationError extends Error {
  status: number;
  details?: string;
  constructor(status: number, message: string, details?: string);
}

export function validateOrderInput(body: unknown): Promise<any>;
export function validateAssetExists(supabase: any, symbol: string): Promise<any>;
export function validateQuantity(orderRequest: any, assetSpec: any): void;
export function validateAccountStatus(profile: any): void;
export function validateKYCStatus(profile: any): void;
export function validateMarketHours(assetSpec: any, now?: Date): boolean;
export function validateLeverage(profile: any, assetSpec: any): boolean;

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
