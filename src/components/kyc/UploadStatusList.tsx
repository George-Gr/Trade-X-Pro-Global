import React from 'react';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface DocumentUpload {
  id: string;
  type: string;
  file: File | null;
  status: 'pending' | 'uploading' | 'validated' | 'error';
  progress: number;
  error?: string;
  thumbnail?: string;
}

interface DocumentRequirement {
  type: string;
  label: string;
  description: string;
  required: boolean;
  variants?: string[];
}

interface UploadStatusListProps {
  documents: DocumentRequirement[];
  uploads: DocumentUpload[];
}

export const UploadStatusList: React.FC<UploadStatusListProps> = ({ documents, uploads }) => {
  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-muted">
      <h4 className="text-sm font-semibold">Upload Status</h4>
      <ul className="text-sm space-y-2">
        {documents.map((doc) => {
          const uploaded = uploads.find((u) => u.type === doc.type);
          return (
            <li key={doc.type} className="flex items-center gap-3 transition-all duration-200">
              {uploaded?.status === 'validated' ? (
                <CheckCircle className="h-5 w-5 text-buy shrink-0 animate-in zoom-in-50" />
              ) : uploaded?.status === 'uploading' ? (
                <Loader2 className="h-5 w-5 text-primary shrink-0 animate-spin" />
              ) : uploaded?.status === 'error' ? (
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              ) : (
                <div className="h-5 w-5 border-2 border-muted-foreground/30 rounded-full shrink-0" />
              )}
              <span className={uploaded?.status === 'validated' ? 'text-buy font-medium' : ''}>
                {doc.label}
                {doc.required && <span className="text-destructive ml-2">*</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};