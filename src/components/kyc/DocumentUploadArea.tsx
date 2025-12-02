import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface DocumentUpload {
  id: string;
  type: string;
  file: File | null;
  status: 'pending' | 'uploading' | 'validated' | 'error';
  progress: number;
  error?: string;
  thumbnail?: string;
}

interface DocumentUploadAreaProps {
  upload: DocumentUpload | undefined;
  docType: string;
  docLabel: string;
  docDescription: string;
  isRequired: boolean;
  isDragActive: boolean;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: () => void;
  onRemove: (uploadId: string) => void;
}

export const DocumentUploadArea: React.FC<DocumentUploadAreaProps> = ({
  upload,
  docType,
  docLabel,
  docDescription,
  isRequired,
  isDragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  onRemove,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">
          {docLabel}
          {isRequired && <span className="text-destructive ml-2">*</span>}
        </label>
        {upload?.status === 'validated' && (
          <Badge className="bg-profit">
            <CheckCircle className="h-3 w-3 mr-2" />
            Uploaded
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">{docDescription}</p>

      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 min-h-[280px] flex flex-col items-center justify-center ${
          isDragActive
            ? 'border-primary bg-primary/5 scale-105'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/2'
        } ${upload?.status === 'validated' ? 'bg-buy/5 border-buy/30' : ''}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {upload && upload.file ? (
          <div className="space-y-3 w-full">
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
            <p className="text-sm font-semibold">{upload.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(upload.file.size / 1024 / 1024).toFixed(2)} MB
            </p>

            {upload.status === 'uploading' && (
              <div className="space-y-2 mt-4 w-full">
                <Progress value={upload.progress} className="h-2" />
                <p className="text-xs font-medium text-primary">{upload.progress}% uploaded</p>
              </div>
            )}

            {upload.status === 'error' && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-xs text-destructive font-medium">{upload.error}</p>
              </div>
            )}

            {upload.status === 'validated' && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <CheckCircle className="h-5 w-5 text-buy animate-in fade-in zoom-in-50" />
                <p className="text-xs font-medium text-buy">Validated successfully</p>
              </div>
            )}

            {upload.status !== 'uploading' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(upload.id)}
                className="mt-2"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        ) : (
          <div onClick={onFileSelect} className="cursor-pointer space-y-3 w-full">
            <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold mb-1">Drag and drop your file here</p>
              <p className="text-xs text-muted-foreground">or click to select from your computer</p>
            </div>
            <p className="text-xs text-muted-foreground font-medium">JPEG, PNG, or PDF (max 10MB)</p>
          </div>
        )}
      </div>
    </div>
  );
};