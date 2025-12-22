# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Node.js Environment Setup

**CRITICAL**: All dev commands require `FORCE_NODE_POLYFILL_NAVIGATOR=1` environment variable. The `npm run dev` script automatically sets this via `scripts/setup-node-env.js` which:

- Sets Node.js heap to 4GB (`--max-old-space-size=4096`)
- Provides browser API polyfills (navigator, crypto, fetch, URL, TextEncoder)
- Fixes punycode deprecation warnings
- Only enables polyfills when explicitly requested to avoid side effects

## Realtime Subscription Patterns

**Memory Leak Prevention**: `src/hooks/useRealtimePositions.tsx` implements critical patterns:

- WebSocketConnectionManager with 5-connection limit and automatic cleanup
- Subscription cleanup verification with 5-minute timeout for stale connections
- Force unsubscribe for subscriptions exceeding memory leak detection thresholds
- Debounced updates (configurable, default 100ms) with proper timer cleanup

**Critical Pattern**:

```typescript
// ALWAYS unsubscribe in cleanup
useEffect(() => {
  const subscription = supabase.channel('positions').subscribe();
  return () => subscription.unsubscribe();
}, []);
```

## Build System Optimization

**Vite Configuration**: `vite.config.ts` implements advanced optimizations:

- Custom CORS middleware with environment-specific origin allowlists
- Per-request CSP nonce generation for security
- Bundle size monitoring with 2MB budget warnings
- Complex manual chunk splitting strategy for optimal caching
- Bundle analyzer: `ANALYZE=true npm run build` generates `dist/bundle-analysis.html`

**Essential Commands**:

- `npm run build:analyze` - Visualize bundle composition
- `npm run dev:clean` - Clear cache when local builds behave strangely
- `npm run health:check` - Environment diagnostics

## Trading Platform Specifics

**TradingView Compatibility**: `src/lib/tradingViewCompatibility.ts` patches DataView.prototype assignment to prevent TradingView library conflicts. This is mandatory for chart functionality.

**Order Validation Sync**: `src/lib/trading/orderValidation.ts` mirrors Supabase Edge Function validation. Run `npm run sync-validators` to sync changes to `/supabase/functions/lib/orderValidation.ts` before deployment.

**Security Monitoring**: `src/lib/cspViolationMonitor.ts` and `src/lib/security.ts` implement comprehensive security patterns including CSP violation detection, XSS protection, rate limiting, and attack pattern recognition.

## Testing Architecture

**Framework**: Vitest for unit tests, Playwright for E2E tests.
**Test Location**: Co-located with source in `src/**/__tests__/` directories.
**E2E Results**: Stored in `playwright-report/` with trace artifacts.
**Fast Linting**: Separate dev config via `npm run lint:fast` using `eslint.config.dev.js`.

**Key Commands**:

- `npm run test:ui` - Interactive Vitest UI
- `npm run test:e2e` - Run Playwright tests
- `npm run build:check` - Combined type check, lint, and test

## Supabase Integration

**Type Safety**: Auto-generated types in `src/integrations/supabase/types.ts`. **NEVER edit manually** - run `npm run supabase:pull` after schema changes.

**RLS Policies**: Required for all new tables - silent failures occur without them.

**Migration Workflow**:

1. Edit schema in `supabase/migrations/`
2. Run `npm run supabase:pull` to regenerate types
3. Apply with `npm run supabase:push`
4. Verify RLS policies are present
