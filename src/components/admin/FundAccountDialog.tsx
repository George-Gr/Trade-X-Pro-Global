import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/LoadingButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FundAccountDialogProps {
  open: boolean;
  fundAmount: string;
  isFunding: boolean;
  onOpenChange: () => void;
  onFundAmountChange: (amount: string) => void;
  onFundAccount: () => void;
}

const FundAccountDialog: React.FC<FundAccountDialogProps> = ({
  open,
  fundAmount,
  isFunding,
  onOpenChange,
  onFundAmountChange,
  onFundAccount,
}) => {
  const isValidAmount = fundAmount && !isNaN(Number(fundAmount)) && Number(fundAmount) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fund User Account</DialogTitle>
          <DialogDescription>
            Add funds to the user's trading account.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fund-amount">Amount (USD)</Label>
            <Input
              id="fund-amount"
              type="number"
              placeholder="Enter amount..."
              value={fundAmount}
              onChange={(e) => onFundAmountChange(e.target.value)}
              min="0"
              step="100"
              disabled={isFunding}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onOpenChange}
            disabled={isFunding}
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={onFundAccount}
            isLoading={isFunding}
            loadingText="Adding Funds..."
            disabled={!isValidAmount}
          >
            Add Funds
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FundAccountDialog;