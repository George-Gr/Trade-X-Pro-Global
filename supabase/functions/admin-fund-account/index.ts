import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FundAccountSchema = z.object({
  user_id: z.string().uuid('Invalid user ID format'),
  amount: z.number().positive('Amount must be positive').max(100000, 'Maximum funding amount is $100,000 per operation'),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long')
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role (SERVER-SIDE)
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit: 3 requests per 5 minutes for admin operations
    const { data: rateLimitOk } = await supabaseClient.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_endpoint: 'admin-fund-account',
      p_max_requests: 3,
      p_window_seconds: 300
    });

    if (!rateLimitOk) {
      console.log('Rate limit exceeded for admin user');
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait before performing another funding operation.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '300' } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = FundAccountSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validation.error.issues.map(i => i.message).join(', ')
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user_id, amount, description } = validation.data;

    // Fetch target user profile with lock
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('balance, equity, account_status')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profile.account_status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Cannot fund inactive account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate new balances
    const newBalance = profile.balance + amount;
    const newEquity = profile.equity + amount;

    // Update profile
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        balance: newBalance,
        equity: newEquity
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create ledger entry
    const { error: ledgerError } = await supabaseClient
      .from('ledger')
      .insert({
        user_id,
        transaction_type: 'deposit',
        amount,
        balance_before: profile.balance,
        balance_after: newBalance,
        description: `Admin funding: ${description} (by ${user.email})`
      });

    if (ledgerError) {
      console.error('Failed to create ledger entry:', ledgerError);
      // Note: Profile already updated, but ledger failed - this is logged
    }

    // Create audit log entry
    const { error: auditError } = await supabaseClient
      .from('admin_audit_log')
      .insert({
        admin_user_id: user.id,
        action: 'fund_account',
        target_user_id: user_id,
        details: { amount, description },
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent')
      });

    if (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        newBalance,
        newEquity 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
