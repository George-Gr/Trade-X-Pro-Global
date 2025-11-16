// useKyc: Hook for KYC status and actions
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface KycRequestData {
  id: string;
  user_id: string;
  status: string;
  submitted_at?: string;
  reviewed_at?: string;
  provider?: string;
  created_at: string;
  updated_at: string;
}

export interface KycDocumentData {
  id: string;
  kyc_request_id: string;
  type: string;
  url: string;
  status: string;
  uploaded_at: string;
  reviewed_at?: string;
}

export function useKyc(userId?: string) {
  const [kycStatus, setKycStatus] = useState<string>('pending');
  const [kycRequest, setKycRequest] = useState<KycRequestData | null>(null);
  const [documents, setDocuments] = useState<KycDocumentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch KYC request and documents for the user
  const fetchKycStatus = useCallback(async (uid?: string) => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    try {
      const { data: requestData, error: reqErr } = await supabase
        .from('kyc_requests' as any)
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (reqErr && reqErr.code !== 'PGRST116') {
        throw reqErr;
      }

      // supabase client returns a complex typed result; cast via unknown first
      const request = (requestData as unknown) as KycRequestData | null;

      if (request && request.id) {
        setKycRequest(request);
        setKycStatus(request.status || 'pending');

        // Fetch documents
        const { data: docs, error: docsErr } = await supabase
          .from('kyc_documents' as any)
          .select('*')
          .eq('kyc_request_id', request.id)
          .order('uploaded_at', { ascending: false });

        if (docsErr) throw docsErr;
        setDocuments(((docs ?? []) as unknown) as KycDocumentData[]);
      } else {
        setKycStatus('pending');
        setDocuments([]);
      }
    } catch (err: any) {
      // Failed to fetch KYC status
      setError(err?.message || 'Failed to fetch KYC status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchKycStatus(userId);
    }
  }, [userId, fetchKycStatus]);

  // Submit a KYC request (initiate the flow)
  const submitKycRequest = useCallback(async (documentType: string) => {
    setError(null);
    try {
      if (!userId) throw new Error('No user context');

      const resp = await fetch('/supabase/functions/submit-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType }),
        credentials: 'include'
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body?.error || 'Failed to submit KYC request');
      }

      const result = await resp.json();
      setKycRequest(result.kycRequest);
      setKycStatus('submitted');
      return result;
    } catch (err: any) {
      // Submit KYC error
      setError(err?.message || 'Failed to submit KYC request');
      throw err;
    }
  }, [userId]);

  // Upload a document (after receiving signed URL from submit-kyc)
  const uploadDocument = useCallback(async (signedUrl: string, file: File) => {
    setError(null);
    try {
      const resp = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      });

      if (!resp.ok) {
        throw new Error('Failed to upload file');
      }

      return { success: true };
    } catch (err: any) {
      // Upload document error
      setError(err?.message || 'Failed to upload document');
      throw err;
    }
  }, []);

  // Validate uploaded document (call server to verify)
  const validateDocument = useCallback(async (filePath: string) => {
    setError(null);
    try {
      const resp = await fetch('/supabase/functions/validate-kyc-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
        credentials: 'include'
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body?.error || 'Validation failed');
      }

      // Refresh KYC status after validation
      if (userId) {
        await fetchKycStatus(userId);
      }

      return await resp.json();
    } catch (err: any) {
      // Validate document error
      setError(err?.message || 'Failed to validate document');
      throw err;
    }
  }, [userId, fetchKycStatus]);

  return {
    kycStatus,
    kycRequest,
    documents,
    loading,
    error,
    submitKycRequest,
    uploadDocument,
    validateDocument,
    refresh: () => fetchKycStatus(userId)
  };
}

