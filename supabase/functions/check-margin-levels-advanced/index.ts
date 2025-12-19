import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

/**
 * Advanced Margin Call System with Escalation
 * Implements: WARNING → CRITICAL → LIQUIDATION path with 30-minute grace period
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const GRACE_PERIOD_MINUTES = 30;
const WARNING_THRESHOLD = 100; // 100% margin level
const CRITICAL_THRESHOLD = 50; // 50% margin level
const LIQUIDATION_THRESHOLD = 20; // 20% margin level

interface MarginStatus {
  level: number;
  severity: 'SAFE' | 'WARNING' | 'CRITICAL' | 'LIQUIDATION_TRIGGER';
  shouldNotify: boolean;
  shouldEscalate: boolean;
  shouldLiquidate: boolean;
}

function assessMarginStatus(
  marginLevel: number,
  timeInCriticalMinutes: number = 0
): MarginStatus {
  if (marginLevel >= 200) {
    return {
      level: marginLevel,
      severity: 'SAFE',
      shouldNotify: false,
      shouldEscalate: false,
      shouldLiquidate: false,
    };
  }

  if (marginLevel >= WARNING_THRESHOLD) {
    return {
      level: marginLevel,
      severity: 'WARNING',
      shouldNotify: true,
      shouldEscalate: false,
      shouldLiquidate: false,
    };
  }

  if (marginLevel >= CRITICAL_THRESHOLD) {
    return {
      level: marginLevel,
      severity: 'CRITICAL',
      shouldNotify: true,
      shouldEscalate: timeInCriticalMinutes >= GRACE_PERIOD_MINUTES,
      shouldLiquidate: false,
    };
  }

  // Below liquidation threshold - immediate action
  return {
    level: marginLevel,
    severity: 'LIQUIDATION_TRIGGER',
    shouldNotify: true,
    shouldEscalate: true,
    shouldLiquidate: true,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate CRON_SECRET for security
    const CRON_SECRET = Deno.env.get('CRON_SECRET');
    const providedSecret = req.headers.get('X-Cron-Secret');

    if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
      console.error('Unauthorized access attempt');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting advanced margin call check...');

    // Get all users with open positions
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, equity, margin_used, margin_level')
      .gt('margin_used', 0);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    const results = [];
    let newMarginCalls = 0;
    let escalations = 0;
    let liquidationsTriggered = 0;

    for (const user of users || []) {
      const marginLevel =
        user.margin_used > 0
          ? (user.equity / user.margin_used) * 100
          : Infinity;

      // Check for existing active margin call
      const { data: existingCall } = await supabase
        .from('margin_call_events')
        .select('id, status, severity, triggered_at, grace_period_expires_at')
        .eq('user_id', user.id)
        .in('status', ['pending', 'notified', 'escalated'])
        .order('triggered_at', { ascending: false })
        .limit(1)
        .single();

      const timeInCritical = existingCall
        ? Math.floor(
            (Date.now() - new Date(existingCall.triggered_at).getTime()) /
              (1000 * 60)
          )
        : 0;

      const status = assessMarginStatus(marginLevel, timeInCritical);

      // Handle margin call resolution
      if (status.severity === 'SAFE' && existingCall) {
        await supabase
          .from('margin_call_events')
          .update({
            status: 'resolved',
            resolution_type: 'price_recovery',
            resolved_at: new Date().toISOString(),
          })
          .eq('id', existingCall.id);

        // Send recovery notification
        await supabase.functions.invoke('send-notification', {
          body: {
            user_id: user.id,
            type: 'margin_call_resolved',
            title: 'Margin Call Resolved',
            message: `Your margin level has recovered to ${marginLevel.toFixed(2)}%. Position is now safe.`,
            data: { margin_level: marginLevel },
          },
        });

        continue;
      }

      // Create or update margin call
      if (status.shouldNotify && !existingCall) {
        // New margin call
        const gracePeriodExpires = new Date(
          Date.now() + GRACE_PERIOD_MINUTES * 60 * 1000
        );

        const { data: newCall } = await supabase
          .from('margin_call_events')
          .insert({
            user_id: user.id,
            status: 'pending',
            severity: status.severity,
            margin_level: marginLevel,
            account_equity: user.equity,
            margin_used: user.margin_used,
            grace_period_expires_at:
              status.severity === 'CRITICAL' ? gracePeriodExpires : null,
          })
          .select()
          .single();

        newMarginCalls++;

        // Send notification via all channels
        const notificationTitle =
          status.severity === 'WARNING'
            ? '⚠️ Margin Warning'
            : status.severity === 'CRITICAL'
              ? '🚨 CRITICAL Margin Call'
              : '⛔ Liquidation Imminent';

        const notificationMessage =
          status.severity === 'WARNING'
            ? `Your margin level is ${marginLevel.toFixed(2)}%. Please consider adding funds or reducing positions.`
            : status.severity === 'CRITICAL'
              ? `URGENT: Your margin level is ${marginLevel.toFixed(2)}%. You have ${GRACE_PERIOD_MINUTES} minutes to add funds before liquidation.`
              : `IMMEDIATE ACTION REQUIRED: Your margin level is ${marginLevel.toFixed(2)}%. Liquidation process will begin shortly.`;

        await supabase.functions.invoke('send-notification', {
          body: {
            user_id: user.id,
            type: 'margin_call',
            title: notificationTitle,
            message: notificationMessage,
            data: {
              margin_level: marginLevel,
              severity: status.severity,
              grace_period_minutes:
                status.severity === 'CRITICAL' ? GRACE_PERIOD_MINUTES : 0,
            },
            send_email: true,
          },
        });

        await supabase
          .from('margin_call_events')
          .update({
            notification_sent: true,
            email_sent: true,
            notified_at: new Date().toISOString(),
            status: 'notified',
          })
          .eq('id', newCall.id);
      } else if (existingCall && status.shouldEscalate) {
        // Escalate existing margin call
        const newSeverity = status.severity;
        const shouldLiquidate = status.shouldLiquidate;

        await supabase
          .from('margin_call_events')
          .update({
            severity: newSeverity,
            status: shouldLiquidate ? 'escalated' : existingCall.status,
            escalated_at: new Date().toISOString(),
            escalation_count:
              ((existingCall as unknown as Record<string, unknown>)
                .escalation_count as number) + 1,
            margin_level: marginLevel,
            account_equity: user.equity,
            margin_used: user.margin_used,
          })
          .eq('id', existingCall.id);

        escalations++;

        // Send escalation notification
        await supabase.functions.invoke('send-notification', {
          body: {
            user_id: user.id,
            type: 'margin_call_escalated',
            title: shouldLiquidate
              ? '⛔ Liquidation Starting'
              : '🚨 Margin Call Escalated',
            message: shouldLiquidate
              ? `Grace period expired. Your positions are being liquidated to prevent negative balance.`
              : `Your margin situation has worsened. Current level: ${marginLevel.toFixed(2)}%`,
            data: {
              margin_level: marginLevel,
              severity: newSeverity,
              liquidation_imminent: shouldLiquidate,
            },
            send_email: true,
          },
        });

        // Trigger liquidation if needed
        if (shouldLiquidate) {
          await supabase.functions.invoke('execute-liquidation', {
            body: {
              margin_call_event_id: existingCall.id,
              user_id: user.id,
              reason: 'margin_call_escalation',
            },
          });

          liquidationsTriggered++;
        }
      }

      results.push({
        user_id: user.id,
        margin_level: marginLevel,
        severity: status.severity,
        action_taken: status.shouldNotify ? 'notified' : 'monitored',
      });
    }

    console.log(
      `Margin check complete: ${newMarginCalls} new calls, ${escalations} escalations, ${liquidationsTriggered} liquidations`
    );

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        users_checked: users?.length || 0,
        new_margin_calls: newMarginCalls,
        escalations,
        liquidations_triggered: liquidationsTriggered,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in margin call check:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
