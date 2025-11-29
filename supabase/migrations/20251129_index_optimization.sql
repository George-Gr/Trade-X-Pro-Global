-- Database Index Optimization for TradeX Pro
-- 
-- This migration adds critical indexes for optimal trading platform performance.
-- These indexes target the most common query patterns in the application.

-- ========================================
-- CRITICAL TRADING PERFORMANCE INDEXES
-- ========================================

-- 1. User Profile Access Patterns (Login, Session Management)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email_active 
ON profiles(email) 
WHERE account_status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_kyc_status 
ON profiles(user_id, kyc_status, account_status);

-- 2. Order Management (Most Critical for Trading Performance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status_created_desc 
ON orders(user_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_symbol_status 
ON orders(user_id, symbol, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_pending_created 
ON orders(user_id, created_at DESC) 
WHERE status IN ('pending', 'processing');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_symbol_created_status 
ON orders(symbol, created_at DESC, status);

-- 3. Position Management (Real-time Trading)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_user_open 
ON positions(user_id, symbol) 
WHERE status = 'open';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_user_status_symbol 
ON positions(user_id, status, symbol);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_symbol_status_margin 
ON positions(symbol, status, margin_used) 
WHERE status = 'open';

-- 4. Trade History and Ledger (User Statements)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trading_history_user_created_desc 
ON trading_history(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ledger_user_created_desc 
ON ledger(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ledger_user_type_created 
ON ledger(user_id, transaction_type, created_at DESC);

-- ========================================
-- KYC AND COMPLIANCE INDEXES
-- ========================================

-- 5. KYC Document Processing (Admin Dashboard)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kyc_documents_status_created_desc 
ON kyc_documents(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kyc_documents_user_status 
ON kyc_documents(user_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kyc_documents_user_type_created 
ON kyc_documents(user_id, document_type, created_at DESC);

-- ========================================
-- RISK MANAGEMENT INDEXES
-- ========================================

-- 6. Risk Event Monitoring (Fraud Detection)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_events_severity_created_desc 
ON risk_events(severity DESC, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_events_user_status_created 
ON risk_events(user_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_events_type_status 
ON risk_events(type, status) 
WHERE severity IN ('high', 'critical');

-- 7. Margin Call Monitoring (Critical for Risk)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_margin_calls_active_user 
ON margin_calls(user_id) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_margin_calls_created_desc 
ON margin_calls(call_time DESC) 
WHERE status = 'active';

-- ========================================
-- MARKET DATA INDEXES
-- ========================================

-- 8. Market Data Access (Real-time Prices)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_market_data_symbol_timestamp_desc 
ON market_data(symbol, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_market_data_symbol_asset_class 
ON market_data(symbol, asset_class);

-- 9. Asset Specifications (Trading Configuration)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_specs_tradable_class 
ON asset_specs(symbol, asset_class) 
WHERE is_tradable = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_specs_symbol_leverage 
ON asset_specs(symbol, leverage) 
WHERE is_tradable = true;

-- ========================================
-- PRICE ALERTS INDEXES
-- ========================================

-- 10. Price Alert Management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_alerts_user_active 
ON price_alerts(user_id, status) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_alerts_symbol_active 
ON price_alerts(symbol, status) 
WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_alerts_user_symbol 
ON price_alerts(user_id, symbol, status);

-- ========================================
-- POSITION LOTS INDEXES (FIFO Tracking)
-- ========================================

-- 11. Position Lots for FIFO Processing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_lots_position_remaining 
ON position_lots(position_id, remaining_quantity) 
WHERE remaining_quantity > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_lots_position_created 
ON position_lots(position_id, created_at);

-- ========================================
-- FILL AND EXECUTION INDEXES
-- ========================================

-- 12. Trade Fills (Execution Tracking)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fills_user_created_desc 
ON fills(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fills_order_id 
ON fills(order_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fills_symbol_created 
ON fills(symbol, created_at DESC);

-- ========================================
-- PERFORMANCE MONITORING INDEXES
-- ========================================

-- 13. Audit Logs (Security and Compliance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_created_desc 
ON audit_logs(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action_created 
ON audit_logs(action, created_at DESC);

-- ========================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ========================================

-- 14. Complex User Trading Analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_symbol_date_range 
ON orders(user_id, symbol, created_at DESC) 
WHERE status = 'filled';

-- 15. Margin and Risk Analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_risk_analysis 
ON positions(user_id, symbol, equity, margin_used, pnl) 
WHERE status = 'open';

-- ========================================
-- FUNCTION-BASED INDEXES
-- ========================================

-- 16. Case-insensitive email searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email_lower 
ON profiles(lower(email));

-- 17. Symbol pattern matching
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_asset_specs_symbol_lower 
ON asset_specs(lower(symbol));

-- ========================================
-- INDEX MAINTENANCE
-- ========================================

-- Update table statistics for query planner
ANALYZE profiles;
ANALYZE orders;
ANALYZE positions;
ANALYZE trading_history;
ANALYZE kyc_documents;
ANALYZE risk_events;
ANALYZE margin_calls;
ANALYZE asset_specs;
ANALYZE price_alerts;
ANALYZE position_lots;
ANALYZE fills;
ANALYZE ledger;
ANALYZE market_data;

-- ========================================
-- VALIDATION QUERIES
-- ========================================

-- Verify critical indexes were created
SELECT 
    tablename,
    indexname,
    CASE WHEN indexname LIKE 'idx_%' THEN 'Custom Index' ELSE 'System Index' END as index_type
FROM 
    pg_indexes 
WHERE 
    indexname IN (
        'idx_profiles_email_active',
        'idx_profiles_user_kyc_status',
        'idx_orders_user_status_created_desc',
        'idx_orders_user_symbol_status',
        'idx_orders_user_pending_created',
        'idx_positions_user_open',
        'idx_kyc_documents_status_created_desc',
        'idx_risk_events_severity_created_desc',
        'idx_margin_calls_active_user',
        'idx_market_data_symbol_timestamp_desc',
        'idx_price_alerts_user_active'
    )
ORDER BY 
    tablename, indexname;

-- Display index sizes for monitoring
SELECT 
    t.tablename,
    i.indexname,
    pg_size_pretty(pg_relation_size(i.indexrelid)) as index_size
FROM 
    pg_tables t
JOIN 
    pg_indexes i ON t.tablename = i.tablename
WHERE 
    i.indexname LIKE 'idx_%'
    AND t.schemaname = 'public'
ORDER BY 
    pg_relation_size(i.indexrelid) DESC;