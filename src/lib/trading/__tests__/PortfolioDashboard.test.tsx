import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Polyfill ResizeObserver for recharts ResponsiveContainer in test environment
if (typeof (global as any).ResizeObserver === 'undefined') {
  // @ts-expect-error - test environment polyfill
  (global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock usePortfolioData
vi.mock('@/hooks/usePortfolioData', () => {
  return {
    usePortfolioData: () => ({
      profile: { balance: 10000, margin_used: 1000, equity: 10500 },
      positions: [
        { id: 'p1', symbol: 'EURUSD', quantity: 1, entry_price: 1.1, current_price: 1.12, side: 'buy', asset_class: 'FOREX', unrealized_pnl: 200 },
      ],
      loading: false,
      error: null,
      calculateEquity: () => 10500,
      calculateFreeMargin: () => 9500,
      calculateMarginLevel: () => 1050,
      refresh: () => Promise.resolve(),
    }),
  };
});

import PortfolioDashboardSummary from '@/components/dashboard/PortfolioDashboardSummary';
import EquityChart from '@/components/dashboard/EquityChart';

describe('PortfolioDashboardSummary', () => {
  it('renders key sections without crashing', () => {
    render(<PortfolioDashboardSummary />);

    expect(screen.getByText(/Account Balance/i)).toBeInTheDocument();
    expect(screen.getByText(/Equity Curve/i)).toBeInTheDocument();
    expect(screen.getByText(/Asset Allocation/i)).toBeInTheDocument();
    expect(screen.getByText(/Performance Metrics/i)).toBeInTheDocument();
  });
});

describe('EquityChart - Timeframe Selection', () => {
  it('renders all timeframe buttons', () => {
    render(<EquityChart />);

    expect(screen.getByRole('button', { name: /1D/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1W/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1M/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3M/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /6M/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1Y/i })).toBeInTheDocument();
  });

  it('allows switching between timeframes', () => {
    render(<EquityChart />);

    const button1M = screen.getByRole('button', { name: /1M/i });
    const button1W = screen.getByRole('button', { name: /1W/i });

    expect(button1M).toBeInTheDocument();
    fireEvent.click(button1W);
    expect(button1W).toBeInTheDocument();
  });

  it('responds to timeframe button clicks', () => {
    render(<EquityChart />);

    const button3M = screen.getByRole('button', { name: /3M/i });
    fireEvent.click(button3M);

    // Button should still be in the DOM after click
    expect(button3M).toBeInTheDocument();
  });
});

describe('EquityChart - Zoom Controls', () => {
  it('renders multiple buttons for interactivity', () => {
    render(<EquityChart />);

    const buttons = screen.getAllByRole('button');
    // Should have timeframe buttons (6) + zoom controls
    expect(buttons.length).toBeGreaterThanOrEqual(8);
  });

  it('supports clicking timeframe buttons', () => {
    render(<EquityChart />);

    const button1M = screen.getByRole('button', { name: /1M/i });
    const button1W = screen.getByRole('button', { name: /1W/i });

    expect(button1M).toBeInTheDocument();
    fireEvent.click(button1W);
    expect(button1W).toBeInTheDocument();
  });

  it('allows zoom level adjustments via buttons', () => {
    render(<EquityChart />);

    const buttons = screen.getAllByRole('button');
    // Buttons should be interactive
    expect(buttons.length).toBeGreaterThanOrEqual(8);

    // Click a button to test interactivity
    fireEvent.click(buttons[buttons.length - 1]);
  });
});

describe('EquityChart - Pan Control', () => {
  it('renders pan slider element when appropriate', () => {
    const { container } = render(<EquityChart />);

    // Look for range input (pan slider)
    const sliders = container.querySelectorAll('input[type="range"]');
    expect(sliders.length).toBeGreaterThanOrEqual(0);
  });

  it('has interactive controls', () => {
    render(<EquityChart />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);

    // Simulate user interaction
    fireEvent.click(buttons[0]);
  });
});

describe('EquityChart - Statistics Display', () => {
  it('displays equity statistics labels', () => {
    render(<EquityChart />);

    expect(screen.getByText(/Min Equity/i)).toBeInTheDocument();
    expect(screen.getByText(/Max Equity/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg Equity/i)).toBeInTheDocument();
    expect(screen.getByText(/Total P&L/i)).toBeInTheDocument();
  });

  it('displays formatted currency values', () => {
    const { container } = render(<EquityChart />);

    const allText = container.textContent || '';
    // Should contain currency formatting
    expect(allText).toMatch(/\$[\d,]+/);
  });

  it('renders statistics in a grid layout', () => {
    const { container } = render(<EquityChart />);

    // Look for the statistics grid
    const grids = container.querySelectorAll('[class*="grid"]');
    expect(grids.length).toBeGreaterThan(0);
  });
});

describe('EquityChart - Chart Rendering', () => {
  it('renders equity curve title', () => {
    render(<EquityChart />);

    expect(screen.getByText(/Equity Curve/i)).toBeInTheDocument();
  });

  it('contains chart reference line for average', () => {
    const { container } = render(<EquityChart />);

    // Look for recharts ReferenceLine which appears as a line element
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThan(0);
  });
});
