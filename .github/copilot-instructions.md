# AI Coding Agent Instructions for TradePro v10

**Version:** 3.0 (Updated Dec 2025)  
**Purpose:** Guide AI agents to be immediately productive on this CFD trading simulation platform

---

## Project at a Glance

**TradePro v10** is a broker-independent CFD trading simulation platform with multi-asset trading (forex, stocks, crypto, indices), paper trading, social copy trading, KYC/AML verification, and risk management—all unified in one transparent platform.

**Tech:** React 18 + TypeScript (loose types) + Vite | shadcn-ui + Tailwind CSS v4 | Supabase (Postgres, Auth, Realtime) | React Router v6 + React Query | React Hook Form + Zod

---

## Before Any Task: Essential Context

1. **Read PRD.md** for feature requirements and scope
2. **Check `project_resources/rules_and_guidelines/AGENT.md`** for comprehensive deep-dive rules (source of truth)
3. **Environment:** Create `.env.local` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`
4. **Critical scripts:** 
   - `npm run dev` (dev server), `npm run lint`, `npm run test`
   - `npm run supabase:pull` (regenerate types after schema changes)
   - `npm run supabase:push` (deploy migrations)

---

## Architecture Essentials

### Directory Structure (Feature-Based)
```
src/
├── components/{auth,trading,kyc,dashboard}/  # UI only
├── hooks/                                     # Custom hooks + Realtime subscriptions
├── lib/{trading,kyc,risk}/                   # Business logic (pure functions, tests)
├── contexts/                                  # Global state (auth, notifications, theme)
├── pages/                                     # Route pages
├── types/                                     # Type definitions
└── integrations/supabase/                    # Auto-generated DB client & types
```

### Data Flow
**User Input → Component (Form validation with Zod) → Business Logic (lib/) → Supabase API → Realtime updates → State → UI**

### State Management Layers (Use the Right One)
- **Local component state** (`useState`): UI toggles, temporary form data
- **Custom hooks** (`useAuth`, `usePriceStream`): Cross-component state with side effects
- **Context** (`AuthContext`, `NotificationContext`): App-wide state (rarely changes)
- **React Query**: Server state (caching, refetch on focus)
- **Supabase Realtime**: Live data (positions, prices)

---

## Critical Patterns (MUST Follow)

### 1. Realtime Subscriptions — Prevent Memory Leaks
```typescript
// ✅ CORRECT: Always unsubscribe in cleanup
useEffect(() => {
  const subscription = supabase
    .channel(`positions:${userId}`)
    .on('postgres_changes', { ... }, handleUpdate)
    .subscribe();
  
  return () => subscription.unsubscribe();  // CRITICAL
}, [userId]);
```
**See:** `src/hooks/useRealtimePositions.tsx` for canonical pattern.

### 2. Supabase Client Import
```typescript
// ✅ CORRECT
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// ❌ NEVER edit types.ts manually — run `npm run supabase:pull`
```

### 3. Forms — Schema-First Validation
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ 
  amount: z.number().positive('Must be positive') 
});

const { register, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

### 4. Business Logic — Separation of Concerns
- **Components:** UI rendering + user interaction only
- **Hooks:** State management + side effects
- **`src/lib/`:** Pure business functions with unit tests in `__tests__/`
- **Never mix layers** — keep components < 300 lines

---

## Code Quality Standards

**TypeScript**
- Use `@/` path aliases for all imports
- Prefer `import type` for type-only imports
- Avoid `any` type; use `unknown` and narrow
- No `@ts-ignore` comments

**React**
- Functional components only
- Destructure props with type annotations
- Include JSDoc for exported functions
- Memoize only after profiling (not reflexively)

**Database**
- **RLS policies required** for all new tables (silent failures without them)
- Auto-generated types live in `src/integrations/supabase/types.ts`
- Never manually edit auto-generated files

**Error Handling**
- All async operations in try-catch
- Validate user input with Zod
- Sanitize user-generated content with DOMPurify
- No hardcoded secrets or URLs
- Log security events to audit trails

---

## Common Implementation Tasks

### Adding a Database Table
1. Create migration in `supabase/migrations/`
2. Define schema with proper column types
3. **Add RLS policies** (CRITICAL!)
4. Run `npm run supabase:pull` to regenerate types
5. Create hooks in `src/hooks/` for queries
6. Write tests

### Implementing a Feature
1. Check `PRD.md` for requirements
2. Search codebase for similar features
3. Design types first
4. Implement business logic with tests
5. Build UI components with validation
6. Add Realtime subscriptions if needed

### Fixing a Bug
1. Reproduce with minimal example
2. Check error logs + type definitions
3. Write test that fails (TDD)
4. Fix implementation
5. Verify test passes
6. Search for similar bugs

---

## Key Files & Examples

| Task | File | Purpose |
|------|------|---------|
| Auth | `src/hooks/useAuth.tsx` | User state, login/logout |
| Trading | `src/lib/trading/` | Order matching, margin, P&L calculations |
| Realtime | `src/hooks/useRealtimePositions.tsx` | Live position updates (canonical pattern) |
| Risk | `src/lib/risk/` | Risk metrics, margin call detection |
| Components | `src/components/ui/` | shadcn-ui primitives |
| Types | `src/types/` | Custom type definitions |

---

## Common Blockers & Solutions

| Problem | Solution |
|---------|----------|
| Supabase queries fail silently | Check RLS policies in migration files |
| Memory leaks in Realtime | Always call `subscription.unsubscribe()` in `useEffect` cleanup |
| Type errors after DB schema change | Run `npm run supabase:pull` |
| Build bloat | Use `ANALYZE=true npm run build` to inspect bundle |
| Stale auth state | Use `useAuth()` hook, don't cache manually |
| Form validation fails | Verify Zod schema matches database column types |

---

## When to Ask for Help

- Feature not described in `PRD.md`
- Touches database schema or migrations
- Affects multiple domains (trading, KYC, risk)
- Requires architectural changes
- Unclear RLS policy requirements

**Source of truth for deep rules:** `project_resources/rules_and_guidelines/AGENT.md`
