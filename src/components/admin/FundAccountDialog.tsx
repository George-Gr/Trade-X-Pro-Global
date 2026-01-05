import { LoadingButton } from '@/components/ui/LoadingButton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface FundAccountDialogProps {
  open: boolean;
  fundAmount: string;
  isFunding: boolean;
  onOpenChange: (open: boolean) => void;
  onFundAmountChange: (amount: string) => void;
  onFundAccount: () => void;
}

/**
 * Dialog component for funding a user's trading account.
 *
 * @param props - Component props
 * @param props.open - Whether the dialog is open
 * @param props.fundAmount - The amount to fund (as string)
 * @param props.isFunding - Whether a funding operation is in progress
 * @param props.onOpenChange - Callback function called when dialog open state changes, receives boolean parameter
 * @param props.onFundAmountChange - Callback function called when fund amount input changes
 * @param props.onFundAccount - Callback function called when user confirms funding
 * @returns The FundAccountDialog component
 */
const FundAccountDialog: React.FC<FundAccountDialogProps> = ({
  open,
  fundAmount,
  isFunding,
  onOpenChange,
  onFundAmountChange,
  onFundAccount,
}) => {
  const isValidAmount =
    fundAmount && !isNaN(Number(fundAmount)) && Number(fundAmount) > 0;

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
            onClick={() => onOpenChange(false)}
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
