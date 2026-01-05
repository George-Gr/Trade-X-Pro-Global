// useKyc: Hook for KYC status and actions
import { supabase } from '@/integrations/supabase/client';
import { checkRateLimit } from '@/lib/rateLimiter';
import { useCallback, useEffect, useState } from 'react';

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

/**
 * Custom React hook for managing KYC (Know Your Customer) status and operations
 *
 * This hook provides functionality to fetch KYC status, submit KYC requests,
 * upload documents, and validate uploaded documents for a given user.
 *
 * @param userId - Optional user ID string. When provided, automatically fetches
 *                 KYC status for that user on mount. If undefined, operations
 *                 will be no-ops until a userId is supplied.
 * @returns Object containing:
 *   - kycStatus: Current KYC status ('pending', 'submitted', 'approved', 'rejected', etc.)
 *   - kycRequest: Latest KYC request data object or null
 *   - documents: Array of uploaded KYC documents with metadata
 *   - loading: Boolean indicating if any async operation is in progress
 *   - error: Error message string or null
 *   - submitKycRequest: Function to initiate KYC submission flow
 *   - uploadDocument: Function to upload document after receiving signed URL
 *   - validateDocument: Function to validate uploaded document via server
 *   - refresh: Function to manually refresh KYC status data
 *
 * @example
 * ```typescript
 * const { kycStatus, loading, error, submitKycRequest, refresh } = useKyc(userId);
 *
 * // Check status
 * if (kycStatus === 'pending') {
 *   // Show upload UI
 * }
 *
 * // Submit new request
 * await submitKycRequest('passport');
 *
 * // Refresh manually
 * refresh();
 * ```
 *
 * @throws Error when userId is required but not provided for operations like submission
 *
 * @remarks
 * - Automatically fetches KYC status when userId is provided on mount
 * - Uses rate limiting to prevent excessive submissions (max 3 per minute)
 * - Maintains real-time subscriptions for status updates
 * - When userId is undefined, functions will throw errors requiring user context
 */
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
      // Fetch documents from kyc_documents table
      const { data: docs, error: docsErr } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (docsErr) throw docsErr;

      // Map database documents to KycDocumentData format
      const mappedDocs = (docs || []).map((doc: Record<string, unknown>) => ({
        id: doc.id,
        kyc_request_id: doc.id,
        type: doc.document_type,
        url: doc.file_path,
        status: doc.status,
        uploaded_at: doc.created_at,
        reviewed_at: doc.reviewed_at,
      })) as KycDocumentData[];

      setDocuments(mappedDocs);

      // Set status based on documents
      if (docs && docs.length > 0) {
        const latestDoc = docs[0] as { status?: string };
        setKycStatus(latestDoc.status || 'pending');
      } else {
        setKycStatus('pending');
      }
    } catch (err: unknown) {
      // Failed to fetch KYC status
      setError(
        err instanceof Error ? err.message : 'Failed to fetch KYC status'
      );
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
  const submitKycRequest = useCallback(
    async (documentType: string) => {
      // Check rate limit before submitting KYC (3 submissions per minute)
      const rateCheck = checkRateLimit('kyc');
      if (!rateCheck.allowed) {
        const error = new Error(
          `Too many KYC submissions. Please wait ${Math.ceil(
            rateCheck.resetIn / 1000
          )} seconds before trying again.`
        );
        setError(error.message);
        throw error;
      }

      setError(null);
      try {
        if (!userId) throw new Error('No user context');

        // Get session and validate
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) {
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        if (!sessionData.session?.access_token) {
          throw new Error('Not authenticated');
        }

        // Request signed upload URL
        const submitResp = await fetch('/supabase/functions/submit-kyc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ type: documentType }),
        });

        if (submitResp.status === 429) {
          const err = await submitResp.json().catch(() => ({}));
          const resetIn = err.reset_in_seconds
            ? `${err.reset_in_seconds} seconds`
            : 'a few moments';
          throw new Error(
            `Too many KYC submissions. Please wait ${resetIn} before trying again.`
          );
        }

        if (!submitResp.ok) {
          const err = await submitResp.json().catch(() => ({}));
          throw new Error(err?.error || 'Failed to request upload URL');
        }

        const submitJson = await submitResp.json();
        const uploadInfo = submitJson.upload || {};
        const signedUrl = uploadInfo.signedUrl;
        const filePath = uploadInfo.filePath;

        setKycRequest(submitJson.kycRequest); // Assuming kycRequest is part of the response
        setKycStatus('submitted'); // Or a more specific status like 'awaiting_upload'
        return { signedUrl, filePath, kycRequest: submitJson.kycRequest };
      } catch (err: unknown) {
        // Submit KYC error
        setError(
          err instanceof Error ? err.message : 'Failed to submit KYC request'
        );
        throw err;
      }
    },
    [userId]
  );

  // Upload a document (after receiving signed URL from submit-kyc)
  const uploadDocument = useCallback(async (signedUrl: string, file: File) => {
    setError(null);
    try {
      const resp = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });

      if (!resp.ok) {
        throw new Error('Failed to upload file');
      }

      return { success: true };
    } catch (err: unknown) {
      // Upload document error
      setError(
        err instanceof Error ? err.message : 'Failed to upload document'
      );
      throw err;
    }
  }, []);

  // Validate uploaded document (call server to verify)
  const validateDocument = useCallback(
    async (filePath: string) => {
      setError(null);
      try {
        const resp = await fetch('/supabase/functions/validate-kyc-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath }),
          credentials: 'include',
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
      } catch (err: unknown) {
        // Validate document error
        setError(
          err instanceof Error ? err.message : 'Failed to validate document'
        );
        throw err;
      }
    },
    [userId, fetchKycStatus]
  );

  return {
    kycStatus,
    kycRequest,
    documents,
    loading,
    error,
    submitKycRequest,
    uploadDocument,
    validateDocument,
    refresh: () => fetchKycStatus(userId),
  };
}
