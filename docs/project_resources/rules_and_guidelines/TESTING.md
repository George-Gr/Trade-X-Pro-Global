# Testing Guide

**Last Updated:** December 2025  
**Scope:** Trade-X-Pro-Global Test Architecture (Vitest + Jest + Playwright)

---

## 1. Testing Philosophy

This project enforces **100% business logic coverage** and **80% component coverage** to ensure reliability in financial trading operations.

### Coverage Targets by Category

| Category | Target | Type | Priority |
|----------|--------|------|----------|
| **Business Logic** | 100% | Unit | CRITICAL |
| **UI Components** | 80% | Unit + Integration | HIGH |
| **Hooks** | 95% | Unit | HIGH |
| **Edge Functions** | 100% | Unit | CRITICAL |
| **E2E User Flows** | Key paths | E2E | MEDIUM |

---

## 2. Test Structure

### 2.1 Directory Organization

```
src/
├── __tests__/
│   ├── lib/
│   │   ├── trading/
│   │   │   ├── orderMatching.test.ts
│   │   │   ├── marginCalculations.test.ts
│   │   │   └── liquidationEngine.test.ts
│   │   ├── kyc/
│   │   │   └── verification.test.ts
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.test.tsx
│   │   ├── useRealtimePositions.test.tsx
│   │   └── ...
│   └── components/
│       ├── trading/
│       │   ├── OrderForm.test.tsx
│       │   └── PositionList.test.tsx
│       └── ...
├── lib/trading/
│   ├── orderMatching.ts
│   ├── orderMatching.test.ts          # Co-located tests
│   ├── marginCalculations.ts
│   └── marginCalculations.test.ts
└── hooks/
    ├── useAuth.tsx
    ├── useRealtimePositions.tsx
    └── ...

# Playwright E2E tests
e2e/
├── auth.spec.ts
├── trading.spec.ts
├── portfolio.spec.ts
└── kyc.spec.ts
```

### 2.2 Test File Naming
- **Unit Tests**: `moduleName.test.ts` (co-located with source)
- **Component Tests**: `ComponentName.test.tsx`
- **E2E Tests**: `feature.spec.ts` (in `/e2e/`)
- **Integration Tests**: `featureName.integration.test.ts`

---

## 3. Unit Testing (Vitest)

### 3.1 Business Logic Tests (100% Required)

**Example: orderMatching.test.ts**
```typescript
import { describe, it, expect } from 'vitest';
import { executeMarketOrder, validateOrder } from '@/lib/trading/orderMatching';

describe('executeMarketOrder', () => {
  it('should execute a valid buy market order', () => {
    const order = {
      symbol: 'BTC/USD',
      side: 'buy' as const,
      size: 0.5,
      leverage: 2,
    };

    const result = executeMarketOrder(order);

    expect(result.status).toBe('filled');
    expect(result.executedPrice).toBeGreaterThan(0);
    expect(result.executedSize).toBe(0.5);
  });

  it('should reject orders exceeding max leverage', () => {
    const order = {
      symbol: 'BTC/USD',
      side: 'buy' as const,
      size: 1,
      leverage: 51, // Exceeds max of 50
    };

    expect(() => executeMarketOrder(order)).toThrow('Leverage exceeds maximum');
  });

  it('should calculate slippage correctly for large orders', () => {
    const largeOrder = { symbol: 'BTC/USD', side: 'buy' as const, size: 100, leverage: 1 };
    const smallOrder = { symbol: 'BTC/USD', side: 'buy' as const, size: 1, leverage: 1 };

    const largeFill = executeMarketOrder(largeOrder);
    const smallFill = executeMarketOrder(smallOrder);

    expect(largeFill.executedPrice).toBeGreaterThan(smallFill.executedPrice);
  });
});

describe('validateOrder', () => {
  it('should validate correct orders', () => {
    const valid = { symbol: 'BTC/USD', size: 1, leverage: 2 };
    expect(validateOrder(valid)).toBe(true);
  });

  it('should reject orders with missing symbol', () => {
    const invalid = { symbol: '', size: 1, leverage: 2 };
    expect(validateOrder(invalid)).toBe(false);
  });
});
```

### 3.2 Hook Tests (95% Required)

**Example: useAuth.test.tsx**
```typescript
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import * as supabaseClient from '@/lib/supabaseBrowserClient';

// Mock Supabase
vi.mock('@/lib/supabaseBrowserClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('should return authenticated user', async () => {
    const mockUser = { id: '123', email: 'test@example.com', role: 'user' };
    
    vi.mocked(supabaseClient.supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser } },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle logout', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });
});
```

### 3.3 Running Unit Tests

```bash
# Run all tests in watch mode
npm run test

# Run specific test file
npm run test orderMatching.test.ts

# Run with coverage report
npm run test -- --coverage

# Run UI mode (interactive)
npm run test:ui
```

---

## 4. Component Testing (React Testing Library)

### 4.1 Component Test Example

**Example: OrderForm.test.tsx**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { OrderForm } from '@/components/trading/OrderForm';
import { NotificationProvider } from '@/contexts/NotificationContext';

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <NotificationProvider>
      {component}
    </NotificationProvider>
  );
};

describe('OrderForm', () => {
  it('should render form fields', () => {
    renderWithProviders(<OrderForm />);

    expect(screen.getByLabelText(/symbol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/leverage/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OrderForm />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    expect(screen.getByText(/symbol is required/i)).toBeInTheDocument();
  });

  it('should submit valid form data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithProviders(<OrderForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/symbol/i), 'BTC/USD');
    await user.type(screen.getByLabelText(/size/i), '1');
    await user.type(screen.getByLabelText(/leverage/i), '2');

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          symbol: 'BTC/USD',
          size: 1,
          leverage: 2,
        })
      );
    });
  });

  it('should disable submit while submitting', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OrderForm />);

    const submitButton = screen.getByRole('button', { name: /submit/i });

    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});
```

### 4.2 Accessibility Testing

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('OrderForm Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<OrderForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels', () => {
    render(<OrderForm />);
    expect(screen.getByLabelText(/symbol/i)).toHaveAttribute('aria-required', 'true');
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<OrderForm />);

    await user.tab();
    expect(screen.getByLabelText(/symbol/i)).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/size/i)).toHaveFocus();
  });
});
```

---

## 5. Integration Testing

### 5.1 Real-time Subscription Integration

**Example: useRealtimePositions.integration.test.ts**
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRealtimePositions } from '@/hooks/useRealtimePositions';
import { supabase } from '@/lib/supabaseBrowserClient';

vi.mock('@/lib/supabaseBrowserClient');

describe('useRealtimePositions Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch initial positions and subscribe to updates', async () => {
    const mockPositions = [
      { id: '1', symbol: 'BTC/USD', size: 1, entryPrice: 50000 },
    ];

    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    };

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: mockPositions,
        error: null,
      }),
    } as any);

    vi.mocked(supabase.channel).mockReturnValue(mockChannel);

    const { result } = renderHook(() => useRealtimePositions('user-123'));

    await waitFor(() => {
      expect(result.current).toEqual(mockPositions);
    });

    // Verify subscription was created
    expect(supabase.channel).toHaveBeenCalledWith('positions:user-123');
  });

  it('should cleanup subscription on unmount', async () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    };

    vi.mocked(supabase.channel).mockReturnValue(mockChannel);
    vi.mocked(supabase.removeChannel).mockResolvedValue();

    const { unmount } = renderHook(() => useRealtimePositions('user-123'));

    unmount();

    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });
});
```

---

## 6. End-to-End Testing (Playwright)

### 6.1 E2E Test Structure

**Example: trading.spec.ts**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Trading Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button:has-text("Login")');
    await page.waitForURL('**/dashboard');
  });

  test('should place and execute a market order', async ({ page }) => {
    // Navigate to trading page
    await page.goto('http://localhost:5173/trading');

    // Fill order form
    await page.selectOption('select[name="symbol"]', 'BTC/USD');
    await page.fill('input[name="size"]', '0.5');
    await page.selectOption('select[name="side"]', 'buy');
    await page.fill('input[name="leverage"]', '2');

    // Submit order
    await page.click('button:has-text("Place Order")');

    // Wait for order confirmation
    await expect(page.locator('text=Order filled successfully')).toBeVisible();

    // Verify order in positions
    await page.goto('http://localhost:5173/portfolio/positions');
    await expect(page.locator('text=BTC/USD')).toBeVisible();
    await expect(page.locator('text=0.5')).toBeVisible();
  });

  test('should close a position with stop loss', async ({ page }) => {
    // Place position first (via API or UI)
    await page.goto('http://localhost:5173/portfolio/positions');

    // Find and open position
    const positionRow = page.locator('text=BTC/USD').first();
    await positionRow.click();

    // Set stop loss
    await page.fill('input[name="stopLoss"]', '45000');
    await page.click('button:has-text("Update Stop Loss")');

    // Verify update
    await expect(page.locator('text=Stop Loss updated')).toBeVisible();
  });

  test('should handle margin call correctly', async ({ page }) => {
    // Simulate margin call scenario
    // (May require API manipulation or specific test account setup)

    await page.goto('http://localhost:5173/portfolio/positions');

    // Monitor for margin call notification
    await expect(page.locator('[role="alert"]:has-text("Margin Call")')).toBeVisible({
      timeout: 10000, // Wait up to 10 seconds
    });

    // Verify liquidation dialog appears
    await expect(page.locator('text=Liquidation Warning')).toBeVisible();
  });
});
```

### 6.2 Running E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test trading.spec.ts

# Run in UI mode (interactive)
npx playwright test --ui

# Run headed (see browser)
npx playwright test --headed

# Debug single test
npx playwright test trading.spec.ts --debug
```

---

## 7. Performance Testing

### 7.1 Lighthouse CI

```bash
# Run Lighthouse locally
npm run build
npm run preview
npm run lighthouse
```

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

### 7.2 Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true npm run build

# View report
open dist/bundle-analysis.html
```

---

## 8. Test Data & Fixtures

### 8.1 Mock Data Factory

**Example: factories/orderFactory.ts**
```typescript
export const createMockOrder = (overrides = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  symbol: 'BTC/USD',
  side: 'buy',
  size: 1,
  leverage: 2,
  status: 'pending',
  createdAt: new Date(),
  ...overrides,
});

export const createMockPosition = (overrides = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  userId: 'user-123',
  symbol: 'BTC/USD',
  side: 'buy',
  size: 1,
  entryPrice: 50000,
  currentPrice: 50500,
  unrealizedPnL: 500,
  ...overrides,
});
```

### 8.2 Test Seeding

```typescript
// tests/setup.ts
import { beforeEach } from 'vitest';

beforeEach(async () => {
  // Clear test database before each test
  await supabase.from('orders').delete().neq('id', '');
  await supabase.from('positions').delete().neq('id', '');
});
```

---

## 9. CI/CD Integration

### 9.1 GitHub Actions Workflow

**Example: .github/workflows/test.yml**
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm install
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run test:e2e

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### 9.2 Coverage Reports

```bash
# Generate coverage
npm run test -- --coverage

# View HTML coverage report
open coverage/index.html
```

**Minimum Coverage by File Type:**
- Business Logic: 100%
- Components: 80%
- Hooks: 95%
- Utilities: 100%

---

## 10. Testing Best Practices

### 10.1 DO ✅

- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Keep tests focused (one assertion per test when possible)
- ✅ Mock external dependencies (Supabase, APIs)
- ✅ Clean up after tests (unsubscribe, clear mocks)
- ✅ Test error paths and edge cases
- ✅ Use factories for test data
- ✅ Verify cleanup in useEffect tests

### 10.2 DON'T ❌

- ❌ Test implementation details
- ❌ Use generic test names ("should work")
- ❌ Create interdependent tests
- ❌ Leave console.log in tests
- ❌ Test third-party libraries
- ❌ Forget to mock timers (jest.useFakeTimers())
- ❌ Test without cleanup
- ❌ Leave subscription mocks without unsubscribe

---

## 11. Common Testing Patterns

### 11.1 Testing Async Operations

```typescript
it('should handle async order submission', async () => {
  const { result } = renderHook(() => useOrderForm());

  await act(async () => {
    await result.current.submitOrder({ symbol: 'BTC/USD', size: 1 });
  });

  expect(result.current.status).toBe('success');
});
```

### 11.2 Testing Error Handling

```typescript
it('should show error when order fails', async () => {
  vi.mocked(supabase.from).mockRejectedValue(new Error('API Error'));

  const { result } = renderHook(() => useOrderForm());

  await act(async () => {
    try {
      await result.current.submitOrder({ symbol: 'BTC/USD', size: 1 });
    } catch (err) {
      // Expected
    }
  });

  expect(result.current.error).toBe('API Error');
});
```

### 11.3 Testing Realtime Updates

```typescript
it('should update on realtime message', async () => {
  const { result, rerender } = renderHook(() => useRealtimeData('id-123'));

  // Simulate realtime update
  act(() => {
    mockRealtimeCallback({ new: { id: 'id-123', value: 'updated' } });
  });

  rerender();

  await waitFor(() => {
    expect(result.current).toMatchObject({ value: 'updated' });
  });
});
```

---

## 12. Debugging Tests

### 12.1 Debug Mode

```bash
# Run test in debug mode
npm run test -- --inspect-brk

# Use Chrome DevTools
chrome://inspect
```

### 12.2 Print Debugging

```typescript
import { screen, debug } from '@testing-library/react';

it('should debug test', () => {
  render(<Component />);
  
  // Print all elements
  debug();

  // Print specific element
  debug(screen.getByText(/label/));
});
```

---

## 13. Resources

- **Vitest Docs**: https://vitest.dev/
- **React Testing Library**: https://testing-library.com/react
- **Playwright**: https://playwright.dev/
- **Testing Best Practices**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **Jest Matchers**: https://jestjs.io/docs/expect

---

**Questions?** See `/docs/` for more guides or email dev@trade-x-pro.dev
