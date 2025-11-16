# AI Coding Agent Instructions for TradePro

## Project Overview

**TradePro v10** is a broker-independent CFD trading platform with paper trading, social copy trading, and educational features. The stack is:
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn-ui (Radix UI + Tailwind CSS)
- **Backend/Database**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **State Management**: React Context + React Query
- **Routing**: React Router v6
- **Charts**: TradingView Lightweight Charts + Recharts
- **Forms**: React Hook Form + Zod validation

## Architecture Patterns

### Project Structure

```
src/
├── components/          # UI components (organized by feature: auth/, trading/, kyc/, etc.)
├── contexts/           # Global state (NotificationContext)
├── hooks/              # Custom React hooks (useAuth, usePriceStream, etc.)
├── pages/              # Route pages (Trade, Dashboard, Admin, etc.)
├── lib/                # Business logic & utilities
│   ├── trading/        # Order matching, margin, commission, liquidation
│   ├── kyc/            # KYC verification workflow
│   ├── export/         # Portfolio export (CSV, PDF)
│   └── supabaseClient.ts
├── integrations/
│   └── supabase/       # Auto-generated types & client
├── types/              # TypeScript type definitions
└── assets/
```

### Data Flow & State Management

1. **Global Auth State**: `useAuth()` hook manages user session and admin role via Supabase Auth
2. **Notifications**: `NotificationContext` provides unread count and toast notifications via Supabase Realtime
3. **Real-time Data**: Custom hooks (`usePriceStream`, `useRealtimePositions`) subscribe to Supabase changes
4. **API Queries**: React Query handles fetching and caching via `QueryClient` (initialized in `App.tsx`)
5. **Local Component State**: Use `useState` for UI-only state; avoid redundant global state

### Key Integration Points

| System | Purpose | Import Path |
|--------|---------|------------|
| Supabase Client | Database, Auth, Realtime | `@/integrations/supabase/client` |
| Supabase Types | Auto-generated DB schema | `@/integrations/supabase/types` |
| Notifications | Global toast messages | `useToast()` from `@/hooks/use-toast` |
| Forms | React Hook Form + Zod | `react-hook-form` + `zod` |
| UI Components | shadcn-ui primitives | `@/components/ui/*` |

## Developer Workflows

### Common Commands

```bash
npm run dev              # Start Vite dev server (localhost:8080)
npm run build           # Production build
npm run lint            # Run ESLint
npm run test            # Run Vitest tests
npm test:ui             # Interactive test UI
npm run sync-validators # Sync Zod validators with Supabase (see scripts/sync-validators.js)
npm run supabase:push   # Deploy migrations
npm run supabase:functions:deploy  # Deploy Edge Functions
```

### Development Setup

1. **Environment Variables**: 
   - **Required** (app won't load without these):
     - `VITE_SUPABASE_URL` — Supabase project URL
     - `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/public key
   - **Optional** (for specific features):
     - `VITE_FINNHUB_API_KEY` — Market data feed (optional fallback)
     - `VITE_SENTRY_DSN` — Error tracking (optional)
   - Create `.env.local` in project root; Vite reads automatically on `npm run dev`

2. **Database**: Migrations in `supabase/migrations/` auto-deploy on `npm run supabase:push`
   - RLS policies auto-enforce user isolation
   - Always test migrations locally before pushing to production
   - Reference `supabase/migrations/` for schema structure

3. **Edge Functions**: TypeScript functions in `supabase/functions/` deploy via `npm run supabase:functions:deploy`
   - Edge Functions run on Supabase cloud; useful for server-side tasks (webhooks, async jobs)
   - Import types from `@/integrations/supabase/types` where possible
   - Use `npm run supabase:functions:deploy function-name` to deploy single function

### Testing Patterns

- **Unit Tests**: Vitest config in `vitest.config.ts`; tests in `**/__tests__/**` directories
- **Mocking Supabase**: Use `vi.mock()` to mock supabase client (see `src/lib/kyc/__tests__/kycService.test.ts`)
- **React Component Tests**: Use `@testing-library/react` with `render()` + `screen`
- **Setup**: `vitest.setup.ts` imports `@testing-library/jest-dom`

Example:
```typescript
describe('KycService', () => {
  it('should create a KYC request', async () => {
    const service = new KycService();
    const req = await service.createKycRequest('user-1');
    expect(req).toHaveProperty('id');
  });
});
```

## Code Conventions

### TypeScript & Typing

- **Path alias**: Use `@/` prefix (e.g., `@/components/ui/button`)
- **Strict typing**: Optional via `tsconfig.json` (currently loose for incremental adoption)
- **No explicit `any`**: Use `unknown` then narrow; ESLint warns on `@typescript-eslint/no-explicit-any`
- **Database types**: Import auto-generated types from `@/integrations/supabase/types`

### React Components

- **Functional components only**: No class components
- **Hooks over HOCs**: Use custom hooks for cross-cutting concerns
- **Component size**: Keep under 300 lines; extract reusable logic
- **Props destructuring**: Destructure in function signature with TypeScript types
- **Memoization**: Use `useMemo`/`useCallback` only if proving performance issues in Profiler

Example:
```tsx
interface TradeFormProps {
  symbol: string;
  onSubmit: (order: Order) => Promise<void>;
}

export const TradeForm: React.FC<TradeFormProps> = ({ symbol, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = useCallback(async (data: OrderInput) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  }, [onSubmit]);
  
  return <form onSubmit={handleSubmit}>...</form>;
};
```

### Styling with Tailwind CSS

- **Utility-first**: Use Tailwind classes directly in `className`
- **Custom colors**: Defined as CSS variables in `index.css` (e.g., `hsl(var(--primary))`)
- **Dark mode**: Already enabled via `darkMode: ["class"]` in `tailwind.config.ts`
- **Responsive**: Use breakpoints `sm:`, `md:`, `lg:`, `xl:`, `2xl:` prefixes
- **Dynamic classes**: Use `cn()` utility from `clsx` (imported as `cn` in components):

```tsx
import { cn } from "@/lib/utils";

<button className={cn("px-4 py-2", isActive && "bg-primary")}>Click</button>
```

### Form Validation

- **Schema-first**: Define Zod schema, infer TypeScript type
- **React Hook Form integration**: Use `useForm()` + `resolver: zodResolver(schema)`
- **Field errors**: Display via `form.formState.errors`

Example:
```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginInput = z.infer<typeof loginSchema>;
```

```tsx
const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
<Input {...form.register('email')} />
{form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
```

### Trading Engine Logic

Key modules in `src/lib/trading/`:
- **Order Matching**: `orderMatching.ts` - Market/Limit/Stop/Stop-Limit execution
- **Margin Calculations**: `marginCalculations.ts` - Leverage & collateral
- **Commission**: `commissionCalculation.ts` - Fee structures
- **Liquidation**: `liquidationEngine.ts` - Margin calls & forced closures
- **PnL**: `pnlCalculation.ts` - Profit/loss tracking
- **Slippage**: `slippageCalculation.ts` - Market impact

All trading logic is documented with references to PRD sections and includes comprehensive test coverage.

### Supabase Integration

- **Client import**: Always use `@/integrations/supabase/client` (NOT `@/lib/supabaseClient`)
- **Type safety**: Import DB types: `import type { Database } from '@/integrations/supabase/types'`
- **Row-level security**: Policies enforce user isolation; queries auto-filter by auth user
- **Realtime**: Enable via `.on()` subscription; remember to unsubscribe in cleanup

Example:
```typescript
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const { data: orders } = await supabase
  .from("orders")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });

// Realtime subscription
const subscription = supabase
  .channel("positions")
  .on("postgres_changes", { event: "*", schema: "public", table: "positions" }, (payload) => {
    setPositions(prev => [...prev, payload.new]);
  })
  .subscribe();

// Cleanup
return () => subscription.unsubscribe();
```

### Error Handling

- **Async operations**: Wrap in try-catch; log errors via `console.error()`
- **Toast notifications**: Use `useToast()` for user-facing errors
- **API errors**: Supabase returns `{ data, error }` tuple; check `error` before using `data`
- **Network fallback**: Optional fields in types to handle partial data

```typescript
const { data, error } = await supabase.from("users").select();
if (error) {
  console.error("Failed to fetch users:", error);
  toast({ title: "Error", description: "Unable to load data" });
  return;
}
// Use data safely
```

## PRD Alignment & Feature Implementation

The PRD (`PRD.md`) defines:
1. **Core Features**: Multi-asset trading (forex, stocks, commodities, crypto, indices, ETFs, bonds)
2. **KYC/AML**: Multi-step verification with admin review workflow
3. **Social Trading**: Copy verified traders with performance tracking
4. **Risk Management**: Margin calls, liquidation, position monitoring
5. **Compliance**: GDPR, CCPA, AML policies; transparent fees
6. **Admin Console**: User management, KYC oversight, risk dashboards

Before starting any feature:
- Reference relevant PRD section (e.g., "Section 2.1: Multi-Asset Trading Engine")
- Check existing implementation in `docs/` for task tracking
- Verify no overlapping active tasks in `docs/tasks_and_implementations/`

## Critical Developer Patterns

### Custom Hooks Best Practices

Store reusable logic in `src/hooks/`:
- Manage single concern (e.g., `useAuth` for auth state, `usePriceStream` for market data)
- Return stable object shape to prevent unnecessary re-renders
- Handle cleanup in `useEffect` return
- Use `useCallback` for dependencies

```typescript
export const usePriceStream = (symbols: string[]) => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const channel = supabase.channel("prices");
    const subscription = channel
      .on("broadcast", { event: "price_update" }, ({ payload }) => {
        setPrices(prev => ({ ...prev, [payload.symbol]: payload.price }));
      })
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, []);
  
  return prices;
};
```

### Naming Conventions

- **Components**: PascalCase (e.g., `TradeForm.tsx`, `OrderBook.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `usePriceStream.tsx`)
- **Utils/Services**: camelCase (e.g., `kycService.ts`, `orderMatching.ts`)
- **Types**: PascalCase interfaces/types (e.g., `interface Order { }`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `const MAX_LEVERAGE = 50`)

### File Organization

- **Feature-based**: Group related components in subdirectories (e.g., `components/trading/`, `components/kyc/`)
- **Index files**: Optional; re-export from subdirectory's `index.ts` if multiple related exports
- **Tests co-located**: `__tests__/` directory in same folder as source

## Common Pitfalls to Avoid

1. **Multiple React instances**: Vite config dedups React via `resolve.dedupe` — don't install React separately in subdependencies
2. **Stale auth state**: Always use `useAuth()` hook; don't cache `user` outside React context
3. **Forgetting RLS policies**: Supabase policies filter all queries; ensure policies exist for new tables
4. **Unsubscribed Realtime**: Always unsubscribe from Supabase channels in cleanup
5. **Hardcoded values**: Use environment variables or config constants
6. **Prop drilling**: Extract to Context/hook if passing through 3+ levels
7. **Missing error boundaries**: Wrap page routes with error handling
8. **Race conditions in async state**: Use refs to track component mount status in cleanup

## Debugging Tips

- **Network Requests**: Check browser DevTools Network tab; Supabase REST API logs in dashboard
- **State Updates**: React Profiler shows component renders + timing
- **Auth Issues**: Check Supabase Auth → Users; ensure RLS policies allow current user
- **Type Errors**: Run `npm run lint` + check TypeScript errors in IDE
- **Test Failures**: Run `npm test:ui` for interactive debugging

## Lovable Integration Best Practices

This codebase is maintained via **Lovable** (AI-assisted design platform). When implementing features:

1. **Component Patterns**: All UI components should follow existing shadcn-ui patterns in `src/components/`
   - Prefer Radix UI primitives wrapped by shadcn for consistency
   - Maintain responsive design; test mobile (sm:, md:, lg: breakpoints)
   - Use shadcn component variants consistently (e.g., `variant="outline"`)

2. **Auto-generated Code**: Supabase types in `src/integrations/supabase/types.ts` are auto-generated
   - Never manually edit Supabase type files
   - Regenerate after schema changes: `npm run supabase:pull`
   - Always commit updated types to ensure team consistency

3. **Code Generation Workflow**:
   - Use descriptive component/function names—AI agents parse these for code generation
   - Document complex logic with inline comments (especially trading engine rules)
   - Keep files focused on single responsibility for better AI understanding
   - Use consistent patterns across features (e.g., all forms use React Hook Form + Zod)

4. **Lovable-specific Tooling**:
   - `lovable-tagger`: Auto-tags components in dev mode for Lovable visibility
   - Commit includes auto-generated changes from Lovable—don't rebase/amend these commits
   - Use component export locations in `src/components/` to guide future AI implementations

## Performance Optimization Patterns

### Code-Splitting Strategy

The Vite config in `vite.config.ts` already implements intelligent chunking:

```javascript
// Predefined chunk groups for large dependencies
manualChunks: {
  'vendor-charts': ['lightweight-charts', 'recharts'],
  'vendor-supabase': ['@supabase/supabase-js'],
}
```

**When adding new heavy libraries:**
- Add to `manualChunks` if library size > 50KB
- Use dynamic imports (`const Module = lazy(() => import('...'))`) for route components
- Example: All pages in `src/pages/` are lazy-loaded in `App.tsx`

**Bundle analysis:**
- Run `ANALYZE=true npm run build` to generate `dist/bundle-analysis.html`
- Check for duplicate dependencies or unexpected large modules
- Verify lazy-loaded chunks defer non-critical code

### Large Market Data Stream Handling

Real-time market data can create performance bottlenecks. Follow these patterns:

**1. Selective Subscriptions** — Only subscribe to needed symbols:
```typescript
// ✅ Good: Only subscribe to displayed positions
const symbols = positions.map(p => p.symbol);
const subscription = usePriceStream(symbols);

// ❌ Bad: Subscribe to all 200 symbols at once
const allSymbols = getAllAssets().map(a => a.symbol);
```

**2. Debounce State Updates** — Prevent excessive re-renders:
```typescript
const [prices, setPrices] = useState<Record<string, number>>({});
const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  const channel = supabase.channel("prices");
  channel
    .on("broadcast", { event: "price_update" }, ({ payload }) => {
      // Batch updates: collect changes and update once per 100ms
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(() => {
        setPrices(prev => ({ ...prev, [payload.symbol]: payload.price }));
      }, 100);
    })
    .subscribe();
  
  return () => {
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    channel.unsubscribe();
  };
}, []);
```

**3. Virtualized Lists** — For large order/position lists, use `react-window`:
```tsx
import { FixedSizeList as List } from 'react-window';

export const PositionList = ({ positions }: Props) => (
  <List height={600} itemCount={positions.length} itemSize={40} width="100%">
    {({ index, style }) => (
      <div style={style} className="px-4 py-2">
        <PositionRow position={positions[index]} />
      </div>
    )}
  </List>
);
```

**4. Memoization for Price Cells** — Prevent individual rows re-rendering on every price update:
```tsx
const PriceCell = React.memo(({ symbol, price }: Props) => (
  <span className={price > lastPrice ? "text-green-500" : "text-red-500"}>
    {price.toFixed(2)}
  </span>
), (prev, next) => prev.price === next.price && prev.symbol === next.symbol);
```

**5. Reduce Chart Render Frequency** — TradingView Lightweight Charts can be expensive:
```typescript
// Instead of updating on every tick, update candles periodically
const updateChartRef = useRef<NodeJS.Timeout | null>(null);
const pendingBarRef = useRef<BarData | null>(null);

const handlePriceUpdate = (bar: BarData) => {
  pendingBarRef.current = bar;
  
  if (updateChartRef.current) return; // Already scheduled
  
  updateChartRef.current = setTimeout(() => {
    if (pendingBarRef.current && series) {
      series.update(pendingBarRef.current);
    }
    updateChartRef.current = null;
  }, 500); // Update chart every 500ms, not on every tick
};
```

### Memory Management

- **Unsubscribe Realtime channels** in component cleanup to prevent memory leaks
- **Clear timers/intervals** in `useEffect` return function
- **Remove event listeners** before unmounting components
- **Avoid creating new objects in render** — move to `useMemo` if comparing in dependency array

## References

- **PRD**: `PRD.md` — complete feature specification
- **Trading Engine**: `src/lib/trading/` — order matching, margin, liquidation logic
- **KYC Workflow**: `src/lib/kyc/` — verification, document upload, admin review
- **Task Tracking**: `docs/tasks_and_implementations/` — implementation history and blockers
- **Supabase Schema**: `supabase/migrations/` — database structure and policies
