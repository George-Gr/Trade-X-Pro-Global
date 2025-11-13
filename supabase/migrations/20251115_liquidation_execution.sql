-- Migration: Create liquidation execution tables for TASK 1.3.2
-- Description: Tracks forced position closures when margin levels fall below critical thresholds
-- Created: 2024-11-15

-- Create enum for liquidation status
CREATE TYPE liquidation_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'failed',
  'partial',
  'cancelled'
);

-- Create enum for liquidation reason
CREATE TYPE liquidation_reason AS ENUM (
  'margin_call_timeout',
  'critical_threshold',
  'manual_forced',
  'risk_limit_breach'
);

-- Main liquidation events table
CREATE TABLE IF NOT EXISTS liquidation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  margin_call_event_id UUID REFERENCES margin_call_events(id) ON DELETE SET NULL,
  reason liquidation_reason NOT NULL,
  status liquidation_status NOT NULL DEFAULT 'pending'::liquidation_status,
  initiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  initial_margin_level NUMERIC(10, 4) NOT NULL CHECK (initial_margin_level >= 0),
  final_margin_level NUMERIC(10, 4) NOT NULL CHECK (final_margin_level >= 0),
  initial_equity NUMERIC(15, 2) NOT NULL,
  final_equity NUMERIC(15, 2) NOT NULL,
  positions_liquidated INTEGER NOT NULL DEFAULT 0 CHECK (positions_liquidated >= 0),
  total_realized_pnl NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total_slippage_applied NUMERIC(10, 4) NOT NULL DEFAULT 0 CHECK (total_slippage_applied >= 0),
  details JSONB DEFAULT '{}'::JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for liquidation events
CREATE INDEX idx_liquidation_events_user_id ON liquidation_events(user_id);
CREATE INDEX idx_liquidation_events_initiated_at ON liquidation_events(initiated_at DESC);
CREATE INDEX idx_liquidation_events_status ON liquidation_events(status);
CREATE INDEX idx_liquidation_events_reason ON liquidation_events(reason);
CREATE INDEX idx_liquidation_events_user_status ON liquidation_events(user_id, status);
CREATE INDEX idx_liquidation_events_user_initiated ON liquidation_events(user_id, initiated_at DESC);

-- Composite index for active liquidations
CREATE INDEX idx_liquidation_events_active 
  ON liquidation_events(user_id, initiated_at DESC) 
  WHERE status IN ('pending'::liquidation_status, 'in_progress'::liquidation_status);

-- Closed positions detail table - tracks each liquidated position
CREATE TABLE IF NOT EXISTS liquidation_closed_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liquidation_event_id UUID NOT NULL REFERENCES liquidation_events(id) ON DELETE CASCADE,
  position_id UUID NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity NUMERIC(20, 4) NOT NULL,
  entry_price NUMERIC(15, 4) NOT NULL CHECK (entry_price > 0),
  liquidation_price NUMERIC(15, 4) NOT NULL CHECK (liquidation_price > 0),
  slippage_percentage NUMERIC(10, 4) NOT NULL DEFAULT 0 CHECK (slippage_percentage >= 0),
  realized_pnl NUMERIC(15, 2) NOT NULL,
  pnl_percentage NUMERIC(10, 4) NOT NULL,
  closure_reason VARCHAR(255),
  closed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for closed positions
CREATE INDEX idx_liquidation_closed_positions_event_id ON liquidation_closed_positions(liquidation_event_id);
CREATE INDEX idx_liquidation_closed_positions_position_id ON liquidation_closed_positions(position_id);
CREATE INDEX idx_liquidation_closed_positions_symbol ON liquidation_closed_positions(symbol);
CREATE INDEX idx_liquidation_closed_positions_closed_at ON liquidation_closed_positions(closed_at DESC);

-- Failed liquidation attempts tracking
CREATE TABLE IF NOT EXISTS liquidation_failed_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liquidation_event_id UUID NOT NULL REFERENCES liquidation_events(id) ON DELETE CASCADE,
  position_id UUID NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  error_message TEXT NOT NULL,
  error_type VARCHAR(100),
  retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for failed attempts
CREATE INDEX idx_liquidation_failed_attempts_event_id ON liquidation_failed_attempts(liquidation_event_id);
CREATE INDEX idx_liquidation_failed_attempts_position_id ON liquidation_failed_attempts(position_id);
CREATE INDEX idx_liquidation_failed_attempts_attempted_at ON liquidation_failed_attempts(attempted_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE liquidation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidation_closed_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidation_failed_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own liquidation events
CREATE POLICY liquidation_events_user_isolation 
  ON liquidation_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policy: Users can see closed positions from their liquidations
CREATE POLICY liquidation_closed_positions_user_isolation 
  ON liquidation_closed_positions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM liquidation_events 
      WHERE id = liquidation_event_id AND user_id = auth.uid()
    )
  );

-- RLS Policy: Users can see failed attempts from their liquidations
CREATE POLICY liquidation_failed_attempts_user_isolation 
  ON liquidation_failed_attempts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM liquidation_events 
      WHERE id = liquidation_event_id AND user_id = auth.uid()
    )
  );

-- RLS Policy: Service role can manage all liquidation data
CREATE POLICY liquidation_events_service_role 
  ON liquidation_events 
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY liquidation_closed_positions_service_role 
  ON liquidation_closed_positions 
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY liquidation_failed_attempts_service_role 
  ON liquidation_failed_attempts 
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_liquidation_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER liquidation_events_updated_at_trigger
BEFORE UPDATE ON liquidation_events
FOR EACH ROW
EXECUTE FUNCTION update_liquidation_events_updated_at();

-- Audit log table for liquidation events
CREATE TABLE IF NOT EXISTS liquidation_events_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liquidation_event_id UUID NOT NULL REFERENCES liquidation_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'completed', 'failed'
  previous_status liquidation_status,
  new_status liquidation_status,
  previous_margin_level NUMERIC(10, 4),
  new_margin_level NUMERIC(10, 4),
  reason TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for audit log
CREATE INDEX idx_liquidation_events_audit_event_id ON liquidation_events_audit(liquidation_event_id);
CREATE INDEX idx_liquidation_events_audit_user_id ON liquidation_events_audit(user_id);
CREATE INDEX idx_liquidation_events_audit_action ON liquidation_events_audit(action);
CREATE INDEX idx_liquidation_events_audit_created_at ON liquidation_events_audit(created_at DESC);

-- Enable RLS on audit table
ALTER TABLE liquidation_events_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see audit logs for their own liquidations
CREATE POLICY liquidation_events_audit_user_isolation 
  ON liquidation_events_audit 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can manage audit logs
CREATE POLICY liquidation_events_audit_service_role 
  ON liquidation_events_audit 
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create function to log liquidation state changes
CREATE OR REPLACE FUNCTION log_liquidation_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO liquidation_events_audit (
      liquidation_event_id,
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
      NEW.initial_margin_level,
      'Liquidation event created'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO liquidation_events_audit (
        liquidation_event_id,
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
          WHEN NEW.status = 'completed'::liquidation_status THEN 'completed'
          WHEN NEW.status = 'failed'::liquidation_status THEN 'failed'
          ELSE 'updated'
        END,
        OLD.status,
        NEW.status,
        OLD.final_margin_level,
        NEW.final_margin_level,
        NEW.notes
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER liquidation_audit_trigger
AFTER INSERT OR UPDATE ON liquidation_events
FOR EACH ROW
EXECUTE FUNCTION log_liquidation_audit();

-- Create view for liquidation statistics
CREATE OR REPLACE VIEW v_liquidation_statistics AS
SELECT
  user_id,
  COUNT(*) as total_liquidations,
  COUNT(CASE WHEN status = 'completed'::liquidation_status THEN 1 END) as completed_liquidations,
  COUNT(CASE WHEN status = 'failed'::liquidation_status THEN 1 END) as failed_liquidations,
  COUNT(CASE WHEN status IN ('pending'::liquidation_status, 'in_progress'::liquidation_status) THEN 1 END) as active_liquidations,
  SUM(positions_liquidated) as total_positions_liquidated,
  SUM(total_realized_pnl) as total_realized_loss,
  AVG(total_slippage_applied) as avg_slippage,
  MAX(initiated_at) as last_liquidation_at,
  CASE 
    WHEN COUNT(CASE WHEN status = 'completed'::liquidation_status THEN 1 END) > 2 THEN 'HIGH_RISK'
    WHEN COUNT(CASE WHEN status = 'completed'::liquidation_status THEN 1 END) > 0 THEN 'MEDIUM_RISK'
    ELSE 'LOW_RISK'
  END as risk_profile
FROM liquidation_events
GROUP BY user_id;

-- Grant permissions to authenticated users
GRANT SELECT ON liquidation_events TO authenticated;
GRANT SELECT ON liquidation_closed_positions TO authenticated;
GRANT SELECT ON v_liquidation_statistics TO authenticated;

-- Grant permissions to service role
GRANT ALL ON liquidation_events TO service_role;
GRANT ALL ON liquidation_closed_positions TO service_role;
GRANT ALL ON liquidation_failed_attempts TO service_role;
GRANT ALL ON liquidation_events_audit TO service_role;
GRANT SELECT ON v_liquidation_statistics TO service_role;
