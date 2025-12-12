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

# Copilot / AI agent quick guide — TradePro v10

Purpose: short, actionable rules to get an AI coding agent productive in this repo.

## Quick start
- Required env: create `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Dev & checks: `npm run dev`, `npm run lint`, `npm run test`, `npm run test:e2e`.
- Supabase workflows: `npm run supabase:pull` (regenerate types), `npm run supabase:push` (migrations).

## Architecture (high level)
- Frontend: React 18 + TypeScript + Vite; UI via shadcn-ui + Tailwind.
- Backend: Supabase (Postgres, Auth, Realtime, Edge Functions). Auto-generated types live in `src/integrations/supabase/`.
- Organization: feature-based (`src/components/`, `src/lib/`, `src/hooks/`, `src/pages/`). Business logic lives in `src/lib/` (pure functions).

## Critical patterns you must follow
- Realtime: always unsubscribe channels in `useEffect` cleanup. See `src/hooks/useRealtimePositions.tsx` for the canonical pattern.
- Supabase: import client from `@/integrations/supabase/client` and never edit `src/integrations/supabase/types.ts` manually — run `npm run supabase:pull` when schema changes.
- Forms: schema-first with Zod + `react-hook-form` and `zodResolver`.

## Conventions to follow
- Use `@/` path aliases for imports.
- Prefer `import type` for types.
- Keep component files < 300 lines; extract hooks for shared side effects.
- Keep UI code in components, business logic in `src/lib/` (pure functions with unit tests in `__tests__`).

## Key files to check before coding
- `PRD.md` — feature requirements.
- `project_resources/rules_and_guidelines/AGENT.md` — long-form agent guidance (source of truth for deep rules).
- `src/integrations/supabase/client.ts` and `src/integrations/supabase/types.ts` — DB client & types.
- `src/hooks/` — canonical realtime and subscription hooks (avoid creating new raw subscriptions).
- `src/lib/trading/` — trading engine utilities and tests.

## Safety & blockers
- Do not hardcode secrets or API URLs.
- Add RLS policies for new tables; without them queries may fail silently (`supabase/migrations/`).
- Run `npm run lint` before creating PRs; tests required for business logic changes.

## Examples (copyable snippets)
- Unsubscribe pattern (use this exactly):
  - See `src/hooks/useRealtimePositions.tsx` for implementation and cleanup via `supabase.removeChannel(...)`.
- Regenerate supabase types:
  ```bash
  npm run supabase:pull
  ```

## When to ask for help
- If the feature is not described in `PRD.md`, touches DB schema, or affects multiple domains (trading, KYC, risk), ask a human reviewer early.

If anything here is unclear or you want me to expand examples (tests, component stub, migration template), tell me which area to expand.
