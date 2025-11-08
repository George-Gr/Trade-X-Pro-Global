-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false);

-- Allow authenticated users to upload their own KYC documents
CREATE POLICY "Users can upload own KYC documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own KYC documents
CREATE POLICY "Users can view own KYC documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all KYC documents
CREATE POLICY "Admins can view all KYC documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete KYC documents
CREATE POLICY "Admins can delete KYC documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);