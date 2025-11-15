// kyc-webhook Edge Function: Provider callback handler
import { KycService } from '../../../src/lib/kyc/kycService';

export async function handleKycWebhook(req, res) {
  // Parse provider, providerRef, result, score, rawResponse
  const { provider, providerRef, result, score, rawResponse, kycRequestId } = req.body;
  if (!provider || !providerRef || !result || !kycRequestId) return res.status(400).json({ error: 'Missing required fields' });

  const kycService = new KycService();
  await kycService.recordVerification(kycRequestId, provider, result, score, rawResponse);

  // TODO: Update KYC request status based on result

  return res.status(200).json({ success: true });
}

export default handleKycWebhook;
