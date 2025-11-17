// submit-kyc Edge Function: User KYC document upload initialization
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { type } = body;

    if (!type) {
      return new Response(
        JSON.stringify({ error: "Missing document type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate document type
    const validTypes = ['id_front', 'id_back', 'proof_of_address', 'selfie'];
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid document type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or create KYC request
    const { data: existingRequest, error: fetchError } = await supabase
      .from("kyc_requests")
      .select("id")
      .eq("user_id", user.id)
      .not("status", "in", `(approved, rejected)`)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let kycRequestId = existingRequest?.id;

    if (!kycRequestId) {
      // Create new KYC request
      const { data: newRequest, error: createError } = await supabase
        .from("kyc_requests")
        .insert({
          user_id: user.id,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (createError || !newRequest) {
        return new Response(
          JSON.stringify({ error: "Failed to create KYC request" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      kycRequestId = newRequest.id;
    }

    // Generate secure file path
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 9);
    const fileExtension = "bin"; // Will be updated on upload validation
    const filePath = `${user.id}/${timestamp}_${random}_${type}.${fileExtension}`;

    // Create document record (pending validation)
    const { data: doc, error: docError } = await supabase
      .from("kyc_documents")
      .insert({
        kyc_request_id: kycRequestId,
        type: type,
        url: filePath,
        status: "pending",
        uploaded_at: new Date().toISOString(),
      })
      .select("id, url")
      .single();

    if (docError || !doc) {
      return new Response(
        JSON.stringify({ error: "Failed to create document record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create signed upload URL (valid for 1 hour)
    const expiresIn = 60 * 60;
    const { data: signedData, error: signError } = await supabase.storage
      .from("kyc-documents")
      .createSignedUploadUrl(filePath, { upsert: false });

    if (signError || !signedData?.signedUrl) {
      return new Response(
        JSON.stringify({ error: "Failed to create signed upload URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update KYC request status to submitted if documents uploaded
    await supabase
      .from("kyc_requests")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", kycRequestId);

    return new Response(
      JSON.stringify({
        success: true,
        kycRequestId,
        document: doc,
        upload: {
          filePath,
          signedUrl: signedData.signedUrl,
          expiresIn,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error in submit-kyc:", err);
    return new Response(
      JSON.stringify({ error: message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

export default null;
