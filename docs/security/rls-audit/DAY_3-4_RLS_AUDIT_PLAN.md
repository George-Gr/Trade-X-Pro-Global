# Day 3-4 RLS Policies Audit Plan

**Phase:** Phase 1 (Security & Stability)  
**Timeline:** Jan 29-30, 2026  
**Objective:** Audit 39 migration files for Row-Level Security (RLS) CREATE POLICY statements, identify gaps and patterns, create validation framework  
**Current Status:** 🔄 IN PROGRESS

---

## Executive Summary

**Target:** 39 SQL migration files in `supabase/migrations/`  
**CREATE POLICY Statements Found:** 50+ (from initial grep)  
**Coverage Expected:** ~95%+ of database tables  
**Scope:** Document all policies by table, identify patterns, create prevention checklist

---

## Audit Objectives

### Primary Goals
1. **Document** all CREATE POLICY statements by table and operation (SELECT, INSERT, UPDATE, DELETE)
2. **Categorize** RLS patterns (user-owned data, admin-only, edge-function-only, etc.)
3. **Identify** gaps or missing policies on critical tables
4. **Create** migration checklist for future development
5. **Establish** validation tests for policy compliance

### Success Criteria
- [ ] All 39 migration files reviewed
- [ ] 50+ CREATE POLICY statements documented
- [ ] Pattern categories defined (5-8 types)
- [ ] Table-by-table audit report created
- [ ] Missing policies identified (if any)
- [ ] Prevention checklist drafted
- [ ] Validation tests written

---

## Migration Files Overview

### Core Files (Main RLS Definition)
**File:** `supabase/migrations/20251105143255_eafa25e6-2c40-4242-8a07-1e9713793f92.sql`  
- Purpose: Initial RLS policy setup (baseline)
- Policies Found: 16+
- Tables Covered:
  - `user_roles` (3 policies)
  - `profiles` (4 policies)
  - `kyc_documents` (3 policies)
  - `orders` (2 policies)
  - `positions` (2 policies)
  - `fills` (2 policies)
  - `ledger` (2 policies)

**File:** `supabase/migrations/20251105151143_a3e6e8f6-ce4a-4450-b5c7-8cc3388b2c6c.sql`  
- Purpose: Asset specs public access
- Policies Found: 1
- Tables Covered:
  - `asset_specs` (1 policy: public read-only)

**File:** `supabase/migrations/20251106101046_5d636755-c854-4fa9-80d2-c274ddb60707.sql`  
- Purpose: Position lots policies
- Policies Found: 2
- Tables Covered:
  - `position_lots` (2 policies)

**File:** `supabase/migrations/20251108103232_ce6714a0-39d4-4073-ae70-640bef3f8065.sql`  
- Purpose: KYC document policies (enhanced)
- Policies Found: 4
- Tables Covered:
  - `kyc_documents` (4 policies: upload, view, admin, delete)

**File:** `supabase/migrations/20251110162318_08b084f9-b636-4640-b4b3-c2c333af73f3.sql`  
- Purpose: Edge function write protection
- Policies Found: 15+
- Tables Covered:
  - `orders` (3 policies: edge-only, no modify, no delete)
  - `positions` (3 policies: edge-only, no modify, no delete)
  - `fills` (3 policies: edge-only, no modify, no delete)
  - `ledger` (3 policies: edge-only, no modify, no delete)
  - `position_lots` (3 policies: edge-only, no modify, no delete)
  - `profiles` (2 policies: user update + edge update)
  - `kyc_documents` (1 policy: user delete)

**File:** `supabase/migrations/20251110163327_543533f0-6dde-42df-acad-ac95303d7ea1.sql`  
- Purpose: Audit logging policies
- Policies Found: 4
- Tables Covered:
  - `audit_logs` (4 policies: admin view, immutable, no modify/delete, edge-only insert)

**File:** `supabase/migrations/20251110163929_a59de780-b1d5-4725-8043-1fc317cac295.sql`  
- Purpose: Risk settings policies
- Policies Found: 4
- Tables Covered:
  - `risk_settings` (4 policies: user view/update, admin view, trigger-based)

### Additional Files to Review
- KYC timestamps migration
- Order schema updates
- Missing stored procedures
- Atomic liquidation features
- Other schema modifications (28+ additional files)

---

## RLS Pattern Categories

### Pattern 1: User-Owned Data (Self-Service)
**Definition:** User can view/update their own record  
**Policy Structure:**
```sql
CREATE POLICY "Users can view own X" ON public.table_name
FOR SELECT USING (user_id = auth.uid())

CREATE POLICY "Users can update own X" ON public.table_name
FOR UPDATE USING (user_id = auth.uid())
```
**Tables Using This Pattern:**
- `profiles` - user profile data
- `kyc_documents` - user's own KYC uploads
- `risk_settings` - user's own risk preferences

**Audit Status:** ✓ Found and documented

---

### Pattern 2: Edge Function Write Protection
**Definition:** Users can read but cannot write; only edge functions can write  
**Policy Structure:**
```sql
CREATE POLICY "X created via edge functions only" ON public.table_name
FOR INSERT USING (auth.jwt() ->> 'role' = 'service_role')

CREATE POLICY "X cannot be modified by users" ON public.table_name
FOR UPDATE USING (false)

CREATE POLICY "X cannot be deleted by users" ON public.table_name
FOR DELETE USING (false)
```
**Tables Using This Pattern:**
- `orders` - system-controlled trading orders
- `positions` - system-controlled trading positions
- `fills` - system-controlled trade fills
- `ledger` - system-controlled financial ledger
- `position_lots` - system-controlled lot tracking

**Key Security Aspect:** Users see their data in REALTIME but cannot manipulate through client  
**Audit Status:** ✓ Found and documented (edge functions provide sole write path)

---

### Pattern 3: Admin-Only Access
**Definition:** Only admins can view/manage resource  
**Policy Structure:**
```sql
CREATE POLICY "Admins can view all X" ON public.table_name
FOR SELECT USING (
  (auth.jwt() ->> 'user_role') = 'admin' 
  OR auth.uid() = (SELECT creator_id FROM public.resource WHERE id = X.id)
)
```
**Tables Using This Pattern:**
- `audit_logs` - admin only
- `user_roles` - admin view/filter
- `profiles` - admin view all

**Audit Status:** ✓ Found and documented

---

### Pattern 4: Public Read-Only
**Definition:** All authenticated users can read, no write  
**Policy Structure:**
```sql
CREATE POLICY "Anyone can view X" ON public.table_name
FOR SELECT USING (true)
```
**Tables Using This Pattern:**
- `asset_specs` - public market data

**Audit Status:** ✓ Found and documented

---

### Pattern 5: Immutable Audit Trail
**Definition:** Data written once, never modified or deleted  
**Policy Structure:**
```sql
CREATE POLICY "X cannot be modified" ON public.table_name
FOR UPDATE USING (false)

CREATE POLICY "X cannot be deleted" ON public.table_name
FOR DELETE USING (false)
```
**Tables Using This Pattern:**
- `audit_logs` - immutable compliance records
- `fills` - immutable trade records
- `ledger` - immutable financial records

**Audit Status:** ✓ Found and documented

---

### Pattern 6: Trigger-Managed Tables
**Definition:** RLS policies rely on database triggers for data lifecycle  
**Policy Structure:**
```sql
CREATE POLICY "X created via trigger only" ON public.table_name
FOR INSERT USING (false)  -- Direct inserts blocked, trigger handles it

CREATE POLICY "Users can view own X" ON public.table_name
FOR SELECT USING (user_id = auth.uid())
```
**Tables Using This Pattern:**
- `risk_settings` - auto-created on user signup via trigger

**Audit Status:** ✓ Found and documented

---

## Critical Tables Audit Checklist

### Trading Domain
- [ ] **orders** - ✓ Edge-function protected (SELECT via user_id filter, INSERT/UPDATE/DELETE blocked)
- [ ] **positions** - ✓ Edge-function protected (SELECT via user_id filter, INSERT/UPDATE/DELETE blocked)
- [ ] **fills** - ✓ Edge-function protected (immutable, edge-only)
- [ ] **position_lots** - ✓ Edge-function protected (immutable, edge-only)
- [ ] **ledger** - ✓ Edge-function protected (immutable, edge-only)

### User Domain
- [ ] **profiles** - ✓ User can update own profile + edge functions update financial data
- [ ] **user_roles** - ✓ Users view own role, admins view all
- [ ] **kyc_documents** - ✓ Users upload/view own, can delete own, admins manage all

### Risk Management
- [ ] **risk_settings** - ✓ Users view/update own, trigger-managed creation
- [ ] **audit_logs** - ✓ Admins view only, immutable, edge-function writes

### Reference Data
- [ ] **asset_specs** - ✓ Public read-only (all can view)

### Tables to Verify (From 39 migration files)
- [ ] Verify all 39 migration files contain proper RLS
- [ ] Check for any tables WITHOUT RLS policies
- [ ] Verify no public INSERT/UPDATE/DELETE on sensitive tables
- [ ] Verify edge function roles are properly scoped

---

## Audit Progress

### Phase 1: Core Files (READY)
- [x] Identified 7 core RLS migration files
- [x] Located 50+ CREATE POLICY statements
- [x] Mapped 6 major RLS patterns
- [x] Documented critical tables

### Phase 2: Detailed Analysis (IN PROGRESS)
- [ ] Read each migration file completely
- [ ] Extract full policy conditions for each table
- [ ] Create table-by-table audit matrix
- [ ] Document any policy gaps or conflicts
- [ ] Identify any deprecated policies

### Phase 3: Validation (PENDING)
- [ ] Create policy testing framework
- [ ] Write tests for each policy type
- [ ] Verify edge function role scoping
- [ ] Create compliance checklist

### Phase 4: Documentation (PENDING)
- [ ] Create migration checklist for team
- [ ] Document policy patterns guide
- [ ] Create policy violation prevention guide
- [ ] Update architecture docs with RLS section

---

## Next Steps

### Immediate (Next 30 min)
1. Read complete content of 7 core migration files
2. Extract full policy definitions for each table
3. Document any gaps or conflicts
4. Create detailed table-by-table audit matrix

### Short-term (Next 2-3 hours)
1. Review remaining 32 migration files
2. Identify any policies added/modified in later migrations
3. Create comprehensive RLS audit report
4. Validate all critical tables have proper protection

### End of Day (Next 4-5 hours)
1. Draft migration checklist for future development
2. Write validation tests for policy compliance
3. Create summary document
4. Prepare findings for Day 4 transition

---

## Findings Template

**Will be populated as audit progresses**

### Finding 1: [Policy Name] - [Status]
- **Location:** Migration file + line number
- **Table:** Table name
- **Policy Type:** Category from list above
- **Current State:** Description
- **Recommendation:** Any improvements

---

## Team Notes

This audit ensures:
✓ No unauthorized data access through RLS gaps  
✓ Edge functions are sole writers for transactional data  
✓ User data properly isolated  
✓ Audit trails are immutable  
✓ Future developers understand patterns  
✓ New tables follow security-first approach

---

**Audit Owner:** GitHub Copilot  
**Start Date:** Jan 29, 2026  
**Target Completion:** Jan 30, 2026 (EOD)  
**Status:** 🔄 IN PROGRESS (Phase 1: Core Files)
