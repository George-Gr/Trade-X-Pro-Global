// admin/kyc-review Edge Function: Admin KYC decision processing
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role
    const { data: roleData, error: roleError } = await supabase
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

    // Parse request body
    const body = await req.json();
    const { kycRequestId, action, statusAfter, notes } = body;

    if (!kycRequestId || !action || !statusAfter) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: kycRequestId, action, statusAfter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate action
    const validActions = ['approve', 'reject', 'request_more_info'];
    if (!validActions.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get KYC request with user info
    const { data: kycRequest, error: kycError } = await supabase
      .from('kyc_requests')
      .select(`
        *,
        user_id
      `)
      .eq('id', kycRequestId)
      .single();

    if (kycError || !kycRequest) {
      return new Response(
        JSON.stringify({ error: 'KYC request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = kycRequest.user_id;
    const previousStatus = kycRequest.status;

    // Get user profile for notifications
    const { data: userProfile, error: fetchProfileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, kyc_status')
      .eq('id', userId)
      .single();

    if (fetchProfileError || !userProfile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update KYC request status
    const { error: updateError } = await supabase
      .from('kyc_requests')
      .update({
        status: statusAfter,
        reviewed_at: new Date().toISOString(),
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', kycRequestId);

    if (updateError) {
      console.error('Failed to update KYC request:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update KYC request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user profile KYC status
    const profileUpdate: any = { kyc_status: statusAfter };
    if (action === 'approve') {
      profileUpdate.kyc_status = 'approved';
      profileUpdate.kyc_verified_at = new Date().toISOString();
    } else if (action === 'reject') {
      profileUpdate.kyc_status = 'rejected';
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', userId);

    if (profileError) {
      console.error('Failed to update profile KYC status:', profileError);
    }

    // Create audit log entry
    const { error: auditError } = await supabase
      .from('kyc_audit')
      .insert({
        kyc_request_id: kycRequestId,
        actor_id: user.id,
        action: action,
        status_before: previousStatus,
        status_after: statusAfter,
        notes: notes || null,
        created_at: new Date().toISOString(),
      });

    if (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    // If approved, give initial balance if needed
    if (action === 'approve') {
      const { data: balanceData } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      if (!balanceData?.balance || balanceData.balance === 0) {
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({
            balance: 10000,
          })
          .eq('id', userId);

        if (balanceError) {
          console.error('Failed to set initial balance:', balanceError);
        }
      }
    }

    // Create notification for user
    const notificationMessages: Record<string, string> = {
      approve: `✅ Congratulations! Your KYC has been approved. You now have full access to trading with an initial balance of $10,000.`,
      reject: `❌ Your KYC submission was rejected. Reason: ${notes || 'Document verification failed'}. You can resubmit in 7 days.`,
      request_more_info: `⚠️ Your KYC submission needs more information. Please review the request and resubmit the required documents.`,
    };

    const notificationMessage = notificationMessages[action] || 'Your KYC status has been updated.';

    // Insert notification (if notifications table exists)
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'KYC Status Update',
          message: notificationMessage,
          type: action === 'approve' ? 'success' : action === 'reject' ? 'error' : 'warning',
          read: false,
          created_at: new Date().toISOString(),
        });
    } catch (notifError) {
      console.warn('Failed to create notification:', notifError);
      // Continue even if notification fails
    }

    // 6. Send email notification
    try {
      const emailAction = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : 'MORE_INFO';
      // This is a placeholder - you'd integrate with SendGrid, AWS SES, or similar
      console.log(`Sending email to ${userProfile.email} - KYC ${emailAction}`);
    } catch (emailError) {
      console.warn('Failed to send email:', emailError);
      // Continue even if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `KYC ${action} processed successfully`,
        kycRequestId,
        action,
        statusAfter,
        userId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('admin/kyc-review error:', err);
    return new Response(
      JSON.stringify({ error: message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

export default null;
