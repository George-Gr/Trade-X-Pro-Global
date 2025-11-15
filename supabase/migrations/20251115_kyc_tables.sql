-- KYC Tables Migration
CREATE TYPE kyc_status AS ENUM ('pending', 'auto_approved', 'submitted', 'manual_review', 'approved', 'rejected', 'suspended', 'escalated');

CREATE TABLE kyc_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  status kyc_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  provider VARCHAR(32),
  provider_ref VARCHAR(64),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_request_id UUID NOT NULL REFERENCES kyc_requests(id) ON DELETE CASCADE,
  type VARCHAR(32) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  status VARCHAR(16) NOT NULL DEFAULT 'uploaded',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_request_id UUID NOT NULL REFERENCES kyc_requests(id) ON DELETE CASCADE,
  provider VARCHAR(32),
  provider_ref VARCHAR(64),
  result VARCHAR(32),
  score NUMERIC(5,2),
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kyc_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_request_id UUID NOT NULL REFERENCES kyc_requests(id) ON DELETE CASCADE,
  actor_id UUID,
  action VARCHAR(32) NOT NULL,
  status_before kyc_status,
  status_after kyc_status,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for kyc_requests
ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;

-- Users can SELECT only their own kyc_requests
CREATE POLICY kyc_requests_select_own ON kyc_requests FOR SELECT
  USING (user_id = auth.uid());

-- Only admins (via service role) can update kyc_requests
CREATE POLICY kyc_requests_update_admin ON kyc_requests FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Service role (admin/system) can insert
CREATE POLICY kyc_requests_insert_service ON kyc_requests FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for kyc_documents
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

-- Users can view documents from their own kyc_requests
CREATE POLICY kyc_documents_select_own ON kyc_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM kyc_requests
      WHERE kyc_requests.id = kyc_documents.kyc_request_id
        AND kyc_requests.user_id = auth.uid()
    )
  );

-- Service role can access all
CREATE POLICY kyc_documents_service_all ON kyc_documents FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for kyc_verifications
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view verifications from their own kyc_requests
CREATE POLICY kyc_verifications_select_own ON kyc_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM kyc_requests
      WHERE kyc_requests.id = kyc_verifications.kyc_request_id
        AND kyc_requests.user_id = auth.uid()
    )
  );

-- Service role can access all
CREATE POLICY kyc_verifications_service_all ON kyc_verifications FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for kyc_audit
ALTER TABLE kyc_audit ENABLE ROW LEVEL SECURITY;

-- Users can view audit entries for their own kyc_requests (optional, for transparency)
CREATE POLICY kyc_audit_select_own ON kyc_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM kyc_requests
      WHERE kyc_requests.id = kyc_audit.kyc_request_id
        AND kyc_requests.user_id = auth.uid()
    )
  );

-- Service role can access all
CREATE POLICY kyc_audit_service_all ON kyc_audit FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
