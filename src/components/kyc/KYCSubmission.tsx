import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { validationRules } from '@/lib/validationRules';
import { CheckCircle, FileText, Loader2, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface KYCSubmissionProps {
  onSuccess?: () => void;
}

interface KYCFormData {
  documentType: string;
}

const KYCSubmission = ({ onSuccess }: KYCSubmissionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    defaultValues: {
      documentType: '',
    },
  });

  const { register, handleSubmit, watch, reset } = form;
  const documentType = watch('documentType');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/pdf',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a JPG, PNG, or PDF file',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const onSubmit = async (data: KYCFormData) => {
    // data contains documentType
    if (!user || !data.documentType || !selectedFile) {
      toast({
        title: 'Missing information',
        description: 'Please select document type and file',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for server-side validation
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', data.documentType);

      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call server-side validation function
      const { data: fnData, error } = await supabase.functions.invoke(
        'validate-kyc-upload',
        {
          body: formData,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;
      if (!fnData.success) throw new Error(fnData.error || 'Upload failed');

      // Update profile KYC status if first submission
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ kyc_status: 'pending' })
        .eq('id', user.id)
        .neq('kyc_status', 'pending');

      if (profileError) console.warn('Profile update warning:', profileError);

      setSubmitted(true);
      toast({
        title: 'Document submitted',
        description: 'Your KYC document has been submitted for review',
      });

      onSuccess?.();
    } catch (err: unknown) {
      console.error('KYC submission error:', err);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Submission failed',
        description: message || 'Failed to submit document',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-profit/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-profit" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Document Submitted</h3>
              <p className="text-sm text-muted-foreground">
                Your KYC document has been submitted successfully and is pending
                review.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setSelectedFile(null);
                reset();
              }}
            >
              Submit Another Document
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload KYC Document</CardTitle>
        <CardDescription>
          Submit your identity verification documents for review
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="documentType"
              render={() => (
                <FormItem>
                  <FormLabel htmlFor="document-type">Document Type</FormLabel>
                  <FormControl>
                    <Select
                      {...register(
                        'documentType',
                        validationRules.documentType
                      )}
                    >
                      <SelectTrigger id="document-type">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="national_id">
                          National ID Card
                        </SelectItem>
                        <SelectItem value="drivers_license">
                          Driver's License
                        </SelectItem>
                        <SelectItem value="proof_of_address">
                          Proof of Address
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="document-file">Document File</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="document-file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="truncate max-w-50">
                      {selectedFile.name}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Accepted formats: JPG, PNG, PDF (max 5MB)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !selectedFile || !documentType}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Document
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default KYCSubmission;
