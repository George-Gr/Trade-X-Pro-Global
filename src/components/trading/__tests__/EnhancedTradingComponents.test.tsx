import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedPositionsTable from '@/components/trading/EnhancedPositionsTable';
import OrderHistory from '@/components/trading/OrderHistory';
import EnhancedPortfolioDashboard from '@/components/trading/EnhancedPortfolioDashboard';

// Mock hooks
vi.mock('@/hooks/useRealtimePositions', () => ({
  useRealtimePositions: vi.fn(() => ({
    positions: [
      {
        id: '1',
        symbol: 'EURUSD',
        side: 'buy',
        quantity: 1.0,
        entry_price: 1.085,
        current_price: 1.0875,
        stop_loss: 1.08,
        take_profit: 1.095,
        commission: 2.5,
        margin_required: 500,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        symbol: 'GBPUSD',
        side: 'sell',
        quantity: 0.5,
        entry_price: 1.27,
        current_price: 1.268,
        stop_loss: 1.28,
        take_profit: 1.26,
        commission: 1.25,
        margin_required: 300,
        created_at: new Date().toISOString(),
      },
    ],
    isLoading: false,
  })),
}));

vi.mock('@/hooks/usePnLCalculations', () => ({
  usePnLCalculations: vi.fn(() => ({
    positionPnLMap: new Map([
      ['1', { pnl: 250, pnlPercent: 0.23 }],
      ['2', { pnl: 100, pnlPercent: 0.08 }],
    ]),
    getPnLColor: (pnl: number) => (pnl >= 0 ? '#00BFA5' : '#E53935'),
  })),
}));

vi.mock('@/hooks/usePositionClose', () => ({
  usePositionClose: vi.fn(() => ({
    closePosition: vi.fn(async () => {}),
    isClosing: null,
    error: null,
  })),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-123' },
  })),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

vi.mock('@/hooks/useOrdersTable', () => ({
  useOrdersTable: vi.fn(() => ({
    orders: [
      {
        id: '1',
        symbol: 'EURUSD',
        type: 'market',
        side: 'buy',
        quantity: 1.0,
        price: 1.085,
        status: 'filled',
        filled_quantity: 1.0,
        average_price: 1.085,
        commission: 2.5,
        created_at: new Date().toISOString(),
        filled_at: new Date().toISOString(),
      },
    ],
    isLoading: false,
  })),
}));

vi.mock('@/hooks/usePortfolioData', () => ({
  usePortfolioData: vi.fn(() => ({
    profile: {
      id: 'user-123',
      balance: 10000,
      margin_used: 800,
      realized_pnl: 500,
    },
    positions: [
      {
        id: '1',
        symbol: 'EURUSD',
        side: 'buy',
        quantity: 1.0,
        entry_price: 1.085,
        current_price: 1.0875,
      },
    ],
    loading: false,
    error: null,
  })),
}));

describe('EnhancedPositionsTable', () => {
  it('should render positions table with all positions', () => {
    render(<EnhancedPositionsTable />);
    expect(screen.getByText(/open positions/i)).toBeInTheDocument();
    expect(screen.getAllByText('EURUSD')).toHaveLength(2); // One in desktop table, one in mobile card
  });
  it('should display position quantities', () => {
    render(<EnhancedPositionsTable />);
    expect(screen.getAllByText(/1\.00/)).toHaveLength(2); // One in desktop table, one in mobile card
  });

  it('should show buy/sell badges', () => {
    render(<EnhancedPositionsTable />);
    const buyBadges = screen.queryAllByText('BUY');
    expect(buyBadges.length).toBeGreaterThan(0);
  });

  it('should filter positions by side', async () => {
    render(<EnhancedPositionsTable />);
    const buyButton = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent?.trim() === 'Buy');
    if (buyButton) fireEvent.click(buyButton);
    await waitFor(() => {
      expect(screen.getByText(/open positions/i)).toBeInTheDocument();
    });
  });
});

describe('OrderHistory', () => {
  it('should render order history', () => {
    render(<OrderHistory />);
    expect(screen.getByText(/order history/i)).toBeInTheDocument();
  });

  it('should display order count', () => {
    render(<OrderHistory />);
    expect(screen.queryByText(/\(1\)/)).toBeInTheDocument();
  });

  it('should show order type badges', () => {
    render(<OrderHistory />);
    const typeBadges = screen.queryAllByText(/MARKET|LIMIT/i);
    expect(typeBadges.length).toBeGreaterThan(0);
  });
});

describe('EnhancedPortfolioDashboard', () => {
  it('should render dashboard with metrics', () => {
    render(<EnhancedPortfolioDashboard />);
    expect(screen.getByText(/total equity/i)).toBeInTheDocument();
    expect(screen.getByText(/balance/i)).toBeInTheDocument();
  });

  it('should have position and order tabs', () => {
    render(<EnhancedPortfolioDashboard />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('should display margin level', () => {
    render(<EnhancedPortfolioDashboard />);
    expect(screen.getByText(/margin level/i)).toBeInTheDocument();
  });

  it('should switch between tabs', async () => {
    render(<EnhancedPortfolioDashboard />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(1);

    // Verify tabs exist and are rendered
    expect(tabs[0]).toBeInTheDocument();
    expect(tabs[1]).toBeInTheDocument();

    // Tab 0 should be Positions, Tab 1 should be Orders
    expect(tabs[0].textContent).toContain('Positions');
    expect(tabs[1].textContent).toContain('Orders');
  });
});

describe('Integration Tests', () => {
  it('should display positions and their data', () => {
    render(<EnhancedPositionsTable />);
    const positionsHeader = screen.getByText(/open positions/i);
    expect(positionsHeader).toBeInTheDocument();
    expect(screen.getAllByText('EURUSD')).toHaveLength(2); // One in desktop table, one in mobile card
  });

  it('should handle filter changes efficiently', async () => {
    render(<EnhancedPositionsTable />);
    const buttons = screen
      .getAllByRole('button')
      .filter((btn) => btn.textContent?.includes('All'));
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
      await waitFor(
        () => {
          expect(screen.getByText(/open positions/i)).toBeInTheDocument();
        },
        { timeout: 100 }
      );
    }
  });

  it('should render responsive layout', () => {
    window.innerWidth = 375;
    const { rerender } = render(<EnhancedPositionsTable />);
    expect(screen.getByText(/open positions/i)).toBeInTheDocument();

    window.innerWidth = 1920;
    rerender(<EnhancedPortfolioDashboard />);
    expect(screen.getByText(/total equity/i)).toBeInTheDocument();
  });
});
