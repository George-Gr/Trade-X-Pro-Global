import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const InitiateWithdrawalSchema = z.object({
  currency: z.string(),
  address: z.string(),
  amount: z.number(),
  twoFACode: z.string(),
});

// Address validation patterns
const addressPatterns: Record<string, RegExp> = {
  'BTC': /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
  'ETH': /^0x[a-fA-F0-9]{40}$/,
  'USDT': /^0x[a-fA-F0-9]{40}$/,
  'USDC': /^0x[a-fA-F0-9]{40}$/,
  'LTC': /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
  'BNB': /^0x[a-fA-F0-9]{40}$/,
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use Deno.env.get for environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT and get user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request body
    const body = await req.json();
    const validation = InitiateWithdrawalSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const { currency: rawCurrency, address, amount, twoFACode } = validation.data as { currency: string; address: string; amount: number; twoFACode: string };
    const currency = rawCurrency.toUpperCase();
    if (!['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'BNB'].includes(currency)) {
      return new Response(
        JSON.stringify({ error: 'Unsupported currency' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (typeof address !== 'string' || address.length < 10 || address.length > 150) {
      return new Response(
        JSON.stringify({ error: 'Address must be between 10 and 150 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
      return new Response(
        JSON.stringify({ error: 'Amount must be a positive, finite number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (typeof twoFACode !== 'string' || twoFACode.length !== 6 || !/^\d+$/.test(twoFACode)) {
      return new Response(
        JSON.stringify({ error: '2FA code must be 6 digits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate address format
    const addressPattern = addressPatterns[currency];
    if (!addressPattern.test(address)) {
      return new Response(
        JSON.stringify({ error: `Invalid ${currency} address format` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check user profile and KYC status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check KYC status
    if (profile.kyc_status !== 'approved') {
      return new Response(
        JSON.stringify({ error: 'KYC verification required', kyc_status: profile.kyc_status }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check balance
    if (!profile.balance || profile.balance < amount) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient balance',
          available: profile.balance || 0,
          requested: amount
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get payment fees
    const { data: fees, error: feesError } = await supabase
      .from('payment_fees')
      .select('*')
      .eq('currency', currency)
      .single();

    if (feesError || !fees) {
      return new Response(
        JSON.stringify({ error: 'Fee configuration not found for currency' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check transaction limit
    if (amount > fees.max_transaction) {
      return new Response(
        JSON.stringify({ 
          error: 'Amount exceeds maximum per transaction',
          max: fees.max_transaction,
          requested: amount
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check minimum withdrawal
    if (amount < fees.min_withdrawal) {
      return new Response(
        JSON.stringify({ 
          error: 'Amount below minimum withdrawal',
          min: fees.min_withdrawal,
          requested: amount
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get today's withdrawal total
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayWithdrawals, error: withdrawalError } = await supabase
      .from('withdrawal_requests')
      .select('amount')
      .eq('user_id', user.id)
      .in('status', ['completed', 'processing', 'approved'])
      .gte('created_at', today.toISOString());

    if (withdrawalError) {
      console.error('Error checking daily withdrawals:', withdrawalError);
    }

    const todayTotal = (todayWithdrawals as { amount: number }[] | undefined)
      ?.reduce((sum: number, w: { amount: number }) => sum + (w.amount ?? 0), 0) || 0;

    // Check daily limit
    if (todayTotal + amount > fees.max_daily_withdrawal) {
      const remaining = fees.max_daily_withdrawal - todayTotal;
      return new Response(
        JSON.stringify({ 
          error: 'Daily withdrawal limit exceeded',
          daily_limit: fees.max_daily_withdrawal,
          today_total: todayTotal,
          remaining: remaining,
          requested: amount
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate fees
    const platformFee = amount * (fees.platform_fee_percentage / 100);
    const totalFee = platformFee + fees.network_fee_amount;
    const totalDeduction = amount + totalFee;

    // Check if user has enough for total deduction (amount + fees)
    if (profile.balance < totalDeduction) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient balance including fees',
          balance: profile.balance,
          requested_with_fees: totalDeduction
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify 2FA code (placeholder - in production, verify against sent code)
    // For now, we'll accept any 6-digit code
    if (twoFACode.length !== 6 || !/^\d+$/.test(twoFACode)) {
      return new Response(
        JSON.stringify({ error: 'Invalid 2FA code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create withdrawal request
    const withdrawalInsert = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        currency,
        amount,
        destination_address: address,
        status: 'pending',
        fee_amount: platformFee,
        network_fee: fees.network_fee_amount,
        metadata: {
          initiated_by: user.id,
          initiated_at: new Date().toISOString(),
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        },
      });
    const withdrawalRequest = Array.isArray(withdrawalInsert) ? withdrawalInsert[0] : undefined;
    if (!withdrawalRequest) {
      console.error('Error creating withdrawal request:', withdrawalInsert);
      return new Response(
        JSON.stringify({ error: 'Failed to create withdrawal request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct balance (hold the amount)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        balance: profile.balance - totalDeduction,
        held_balance: (profile.held_balance || 0) + totalDeduction,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating balance:', updateError);
      // Rollback withdrawal request
      await supabase
        .from('withdrawal_requests')
        .delete()
        .eq('id', withdrawalRequest.id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to process withdrawal' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create audit log entry
    await supabase
      .from('withdrawal_audit')
      .insert({
        withdrawal_id: withdrawalRequest.id,
        user_id: user.id,
        action: 'created',
        reason: `Withdrawal request initiated for ${amount} ${currency}`,
        metadata: {
          destination_address: address,
          fees: {
            platform_fee: platformFee,
            network_fee: fees.network_fee_amount,
          },
        },
      });

    // Send notification
    try {
      await supabase.functions.invoke('send-notification', {
        body: {
          user_id: user.id,
          type: 'withdrawal_initiated',
          title: 'Withdrawal Initiated',
          message: `Your withdrawal of ${amount} ${currency} to ${address.slice(0, 10)}... has been initiated`,
          data: {
            withdrawal_id: withdrawalRequest.id,
            amount,
            currency,
          },
        },
      });
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
      // Don't fail the request if notification fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        withdrawal_id: withdrawalRequest.id,
        status: 'pending',
        amount,
        currency,
        destination_address: address.slice(0, 10) + '...',
        fees: {
          platform_fee: platformFee,
          network_fee: fees.network_fee_amount,
          total: totalFee,
        },
        total_deduction: totalDeduction,
        message: 'Withdrawal request submitted. It will be processed shortly.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in initiate-withdrawal:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
