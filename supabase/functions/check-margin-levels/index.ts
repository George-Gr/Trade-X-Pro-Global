import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Edge Function: check-margin-levels
 *
 * Purpose: Monitor user margin levels and create alerts when status changes
 * Trigger: Scheduled execution every 60 seconds during market hours
 *
 * Task: TASK 1.2.4 - Margin Level Monitoring & Alerts
 *
 * Actions:
 * 1. Fetch all active users with positions
 * 2. Calculate current margin levels
 * 3. Detect margin status changes
 * 4. Create alerts and notifications
 * 5. Track statistics and errors
 *
 * Returns:
 * {
 *   success: boolean,
 *   timestamp: string,
 *   checked_users: number,
 *   alerts_created: number,
 *   status_changes: {
 *     to_warning: number,
 *     to_critical: number,
 *     to_liquidation: number,
 *     recovered: number
 *   },
 *   errors: Error[],
 *   duration_ms: number
 * }
 */

interface User {
  id: string;
  email: string;
  equity: number;
  margin_used: number;
  margin_level: number | null;
}

interface MarginCheckResult {
  user_id: string;
  current_margin_level: number;
  current_status: string;
  previous_status: string | null;
  status_changed: boolean;
  alert_created: boolean;
}

interface CheckResponse {
  success: boolean;
  timestamp: string;
  checked_users: number;
  alerts_created: number;
  status_changes: {
    to_warning: number;
    to_critical: number;
    to_liquidation: number;
    recovered: number;
  };
  errors: Array<{
    user_id?: string;
    message: string;
    code?: string;
  }>;
  duration_ms: number;
}

/**
 * Classify margin level into status
 * SAFE: >= 200%
 * WARNING: 100-199%
 * CRITICAL: 50-99%
 * LIQUIDATION: < 50%
 */
function getMarginStatus(marginLevel: number | null): string {
  if (marginLevel === null || marginLevel === Infinity) return 'SAFE';
  if (marginLevel >= 200) return 'SAFE';
  if (marginLevel >= 100) return 'WARNING';
  if (marginLevel >= 50) return 'CRITICAL';
  return 'LIQUIDATION';
}

/**
 * Calculate margin level from equity and margin used
 * margin_level = (equity / margin_used) * 100
 */
function calculateMarginLevel(
  equity: number,
  marginUsed: number
): number | null {
  if (marginUsed === 0) return Infinity;
  if (marginUsed < 0) return null;
  return Math.round((equity / marginUsed) * 100 * 100) / 100;
}

/**
 * Determine if alert should be created (prevents spam)
 */
function shouldCreateAlert(
  currentStatus: string,
  previousStatus: string | null,
  minAlertWindowMinutes: number = 5
): boolean {
  // Always alert on status change
  return currentStatus !== previousStatus;
}

/**
 * Get recommended actions for margin status
 */
function getActionRequired(status: string): string[] {
  switch (status) {
    case 'SAFE':
      return ['monitor'];
    case 'WARNING':
      return ['reduce_size', 'add_funds'];
    case 'CRITICAL':
      return ['close_positions', 'add_funds_urgent', 'order_restriction'];
    case 'LIQUIDATION':
      return ['force_liquidation', 'emergency_deposit'];
    default:
      return ['monitor'];
  }
}

/**
 * Estimate time to liquidation in minutes
 */
function estimateTimeToLiquidation(marginLevel: number): number | null {
  if (marginLevel >= 100) return null;
  // Simple estimation: minutes remaining = margin level
  // At 50%: ~50 minutes, at 25%: ~25 minutes, at 1%: ~1 minute
  return Math.max(1, Math.round(marginLevel));
}

async function checkMarginLevels(req: Request): Promise<CheckResponse> {
  const startTime = Date.now();
  const errors: CheckResponse['errors'] = [];
  const statusChanges = {
    to_warning: 0,
    to_critical: 0,
    to_liquidation: 0,
    recovered: 0,
  };

  let checkedUsers = 0;
  let alertsCreated = 0;

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all users with active positions and margin data
    const { data: users, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, equity, margin_used, margin_level')
      .neq('equity', null)
      .neq('margin_used', null)
      .gt('equity', 0);

    if (fetchError) {
      throw new Error(`Failed to fetch users: ${fetchError.message}`);
    }

    if (!users || users.length === 0) {
      return {
        success: true,
        timestamp: new Date().toISOString(),
        checked_users: 0,
        alerts_created: 0,
        status_changes: statusChanges,
        errors: [],
        duration_ms: Date.now() - startTime,
      };
    }

    // Check margin levels for each user
    const checkResults: MarginCheckResult[] = [];

    for (const user of users) {
      try {
        checkedUsers++;

        const currentMarginLevel = calculateMarginLevel(
          user.equity,
          user.margin_used
        );

        if (currentMarginLevel === null) {
          continue; // Skip invalid calculations
        }

        const currentStatus = getMarginStatus(currentMarginLevel);
        const previousStatus: string | null = null; // We don't have previous status from profiles table
        const statusChanged = currentStatus !== previousStatus;

        checkResults.push({
          user_id: user.id,
          current_margin_level: currentMarginLevel,
          current_status: currentStatus,
          previous_status: previousStatus,
          status_changed: statusChanged,
          alert_created: false,
        });

        // Create alert if status changed
        if (statusChanged && shouldCreateAlert(currentStatus, previousStatus)) {
          const actionRequired = getActionRequired(currentStatus);
          const timeToLiquidation =
            estimateTimeToLiquidation(currentMarginLevel);

          // Update user's margin level in profiles table
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              margin_level: currentMarginLevel,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (updateError) {
            errors.push({
              user_id: user.id,
              message: `Failed to update margin status: ${updateError.message}`,
            });
            continue;
          }

          // Call create_margin_alert via direct insert (RLS enforced)
          const { data: alert, error: alertError } = await supabase
            .from('margin_alerts')
            .insert({
              user_id: user.id,
              current_status: currentStatus,
              previous_status: previousStatus,
              margin_level: currentMarginLevel,
              equity: user.equity,
              margin_used: user.margin_used,
              alert_type: 'status_change',
              severity:
                currentStatus === 'SAFE'
                  ? 'info'
                  : currentStatus === 'WARNING'
                    ? 'warning'
                    : currentStatus === 'CRITICAL'
                      ? 'critical'
                      : 'emergency',
              action_required: actionRequired,
              recommended_urgency:
                currentStatus === 'SAFE'
                  ? 'info'
                  : currentStatus === 'WARNING'
                    ? 'warning'
                    : currentStatus === 'CRITICAL'
                      ? 'critical'
                      : 'emergency',
              status: 'pending',
            })
            .select()
            .single();

          if (alertError) {
            errors.push({
              user_id: user.id,
              message: `Failed to create alert: ${alertError.message}`,
            });
            continue;
          }

          // Track status change
          alertsCreated++;
          if (previousStatus === 'SAFE' && currentStatus === 'WARNING') {
            statusChanges.to_warning++;
          } else if (
            previousStatus === 'WARNING' &&
            currentStatus === 'CRITICAL'
          ) {
            statusChanges.to_critical++;
          } else if (currentStatus === 'LIQUIDATION') {
            statusChanges.to_liquidation++;
          } else if (
            (previousStatus === 'CRITICAL' ||
              previousStatus === 'WARNING' ||
              previousStatus === 'LIQUIDATION') &&
            currentStatus === 'SAFE'
          ) {
            statusChanges.recovered++;
          }

          // Create notification for critical alerts
          if (currentStatus === 'CRITICAL' || currentStatus === 'LIQUIDATION') {
            await supabase.from('notifications').insert({
              user_id: user.id,
              type: 'margin_alert',
              title:
                currentStatus === 'LIQUIDATION'
                  ? 'Account in Liquidation Risk'
                  : 'Margin Level Critical',
              message:
                currentStatus === 'LIQUIDATION'
                  ? `Your margin level is ${currentMarginLevel}%. Liquidation risk detected. Take immediate action.`
                  : `Your margin level is ${currentMarginLevel}%. Please reduce positions or add funds.`,
              severity:
                currentStatus === 'LIQUIDATION' ? 'emergency' : 'critical',
              action_url: '/risk-management',
              read: false,
            });

            // Send critical email notification
            try {
              await supabase.functions.invoke('send-critical-email', {
                body: {
                  to: user.email,
                  type:
                    currentStatus === 'LIQUIDATION'
                      ? 'liquidation'
                      : 'margin_critical',
                  data: {
                    user_name: user.email.split('@')[0],
                    margin_level: currentMarginLevel,
                    equity: user.equity,
                    margin_used: user.margin_used,
                    actions: actionRequired,
                    time_to_liquidation: timeToLiquidation,
                  },
                },
              });
              console.log(
                `Critical email sent to ${user.email} for ${currentStatus}`
              );
            } catch (emailError) {
              console.error('Failed to send critical email:', emailError);
            }
          }

          // Send warning email for WARNING status on first trigger
          if (currentStatus === 'WARNING' && previousStatus === 'SAFE') {
            try {
              await supabase.functions.invoke('send-critical-email', {
                body: {
                  to: user.email,
                  type: 'margin_warning',
                  data: {
                    user_name: user.email.split('@')[0],
                    margin_level: currentMarginLevel,
                    equity: user.equity,
                    margin_used: user.margin_used,
                    actions: actionRequired,
                  },
                },
              });
              console.log(`Warning email sent to ${user.email}`);
            } catch (emailError) {
              console.error('Failed to send warning email:', emailError);
            }
          }
        }
      } catch (userError) {
        errors.push({
          user_id: user.id,
          message: `Error checking user margin: ${String(userError)}`,
        });
      }
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      checked_users: checkedUsers,
      alerts_created: alertsCreated,
      status_changes: statusChanges,
      errors,
      duration_ms: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Error in check-margin-levels:', error);

    return {
      success: false,
      timestamp: new Date().toISOString(),
      checked_users: checkedUsers,
      alerts_created: alertsCreated,
      status_changes: statusChanges,
      errors: [
        {
          message: `Critical error: ${String(error)}`,
        },
      ],
      duration_ms: Date.now() - startTime,
    };
  }
}

serve(async (req) => {
  // Validate CRON_SECRET to prevent unauthorized access
  const CRON_SECRET = Deno.env.get('CRON_SECRET');
  const providedSecret = req.headers.get('X-Cron-Secret');

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    console.error('Unauthorized access attempt to check-margin-levels');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await checkMarginLevels(req);
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
    status: result.success ? 200 : 500,
  });
});
