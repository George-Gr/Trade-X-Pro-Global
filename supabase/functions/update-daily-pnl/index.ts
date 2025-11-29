import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema for defense-in-depth
const UpdatePnLSchema = z.object({
  user_id: z.string().uuid('Invalid user_id format'),
  realized_pnl: z.number().finite('realized_pnl must be a finite number'),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate CRON_SECRET for security
  const CRON_SECRET = Deno.env.get('CRON_SECRET');
  const providedSecret = req.headers.get('X-Cron-Secret');

  if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
    console.error('Unauthorized access attempt to update-daily-pnl');
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();

    // Validate input with Zod
    const validation = UpdatePnLSchema.safeParse(body);
    if (!validation.success) {
      console.error('Invalid input:', validation.error.format());
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input parameters',
          details: validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user_id, realized_pnl } = validation.data;

    const today = new Date().toISOString().split('T')[0];

    // Get or create daily PnL record
    const { data: existing } = await supabaseClient
      .from('daily_pnl_tracking')
      .select('*')
      .eq('user_id', user_id)
      .eq('trading_date', today)
      .single();

    const newRealizedPnl = (existing?.realized_pnl || 0) + realized_pnl;
    const newTradeCount = (existing?.trade_count || 0) + 1;

    // Get user's risk settings
    const { data: riskSettings } = await supabaseClient
      .from('risk_settings')
      .select('daily_loss_limit')
      .eq('user_id', user_id)
      .single();

    const breachedLimit = riskSettings && newRealizedPnl < -Math.abs(riskSettings.daily_loss_limit);

    if (existing) {
      // Update existing record
      await supabaseClient
        .from('daily_pnl_tracking')
        .update({
          realized_pnl: newRealizedPnl,
          trade_count: newTradeCount,
          breached_daily_limit: breachedLimit,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      // Create new record
      await supabaseClient
        .from('daily_pnl_tracking')
        .insert({
          user_id,
          trading_date: today,
          realized_pnl: newRealizedPnl,
          trade_count: newTradeCount,
          breached_daily_limit: breachedLimit
        });
    }

    // If daily limit breached, create risk event
    if (breachedLimit && !existing?.breached_daily_limit) {
      await supabaseClient.from('risk_events').insert({
        user_id,
        event_type: 'daily_limit',
        severity: 'critical',
        description: `Daily loss limit breached: ${newRealizedPnl.toFixed(2)}`,
        details: {
          daily_loss: newRealizedPnl,
          limit: riskSettings?.daily_loss_limit,
          trade_count: newTradeCount
        }
      });
    }

    return new Response(
      JSON.stringify({ success: true, realized_pnl: newRealizedPnl, trade_count: newTradeCount }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Update daily PnL error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
