-- Security & Performance Indexes Migration
-- Date: 2025-11-30
-- Purpose: Add composite indexes for high-traffic queries to improve realtime perf
-- Non-blocking: Uses CONCURRENTLY to avoid locking tables during creation

-- Index for positions queries (user_id, status, created_at DESC)
-- Used by: useRealtimePositions.tsx, useOrdersTable.tsx, dashboard queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_user_status_created 
ON positions (user_id, status, created_at DESC);

-- Index for orders queries (user_id, created_at DESC)
-- Used by: useOrdersTable.tsx, trading history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_created 
ON orders (user_id, created_at DESC);

-- Index for margin_history (user_id, created_at DESC)
-- Used by: useMarginMonitoring.tsx, risk dashboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_margin_history_user_time 
ON margin_history (user_id, created_at DESC);

-- Additional common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_events_user_created 
ON risk_events (user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read 
ON notifications (user_id, is_read, created_at DESC);

-- Post-index analysis for query planner optimization
ANALYZE positions;
ANALYZE orders;
ANALYZE margin_history;
ANALYZE risk_events;
ANALYZE notifications;

-- Verify indexes created (comment for audit)
-- SELECT schemaname, tablename, indexname FROM pg_indexes 
-- WHERE tablename IN ('positions', 'orders', 'margin_history');