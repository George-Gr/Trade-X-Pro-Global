-- Risk Threshold Monitoring - Database Schema
-- Tracks portfolio-level risk metrics and alerts

-- Create risk_threshold_type enum
CREATE TYPE risk_threshold_type AS ENUM (
  'daily_loss_limit',
  'drawdown_limit',
  'concentration_limit',
  'correlation_limit',
  'var_limit'
);

-- Create risk_status enum
CREATE TYPE risk_status_enum AS ENUM (
  'safe',
  'warning',
  'critical',
  'monitor'
);

-- Create portfolio_risk_alerts table
CREATE TABLE IF NOT EXISTS portfolio_risk_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Alert details
  threshold_type risk_threshold_type NOT NULL,
  current_value NUMERIC(10, 4) NOT NULL,
  threshold_value NUMERIC(10, 4) NOT NULL,
  exceedance_percentage NUMERIC(5, 2) NOT NULL,
  
  -- Status
  alert_status risk_status_enum NOT NULL DEFAULT 'warning',
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  portfolio_metrics JSONB, -- Store snapshot of metrics at time of alert
  
  CONSTRAINT valid_timing CHECK (
    (acknowledged_at IS NULL OR acknowledged_at >= created_at) AND
    (resolved_at IS NULL OR resolved_at >= created_at)
  )
);

-- Create risk_metrics_snapshot table for historical tracking
CREATE TABLE IF NOT EXISTS risk_metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Portfolio metrics snapshot
  total_equity NUMERIC(12, 2) NOT NULL,
  total_margin_used NUMERIC(12, 2) NOT NULL,
  total_margin_required NUMERIC(12, 2) NOT NULL,
  free_margin NUMERIC(12, 2) NOT NULL,
  margin_level NUMERIC(8, 2) NOT NULL,
  
  -- P&L
  daily_pnl NUMERIC(12, 2) NOT NULL,
  daily_pnl_percentage NUMERIC(5, 2) NOT NULL,
  max_drawdown_today NUMERIC(5, 2) NOT NULL,
  
  -- Risk metrics
  total_exposure NUMERIC(12, 2) NOT NULL,
  max_concentration NUMERIC(5, 2) NOT NULL,
  portfolio_correlation NUMERIC(5, 2) NOT NULL,
  var_estimate NUMERIC(5, 2) NOT NULL,
  
  -- Status
  risk_status risk_status_enum NOT NULL,
  violated_thresholds risk_threshold_type[] DEFAULT '{}',
  
  -- Metadata
  open_position_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_metrics CHECK (
    total_equity >= 0 AND
    total_margin_used >= 0 AND
    free_margin >= 0 AND
    daily_pnl_percentage >= -100 AND
    daily_pnl_percentage <= 100 AND
    max_concentration >= 0 AND
    max_concentration <= 100 AND
    portfolio_correlation >= 0 AND
    portfolio_correlation <= 100 AND
    var_estimate >= 0 AND
    var_estimate <= 100
  )
);

-- Create user risk thresholds table (allows customization per user)
CREATE TABLE IF NOT EXISTS user_risk_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  threshold_type risk_threshold_type NOT NULL,
  threshold_value NUMERIC(10, 4) NOT NULL,
  alert_level risk_status_enum NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, threshold_type),
  CONSTRAINT valid_threshold_value CHECK (threshold_value > 0)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_portfolio_risk_alerts_user_status
  ON portfolio_risk_alerts(user_id, alert_status);

CREATE INDEX idx_portfolio_risk_alerts_created_at
  ON portfolio_risk_alerts(created_at DESC);

CREATE INDEX idx_portfolio_risk_alerts_threshold_type
  ON portfolio_risk_alerts(threshold_type);

CREATE INDEX idx_risk_metrics_snapshots_user_time
  ON risk_metrics_snapshots(user_id, created_at DESC);

CREATE INDEX idx_risk_metrics_snapshots_risk_status
  ON risk_metrics_snapshots(user_id, risk_status);

CREATE INDEX idx_user_risk_thresholds_user_id
  ON user_risk_thresholds(user_id);

-- ============================================================================
-- STORED PROCEDURES & FUNCTIONS
-- ============================================================================

-- Get current risk metrics for user
CREATE OR REPLACE FUNCTION get_portfolio_risk_metrics(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_equity NUMERIC;
  v_margin_used NUMERIC;
  v_daily_pnl NUMERIC;
  v_position_count INTEGER;
  v_result JSONB;
BEGIN
  -- Verify user authorization
  IF (SELECT auth.uid() <> p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: cannot access other user metrics';
  END IF;

  -- Fetch current positions and calculate metrics
  SELECT
    COALESCE(p.balance, 0) +
    COALESCE(SUM(CASE WHEN pos.side = 'long' THEN pos.unrealized_pnl ELSE -pos.unrealized_pnl END), 0),
    COALESCE(SUM(pos.margin_used), 0),
    0, -- daily_pnl calculation simplified
    COUNT(*)
  INTO v_equity, v_margin_used, v_daily_pnl, v_position_count
  FROM profiles p
  LEFT JOIN positions pos ON p.id = pos.user_id AND pos.status = 'open'
  WHERE p.id = p_user_id;

  v_result := jsonb_build_object(
    'total_equity', v_equity,
    'total_margin_used', v_margin_used,
    'free_margin', GREATEST(0, v_equity - v_margin_used),
    'margin_level', CASE WHEN v_margin_used > 0 THEN (v_equity / v_margin_used * 100)::NUMERIC(8, 2) ELSE 0 END,
    'daily_pnl', v_daily_pnl,
    'open_position_count', v_position_count,
    'updated_at', NOW()
  );

  RETURN v_result;
END;
$$;

-- Create portfolio risk alert
CREATE OR REPLACE FUNCTION create_portfolio_risk_alert(
  p_user_id UUID,
  p_threshold_type risk_threshold_type,
  p_current_value NUMERIC,
  p_threshold_value NUMERIC,
  p_metrics JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_alert_id UUID;
  v_exceedance NUMERIC;
BEGIN
  -- Verify user authorization
  IF (SELECT auth.uid() <> p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: cannot create alert for other user';
  END IF;

  -- Calculate exceedance percentage
  v_exceedance := ABS(((p_current_value - p_threshold_value) / p_threshold_value * 100)::NUMERIC(5, 2));

  -- Insert alert
  INSERT INTO portfolio_risk_alerts (
    user_id,
    threshold_type,
    current_value,
    threshold_value,
    exceedance_percentage,
    alert_status,
    portfolio_metrics
  ) VALUES (
    p_user_id,
    p_threshold_type,
    p_current_value,
    p_threshold_value,
    v_exceedance,
    CASE WHEN v_exceedance > 10 THEN 'critical'::risk_status_enum ELSE 'warning'::risk_status_enum END,
    p_metrics
  )
  RETURNING id INTO v_alert_id;

  RETURN v_alert_id;
END;
$$;

-- Store risk metrics snapshot
CREATE OR REPLACE FUNCTION store_risk_metrics_snapshot(
  p_user_id UUID,
  p_metrics JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_snapshot_id UUID;
BEGIN
  -- Verify user authorization
  IF (SELECT auth.uid() <> p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: cannot store metrics for other user';
  END IF;

  INSERT INTO risk_metrics_snapshots (
    user_id,
    total_equity,
    total_margin_used,
    total_margin_required,
    free_margin,
    margin_level,
    daily_pnl,
    daily_pnl_percentage,
    max_drawdown_today,
    total_exposure,
    max_concentration,
    portfolio_correlation,
    var_estimate,
    risk_status,
    open_position_count
  ) VALUES (
    p_user_id,
    (p_metrics->>'total_equity')::NUMERIC,
    (p_metrics->>'total_margin_used')::NUMERIC,
    (p_metrics->>'total_margin_required')::NUMERIC,
    (p_metrics->>'free_margin')::NUMERIC,
    (p_metrics->>'margin_level')::NUMERIC,
    (p_metrics->>'daily_pnl')::NUMERIC,
    (p_metrics->>'daily_pnl_percentage')::NUMERIC,
    (p_metrics->>'max_drawdown_today')::NUMERIC,
    (p_metrics->>'total_exposure')::NUMERIC,
    (p_metrics->>'max_concentration')::NUMERIC,
    (p_metrics->>'portfolio_correlation')::NUMERIC,
    (p_metrics->>'var_estimate')::NUMERIC,
    (p_metrics->>'risk_status')::risk_status_enum,
    (p_metrics->>'open_position_count')::INTEGER
  )
  RETURNING id INTO v_snapshot_id;

  RETURN v_snapshot_id;
END;
$$;

-- Acknowledge risk alert
CREATE OR REPLACE FUNCTION acknowledge_risk_alert(
  p_user_id UUID,
  p_alert_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Verify user authorization and ownership
  SELECT COUNT(*) INTO v_count
  FROM portfolio_risk_alerts
  WHERE id = p_alert_id AND user_id = p_user_id;

  IF v_count = 0 THEN
    RAISE EXCEPTION 'Alert not found or unauthorized access';
  END IF;

  UPDATE portfolio_risk_alerts
  SET acknowledged_at = NOW()
  WHERE id = p_alert_id;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE portfolio_risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_risk_thresholds ENABLE ROW LEVEL SECURITY;

-- Policies for portfolio_risk_alerts
CREATE POLICY alerts_select_own ON portfolio_risk_alerts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY alerts_insert_own ON portfolio_risk_alerts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY alerts_update_own ON portfolio_risk_alerts
  FOR UPDATE USING (user_id = auth.uid());

-- Policies for risk_metrics_snapshots
CREATE POLICY snapshots_select_own ON risk_metrics_snapshots
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY snapshots_insert_own ON risk_metrics_snapshots
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policies for user_risk_thresholds
CREATE POLICY thresholds_select_own ON user_risk_thresholds
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY thresholds_insert_own ON user_risk_thresholds
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY thresholds_update_own ON user_risk_thresholds
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY thresholds_delete_own ON user_risk_thresholds
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- TRIGGER FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_risk_thresholds_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_user_risk_thresholds_updated_at
  BEFORE UPDATE ON user_risk_thresholds
  FOR EACH ROW
  EXECUTE FUNCTION update_user_risk_thresholds_updated_at();
