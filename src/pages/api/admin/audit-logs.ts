import type { Database } from '@/integrations/supabase/types';
import type { AuditEvent } from '@/lib/authAuditLogger';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabaseServerClient';

/**
 * Type guard to check if a value is an array of role objects
 */
function isRolesArray(value: unknown): value is { role: string }[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.role === 'string'
    )
  );
}

const ACTION_TO_EVENT_TYPE: Record<string, AuditEvent['eventType']> = {
  login_success: 'AUTH_LOGIN_SUCCESS',
  login_failed: 'AUTH_LOGIN_FAILED',
  logout: 'AUTH_LOGOUT',
  suspicious_activity: 'AUTH_SUSPICIOUS_ACTIVITY',
  session_timeout: 'AUTH_SESSION_TIMEOUT',
  multiple_sessions: 'AUTH_MULTIPLE_SESSIONS',
  geolocation_anomaly: 'AUTH_GEOLOCATION_ANOMALY',
  token_refresh: 'AUTH_TOKEN_REFRESH',
  token_refresh_failed: 'AUTH_TOKEN_REFRESH_FAILED',
  password_change: 'AUTH_PASSWORD_CHANGE',
  password_reset: 'AUTH_PASSWORD_RESET',
  account_locked: 'AUTH_ACCOUNT_LOCKED',
  account_unlocked: 'AUTH_ACCOUNT_UNLOCKED',
  token_theft_detected: 'AUTH_TOKEN_THEFT_DETECTED',
};

const VALID_EVENT_TYPES = new Set<AuditEvent['eventType']>([
  'AUTH_LOGIN_SUCCESS',
  'AUTH_LOGIN_FAILED',
  'AUTH_LOGOUT',
  'AUTH_TOKEN_REFRESH',
  'AUTH_TOKEN_REFRESH_FAILED',
  'AUTH_SESSION_TIMEOUT',
  'AUTH_SESSION_EXPIRED',
  'AUTH_FORCED_LOGOUT',
  'AUTH_PASSWORD_CHANGE',
  'AUTH_PASSWORD_RESET',
  'AUTH_2FA_ENABLED',
  'AUTH_2FA_DISABLED',
  'AUTH_SUSPICIOUS_ACTIVITY',
  'AUTH_ACCOUNT_LOCKED',
  'AUTH_ACCOUNT_UNLOCKED',
  'AUTH_PRIVILEGE_ESCALATION',
  'AUTH_ACCESS_DENIED',
  'AUTH_TOKEN_THEFT_DETECTED',
  'AUTH_MULTIPLE_SESSIONS',
  'AUTH_GEOLOCATION_ANOMALY',
]);

/**
 * Audit Logs API Handler
 *
 * Returns audit logs for admin users. Supports GET requests with optional 'limit' query parameter.
 *
 * @param {Request} req - The incoming HTTP request object containing headers and query parameters.
 * @returns {Promise<Response>} A Response with JSON payload containing audit events on success (200), or error details (405 for unsupported method, 500 for server errors).
 */
export default async function handler(req: Request) {
  try {
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ success: false, message: 'Method Not Allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Require Authorization: Bearer <access_token>
    const authHeader =
      req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate user via Supabase
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      logger.warn('Unauthorized audit logs request: invalid user token');
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;

    // Check if the user has admin role
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (rolesError) {
      logger.error('Failed to check user roles', rolesError);
      return new Response(
        JSON.stringify({ success: false, message: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isAdmin =
      isRolesArray(roles) && roles.some((r) => r.role === 'admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, message: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse query params
    const url = new URL(req.url);
    const limit = Math.min(
      1000,
      Math.max(1, Number(url.searchParams.get('limit') || 200))
    );

    // Fetch audit rows
    const { data, error } = await supabaseAdmin
      .from('admin_audit_log')
      .select(
        'id, action, created_at, details, ip_address, user_agent, target_user_id, admin_user_id'
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Failed to fetch audit logs', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to fetch audit logs',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rows = (data ||
      []) as Database['public']['Tables']['admin_audit_log']['Row'][];

    // Map database rows to AuditEvent objects with proper type conversion and validation
    const events = rows
      .map((row) => {
        const action = String(row.action || '').toLowerCase();
        if (!action) return null;

        // Resolve eventType using action -> eventType mapping with fallback hierarchy:
        // 1. Check ACTION_TO_EVENT_TYPE map for direct mapping
        // 2. For auth_ actions, treat as canonical event types if valid
        // 3. For other actions, prefix with "AUTH_" and check validity
        // 4. Fall back to AUTH_SUSPICIOUS_ACTIVITY with warning
        let eventType: AuditEvent['eventType'];
        if (ACTION_TO_EVENT_TYPE[action]) {
          eventType = ACTION_TO_EVENT_TYPE[action]!;
        } else if (action.startsWith('auth_')) {
          const candidate = action.toUpperCase();
          if (VALID_EVENT_TYPES.has(candidate as AuditEvent['eventType'])) {
            eventType = candidate as AuditEvent['eventType'];
          } else {
            eventType = 'AUTH_SUSPICIOUS_ACTIVITY';
            logger.warn(
              `Unknown auth action '${action}', falling back to AUTH_SUSPICIOUS_ACTIVITY`
            );
          }
        } else {
          const candidate = `AUTH_${action.toUpperCase()}`;
          if (VALID_EVENT_TYPES.has(candidate as AuditEvent['eventType'])) {
            eventType = candidate as AuditEvent['eventType'];
          } else {
            eventType = 'AUTH_SUSPICIOUS_ACTIVITY';
            logger.warn(
              `Unknown action '${action}', falling back to AUTH_SUSPICIOUS_ACTIVITY`
            );
          }
        }

        // Extract and normalize metadata/details from database row
        const details = (row.details || {}) as Record<string, unknown>;

        // Determine severity using regex-based heuristics with priority order:
        // 1. Critical: suspicious, anomaly, theft, critical, breach patterns
        // 2. Warning: failed, error, invalid, locked patterns
        // 3. Default: info severity
        let severity: AuditEvent['severity'] = 'info';
        if (/suspicious|anomaly|theft|critical|breach/i.test(action))
          severity = 'critical';
        else if (/failed|error|invalid|locked/i.test(action))
          severity = 'warning';

        return {
          timestamp: row.created_at,
          eventType,
          userId: row.target_user_id || row.admin_user_id || undefined,
          ipAddress: row.ip_address || undefined,
          userAgent: row.user_agent || undefined,
          metadata: details,
          severity,
        } as AuditEvent;
      })
      .filter((event) => event !== null) as AuditEvent[];

    return new Response(JSON.stringify({ success: true, events }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    logger.error(
      'Error in audit logs API:',
      error instanceof Error ? error.message : String(error)
    );
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
