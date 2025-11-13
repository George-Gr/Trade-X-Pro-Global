/**
 * Database Migration: Margin Alerts System
 * 
 * Creates:
 * - margin_alerts table for storing margin level monitoring alerts
 * - margin_alert_status enum for alert lifecycle
 * - Columns on profiles table for margin monitoring
 * - Indexes for fast queries
 * - Triggers for automatic alert creation on margin changes
 * - RLS policies for secure data access
 * 
 * Purpose: TASK 1.2.4 - Margin Level Monitoring & Alerts
 * Enables real-time monitoring of margin levels and automatic alerting
 */

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Alert status lifecycle
CREATE TYPE margin_alert_status AS ENUM (
  'pending',      -- Alert created, awaiting notification
  'notified',     -- User has been notified
  'resolved',     -- Margin level improved
  'acknowledged'  -- User acknowledged the alert
);

-- ============================================================================
-- TABLE: margin_alerts
-- ============================================================================

CREATE TABLE IF NOT EXISTS margin_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Margin status information
  previous_status text,           -- Last margin status (SAFE, WARNING, CRITICAL, LIQUIDATION)
  current_status text NOT NULL,   -- Current margin status
  margin_level numeric(10, 2),    -- Margin level percentage at time of alert
  equity numeric(15, 2),          -- Account equity at time of alert
  margin_used numeric(15, 2),     -- Margin used at time of alert
  
  -- Alert metadata
  alert_type text NOT NULL,       -- e.g., 'status_change', 'threshold_crossed', 'periodic_check'
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
  is_threshold_crossed boolean DEFAULT false,
  
  -- Action information
  action_required text[],         -- Array of recommended actions
  recommended_urgency text,       -- Urgency level for actions
  
  -- Status and lifecycle
  status margin_alert_status DEFAULT 'pending',
  notification_sent_at timestamp with time zone,
  acknowledged_at timestamp with time zone,
  resolved_at timestamp with time zone,
  resolution_reason text,
  
  -- Deduplication
  dedup_hash text,                -- Hash for detecting duplicate alerts within window
  last_alert_id uuid REFERENCES margin_alerts(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- COLUMNS: Add to profiles table
-- ============================================================================

-- Add margin monitoring columns if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'margin_level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN margin_level numeric(10, 2) DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'margin_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN margin_status text DEFAULT 'SAFE';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_margin_alert_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_margin_alert_at timestamp with time zone DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'margin_alert_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN margin_alert_status text DEFAULT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'time_to_liquidation_minutes'
  ) THEN
    ALTER TABLE profiles ADD COLUMN time_to_liquidation_minutes integer DEFAULT NULL;
  END IF;
END $$;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Fast lookups for margin alerts
CREATE INDEX IF NOT EXISTS idx_margin_alerts_user_id ON margin_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_margin_alerts_status ON margin_alerts(status);
CREATE INDEX IF NOT EXISTS idx_margin_alerts_current_status ON margin_alerts(current_status);
CREATE INDEX IF NOT EXISTS idx_margin_alerts_created_at ON margin_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_margin_alerts_user_created ON margin_alerts(user_id, created_at DESC);

-- Deduplication queries
CREATE INDEX IF NOT EXISTS idx_margin_alerts_dedup ON margin_alerts(user_id, current_status, created_at DESC);

-- Profile margin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_margin_status ON profiles(margin_status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_margin_alert ON profiles(last_margin_alert_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

/**
 * Function: calculate_margin_level
 * Purpose: Calculate margin level percentage from equity and margin used
 * Parameters:
 *   p_account_equity: Total account equity
 *   p_margin_used: Total margin currently used
 * Returns: Margin level as percentage (equity / margin_used * 100)
 */
CREATE OR REPLACE FUNCTION calculate_margin_level(
  p_account_equity numeric,
  p_margin_used numeric
) RETURNS numeric AS $$
BEGIN
  IF p_margin_used IS NULL OR p_margin_used = 0 THEN
    RETURN NULL;  -- Infinite margin level
  END IF;
  
  IF p_margin_used < 0 THEN
    RETURN 0;     -- Invalid state
  END IF;
  
  RETURN ROUND((p_account_equity / p_margin_used) * 100, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

/**
 * Function: get_margin_status
 * Purpose: Classify margin level into status categories
 * Parameters: p_margin_level - margin percentage
 * Returns: Status string (SAFE, WARNING, CRITICAL, LIQUIDATION)
 */
CREATE OR REPLACE FUNCTION get_margin_status(p_margin_level numeric)
RETURNS text AS $$
BEGIN
  IF p_margin_level >= 200 THEN
    RETURN 'SAFE';
  ELSIF p_margin_level >= 100 THEN
    RETURN 'WARNING';
  ELSIF p_margin_level >= 50 THEN
    RETURN 'CRITICAL';
  ELSE
    RETURN 'LIQUIDATION';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

/**
 * Function: should_create_margin_alert
 * Purpose: Determine if a new alert should be created (prevents spam)
 * Parameters:
 *   p_user_id: User ID
 *   p_current_status: Current margin status
 *   p_alert_window_minutes: Minimum minutes between alerts for same status
 * Returns: true if alert should be created, false otherwise
 */
CREATE OR REPLACE FUNCTION should_create_margin_alert(
  p_user_id uuid,
  p_current_status text,
  p_alert_window_minutes integer DEFAULT 5
) RETURNS boolean AS $$
DECLARE
  v_last_alert_time timestamp with time zone;
  v_last_alert_status text;
  v_minutes_since_alert numeric;
BEGIN
  -- Get the most recent alert for this user
  SELECT last_margin_alert_at, margin_alert_status
  INTO v_last_alert_time, v_last_alert_status
  FROM profiles
  WHERE id = p_user_id;
  
  -- Always create alert if no previous alert
  IF v_last_alert_time IS NULL THEN
    RETURN true;
  END IF;
  
  -- Create alert if status changed
  IF v_last_alert_status != p_current_status THEN
    RETURN true;
  END IF;
  
  -- Create alert if enough time has passed since last alert of same status
  v_minutes_since_alert := EXTRACT(EPOCH FROM (now() - v_last_alert_time)) / 60;
  RETURN v_minutes_since_alert >= p_alert_window_minutes;
END;
$$ LANGUAGE plpgsql STABLE;

/**
 * Function: create_margin_alert
 * Purpose: Create a new margin alert (called by trigger or manually)
 * Returns: The created alert record
 */
CREATE OR REPLACE FUNCTION create_margin_alert(
  p_user_id uuid,
  p_current_status text,
  p_previous_status text DEFAULT NULL,
  p_margin_level numeric DEFAULT NULL,
  p_equity numeric DEFAULT NULL,
  p_margin_used numeric DEFAULT NULL,
  p_action_required text[] DEFAULT NULL
) RETURNS margin_alerts AS $$
DECLARE
  v_alert margin_alerts;
  v_severity text;
  v_alert_type text;
  v_dedup_hash text;
BEGIN
  -- Determine severity and alert type
  CASE p_current_status
    WHEN 'SAFE' THEN
      v_severity := 'info';
      v_alert_type := 'status_change';
    WHEN 'WARNING' THEN
      v_severity := 'warning';
      v_alert_type := CASE WHEN p_previous_status = 'SAFE' THEN 'status_change' ELSE 'periodic_check' END;
    WHEN 'CRITICAL' THEN
      v_severity := 'critical';
      v_alert_type := CASE WHEN p_previous_status = 'WARNING' THEN 'status_change' ELSE 'periodic_check' END;
    WHEN 'LIQUIDATION' THEN
      v_severity := 'emergency';
      v_alert_type := CASE WHEN p_previous_status IS NOT NULL THEN 'status_change' ELSE 'periodic_check' END;
    ELSE
      v_severity := 'info';
      v_alert_type := 'periodic_check';
  END CASE;
  
  -- Generate deduplication hash
  v_dedup_hash := md5(p_user_id::text || p_current_status || DATE_TRUNC('hour', now())::text);
  
  -- Create the alert
  INSERT INTO margin_alerts (
    user_id,
    previous_status,
    current_status,
    margin_level,
    equity,
    margin_used,
    alert_type,
    severity,
    action_required,
    recommended_urgency,
    dedup_hash
  ) VALUES (
    p_user_id,
    p_previous_status,
    p_current_status,
    p_margin_level,
    p_equity,
    p_margin_used,
    v_alert_type,
    v_severity,
    p_action_required,
    v_severity,
    v_dedup_hash
  ) RETURNING * INTO v_alert;
  
  -- Update user's profile with latest margin alert info
  UPDATE profiles
  SET
    last_margin_alert_at = now(),
    margin_alert_status = p_current_status,
    updated_at = now()
  WHERE id = p_user_id;
  
  RETURN v_alert;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

/**
 * Trigger: check_and_alert_margin_level
 * Purpose: Automatically create alerts when margin level changes
 * Fires: AFTER UPDATE on profiles.margin_level or profiles.margin_status
 */
CREATE OR REPLACE FUNCTION fn_check_and_alert_margin_level()
RETURNS TRIGGER AS $$
DECLARE
  v_should_alert boolean;
  v_action_required text[];
BEGIN
  -- Only process if margin status actually changed
  IF NEW.margin_status = OLD.margin_status THEN
    RETURN NEW;
  END IF;
  
  -- Check if we should create an alert (prevent spam)
  v_should_alert := should_create_margin_alert(
    NEW.id,
    NEW.margin_status,
    5  -- Minimum 5 minutes between alerts
  );
  
  IF v_should_alert THEN
    -- Determine recommended actions based on new status
    CASE NEW.margin_status
      WHEN 'SAFE' THEN
        v_action_required := ARRAY['monitor'];
      WHEN 'WARNING' THEN
        v_action_required := ARRAY['reduce_size', 'add_funds'];
      WHEN 'CRITICAL' THEN
        v_action_required := ARRAY['close_positions', 'add_funds_urgent', 'order_restriction'];
      WHEN 'LIQUIDATION' THEN
        v_action_required := ARRAY['force_liquidation', 'emergency_deposit'];
      ELSE
        v_action_required := ARRAY['monitor'];
    END CASE;
    
    -- Create the alert
    PERFORM create_margin_alert(
      NEW.id,
      NEW.margin_status,
      OLD.margin_status,
      NEW.margin_level,
      NEW.account_equity,
      NEW.margin_used,
      v_action_required
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS margin_level_alert_trigger ON profiles;
CREATE TRIGGER margin_level_alert_trigger
AFTER UPDATE OF margin_status ON profiles
FOR EACH ROW
EXECUTE FUNCTION fn_check_and_alert_margin_level();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on margin_alerts
ALTER TABLE margin_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own margin alerts
CREATE POLICY "margin_alerts_select_own" ON margin_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users cannot insert margin alerts (system only)
CREATE POLICY "margin_alerts_no_insert" ON margin_alerts
  FOR INSERT
  WITH CHECK (false);

-- Policy: Users cannot update margin alerts (except specific fields through function)
CREATE POLICY "margin_alerts_no_update" ON margin_alerts
  FOR UPDATE
  USING (false);

-- Policy: Users cannot delete margin alerts
CREATE POLICY "margin_alerts_no_delete" ON margin_alerts
  FOR DELETE
  USING (false);

-- Admin policy: Admins can view all margin alerts (if needed)
CREATE POLICY "margin_alerts_admin_select" ON margin_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- UTILITY FUNCTIONS FOR QUERIES
-- ============================================================================

/**
 * Function: get_user_margin_alerts
 * Purpose: Get recent margin alerts for a user
 * Returns: Recent alerts with key information
 */
CREATE OR REPLACE FUNCTION get_user_margin_alerts(
  p_user_id uuid DEFAULT auth.uid(),
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  current_status text,
  previous_status text,
  margin_level numeric,
  severity text,
  alert_type text,
  status margin_alert_status,
  created_at timestamp with time zone,
  notification_sent_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ma.id,
    ma.current_status,
    ma.previous_status,
    ma.margin_level,
    ma.severity,
    ma.alert_type,
    ma.status,
    ma.created_at,
    ma.notification_sent_at
  FROM margin_alerts ma
  WHERE ma.user_id = p_user_id
  ORDER BY ma.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

/**
 * Function: mark_alert_notified
 * Purpose: Mark an alert as notified (sent to user)
 */
CREATE OR REPLACE FUNCTION mark_alert_notified(
  p_alert_id uuid
) RETURNS margin_alerts AS $$
DECLARE
  v_alert margin_alerts;
BEGIN
  UPDATE margin_alerts
  SET
    status = 'notified',
    notification_sent_at = now(),
    updated_at = now()
  WHERE id = p_alert_id
  RETURNING * INTO v_alert;
  
  RETURN v_alert;
END;
$$ LANGUAGE plpgsql;

/**
 * Function: acknowledge_margin_alert
 * Purpose: User acknowledges a margin alert
 */
CREATE OR REPLACE FUNCTION acknowledge_margin_alert(
  p_alert_id uuid
) RETURNS margin_alerts AS $$
DECLARE
  v_alert margin_alerts;
BEGIN
  UPDATE margin_alerts
  SET
    status = 'acknowledged',
    acknowledged_at = now(),
    updated_at = now()
  WHERE id = p_alert_id AND user_id = auth.uid()
  RETURNING * INTO v_alert;
  
  RETURN v_alert;
END;
$$ LANGUAGE plpgsql;

/**
 * Function: resolve_margin_alert
 * Purpose: Mark alert as resolved (margin improved)
 */
CREATE OR REPLACE FUNCTION resolve_margin_alert(
  p_alert_id uuid,
  p_reason text DEFAULT 'Margin level improved'
) RETURNS margin_alerts AS $$
DECLARE
  v_alert margin_alerts;
BEGIN
  UPDATE margin_alerts
  SET
    status = 'resolved',
    resolved_at = now(),
    resolution_reason = p_reason,
    updated_at = now()
  WHERE id = p_alert_id AND user_id = auth.uid()
  RETURNING * INTO v_alert;
  
  RETURN v_alert;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE margin_alerts IS 'Stores margin level monitoring alerts for users. Created automatically when margin status changes.';
COMMENT ON TYPE margin_alert_status IS 'Alert lifecycle status: pending -> notified -> resolved/acknowledged';
COMMENT ON FUNCTION calculate_margin_level IS 'Calculate margin level percentage: (equity / margin_used) * 100';
COMMENT ON FUNCTION get_margin_status IS 'Map margin percentage to status: SAFE (>=200%), WARNING (100-199%), CRITICAL (50-99%), LIQUIDATION (<50%)';
