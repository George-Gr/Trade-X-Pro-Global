// useKyc: Hook for KYC status and actions
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseBrowserClient";

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
  const [kycStatus, setKycStatus] = useState<string>("pending");
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
        .from("kyc_documents")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

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
        setKycStatus(latestDoc.status || "pending");
      } else {
        setKycStatus("pending");
      }
    } catch (err: unknown) {
      // Failed to fetch KYC status
      setError(
        err instanceof Error ? err.message : "Failed to fetch KYC status",
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
      setError(null);
      try {
        if (!userId) throw new Error("No user context");

        const resp = await fetch("/supabase/functions/submit-kyc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentType }),
          credentials: "include",
        });

        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to submit KYC request");
        }

        const result = await resp.json();
        setKycRequest(result.kycRequest);
        setKycStatus("submitted");
        return result;
      } catch (err: unknown) {
        // Submit KYC error
        setError(
          err instanceof Error ? err.message : "Failed to submit KYC request",
        );
        throw err;
      }
    },
    [userId],
  );

  // Upload a document (after receiving signed URL from submit-kyc)
  const uploadDocument = useCallback(async (signedUrl: string, file: File) => {
    setError(null);
    try {
      const resp = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!resp.ok) {
        throw new Error("Failed to upload file");
      }

      return { success: true };
    } catch (err: unknown) {
      // Upload document error
      setError(
        err instanceof Error ? err.message : "Failed to upload document",
      );
      throw err;
    }
  }, []);

  // Validate uploaded document (call server to verify)
  const validateDocument = useCallback(
    async (filePath: string) => {
      setError(null);
      try {
        const resp = await fetch("/supabase/functions/validate-kyc-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath }),
          credentials: "include",
        });

        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          throw new Error(body?.error || "Validation failed");
        }

        // Refresh KYC status after validation
        if (userId) {
          await fetchKycStatus(userId);
        }

        return await resp.json();
      } catch (err: unknown) {
        // Validate document error
        setError(
          err instanceof Error ? err.message : "Failed to validate document",
        );
        throw err;
      }
    },
    [userId, fetchKycStatus],
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
