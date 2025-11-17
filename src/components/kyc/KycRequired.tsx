/**
 * Component: KycRequired
 *
 * Purpose: Display message when user cannot trade due to KYC status
 * Task: TASK 1.3.2 - Trading Restriction UI
 *
 * Features:
 * - Different messages for pending, rejected, under review status
 * - Countdown to resubmission for rejected users
 * - Navigation to KYC page
 * - Clear action items
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
} from 'lucide-react';

interface KycRequiredProps {
  kycStatus: string;
  rejectionReason?: string | null;
  daysUntilResubmit?: number | null;
  approvedAt?: string | null;
}

export const KycRequired: React.FC<KycRequiredProps> = ({
  kycStatus,
  rejectionReason,
  daysUntilResubmit,
  approvedAt,
}) => {
  const navigate = useNavigate();

  const getStatusConfig = () => {
    switch (kycStatus) {
      case 'approved':
        return {
          icon: CheckCircle2,
          iconColor: 'text-profit',
          title: 'KYC Approved',
          description: 'Your identity has been verified. You can now trade with full access.',
          message: 'Trading is now enabled for your account.',
          showButton: false,
          buttonText: 'Return to Trading',
          severity: 'default',
        };

      case 'under_review':
      case 'submitted':
        return {
          icon: Clock,
          iconColor: 'text-amber-500',
          title: 'KYC Under Review',
          description: 'Your documents are being reviewed by our compliance team.',
          message: 'This typically takes 24-48 hours. We\'ll notify you once the review is complete.',
          showButton: true,
          buttonText: 'View Submission',
          severity: 'warning',
        };

      case 'rejected':
      case 'requires_resubmit':
        return {
          icon: XCircle,
          iconColor: 'text-destructive',
          title: 'KYC Rejected',
          description: 'Your submission was not approved. Please review the feedback and resubmit.',
          message: rejectionReason || 'Your submission did not meet our verification requirements.',
          showButton: true,
          buttonText: daysUntilResubmit ? 'Resubmit in Progress' : 'Resubmit Documents',
          severity: 'destructive',
          canResubmit: !daysUntilResubmit,
        };

      default:
        return {
          icon: AlertCircle,
          iconColor: 'text-muted-foreground',
          title: 'KYC Verification Required',
          description: 'Please complete identity verification to start trading.',
          message: 'Submit your documents to get verified and unlock trading features.',
          showButton: true,
          buttonText: 'Start KYC Verification',
          severity: 'info',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`rounded-full p-3 ${
              config.severity === 'default' ? 'bg-profit/10' :
              config.severity === 'warning' ? 'bg-amber-500/10' :
              config.severity === 'destructive' ? 'bg-destructive/10' :
              'bg-muted'
            }`}>
              <Icon className={`h-8 w-8 ${config.iconColor}`} />
            </div>
          </div>
          <div>
            <CardTitle className="text-xl">{config.title}</CardTitle>
            <CardDescription className="mt-2">{config.description}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge variant={
              config.severity === 'default' ? 'default' :
              config.severity === 'warning' ? 'secondary' :
              config.severity === 'destructive' ? 'destructive' :
              'outline'
            }>
              {kycStatus.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Message */}
          <Alert variant={
            config.severity === 'default' ? 'default' :
            config.severity === 'destructive' ? 'destructive' :
            'default'
          }>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{config.message}</AlertDescription>
          </Alert>

          {/* Resubmission Countdown */}
          {daysUntilResubmit && (
            <Alert className="border-amber-500/20 bg-amber-500/5">
              <Clock className="h-4 w-4 text-amber-500" />
              <AlertDescription>
                You can resubmit your documents in <strong>{daysUntilResubmit} day{daysUntilResubmit !== 1 ? 's' : ''}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Approval Date */}
          {approvedAt && config.severity === 'default' && (
            <div className="text-sm text-muted-foreground text-center">
              Approved on {new Date(approvedAt).toLocaleDateString()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {config.showButton && (
              <Button
                onClick={() => navigate('/kyc')}
                disabled={!config.canResubmit && kycStatus === 'requires_resubmit'}
                className="w-full"
              >
                {config.buttonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {config.severity !== 'default' && (
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            )}
          </div>

          {/* Info Text */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Questions? Contact our support team</p>
            <p>Email: support@tradepro.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
