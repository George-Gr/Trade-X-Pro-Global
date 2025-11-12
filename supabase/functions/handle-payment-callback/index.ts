import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get IPN data from NowPayments
    const ipnData = await req.json();
    console.log('Received IPN:', ipnData);

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
