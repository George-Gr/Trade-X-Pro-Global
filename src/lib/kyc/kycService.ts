// KYC Service Types & Skeleton
export type KycStatus = 'pending' | 'auto_approved' | 'submitted' | 'manual_review' | 'approved' | 'rejected' | 'suspended' | 'escalated';

export interface KycRequest {
  id: string;
  userId: string;
  status: KycStatus;
  submittedAt?: string;
  reviewedAt?: string;
  provider?: string;
  providerRef?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KycDocument {
  id: string;
  kycRequestId: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  status: string;
  uploadedAt: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KycVerification {
  id: string;
  kycRequestId: string;
  provider: string;
  providerRef?: string;
  result: string;
  score?: number;
  receivedAt: string;
  rawResponse?: any;
  createdAt: string;
}

export interface KycAudit {
  id: string;
  kycRequestId: string;
  actorId?: string;
  action: string;
  statusBefore?: KycStatus;
  statusAfter?: KycStatus;
  notes?: string;
  createdAt: string;
}

export class KycService {
  // Add methods for request creation, document upload, verification, status transitions, audit logging
  async createKycRequest(userId: string, provider?: string): Promise<KycRequest> {
    const { supabase } = await import('../supabaseClient');
    const { data, error } = await supabase
      .from('kyc_requests')
      .insert({ user_id: userId, provider, status: 'submitted', submitted_at: new Date().toISOString() })
      .select('*')
      .single();
    if (error) throw error;
    return data as KycRequest;
  }

  async uploadDocument(kycRequestId: string, type: string, url: string): Promise<KycDocument> {
    const { supabase } = await import('../supabaseClient');
    const { data, error } = await supabase
      .from('kyc_documents')
      .insert({ kyc_request_id: kycRequestId, type, url, status: 'uploaded', uploaded_at: new Date().toISOString() })
      .select('*')
      .single();
    if (error) throw error;
    return data as KycDocument;
  }

  async recordVerification(kycRequestId: string, provider: string, result: string, score?: number, rawResponse?: any): Promise<KycVerification> {
    const { supabase } = await import('../supabaseClient');
    const { data, error } = await supabase
      .from('kyc_verifications')
      .insert({ kyc_request_id: kycRequestId, provider, provider_ref: rawResponse?.id || null, result, score, raw_response: rawResponse })
      .select('*')
      .single();
    if (error) throw error;

    // Optionally update request status based on result
    const status = result === 'approved' ? 'auto_approved' : (result === 'rejected' ? 'rejected' : 'manual_review');
    await supabase.from('kyc_requests').update({ status, provider: provider }).eq('id', kycRequestId);

    return data as KycVerification;
  }

  async logAudit(kycRequestId: string, actorId: string, action: string, statusBefore: KycStatus, statusAfter: KycStatus, notes?: string): Promise<KycAudit> {
    const { supabase } = await import('../supabaseClient');
    const { data, error } = await supabase
      .from('kyc_audit')
      .insert({ kyc_request_id: kycRequestId, actor_id: actorId, action, status_before: statusBefore, status_after: statusAfter, notes })
      .select('*')
      .single();
    if (error) throw error;
    return data as KycAudit;
  }

  async updateStatus(kycRequestId: string, newStatus: KycStatus): Promise<KycRequest> {
    const { supabase } = await import('../supabaseClient');
    const { data, error } = await supabase
      .from('kyc_requests')
      .update({ status: newStatus, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', kycRequestId)
      .select('*')
      .single();
    if (error) throw error;
    return data as KycRequest;
  }

  async updateDocumentStatus(documentId: string, status: string, notes?: string) {
    const { supabase } = await import('../supabaseClient');
    const { data, error } = await supabase
      .from('kyc_documents')
      .update({ status, notes, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', documentId)
      .select('*')
      .single();
    if (error) throw error;
    return data as KycDocument;
  }
}
