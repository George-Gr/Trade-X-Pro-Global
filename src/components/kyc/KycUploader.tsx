// KycUploader: User UI for uploading KYC documents
import React, { useState } from 'react';

const KycUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('id_card');
  const [status, setStatus] = useState<string>('idle');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please choose a file to upload');
      return;
    }

    setUploading(true);
    setStatus('requesting-upload');

    try {
      // 1) Request signed upload URL and create pending document record
      const submitResp = await fetch('/supabase/functions/submit-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType }),
        credentials: 'include',
      });

      if (!submitResp.ok) {
        const err = await submitResp.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to request upload URL');
      }

      const submitJson = await submitResp.json();
      // server should return upload.signedUrl (or signed_upload_url) and filePath
      const uploadInfo = submitJson.upload || submitJson.uploadInfo || {};
      const signedUrl = uploadInfo.signedUrl || uploadInfo.signed_upload_url || uploadInfo.signedUrl || uploadInfo.signedUploadUrl || uploadInfo.signedURL;
      const filePath = uploadInfo.filePath || submitJson.document?.file_path || uploadInfo.file_path || uploadInfo.path;

      if (!signedUrl || !filePath) {
        throw new Error('Upload information missing from server response');
      }

      setStatus('uploading-file');

      // 2) Upload file directly to signed URL
      const putResp = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!putResp.ok && putResp.status !== 200 && putResp.status !== 201) {
        throw new Error('Failed to upload file to storage');
      }

      setStatus('validating');

      // 3) Notify server to validate the uploaded file (signed-upload flow)
      const validateResp = await fetch('/supabase/functions/validate-kyc-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
        credentials: 'include',
      });

      if (!validateResp.ok) {
        const err = await validateResp.json().catch(() => ({}));
        throw new Error(err?.error || 'Validation failed');
      }

      const validateJson = await validateResp.json();
      setStatus('submitted');
      setUploading(false);
      setFile(null);
      return validateJson;
    } catch (err: any) {
      setError(err?.message || 'Unexpected error');
      setStatus('error');
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload KYC Document</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Document Type
          <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} disabled={uploading}>
            <option value="id_card">ID Card</option>
            <option value="passport">Passport</option>
            <option value="driver_license">Driver License</option>
            <option value="proof_of_address">Proof of Address</option>
          </select>
        </label>

        <label>
          File
          <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} disabled={uploading} />
        </label>

        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading…' : 'Submit Document'}
          </button>
        </div>
      </form>

      <div style={{ marginTop: 12 }}>
        <strong>Status:</strong> {status}
      </div>
      {error && (
        <div style={{ marginTop: 8, color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default KycUploader;
