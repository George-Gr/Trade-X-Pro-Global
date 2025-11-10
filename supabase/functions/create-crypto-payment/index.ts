import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CreatePaymentSchema = z.object({
  amount: z.number().positive().finite(),
  currency: z.string().trim().min(2).max(10),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')!;

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
    const validation = CreatePaymentSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { amount, currency } = validation.data;

    // Create payment with NowPayments
    const nowpaymentsResponse = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': nowpaymentsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: currency.toLowerCase(),
        order_id: `${user.id}-${Date.now()}`,
        order_description: 'Trading Account Deposit',
        ipn_callback_url: `${supabaseUrl}/functions/v1/handle-payment-callback`,
        success_url: `${Deno.env.get('VITE_SUPABASE_URL')}/dashboard?payment=success`,
        cancel_url: `${Deno.env.get('VITE_SUPABASE_URL')}/dashboard?payment=cancelled`,
      }),
    });

    if (!nowpaymentsResponse.ok) {
      const errorText = await nowpaymentsResponse.text();
      console.error('NowPayments API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Payment creation failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentData = await nowpaymentsResponse.json();

    // Store transaction in database
    const { data: transaction, error: dbError } = await supabase
      .from('crypto_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'deposit',
        payment_id: paymentData.payment_id,
        currency: currency.toUpperCase(),
        amount: paymentData.pay_amount,
        usd_amount: amount,
        status: 'pending',
        payment_address: paymentData.pay_address,
        payment_url: paymentData.invoice_url || paymentData.payment_url,
        metadata: paymentData,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        payment_id: paymentData.payment_id,
        payment_address: paymentData.pay_address,
        payment_url: paymentData.invoice_url || paymentData.payment_url,
        amount: paymentData.pay_amount,
        currency: currency.toUpperCase(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-crypto-payment:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
