import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect } from 'vitest';

// Mock hooks
vi.mock('@/hooks/useRealtimePositions', () => ({
  useRealtimePositions: (userId: string | null) => ({
    positions: [
      {
        id: 'pos-1',
        user_id: 'user-1',
        symbol: 'EURUSD',
        side: 'long',
        quantity: 1,
        entry_price: 1.1,
        current_price: 1.12,
        unrealized_pnl: 200,
        margin_used: 1000,
        margin_level: 200,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    isLoading: false,
  }),
}));

const mockClose = vi.fn(async () => ({ position_id: 'pos-1', closed_quantity: 1 }));

vi.mock('@/hooks/usePositionClose', () => ({
  usePositionClose: () => ({
    closePosition: mockClose,
    isClosing: false,
  }),
}));

import PositionsTable from '../PositionsTable';

describe('PositionsTable', () => {
  it('renders the table and a row', () => {
    render(<PositionsTable userId="user-1" />);

    expect(screen.getByText('Open Positions')).toBeInTheDocument();
    expect(screen.getByText('EURUSD')).toBeInTheDocument();
    expect(screen.getByText('long')).toBeInTheDocument();
  });

  it('opens close dialog and calls closePosition', async () => {
    render(<PositionsTable userId="user-1" />);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(screen.getByText(/Close Position: EURUSD/)).toBeInTheDocument();

    const confirm = screen.getByText('Confirm Close');
    fireEvent.click(confirm);

    // wait for mock to be called
    expect(mockClose).toHaveBeenCalledWith({ position_id: 'pos-1', quantity: undefined });
  });

  it('selects row and bulk closes', async () => {
    render(<PositionsTable userId="user-1" />);

    const checkbox = screen.getByLabelText('select-pos-1');
    fireEvent.click(checkbox);

    const bulkBtn = screen.getByText('Close Selected');
    fireEvent.click(bulkBtn);

    // bulk close calls closePosition for selected id
    // our implementation imports and calls usePositionClose; the mock should be used
    // Expect mock to have been called with the position id
    expect(mockClose).toHaveBeenCalledWith({ position_id: 'pos-1' });
  });
});
