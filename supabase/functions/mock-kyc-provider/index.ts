// Mock KYC provider endpoint to simulate provider callback
import { sendMockVerification } from '../../../src/lib/kyc/providers/mockProvider';

export async function handleMockProvider(req, res) {
  const { kycRequestId, outcome } = req.body || {};
  if (!kycRequestId) return res.status(400).json({ error: 'Missing kycRequestId' });
  const result = await sendMockVerification(kycRequestId, outcome);
  return res.status(200).json({ success: true, result });
}

export default handleMockProvider;
