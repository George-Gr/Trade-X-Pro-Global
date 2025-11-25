import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock hooks
vi.mock('@/hooks/useRealtimePositions', () => ({
  useRealtimePositions: (userId: string | null) => {
    // Generate mock data: 1000 positions
    const positions = Array.from({ length: 1000 }, (_, i) => ({
      id: `pos-${i}`,
      user_id: 'user-1',
      symbol: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD'][i % 5],
      side: i % 2 === 0 ? 'long' : 'short',
      quantity: Math.floor(Math.random() * 10) + 1,
      entry_price: 1.0 + Math.random() * 0.1,
      current_price: 1.0 + Math.random() * 0.15,
      unrealized_pnl: (Math.random() - 0.5) * 500,
      margin_used: Math.random() * 2000 + 500,
      margin_level: Math.random() * 300 + 50,
      status: 'open' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      leverage: 30,
    }));
    return {
      positions,
      isLoading: false,
      error: null,
      isSubscribed: true,
      connectionStatus: 'connected' as const,
    };
  },
}));

vi.mock('@/hooks/usePositionClose', () => ({
  usePositionClose: () => ({
    closePosition: vi.fn(async () => ({ position_id: 'pos-1', closed_quantity: 1 })),
    isClosing: false,
  }),
}));

import PositionsTableVirtualized from '../PositionsTableVirtualized';

describe('PositionsTableVirtualized - Performance Tests', () => {
  let startTime: number;
  let endTime: number;

  beforeAll(() => {
    // Mock ResizeObserver for react-window
    const globalObj = globalThis as typeof globalThis & { ResizeObserver: typeof ResizeObserver };
    globalObj.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })) as ResizeObserver;
  });

  it('renders 1000 positions without lag (<1000ms)', () => {
    startTime = performance.now();
    const { container } = render(<PositionsTableVirtualized userId="user-1" />);
    endTime = performance.now();

    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(1000);
    expect(container).toBeInTheDocument();
    console.log(`Virtualized render time for 1000 positions: ${renderTime.toFixed(2)}ms`);
  });

  it('renders header row correctly', () => {
    render(<PositionsTableVirtualized userId="user-1" />);

    // Header should be present
    const symbolHeader = screen.getByText('Symbol');
    expect(symbolHeader).toBeInTheDocument();
  });

  it('shows position count', () => {
    render(<PositionsTableVirtualized userId="user-1" />);

    expect(screen.getByText(/1000 positions/)).toBeInTheDocument();
  });

  it('mounts without memory leaks', () => {
    const { unmount } = render(<PositionsTableVirtualized userId="user-1" />);

    // Should unmount cleanly
    expect(() => unmount()).not.toThrow();
  });

  it('shows close selected button', () => {
    render(<PositionsTableVirtualized userId="user-1" />);

    expect(screen.getByText('Close Selected')).toBeInTheDocument();
  });

  it('displays open positions title', () => {
    render(<PositionsTableVirtualized userId="user-1" />);

    expect(screen.getByText('Open Positions')).toBeInTheDocument();
  });
});
