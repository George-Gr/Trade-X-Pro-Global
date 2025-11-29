-- Database Performance Audit and Index Optimization
-- 
-- This script analyzes query performance, identifies slow queries,
-- and suggests optimal indexes for the TradeX Pro trading platform.
-- Run this in your Supabase SQL editor to get performance insights.

-- Enable query statistics collection
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Reset statistics to get clean measurements
SELECT pg_stat_statements_reset();

-- ========================================
-- PERFORMANCE ANALYSIS QUERIES
-- ========================================

-- 1. Top 10 slowest queries by average execution time
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    min_time,
    max_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM 
    pg_stat_statements 
ORDER BY 
    mean_time DESC 
LIMIT 10;

-- 2. Most frequently executed queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time,
    rows
FROM 
    pg_stat_statements 
ORDER BY 
    calls DESC 
LIMIT 10;

-- 3. Queries with highest total time consumption
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM 
    pg_stat_statements 
ORDER BY 
    total_time DESC 
LIMIT 10;

-- 4. Queries with highest I/O impact
SELECT 
    query,
    calls,
    shared_blks_read,
    shared_blks_hit,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM 
    pg_stat_statements 
ORDER BY 
    shared_blks_read DESC 
LIMIT 10;

-- ========================================
-- TABLE ANALYSIS
-- ========================================

-- 5. Table sizes and row counts
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_tup_hot_upd as hot_updates,
    seq_scan as sequential_scans,
    seq_tup_read as sequential_reads,
    idx_scan as index_scans
FROM 
    pg_stat_user_tables 
ORDER BY 
    pg_total_relation_size(tablename::regclass) DESC;

-- 6. Tables with high sequential scan activity (indicating missing indexes)
SELECT 
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    CASE WHEN seq_scan > 0 THEN round(seq_tup_read::numeric / seq_scan, 2) ELSE 0 END as avg_rows_per_scan
FROM 
    pg_stat_user_tables 
WHERE 
    seq_scan > 100  -- Only tables with significant sequential scans
ORDER BY 
    seq_scan DESC;

-- ========================================
-- INDEX ANALYSIS
-- ========================================

-- 7. Index usage statistics
SELECT 
    t.tablename,
    indexname,
    c.reltuples as num_rows,
    pg_size_pretty(pg_relation_size(quote_ident(t.tablename)::regclass)) as table_size,
    pg_size_pretty(pg_relation_size(quote_ident(t.tablename||'_'||indexname)::regclass)) as index_size,
    CASE WHEN indisunique THEN 'Y' ELSE 'N' END as unique,
    idx_scan as number_of_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM 
    pg_tables t
LEFT OUTER JOIN pg_class c ON c.relname = t.tablename
LEFT OUTER JOIN (
    SELECT c.relname as tablename, 
           ic.relname as indexname, 
           i.indisunique 
    FROM pg_index i
    JOIN pg_class ic ON ic.oid = i.indexrelid
) idx ON t.tablename = idx.tablename
WHERE 
    t.tablename NOT LIKE 'pg_%'
ORDER BY 
    pg_relation_size(quote_ident(t.tablename||'_'||indexname)::regclass) DESC;

-- 8. Unused indexes (potential candidates for removal)
SELECT 
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(quote_ident(tablename||'_'||indexname)::regclass)) as index_size,
    idx_scan
FROM 
    pg_stat_user_indexes 
WHERE 
    idx_scan = 0  -- Never used
    AND indexname NOT LIKE '%_pkey';  -- Exclude primary keys

-- ========================================
-- RECOMMENDED INDEXES
-- ========================================

-- 9. Suggested indexes based on missing index statistics
SELECT 
    'CREATE INDEX CONCURRENTLY idx_' || tablename || '_' || column_name || 
    ' ON ' || tablename || ' (' || column_name || ');' as suggested_index
FROM (
    VALUES
        -- User profiles table - frequently queried by status and KYC
        ('profiles', 'account_status'),
        ('profiles', 'kyc_status'),
        ('profiles', 'email'),
        ('profiles', 'created_at'),
        ('profiles', 'user_id'),
        
        -- Orders table - primary query patterns
        ('orders', 'user_id'),
        ('orders', 'status'),
        ('orders', 'symbol'),
        ('orders', 'created_at'),
        ('orders', 'user_id', 'status'),
        ('orders', 'user_id', 'symbol'),
        ('orders', 'user_id', 'created_at'),
        ('orders', 'symbol', 'created_at'),
        
        -- Positions table - active trading queries
        ('positions', 'user_id'),
        ('positions', 'status'),
        ('positions', 'symbol'),
        ('positions', 'user_id', 'status'),
        ('positions', 'user_id', 'symbol'),
        ('positions', 'symbol', 'status'),
        
        -- Trading history/ledger - chronological access
        ('trading_history', 'user_id'),
        ('trading_history', 'created_at'),
        ('trading_history', 'user_id', 'created_at'),
        ('trading_history', 'transaction_type'),
        ('trading_history', 'symbol'),
        
        -- KYC documents - status and user queries
        ('kyc_documents', 'user_id'),
        ('kyc_documents', 'status'),
        ('kyc_documents', 'document_type'),
        ('kyc_documents', 'created_at'),
        ('kyc_documents', 'user_id', 'status'),
        ('kyc_documents', 'user_id', 'document_type'),
        
        -- Risk events - monitoring and alerting
        ('risk_events', 'user_id'),
        ('risk_events', 'severity'),
        ('risk_events', 'status'),
        ('risk_events', 'created_at'),
        ('risk_events', 'type'),
        ('risk_events', 'user_id', 'status'),
        ('risk_events', 'severity', 'status'),
        
        -- Market data - symbol and timestamp queries
        ('market_data', 'symbol'),
        ('market_data', 'timestamp'),
        ('market_data', 'symbol', 'timestamp'),
        ('market_data', 'asset_class'),
        
        -- Asset specifications - symbol lookups
        ('asset_specs', 'symbol'),
        ('asset_specs', 'asset_class'),
        ('asset_specs', 'is_tradable'),
        ('asset_specs', 'symbol', 'is_tradable'),
        
        -- Price alerts - active monitoring
        ('price_alerts', 'user_id'),
        ('price_alerts', 'symbol'),
        ('price_alerts', 'status'),
        ('price_alerts', 'user_id', 'status'),
        ('price_alerts', 'symbol', 'status'),
        
        -- Margin calls - active monitoring
        ('margin_calls', 'user_id'),
        ('margin_calls', 'status'),
        ('margin_calls', 'call_time'),
        ('margin_calls', 'user_id', 'status')
) AS indexes(tablename, column_name)
WHERE NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = tablename 
    AND indexname LIKE '%' || column_name || '%'
);

-- ========================================
-- SPECIFIC PERFORMANCE ISSUES
-- ========================================

-- 10. Check for tables without primary keys
SELECT 
    tablename,
    'Table has no primary key' as issue
FROM 
    pg_tables 
WHERE 
    tablename NOT IN (
        SELECT tablename 
        FROM information_schema.table_constraints 
        WHERE constraint_type = 'PRIMARY KEY'
    )
    AND schemaname = 'public'
    AND tablename NOT LIKE 'pg_%';

-- 11. Check for duplicate indexes
SELECT 
    t.relname as table_name,
    i.relname as index_name,
    a.attname as column_name
FROM 
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
WHERE 
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND a.attnum = ANY(ix.indkey)
    AND t.relkind = 'r'
    AND t.relname NOT LIKE 'pg_%'
ORDER BY 
    t.relname, i.relname;

-- ========================================
-- QUERY PERFORMANCE RECOMMENDATIONS
-- ========================================

-- 12. Common query patterns that need optimization
-- These are the most critical indexes for trading platform performance

-- User account queries (frequent login and session checks)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_status 
ON profiles(user_id, account_status, kyc_status);

-- Order management (most critical for trading)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status_created 
ON orders(user_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_symbol_status 
ON orders(user_id, symbol, status);

-- Position monitoring (real-time trading)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_user_status 
ON positions(user_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_user_symbol 
ON positions(user_id, symbol) WHERE status = 'open';

-- KYC processing (admin operations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kyc_documents_status_created 
ON kyc_documents(status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kyc_documents_user_status 
ON kyc_documents(user_id, status);

-- Risk monitoring (fraud detection)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_events_severity_status 
ON risk_events(severity DESC, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_events_user_created 
ON risk_events(user_id, created_at DESC);

-- Trading history (user statements)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trading_history_user_created 
ON trading_history(user_id, created_at DESC);

-- ========================================
-- MAINTENANCE QUERIES
-- ========================================

-- 13. Check table bloat (tables that need VACUUM)
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as table_size,
    pg_stat_get_live_tuples(tablename::regclass) as live_tuples,
    pg_stat_get_dead_tuples(tablename::regclass) as dead_tuples,
    CASE 
        WHEN pg_stat_get_live_tuples(tablename::regclass) > 0 THEN
            round(100 * pg_stat_get_dead_tuples(tablename::regclass)::numeric / 
                  (pg_stat_get_live_tuples(tablename::regclass) + pg_stat_get_dead_tuples(tablename::regclass)), 2)
        ELSE 0 
    END as bloat_ratio_percent
FROM 
    pg_tables 
WHERE 
    schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
ORDER BY 
    bloat_ratio_percent DESC;

-- 14. Auto-vacuum statistics
SELECT 
    tablename,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    vacuum_count,
    autovacuum_count,
    analyze_count,
    autoanalyze_count
FROM 
    pg_stat_user_tables 
ORDER BY 
    last_vacuum ASC;

-- ========================================
-- PERFORMANCE SUMMARY
-- ========================================

-- 15. Generate a performance summary report
WITH performance_stats AS (
    SELECT 
        'Total Tables' as metric,
        COUNT(*)::text as value
    FROM pg_stat_user_tables
    
    UNION ALL
    
    SELECT 
        'Tables with Sequential Scans > 1000' as metric,
        COUNT(*)::text as value
    FROM pg_stat_user_tables 
    WHERE seq_scan > 1000
    
    UNION ALL
    
    SELECT 
        'Unused Indexes' as metric,
        COUNT(*)::text as value
    FROM pg_stat_user_indexes 
    WHERE idx_scan = 0 
    AND indexname NOT LIKE '%_pkey'
    
    UNION ALL
    
    SELECT 
        'Average Cache Hit Ratio' as metric,
        ROUND(AVG(100.0 * coalesce(shared_blks_hit, 0) / nullif(coalesce(shared_blks_hit, 0) + coalesce(shared_blks_read, 0), 0)), 2)::text || '%' as value
    FROM pg_stat_user_tables
)
SELECT * FROM performance_stats ORDER BY metric;