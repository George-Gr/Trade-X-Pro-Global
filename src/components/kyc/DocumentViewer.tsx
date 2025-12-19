import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseBrowserClient';
import { formatToastError } from '@/lib/errorMessageService';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentViewerProps {
  filePath: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer = ({
  filePath,
  open,
  onOpenChange,
}: DocumentViewerProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileType, setFileType] = useState<string>('');
  const { toast } = useToast();

  const loadDocument = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      setFileUrl(url);

      // Determine file type from extension
      const ext = filePath.split('.').pop()?.toLowerCase();
      setFileType(ext || '');
    } catch (error) {
      const actionableError = formatToastError(error, 'data_fetching');
      toast({
        ...actionableError,
        variant: actionableError.variant as 'default' | 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filePath, toast]);

  // Focus management for accessibility
  useEffect(() => {
    if (open && closeButtonRef.current) {
      // Delay focus to allow dialog to fully render
      const timeoutId = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  useEffect(() => {
    // Only load when dialog is open and we don't already have the file URL
    if (open && filePath && !fileUrl) {
      loadDocument();
    }

    // Capture the current fileUrl for cleanup to avoid stale-ref warnings
    const currentUrl = fileUrl;
    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [open, filePath, fileUrl, loadDocument]);

  const handleDownload = () => {
    if (fileUrl) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = filePath.split('/').pop() || 'document';
      a.click();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[90vw] md:max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Document Preview</span>
            {fileUrl && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : fileUrl ? (
            <div className="aspect-[4/3] w-full">
              {fileType === 'pdf' ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-full border-0"
                  title="Document preview"
                />
              ) : (
                <img
                  src={fileUrl}
                  alt="Document"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileText className="h-12 w-12 mb-2" />
              <p>Failed to load document</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            ref={closeButtonRef}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
