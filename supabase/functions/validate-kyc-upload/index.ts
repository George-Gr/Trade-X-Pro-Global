import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Magic number signatures for allowed file types
const MAGIC_NUMBERS = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
};

function validateFileType(bytes: Uint8Array): { valid: boolean; type?: string } {
  // Check PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { valid: true, type: 'pdf' };
  }
  
  // Check JPEG
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { valid: true, type: 'jpeg' };
  }
  
  // Check PNG
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && 
      bytes[3] === 0x47 && bytes[4] === 0x0D && bytes[5] === 0x0A &&
      bytes[6] === 0x1A && bytes[7] === 0x0A) {
    return { valid: true, type: 'png' };
  }
  
  return { valid: false };
}

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

    // Support two modes:
    // 1) form upload (file + documentType) -> upload to storage and create record (backward compatible)
    // 2) JSON body with { filePath } -> validate existing uploaded file (signed upload flow)

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const filePath = body.filePath;
      if (!filePath) {
        return new Response(JSON.stringify({ error: 'Missing filePath in JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Download file from storage
      const { data: fileStream, error: dlError } = await supabase.storage.from('kyc-documents').download(filePath);
      if (dlError) {
        return new Response(JSON.stringify({ error: 'Failed to download file', details: dlError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const arrayBuffer = await fileStream.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      if (bytes.length > 5 * 1024 * 1024) {
        return new Response(JSON.stringify({ error: 'File too large. Maximum size is 5MB.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const validation = validateFileType(bytes);
      if (!validation.valid) {
        return new Response(JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Find document record by url or file_path
      const { data: docs, error: qErr } = await supabase
        .from('kyc_documents')
        .select('*')
        .or(`url.eq.${filePath},file_path.eq.${filePath}`)
        .limit(1);
      if (qErr) {
        return new Response(JSON.stringify({ error: 'DB query error', details: qErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (!docs || docs.length === 0) {
        return new Response(JSON.stringify({ error: 'Document record not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const doc = docs[0];

      // Update document status to validated
      const { error: updErr } = await supabase.from('kyc_documents').update({ status: 'validated', reviewed_at: new Date().toISOString() }).eq('id', doc.id);
      if (updErr) {
        return new Response(JSON.stringify({ error: 'Failed to update document status', details: updErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ success: true, documentId: doc.id, filePath }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fallback to form upload path (original implementation)
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file || !documentType) {
      return new Response(JSON.stringify({ error: 'Missing file or document type' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Read file bytes for validation
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Validate file size (max 5MB)
    if (bytes.length > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum size is 5MB.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate file type using magic numbers
    const validation = validateFileType(bytes);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`File validated: ${validation.type}, size: ${bytes.length} bytes`);

    // Generate unique file path
    const fileExt = validation.type === 'jpeg' ? 'jpg' : validation.type;
    const fileName = `${documentType}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to upload file' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Create database record (try to support both schema variants)
    const { error: dbError } = await supabase.from('kyc_documents').insert({ user_id: user.id, document_type: documentType, file_path: filePath, url: filePath, type: documentType, status: 'pending' });

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('kyc-documents').remove([filePath]);
      return new Response(JSON.stringify({ error: 'Failed to save document record' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, message: 'Document uploaded and validated successfully', filePath }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err: unknown) {
    console.error("Error in validate-kyc-upload:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
