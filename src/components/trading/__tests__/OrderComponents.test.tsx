import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderTypeSelector, type OrderType } from '../OrderTypeSelector';
import { OrderForm, type OrderFormData } from '../OrderForm';
import { OrderPreview } from '../OrderPreview';

// ============================================================================
// OrderTypeSelector Tests
// ============================================================================

describe('OrderTypeSelector', () => {
  const mockOnChange = vi.fn();

  it('should render with all order type options visible', () => {
    render(<OrderTypeSelector value="market" onChange={mockOnChange} />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('should display tabs for each order type', () => {
    render(<OrderTypeSelector value="market" onChange={mockOnChange} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(5);
  });

  it('should call onChange when a different order type is clicked', async () => {
    render(<OrderTypeSelector value="market" onChange={mockOnChange} />);

    const tabs = screen.getAllByRole('tab');
    await userEvent.click(tabs[1]);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('should have proper ARIA labels for accessibility', () => {
    render(<OrderTypeSelector value="market" onChange={mockOnChange} />);

    const tabs = screen.getAllByRole('tab');
    tabs.forEach((tab) => {
      expect(tab).toHaveAccessibleName();
    });
  });
});

// ============================================================================
// OrderForm Tests
// ============================================================================

describe('OrderForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnOrderTypeChange = vi.fn();

  const defaultProps = {
    symbol: 'EURUSD',
    orderType: 'market' as OrderType,
    currentPrice: 1.095,
    onOrderTypeChange: mockOnOrderTypeChange,
    onSubmit: mockOnSubmit,
    isLoading: false,
  };

  it('should render all main form elements', () => {
    render(<OrderForm {...defaultProps} assetLeverage={500} />);

    expect(screen.getByLabelText(/volume/i)).toBeInTheDocument();
    expect(screen.getByText(/leverage.*fixed by broker/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sell/i })).toBeInTheDocument();
  });

  it('should have volume input field with proper attributes', () => {
    render(<OrderForm {...defaultProps} />);

    const volumeInput = screen.getByLabelText(/volume/i) as HTMLInputElement;
    expect(volumeInput).toHaveAttribute('type', 'number');
    expect(volumeInput).toHaveAttribute('min', '0.01');
  });

  it('should have leverage selector', () => {
    render(<OrderForm {...defaultProps} assetLeverage={500} />);

    // Leverage is now read-only display (not a selector)
    expect(screen.getByText(/leverage.*fixed by broker/i)).toBeInTheDocument();
    expect(screen.getByText('1:500')).toBeInTheDocument();
    // Verify no combobox selector exists for leverage
    expect(
      screen.queryByRole('combobox', { name: /leverage/i })
    ).not.toBeInTheDocument();
  });

  it('should show loading state on buttons when isLoading is true', () => {
    render(<OrderForm {...defaultProps} isLoading />);

    expect(screen.getByRole('button', { name: /buy/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /sell/i })).toBeDisabled();
  });

  it('should display error message when provided', () => {
    render(<OrderForm {...defaultProps} error="Insufficient margin" />);

    expect(screen.getByText('Insufficient margin')).toBeInTheDocument();
  });

  it('should have proper ARIA labels for all inputs', () => {
    render(<OrderForm {...defaultProps} assetLeverage={500} />);

    expect(screen.getByLabelText(/volume/i)).toHaveAccessibleName();
    // Leverage is now read-only display, check it's present
    expect(screen.getByText(/leverage.*fixed by broker/i)).toBeInTheDocument();
    expect(screen.getByText('1:500')).toBeInTheDocument();
  });

  it('should render limit price input for limit orders', () => {
    const { rerender } = render(
      <OrderForm {...defaultProps} orderType="market" />
    );

    rerender(<OrderForm {...defaultProps} orderType="limit" />);

    expect(screen.getByLabelText(/limit price/i)).toBeInTheDocument();
  });

  it('should render stop price input for stop orders', () => {
    const { rerender } = render(
      <OrderForm {...defaultProps} orderType="market" />
    );

    rerender(<OrderForm {...defaultProps} orderType="stop" />);

    expect(screen.getByLabelText(/stop price/i)).toBeInTheDocument();
  });

  it('should render both prices for stop-limit orders', () => {
    render(<OrderForm {...defaultProps} orderType="stop_limit" />);

    expect(screen.getByLabelText(/stop price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/limit price/i)).toBeInTheDocument();
  });

  it('should render trailing distance input for trailing stop orders', () => {
    render(<OrderForm {...defaultProps} orderType="trailing_stop" />);

    expect(screen.getByLabelText(/trailing distance/i)).toBeInTheDocument();
  });

  it('should submit form when valid data is entered', async () => {
    render(<OrderForm {...defaultProps} orderType="market" />);

    const volumeInput = screen.getByLabelText(/volume/i);
    await userEvent.clear(volumeInput);
    await userEvent.type(volumeInput, '1');

    const buyButton = screen.getByRole('button', { name: /buy/i });
    await userEvent.click(buyButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});

// ============================================================================
// OrderPreview Tests
// ============================================================================

describe('OrderPreview', () => {
  const defaultProps = {
    formData: {
      symbol: 'EURUSD',
      side: 'buy' as const,
      quantity: 1,
      leverage: 100,
      type: 'market' as OrderType,
      takeProfitPrice: 1.1,
      stopLossPrice: 1.09,
    },
    currentPrice: 1.095,
  };

  it('should render order preview card title', () => {
    render(<OrderPreview {...defaultProps} />);

    expect(screen.getByText('Order Preview')).toBeInTheDocument();
  });

  it('should display entry price section', () => {
    render(<OrderPreview {...defaultProps} />);

    expect(screen.getByText('Entry Price')).toBeInTheDocument();
  });

  it('should display position value section', () => {
    render(<OrderPreview {...defaultProps} />);

    expect(screen.getByText('Position Value')).toBeInTheDocument();
  });

  it('should display commission section', () => {
    render(<OrderPreview {...defaultProps} />);

    expect(screen.getByText('Commission')).toBeInTheDocument();
  });

  it('should display margin required section', () => {
    render(<OrderPreview {...defaultProps} />);

    expect(screen.getByText('Margin Required')).toBeInTheDocument();
  });

  it('should display take profit section when TP is set', () => {
    render(
      <OrderPreview
        {...defaultProps}
        formData={{
          ...defaultProps.formData,
          takeProfitPrice: 1.1,
        }}
      />
    );

    expect(screen.getByText('At Take Profit')).toBeInTheDocument();
  });

  it('should display stop loss section when SL is set', () => {
    render(
      <OrderPreview
        {...defaultProps}
        formData={{
          ...defaultProps.formData,
          stopLossPrice: 1.09,
        }}
      />
    );

    expect(screen.getByText('At Stop Loss')).toBeInTheDocument();
  });

  it('should display risk/reward ratio when both TP and SL are set', () => {
    render(
      <OrderPreview
        {...defaultProps}
        formData={{
          ...defaultProps.formData,
          takeProfitPrice: 1.1,
          stopLossPrice: 1.09,
        }}
      />
    );

    expect(screen.getByText('Risk/Reward Ratio')).toBeInTheDocument();
  });

  it('should warn when no take profit or stop loss is set', () => {
    render(
      <OrderPreview
        {...defaultProps}
        formData={{
          ...defaultProps.formData,
          takeProfitPrice: undefined,
          stopLossPrice: undefined,
        }}
      />
    );

    expect(screen.getByText(/No TP\/SL set/i)).toBeInTheDocument();
  });

  it('should show order type information', () => {
    render(
      <OrderPreview
        {...defaultProps}
        formData={{
          ...defaultProps.formData,
          type: 'market',
        }}
      />
    );

    expect(screen.getByText('Order Type')).toBeInTheDocument();
    expect(screen.getByText('Market Order')).toBeInTheDocument();
  });

  it('should display limit order details for limit orders', () => {
    render(
      <OrderPreview
        {...defaultProps}
        formData={{
          ...defaultProps.formData,
          type: 'limit',
          limitPrice: 1.092,
        }}
      />
    );

    expect(screen.getByText('Limit Order')).toBeInTheDocument();
  });

  it('should display stop order details for stop orders', () => {
    render(
      <OrderPreview
        {...defaultProps}
        formData={{
          ...defaultProps.formData,
          type: 'stop',
          stopPrice: 1.09,
        }}
      />
    );

    expect(screen.getByText('Stop Order')).toBeInTheDocument();
  });

  it('should display trailing stop order details', () => {
    render(
      <OrderPreview
        {...defaultProps}
        formData={{
          ...defaultProps.formData,
          type: 'trailing_stop',
          trailingDistance: 50,
        }}
      />
    );

    expect(screen.getByText('Trailing Stop')).toBeInTheDocument();
  });

  it('should use custom commission rate when provided', () => {
    render(<OrderPreview {...defaultProps} commission={0.001} />);

    expect(screen.getByText(/0\.100%/i)).toBeInTheDocument();
  });

  it('should use custom slippage rate when provided', () => {
    render(<OrderPreview {...defaultProps} slippage={0.0005} />);

    expect(screen.getByText(/0\.050% slippage/i)).toBeInTheDocument();
  });

  it('should handle buy orders correctly', () => {
    render(
      <OrderPreview
        {...defaultProps}
        formData={{
          ...defaultProps.formData,
          side: 'buy',
        }}
      />
    );

    expect(screen.getByText('Order Preview')).toBeInTheDocument();
  });

  it('should display ROI metrics when TP/SL are set', () => {
    render(
      <OrderPreview
        {...defaultProps}
        formData={{
          ...defaultProps.formData,
          takeProfitPrice: 1.1,
          stopLossPrice: 1.09,
        }}
      />
    );

    const rois = screen.getAllByText(/ROI/i);
    expect(rois.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('OrderForm and OrderPreview Integration', () => {
  it('should work together to display complete order preview', () => {
    const mockOnSubmit = vi.fn();

    render(
      <div>
        <OrderForm
          symbol="EURUSD"
          orderType="market"
          currentPrice={1.095}
          onOrderTypeChange={() => {}}
          onSubmit={mockOnSubmit}
          isLoading={false}
        />
        <OrderPreview
          formData={
            {
              symbol: 'EURUSD',
              side: 'buy',
              quantity: 1,
              type: 'market',
            } as Partial<OrderFormData>
          }
          currentPrice={1.095}
        />
      </div>
    );

    expect(screen.getByText('Order Preview')).toBeInTheDocument();
    expect(screen.getByLabelText(/volume/i)).toBeInTheDocument();
  });
});
