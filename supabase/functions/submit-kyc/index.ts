// submit-kyc Edge Function: User KYC document upload
import { KycService } from '../../../src/lib/kyc/kycService';

export async function handleSubmitKyc(req, res) {
  // Auth check: expecting authenticated request with user info
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { fileName, type, contentType } = req.body || {};
  if (!fileName || !type) return res.status(400).json({ error: 'Missing fileName or type' });

  const kycService = new KycService();

  // Create or fetch KYC request
  const kycRequest = await kycService.createKycRequest(userId);

  // Generate storage path: userId/<timestamp>_<random>_<filename>
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const filePath = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 9)}_${cleanFileName}`;

  // Create a pending document record referencing the path (actual upload will happen client-side)
  const document = await kycService.uploadDocument(kycRequest.id, type, filePath);

  // Create signed upload URL (PUT) via Supabase Storage
  const { supabase } = await import('../../../src/lib/supabaseClient');
  try {
    // expiresIn in seconds (1 hour)
    const expiresIn = 60 * 60;
    // supabase-js v2: createSignedUploadUrl(bucket, path, expiresIn)
    const { data, error } = await supabase.storage.from('kyc-documents').createSignedUploadUrl(filePath, expiresIn);
    if (error) throw error;

    const signedUploadUrl = data?.signedUrl || data?.signed_upload_url || data?.signedUploadUrl || null;

    return res.status(200).json({ kycRequest, document, upload: { filePath, signedUploadUrl, expiresIn } });
  } catch (err) {
    // If signed URL creation fails, return the document info and an error
    return res.status(500).json({ error: 'Failed to create signed upload URL', details: err?.message || String(err) });
  }
}

// Export for Edge runtime
export default handleSubmitKyc;
