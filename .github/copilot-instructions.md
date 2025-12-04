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
## AI Coding Agent Quick Guide — Trade-X-Pro-Global

This file is a concise, actionable checklist for AI coding agents working on this repo.

- **Stack & entry points**: React 18 + TypeScript + Vite. Key paths: `src/lib/trading/`, `src/hooks/`, `src/components/`, `src/contexts/`, `src/lib/supabaseBrowserClient.ts`.
- **Supabase client**: Always import from `@/lib/supabaseBrowserClient` (do NOT import from `@/integrations/supabase/client`).
- **Auto-generated types**: Never edit `src/integrations/supabase/types.ts` manually — run `npm run supabase:pull` after DB changes.
- **Realtime pattern (mandatory)**: Use initial fetch + `supabase.channel(...).on('postgres_changes', ...)` and always cleanup with `supabase.removeChannel(subscriptionRef)` in `useEffect` return to avoid memory leaks.

Short example (use this pattern in hooks):

```typescript
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseBrowserClient';

export function useMyTable(userId: string | null) {
  const [rows, setRows] = useState<any[]>([]);
  const subRef = useRef<any>(null);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      const { data, error } = await supabase.from('my_table').select('*').eq('user_id', userId);
      if (error) throw error;
      setRows(data ?? []);
    };
    fetch();

    subRef.current = supabase
      .channel(`my_table:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'my_table', filter: `user_id=eq.${userId}` }, payload => {
        // handle INSERT/UPDATE/DELETE
      })
      .subscribe();

    return () => { if (subRef.current) supabase.removeChannel(subRef.current); };
  }, [userId]);

  return rows;
}
```

- **Important scripts** (use these exact npm scripts):
  - `npm run dev` — start dev server (Vite)
  - `npm run lint` — run ESLint (`--fix` available)
  - `npm run test` / `npm run test:ui` — unit tests (Vitest)
  - `npm run supabase:pull` / `npm run supabase:push` — keep DB types and migrations in sync
  - `npm run build` / `npm run build:sentry` — production build (+sourcemaps)

- **TypeScript config**: Project intentionally permits looser typing (`noImplicitAny: false`). Prefer `import type` for types and avoid introducing `any` when possible.

- **Architecture & conventions**:
  - Business logic belongs in `src/lib/trading/` (pure functions). UI code must not contain core trading logic.
  - Hooks provide realtime/state behavior (e.g., `useRealtimePositions`, `usePriceStream`). Reuse existing hooks; do not add direct Supabase subscriptions inside components.
  - Component files should generally remain under ~300 lines; extract large components.

- **Supabase & security rules**:
  - RLS policies are required for DB access. If queries fail, check `supabase/migrations/` for missing policies.
  - Never hardcode secrets or URLs. Use `.env.local` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, etc.

- **Testing & mocks**:
  - Unit tests live next to code in `__tests__/` and `src/lib/trading/__tests__/`.
  - Mock Supabase in tests via `vi.mock('@/lib/supabaseBrowserClient')`.

- **Common failure modes** (what to check first):
  - "Cannot find module '@/...'": verify `@/` imports and `tsconfig` path aliases.
  - Memory leaks: missing `supabase.removeChannel(...)` cleanup.
  - Stale DB types: run `npm run supabase:pull` after schema changes.

- **DO / DON'T (brief)**
  - DO handle Supabase errors (throw or handle returned `error`).
  - DO reuse hooks and business logic modules.
  - DON'T edit auto-generated files in `src/integrations/`.
  - DON'T leave `console.log` or debug artifacts in production code.

If anything here is unclear or you'd like the guide expanded with examples (short code snippets, common file locations to change for a feature, or a checklist for PRs), tell me which area to expand and I'll iterate. 
