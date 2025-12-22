# Debug Mode Guidelines

This file provides debugging-specific guidance for AI agents working on this trading platform codebase.

## Memory Leak Detection

**Critical**: Realtime subscriptions in `src/hooks/useRealtimePositions.tsx` implement memory leak detection:

- WebSocketConnectionManager tracks active connections with 5-connection limit
- Subscription cleanup verification with 5-minute timeout for stale connections
- Force unsubscribe for subscriptions exceeding memory leak thresholds
- Debug logging via `DEBUG_REALTIME` flag (development only)

## Build System Debugging

**Bundle Analysis**: `npm run build:analyze` generates `dist/bundle-analysis.html` for visual bundle inspection
**Size Monitoring**: Vite config warns at 2MB bundle budget in production builds
**CORS Debugging**: Development vs production origin handling differs in `vite.config.ts`

## Error Tracking Integration

**Sentry Configuration**: Production builds require `VITE_SENTRY_DSN` environment variable
**Error Boundary**: Custom Sentry error boundary in `src/main.tsx` with fallback UI
**CSP Violations**: Monitor via `src/lib/cspViolationMonitor.ts` for security issues

## Development vs Production Differences

**CORS Origins**:

- Development: Allows localhost origins with warnings for unknown origins
- Production: Strict allowlist with explicit origins only
- Same-origin requests always allowed

**CSP Headers**:

- Development: Report-only mode with logging
- Production: Strict enforcement with blocking

## Supabase Debugging

**Type Synchronization**: Run `npm run supabase:pull` after schema changes
**RLS Policy Issues**: Silent failures occur without proper RLS policies
**Migration Status**: Check with `npm run supabase:migrations`

## Node Environment Issues

**Polyfill Warnings**: punycode deprecation warnings filtered in `scripts/setup-node-env.js`
**Memory Limits**: 4GB heap size automatically set for large builds
**Navigator Polyfills**: Only enabled with `FORCE_NODE_POLYFILL_NAVIGATOR=1`
