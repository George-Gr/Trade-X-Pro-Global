import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-nowpayments-sig',
};

// Zod schema for IPN data validation
const IPNDataSchema = z.object({
  payment_id: z.union([z.string().min(1), z.number()]).transform(val => String(val)),
  payment_status: z.enum([
    'waiting', 
    'confirming', 
    'confirmed', 
    'sending', 
    'partially_paid', 
    'finished', 
    'failed', 
    'expired', 
    'refunded'
  ]),
  actually_paid: z.number().nonnegative().optional(),
  pay_amount: z.number().nonnegative().optional(),
  pay_currency: z.string().optional(),
  order_id: z.string().optional(),
  order_description: z.string().optional(),
  price_amount: z.number().nonnegative().optional(),
  price_currency: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')!;
    const ipnSecret = Deno.env.get('NOWPAYMENTS_IPN_SECRET');

    if (!ipnSecret) {
      console.error('CRITICAL: NOWPAYMENTS_IPN_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify IPN signature
    const receivedSig = req.headers.get('x-nowpayments-sig');
    if (!receivedSig) {
      console.error('Missing x-nowpayments-sig header - potential attack');
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read body for signature verification
    const body = await req.text();
    
    // Verify HMAC-SHA512 signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(ipnSecret);
    const messageData = encoder.encode(body);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const expectedSig = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (receivedSig !== expectedSig) {
      console.error('Invalid signature - potential attack attempt');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse and validate IPN data with Zod schema
    let rawData: unknown;
    try {
      rawData = JSON.parse(body);
    } catch (parseError) {
      console.error('Invalid JSON in IPN body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = IPNDataSchema.safeParse(rawData);
    if (!validation.success) {
      console.error('IPN data validation failed:', validation.error.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid IPN data structure', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ipnData = validation.data;
    console.log('Validated IPN received:', { payment_id: ipnData.payment_id, status: ipnData.payment_status });

    const paymentId = ipnData.payment_id;
    const paymentStatus = ipnData.payment_status;
    const actualAmountReceived = ipnData.actually_paid;

    // Verify payment status with NowPayments API
    const verifyResponse = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
      method: 'GET',
      headers: {
        'x-api-key': nowpaymentsApiKey,
      },
    });

    if (!verifyResponse.ok) {
      console.error('Failed to verify payment with NowPayments');
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verifiedPayment = await verifyResponse.json();

    // Find transaction in database
    const { data: transaction, error: findError } = await supabase
      .from('crypto_transactions')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    if (findError || !transaction) {
      console.error('Transaction not found:', paymentId);
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map NowPayments status to our status
    let newStatus = 'pending';
    if (paymentStatus === 'finished' || paymentStatus === 'confirmed') {
      newStatus = 'completed';
    } else if (paymentStatus === 'partially_paid') {
      newStatus = 'confirming';
    } else if (paymentStatus === 'failed' || paymentStatus === 'expired') {
      newStatus = 'failed';
    } else if (paymentStatus === 'refunded') {
      newStatus = 'refunded';
    }

    // Update transaction status
    const { error: updateError } = await supabase
      .from('crypto_transactions')
      .update({
        status: newStatus,
        actual_amount_received: actualAmountReceived,
        confirmations: verifiedPayment.confirmations || 0,
        metadata: verifiedPayment,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('Failed to update transaction:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If payment is completed, credit user's account
    if (newStatus === 'completed' && transaction.status !== 'completed') {
      // Get current user balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance, equity')
        .eq('id', transaction.user_id)
        .single();

      if (profileError) {
        console.error('Failed to get user profile:', profileError);
      } else {
        const depositAmount = transaction.usd_amount || 0;
        const newBalance = profile.balance + depositAmount;
        const newEquity = profile.equity + depositAmount;

        // Update user balance
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({
            balance: newBalance,
            equity: newEquity,
          })
          .eq('id', transaction.user_id);

        if (balanceError) {
          console.error('Failed to update user balance:', balanceError);
        } else {
          // Create ledger entry
          await supabase.from('ledger').insert({
            user_id: transaction.user_id,
            transaction_type: 'deposit',
            amount: depositAmount,
            balance_before: profile.balance,
            balance_after: newBalance,
            description: `Crypto deposit - ${transaction.currency} - ${transaction.amount}`,
            reference_id: transaction.id,
          });

          // Send notification
          await supabase.functions.invoke('send-notification', {
            body: {
              user_id: transaction.user_id,
              type: 'deposit',
              title: 'Deposit Completed',
              message: `Your crypto deposit of $${depositAmount.toFixed(2)} has been credited to your account.`,
              data: { transaction_id: transaction.id },
            },
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in handle-payment-callback:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
