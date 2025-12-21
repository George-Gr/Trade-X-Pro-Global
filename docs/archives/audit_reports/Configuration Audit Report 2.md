# TradePro v10 — Configuration Audit Report

## 1. Executive Risk Summary
- High risk: Server-side financial logic (Supabase Edge Functions) is excluded from Type-checking & linting, increasing the chance of correctness/security bugs in core trading flows. (See: tsconfig.json, eslint.config.js, `supabase/functions/*`)
- High risk: Committed environment file contains real project values (.env.local), enabling reconnaissance and increasing secret-exposure risk. (See: .env.local)
- High risk: Content Security Policy allows `unsafe-inline` and `unsafe-eval` for scripts (front-end XSS vector). (See: _headers)
- Medium risk: Browser Supabase client uses `flowType: 'implicit'` and localStorage-based sessions — trade-off between convenience and token exposure. (See: supabaseBrowserClient.ts)
- Medium risk: Sentry source maps and CI upload are configured; if Sentry account or tokens are compromised, source maps reveal code. (See: vite.config.ts, ci-build-sentry.yml)
- Positive signals: RLS policies present across critical tables and migrations; DOMPurify used for XSS sanitization; CI includes vulnerability scanning (Snyk/Trivy/CodeQL) and secret scanning (TruffleHog).

---

## 2. Configuration Coverage Inventory
| File | Category | Environment | Risk Level |
|---|---:|---|---|
| vite.config.ts | Build, Source maps, CORS, Sentry plugin | Prod/Dev | Medium |
| package.json | Scripts (build, sentry, supabase CLI) | Dev/CI | Low → Medium (build & release steps) |
| tsconfig.json | TypeScript config (excludes) | Dev | High (excludes functions) |
| eslint.config.js | Lint rules & ignores | Dev | High (ignores functions) |
| .env.local | Environment variables (committed) | Dev? (Committed) | High |
| .env.example | Environment template | Dev | Low |
| `supabase/functions/**` | Edge functions (execute-order, liquidation, etc.) | Server | High |
| `supabase/migrations/**` | DB schema, RLS policies | DB | Low → Medium (good RLS but needs verification) |
| _headers | Security headers (CSP) | Prod | High (unsafe directives present) |
| ci-build-sentry.yml | CI/CD, Sentry/Supabase deployment | CI | Medium |
| supabaseBrowserClient.ts | Browser supabase client | Browser | Medium (implicit flow & publishable key usage) |
| sanitize.ts | XSS protections (DOMPurify) | Browser | Low (good) |
| tailwind.config.ts | UI tokens, accessibility variants | Browser | Low |
| vitest.config.ts / playwright.config.ts | Unit/E2E tests | CI | Medium (coverage gaps vs server functions) |
| logger.ts | Logging & Sentry integration | Browser | Medium (PII flows need review) |

---

## 3. High-Risk Findings
- Finding: Critical server-side trading/risk code excluded from static checks
  - Affected Files: tsconfig.json (excludes `"supabase/functions/**"`), eslint.config.js (ignores functions), .prettierignore (functions)
  - Impact: Core financial logic (order execution, liquidation, margin calc) may not be type-checked, linted, or formatted; higher likelihood of logic bugs, regressions, and security issues.
  - Failure Scenario: A bug in execute-order or `execute-liquidation` leads to incorrect margin calculation and erroneous liquidations or funds misallocation, causing user losses or regulatory incidents.

- Finding: Committed .env.local containing project values
  - Affected Files: .env.local
  - Impact: Project identification and publishable keys committed to repo. While publishable keys are intended to be public, their presence along with project URL enables reconnaissance and increases attack surface. If other secrets were accidentally included, they could be leaked.
  - Failure Scenario: An attacker enumerates project ref and attempts targeted attacks (phishing, probing for admin endpoints); accidental commit of more sensitive keys would cause direct compromise.

- Finding: CSP includes `unsafe-inline` and `unsafe-eval` in `script-src`
  - Affected Files: _headers (CSP header)
  - Impact: Increases XSS attack surface; unsafe script allowances are incompatible with strong defenses on a financial application.
  - Failure Scenario: Third-party compromise or self-XSS leads to token theft / order forgery in user sessions.

- Finding: Service role key usage across Edge Functions
  - Affected Files: `supabase/functions/*` (e.g., index.ts uses `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`)
  - Impact: Functions use the Supabase service role for privileged DB operations (expected), but these keys must be kept secret and never exposed to logs or client.
  - Failure Scenario: Misconfigured CI/deploy or accidental logging reveals service role key; attacker can bypass RLS and perform destructive DB operations.

---

## 4. Medium-Risk Findings
- Finding: Browser auth flow uses `flowType: 'implicit'` and stores tokens in `localStorage`
  - Affected Files: supabaseBrowserClient.ts (auth config: `flowType: 'implicit'`, `storage: localStorage`)
  - Impact: Increased exposure of tokens to XSS or shared computer attacks.
  - Failure Scenario: XSS in client (made easier by CSP) results in token theft and account takeover.

- Finding: Source map handling and Sentry uploads
  - Affected Files: vite.config.ts (`sourcemap: 'hidden'` in production), ci-build-sentry.yml (uploads source maps)
  - Impact: Hidden sourcemaps are good for public endpoints; uploading them to Sentry is fine but increases risk if Sentry access tokens or the account are compromised.
  - Failure Scenario: Compromised Sentry access reveals source maps and internal code; attacker can more easily find security flaws or secrets.

- Finding: Third-party script & connect-src allowances
  - Affected Files: _headers (allows TradingView, CDNJS, Finnhub, etc.)
  - Impact: Supply-chain risk: third-party compromise can impact app runtime and data integrity.
  - Failure Scenario: Malicious script from allowed provider injects order requests or exfiltrates data.

- Finding: Tests and CI coverage gaps for server functions
  - Affected Files: vitest.config.ts, `playwright` workflows, lack of tests for `supabase/functions/**` in repo
  - Impact: No enforced unit/TDD coverage for critical server logic; E2E may not cover all server-side failure modes.
  - Failure Scenario: Regression in liquidation algorithm not caught by CI leads to operational incident.

---

## 5. Low-Risk / Best Practices
- Good: RLS policies are present for many archives and critical tables (examples: `position_closures` migration includes RLS policies and `service_role` check).
  - Files: `supabase/migrations/*` (e.g., 20251116_position_closure.sql)
- Good: DOMPurify-based sanitizers and explicit sanitization utilities implemented (sanitize.ts).
- Good: CI includes Snyk, Trivy, CodeQL, and Trufflehog scans (seen in ci-build-sentry.yml).
- Good: Production source maps set to `'hidden'` in vite.config.ts and Sentry upload is controlled by secrets.
- Suggestion-level items: Tailwind theme supports reduced motion, focus rings and WCAG color tokens (tailwind.config.ts).

---

## 6. Trading-Specific Configuration Risks
- Core financial logic location:
  - Files: `supabase/functions/lib/*` (e.g., `marginCalculations.ts`, `liquidationEngine.ts`, orderValidation.ts, `pnlCalculation.ts`)
  - Inference: Execution, margin calculation, P&L and liquidation engines are implemented as Supabase Edge Functions (server authoritative).
- Risk: Server-side logic is authoritative (good), but the exclusion from type/lint/test pipelines increases risk of subtle financial calculation bugs.
- Race conditions & atomicity:
  - Evidence: Migrations include stored procedures and atomic functions (e.g., `execute_position_closure` in `position_closure` migration), suggesting awareness of atomicity.
  - Remaining area to verify: Concurrency controls across functions (locks/transactions) must be verified; e.g., idempotency is used in `execute-order`, but cross-function concurrency and settlement atomicity require strong test coverage and formal review.

---

## 7. Security & Compliance Risks
- Exposure / Leakage:
  - .env.local committed (reconnaissance or accidental secret exposure).
  - Source maps uploaded to third-party Sentry instance — need account security.
- RLS & Principle of Least Privilege:
  - RLS policies exist, but enforcement depends on correct use of service_role only in server contexts; ensure no client uses service role.
- Logging & PII:
  - logger.ts captures userId and context; ensure PII is scrubbed before external transmission to Sentry. Confirm sanitization rules and DSN privacy settings (PII removal).
- CSP & XSS:
  - _headers allows `unsafe-inline`/`unsafe-eval` (immediate remediation recommended).
- CI Secret Handling:
  - Workflows store tokens via GitHub secrets (good). Audit for any steps that may echo secrets to logs (e.g., don't print env values).
- Regulatory/AML:
  - KYC functions exist (validate-kyc-upload and KYC RLS policies present). Ensure KYC audit trail retention and immutable logs exist (migrations include audit triggers).

---

## 8. Scalability & Performance Risks
- Bundle size checks in vite.config.ts and CI enforce budgets (good).
- Supabase function performance:
  - Migrations include indexes (e.g., `idx_position_closures_user_id_created`), but heavy compute in edge functions should be load-tested.
- Rate limiting:
  - Example: `execute-order` uses a `check_rate_limit` RPC — good, but ensure global rate-limits & circuit-breakers are enforced and tested.

---

## 9. Immediate Must-Fix Actions ✅
(ordered by priority)
1. Remove committed .env.local from repository and rotate any keys that were exposed. Add a `git rm --cached .env.local`, rotate publishable/inferred keys if any sensitive tokens were committed. (Files: .env.local)
2. Include functions in CI checks: add TypeScript compilation and ESLint to CI for the functions directory and add unit tests / static analysis for all server functions. (Files: tsconfig.json, eslint.config.js, CI workflows)
3. Harden CSP: remove `unsafe-inline` and `unsafe-eval` from _headers; replace inline scripts with hashed or nonce-based approaches and enforce strict CSP reporting. (Files: _headers)
4. Review client auth flow: evaluate replacing `flowType: 'implicit'` + `localStorage` with more secure flows (PKCE / server session tokens) and document the trade-offs. (File: supabaseBrowserClient.ts)
5. Ensure Sentry uploads are limited to a dedicated account with least privilege, and verify that no PII or secrets are sent. Validate Sentry CI steps (only run when `SENTRY_*` secrets present). (Files: vite.config.ts, ci-build-sentry.yml)
6. Audit supabase functions for logging of secrets/PII; add safeguards to logger to omit sensitive fields and add redaction. (Files: logger.ts, `supabase/functions/*`)

---

## 10. Strategic Improvements (Next 90 Days) ✨
- Enforce TypeScript & ESLint for all server code, and add mandatory labeled CI jobs that fail the pipeline if server-side tests fail.
- Add unit & integration tests for financial primitives (margin, liquidation, P&L) with property-based tests where appropriate; create regression suites for liquidation algorithms.
- Formal RLS verification: produce an RLS test suite (automated checks to assert no row access escapes intended roles).
- Implement CSP nonces/hashes and integrate CSP reporting endpoints for automated monitoring.
- Add an emergency "trading kill switch" (feature flag or server-side circuit-breaker with minimal blast radius) to stop trading executions if an out-of-compliance event occurs.
- Improve secrets posture: short-lived keys, enforce rotation, centralize secrets in a managed vault; ensure supabase service role stored only in environment secrets (not in checked-in `.env`) and never printed to logs.

---

## 11. Final Verdict: Production & Regulatory Readiness
- Summary: The repository demonstrates many mature practices (RLS usage, DB migrations with constraints & indexes, atomic stored procedures, sanitization via DOMPurify, CI security scanning, Sentry + source map controls). These are strong signals of readiness.
- Blocking issues: The committed .env.local, the exclusion of Supabase Edge Functions from TypeScript/lint/test pipelines, and an overly permissive CSP are blocking concerns for safe, auditable, real-money trading deployment and regulatory compliance.
- Recommendation: Address the immediate must-fix items (rotate secrets, include server functions in CI checks, tighten CSP), then re-assess. After those fixes and strengthened test coverage for financial logic, the project will be closer to being production-ready and defensible under regulatory scrutiny.