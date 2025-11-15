// Mock KYC provider adapter for testing auto-approve rules
import { KycService } from '../kycService';

export async function sendMockVerification(kycRequestId: string, outcome: 'approved' | 'rejected' | 'manual_review' = 'approved') {
  const kyc = new KycService();
  // Simulate provider response payload
  const rawResponse = { id: `mock-${Math.random().toString(36).slice(2,8)}`, simulated: true };
  const score = outcome === 'approved' ? 95 : (outcome === 'rejected' ? 10 : 50);
  // Record verification (this will also update kyc_requests status)
  await kyc.recordVerification(kycRequestId, 'mock-provider', outcome === 'approved' ? 'approved' : (outcome === 'rejected' ? 'rejected' : 'needs_review'), score, rawResponse);
  return { kycRequestId, outcome, score, rawResponse };
}
