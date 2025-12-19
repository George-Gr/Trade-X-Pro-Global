import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PortfolioDashboard } from '../PortfolioDashboard';

// Mock the portfolio hook
vi.mock('@/hooks/usePortfolioData', () => ({
  usePortfolioData: vi.fn(() => ({
    profile: {
      id: 'user123',
      balance: 10000,
      margin_used: 3000,
      realized_pnl: 500,
    },
    positions: [
      {
        id: 'pos1',
        symbol: 'EURUSD',
        quantity: 1,
        entry_price: 1.09,
        current_price: 1.095,
        side: 'long',
      },
      {
        id: 'pos2',
        symbol: 'GBPUSD',
        quantity: 0.5,
        entry_price: 1.28,
        current_price: 1.285,
        side: 'long',
      },
    ],
    loading: false,
    error: null,
  })),
}));

describe('PortfolioDashboard', () => {
  it('should render main metrics', () => {
    const { container } = render(<PortfolioDashboard />);

    // Check that metrics are rendered
    expect(screen.getByText('Total Equity')).toBeInTheDocument();
    expect(container.textContent).toContain('Total P&L');
    expect(container.textContent).toContain('Margin Level');
    expect(container.textContent).toContain('Available Margin');
  });

  it('should render open positions table', () => {
    const { container } = render(<PortfolioDashboard />);

    // Check for table presence
    expect(screen.getByText('Open Positions')).toBeInTheDocument();
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    // Check for positions in content
    expect(container.textContent).toContain('EURUSD');
  });

  it('should render P&L breakdown section', () => {
    render(<PortfolioDashboard />);

    expect(screen.getByText('P&L Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Unrealized P&L')).toBeInTheDocument();
    expect(screen.getByText('Realized P&L')).toBeInTheDocument();
  });

  it('should render performance metrics section', () => {
    render(<PortfolioDashboard />);

    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg Return')).toBeInTheDocument();
    expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
  });

  it('should render asset allocation section', () => {
    render(<PortfolioDashboard />);

    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
  });

  it('should have table headers for positions', () => {
    render(<PortfolioDashboard />);

    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Entry')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('should render with responsive grid classes', () => {
    const { container } = render(<PortfolioDashboard />);

    // Check for grid layout
    const grids = container.querySelectorAll('[class*="grid"]');
    expect(grids.length).toBeGreaterThan(0);
  });

  it('should render margin level progress bar', () => {
    const { container } = render(<PortfolioDashboard />);

    // Look for progress bar divs with height class
    const progressBars = container.querySelectorAll('[class*="h-2"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should render positions with long/short labels', () => {
    render(<PortfolioDashboard />);

    // Both positions should be long
    const longLabels = screen.getAllByText(/\(long\)/);
    expect(longLabels.length).toBeGreaterThanOrEqual(1);
  });

  it('should render Card components', () => {
    const { container } = render(<PortfolioDashboard />);

    // Check for card classes
    const cards = container.querySelectorAll('[class*="bg-card"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should display trading metrics', () => {
    render(<PortfolioDashboard />);

    // Should show equity, P&L, and margin metrics separately
    expect(screen.getByText('Total Equity')).toBeInTheDocument();
  });

  it('should handle multiple positions in table', () => {
    const { container } = render(<PortfolioDashboard />);

    // Check that positions are rendered
    expect(container.textContent).toContain('EURUSD');
    expect(container.textContent).toContain('GBPUSD');
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });

  it('should render without crashing with default props', () => {
    const { container } = render(<PortfolioDashboard />);
    expect(container).toBeInTheDocument();
  });

  it('should display currency values with dollar signs', () => {
    render(<PortfolioDashboard />);

    // Should have dollar values displayed
    const dollarSigns = screen.getAllByText(/\$[\d,]+/);
    expect(dollarSigns.length).toBeGreaterThan(0);
  });

  it('should render all main dashboard sections', () => {
    render(<PortfolioDashboard />);

    // Check for main sections
    expect(screen.getByText('Total Equity')).toBeInTheDocument();
    expect(screen.getByText('P&L Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Open Positions')).toBeInTheDocument();
    expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
  });
});
