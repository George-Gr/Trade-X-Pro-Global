import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import z from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ProcessWithdrawalSchema = z.object({
  withdrawal_id: z.string(),
  action: z.enum(['approve', 'reject', 'process', 'complete', 'fail'] as const),
  reason: z.string(),
  transaction_hash: z.string(),
});



serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT and check if admin
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

    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate request body
    const body = await req.json();
    const validation = ProcessWithdrawalSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!validation.data) {
      return new Response(
        JSON.stringify({ error: 'Validation failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { withdrawal_id, action, reason, transaction_hash } = validation.data;

    // Fetch withdrawal request
    const { data: withdrawal, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawal_id)
      .single();

    if (fetchError || !withdrawal) {
      return new Response(
        JSON.stringify({ error: 'Withdrawal request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different actions
    if (action === 'approve') {
      // Approve the withdrawal request
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', withdrawal_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to approve withdrawal' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create audit log
      await supabase.from('withdrawal_audit').insert({
        withdrawal_id,
        admin_id: user.id,
        action: 'approved',
        reason: reason && reason.trim() !== '' ? reason : 'Withdrawal approved by admin',
      });

      // Send notification
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            user_id: withdrawal.user_id,
            type: 'withdrawal_approved',
            title: 'Withdrawal Approved',
            message: `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has been approved and will be processed shortly.`,
          },
        });
      } catch (e) {
        console.error('Error sending notification:', e);
      }

      return new Response(
        JSON.stringify({
          success: true,
          withdrawal_id,
          status: 'approved',
          message: 'Withdrawal approved',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reject') {
      // Reject the withdrawal and refund the balance
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', withdrawal_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to reject withdrawal' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Refund the balance
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', withdrawal.user_id)
        .single();

      if (userProfile) {
        const totalAmount = withdrawal.amount + (withdrawal.fee_amount || 0) + (withdrawal.network_fee || 0);
        await supabase
          .from('profiles')
          .update({
            balance: (userProfile.balance || 0) + totalAmount,
            held_balance: Math.max(0, (userProfile.held_balance || 0) - totalAmount),
          })
          .eq('id', withdrawal.user_id);
      }

      // Create audit log
      await supabase.from('withdrawal_audit').insert({
        withdrawal_id,
        admin_id: user.id,
        action: 'rejected',
        reason: reason && reason.trim() !== '' ? reason : 'Withdrawal rejected by admin',
      });

      // Send notification
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            user_id: withdrawal.user_id,
            type: 'withdrawal_rejected',
            title: 'Withdrawal Rejected',
            message: `Your withdrawal request has been rejected. Reason: ${reason && reason.trim() !== '' ? reason : 'Policy violation'}. Your balance has been refunded.`,
          },
        });
      } catch (e) {
        console.error('Error sending notification:', e);
      }

      return new Response(
        JSON.stringify({
          success: true,
          withdrawal_id,
          status: 'failed',
          message: 'Withdrawal rejected and balance refunded',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'process') {
      // Send crypto to destination address via NowPayments
      try {
        // Call NowPayments API to send withdrawal
        const nowpaymentsResponse = await fetch('https://api.nowpayments.io/v1/withdrawal', {
          method: 'POST',
          headers: {
            'x-api-key': nowpaymentsApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet_id: withdrawal.destination_address,
            network: mapCurrencyToNetwork(withdrawal.currency),
            amount: withdrawal.amount,
            withdrawal_priority: 'high',
          }),
        });

        if (!nowpaymentsResponse.ok) {
          const errorText = await nowpaymentsResponse.text();
          console.error('NowPayments withdrawal error:', errorText);
          throw new Error(`NowPayments API error: ${errorText}`);
        }

        const withdrawalData = await nowpaymentsResponse.json() as { withdrawal_id: string };

        // Update withdrawal request with transaction info
        const { error: updateError } = await supabase
          .from('withdrawal_requests')
          .update({
            status: 'processing',
            transaction_hash: withdrawalData.withdrawal_id || (transaction_hash && transaction_hash.trim() !== '' ? transaction_hash : null),
            processed_at: new Date().toISOString(),
            metadata: {
              nowpayments_withdrawal_id: withdrawalData.withdrawal_id,
              processed_by_admin: user.id,
              processed_at: new Date().toISOString(),
            },
          })
          .eq('id', withdrawal_id);

        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update withdrawal status' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create audit log
        await supabase.from('withdrawal_audit').insert({
          withdrawal_id,
          admin_id: user.id,
          action: 'processing',
          reason: `Sent to blockchain via NowPayments`,
          metadata: {
            nowpayments_withdrawal_id: withdrawalData.withdrawal_id,
            destination_address: withdrawal.destination_address,
          },
        });

        // Send notification
        try {
          await supabase.functions.invoke('send-notification', {
            body: {
              user_id: withdrawal.user_id,
              type: 'withdrawal_processing',
              title: 'Withdrawal Processing',
              message: `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} is now being processed. TXID: ${withdrawalData.withdrawal_id}`,
            },
          });
        } catch (e) {
          console.error('Error sending notification:', e);
        }

        return new Response(
          JSON.stringify({
            success: true,
            withdrawal_id,
            status: 'processing',
            transaction_hash: withdrawalData.withdrawal_id,
            message: 'Withdrawal sent to blockchain',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.error('Error processing withdrawal:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Update withdrawal status to failed
        await supabase
          .from('withdrawal_requests')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', withdrawal_id);

        // Refund the balance
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', withdrawal.user_id)
          .single();

        if (userProfile) {
          const totalAmount = withdrawal.amount + (withdrawal.fee_amount || 0) + (withdrawal.network_fee || 0);
          await supabase
            .from('profiles')
            .update({
              balance: (userProfile.balance || 0) + totalAmount,
              held_balance: Math.max(0, (userProfile.held_balance || 0) - totalAmount),
            })
            .eq('id', withdrawal.user_id);
        }

        return new Response(
          JSON.stringify({
            error: 'Failed to process withdrawal',
            details: errorMessage,
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'complete') {
      // Mark withdrawal as completed
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          confirmations: 3,
        })
        .eq('id', withdrawal_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to complete withdrawal' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create audit log
      await supabase.from('withdrawal_audit').insert({
        withdrawal_id,
        admin_id: user.id,
        action: 'completed',
        reason: 'Withdrawal confirmed on blockchain',
      });

      // Send notification
      try {
        await supabase.functions.invoke('send-notification', {
          body: {
            user_id: withdrawal.user_id,
            type: 'withdrawal_completed',
            title: 'Withdrawal Completed',
            message: `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has been completed successfully!`,
          },
        });
      } catch (e) {
        console.error('Error sending notification:', e);
      }

      return new Response(
        JSON.stringify({
          success: true,
          withdrawal_id,
          status: 'completed',
          message: 'Withdrawal marked as completed',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'fail') {
      // Mark as failed and refund
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', withdrawal_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to mark withdrawal as failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Refund the balance
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', withdrawal.user_id)
        .single();

      if (userProfile) {
        const totalAmount = withdrawal.amount + (withdrawal.fee_amount || 0) + (withdrawal.network_fee || 0);
        await supabase
          .from('profiles')
          .update({
            balance: (userProfile.balance || 0) + totalAmount,
            held_balance: Math.max(0, (userProfile.held_balance || 0) - totalAmount),
          })
          .eq('id', withdrawal.user_id);
      }

      // Create audit log
      await supabase.from('withdrawal_audit').insert({
        withdrawal_id,
        admin_id: user.id,
        action: 'failed',
        reason: reason && reason.trim() !== '' ? reason : 'Withdrawal failed',
      });

      return new Response(
        JSON.stringify({
          success: true,
          withdrawal_id,
          status: 'failed',
          message: 'Withdrawal marked as failed and balance refunded',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-withdrawal:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to map currency to blockchain network
function mapCurrencyToNetwork(currency: string): string {
  const networkMap: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'USDT': 'Ethereum', // USDT-ERC20
    'USDC': 'Ethereum', // USDC-ERC20
    'LTC': 'Litecoin',
    'BNB': 'BinanceSmartChain',
  };
  return networkMap[currency] || 'Ethereum';
}
