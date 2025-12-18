import type { Position } from "@/types/position";
import {
  calculateUnrealizedPnL as calcUnrealizedPnL,
  getPositionColor as calcPositionColor,
} from "./positionCalculations";

/**
 * Wrapper utility to calculate unrealized PnL for a Position object.
 * Keeps component call-sites simple (pass the full Position object).
 */
export function calculateUnrealizedPnL(position: Position): number {
  return calcUnrealizedPnL({
    side: position.side,
    quantity: position.quantity,
    entry_price: position.entry_price,
    current_price: position.current_price,
  });
}

/**
 * Get a color name (string) for the position PnL status (green/red/gray).
 */
export function getPositionColor(position: Position): string {
  return calcPositionColor({
    side: position.side,
    entry_price: position.entry_price,
    current_price: position.current_price,
  });
}

export default {
  calculateUnrealizedPnL,
  getPositionColor,
};
