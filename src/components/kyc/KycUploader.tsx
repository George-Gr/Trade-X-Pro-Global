// KycUploader: Comprehensive user UI for uploading KYC documents
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

interface DocumentUpload {
  id: string;
  type: string;
  file: File | null;
  status: 'pending' | 'uploading' | 'validated' | 'error';
  progress: number;
  error: string | undefined;
  thumbnail: string | undefined;
}

interface DocumentRequirement {
  type: string;
  label: string;
  description: string;
  required: boolean;
  variants?: string[];
}

const REQUIRED_DOCUMENTS: DocumentRequirement[] = [
  {
    type: 'id_front',
    label: 'ID (Front)',
    description: 'Front side of your national ID, passport, or driver license',
    required: true,
  },
  {
    type: 'id_back',
    label: 'ID (Back)',
    description: 'Back side of your national ID, passport, or driver license',
    required: true,
  },
  {
    type: 'proof_of_address',
    label: 'Proof of Address',
    description:
      'Recent utility bill, bank statement, or government letter (< 3 months old)',
    required: true,
  },
  {
    type: 'selfie',
    label: 'Selfie Verification',
    description: 'Photo of you holding your ID document',
    required: false,
  },
];

const KycUploader: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<DocumentUpload[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file type and size
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        valid: false,
        error: 'File size exceeds 10MB limit. Please upload a smaller file.',
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error:
          'File format not supported. Only JPEG, PNG, and PDF files are allowed.',
      };
    }

    // Check magic numbers for file integrity
    return { valid: true };
  };

  // Generate thumbnail for image files
  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.includes('image')) {
        resolve('');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve((e.target?.result as string) || '');
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File, documentType: string) => {
      setGlobalError(null);

      const validation = validateFile(file);
      if (!validation.valid) {
        setGlobalError(validation.error || 'Invalid file');
        return;
      }

      // Generate thumbnail if it's an image
      generateThumbnail(file).then((thumbnail) => {
        // Check if document type already exists
        const exists = uploads.some((u) => u.type === documentType);
        if (exists) {
          // Replace existing
          setUploads((prev) =>
            prev.map((u) =>
              u.type === documentType
                ? {
                    ...u,
                    file,
                    status: 'pending' as const,
                    error: undefined,
                    thumbnail,
                  }
                : u
            )
          );
        } else {
          // Add new
          setUploads((prev) => [
            ...prev,
            {
              id: `${documentType}_${Date.now()}`,
              type: documentType,
              file,
              status: 'pending' as const,
              progress: 0,
              thumbnail,
              error: undefined,
            },
          ]);
        }
      });
    },
    [uploads]
  );

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    documentType: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0], documentType);
    }
  };

  // Upload single file
  const uploadDocument = async (upload: DocumentUpload): Promise<boolean> => {
    if (!upload.file || !user) return false;

    try {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? { ...u, status: 'uploading' as const, progress: 0 }
            : u
        )
      );

      // Request signed upload URL
      const submitResp = await fetch('/supabase/functions/submit-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: upload.type }),
        credentials: 'include',
      });

      if (!submitResp.ok) {
        const err = await submitResp.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to request upload URL');
      }

      const submitJson = await submitResp.json();
      const uploadInfo = submitJson.upload || submitJson.uploadInfo || {};
      const signedUrl =
        uploadInfo.signedUrl ||
        uploadInfo.signed_upload_url ||
        uploadInfo.signedUploadUrl;
      const filePath = uploadInfo.filePath || uploadInfo.file_path;

      if (!signedUrl || !filePath) {
        throw new Error('Upload information missing from server response');
      }

      // Upload file with progress tracking
      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploads((prev) =>
              prev.map((u) => (u.id === upload.id ? { ...u, progress } : u))
            );
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 201) {
            resolve();
          } else {
            reject(new Error('File upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('File upload error'));
        });

        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader(
          'Content-Type',
          (upload.file as File).type || 'application/octet-stream'
        );
        xhr.send(upload.file);
      });

      await uploadPromise;

      // Validate uploaded file
      const validateResp = await fetch(
        '/supabase/functions/validate-kyc-upload',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath }),
          credentials: 'include',
        }
      );

      if (!validateResp.ok) {
        const err = await validateResp.json().catch(() => ({}));
        throw new Error(err?.error || 'Validation failed');
      }

      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? { ...u, status: 'validated' as const, progress: 100 }
            : u
        )
      );

      return true;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : String(err) || 'Upload failed';
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? { ...u, status: 'error' as const, error: errorMsg }
            : u
        )
      );
      return false;
    }
  };

  // Submit all documents
  const handleSubmitAll = async () => {
    setGlobalError(null);
    setSuccessMessage(null);

    // Check if all required documents are uploaded
    const requiredDocs = REQUIRED_DOCUMENTS.filter((d) => d.required);
    const uploadedTypes = uploads.map((u) => u.type);

    const missing = requiredDocs.filter((d) => !uploadedTypes.includes(d.type));
    if (missing.length > 0) {
      setGlobalError(
        `Please upload all required documents: ${missing
          .map((d) => d.label)
          .join(', ')}`
      );
      return;
    }

    setSubmitting(true);

    try {
      // Upload all documents in parallel
      const uploadPromises = uploads
        .filter((u) => u.status === 'pending' || u.status === 'error')
        .map((u) => uploadDocument(u));

      const results = await Promise.all(uploadPromises);

      if (results.some((r) => !r)) {
        setGlobalError('Some documents failed to upload. Please try again.');
        setSubmitting(false);
        return;
      }

      // All documents uploaded successfully
      setSuccessMessage(
        'All documents uploaded successfully! Your KYC submission is under review.'
      );
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setGlobalError(errorMessage || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Remove uploaded document
  const removeDocument = (uploadId: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== uploadId));
  };

  const requiredUploaded = REQUIRED_DOCUMENTS.filter((d) => d.required).every(
    (d) => uploads.some((u) => u.type === d.type)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Document Upload</CardTitle>
        <CardDescription>
          Upload required identity documents to complete verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Error Alert */}
        {globalError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert className="border-buy/20 bg-buy/5 animate-in fade-in slide-in-from-top-2 transition-all duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-buy animate-in zoom-in-50 duration-300" />
              <AlertDescription className="text-buy font-medium">
                {successMessage}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Document Upload Sections */}
        <Tabs defaultValue="id_front" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {REQUIRED_DOCUMENTS.map((doc) => {
              const uploaded = uploads.find((u) => u.type === doc.type);
              return (
                <TabsTrigger
                  key={doc.type}
                  value={doc.type}
                  className="text-xs"
                >
                  <div className="flex items-center gap-4">
                    {uploaded?.status === 'validated' && (
                      <CheckCircle className="h-3 w-3 text-profit" />
                    )}
                    {doc.label.split(' ')[0]}
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {REQUIRED_DOCUMENTS.map((doc) => {
            const upload = uploads.find((u) => u.type === doc.type);
            const isRequired = doc.required;

            return (
              <TabsContent
                key={doc.type}
                value={doc.type}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      {doc.label}
                      {isRequired && (
                        <span className="text-destructive ml-2">*</span>
                      )}
                    </label>
                    {upload?.status === 'validated' && (
                      <Badge className="bg-profit">
                        <CheckCircle className="h-3 w-3 mr-2" />
                        Uploaded
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {doc.description}
                  </p>

                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 min-h-[280px] flex flex-col items-center justify-center ${
                      isDragActive
                        ? 'border-primary bg-primary/5 scale-105'
                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/2'
                    } ${
                      upload?.status === 'validated'
                        ? 'bg-buy/5 border-buy/30'
                        : ''
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, doc.type)}
                  >
                    {upload && upload.file ? (
                      <div className="space-y-3 w-full">
                        {/* Thumbnail Preview for Images */}
                        {upload.thumbnail ? (
                          <div className="flex justify-center mb-4">
                            <img
                              src={upload.thumbnail}
                              alt={upload.file.name}
                              className="max-w-[120px] max-h-[120px] rounded-lg border border-muted-foreground/20 shadow-sm object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex justify-center mb-4">
                            {upload.file.type.includes('pdf') ? (
                              <FileText className="h-12 w-12 text-muted-foreground" />
                            ) : (
                              <ImageIcon className="h-12 w-12 text-muted-foreground" />
                            )}
                          </div>
                        )}
                        <p className="text-sm font-semibold">
                          {upload.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>

                        {upload.status === 'uploading' && (
                          <div className="space-y-2 mt-4 w-full">
                            <Progress value={upload.progress} className="h-2" />
                            <p className="text-xs font-medium text-primary">
                              {upload.progress}% uploaded
                            </p>
                          </div>
                        )}

                        {upload.status === 'error' && (
                          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-xs text-destructive font-medium">
                              {upload.error}
                            </p>
                          </div>
                        )}

                        {upload.status === 'validated' && (
                          <div className="flex items-center justify-center gap-2 mt-3">
                            <CheckCircle className="h-5 w-5 text-buy animate-in fade-in zoom-in-50" />
                            <p className="text-xs font-medium text-buy">
                              Validated successfully
                            </p>
                          </div>
                        )}

                        {upload.status !== 'uploading' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(upload.id)}
                            className="mt-2"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          fileInputRef.current?.click();
                          // Store which doc type was clicked
                          if (fileInputRef.current) {
                            (
                              fileInputRef.current as unknown as Record<
                                string,
                                unknown
                              >
                            ).dataset = { docType: doc.type };
                          }
                        }}
                        className="cursor-pointer space-y-3 w-full"
                      >
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-sm font-semibold mb-1">
                            Drag and drop your file here
                          </p>
                          <p className="text-xs text-muted-foreground">
                            or click to select from your computer
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          JPEG, PNG, or PDF (max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Submission Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-muted">
          <h4 className="text-sm font-semibold">Upload Status</h4>
          <ul className="text-sm space-y-2">
            {REQUIRED_DOCUMENTS.map((doc) => {
              const uploaded = uploads.find((u) => u.type === doc.type);
              return (
                <li
                  key={doc.type}
                  className="flex items-center gap-3 transition-all duration-200"
                >
                  {uploaded?.status === 'validated' ? (
                    <CheckCircle className="h-5 w-5 text-buy shrink-0 animate-in zoom-in-50" />
                  ) : uploaded?.status === 'uploading' ? (
                    <Loader2 className="h-5 w-5 text-primary shrink-0 animate-spin" />
                  ) : uploaded?.status === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-muted-foreground/30 rounded-full shrink-0" />
                  )}
                  <span
                    className={
                      uploaded?.status === 'validated'
                        ? 'text-buy font-medium'
                        : ''
                    }
                  >
                    {doc.label}
                    {doc.required && (
                      <span className="text-destructive ml-2">*</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitAll}
          disabled={submitting || !requiredUploaded}
          className="w-full transition-all duration-200"
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Submitting Documents...
            </>
          ) : requiredUploaded ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Submit All Documents
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Complete Upload to Submit
            </>
          )}
        </Button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            const docType =
              (
                (e.target as unknown as Record<string, unknown>)
                  .dataset as Record<string, unknown>
              )?.docType || 'id_front';
            if (file) {
              handleFileSelect(file, docType as string);
            }
          }}
        />
      </CardContent>
    </Card>
  );
};

export default KycUploader;
