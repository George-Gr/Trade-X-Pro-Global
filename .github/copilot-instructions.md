# AI Coding Agent Instructions for TradePro v10

**Version:** 2.0 (Updated Nov 2025)  
**Purpose:** Guide AI agents to be immediately productive on this CFD trading simulation platform

---

## Project Overview & Context

**TradePro v10** is a **broker-independent CFD trading simulation platform** combining:
- Multi-asset trading (forex, stocks, commodities, crypto, indices, ETFs, bonds)
- Paper trading with unlimited virtual capital
- Social copy trading with verified trader network
- KYC/AML verification with admin oversight
- Risk management (margin calls, liquidation, position monitoring)
- Enterprise compliance (GDPR, CCPA, AML)

**Core Value:** Transparent, unlimited practice trading + community learning (no demo expiry, no forced resets)

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite (intentionally loose types: `noImplicitAny: false`, `strictNullChecks: false`)
- **UI**: shadcn-ui (Radix UI + Tailwind CSS v4 with CSS variables)
- **Backend/Database**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **State Management**: React Context (auth, notifications) + React Query (server state) + React Router v6
- **Charts**: TradingView Lightweight Charts + Recharts
- **Forms**: React Hook Form + Zod validation
- **Build**: Vite with SWC + bundle analysis (`ANALYZE=true npm run build`)

---

## Critical Setup Before Coding

### 1. Environment Variables (Required)
```bash
# .env.local (create this file - app won't load without it)
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-key>

# Optional (for specific features)
VITE_FINNHUB_API_KEY=<for-market-data>
VITE_SENTRY_DSN=<for-error-tracking>
```

### 2. Essential Commands
```bash
npm run dev              # Start dev server (localhost:8080)
npm run build           # Production build
npm run lint            # ESLint check
npm run test            # Vitest (add --ui for interactive)
npm run sync-validators # Sync Zod schemas with Supabase
npm run supabase:push   # Deploy database migrations
npm run supabase:pull   # Regenerate types from database
```

### 3. Before Submitting Any Code
- ✅ **Read relevant PRD section** (PRD.md)
- ✅ **Check task status** in `docs/tasks_and_implementations/`
- ✅ **Search for similar features** — avoid duplicate implementation
- ✅ **Verify no RLS policy gaps** — new tables need security policies
- ✅ **Run `npm run lint`** — fix all ESLint errors
- ✅ **Add tests** for business logic (unit), forms, and complex components

---

## Architecture Patterns

### Project Structure (Feature-Based Organization)
```
src/
├── components/          # UI components (by feature: auth/, trading/, kyc/, etc.)
├── contexts/           # Global state (Auth, Notifications, Layout)
├── hooks/              # Custom React hooks (30+ specialized hooks)
│   ├── useAuth.tsx     # Session + admin role
│   ├── useRealtimePositions.tsx   # Live position updates
│   ├── usePriceStream.tsx         # Market data stream
│   └── ... (trading, margin, liquidation, etc.)
├── pages/              # Route pages (lazy-loaded in App.tsx)
├── lib/                # Business logic & services
│   ├── trading/        # Order matching, margin, commission, liquidation
│   ├── kyc/            # KYC verification workflow
│   ├── risk/           # Risk monitoring, margin calls
│   ├── export/         # Portfolio export (CSV, PDF)
│   └── logger.ts       # Sentry integration
├── integrations/supabase/  # Auto-generated types & client
├── types/              # TypeScript definitions
└── assets/             # Images, icons
```

### Data Flow (Layered State Management)

```
User Input → React Component (validation via Zod)
    ↓
Business Logic (lib/ services)
    ↓
Supabase API (with RLS auto-filtering)
    ↓
Real-time Subscriptions (Realtime hooks)
    ↓
State Update (useState/Context/React Query)
    ↓
UI Re-render
```

**State Management Layers (in priority order):**
1. **Component Local State** — UI-only (`useState`)
2. **Custom Hooks** — Reusable logic (`usePriceStream`, `useAuth`)
3. **Global Context** — App-wide (`NotificationContext`)
4. **React Query** — Server state caching (`useQuery`)
5. **Supabase Realtime** — Live data (`useRealtimePositions`)

### Key Integration Points

| System | Purpose | Import Path |
|--------|---------|------------|
| **Supabase Client** | Database, Auth, Realtime | `@/integrations/supabase/client` |
| **Supabase Types** | Auto-generated DB schema | `@/integrations/supabase/types` |
| **Auth** | User session & admin role | `useAuth()` from `@/hooks/useAuth` |
| **Notifications** | Global toasts & unread count | `useNotifications()` from `@/contexts/notificationContextHelpers` |
| **Toast UI** | User-facing alerts | `useToast()` from `@/hooks/use-toast` |
| **UI Components** | shadcn-ui primitives | `@/components/ui/*` |
| **Error Logging** | Sentry integration | `@/lib/logger` |

---

## Common Implementation Patterns

### Pattern 1: Real-Time Data Hook (Realtime + Cleanup)

```typescript
// src/hooks/useRealtimePositions.tsx
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Position } from '@/types/position';

export const useRealtimePositions = (userId: string | null) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const subscriptionRef = useRef<unknown>(null);

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    const fetchPositions = async () => {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', userId);
      
      if (!error) setPositions(data ?? []);
    };

    fetchPositions();

    // Subscribe to real-time changes
    subscriptionRef.current = supabase
      .channel(`positions:${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'positions', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPositions(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setPositions(prev =>
              prev.map(p => p.id === payload.new.id ? payload.new : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setPositions(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // CRITICAL: Cleanup to prevent memory leaks
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [userId]);

  return { positions };
};
```

**Key Pattern:** Always unsubscribe in cleanup. Memory leaks are the #1 bug in this codebase.

### Pattern 2: Validated Form with React Hook Form + Zod

```typescript
// Schema first (shareable, testable)
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const orderSchema = z.object({
  symbol: z.string().min(1, 'Symbol required'),
  size: z.number().positive('Size must be positive'),
  leverage: z.number().min(1).max(50, 'Max leverage is 50x'),
});

type OrderInput = z.infer<typeof orderSchema>;

// Component
export const OrderForm: React.FC = () => {
  const form = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      // Submit to API
      await placeOrder(data);
      toast({ title: 'Order placed' });
    } catch (error) {
      toast({ title: 'Error', description: error.message });
    }
  });

  return (
    <form onSubmit={handleSubmit}>
      <input {...form.register('symbol')} />
      {form.formState.errors.symbol && (
        <span className="text-destructive">{form.formState.errors.symbol.message}</span>
      )}
      <button disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Loading...' : 'Place Order'}
      </button>
    </form>
  );
};
```

### Pattern 3: Supabase Query with Error Handling

```typescript
// Always destructure { data, error }
const { data: orders, error } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

if (error) {
  console.error('Failed to fetch orders:', error);
  toast({ title: 'Error', description: 'Unable to load orders' });
  return;
}

// Use data safely (RLS policies already filtered by user)
setOrders(orders ?? []);
```

### Pattern 4: Business Logic Service (Trading Engine Example)

```typescript
// src/lib/trading/orderMatching.ts
import type { Order, ExecutionResult } from '@/types';

/**
 * Order matching engine
 * Handles market, limit, stop, stop-limit execution
 * All functions are pure (no side effects) and fully tested
 */

export const validateOrder = (order: Order): boolean => {
  if (!order.symbol) return false;
  if (order.size <= 0) return false;
  if (order.leverage > MAX_LEVERAGE) return false;
  return true;
};

export const executeMarketOrder = (order: Order): ExecutionResult => {
  if (!validateOrder(order)) {
    throw new Error('Invalid order');
  }

  const marketPrice = getCurrentPrice(order.symbol);
  const slippage = calculateSlippage(order.size, order.symbol);
  const executionPrice = order.direction === 'buy'
    ? marketPrice + slippage
    : marketPrice - slippage;

  return {
    status: 'filled',
    executedPrice: executionPrice,
    executedSize: order.size,
    timestamp: new Date(),
  };
};
```

### Pattern 5: Error Boundary (Wrap Complex Features)

```typescript
import React from 'react';
import { logger } from '@/lib/logger';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Component render error', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2>Something went wrong</h2>
          <p className="text-sm text-red-600">{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

## Trading Engine Architecture

### Core Modules in `src/lib/trading/`

These are the business logic backbone. All are pure functions with comprehensive test coverage.

| Module | Responsibility | Example |
|--------|---|---|
| `orderMatching.ts` | Order execution (market, limit, stop, OCO) | Execute market orders at best available price |
| `marginCalculations.ts` | Leverage, collateral, required margin | Calculate margin required for 2:1 leverage on $1k |
| `commissionCalculation.ts` | Fee structure per asset class | 0.1% commission + spread |
| `liquidationEngine.ts` | Force position closure on margin breach | Liquidate at market if equity < maintenance margin |
| `pnlCalculation.ts` | Profit/loss tracking | Long EUR/USD: entry $1.10, current $1.12, P&L = +$200 |
| `slippageCalculation.ts` | Market impact on large orders | Impact increases with order size |
| `marginCallDetection.ts` | Identify at-risk accounts | Flag when margin level < 30% |
| `marginMonitoring.ts` | Real-time margin monitoring | Broadcast alerts when approaching limits |
| `orderValidation.ts` | Pre-execution checks | Verify size, leverage, collateral |
| `riskThresholdMonitoring.ts` | Risk limit enforcement | Block orders exceeding daily loss limit |

**Pattern:** Import from these modules in components/hooks, never implement trading logic in UI.

---

## Code Conventions

### TypeScript
- ✅ **Use `@/` path aliases** everywhere: `import { Button } from '@/components/ui/button'`
- ✅ **Use `import type` for types**: `import type { Order } from '@/types'`
- ✅ **Loose types intentional** — use `unknown` then narrow when uncertain
- ✅ **Import Supabase types from**: `@/integrations/supabase/types` (auto-generated, never manually edit)

### React Components
- ✅ **Functional components only** — no class components (except Error Boundaries)
- ✅ **Props must be destructured with interface**: `interface Props { label: string }; export const MyComponent: React.FC<Props> = ({ label }) => { }`
- ✅ **Component files < 300 lines** — extract if larger
- ✅ **Hooks over HOCs** — extract reusable logic to custom hooks
- ✅ **Memoization only with profiler proof** — don't assume it helps

### Tailwind CSS + Styling
- ✅ **Utility-first only** — no inline styles, no custom CSS
- ✅ **CSS variables for colors**: `className="bg-[hsl(var(--primary))]"` (defined in `src/index.css`)
- ✅ **Responsive design**: Use `sm:`, `md:`, `lg:`, `xl:`, `2xl:` breakpoints
- ✅ **Use `cn()` utility for dynamic classes**: `import { cn } from "@/lib/utils"`
- ✅ **Dark mode supported** — already enabled in config

```tsx
import { cn } from "@/lib/utils";

<button className={cn(
  "px-4 py-2 rounded", 
  isActive && "bg-primary text-primary-foreground"
)}>
  Click me
</button>
```

### Forms & Validation
- ✅ **Schema-first approach**: Define Zod schema, infer type, use with React Hook Form
- ✅ **Always use `zodResolver`** when creating useForm
- ✅ **Display field errors** from `form.formState.errors`

### Testing
- ✅ **Business logic**: Unit tests in `__tests__/` next to source
- ✅ **Components**: Use `@testing-library/react` with `render()` + `screen`
- ✅ **Mocking Supabase**: Use `vi.mock()` in test setup
- ✅ **Run tests**: `npm run test` or `npm run test:ui` for interactive debugging

---

## Critical Constraints (Memory Leaks & Bugs)

### 🔴 MUST DO

1. **Always unsubscribe from Realtime in cleanup**
   ```typescript
   useEffect(() => {
     const sub = supabase.channel('x').on(...).subscribe();
     return () => sub.unsubscribe(); // CRITICAL
   }, []);
   ```

2. **Always handle Supabase errors**
   ```typescript
   const { data, error } = await query();
   if (error) throw error; // Don't skip this
   ```

3. **Use `@/integrations/supabase/client` (NOT `@/lib/supabaseClient`)**
   ```typescript
   // ✅ CORRECT
   import { supabase } from '@/integrations/supabase/client';
   
   // ❌ WRONG (old path, will break)
   import { supabase } from '@/lib/supabaseClient';
   ```

4. **Never manually edit Supabase types** — regenerate after schema changes
   ```bash
   npm run supabase:pull  # Regenerates src/integrations/supabase/types.ts
   ```

5. **Create RLS policies for new tables** — without them, queries fail silently
   ```sql
   CREATE POLICY "Users see only their data"
   ON table_name
   FOR SELECT
   USING (auth.uid() = user_id);
   ```

### 🔴 NEVER DO

- ❌ Hardcode API URLs, keys, or secrets
- ❌ Cache auth state outside React context
- ❌ Drill props through 3+ component levels (use Context instead)
- ❌ Create new component files > 300 lines
- ❌ Use `any` type (use `unknown` and narrow)
- ❌ Leave `console.log()` in production code
- ❌ Forget to clear timers/intervals in cleanup
- ❌ Create inline objects/arrays in render (moves to `useMemo` if needed)
- ❌ Manually edit auto-generated Supabase types
- ❌ Rebase/amend commits with Lovable auto-generated code

---

## Debugging & Testing

### Local Development Workflow
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests in watch mode
npm run test:ui

# Terminal 3: Check types in real-time
npm run lint
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot find module '@/...'" | Wrong path alias | Use `@/components/ui/button` not `../../components/button` |
| Memory leak warnings | Unsubscribed Realtime | Add cleanup: `return () => sub.unsubscribe()` |
| Type mismatch with Supabase | Types are stale | Run `npm run supabase:pull` |
| RLS policy denies query | Policy missing/wrong | Check `supabase/migrations/` for table policy |
| Component re-renders excessively | Missing dependencies/memoization | Use React Profiler, check useEffect deps |
| Form validation errors unclear | Wrong Zod schema | Verify schema matches API/component expectations |
| Build size too large | Missing code splitting | Check `ANALYZE=true npm run build` for bundle analysis |

---

## Key Files & Documentation

### Essential Reading (In This Order)
1. **PRD.md** — Feature requirements, constraints, success criteria
2. **project_resources/rules_and_guidelines/AGENT.md** — Detailed AI workflows (2,000+ lines of patterns)
3. **docs/tasks_and_implementations/** — Implementation status & blockers
4. **tsconfig.json** — Type checking config (intentionally loose)
5. **vite.config.ts** — Build & bundle splitting config

### Architecture Files
- **src/App.tsx** — Route setup, providers, lazy-loaded pages
- **src/pages/** — All page components
- **src/components/auth/ProtectedRoute.tsx** — Auth guard
- **src/contexts/NotificationContext.tsx** — Global notifications
- **src/lib/logger.ts** — Error logging (Sentry integration)

### Database & Types
- **supabase/migrations/** — Database schema and RLS policies
- **src/integrations/supabase/types.ts** — Auto-generated types (NEVER edit manually)
- **src/integrations/supabase/client.ts** — Supabase client instance

### Trading Engine (Core Business Logic)
- **src/lib/trading/** — Order matching, margin, liquidation, risk monitoring
- **src/lib/trading/__tests__/** — Comprehensive test suite for trading logic

---

## Decision Framework

### When to Create a Custom Hook
**Create if:**
- Used in 2+ components
- Contains side effects needing cleanup
- Complex state management

**Don't create if:**
- Single-component use
- Simple Supabase query (inline instead)
- One-off calculation

### When to Extract to Service
**Extract if:**
- Logic > 50 lines
- Independent testing needed
- Used by hooks/components

**Keep in component if:**
- UI-specific logic
- < 20 lines
- One-off transformation

### When to Use Context
**Use if:**
- Needed by 3+ components
- App-level state (user, theme, notifications)
- Rarely changes

**Don't use if:**
- Frequently updated (use React Query)
- < 2 consumers
- Local component state

### When to Use React Query
**Use if:**
- Fetching from server
- Caching important
- Pagination/infinite scroll needed

**Don't use if:**
- Real-time data (use Realtime hook)
- Client-only state
- Rarely accessed

---

## Naming Conventions

```
Components:        PascalCase (Button.tsx, TradeForm.tsx)
Hooks:            camelCase with "use" prefix (useAuth.tsx, usePriceStream.tsx)
Services/Utils:   camelCase (orderMatching.ts, kycService.ts)
Types:            PascalCase (Order, User, ExecutionResult)
Constants:        UPPER_SNAKE_CASE (MAX_LEVERAGE = 50, COMMISSION_RATE = 0.001)
```

---

## File Organization Template

```typescript
// src/components/feature/ComponentName.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import type { SomeType } from '@/types';

interface ComponentProps {
  label: string;
  variant?: 'primary' | 'secondary';
}

/**
 * ComponentName - Brief description
 * 
 * Detailed explanation if needed.
 * 
 * @example
 * return <ComponentName label="Click me" />
 */
export const ComponentName: React.FC<ComponentProps> = ({
  label,
  variant = 'primary',
}) => {
  return (
    <button className={cn('px-4 py-2', variant === 'primary' && 'bg-primary')}>
      {label}
    </button>
  );
};
```

---

## Success Criteria for Your Code

✅ **Shipped when:**
- No TypeScript errors (`npm run lint` passes)
- All tests pass (`npm run test`)
- Memory leaks prevented (proper cleanup)
- Business logic well-tested
- Forms have validation
- Error handling comprehensive
- No console.log() or debug code
- Security verified (no hardcoded secrets)
- JSDoc documentation included
- Feature tested end-to-end

---

## Additional Resources

- **Lovable-Maintained Codebase**: This project uses Lovable AI platform for design. Commits may include auto-generated code.
- **Sentry Error Tracking**: Optional error logging (set `VITE_SENTRY_DSN` to enable)
- **TradingView Lightweight Charts**: Charts library for candlestick/price display
- **Bundle Analysis**: Run `ANALYZE=true npm run build` to see bundle breakdown

---

## When to Ask for Help

Before starting, clarify if:
- Feature is in PRD (or aspirational)
- Similar feature already exists
- Requires database schema changes
- Affects multiple features
- Unknown tech pattern for this project
- Unclear requirements
- Security/performance implications
