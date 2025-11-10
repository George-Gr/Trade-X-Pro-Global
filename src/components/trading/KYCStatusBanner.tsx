import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";

export function KYCStatusBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['profile-kyc-status', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('kyc_status, account_status')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Don't show banner if KYC is approved or data is loading
  if (!profile || profile.kyc_status === 'approved') {
    return null;
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          variant: 'default' as const,
          title: 'KYC Verification Pending',
          description: 'Your identity verification is under review. You cannot trade until verification is complete.',
          badgeLabel: 'Pending Review',
          badgeVariant: 'secondary' as const,
          actionLabel: 'View Status',
          showAction: true,
        };
      case 'rejected':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          title: 'KYC Verification Rejected',
          description: 'Your verification was rejected. Please resubmit your documents to start trading.',
          badgeLabel: 'Rejected',
          badgeVariant: 'destructive' as const,
          actionLabel: 'Resubmit Documents',
          showAction: true,
        };
      case 'resubmitted':
        return {
          icon: Clock,
          variant: 'default' as const,
          title: 'KYC Verification Resubmitted',
          description: 'Your documents have been resubmitted and are under review. Trading is disabled until approval.',
          badgeLabel: 'Under Review',
          badgeVariant: 'secondary' as const,
          actionLabel: 'View Status',
          showAction: true,
        };
      default:
        return {
          icon: AlertCircle,
          variant: 'default' as const,
          title: 'KYC Verification Required',
          description: 'Complete your identity verification to start trading.',
          badgeLabel: 'Action Required',
          badgeVariant: 'destructive' as const,
          actionLabel: 'Complete Verification',
          showAction: true,
        };
    }
  };

  const config = getStatusConfig(profile.kyc_status);
  const StatusIcon = config.icon;

  return (
    <Alert variant={config.variant} className="mb-4 border-l-4">
      <div className="flex items-start gap-4">
        <StatusIcon className="h-5 w-5 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTitle className="mb-0">{config.title}</AlertTitle>
            <Badge variant={config.badgeVariant}>{config.badgeLabel}</Badge>
          </div>
          <AlertDescription className="text-sm">
            {config.description}
          </AlertDescription>
          {profile.account_status !== 'active' && (
            <AlertDescription className="text-sm font-semibold text-destructive">
              ⚠️ Your account is currently {profile.account_status}. Please contact support.
            </AlertDescription>
          )}
        </div>
        {config.showAction && (
          <Button 
            variant={config.variant === 'destructive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => navigate('/kyc')}
            className="gap-2 whitespace-nowrap"
          >
            {config.actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}
