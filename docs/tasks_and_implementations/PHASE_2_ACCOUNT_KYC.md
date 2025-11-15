# PHASE 2: ACCOUNT & KYC MANAGEMENT (Weeks 4-6)

## TASK GROUP 5: KYC & COMPLIANCE (~85h)

### 2.1.1 Complete KYC Admin Review Workflow (35h)
**Goal:** End-to-end KYC intake, automated checks, admin review UI, audit trail, and integration with account gating.

- **Backend:** `/src/lib/kyc/kycService.ts`, `/supabase/functions/lib/kycService.ts`
- **Edge Functions:**
  - `/supabase/functions/submit-kyc/index.ts` (user upload)
  - `/supabase/functions/validate-kyc-upload/index.ts` (validation)
  - `/supabase/functions/kyc-webhook/index.ts` (provider callbacks)
  - `/supabase/functions/admin/kyc-review/index.ts` (admin actions)
- **DB:** `/supabase/migrations/2025xx_kyc_tables.sql` (`kyc_requests`, `kyc_documents`, `kyc_verifications`, `kyc_audit`)
- **Frontend:** `/src/components/kyc/KycAdminDashboard.tsx`, `/src/components/kyc/KycUploader.tsx`, `/src/hooks/useKyc.tsx`
- **Testing:** `/src/lib/kyc/__tests__/kycService.test.ts`
- **Acceptance:**
  - Secure upload, provider integration, admin review, audit trail, KYC gating, retention policy, RLS enforced.

---

### 2.1.2 User Account Settings & Preferences (20h)
**Goal:** Robust account management: profile, security, sessions, API keys, notification preferences, privacy/export.

- **Backend:** `/src/lib/account/accountService.ts`
- **Edge Functions:** `/supabase/functions/account/update-profile`, `/supabase/functions/account/manage-2fa`, `/supabase/functions/account/api-keys`, `/supabase/functions/account/export-data`
- **DB:** Extend `profiles` with `preferences` JSONB, `notification_settings`, `sessions`, `api_keys` table.
- **Frontend:** `/src/components/account/ProfileSettings.tsx`, `SecuritySettings.tsx`, `NotificationPreferences.tsx`, `ApiKeysManager.tsx`
- **Hooks:** `/src/hooks/useAccount.tsx`, `useApiKeys.tsx`, `use2FA.tsx`
- **Testing:** Unit + E2E for 2FA/API keys.
- **Acceptance:**
  - Profile update, 2FA lifecycle, session management, API keys, notification prefs, data export/deletion, audit log.

---

### 2.1.3 Wallet & Deposit System (30h)
**Goal:** Fiat & crypto deposit flows, reconciliation, on-chain confirmations, deposit limits, ledger accounting.

- **Backend:** `/src/lib/wallet/walletService.ts`
- **Edge Functions:**
  - `/supabase/functions/create-deposit/index.ts`
  - `/supabase/functions/payment-webhook/index.ts`
  - `/supabase/functions/crypto-webhook/index.ts`
  - `/supabase/functions/confirm-deposit/index.ts`
- **DB:** `deposits`, `wallets`, `ledger_entries`, `deposit_addresses` tables.
- **Frontend:** `/src/components/wallet/DepositPage.tsx`, `/src/hooks/useDeposits.tsx`
- **Testing:** Unit, integration, chaos, performance.
- **Acceptance:**
  - Fiat/crypto deposit, confirmations, ledger, KYC gating, admin ops, reconciliation, RLS enforced.

---

## TASK GROUP 6: ANALYTICS & HISTORY (~100h)

### 2.2.1 Trading History & Performance Analytics (40h)
**Goal:** Rich historical data, export, performance metrics, downloadable reports, interactive charts.

- **API:** `/supabase/functions/history/orders`, `/supabase/functions/history/fills`, `/supabase/functions/history/ledger`, `/supabase/functions/history/export`
- **Backend:** `/src/lib/history/historyService.ts`
- **Frontend:** `/src/pages/history/TradingHistory.tsx`, `/src/components/history/PerformanceReport.tsx`, `/src/components/history/EquityCurveChart.tsx`, `/src/components/history/PerformanceTable.tsx`
- **DB:** Materialized views: `v_user_trade_summary`, `v_daily_pnl`
- **Testing:** Unit, integration, performance.
- **Acceptance:**
  - Accurate, paginated history, metrics, export, charts, RLS enforced.

---

### 2.2.2 Risk Management Suite (35h)
**Goal:** User-configurable risk thresholds, scenario simulation, scheduled risk reports, historical risk snapshots.

- **Backend:** `/src/lib/risk/userRiskService.ts`
- **Edge Functions:** `/supabase/functions/user-risk/thresholds`, `/supabase/functions/user-risk/simulate`, `/supabase/functions/user-risk/snapshots`
- **Frontend:** `/src/components/risk/UserRiskSettings.tsx`, `RiskSimulator.tsx`, `RiskReport.tsx`
- **DB:** `user_risk_thresholds`, `risk_snapshots` tables
- **Testing:** Unit, integration.
- **Acceptance:**
  - Thresholds, simulator, snapshots, alerts, export, RLS enforced.

---

### 2.2.3 Price Alerts & Notifications (25h)
**Goal:** Rule-based alerts (price, % change, indicator cross), real-time/scheduled evaluation, multi-channel delivery.

- **Backend:** `/src/lib/alerts/alertService.ts`
- **Edge Functions:** `/supabase/functions/create-alert/index.ts`, `/supabase/functions/check-price-alerts/index.ts`, `/supabase/functions/alert-webhook/index.ts`, `/supabase/functions/send-notification/index.ts`
- **Frontend:** `/src/components/alerts/AlertBuilder.tsx`, `/src/hooks/useAlerts.tsx`
- **DB:** `price_alerts`, `notifications` tables
- **Testing:** Unit, integration, load.
- **Acceptance:**
  - Alert creation, evaluation, delivery, history, deduplication, RLS enforced.

---

## Non-Functional Requirements
- RLS policies for all sensitive tables
- PII minimization & encryption
- Audit logs for KYC, wallet, admin actions
- Admin endpoints require MFA & role checks
- Metrics, tracing, dashboards for ops
- GDPR export & deletion flows
- CI: linter, unit/integration/contract tests
- Data retention policies

## Estimates & Sprints
- Total Phase 2: ~155–165h
- Sprint A: KYC intake + admin review + provider integration
- Sprint B: Wallet & Deposit core + ledger + fiat integration
- Sprint C: Account settings + analytics + price alerts

---

**See implementation details in PHASE 1 for decomposition, file conventions, and acceptance/test patterns.**
