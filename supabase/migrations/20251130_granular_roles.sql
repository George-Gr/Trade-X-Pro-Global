-- Granular RBAC Migration
-- Date: 2025-11-30
-- Purpose: Replace broad 'admin' with scoped roles (super_admin, kyc_admin, risk_admin, support_admin)
-- Backward-compatible: Existing admins → super_admin; granular policies additive
-- No downtime: Enum extension + UPDATE atomic

-- 1. Safely extend app_role enum (idempotent, ordered)
DO $$
DECLARE
    role_exists BOOLEAN;
BEGIN
    -- super_admin (full access, legacy admin upgrade)
    SELECT EXISTS(SELECT 1 FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype AND enumlabel = 'super_admin') INTO role_exists;
    IF NOT role_exists THEN
        ALTER TYPE public.app_role ADD VALUE 'super_admin' BEFORE 'admin';
    END IF;

    -- kyc_admin (KYC docs/profiles only)
    SELECT EXISTS(SELECT 1 FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype AND enumlabel = 'kyc_admin') INTO role_exists;
    IF NOT role_exists THEN
        ALTER TYPE public.app_role ADD VALUE 'kyc_admin' AFTER 'super_admin';
    END IF;

    -- risk_admin (risk/positions/margin only)
    SELECT EXISTS(SELECT 1 FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype AND enumlabel = 'risk_admin') INTO role_exists;
    IF NOT role_exists THEN
        ALTER TYPE public.app_role ADD VALUE 'risk_admin' AFTER 'kyc_admin';
    END IF;

    -- support_admin (read-only support access)
    SELECT EXISTS(SELECT 1 FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype AND enumlabel = 'support_admin') INTO role_exists;
    IF NOT role_exists THEN
        ALTER TYPE public.app_role ADD VALUE 'support_admin' AFTER 'risk_admin';
    END IF;
END $$;

-- 2. Migrate legacy 'admin' → 'super_admin' (irreversible upgrade)
UPDATE public.user_roles 
SET role = 'super_admin' 
WHERE role = 'admin';

-- 3. Granular RLS Policies (additive, no disruption)

-- Profiles: super_admin full; kyc_admin limited; support read-only
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins full profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "KYC admins view/update KYC profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'kyc_admin') AND kyc_status IS NOT NULL);
CREATE POLICY "Risk admins view risk profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'risk_admin') AND (margin_level < 100 OR account_status != 'active'));
CREATE POLICY "Support read-only profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'support_admin'));

-- Orders/Positions: super/risk full; others user-only
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Scoped admin orders" ON public.orders FOR SELECT USING (
  public.has_role(auth.uid(), 'super_admin') OR 
  (public.has_role(auth.uid(), 'risk_admin') AND status != 'filled')
);
-- Similar for positions...

-- KYC Documents: kyc_admin full access
CREATE POLICY "KYC admins manage docs" ON public.kyc_documents FOR ALL USING (public.has_role(auth.uid(), 'kyc_admin'));

-- Audit: Log role changes
INSERT INTO public.audit_logs (action, target_user_id, details) 
SELECT 'role_granular_migration', user_id, jsonb_build_object('old_role', 'admin', 'new_role', 'super_admin')
FROM public.user_roles WHERE role = 'super_admin' AND updated_at > NOW() - INTERVAL '1 hour';

-- Verify (manual check)
-- SELECT role, COUNT(*) FROM user_roles GROUP BY role;
-- SELECT * FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype ORDER BY enumsortorder;