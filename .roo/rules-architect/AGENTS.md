# Architect Mode Guidelines

This file provides architectural guidance for AI agents working on this trading platform codebase.

## Critical Architectural Constraints

**Realtime Data Architecture**: Supabase Realtime subscriptions require careful memory management

- WebSocketConnectionManager limits concurrent connections to 5
- Mandatory cleanup verification with 5-minute timeout
- Force unsubscribe mechanisms for stale connections
- Debounced updates prevent UI thrashing

**Trading Calculation Precision**: Financial calculations require exact precision

- All monetary values use JavaScript number type with care
- P&L calculations handle floating-point precision issues
- Margin calculations critical for risk management
- Position sizing must account for leverage ratios

**Security-First Design**: Multiple security layers implemented

- CSP violation monitoring in `src/lib/cspViolationMonitor.ts`
- XSS protection via DOMPurify integration
- Rate limiting for API endpoints
- Attack pattern detection and logging

## State Management Architecture

**Layered State Strategy**:

1. **Local Component State**: UI toggles, temporary form data
2. **Custom Hooks**: Cross-component state with side effects (`useAuth`, `usePriceStream`)
3. **Context**: App-wide state (user, notifications, theme) - rarely changes
4. **React Query**: Server state caching and refetch on focus
5. **Supabase Realtime**: Live data (positions, prices) with memory management

**Critical Pattern**: Use Realtime for live data, React Query for cached server state

## Build System Architecture

**Vite Optimization Strategy** in `vite.config.ts`:

- Custom CORS middleware with environment-specific origin handling
- Per-request CSP nonce generation for security
- Complex chunk splitting by vendor/library type for optimal caching
- Bundle size monitoring with 2MB budget warnings
- Bundle analyzer integration for performance analysis

**Memory Management**: Node.js heap automatically set to 4GB for large builds
**Polyfill Strategy**: Browser APIs only polyfilled when explicitly requested

## Database Integration Patterns

**Supabase Architecture**:

- Auto-generated types in `src/integrations/supabase/types.ts`
- Mandatory RLS policies for all new tables
- Migration workflow: edit schema → pull types → push migrations
- Row-level security prevents data leaks between users

**Type Safety**: Never manually edit auto-generated type files

## Trading Platform Specific Architecture

**Order Validation Sync**: Frontend/backend validation must stay synchronized

- Frontend: `src/lib/trading/orderValidation.ts`
- Backend: Supabase Edge Functions
- Sync via `npm run sync-validators` script

**TradingView Integration**: Custom compatibility layer in `src/lib/tradingViewCompatibility.ts`

- Patches DataView.prototype assignment conflicts
- Required for chart functionality
- Must be loaded before TradingView library

## Performance Architecture

**Bundle Optimization**: Complex manual chunk splitting strategy

- Core framework chunks (React, React DOM)
- UI libraries (Radix UI components)
- Charts (TradingView, Recharts split by functionality)
- State management (@tanstack/react-query)
- Forms (react-hook-form, zod)
- Database (@supabase/supabase-js)

**Memory Leak Prevention**: Mandatory cleanup patterns for all subscriptions
**Debouncing**: Configurable debouncing for high-frequency updates (default 100ms)

## Testing Architecture

**Co-located Testing**: Tests in `src/**/__tests__/` alongside source files
**Framework Separation**: Vitest for unit tests, Playwright for E2E
**Fast Development**: Separate ESLint config for development (`eslint.config.dev.js`)

## Security Architecture

**Multi-layered Security**:

1. **CSP Headers**: Per-request nonce generation
2. **Input Validation**: Zod schema validation on all user inputs
3. **XSS Protection**: DOMPurify sanitization
4. **Rate Limiting**: API endpoint protection
5. **Attack Detection**: Pattern recognition and logging
6. **Audit Logging**: Security event tracking

**Critical**: All async operations must be wrapped in try-catch blocks
