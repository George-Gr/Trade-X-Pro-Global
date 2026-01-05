import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Rate Limiting (3 submissions per minute per user)
    const { data: limitData, error: limitError } = await supabase.rpc(
      'check_rate_limit',
      {
        p_user_id: user.id,
        p_endpoint: 'submit-kyc',
        p_max_requests: 3,
        p_window_seconds: 60,
      }
    );

    if (limitError) {
      console.error('Rate limit RPC error:', limitError);
      // We don't want to block the user if the rate limiter fails,
      // but we should log it.
    } else if (limitData && !limitData.allowed) {
      const resetAt = new Date(limitData.reset_at);
      const now = new Date();
      const resetInSeconds = Math.ceil(
        (resetAt.getTime() - now.getTime()) / 1000
      );

      return new Response(
        JSON.stringify({
          error: 'Too many KYC submissions. Please wait before trying again.',
          reset_at: limitData.reset_at,
          reset_in_seconds: resetInSeconds,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Process Request
    const { type } = await req.json();
    if (!type) {
      return new Response(JSON.stringify({ error: 'Missing document type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate document type against allowlist
    const ALLOWED_TYPES = [
      'passport',
      'drivers_license',
      'national_id',
      'proof_of_address',
    ];
    if (!ALLOWED_TYPES.includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid document type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate unique file path
    const fileName = `${type}_${Date.now()}`;
    const filePath = `${user.id}/${fileName}`;

    // Create signed upload URL
    const { data: uploadInfo, error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .createSignedUploadUrl(filePath);

    if (uploadError || !uploadInfo) {
      console.error('Upload URL creation error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to create upload URL' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Create document record (pending validation)
    const { error: dbError } = await supabase.from('kyc_documents').insert({
      user_id: user.id,
      document_type: type,
      file_path: filePath,
      status: 'pending',
    });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to create document record' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        upload: {
          signedUrl: uploadInfo.signedUrl,
          filePath: filePath,
          token: uploadInfo.token,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    console.error('Error in submit-kyc:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
