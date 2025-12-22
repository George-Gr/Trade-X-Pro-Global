# Code Mode Guidelines

This file provides coding-specific guidance for AI agents working on this trading platform codebase.

## Node Environment Setup (MANDATORY)

**Critical**: All development commands MUST use `FORCE_NODE_POLYFILL_NAVIGATOR=1` via `scripts/setup-node-env.js`:

- Dev server automatically sets this: `npm run dev`
- Provides browser API polyfills (navigator, crypto, fetch, URL, TextEncoder)
- Sets Node.js heap to 4GB (`--max-old-space-size=4096`)
- Fixes punycode deprecation warnings
- Only enables polyfills when explicitly requested to avoid side effects

## Realtime Subscription Patterns (Memory Leak Prevention)

**Critical Memory Management** in `src/hooks/useRealtimePositions.tsx`:

- WebSocketConnectionManager with 5-connection limit and automatic cleanup
- Subscription cleanup verification with 5-minute timeout for stale connections
- Force unsubscribe for subscriptions exceeding memory leak detection thresholds
- Debounced updates (configurable, default 100ms) with proper timer cleanup

**Essential Pattern**:

```typescript
// ALWAYS unsubscribe in cleanup
useEffect(() => {
  const subscription = supabase.channel('positions').subscribe();
  return () => subscription.unsubscribe();
}, []);
```

## Trading Platform Code Requirements

**TradingView Compatibility**: `src/lib/tradingViewCompatibility.ts` patches DataView.prototype assignment to prevent TradingView library conflicts. This is mandatory for chart functionality.

**Order Validation Sync**: Frontend validation in `src/lib/trading/orderValidation.ts` MUST be synced to Supabase Edge Functions. Run `npm run sync-validators` before deployment.

**Security Implementation**: Use security patterns from `src/lib/cspViolationMonitor.ts` and `src/lib/security.ts` for CSP violation detection, XSS protection, rate limiting, and attack pattern recognition.

## Build System Code Optimization

**Vite Configuration** in `vite.config.ts`:

- Custom CORS middleware with environment-specific origin allowlists
- Per-request CSP nonce generation for security
- Bundle size monitoring with 2MB budget warnings
- Complex manual chunk splitting strategy for optimal caching
- Bundle analyzer: `ANALYZE=true npm run build` generates `dist/bundle-analysis.html`

## Testing Implementation

**Framework**: Vitest for unit tests, Playwright for E2E tests
**Test Location**: Co-located with source in `src/**/__tests__/` directories
**Fast Linting**: Separate dev config via `npm run lint:fast` using `eslint.config.dev.js`

**Key Commands**:

- `npm run test:ui` - Interactive Vitest UI
- `npm run test:e2e` - Run Playwright tests
- `npm run build:check` - Combined type check, lint, and test
