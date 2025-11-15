# Test Suite Examples & Code Patterns

## Overview
This file shows concrete examples from the comprehensive test suite to help developers understand the testing patterns and approach used.

---

## 1. Order Components Testing Examples

### OrderStatusBadge Component Tests

```typescript
// Basic rendering test
it('should render pending status with yellow color', () => {
  render(<OrderStatusBadge status="pending" />);
  const badge = screen.getByText('Pending');
  expect(badge).toBeInTheDocument();
  expect(badge.closest('[class*="bg-yellow"]')).toBeInTheDocument();
});

// Testing with props
it('should display fill percentage for partially filled orders', () => {
  render(<OrderStatusBadge status="partially_filled" fillPercentage={50} />);
  expect(screen.getByText(/Partial \(50%\)/)).toBeInTheDocument();
});

// Testing timestamps
it('should include timestamp in tooltip', () => {
  const timestamp = new Date('2025-11-14T10:00:00');
  render(<OrderStatusBadge status="open" timestamp={timestamp} />);
  const badge = screen.getByText('Open').closest('div');
  expect(badge).toHaveAttribute('title', expect.stringContaining('10:00:00'));
});
```

### OrderRow Component Tests

```typescript
// Mock data setup
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

// Render and verify order details
it('should render order details', () => {
  render(<OrderRow order={mockOrder} />);
  expect(screen.getByText('EURUSD')).toBeInTheDocument();
  expect(screen.getByText(/Limit/)).toBeInTheDocument();
  expect(screen.getByText(/BUY/)).toBeInTheDocument();
});

// Test callbacks
it('should call onModify when modify action clicked', async () => {
  const user = userEvent.setup();
  const mockOnModify = vi.fn();
  render(<OrderRow order={mockOrder} onModify={mockOnModify} />);

  const moreButton = screen.getByRole('button', { name: '' }).parentElement
    ?.querySelector('button:last-child');
  if (moreButton) {
    await user.click(moreButton);
    const modifyOption = await screen.findByText('Modify');
    await user.click(modifyOption);
    expect(mockOnModify).toHaveBeenCalled();
  }
});

// Test color coding
it('should color code buy/sell sides', () => {
  render(<OrderRow order={mockOrder} />);
  const buyText = screen.getByText('BUY');
  expect(buyText).toHaveClass('text-blue-600');

  const { unmount } = render(
    <OrderRow order={{ ...mockOrder, side: 'sell' }} />
  );
  const sellText = screen.getByText('SELL');
  expect(sellText).toHaveClass('text-orange-600');
  unmount();
});
```

### OrdersTable Component Tests

```typescript
// Mock multiple orders
const mockOrders: Order[] = [
  {
    id: 'order-1',
    symbol: 'EURUSD',
    type: 'market',
    side: 'buy',
    quantity: 100,
    filled_quantity: 100,
    price: 1.0850,
    status: 'filled',
    created_at: new Date('2025-11-14T10:00:00'),
    updated_at: new Date('2025-11-14T10:00:00'),
    commission: 10,
    realized_pnl: 50,
  },
  // ... more orders
];

// Test rendering
it('should render orders table with all orders', () => {
  render(<OrdersTable orders={mockOrders} />);
  expect(screen.getByText('EURUSD')).toBeInTheDocument();
  expect(screen.getByText('GBPUSD')).toBeInTheDocument();
});

// Test filtering
it('should filter orders by status', async () => {
  const user = userEvent.setup();
  render(<OrdersTable orders={mockOrders} />);

  const statusSelect = screen.getByDisplayValue('All Statuses');
  await user.click(statusSelect);
  const filledOption = await screen.findByText(/Filled/);
  await user.click(filledOption);

  // Should only show filled order
  expect(screen.getByText('EURUSD')).toBeInTheDocument();
  expect(screen.queryByText('GBPUSD')).not.toBeInTheDocument();
});

// Test search functionality
it('should filter orders by symbol search', async () => {
  const user = userEvent.setup();
  render(<OrdersTable orders={mockOrders} />);

  const searchInput = screen.getByPlaceholderText('Search by symbol...');
  await user.type(searchInput, 'EUR');

  // Should only show EURUSD order
  expect(screen.getByText('EURUSD')).toBeInTheDocument();
  expect(screen.queryByText('GBPUSD')).not.toBeInTheDocument();
});

// Test empty and error states
it('should show empty state when no orders', () => {
  render(<OrdersTable orders={[]} />);
  expect(screen.getByText(/No orders yet/)).toBeInTheDocument();
});

it('should show error state', () => {
  const error = new Error('Failed to load orders');
  render(<OrdersTable orders={[]} error={error} />);
  expect(screen.getByText(/Error loading orders/)).toBeInTheDocument();
});
```

---

## 2. Position Components Testing Examples

### PositionCard Component Tests

```typescript
// Mock position data
const mockPosition: Position = {
  id: 'pos-123',
  symbol: 'EURUSD',
  quantity: 100,
  entry_price: 1.0850,
  current_price: 1.0900,
  side: 'long',
  opened_at: new Date('2025-11-10T10:00:00'),
  leverage: 10,
  margin_used: 1000,
};

// Test P&L calculations
it('should calculate and show unrealized P&L', () => {
  render(<PositionCard position={mockPosition} />);
  // (1.0900 - 1.0850) * 100 = 0.5
  expect(screen.getByText(/\$0.50/)).toBeInTheDocument();
});

// Test color coding based on profitability
it('should show P&L in green for profitable position', () => {
  render(<PositionCard position={mockPosition} />);
  const pnlElement = screen.getByText(/\$0.50/);
  expect(pnlElement).toHaveClass('text-green-600');
});

it('should show P&L in red for losing position', () => {
  const losingPosition: Position = {
    ...mockPosition,
    current_price: 1.0800,
  };
  render(<PositionCard position={losingPosition} />);
  const pnlElement = screen.getByText(/-\$0.50/);
  expect(pnlElement).toHaveClass('text-red-600');
});

// Test additional position features
it('should display stop loss level if set', () => {
  const positionWithSL: Position = {
    ...mockPosition,
    stop_loss: 1.0800,
  };
  render(<PositionCard position={positionWithSL} />);
  expect(screen.getByText('SL: 1.0800')).toBeInTheDocument();
});

it('should display take profit level if set', () => {
  const positionWithTP: Position = {
    ...mockPosition,
    take_profit: 1.1000,
  };
  render(<PositionCard position={positionWithTP} />);
  expect(screen.getByText('TP: 1.1000')).toBeInTheDocument();
});

// Test user actions
it('should call onClose callback when close button clicked', async () => {
  const user = userEvent.setup();
  const mockOnClose = vi.fn();
  render(<PositionCard position={mockPosition} onClose={mockOnClose} />);

  const closeButton = screen.getByRole('button', { name: /Close/i });
  await user.click(closeButton);
  expect(mockOnClose).toHaveBeenCalledWith(mockPosition.id);
});
```

### PositionsGrid Component Tests

```typescript
// Multiple positions for filtering tests
const mockPositions: Position[] = [
  {
    id: 'pos-1',
    symbol: 'EURUSD',
    quantity: 100,
    entry_price: 1.0850,
    current_price: 1.0900,
    side: 'long',
    opened_at: new Date('2025-11-10T10:00:00'),
    leverage: 10,
    margin_used: 1000,
  },
  {
    id: 'pos-2',
    symbol: 'GBPUSD',
    quantity: 50,
    entry_price: 1.2800,
    current_price: 1.2750,
    side: 'short',
    opened_at: new Date('2025-11-11T14:30:00'),
    leverage: 5,
    margin_used: 2000,
  },
];

// Test filtering
it('should filter positions by symbol', async () => {
  const user = userEvent.setup();
  render(<PositionsGrid positions={mockPositions} />);

  const searchInput = screen.getByPlaceholderText('Search by symbol...');
  await user.type(searchInput, 'EUR');

  expect(screen.getByText('EURUSD')).toBeInTheDocument();
  expect(screen.queryByText('GBPUSD')).not.toBeInTheDocument();
});

// Test filtering by side
it('should filter positions by side (long/short)', async () => {
  const user = userEvent.setup();
  render(<PositionsGrid positions={mockPositions} />);

  const sideSelect = screen.getByDisplayValue('All Sides');
  await user.click(sideSelect);
  const longOption = await screen.findByText(/Long/);
  await user.click(longOption);

  expect(screen.getByText('EURUSD')).toBeInTheDocument();
  expect(screen.queryByText('GBPUSD')).not.toBeInTheDocument();
});
```

---

## 3. Risk Management Components Testing Examples

### RiskMetrics Component Tests

```typescript
// Mock risk data
const mockRiskMetrics: RiskMetricsData = {
  maxDrawdown: 5.5,
  VAR_95: 2500,
  sharpeRatio: 1.8,
  winRate: 65,
  profitFactor: 2.1,
  riskRewardRatio: 1.5,
  avgWinLoss: 1.8,
  maxConsecutiveLosses: 3,
  riskPerTrade: 2,
  portfolioRisk: 8.5,
};

// Test metric display
it('should render all risk metrics', () => {
  render(<RiskMetrics metrics={mockRiskMetrics} />);
  expect(screen.getByText(/Max Drawdown/)).toBeInTheDocument();
  expect(screen.getByText(/Sharpe Ratio/)).toBeInTheDocument();
  expect(screen.getByText(/Win Rate/)).toBeInTheDocument();
});

it('should display maximum drawdown value', () => {
  render(<RiskMetrics metrics={mockRiskMetrics} />);
  expect(screen.getByText('5.50%')).toBeInTheDocument();
});

// Test color coding based on severity
it('should color drawdown based on severity', () => {
  render(<RiskMetrics metrics={mockRiskMetrics} />);
  const drawdownElement = screen.getByText('5.50%');
  expect(drawdownElement).toHaveClass('text-yellow-600');
});

it('should show warning color for high drawdown', () => {
  const highDrawdownMetrics: RiskMetricsData = {
    ...mockRiskMetrics,
    maxDrawdown: 15,
  };
  render(<RiskMetrics metrics={highDrawdownMetrics} />);
  const drawdownElement = screen.getByText('15.00%');
  expect(drawdownElement).toHaveClass('text-red-600');
});
```

### MarginMonitor Component Tests

```typescript
// Margin data
const mockMarginData = {
  totalBalance: 100000,
  usedMargin: 60000,
  availableMargin: 40000,
  marginLevel: 166.67,
  marginCallLevel: 50,
  stopOutLevel: 20,
};

// Test margin display
it('should render margin monitor component', () => {
  render(<MarginMonitor {...mockMarginData} />);
  expect(screen.getByText(/Margin Status/)).toBeInTheDocument();
});

it('should display total balance', () => {
  render(<MarginMonitor {...mockMarginData} />);
  expect(screen.getByText(/\$100,000.00/)).toBeInTheDocument();
});

// Test margin level color coding
it('should show healthy margin level in green', () => {
  render(<MarginMonitor {...mockMarginData} />);
  const marginLevel = screen.getByText('166.67%');
  expect(marginLevel).toHaveClass('text-green-600');
});

it('should show warning margin level in yellow', () => {
  const warningMargin = {
    ...mockMarginData,
    marginLevel: 100,
    usedMargin: 90000,
    availableMargin: 10000,
  };
  render(<MarginMonitor {...warningMargin} />);
  const marginLevel = screen.getByText('100.00%');
  expect(marginLevel).toHaveClass('text-yellow-600');
});

// Test warnings
it('should show margin call warning', () => {
  const warningMargin = {
    ...mockMarginData,
    marginLevel: 45,
    usedMargin: 97000,
    availableMargin: 3000,
  };
  render(<MarginMonitor {...warningMargin} />);
  expect(screen.getByText(/Margin call/)).toBeInTheDocument();
});

// Test actions
it('should call onAddMargin when button clicked', async () => {
  const user = userEvent.setup();
  const mockOnAddMargin = vi.fn();
  render(<MarginMonitor {...mockMarginData} onAddMargin={mockOnAddMargin} />);

  const addButton = screen.getByRole('button', { name: /Add Margin/i });
  await user.click(addButton);
  expect(mockOnAddMargin).toHaveBeenCalled();
});
```

---

## 4. Wallet Components Testing Examples

### WalletBalance Component Tests

```typescript
// Mock wallet data
const mockWalletData: WalletData = {
  totalBalance: 50000,
  availableBalance: 40000,
  reservedBalance: 10000,
  currency: 'USD',
  lastUpdated: new Date(),
};

// Test balance display
it('should render wallet balance component', () => {
  render(<WalletBalance wallet={mockWalletData} />);
  expect(screen.getByText(/Total Balance/)).toBeInTheDocument();
});

it('should display total balance amount', () => {
  render(<WalletBalance wallet={mockWalletData} />);
  expect(screen.getByText(/\$50,000.00/)).toBeInTheDocument();
});

// Test calculations
it('should calculate available percentage correctly', () => {
  render(<WalletBalance wallet={mockWalletData} />);
  // 40000 / 50000 = 80%
  expect(screen.getByText('80%')).toBeInTheDocument();
});

// Test real-time updates
it('should update balance in real-time', () => {
  const { rerender } = render(<WalletBalance wallet={mockWalletData} />);

  const updatedWallet: WalletData = {
    ...mockWalletData,
    totalBalance: 55000,
    availableBalance: 45000,
  };

  rerender(<WalletBalance wallet={updatedWallet} />);
  expect(screen.getByText(/\$55,000.00/)).toBeInTheDocument();
});
```

### WalletTransactionHistory Component Tests

```typescript
// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    type: 'deposit',
    amount: 5000,
    currency: 'USD',
    status: 'completed',
    timestamp: new Date('2025-11-14T10:00:00'),
    description: 'Bank transfer deposit',
    method: 'bank_transfer',
  },
  {
    id: 'txn-2',
    type: 'withdrawal',
    amount: 2000,
    currency: 'USD',
    status: 'pending',
    timestamp: new Date('2025-11-14T11:00:00'),
    description: 'Withdrawal to bank account',
    method: 'bank_transfer',
  },
];

// Test transaction display
it('should render transaction history', () => {
  render(<WalletTransactionHistory transactions={mockTransactions} />);
  expect(screen.getByText(/Transaction History/)).toBeInTheDocument();
});

it('should display all transactions', () => {
  render(<WalletTransactionHistory transactions={mockTransactions} />);
  expect(screen.getByText(/Bank transfer deposit/)).toBeInTheDocument();
  expect(screen.getByText(/Withdrawal to bank account/)).toBeInTheDocument();
});

// Test filtering
it('should filter transactions by type', async () => {
  const user = userEvent.setup();
  render(<WalletTransactionHistory transactions={mockTransactions} />);

  const filterSelect = screen.getByDisplayValue('All Types');
  await user.click(filterSelect);
  const depositOption = await screen.findByText(/Deposit/);
  await user.click(depositOption);

  expect(screen.getByText(/Bank transfer deposit/)).toBeInTheDocument();
  expect(screen.queryByText(/Withdrawal to bank account/)).not.toBeInTheDocument();
});

// Test search
it('should search transactions by description', async () => {
  const user = userEvent.setup();
  render(<WalletTransactionHistory transactions={mockTransactions} />);

  const searchInput = screen.getByPlaceholderText('Search transactions...');
  await user.type(searchInput, 'Withdrawal');

  expect(screen.getByText(/Withdrawal to bank account/)).toBeInTheDocument();
  expect(screen.queryByText(/Bank transfer deposit/)).not.toBeInTheDocument();
});
```

### WalletActions Component Tests

```typescript
// Test button rendering
it('should render wallet actions buttons', () => {
  render(<WalletActions />);
  expect(screen.getByRole('button', { name: /Deposit/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Withdraw/i })).toBeInTheDocument();
});

// Test callbacks
it('should call onDeposit when deposit clicked', async () => {
  const user = userEvent.setup();
  const mockOnDeposit = vi.fn();
  render(<WalletActions onDeposit={mockOnDeposit} />);

  const depositButton = screen.getByRole('button', { name: /Deposit/i });
  await user.click(depositButton);
  expect(mockOnDeposit).toHaveBeenCalled();
});

// Test disabled states
it('should disable withdraw button when no balance', () => {
  render(<WalletActions availableBalance={0} />);
  const withdrawButton = screen.getByRole('button', { name: /Withdraw/i });
  expect(withdrawButton).toBeDisabled();
});
```

---

## 5. Utility Function Testing Examples

### Position P&L Calculations

```typescript
// Utility function tests
describe('calculateUnrealizedPnL', () => {
  it('should calculate positive P&L for long positions', () => {
    const pnl = calculateUnrealizedPnL({
      side: 'long',
      quantity: 100,
      entry_price: 1.0850,
      current_price: 1.0900,
    });
    expect(pnl).toBe(0.5); // (1.0900 - 1.0850) * 100
  });

  it('should calculate positive P&L for short positions', () => {
    const pnl = calculateUnrealizedPnL({
      side: 'short',
      quantity: 100,
      entry_price: 1.0900,
      current_price: 1.0850,
    });
    expect(pnl).toBe(0.5); // (1.0900 - 1.0850) * 100
  });

  it('should return zero for no price change', () => {
    const pnl = calculateUnrealizedPnL({
      side: 'long',
      quantity: 100,
      entry_price: 1.0850,
      current_price: 1.0850,
    });
    expect(pnl).toBe(0);
  });
});

// P&L percentage tests
describe('calculatePnLPercentage', () => {
  it('should calculate P&L percentage correctly', () => {
    const percentage = calculatePnLPercentage({
      entry_price: 1.0850,
      current_price: 1.0900,
      leverage: 1,
    });
    expect(percentage).toBeCloseTo(0.46, 1);
  });

  it('should account for leverage in calculation', () => {
    const percentage = calculatePnLPercentage({
      entry_price: 1.0850,
      current_price: 1.0900,
      leverage: 10,
    });
    expect(percentage).toBeGreaterThan(4.6);
  });
});

// Color coding tests
describe('getPositionColor', () => {
  it('should return green for profitable long positions', () => {
    const color = getPositionColor({
      side: 'long',
      entry_price: 1.0850,
      current_price: 1.0900,
    });
    expect(color).toBe('green');
  });

  it('should return gray for breakeven positions', () => {
    const color = getPositionColor({
      side: 'long',
      entry_price: 1.0850,
      current_price: 1.0850,
    });
    expect(color).toBe('gray');
  });
});
```

---

## Testing Patterns Summary

### Pattern 1: Basic Rendering
```typescript
it('should render component', () => {
  render(<Component />);
  expect(screen.getByText('Expected')).toBeInTheDocument();
});
```

### Pattern 2: User Interaction
```typescript
it('should handle click', async () => {
  const user = userEvent.setup();
  const callback = vi.fn();
  render(<Component onClick={callback} />);
  
  await user.click(screen.getByRole('button'));
  expect(callback).toHaveBeenCalled();
});
```

### Pattern 3: Form Input
```typescript
it('should update on input', async () => {
  const user = userEvent.setup();
  render(<Component />);
  
  const input = screen.getByPlaceholderText('Enter text');
  await user.type(input, 'test');
  expect(input).toHaveValue('test');
});
```

### Pattern 4: Async Operations
```typescript
it('should load data', async () => {
  render(<Component />);
  
  expect(screen.getByText('Loading')).toBeInTheDocument();
  const result = await screen.findByText('Loaded');
  expect(result).toBeInTheDocument();
});
```

### Pattern 5: Conditional Rendering
```typescript
it('should show error', () => {
  const error = new Error('Failed');
  render(<Component error={error} />);
  expect(screen.getByText('Failed')).toBeInTheDocument();
});
```

---

## Conclusion

These examples demonstrate:
- ✅ Comprehensive testing of React components
- ✅ Testing user interactions and callbacks
- ✅ Testing state changes and calculations
- ✅ Testing edge cases and error conditions
- ✅ Using semantic queries (getByRole, getByPlaceholderText)
- ✅ Following testing best practices
- ✅ Clear, readable test code

For more examples, refer to the actual test files in `src/components/*/__ tests__/`.
