/**
 * Type declarations for Deno marginCalculations module
 */

export interface MarginCalculationInput {
  positionSize: number;
  entryPrice: number;
  leverage: number;
  currentPrice: number;
  accountEquity: number;
}

export interface MarginSummary {
  totalEquity: number;
  totalMarginUsed: number;
  freeMargin: number;
  marginLevel: number;
  marginLevelStatus: "safe" | "warning" | "critical" | "liquidation";
  canOpenNewPosition: boolean;
}

export class MarginCalculationError extends Error {
  status: number;
  details: string;
  constructor(status: number, details: string, message?: string);
}

export const ASSET_CLASS_CONFIG: Record<
  string,
  {
    leverage: number;
    maintenanceMarginRatio: number;
    minQuantity: number;
    maxQuantity: number;
  }
>;

export function calculateMarginRequired(
  positionSize: number,
  entryPrice: number,
  leverage: number,
): number;

export function calculateFreeMargin(
  totalEquity: number,
  marginUsed: number,
): number;

export function calculateMarginLevel(
  totalEquity: number,
  marginUsed: number,
): number;

export function calculatePositionValue(
  positionSize: number,
  currentPrice: number,
): number;

export function calculateUnrealizedPnL(
  positionSize: number,
  entryPrice: number,
  currentPrice: number,
): number;

export function calculateLiquidationPrice(
  entryPrice: number,
  positionSize: number,
  leverage: number,
  maintenanceMarginRatio: number,
): number;

export function canOpenPosition(
  newMarginRequired: number,
  freeMargin: number,
): boolean;

export function calculateMaxPositionSize(
  availableEquity: number,
  leverage: number,
  currentPrice: number,
): number;

export function calculateMarginSummary(
  totalEquity: number,
  totalMarginUsed: number,
): MarginSummary;

export function getAssetConfig(symbol: string): {
  leverage: number;
  maintenanceMarginRatio: number;
  minQuantity: number;
  maxQuantity: number;
};
