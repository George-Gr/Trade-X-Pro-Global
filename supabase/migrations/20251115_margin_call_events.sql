-- Migration: Create margin_call_events table for TASK 1.3.1
-- Description: Tracks margin call events with escalation path and resolution history
-- Created: 2024-11-15

-- Create enum for margin call status
CREATE TYPE margin_call_status AS ENUM (
  'pending',
  'notified',
  'resolved',
  'escalated'
);

-- Create enum for margin call severity
CREATE TYPE margin_call_severity AS ENUM (
  'standard',
  'urgent',
  'critical'
);

-- Create enum for margin call resolution type
CREATE TYPE margin_call_resolution_type AS ENUM (
  'manual_deposit',
  'position_close',
  'liquidation'
);

-- Main margin call events table
CREATE TABLE IF NOT EXISTS margin_call_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  margin_level_at_trigger NUMERIC(10, 4) NOT NULL CHECK (margin_level_at_trigger >= 0),
  status margin_call_status NOT NULL DEFAULT 'pending'::margin_call_status,
  severity margin_call_severity NOT NULL,
  positions_at_risk INTEGER NOT NULL DEFAULT 0 CHECK (positions_at_risk >= 0),
  recommended_actions TEXT[] DEFAULT ARRAY[]::TEXT[],
  escalated_to_liquidation_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_type margin_call_resolution_type,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraint: Prevent duplicate margin calls for same user within 5 minutes
  CONSTRAINT unique_active_margin_call UNIQUE (user_id, triggered_at) WHERE status != 'resolved'::margin_call_status
);

-- Indexes for fast querying
CREATE INDEX idx_margin_call_events_user_id ON margin_call_events(user_id);
CREATE INDEX idx_margin_call_events_triggered_at ON margin_call_events(triggered_at DESC);
CREATE INDEX idx_margin_call_events_status ON margin_call_events(status);
CREATE INDEX idx_margin_call_events_severity ON margin_call_events(severity);
CREATE INDEX idx_margin_call_events_user_status ON margin_call_events(user_id, status);
CREATE INDEX idx_margin_call_events_user_triggered ON margin_call_events(user_id, triggered_at DESC);

-- Composite index for efficient queries on active margin calls
CREATE INDEX idx_margin_call_events_active 
  ON margin_call_events(user_id, created_at DESC) 
  WHERE status IN ('pending'::margin_call_status, 'notified'::margin_call_status, 'escalated'::margin_call_status);

-- Partial index for escalated calls (high priority queries)
CREATE INDEX idx_margin_call_events_escalated 
  ON margin_call_events(user_id, escalated_to_liquidation_at DESC) 
  WHERE escalated_to_liquidation_at IS NOT NULL;

-- Enable RLS (Row Level Security)
ALTER TABLE margin_call_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own margin call events
CREATE POLICY margin_call_events_user_isolation 
  ON margin_call_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policy: Service role (Edge Functions) can manage all events
CREATE POLICY margin_call_events_service_role 
  ON margin_call_events 
  FOR ALL 
  USING (auth.role() = 'service_role' OR auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_margin_call_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER margin_call_events_updated_at_trigger
BEFORE UPDATE ON margin_call_events
FOR EACH ROW
EXECUTE FUNCTION update_margin_call_events_updated_at();

-- Create audit log table for margin call events
CREATE TABLE IF NOT EXISTS margin_call_events_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  margin_call_event_id UUID NOT NULL REFERENCES margin_call_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'escalated', 'resolved'
  previous_status margin_call_status,
  new_status margin_call_status,
  previous_margin_level NUMERIC(10, 4),
  new_margin_level NUMERIC(10, 4),
  reason TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for audit log
CREATE INDEX idx_margin_call_events_audit_event_id ON margin_call_events_audit(margin_call_event_id);
CREATE INDEX idx_margin_call_events_audit_user_id ON margin_call_events_audit(user_id);
CREATE INDEX idx_margin_call_events_audit_action ON margin_call_events_audit(action);
CREATE INDEX idx_margin_call_events_audit_created_at ON margin_call_events_audit(created_at DESC);

-- Enable RLS on audit table
ALTER TABLE margin_call_events_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see audit logs for their own margin calls
CREATE POLICY margin_call_events_audit_user_isolation 
  ON margin_call_events_audit 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can manage audit logs
CREATE POLICY margin_call_events_audit_service_role 
  ON margin_call_events_audit 
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create function to log margin call state changes to audit table
CREATE OR REPLACE FUNCTION log_margin_call_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO margin_call_events_audit (
      margin_call_event_id,
      user_id,
      action,
      new_status,
      new_margin_level,
      reason
    ) VALUES (
      NEW.id,
      NEW.user_id,
      'created',
      NEW.status,
      NEW.margin_level_at_trigger,
      'Margin call event created'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO margin_call_events_audit (
        margin_call_event_id,
        user_id,
        action,
        previous_status,
        new_status,
        previous_margin_level,
        new_margin_level,
        reason
      ) VALUES (
        NEW.id,
        NEW.user_id,
        CASE 
          WHEN NEW.status = 'escalated'::margin_call_status THEN 'escalated'
          WHEN NEW.status = 'resolved'::margin_call_status THEN 'resolved'
          ELSE 'updated'
        END,
        OLD.status,
        NEW.status,
        OLD.margin_level_at_trigger,
        NEW.margin_level_at_trigger,
        NEW.notes
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER margin_call_audit_trigger
AFTER INSERT OR UPDATE ON margin_call_events
FOR EACH ROW
EXECUTE FUNCTION log_margin_call_audit();

-- Create view for active margin calls
CREATE OR REPLACE VIEW v_active_margin_calls AS
SELECT
  id,
  user_id,
  triggered_at,
  margin_level_at_trigger,
  status,
  severity,
  positions_at_risk,
  (NOW() - triggered_at) as duration,
  CASE 
    WHEN margin_level_at_trigger < 50 THEN '⚠️ CRITICAL'
    WHEN margin_level_at_trigger < 100 THEN '⚠️ URGENT'
    ELSE '⚠️ STANDARD'
  END as display_status,
  created_at,
  updated_at
FROM margin_call_events
WHERE status IN ('pending'::margin_call_status, 'notified'::margin_call_status, 'escalated'::margin_call_status)
ORDER BY severity DESC, triggered_at DESC;

-- Create view for margin call statistics per user
CREATE OR REPLACE VIEW v_margin_call_statistics AS
SELECT
  user_id,
  COUNT(*) as total_margin_calls,
  COUNT(CASE WHEN status = 'resolved'::margin_call_status THEN 1 END) as resolved_calls,
  COUNT(CASE WHEN status = 'escalated'::margin_call_status THEN 1 END) as escalated_calls,
  COUNT(CASE WHEN status IN ('pending'::margin_call_status, 'notified'::margin_call_status) THEN 1 END) as active_calls,
  AVG(CASE WHEN status = 'resolved'::margin_call_status THEN EXTRACT(EPOCH FROM (resolved_at - triggered_at)) / 60 END) as avg_resolution_time_minutes,
  MAX(triggered_at) as last_margin_call_at,
  CASE 
    WHEN COUNT(CASE WHEN status = 'escalated'::margin_call_status THEN 1 END) > 0 THEN 'HIGH_RISK'
    WHEN COUNT(CASE WHEN status IN ('pending'::margin_call_status, 'notified'::margin_call_status) THEN 1 END) > 0 THEN 'AT_RISK'
    ELSE 'SAFE'
  END as current_risk_status
FROM margin_call_events
GROUP BY user_id;

-- Grant permissions to authenticated users (for their own data)
GRANT SELECT ON margin_call_events TO authenticated;
GRANT SELECT ON v_active_margin_calls TO authenticated;
GRANT SELECT ON v_margin_call_statistics TO authenticated;

-- Grant permissions to service role (Edge Functions)
GRANT ALL ON margin_call_events TO service_role;
GRANT ALL ON margin_call_events_audit TO service_role;
GRANT SELECT ON v_active_margin_calls TO service_role;
GRANT SELECT ON v_margin_call_statistics TO service_role;
