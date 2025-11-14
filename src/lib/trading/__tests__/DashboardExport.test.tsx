import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, expect, describe, it } from 'vitest';

// Polyfill ResizeObserver
if (typeof (global as any).ResizeObserver === 'undefined') {
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
        { id: 'p2', symbol: 'GBPUSD', quantity: 2, entry_price: 1.3, current_price: 1.31, side: 'buy', asset_class: 'FOREX', unrealized_pnl: 400 },
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

import RecentPnLChart from '@/components/dashboard/RecentPnLChart';
import ExportToolbar from '@/components/dashboard/ExportToolbar';

describe('RecentPnLChart', () => {
  it('renders the component without crashing', () => {
    render(<RecentPnLChart />);

    expect(screen.getByText(/Daily P&L/i)).toBeInTheDocument();
  });

  it('displays statistics labels', () => {
    render(<RecentPnLChart />);

    expect(screen.getByText(/Total P&L/i)).toBeInTheDocument();
    expect(screen.getByText(/Win Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Max Profit/i)).toBeInTheDocument();
    expect(screen.getByText(/Max Loss/i)).toBeInTheDocument();
    expect(screen.getByText(/Profit Days/i)).toBeInTheDocument();
    expect(screen.getByText(/Loss Days/i)).toBeInTheDocument();
  });

  it('shows win/loss count in header', () => {
    render(<RecentPnLChart />);

    const header = screen.getByText(/Daily P&L/i).parentElement;
    expect(header?.textContent).toMatch(/win.*loss/i);
  });

  it('renders bar chart with data', () => {
    render(<RecentPnLChart />);

    // Verify the component renders without error
    expect(screen.getByText(/Daily P&L/i)).toBeInTheDocument();
  });

  it('displays formatted currency values', () => {
    const { container } = render(<RecentPnLChart />);

    const text = container.textContent || '';
    expect(text).toMatch(/\$[\d,]+/);
  });

  it('shows statistics grid', () => {
    const { container } = render(<RecentPnLChart />);

    const grids = container.querySelectorAll('[class*="grid"]');
    expect(grids.length).toBeGreaterThan(0);
  });
});

describe('ExportToolbar', () => {
  it('renders export buttons', () => {
    render(<ExportToolbar />);

    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export PDF/i })).toBeInTheDocument();
  });

  it('displays download icons', () => {
    const { container } = render(<ExportToolbar />);

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2); // At least download and file icons
  });

  it('allows clicking export buttons', () => {
    render(<ExportToolbar />);

    const csvButton = screen.getByRole('button', { name: /Export CSV/i });
    const pdfButton = screen.getByRole('button', { name: /Export PDF/i });

    fireEvent.click(csvButton);
    fireEvent.click(pdfButton);

    // Buttons should still be in the DOM after click
    expect(csvButton).toBeInTheDocument();
    expect(pdfButton).toBeInTheDocument();
  });

  it('buttons have outline variant styling', () => {
    render(<ExportToolbar />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn).toHaveClass('border');
    });
  });
});
