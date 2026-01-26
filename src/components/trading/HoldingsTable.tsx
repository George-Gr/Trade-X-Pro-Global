import { Card } from '@/components/ui/card';
import React from 'react';

/** Represents a trading position */
interface Position {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  current_price: number | null;
  entry_price: number;
  quantity: number;
}

interface HoldingsTableProps {
  positions: Position[];
}

/**
 * Displays open trading positions in a responsive table (desktop) and card (mobile) layout.
 */
export const HoldingsTable = ({ positions }: HoldingsTableProps) => {
  return (
    <Card className="p-4 bg-card">
      <h3 className="font-semibold mb-4">Open Positions</h3>
      {positions && positions.length > 0 ? (
        <React.Fragment>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 text-muted-foreground font-medium">
                    Symbol
                  </th>
                  <th className="text-right py-4 text-muted-foreground font-medium">
                    Qty
                  </th>
                  <th className="text-right py-4 text-muted-foreground font-medium">
                    Entry
                  </th>
                  <th className="text-right py-4 text-muted-foreground font-medium">
                    Current
                  </th>
                  <th className="text-right py-4 text-muted-foreground font-medium">
                    P&L
                  </th>
                  <th className="text-right py-4 text-muted-foreground font-medium">
                    ROI
                  </th>
                  <th className="text-right py-4 text-muted-foreground font-medium">
                    Risk
                  </th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => {

                    // Accepts Position type: current_price can be number | null
                    const currentPrice = pos.current_price ?? 0;
                    const entryPrice = pos.entry_price ?? 0;
                    const quantity = pos.quantity ?? 0;

                    // Guard against invalid values
                    const posValue = currentPrice * quantity * 100000;
                    const entryValue = entryPrice * quantity * 100000;
                    const pnl =
                      entryPrice && isFinite(currentPrice) && quantity
                        ? pos.side === 'buy'
                          ? posValue - entryValue
                          : entryValue - posValue
                        : 0;
                    const roi =
                      entryValue > 0 ? (pnl / entryValue) * 100 : 0;
                    const risk = Math.abs(pnl); // Simplified risk metric

                    return (
                      <tr
                        key={pos.id}
                        className="border-b border-border/50 hover:bg-secondary/30"
                      >
                        <td className="py-4">
                          <span className="font-semibold">
                            {pos.symbol}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({pos.side})
                          </span>
                        </td>
                        <td className="text-right font-mono text-xs">
                          {pos.quantity}
                        </td>
                        <td className="text-right font-mono text-xs">
                          {pos.entry_price?.toFixed(5) ?? '0.00000'}
                        </td>                        <td className="text-right font-mono text-xs">
                          {pos.current_price
                            ? pos.current_price.toFixed(5)
                            : '0.00000'}
                        </td>
                        <td
                          className={`text-right font-mono text-xs font-semibold ${
                            pnl >= 0 ? 'text-profit' : 'text-loss'
                          }`}
                        >
                          {pnl >= 0 ? '+' : ''}
                          {pnl.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td
                          className={`text-right font-mono text-xs font-semibold ${
                            roi >= 0 ? 'text-profit' : 'text-loss'
                          }`}
                        >
                          {roi >= 0 ? '+' : ''}
                          {roi.toFixed(2)}%
                        </td>
                        <td className="text-right font-mono text-xs text-muted-foreground">
                          ${risk.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {positions.map((pos) => {
              const currentPrice = pos.current_price ?? 0;
              const entryPrice = pos.entry_price ?? 0;
              const quantity = pos.quantity ?? 0;

              // Guard against invalid values
              const posValue = currentPrice * quantity * 100000;
              const entryValue = entryPrice * quantity * 100000;
              const pnl =
                entryPrice && isFinite(currentPrice) && quantity
                  ? pos.side === 'buy'
                    ? posValue - entryValue
                    : entryValue - posValue
                  : 0;
              const roi = entryValue > 0 ? (pnl / entryValue) * 100 : 0;
              const risk = Math.abs(pnl);
              return (
                <div
                  key={pos.id}
                  className="border border-border rounded-lg p-3 space-y-2 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">
                      {pos.symbol}
                    </h4>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        pos.side === 'buy'
                          ? 'bg-buy/20 text-buy'
                          : 'bg-sell/20 text-sell'
                      }`}
                    >
                      {pos.side?.toUpperCase() ?? 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Qty:</span>
                      <p className="font-mono font-semibold">
                        {pos.quantity}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Entry:
                      </span>
                      <p className="font-mono font-semibold">
                        {pos.entry_price.toFixed(5)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Current:
                      </span>
                      <p className="font-mono font-semibold">
                        {pos.current_price
                          ? pos.current_price.toFixed(5)
                          : '0.00000'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ROI:</span>
                      <p
                        className={`font-mono font-semibold ${
                          roi >= 0 ? 'text-profit' : 'text-loss'
                        }`}
                      >
                        {roi >= 0 ? '+' : ''}
                        {roi.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div
                      className={`text-sm font-semibold ${
                        pnl >= 0 ? 'text-profit' : 'text-loss'
                      }`}
                    >
                      P&L: {pnl >= 0 ? '+' : ''}
                      {pnl.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Risk: ${risk.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </React.Fragment>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No open positions
        </p>
      )}
    </Card>
  );
};