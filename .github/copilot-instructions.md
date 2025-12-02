# AI Coding Agent Instructions for TradePro v10

**Version:** 3.1 (Updated Dec 1, 2025)  
**Purpose:** Guide AI agents to be immediately productive on this CFD trading simulation platform

---

## 30-Second Quick Start

This is a **React 18 + TypeScript + Supabase CFD trading platform**. Key facts:
- **Client location**: `@/lib/supabaseBrowserClient` (NOT `@/integrations/supabase/client`)
- **TypeScript is intentionally loose**: `noImplicitAny: false`, `strictNullChecks: false` for incremental adoption
- **State layers**: Component `useState` → Custom hooks → Context (`NotificationContext`) → React Query → Supabase Realtime
- **Critical bug**: Memory leaks from unsubscribed Realtime channels — ALWAYS cleanup with `supabase.removeChannel(subscription)`
- **Before coding**: Read `PRD.md`, check `docs/tasks_and_implementations/`, run `npm run lint`

---

## Architecture

### Project Structure (Feature-Based)
```
src/
├── lib/trading/          # Business logic (order matching, margin, liquidation)
├── hooks/                # 40+ specialized hooks (useAuth, usePriceStream, useRealtimePositions)
├── contexts/             # Global state (Auth, Notifications, Theme)
├── components/           # UI by feature (auth/, trading/, kyc/, dashboard/)
├── integrations/supabase/  # Auto-generated types.ts (NEVER manually edit)
├── lib/supabaseBrowserClient.ts  # Supabase client singleton
└── pages/                # Route components (lazy-loaded)
```

### Data Flow
```
User Input → React Component + Zod validation
    ↓
Business Logic (lib/trading/, lib/kyc/, etc.)
    ↓
Supabase API (RLS auto-filters by user)
    ↓
Realtime Subscriptions (useRealtimePositions, usePriceStream)
    ↓
State Update (useState/Context/React Query)
    ↓
UI Re-render
```

---

## Critical Setup

### 1. Environment Variables (.env.local)
```bash
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SENTRY_DSN=https://...sentry.io  # Error tracking (vite.config.ts integration)
VITE_FINNHUB_API_KEY=...              # Optional market data
```

### 2. Essential Commands
```bash
npm run dev              # Vite dev server (localhost:5173, HMR enabled)
npm run dev:clean        # Remove Vite cache + rebuild
npm run dev:fresh        # Clean install + dev
npm run lint             # ESLint (add --fix to auto-fix)
npm run test             # Vitest watch mode
npm run test:ui          # Vitest interactive UI
npm run build            # Production build
npm run build:sentry     # Build + upload sourcemaps
npm run supabase:pull    # Regenerate types from DB schema
npm run supabase:push    # Push migrations
npm run supabase:functions:deploy  # Deploy edge functions
npm run type:strict      # Full strict TypeScript check
```

---

## Must-Know Patterns

### 🔴 CORRECT Realtime Pattern (ALWAYS Use This)
```typescript
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseBrowserClient';  // ✅ CORRECT PATH

export const useMyRealtimeData = (userId: string | null) => {
  const [data, setData] = useState([]);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // 1. Initial fetch
    const fetchData = async () => {
      const { data: items, error } = await supabase
        .from('table')
        .select('*')
        .eq('user_id', userId);
      if (!error) setData(items ?? []);
    };
    fetchData();

    // 2. Subscribe to real-time changes
    subscriptionRef.current = supabase
      .channel(`table:${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'table', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // 3. CRITICAL CLEANUP - prevents memory leaks
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [userId]);

  return data;
};
```

### ❌ COMMON MISTAKES
```typescript
// WRONG #1: Missing cleanup
useEffect(() => {
  supabase.channel('x').on(...).subscribe();
  // ❌ No return cleanup
}, []);

// WRONG #2: Wrong import path
import { supabase } from '@/integrations/supabase/client';  // ❌ Doesn't exist
import { supabase } from '@/lib/supabaseBrowserClient';     // ✅ Use this

// WRONG #3: Manually editing auto-generated types
// ❌ Never edit src/integrations/supabase/types.ts manually
// ✅ Run `npm run supabase:pull` after schema changes

// WRONG #4: Not handling Supabase errors
const { data, error } = await supabase.from('table').select('*');
if (error) console.log('ignored');  // ❌ Error not handled
if (error) throw error;             // ✅ Always throw or handle
```

### Validated Form (React Hook Form + Zod)
```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  symbol: z.string().min(1, 'Required'),
  size: z.number().positive(),
});

export const MyForm = () => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { symbol: '', size: 1 },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await submitToAPI(data);
    } catch (err) {
      form.setError('root', { message: err.message });
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...form.register('symbol')} />
      {form.formState.errors.symbol && <span>{form.formState.errors.symbol.message}</span>}
      <button disabled={form.formState.isSubmitting}>Submit</button>
    </form>
  );
};
```

### Trading Engine Module (Pure Functions)
```typescript
import type { Order, ExecutionResult } from '@/types';

export const validateOrder = (order: Order): boolean => {
  if (!order.symbol) return false;
  if (order.size <= 0) return false;
  if (order.leverage > 50) return false;
  return true;
};

export const executeMarketOrder = (order: Order): ExecutionResult => {
  if (!validateOrder(order)) throw new Error('Invalid order');
  
  const marketPrice = getCurrentPrice(order.symbol);
  const slippage = calculateSlippage(order.size);
  const executionPrice = order.direction === 'buy'
    ? marketPrice + slippage
    : marketPrice - slippage;

  return { status: 'filled', executedPrice: executionPrice };
};
```

---

## Code Conventions

✅ **Use `@/` path aliases everywhere**: `import { Button } from '@/components/ui/button'`  
✅ **Props interface always defined**: `interface Props { label: string }; export const Comp: React.FC<Props>`  
✅ **Component files < 300 lines** — extract larger components to subdirectories  
✅ **`import type` for types**: `import type { Order } from '@/types'`  
✅ **Functional components only** (except Error Boundaries)  
✅ **Tailwind utility-first** — no inline styles, use `cn()` for conditionals  
✅ **Use fallback values gracefully** — see `supabaseBrowserClient.ts` for example

---

## Trading Engine Architecture

Core business logic lives in `src/lib/trading/` — all pure functions with test coverage:

| Module | Responsibility | Example Export |
|--------|---|---|
| `orderMatching.ts` | Order execution (market, limit, stop) | `executeMarketOrder()` |
| `marginCalculations.ts` | Leverage, collateral, required margin | `calculateRequiredMargin()` |
| `marginMonitoring.ts` | Real-time margin level calculation | `calculateMarginLevel()` |
| `commissionCalculation.ts` | Fee structure per asset class | `calculateCommission()` |
| `liquidationEngine.ts` | Force position closure on margin breach | `shouldLiquidate()` |
| `pnlCalculation.ts` | Profit/loss tracking | `calculatePnL()` |
| `slippageCalculation.ts` | Market impact on order size | `calculateSlippage()` |
| `marginCallDetection.ts` | Identify at-risk accounts | `shouldTriggerMarginCall()` |
| `orderValidation.ts` | Pre-execution checks | `validateOrder()` |
| `positionClosureEngine.ts` | Position close logic (partial/full) | `closePosition()` |
| `riskThresholdMonitoring.ts` | Risk limit enforcement | `checkRiskThreshold()` |

**Rule**: Import from these in components/hooks; never implement trading logic in UI.

---

## Key Hooks (40+ Specialized)

Most-used realtime/state hooks:
- `useAuth()` — Session + admin role
- `useRealtimePositions()` — Live position updates
- `usePriceStream()` — Market data streaming
- `useMarginMonitoring()` — Real-time margin tracking
- `useLiquidationExecution()` — Force close on margin breach
- `usePortfolioMetrics()` — Aggregate portfolio analytics
- `useKyc()` — KYC verification workflow
- `useNotifications()` — Global toast system

**Rule**: Use existing hooks; never create inline Realtime subscriptions.

---

## Testing

- **Business logic**: Unit tests in `__tests__/` next to source (e.g., `src/lib/trading/__tests__/orderMatching.test.ts`)
- **Components**: `@testing-library/react` with `render()` + `screen` queries
- **Supabase mocking**: `vi.mock('@/lib/supabaseBrowserClient')`
- **E2E tests**: Playwright in `e2e/` directory
- **Run**: `npm run test` (watch) or `npm run test:ui` (interactive)

---

## CRITICAL Constraints

### 🔴 MUST DO
1. **Always unsubscribe Realtime in cleanup**: `return () => supabase.removeChannel(sub)`
2. **Always handle Supabase errors**: `if (error) throw error`
3. **Use correct Supabase import**: `@/lib/supabaseBrowserClient` only
4. **Never manually edit**: `src/integrations/supabase/types.ts` — run `npm run supabase:pull`
5. **Create RLS policies for new tables** — queries fail silently without them

### 🔴 NEVER DO
- ❌ Hardcode API URLs, keys, or secrets
- ❌ Use `any` type (use `unknown` then narrow)
- ❌ Leave `console.log()` in production code
- ❌ Forget timer/interval cleanup in effects
- ❌ Create objects/arrays inline in render
- ❌ Drill props through 3+ component levels (use Context)
- ❌ Create component files > 300 lines

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot find module '@/...'" | Wrong path alias | Use `@/` prefix with correct path |
| Memory leak warnings | Unsubscribed Realtime | Add cleanup: `return () => supabase.removeChannel(sub)` |
| Type mismatch with DB | Stale types | Run `npm run supabase:pull` |
| RLS policy denies access | Missing policy | Check `supabase/migrations/` for table policy |
| Excessive re-renders | Missing useEffect deps | Check ESLint for `useEffect` exhaustive-deps |

---

## Before Submitting Code

✅ Read relevant PRD.md section  
✅ Check `docs/tasks_and_implementations/` for duplicate work  
✅ Run `npm run lint` — fix all errors  
✅ Run `npm run test` — add tests for business logic  
✅ Add JSDoc comments for exported functions  
✅ Verify Supabase RLS policies exist (new tables)  
✅ Test in dev server: `npm run dev`

---

## Key Files to Read

1. **PRD.md** — Feature scope, requirements, success criteria
2. **docs/project_resources/rules_and_guidelines/AGENT.md** — Detailed patterns (1100+ lines)
3. **src/App.tsx** — Route setup, providers, lazy-loaded pages
4. **src/lib/trading/** — Business logic modules (pure functions)
5. **src/hooks/useRealtimePositions.tsx** — Realtime pattern reference
6. **supabase/migrations/** — Database schema and RLS policies
7. **tsconfig.json** — Type checking config (intentionally loose)

---

## When to Ask for Help

Before starting, clarify if:
- Feature is in PRD (or aspirational)
- Similar feature already exists (check `src/components/` and `src/hooks/`)
- Requires database schema changes (new table? run `npm run supabase:pull` after)
- Affects multiple features/modules
- Unknown tech pattern for this project
- Security/performance implications

---

## Additional Resources

- **AGENT.md** — Comprehensive workflow guide (deep dive reference)
- **TradingView Lightweight Charts** — Chart library for candlestick display
- **Sentry** — Error tracking (`npm run build:sentry` uploads sourcemaps)
- **Bundle Analysis**: `ANALYZE=true npm run build` → view `dist/bundle-analysis.html`
