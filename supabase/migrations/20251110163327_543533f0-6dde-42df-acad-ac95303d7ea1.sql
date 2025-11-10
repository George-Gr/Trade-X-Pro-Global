-- Create admin_audit_log table for comprehensive audit trail
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Audit logs cannot be modified or deleted
CREATE POLICY "Audit logs cannot be modified"
ON public.admin_audit_log
FOR UPDATE
USING (false);

CREATE POLICY "Audit logs cannot be deleted"
ON public.admin_audit_log
FOR DELETE
USING (false);

-- Only edge functions can insert audit logs
CREATE POLICY "Audit logs created via edge functions only"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (false);

-- Add index for performance
CREATE INDEX idx_admin_audit_log_admin_user ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_target_user ON public.admin_audit_log(target_user_id);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);