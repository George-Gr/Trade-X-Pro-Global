# Initial Codebase Audit — Trade-X-Pro-Global

Date: 2025-12-09

Summary:

- Performed repository snapshot and executed static checks (ESLint, TypeScript strict, Vitest suite).
- Location for report: `audit-reports/`

Raw results summary (from running `npm run lint || true; npm run type:strict || true; npm run test --silent || true`):

- ESLint: no blocking errors reported in previous run (exit code 0 earlier).
- TypeScript strict (`npm run type:strict`): ran as part of sequence (no immediate fatal output in terminal log), further verification recommended.
- Vitest: FAILURE — Test run produced many failures.
  - Test files: 9 failed | 37 passed (46 total files executed)
  - Tests: 65 failed | 1143 passed (1208 total tests)
  - Key failing suites (representative):
    - `src/__tests__/components/MarginLevelCard.test.tsx` — multiple accessibility and content assertions failing (missing heading level, progressbar attributes, duplicate text matches).
    - `src/__tests__/components/RiskAlertsCard.test.tsx` — multiple failures related to DOM queries returning unexpected nodes and counts (element selection/expectations mismatch).
    - `src/components/__tests__/accessibility.test.tsx` — keyboard navigation focus order failing (focus landed on a button instead of first input).
    - `src/hooks/__tests__/useOrderExecution.test.tsx` and `src/hooks/__tests__/useSlTpExecution.test.tsx` — many hook tests failing or timing out; errors indicate missing or null return objects and uncalled mocks.
    - `src/components/ui/__tests__/SidebarErrorBoundary.test.tsx` — ErrorBoundary behavior causing thrown errors in test.

Immediate critical issues (must address first):

1. Many unit tests failing (65 failures). This is critical because it indicates regressions in component/hook behaviors or mismatches between test expectations and current implementation or test environment.
   - Impact: Blocks CI, risks shipping regressions.
   - Likely causes: Recent changes to components structure/ARIA attributes, test utilities or mocks changed, or global providers not present in test wrappers.

2. Accessibility and DOM structure regressions.
   - Failures indicate missing `aria-valuenow`/heading levels and duplicate text matches. These are regressions in components' markup/attributes and affect accessibility.

3. Hook behavior failures (null returns, timeouts, uninvoked mocks).
   - Likely causes: Changed return signatures from hooks, missing mocked implementation of external services (Supabase, edge functions), or test setup not providing required contexts.

Major issues (next priority):

- Tests that time out or call null methods — indicates missing initialization or changed API surface for hooks.
- Potential flaky tests due to queries matching multiple elements (e.g., `getByText(/Alert 1/)` matches Alert 1 and Alert 10 etc.). Tests should use `getAllBy*` or more specific queries, or component markup should avoid ambiguous content.
- Accessibility mismatch where tests expect specific semantic headings (`h2`, `role='progressbar'` with `aria-valuenow`). Confirm components follow semantic markup.

Minor items (lower priority):

- Style and formatting suggestions (ESLint config looks present). Run `npm run lint -- --fix` where applicable.
- Search repository for `console.log` and accidental commits of secrets (run secret scan tool if desired).

Proposed Plan (safe, low-risk, staged):
Phase A — Investigation & Safe Guards

- A1: Create a reproducible failing set: run `vitest` with the failing test file list and produce full stack traces (done partially). Collect first 8–12 failing assertions and map to source files.
- A2: Verify test setup: open `vitest.config.ts`, `vitest.setup.ts`, and `src/setupTests` for global mocks/providers. Confirm wrapper helpers (e.g., `renderWithProviders`) exist and are used consistently.
- A3: Run TypeScript checks explicitly and capture output (if any errors exist beyond tests).

Phase B — Fix test environment & mocks (low risk)

- B1: If providers or contexts are missing in tests, add wrapper utilities and apply to failing tests.
- B2: Restore any missing global mocks (Supabase client, window.invoke, external APIs). Use `vi.mock()` in tests setup to avoid hitting real integrations.
- B3: For tests failing due to ambiguous text queries, update tests to use `getAllByText` or more specific selectors OR update UI text to avoid ambiguous tokens (prefer stable data attributes or `aria-label`). Prefer test-side fixes first (safer).

Phase C — Component fixes (targeted, minimal changes)

- C1: Fix accessibility regressions: ensure headings use correct semantic levels (tests expect `h2` or heading level 2), add missing `aria-valuenow` on progressbars, and ensure progressbars have `role='progressbar'` and `aria-valuemin/max`.
- C2: For components that render dynamic lists (alerts), ensure stable keys and avoid duplicate visible labels that confuse tests (use `Alert 01` vs `Alert 1` if necessary)

Phase D — Hook fixes & contract validation

- D1: Inspect failing hook implementations (`useOrderExecution`, `useSlTpExecution`) and their unit tests. Reconcile return values and ensure functions are exported and initialized.
- D2: Add or update mocks for `invoke` or remote functions used by hooks; ensure idempotency key generation and async retries are deterministic in tests.

Phase E — Re-run full test suite & CI

- E1: Run vitest for affected files, then full suite. Ensure no new regressions.
- E2: Run `npm run lint` and `npm run type:strict` again.

Phase F — Documentation & PR

- F1: Document changes in `audit-reports/` with before/after snapshots.
- F2: Prepare small PRs (one per logical fix) and include unit tests verifying the fix.

Risk management and safeguards:

- Make atomic changes (one failing suite at a time).
- Run tests locally after each change; use `vitest -u` only when updating snapshots intentionally.
- Avoid changing core business logic unless tests indicate bugs; prefer test harness/mocks or small markup changes.

Next immediate actions I propose to take (I can proceed if you approve):

1. Open and analyze the top failing test files and their corresponding component/hook sources to determine root causes.
2. Verify `vitest.setup.ts` and test utilities (render wrappers, global mocks) to catch missing providers.
3. Produce a prioritized patch list (file → recommended changes) with minimal diffs, then implement the first safe patch (e.g., fix a missing `aria-valuenow` or test wrapper).

If you want me to start applying fixes now, tell me whether to proceed with: `A` only (investigation + report), or `A+B` (investigate and apply safe test/setup fixes), or `A..D` (investigate and apply component+hook fixes). I will implement changes in small commits and re-run tests after each change.

---

Files/Locations to inspect next (high priority):

- `src/__tests__/components/MarginLevelCard.test.tsx`
- `src/components/.../MarginLevelCard.tsx` (actual component)
- `src/__tests__/components/RiskAlertsCard.test.tsx`
- `src/components/.../RiskAlertsCard.tsx`
- `src/hooks/__tests__/useOrderExecution.test.tsx` and `src/hooks/useOrderExecution.tsx`
- `src/hooks/__tests__/useSlTpExecution.test.tsx` and `src/hooks/useSlTpExecution.tsx`
- `vitest.config.ts`, `vitest.setup.ts`

Report generated by: automated audit runner (local execution of test/lint/typecheck)
