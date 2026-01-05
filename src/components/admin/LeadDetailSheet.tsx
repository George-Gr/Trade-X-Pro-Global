import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  formatCurrency,
  getExperienceLabel,
  getFinancialLabel,
  getKycColor,
} from '@/lib/leadUtils';
import { Briefcase, DollarSign, FileCheck, User } from 'lucide-react';
import React from 'react';

interface Lead {
  id: string;
  user_id: string;
  lead_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  trading_experience: string;
  occupation: string;
  financial_capability: string;
  reason_for_joining: string;
  trading_goals: string;
  status: string;
}

interface Profile {
  id: string;
  balance: number;
  equity: number;
  kyc_status: string;
  account_status: string;
}

interface KYCDocument {
  id: string;
  document_type: string;
  file_path: string;
  status: string;
  created_at: string;
  rejection_reason: string | null;
}

interface LeadDetailSheetProps {
  selectedLead: Lead | null;
  selectedProfile: Profile | null;
  selectedKYCDocs: KYCDocument[];
  isDetailOpen: boolean;
  setIsDetailOpen: (open: boolean) => void;
  onKYCAction: (
    docId: string,
    action: 'approved' | 'rejected',
    reason?: string
  ) => void;
  onOpenFundDialog: (userId: string) => void;
}

/**
 * LeadDetailSheet component displays detailed information about a lead in a side sheet.
 * Includes tabs for Profile, Trading information, and KYC document management.
 *
 * @param props - Component props
 * @param props.selectedLead - The lead to display details for
 * @param props.selectedProfile - Associated profile data including balance and KYC status
 * @param props.selectedKYCDocs - Array of KYC documents submitted by the lead
 * @param props.isDetailOpen - Controls the visibility of the sheet
 * @param props.setIsDetailOpen - Callback to update sheet visibility
 * @param props.onKYCAction - Callback for KYC approval/rejection actions
 * @param props.onOpenFundDialog - Callback to open the fund addition dialog
 */
const LeadDetailSheet: React.FC<LeadDetailSheetProps> = ({
  selectedLead,
  selectedProfile,
  selectedKYCDocs,
  isDetailOpen,
  setIsDetailOpen,
  onKYCAction,
  onOpenFundDialog,
}) => {
  return (
    <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Lead Details</SheetTitle>
          <SheetDescription>{selectedLead?.lead_number}</SheetDescription>
        </SheetHeader>

        {selectedLead && (
          <div className="mt-6 space-y-6">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="trading">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Trading
                </TabsTrigger>
                <TabsTrigger value="kyc">
                  <FileCheck className="h-4 w-4 mr-2" />
                  KYC
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">First Name</Label>
                    <p className="font-medium">{selectedLead.first_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Name</Label>
                    <p className="font-medium">{selectedLead.last_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedLead.phone || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Address</Label>
                    <p className="font-medium">
                      {selectedLead.address || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Account Info */}
                {selectedProfile && (
                  <Card className="p-4 mt-4">
                    <h4 className="font-semibold mb-3">Account Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Balance</Label>
                        <p className="font-mono text-lg font-bold text-green-500">
                          {formatCurrency(selectedProfile.balance)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Equity</Label>
                        <p className="font-mono text-lg">
                          {formatCurrency(selectedProfile.equity)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          KYC Status
                        </Label>
                        <Badge variant="outline" className="capitalize mt-1">
                          <span
                            className={`inline-block w-2 h-2 rounded-full mr-2 ${getKycColor(
                              selectedProfile.kyc_status
                            )}`}
                          />
                          {selectedProfile.kyc_status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Account Status
                        </Label>
                        <Badge variant="outline" className="capitalize mt-1">
                          {selectedProfile.account_status}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={() => onOpenFundDialog(selectedLead.user_id)}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Add Funds
                    </Button>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="trading" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">
                      Trading Experience
                    </Label>
                    <p className="font-medium">
                      {getExperienceLabel(selectedLead.trading_experience)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Occupation</Label>
                    <p className="font-medium capitalize">
                      {selectedLead.occupation.replaceAll('-', ' ')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Financial Capability
                    </Label>
                    <p className="font-medium">
                      {getFinancialLabel(selectedLead.financial_capability)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Reason for Joining
                    </Label>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                      {selectedLead.reason_for_joining}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Trading Goals
                    </Label>
                    <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                      {selectedLead.trading_goals}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="kyc" className="space-y-4 mt-4">
                {selectedKYCDocs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No KYC documents submitted yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedKYCDocs.map((doc) => (
                      <Card key={doc.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">
                            {doc.document_type.replace('_', ' ')}
                          </span>
                          <Badge variant="outline" className="capitalize">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-2 ${getKycColor(
                                doc.status
                              )}`}
                            />
                            {doc.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Submitted:{' '}
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                        {doc.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1"
                              onClick={() => onKYCAction(doc.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={() =>
                                onKYCAction(
                                  doc.id,
                                  'rejected',
                                  'Document not valid'
                                )
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {doc.rejection_reason && (
                          <p className="text-sm text-red-500 mt-2">
                            Rejection reason: {doc.rejection_reason}
                          </p>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default LeadDetailSheet;
