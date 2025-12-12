# AI Agent Guidelines - TradePro v10

Comprehensive guidelines for AI coding agents (Copilot, Claude, etc.) working on the TradePro v10 codebase.

## Table of Contents

1. [Project Context](#project-context)
2. [Tech Stack Overview](#tech-stack-overview)
3. [Architecture Principles](#architecture-principles)
4. [Before Starting Any Task](#before-starting-any-task)
5. [Code Quality Standards](#code-quality-standards)
6. [Common Implementation Patterns](#common-implementation-patterns)
7. [Critical Constraints](#critical-constraints)
8. [Decision-Making Framework](#decision-making-framework)
9. [Task-Specific Workflows](#task-specific-workflows)
10. [Quality Checklist](#quality-checklist)

---

## Project Context

**TradePro v10** is a **broker-independent CFD trading platform** with these core features:

### Key Features
- **Multi-asset trading**: Forex, stocks, commodities, crypto, indices, ETFs, bonds
- **Paper trading**: Risk-free trading simulation
- **Social trading**: Copy verified traders with performance tracking
- **KYC/AML**: Multi-step verification with admin oversight
- **Risk management**: Margin calls, liquidation, position monitoring
- **Compliance**: GDPR, CCPA, AML policies with transparent fees
- **Educational**: Resources and community features

### Target Users
- Retail traders (paper and live trading)
- Social traders (copy trading followers)
- Professional traders (risk management, analytics)
- Admins (KYC oversight, risk dashboards)

### Project Maturity
- **Version**: 10.0 (stable foundation)
- **Status**: Active development with incremental improvements
- **Code Quality**: Intentionally loose TypeScript for incremental adoption
- **Team**: Open to Lovable AI-assisted design

---

## Tech Stack Overview

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite with SWC transpilation
- **UI**: shadcn-ui (Radix UI + Tailwind CSS v4)
- **State**: React Context + React Query + React Router v6
- **Forms**: React Hook Form + Zod validation
- **Charts**: TradingView Lightweight Charts + Recharts
- **CSS**: Tailwind CSS v4 with CSS variables for theming

### Backend & Database
- **Platform**: Supabase (managed PostgreSQL)
- **Auth**: Supabase Auth (JWT, magic links, OAuth, MFA)
- **Realtime**: Supabase Realtime (PostgreSQL subscriptions)
- **Edge Functions**: TypeScript functions on Supabase edge
- **Database**: PostgreSQL with Row-Level Security (RLS)

### Testing & Quality
- **Unit Tests**: Vitest + @testing-library/react
- **E2E Tests**: Playwright
- **Type Checking**: TypeScript (intentionally loose config)
- **Linting**: ESLint + TypeScript ESLint
- **Code Quality**: Prettier for formatting

### Environment Setup
- **Dev Server**: Vite on `localhost:5173`
- **Database**: Supabase cloud (managed PostgreSQL)
- **Type Generation**: Supabase auto-generates types via `npm run supabase:pull`
- **Package Manager**: npm 9.0+
- **Node Version**: 18.0.0+

---

## Architecture Principles

### 1. Feature-Based Organization

Group related code by business domain, not layer:

```
src/
├── components/auth/          # All auth-related components
├── components/trading/       # All trading UI components
├── components/kyc/           # All KYC UI components
├── hooks/useAuth.ts          # Auth hook (shared)
├── lib/kyc/                  # KYC business logic
├── lib/trading/              # Trading engine logic
└── pages/                    # Route pages
```

**Why?** Makes features self-contained and easier to find related code.

### 2. Separation of Concerns

- **Components**: UI rendering and user interaction only
- **Hooks**: State management and side effects
- **Services/Utils**: Business logic (trading engine, KYC, export)
- **Types**: Type definitions (never business logic)
- **Tests**: Co-located with source (`__tests__/`)

### 3. Single Responsibility

Each file should have one clear purpose:

```typescript
// ✅ Good: Single responsibility
// orderMatching.ts - Just order matching logic
export const executeOrder = (order: Order): ExecutionResult => { };

// marginCalculations.ts - Just margin calculations
export const calculateRequiredMargin = (leverage, size): number => { };

// ❌ Bad: Multiple responsibilities
// tradingEngine.ts - Everything at once
export const executeOrder = () => { };
export const calculateMargin = () => { };
export const calculateCommission = () => { };
export const checkLiquidation = () => { };
```

### 4. Data Flow Pattern

```
User Input
    ↓
Component (React Hook Form + Zod validation)
    ↓
Business Logic (lib/ services)
    ↓
Supabase API (via types)
    ↓
Real-time subscriptions (Realtime hooks)
    ↓
State update (useState/Context)
    ↓
UI re-render (React)
```

### 5. State Management Layers

**Layer 1: Local Component State**
```typescript
const [isOpen, setIsOpen] = useState(false);  // UI only
```

**Layer 2: Custom Hooks**
```typescript
const { user, logout } = useAuth();           // Cross-component
```

**Layer 3: Context (Global)**
```typescript
const { notifications } = useNotifications(); // App-wide
```

**Layer 4: React Query**
```typescript
const { data: orders } = useQuery(...);       // Server state
```

**Layer 5: Supabase Realtime**
```typescript
const positions = useRealtimePositions();     // Live data
```

---

## Before Starting Any Task

### 1. Understand the PRD

Read `PRD.md` first to understand feature requirements:
- What problem does it solve?
- Who are the users?
- What are the constraints?
- What's the success criteria?

### 2. Check Existing Implementation

Search for related features:
- Are there similar components?
- Does this feature already exist?
- What patterns were used?
- Any known issues or TODOs?

```bash
# Search for related code
grep -r "FeatureName" src/
grep -r "featureName" src/
grep -r "FEATURE_" src/

# Check docs for status
ls docs/tasks_and_implementations/
```

### 3. Review Task Documentation

Check if task is documented:
- `docs/tasks_and_implementations/` - Implementation status
- `docs/assessments_and_reports/` - Previous analysis
- `IMPLEMENTATION_ROADMAP.md` - Overall plan
- Comment in issue tracker

### 4. Identify Dependencies

Map dependencies before coding:
```
New Feature
├── Depends on: Auth system (useAuth)
├── Depends on: Supabase (positions table)
├── Depends on: UI components (Button, Card)
├── Requires new: Trading engine logic
└── Affects: Dashboard page
```

### 5. Verify RLS Policies

For database work, check Row-Level Security:
```sql
-- Must exist for new tables
CREATE POLICY "Users see only their data"
ON table_name
FOR SELECT
USING (auth.uid() = user_id);
```

---

## Code Quality Standards

### TypeScript Practices

**1. Use path aliases**
```typescript
// ✅ Good
import { Button } from '@/components/ui/button';

// ❌ Bad
import { Button } from '../../../components/ui/button';
```

**2. Import types explicitly**
```typescript
// ✅ Good
import type { Order } from '@/types';
import type { Database } from '@/integrations/supabase/types';

// ❌ Bad
import { Order } from '@/types'; // Should be type import
```

**3. Handle async errors**
```typescript
// ✅ Good
try {
  await riskyOperation();
} catch (error) {
  console.error('Failed:', error);
  throw new Error('Operation failed');
}

// ❌ Bad
const result = await riskyOperation(); // May throw unhandled
```

### React Component Quality

**1. Proper prop destructuring**
```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
}
export const CustomButton: React.FC<ButtonProps> = ({ label, onClick }) => { };

// ❌ Bad
export const CustomButton = (props: any) => props;
```

**2. Clean dependencies**
```typescript
// ✅ Good
useEffect(() => {
  const subscription = supabase.channel('x').subscribe();
  return () => subscription.unsubscribe(); // Cleanup
}, [userId]); // Minimal deps

// ❌ Bad
useEffect(() => {
  supabase.channel('x').subscribe(); // No cleanup = memory leak
}, []); // Empty deps, won't re-run
```

**3. Memoization discipline**
```typescript
// ✅ Only memoize when profiler proves it's needed
const expensiveValue = useMemo(() => calculate(data), [data]);

// ❌ Over-memoization
const name = useMemo(() => user.name, [user.name]);
```

### Test Coverage

**1. Unit tests for business logic**
```typescript
// Required for: trading engine, KYC logic, calculations
describe('OrderMatching', () => {
  it('should execute market orders immediately', () => {
    const result = executeOrder(marketOrder);
    expect(result.status).toBe('filled');
  });
});
```

**2. Component tests for UI**
```typescript
// Required for: forms, modals, complex interactions
describe('TradeForm', () => {
  it('should validate required fields', async () => {
    render(<TradeForm />);
    await user.click(screen.getByText('Submit'));
    expect(screen.getByText(/required/)).toBeInTheDocument();
  });
});
```

**3. Integration tests sparingly**
```typescript
// Use only for critical flows
describe('Order Flow', () => {
  it('should create order and update positions', async () => {
    // Full flow test
  });
});
```

---

## Common Implementation Patterns

### Pattern 1: Custom Hook with Realtime

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Position = Tables<'positions'>['Row'];

/**
 * useRealtimePositions - Subscribe to live position updates
 * Always unsubscribe in cleanup to prevent memory leaks
 */
export const useRealtimePositions = (userId: string | undefined) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    const fetchPositions = async () => {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', userId);

      if (!error) setPositions(data ?? []);
      setIsLoading(false);
    };

    fetchPositions();

    // Subscribe to changes
    const subscription = supabase
      .channel(`positions:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'positions', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPositions(prev => [...prev, payload.new as Position]);
          } else if (payload.eventType === 'UPDATE') {
            setPositions(prev =>
              prev.map(p => p.id === payload.new.id ? (payload.new as Position) : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setPositions(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // CRITICAL: Cleanup
    return () => subscription.unsubscribe();
  }, [userId]);

  return { positions, isLoading };
};
```

### Pattern 2: Form with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive(),
});

type FormInput = z.infer<typeof schema>;

export const MyForm: React.FC = () => {
  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await submitToServer(data);
      toast({ title: 'Success' });
    } catch (error) {
      toast({ title: 'Error', description: error.message });
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <input {...form.register('email')} />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}
      <button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
};
```

### Pattern 3: Business Logic Service

```typescript
import type { Order } from '@/types';

/**
 * Order matching engine
 * Handles market, limit, stop, and stop-limit order execution
 */

export const executeMarketOrder = (order: Order): ExecutionResult => {
  // Validate
  if (!order.symbol) throw new Error('Symbol required');
  if (order.size <= 0) throw new Error('Invalid size');

  // Calculate
  const executionPrice = getCurrentMarketPrice(order.symbol);
  const slippage = calculateSlippage(order.size);
  const finalPrice = executionPrice + slippage;

  // Execute
  return {
    status: 'filled',
    executedPrice: finalPrice,
    executedSize: order.size,
    timestamp: new Date(),
  };
};

export const executeLimitOrder = (order: Order): ExecutionResult => {
  const marketPrice = getCurrentMarketPrice(order.symbol);
  
  if (order.direction === 'buy' && marketPrice <= order.price) {
    return executeMarketOrder(order);
  } else if (order.direction === 'sell' && marketPrice >= order.price) {
    return executeMarketOrder(order);
  }

  return {
    status: 'pending',
    message: 'Waiting for price target',
  };
};
```

### Pattern 4: Error Boundary

```typescript
import React from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error);
    logger.error('Component error', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-destructive text-destructive-foreground rounded">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Critical Constraints

### DO
- ✅ Use `@/` path aliases
- ✅ Import Supabase types from `@/integrations/supabase/types`
- ✅ Unsubscribe from Realtime channels in cleanup
- ✅ Wrap async operations in try-catch
- ✅ Document complex business logic with comments
- ✅ Test trading engine logic thoroughly
- ✅ Handle all Supabase errors (`{ data, error }`)
- ✅ Use React Query for server state
- ✅ Extract shared logic to custom hooks
- ✅ Follow Tailwind utility-first approach
- ✅ Validate all user input with Zod
- ✅ Enable Row-Level Security on all tables
- ✅ Store secrets in environment variables only
- ✅ Sanitize user-generated content (DOMPurify)
- ✅ Log security-relevant events to audit logs
- ✅ Verify webhook signatures before processing
- ✅ Use HTTPS/TLS for all connections
- ✅ Hash passwords with bcrypt (Supabase handles this)
- ✅ Implement rate limiting for critical operations
- ✅ Use meaningful error messages without exposing internals

### DON'T
- ❌ Use hardcoded URLs or API keys
- ❌ Import Supabase from `@/lib/supabaseClient`
- ❌ Cache auth state outside React context
- ❌ Create new colors/sizes not in design system
- ❌ Use `any` type (use `unknown` and narrow)
- ❌ Forget RLS policies for new tables
- ❌ Make component files > 300 lines
- ❌ Drill props through 3+ component levels
- ❌ Use inline styles (use Tailwind + CSS variables)
- ❌ Leave `console.log()` in production code
- ❌ Store secrets in code, config files, or localStorage
- ❌ Log sensitive data (passwords, tokens, PII)
- ❌ Trust user input without validation
- ❌ Render user HTML without sanitization
- ❌ Modify Supabase types manually (auto-generated)
- ❌ Skip error handling on async operations
- ❌ Create new tables without RLS policies
- ❌ Expose internal error details to clients
- ❌ Use default credentials in production
- ❌ Disable HTTPS or TLS verification

### CRITICAL - Memory Leaks

```typescript
// ❌ BAD: Memory leak
useEffect(() => {
  supabase.channel('x').on(...).subscribe();
}, []);

// ✅ GOOD: Proper cleanup
useEffect(() => {
  const subscription = supabase.channel('x').on(...).subscribe();
  return () => subscription.unsubscribe();
}, []);

// ❌ BAD: Timer leak
useEffect(() => {
  setInterval(() => { }, 1000);
}, []);

// ✅ GOOD: Proper cleanup
useEffect(() => {
  const timer = setInterval(() => { }, 1000);
  return () => clearInterval(timer);
}, []);
```

---

## Decision-Making Framework

### When to Create a Custom Hook

**Create when:**
- Logic used in 2+ components
- Side effect needs cleanup
- Complex state management

**Don't create when:**
- Single-component use
- Just wrapping Supabase query
- Simple calculation

```typescript
// ✅ Create: Reusable across components
export const usePriceStream = (symbols: string[]) => {
  const [prices, setPrices] = useState({});
  useEffect(() => {
    // Subscribe to prices
    return () => { /* cleanup */ };
  }, [symbols]);
  return prices;
};

// ❌ Don't create: Single-use wrapper
// Instead: use directly in component
const { data } = await supabase.from('orders').select();
```

### When to Extract to Service

**Extract when:**
- Complex business logic (>50 lines)
- Tested independently
- Used by hooks/components

**Keep in component when:**
- Simple transformation
- UI-specific logic
- One-off calculation

```typescript
// ✅ Extract: Complex trading logic
export const calculateLiquidationPrice = (
  leverage: number,
  entryPrice: number,
  equity: number
): number => {
  // Complex calculation
};

// ❌ Keep in component: Simple filter
const filteredOrders = orders.filter(o => o.status === 'filled');
```

### When to Use Context

**Use Context when:**
- Data needed by many components (3+)
- Data rarely changes
- App-level state (user, theme, notifications)

**Don't use when:**
- Frequently updated (use React Query)
- Only used by 1-2 components
- Can pass as props

```typescript
// ✅ Use Context: App-wide notifications
export const useNotifications = () => useContext(NotificationContext);

// ❌ Don't use: Just pass as props
// Instead: <TradeForm error={error} />
```

### When to Use React Query

**Use React Query when:**
- Fetching from server
- Caching important
- Refetch on focus/interval
- Pagination/infinite scroll

**Don't use when:**
- Real-time data (use Realtime)
- Local component state
- Client-side only

```typescript
// ✅ Use React Query: Server data
const { data: orders } = useQuery({
  queryKey: ['orders', userId],
  queryFn: () => fetchOrders(userId),
});

// ❌ Don't use: Real-time data
// Instead: const positions = useRealtimePositions(userId);
```

---

## Task-Specific Workflows

### Adding a New Page

1. **Create file** in `src/pages/NewPage.tsx`
2. **Define route** in `App.tsx` with lazy loading
3. **Create hook** if needed in `src/hooks/`
4. **Create components** in `src/components/feature/`
5. **Add types** in `src/types/`
6. **Test** with component tests
7. **Add to navigation** if needed

### Adding a New Component

1. **Create file** in `src/components/feature/ComponentName.tsx`
2. **Define Props interface** with proper JSDoc
3. **Use shadcn primitives** for consistent styling
4. **Test with @testing-library/react**
5. **Export from index** (optional)
6. **Document variants** in Storybook (optional)

### Adding Database Table

1. **Create migration** in `supabase/migrations/`
2. **Define schema** with proper column types
3. **Add RLS policies** (critical!)
4. **Generate types** with `npm run supabase:pull`
5. **Create hooks** in `src/hooks/` for queries
6. **Test queries** with proper auth

### Implementing Feature

1. **Read PRD** section for requirements
2. **Check existing** similar features
3. **Design types** first
4. **Implement service/logic** with tests
5. **Build components** with validation
6. **Add Realtime** if needed
7. **Write docs** with examples
8. **Test end-to-end**

### Fixing Bug

1. **Reproduce** with minimal example
2. **Check error logs** and type definitions
3. **Add test** that fails (TDD)
4. **Fix implementation**
5. **Verify test passes**
6. **Check for similar** bugs elsewhere
7. **Document fix** if non-obvious

---

## Quality Checklist

### Before Submitting Any Code

**TypeScript**
- [ ] No `@ts-ignore` comments
- [ ] No `any` types (use `unknown` or proper types)
- [ ] Path aliases used (`@/`)
- [ ] Imports properly typed (`import type`)

**React**
- [ ] Functional components only
- [ ] Props destructured with types
- [ ] JSDoc documentation included
- [ ] Memoization only when profiled
- [ ] No prop drilling (3+ levels)

**State Management**
- [ ] Supabase types from `@/integrations/supabase/types`
- [ ] Realtime subscriptions unsubscribed in cleanup
- [ ] Error handling on async operations
- [ ] No stale auth state caching

**Styling**
- [ ] Tailwind utilities only (no inline styles)
- [ ] CSS variables for colors (no hardcoded hex)
- [ ] Responsive design tested (sm, md, lg breakpoints)
- [ ] Dark mode support included

**Forms**
- [ ] Zod schema defined first
- [ ] React Hook Form with zodResolver
- [ ] Field validation displayed
- [ ] Error states handled
- [ ] Loading state shown

**Testing**
- [ ] Business logic has unit tests
- [ ] Complex components have tests
- [ ] Tests use @testing-library/react
- [ ] Supabase mocked in tests
- [ ] All error cases covered

**Performance**
- [ ] No unnecessary renders (check Profiler)
- [ ] Lazy loading for large chunks
- [ ] No memory leaks (intervals, subscriptions)
- [ ] Efficient queries (only fetch needed columns)
- [ ] Debouncing for high-frequency updates

**Documentation**
- [ ] JSDoc on all exported functions
- [ ] Complex logic has inline comments
- [ ] README updated if needed
- [ ] Examples included for complex features
- [ ] Types clearly documented

**Security**
- [ ] No hardcoded secrets
- [ ] Proper error messages (no internal details)
- [ ] RLS policies verified for data
- [ ] Input validation via Zod
- [ ] CORS headers correct

**Database**
- [ ] RLS policies created
- [ ] Indexes on frequently-queried columns
- [ ] Migration properly tested
- [ ] Types regenerated (`npm run supabase:pull`)
- [ ] No N+1 queries

**Git**
- [ ] Meaningful commit messages
- [ ] No console.log() or debug code
- [ ] No commented-out code
- [ ] Files formatted (prettier/eslint)
- [ ] PR description explains changes

---

## File Structure Template

### New Component
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

/**
 * Component - Brief description
 * 
 * Longer explanation if needed.
 * 
 * @component
 * @example
 * return <Component label="Click me" onClick={handleClick} />
 */
export const Component: React.FC<ComponentProps> = ({ 
  label, 
  onClick,
  variant = 'primary',
}) => {
  return (
    <button 
      onClick={onClick}
      className={cn('px-4 py-2', variant === 'primary' && 'bg-primary')}
    >
      {label}
    </button>
  );
};
```

### New Hook
```typescript
import { useEffect, useState } from 'react';

/**
 * useCustomHook - Description of what hook does
 * 
 * @param param - Parameter description
 * @returns Object with { data, isLoading, error }
 */
export const useCustomHook = (param: string) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchFromServer(param);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [param]);

  return { data, isLoading, error };
};
```

### New Service
```typescript
import type { Order } from '@/types';

/**
 * Trading engine service
 * Handles order execution, matching, and validation
 * 
 * All operations are pure functions (no side effects)
 * Unit tested with comprehensive edge cases
 */

export const validateOrder = (order: Order): boolean => {
  if (!order.symbol) return false;
  if (order.size <= 0) return false;
  if (order.leverage > MAX_LEVERAGE) return false;
  return true;
};

export const executeOrder = (order: Order): ExecutionResult => {
  if (!validateOrder(order)) {
    throw new Error('Invalid order');
  }
  
  // Implementation
  return { status: 'filled' };
};
```

---

## Common Mistakes to Avoid

### 1. Forgetting Cleanup
```typescript
// ❌ BAD
useEffect(() => {
  const sub = supabase.channel('x').subscribe();
}, []);

// ✅ GOOD
useEffect(() => {
  const sub = supabase.channel('x').subscribe();
  return () => sub.unsubscribe();
}, []);
```

### 2. Wrong Supabase Import
```typescript
// ❌ BAD
import { supabase } from '@/lib/supabaseClient';

// ✅ GOOD
import { supabase } from '@/integrations/supabase/client';
```

### 3. Stale Auth
```typescript
// ❌ BAD
const user = getUser(); // Cached

// ✅ GOOD
const { user } = useAuth(); // Fresh
```

### 4. Missing Error Handling
```typescript
// ❌ BAD
const data = await query();

// ✅ GOOD
const { data, error } = await query();
if (error) throw error;
```

### 5. Untyped Props
```typescript
// ❌ BAD
export const Component = (props: any) => { };

// ✅ GOOD
interface ComponentProps { }
export const Component: React.FC<ComponentProps> = ({ }) => { };
```

### 6. Hardcoded Values
```typescript
// ❌ BAD
const url = 'https://api.example.com';

// ✅ GOOD
const url = import.meta.env.VITE_API_URL;
```

### 7. Over-Memoization
```typescript
// ❌ BAD
const name = useMemo(() => user.name, [user.name]);

// ✅ GOOD: Only when profiler proves needed
const expensiveValue = useMemo(() => { }, [dep]);
```

### 8. Large Files
```typescript
// ❌ BAD: 500+ line component
// ✅ GOOD: Split into smaller components
// File: DashboardPage.tsx (main page)
// File: DashboardHeader.tsx (sub-component)
// File: DashboardContent.tsx (sub-component)
```

### 9. Prop Drilling
```typescript
// ❌ BAD: Drilling through 5 levels
<Parent user={user} theme={theme} orders={orders} />

// ✅ GOOD: Use Context
const { user } = useAuth();
const { theme } = useTheme();
```

### 10. Console Logs in Production
```typescript
// ❌ BAD
console.log('Debug:', user);

// ✅ GOOD: Use logger (removed in prod)
logger.debug('User loaded', { userId: user.id });
```

---

## Quick Reference

### Directory Structure
```
src/
├── components/ui/          # shadcn-ui primitives
├── components/auth/        # Feature components
├── hooks/                  # Custom React hooks
├── lib/trading/            # Trading engine logic
├── lib/kyc/                # KYC business logic
├── pages/                  # Route pages
├── types/                  # TypeScript definitions
├── contexts/               # Global state
├── integrations/supabase/  # Auto-generated
└── assets/                 # Images, icons
```

### Key Commands
```bash
npm run dev                  # Start dev server
npm run build               # Build for production
npm run lint                # Run ESLint
npm run test                # Run tests
npm test:ui                 # Interactive test UI
npm run supabase:push       # Deploy migrations
ANALYZE=true npm run build  # Analyze bundle
```

### Important Files
- `PRD.md` — Feature specifications
- `ARCHITECTURE_DECISIONS.md` — 9 key architectural decisions
- `STYLE_GUIDE.md` — Code standards and conventions
- `SECURITY.md` — Security standards and compliance (READ BEFORE CODING)
- `ACCESSIBILITY_STANDARDS.md` — WCAG 2.1 AA requirements
- `tsconfig.json` — TypeScript config (intentionally loose)
- `vite.config.ts` — Build config
- `tailwind.config.ts` — Design system tokens
- `supabase/migrations/` — Database schema and RLS policies
- `docs/PRIMARY/QUICK_START.md` — 30-minute onboarding guide
- `src/integrations/supabase/types.ts` — Auto-generated Supabase types

---

## When to Ask for Help

Ask before implementing if:

- [ ] Feature is not in PRD
- [ ] Similar feature already exists (might have conflicts)
- [ ] Requires changes to database schema
- [ ] Affects multiple features
- [ ] Unknown tech pattern for this project
- [ ] Unclear requirements
- [ ] Performance implications
- [ ] Security implications
- [ ] Breaking changes needed

---

## Resources

- **PRD**: `/workspaces/Trade-X-Pro-Global/PRD.md`
- **Style Guide**: `/workspaces/Trade-X-Pro-Global/STYLE_GUIDE.md`
- **Copilot Instructions**: `/.github/copilot-instructions.md`
- **Task Tracking**: `/docs/tasks_and_implementations/`
- **Assessment Reports**: `/docs/assessments_and_reports/`

---

## Success Criteria for AI Agents

Your contribution is successful when:

1. ✅ Code follows all STYLE_GUIDE.md patterns
2. ✅ All tests pass (`npm run test`)
3. ✅ No TypeScript errors (`npm run lint`)
4. ✅ No Supabase type mismatches
5. ✅ Memory leaks prevented (proper cleanup)
6. ✅ Error handling comprehensive
7. ✅ Performance acceptable (Profiler check)
8. ✅ Security verified (no secrets exposed)
9. ✅ Documentation included (JSDoc + examples)
10. ✅ Feature tested end-to-end

**Ship with confidence!** 🚀
