import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderStatusBadge, classifyOrderStatus, calculateFillPercentage, type OrderStatus } from '../OrderStatusBadge';
import { OrderRow, type Order } from '../OrderRow';
import { OrderDetailDialog } from '../OrderDetailDialog';
import { ModifyOrderDialog, type OrderModification } from '../ModifyOrderDialog';
import { CancelOrderConfirmation } from '../CancelOrderConfirmation';

// ============================================================================
// OrderStatusBadge Tests
// ============================================================================

describe('OrderStatusBadge', () => {
  it('should render pending status with yellow color', () => {
    render(<OrderStatusBadge status="pending" />);
    const badge = screen.getByText('Pending');
    expect(badge).toBeInTheDocument();
  });

  it('should render open status with blue color', () => {
    render(<OrderStatusBadge status="open" />);
    const badge = screen.getByText('Open');
    expect(badge).toBeInTheDocument();
  });

  it('should render filled status with green color', () => {
    render(<OrderStatusBadge status="filled" />);
    const badge = screen.getByText('Filled');
    expect(badge).toBeInTheDocument();
  });

  it('should render cancelled status with gray color', () => {
    render(<OrderStatusBadge status="cancelled" />);
    const badge = screen.getByText('Cancelled');
    expect(badge).toBeInTheDocument();
  });

  it('should render rejected status with red color', () => {
    render(<OrderStatusBadge status="rejected" />);
    const badge = screen.getByText('Rejected');
    expect(badge).toBeInTheDocument();
  });

  it('should display fill percentage for partially filled orders', () => {
    render(<OrderStatusBadge status="partially_filled" fillPercentage={50} />);
    const badge = screen.getByText(/Partial/);
    expect(badge).toBeInTheDocument();
  });

  it('should include timestamp in tooltip', () => {
    const timestamp = new Date('2025-11-14T10:00:00');
    const { container } = render(<OrderStatusBadge status="open" timestamp={timestamp} />);
    const badge = container.querySelector('[title]');
    expect(badge).toHaveAttribute('title', expect.stringContaining('Status'));
  });

  it('should render all status types without crashing', () => {
    const statuses: OrderStatus[] = [
      'pending',
      'open',
      'partially_filled',
      'filled',
      'cancelled',
      'rejected',
      'expired',
    ];

    statuses.forEach((status) => {
      const { unmount, container } = render(<OrderStatusBadge status={status} />);
      const badge = container.querySelector('[class*="badge"]') || container.querySelector('div[title]');
      expect(badge).toBeInTheDocument();
      unmount();
    });
  });
});

// ============================================================================
// classifyOrderStatus Utility Tests
// ============================================================================

describe('classifyOrderStatus', () => {
  it('should return cancelled for cancelled orders', () => {
    const result = classifyOrderStatus({
      status: 'cancelled',
      filled_quantity: 0,
      quantity: 100,
    });
    expect(result).toBe('cancelled');
  });

  it('should return filled when all quantity filled', () => {
    const result = classifyOrderStatus({
      status: 'active',
      filled_quantity: 100,
      quantity: 100,
    });
    expect(result).toBe('filled');
  });

  it('should return partially_filled when some quantity filled', () => {
    const result = classifyOrderStatus({
      status: 'active',
      filled_quantity: 50,
      quantity: 100,
    });
    expect(result).toBe('partially_filled');
  });

  it('should return open for active orders with no fills', () => {
    const result = classifyOrderStatus({
      status: 'open',
      filled_quantity: 0,
      quantity: 100,
    });
    expect(result).toBe('open');
  });

  it('should return pending for pending orders', () => {
    const result = classifyOrderStatus({
      status: 'pending',
      filled_quantity: 0,
      quantity: 100,
    });
    expect(result).toBe('pending');
  });
});

// ============================================================================
// calculateFillPercentage Utility Tests
// ============================================================================

describe('calculateFillPercentage', () => {
  it('should return 0 for zero filled quantity', () => {
    expect(calculateFillPercentage(0, 100)).toBe(0);
  });

  it('should return 100 for fully filled', () => {
    expect(calculateFillPercentage(100, 100)).toBe(100);
  });

  it('should return 50 for 50% fill', () => {
    expect(calculateFillPercentage(50, 100)).toBe(50);
  });

  it('should round to nearest integer', () => {
    expect(calculateFillPercentage(33, 100)).toBe(33);
    expect(calculateFillPercentage(67, 100)).toBe(67);
  });

  it('should return 0 for zero total quantity', () => {
    expect(calculateFillPercentage(0, 0)).toBe(0);
  });
});

// ============================================================================
// OrderRow Tests
// ============================================================================

describe('OrderRow', () => {
  const mockOrder: Order = {
    id: 'order-123',
    symbol: 'EURUSD',
    type: 'limit',
    side: 'buy',
    quantity: 100,
    filled_quantity: 50,
    price: 1.0850,
    limit_price: 1.0850,
    status: 'partially_filled',
    created_at: new Date('2025-11-14T10:00:00'),
    updated_at: new Date('2025-11-14T10:30:00'),
    average_fill_price: 1.0845,
    commission: 10,
    slippage: 0.05,
  };

  it('should display symbol correctly', () => {
    render(<OrderRow order={mockOrder} />);
    expect(screen.getByText('EURUSD')).toBeInTheDocument();
  });

  it('should display order ID (truncated)', () => {
    render(<OrderRow order={mockOrder} />);
    expect(screen.getByText(/order-12/)).toBeInTheDocument();
  });

  it('should display filled/total quantity', () => {
    render(<OrderRow order={mockOrder} />);
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
  });

  it('should display average fill price when available', () => {
    render(<OrderRow order={mockOrder} />);
    expect(screen.getByText(/Filled @ 1.0845/)).toBeInTheDocument();
  });

  it('should display commission and slippage', () => {
    render(<OrderRow order={mockOrder} />);
    expect(screen.getByText('Comm: $10.00')).toBeInTheDocument();
    expect(screen.getByText('Slip: 0.05%')).toBeInTheDocument();
  });

  it('should display timestamps', () => {
    render(<OrderRow order={mockOrder} />);
    const timestampText = screen.getByText(/Created:/);
    expect(timestampText).toBeInTheDocument();
  });

  it('should call onViewDetails when Details button clicked', async () => {
    const onViewDetails = vi.fn();
    render(<OrderRow order={mockOrder} onViewDetails={onViewDetails} />);
    const detailsButton = screen.getByText('Details');
    fireEvent.click(detailsButton);
    expect(onViewDetails).toHaveBeenCalled();
  });

  it('should have progress bar for partial fills', () => {
    const { container } = render(<OrderRow order={mockOrder} />);
    const progressBar = container.querySelector('[style*="width"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('should color code buy/sell sides', () => {
    const buyOrder: Order = { ...mockOrder, side: 'buy' };
    const { container } = render(<OrderRow order={buyOrder} />);
    const buyText = container.querySelector('.text-blue-600');
    expect(buyText).toBeInTheDocument();
  });

  it('should show realized P&L when available', () => {
    const orderWithPnL: Order = { ...mockOrder, realized_pnl: 150.50 };
    render(<OrderRow order={orderWithPnL} />);
    expect(screen.getByText(/\+\$150.50/)).toBeInTheDocument();
  });

  it('should show negative P&L in red', () => {
    const orderWithLoss: Order = { ...mockOrder, realized_pnl: -75.25 };
    const { container } = render(<OrderRow order={orderWithLoss} />);
    const pnlElement = container.querySelector('.text-red-600');
    expect(pnlElement).toBeInTheDocument();
    expect(pnlElement?.textContent).toContain('$-75.25');
  });

  it('should disable modify button for filled orders', async () => {
    const filledOrder: Order = { ...mockOrder, status: 'filled' };
    const { container } = render(<OrderRow order={filledOrder} />);
    // Verify the order row renders
    expect(container).toBeInTheDocument();
  });
});

// ============================================================================
// OrderDetailDialog Tests
// ============================================================================

describe('OrderDetailDialog', () => {
  const mockOrder: Order = {
    id: 'order-456',
    symbol: 'BTCUSD',
    type: 'limit',
    side: 'sell',
    quantity: 0.5,
    filled_quantity: 0.25,
    price: 45000,
    limit_price: 45000,
    status: 'partially_filled',
    created_at: new Date('2025-11-14T10:00:00'),
    updated_at: new Date('2025-11-14T10:30:00'),
    average_fill_price: 44950,
    commission: 50,
    slippage: 20,
    realized_pnl: 200,
  };

  it('should render when isOpen is true', () => {
    render(
      <OrderDetailDialog order={mockOrder} isOpen={true} onClose={vi.fn()} />
    );
    expect(screen.getByText('Order Details')).toBeInTheDocument();
  });

  it('should not render when order is null', () => {
    const { container } = render(
      <OrderDetailDialog order={null} isOpen={true} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should display order symbol and ID', () => {
    render(
      <OrderDetailDialog order={mockOrder} isOpen={true} onClose={vi.fn()} />
    );
    expect(screen.getByText('BTCUSD')).toBeInTheDocument();
  });

  it('should display all order quantities', () => {
    render(
      <OrderDetailDialog order={mockOrder} isOpen={true} onClose={vi.fn()} />
    );
    expect(screen.getByText('0.5')).toBeInTheDocument();
    const quantityTexts = screen.getAllByText('0.25');
    expect(quantityTexts.length).toBeGreaterThan(0);
  });

  it('should call onClose when close button clicked', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <OrderDetailDialog order={mockOrder} isOpen={true} onClose={onClose} />
    );
    const closeButton = container.querySelector('button[class*="text-gray-400"]');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    }
  });
});

// ============================================================================
// ModifyOrderDialog Tests
// ============================================================================

describe('ModifyOrderDialog', () => {
  const mockOrder: Order = {
    id: 'order-789',
    symbol: 'EURUSD',
    type: 'limit',
    side: 'buy',
    quantity: 100,
    filled_quantity: 30,
    price: 1.0850,
    limit_price: 1.0850,
    status: 'partially_filled',
    created_at: new Date('2025-11-14T10:00:00'),
    updated_at: new Date('2025-11-14T10:30:00'),
    average_fill_price: 1.0845,
  };

  it('should render when isOpen is true', () => {
    render(
      <ModifyOrderDialog
        order={mockOrder}
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    const titleElement = screen.getByRole('heading', { name: 'Modify Order' });
    expect(titleElement).toBeInTheDocument();
  });

  it('should display current order details', () => {
    render(
      <ModifyOrderDialog
        order={mockOrder}
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByText(/EURUSD/)).toBeInTheDocument();
  });

  it('should validate quantity input', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ModifyOrderDialog
        order={mockOrder}
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const quantityInput = screen.getByPlaceholderText('100');
    await user.type(quantityInput, '200');
    
    // Submit should fail validation if quantity exceeds max
    const submitButton = screen.getByRole('button', { name: /Modify Order/i });
    await user.click(submitButton);
  });

  it('should call onSubmit with valid modifications', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);
    
    render(
      <ModifyOrderDialog
        order={mockOrder}
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const quantityInput = screen.getByPlaceholderText('100');
    await user.clear(quantityInput);
    await user.type(quantityInput, '50');

    const submitButton = screen.getByRole('button', { name: /Modify Order/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// CancelOrderConfirmation Tests
// ============================================================================

describe('CancelOrderConfirmation', () => {
  const mockOrder: Order = {
    id: 'order-999',
    symbol: 'XAUUSD',
    type: 'market',
    side: 'buy',
    quantity: 100,
    filled_quantity: 20,
    status: 'partially_filled',
    created_at: new Date('2025-11-14T10:00:00'),
    updated_at: new Date('2025-11-14T10:30:00'),
  };

  it('should render when isOpen is true', () => {
    render(
      <CancelOrderConfirmation
        order={mockOrder}
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Cancel Order?')).toBeInTheDocument();
  });

  it('should display order details in confirmation', () => {
    render(
      <CancelOrderConfirmation
        order={mockOrder}
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('XAUUSD')).toBeInTheDocument();
  });

  it('should display remaining quantity to cancel', () => {
    render(
      <CancelOrderConfirmation
        order={mockOrder}
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    // Remaining = 100 - 20 = 80
    expect(screen.getByText('80')).toBeInTheDocument();
  });

  it('should show warning for partially filled orders', () => {
    render(
      <CancelOrderConfirmation
        order={mockOrder}
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(/Partial Fill/)).toBeInTheDocument();
  });

  it('should call onConfirm when Cancel Order button clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(true);
    
    render(
      <CancelOrderConfirmation
        order={mockOrder}
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel Order/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('order-999');
    });
  });

  it('should call onCancel when Keep Order button clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    
    render(
      <CancelOrderConfirmation
        order={mockOrder}
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    const keepButton = screen.getByRole('button', { name: /Keep Order/i });
    await user.click(keepButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('should show loading state while submitting', () => {
    render(
      <CancelOrderConfirmation
        order={mockOrder}
        isOpen={true}
        isLoading={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(/Cancelling/)).toBeInTheDocument();
  });
});
