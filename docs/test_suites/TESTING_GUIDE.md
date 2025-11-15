# Testing Quick Reference Guide

## 🚀 Running Tests

```bash
# Run all tests
npm test

# Run tests in UI mode
npm test:ui

# Run specific test file
npm test OrdersTable.test.tsx

# Run single test case
npm test -- -t "should render"

# Run tests once (no watch)
npm test -- --run

# Run with coverage
npm test -- --coverage
```

## 📁 Test File Structure

```
src/
├── components/
│   ├── trading/
│   │   └── __tests__/
│   │       ├── OrdersTable.test.tsx (Orders & Order components)
│   │       ├── PositionsGrid.test.tsx (Position components)
│   │       └── RiskManagement.test.tsx (Risk management components)
│   └── wallet/
│       └── __tests__/
│           └── Wallet.test.tsx (Wallet components)
```

## 📋 Test Files Overview

### 1. OrdersTable.test.tsx
**Tests:** 40+ tests for order-related components

**Components:**
- `OrderStatusBadge` - Status indicators
- `OrderRow` - Individual order rows
- `OrdersTable` - Main order table

**Key Tests:**
```typescript
// Status display
test('should render pending status with yellow color')
test('should display filled status with green color')

// Order details
test('should display filled/total quantity')
test('should show average fill price')
test('should display commission and slippage')

// Filters and sorting
test('should filter orders by status')
test('should filter orders by symbol search')
test('should sort orders by different columns')

// States
test('should show loading state')
test('should show empty state when no orders')
test('should show error state')
```

### 2. PositionsGrid.test.tsx
**Tests:** 45+ tests for position components

**Components:**
- `PositionCard` - Individual position card
- `PositionMetrics` - Position metrics display
- `PositionsGrid` - Grid layout

**Key Tests:**
```typescript
// Position display
test('should render position symbol')
test('should display position size and side')
test('should calculate unrealized P&L')

// Styling
test('should color profitable positions green')
test('should color losing positions red')
test('should color-code buy/sell sides')

// Filters and actions
test('should filter positions by symbol')
test('should filter positions by side')
test('should filter positions by profitability')
test('should call onClose when closing position')

// Utilities
test('should calculate unrealized P&L correctly')
test('should calculate P&L percentage correctly')
test('should return green color for profitable positions')
```

### 3. RiskManagement.test.tsx
**Tests:** 53+ tests for risk management components

**Components:**
- `RiskMetrics` - Risk metrics display
- `RiskGauge` - Risk gauge visualization
- `RiskLevelIndicator` - Risk level indicator
- `MarginMonitor` - Margin monitoring

**Key Tests:**
```typescript
// Risk metrics
test('should render all risk metrics')
test('should display maximum drawdown value')
test('should display Value at Risk (VaR)')

// Risk gauge
test('should show green color for low risk')
test('should show red color for critical risk')
test('should animate progress changes')

// Margin monitor
test('should display total balance')
test('should display margin level')
test('should show margin call warning')
test('should show stop out warning')
```

### 4. Wallet.test.tsx
**Tests:** 48+ tests for wallet components

**Components:**
- `WalletBalance` - Wallet balance display
- `WalletTransactionHistory` - Transaction history
- `WalletActions` - Action buttons

**Key Tests:**
```typescript
// Balance display
test('should display total balance amount')
test('should calculate available percentage')
test('should update balance in real-time')

// Transaction history
test('should display all transactions')
test('should color-code transaction types')
test('should filter by transaction type')
test('should search transactions by description')

// Actions
test('should call onDeposit when deposit clicked')
test('should call onWithdraw when withdraw clicked')
test('should disable withdraw when no balance')
```

## 🧪 Writing New Tests

### Basic Test Template
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render component', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const mockFn = vi.fn();
    
    render(<MyComponent onClick={mockFn} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Common Testing Patterns

#### Testing Rendering
```typescript
it('should render component with props', () => {
  render(<Component prop="value" />);
  expect(screen.getByText('value')).toBeInTheDocument();
});
```

#### Testing User Events
```typescript
it('should handle click', async () => {
  const user = userEvent.setup();
  const callback = vi.fn();
  
  render(<Button onClick={callback} />);
  
  await user.click(screen.getByRole('button'));
  expect(callback).toHaveBeenCalled();
});
```

#### Testing Async Operations
```typescript
it('should load data', async () => {
  render(<Component />);
  
  expect(screen.getByText('Loading')).toBeInTheDocument();
  
  const result = await screen.findByText('Loaded');
  expect(result).toBeInTheDocument();
});
```

#### Testing Conditional Rendering
```typescript
it('should show error when error prop is set', () => {
  const error = new Error('Failed');
  render(<Component error={error} />);
  expect(screen.getByText('Failed')).toBeInTheDocument();
});
```

## 🔍 Testing Queries

### Common Query Methods
```typescript
// Text content
screen.getByText('text')
screen.queryByText('text') // returns null if not found
screen.findByText('text') // async

// Role (preferred)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox')
screen.getByRole('heading', { level: 1 })

// Label
screen.getByLabelText('Username')

// Placeholder
screen.getByPlaceholderText('Enter text')

// Display value
screen.getByDisplayValue('current value')

// Test ID
screen.getByTestId('custom-id')
```

## 🎯 Testing Best Practices

### DO ✅
- Write tests that mimic user behavior
- Use semantic queries (getByRole, getByLabelText)
- Test user-facing functionality, not implementation
- Keep tests focused and isolated
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error states

### DON'T ❌
- Test implementation details
- Create test interdependencies
- Mock too much (only external APIs)
- Use generic IDs like `id="container"`
- Write overly complex tests
- Test library internals
- Ignore accessibility in tests

## 🐛 Debugging Tests

### View Test Details
```bash
# Run specific test
npm test -- -t "test name pattern"

# Watch mode (default)
npm test

# Debug in browser
npm test -- --inspect-brk
```

### Console Output in Tests
```typescript
it('should debug', () => {
  const element = screen.getByText('text');
  console.log(element); // See in test output
  screen.debug(element); // Pretty-print DOM
});
```

### Finding Elements
```typescript
// See all available queries
screen.logTestingPlaygroundURL();

// Get all matching elements
screen.getAllByRole('button')
```

## 📊 Test Coverage

### Generate Coverage Report
```bash
npm test -- --coverage
```

### Expected Coverage
- **Lines:** >80%
- **Functions:** >80%
- **Branches:** >75%
- **Statements:** >80%

## 🔗 Important Files

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Vitest configuration |
| `vitest.setup.ts` | Test setup (imports) |
| `package.json` | Test scripts |
| `TEST_SUITE_DOCUMENTATION.md` | Full documentation |

## 🚨 Common Issues

### Issue: Tests timeout
**Solution:** Increase timeout or check for unresolved promises
```typescript
it('test', async () => { ... }, 10000) // 10s timeout
```

### Issue: Element not found
**Solution:** Use `findBy*` for async elements
```typescript
const element = await screen.findByText('Async text');
```

### Issue: Mock not working
**Solution:** Ensure mock is set up before component renders
```typescript
const mock = vi.fn();
vi.mock('./module', () => ({ default: mock }));
```

### Issue: State not updating
**Solution:** Use `waitFor` for state updates
```typescript
await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testingjavascript.com/)
- [Jest Matchers](https://vitest.dev/api/#matchers)

## 💡 Tips & Tricks

### Run tests with GUI
```bash
npm test:ui
```

### Filter tests by name
```bash
npm test -- -t "wallet"
```

### Run single file
```bash
npm test src/components/trading/__tests__/OrdersTable.test.tsx
```

### Watch specific file
```bash
npm test -- --watch OrdersTable.test.tsx
```

### Check test coverage
```bash
npm test -- --coverage --run
```

## ✅ Checklist for New Tests

- [ ] Test name clearly describes what is tested
- [ ] Uses semantic queries (getByRole, getByLabelText)
- [ ] Tests user behavior, not implementation
- [ ] Includes mock data that's realistic
- [ ] Covers happy path and error cases
- [ ] No test interdependencies
- [ ] Component is isolated (no global state)
- [ ] Async operations handled properly
- [ ] Element cleanup/unmounting handled
- [ ] Test passes consistently
