/**
 * Database Performance Monitoring Function
 * 
 * This Supabase function provides comprehensive database performance monitoring
 * including slow query analysis, index usage, and performance recommendations.
 * 
 * Endpoint: GET /functions/db-monitor
 * Response: Performance metrics and optimization recommendations
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

interface DatabaseMetrics {
  query_performance: QueryPerformanceMetrics;
  index_usage: IndexUsageMetrics;
  table_statistics: TableStatistics[];
  recommendations: PerformanceRecommendation[];
  overall_health: DatabaseHealth;
}

interface QueryPerformanceMetrics {
  top_slow_queries: SlowQuery[];
  most_frequent_queries: FrequentQuery[];
  highest_io_queries: IOQuery[];
  total_queries_monitored: number;
}

interface IndexUsageMetrics {
  unused_indexes: UnusedIndex[];
  index_hit_ratios: IndexHitRatio[];
  recommended_indexes: RecommendedIndex[];
}

interface TableStatistics {
  table_name: string;
  size_mb: number;
  row_count: number;
  sequential_scans: number;
  index_scans: number;
  inserts: number;
  updates: number;
  deletes: number;
  bloat_percentage: number;
}

interface PerformanceRecommendation {
  type: 'index' | 'maintenance' | 'configuration' | 'query_optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimated_impact: string;
  sql_command?: string;
}

interface DatabaseHealth {
  overall_score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  issues_count: { high: number; medium: number; low: number };
  last_updated: string;
}

interface SlowQuery {
  query: string;
  mean_time_ms: number;
  total_time_ms: number;
  calls: number;
  rows_per_call: number;
}

interface FrequentQuery {
  query: string;
  calls: number;
  total_time_ms: number;
  mean_time_ms: number;
}

interface IOQuery {
  query: string;
  blocks_read: number;
  blocks_hit: number;
  hit_percentage: number;
}

interface UnusedIndex {
  table_name: string;
  index_name: string;
  size_mb: number;
}

interface IndexHitRatio {
  table_name: string;
  index_name: string;
  scans: number;
  hit_ratio: number;
}

interface RecommendedIndex {
  table_name: string;
  columns: string[];
  estimated_benefit: string;
  sql_command: string;
}

export default async function (req: Request) {
  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get service role key for admin operations
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Service role key not configured',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Authenticate as service role
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey)

    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      })
    }

    // Get all metrics
    const metrics = await getDatabaseMetrics(adminSupabase)

    return new Response(JSON.stringify({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Database monitoring function error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

async function getDatabaseMetrics(supabase: any): Promise<DatabaseMetrics> {
  const [
    queryPerformance,
    indexUsage,
    tableStats,
    recommendations
  ] = await Promise.all([
    getQueryPerformanceMetrics(supabase),
    getIndexUsageMetrics(supabase),
    getTableStatistics(supabase),
    getPerformanceRecommendations(supabase)
  ])

  const overallHealth = calculateDatabaseHealth(queryPerformance, indexUsage, tableStats, recommendations)

  return {
    query_performance: queryPerformance,
    index_usage: indexUsage,
    table_statistics: tableStats,
    recommendations,
    overall_health: overallHealth
  }
}

async function getQueryPerformanceMetrics(supabase: any): Promise<QueryPerformanceMetrics> {
  // Check if pg_stat_statements is available
  const { data: extCheck } = await supabase
    .from('pg_extension')
    .select('extname')
    .eq('extname', 'pg_stat_statements')

  if (!extCheck || extCheck.length === 0) {
    return {
      top_slow_queries: [],
      most_frequent_queries: [],
      highest_io_queries: [],
      total_queries_monitored: 0
    }
  }

  // Get slow queries
  const { data: slowQueries } = await supabase.rpc('get_slow_queries', {
    limit_count: 10
  })

  // Get frequent queries
  const { data: frequentQueries } = await supabase.rpc('get_frequent_queries', {
    limit_count: 10
  })

  // Get I/O intensive queries
  const { data: ioQueries } = await supabase.rpc('get_io_intensive_queries', {
    limit_count: 10
  })

  // Count total monitored queries
  const { data: totalQueryCount } = await supabase.rpc('get_total_query_count')

  return {
    top_slow_queries: slowQueries || [],
    most_frequent_queries: frequentQueries || [],
    highest_io_queries: ioQueries || [],
    total_queries_monitored: totalQueryCount?.[0]?.count || 0
  }
}

async function getIndexUsageMetrics(supabase: any): Promise<IndexUsageMetrics> {
  // Get unused indexes
  const { data: unusedIndexData } = await supabase.rpc('get_unused_indexes')

  // Get index hit ratios
  const { data: hitRatios } = await supabase.rpc('get_index_hit_ratios')

  // Get recommended indexes based on missing statistics
  const { data: recommendations } = await supabase.rpc('get_index_recommendations')

  return {
    unused_indexes: unusedIndexData || [],
    index_hit_ratios: hitRatios || [],
    recommended_indexes: recommendations || []
  }
}

async function getTableStatistics(supabase: any): Promise<TableStatistics[]> {
  const { data } = await supabase.rpc('get_table_statistics')
  
  return (data || []).map((table: any) => ({
    table_name: table.tablename,
    size_mb: Math.round(table.size_bytes / (1024 * 1024)),
    row_count: table.n_tup_ins + table.n_tup_upd,
    sequential_scans: table.seq_scan,
    index_scans: table.idx_scan,
    inserts: table.n_tup_ins,
    updates: table.n_tup_upd,
    deletes: table.n_tup_del,
    bloat_percentage: table.bloat_ratio_percent || 0
  }))
}

async function getPerformanceRecommendations(supabase: any): Promise<PerformanceRecommendation[]> {
  const recommendations: PerformanceRecommendation[] = []
  
  // Get table statistics to identify issues
  const { data: tableStats } = await supabase.rpc('get_table_statistics')
  
  // Check for tables with high sequential scan ratios
  const highSeqScanTables = (tableStats || []).filter((table: any) => {
    const totalScans = table.seq_scan + table.idx_scan
    return totalScans > 100 && (table.seq_scan / totalScans) > 0.5
  })
  
  highSeqScanTables.forEach((table: any) => {
    recommendations.push({
      type: 'index',
      priority: 'high',
      title: `Add indexes for ${table.tablename}`,
      description: `Table ${table.tablename} has ${table.seq_scan} sequential scans vs ${table.idx_scan} index scans. Consider adding indexes for frequently queried columns.`,
      estimated_impact: 'High - Could reduce query time by 50-90%',
      sql_command: `-- Consider indexes for table ${table.tablename}\n-- Analyze query patterns and add appropriate indexes`
    })
  })

  // Check for unused indexes
  const unusedIndexResult: any = await supabase.rpc('get_unused_indexes')
  const unusedIndexCheck: any[] = unusedIndexResult?.data || []
  
  unusedIndexCheck.forEach((index: any) => {
    recommendations.push({
      type: 'maintenance',
      priority: 'medium',
      title: `Remove unused index ${index.index_name}`,
      description: `Index ${index.index_name} on table ${index.table_name} has never been used but consumes ${index.size_mb}MB of space.`,
      estimated_impact: 'Medium - Frees up space and reduces write overhead',
      sql_command: `DROP INDEX CONCURRENTLY ${index.index_name};`
    })
  })

  // Check for tables with high bloat
  const highBloatTables = (tableStats || []).filter((table: any) => table.bloat_ratio_percent > 20)
  
  highBloatTables.forEach((table: any) => {
    recommendations.push({
      type: 'maintenance',
      priority: 'medium',
      title: `Vacuum table ${table.tablename}`,
      description: `Table ${table.tablename} has ${table.bloat_ratio_percent.toFixed(1)}% bloat ratio. Consider VACUUM FULL or reindexing.`,
      estimated_impact: 'Medium - Improves query performance and reduces space usage',
      sql_command: `VACUUM FULL ${table.tablename};`
    })
  })

  return recommendations
}

function calculateDatabaseHealth(
  queryPerf: QueryPerformanceMetrics,
  indexUsage: IndexUsageMetrics,
  tableStats: TableStatistics[],
  recommendations: PerformanceRecommendation[]
): DatabaseHealth {
  let score = 100
  let highIssues = 0
  let mediumIssues = 0
  let lowIssues = 0

  // Deduct points for slow queries
  const avgQueryTime = queryPerf.top_slow_queries.reduce((sum, q) => sum + q.mean_time_ms, 0) / 
                       (queryPerf.top_slow_queries.length || 1)
  
  if (avgQueryTime > 1000) { // > 1 second
    score -= 20
    highIssues++
  } else if (avgQueryTime > 500) { // > 500ms
    score -= 10
    mediumIssues++
  }

  // Deduct points for unused indexes
  if (indexUsage.unused_indexes.length > 5) {
    score -= 10
    mediumIssues++
  } else if (indexUsage.unused_indexes.length > 0) {
    score -= 5
    lowIssues++
  }

  // Deduct points for high bloat
  const highBloatCount = tableStats.filter(t => t.bloat_percentage > 20).length
  if (highBloatCount > 3) {
    score -= 15
    highIssues++
  } else if (highBloatCount > 0) {
    score -= 5
    mediumIssues++
  }

  // Deduct points for recommendations
  highIssues += recommendations.filter(r => r.priority === 'high').length
  mediumIssues += recommendations.filter(r => r.priority === 'medium').length
  lowIssues += recommendations.filter(r => r.priority === 'low').length

  score = Math.max(0, Math.min(100, score))

  let status: 'excellent' | 'good' | 'warning' | 'critical'
  if (score >= 90) status = 'excellent'
  else if (score >= 75) status = 'good'
  else if (score >= 50) status = 'warning'
  else status = 'critical'

  return {
    overall_score: score,
    status,
    issues_count: { high: highIssues, medium: mediumIssues, low: lowIssues },
    last_updated: new Date().toISOString()
  }
}