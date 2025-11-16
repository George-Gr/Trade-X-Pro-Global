import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WithdrawalForm } from "./WithdrawalForm";

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  balance: number;
}

export function WithdrawalDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  balance 
}: WithdrawalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Withdrawal</DialogTitle>
          <DialogDescription>
            Withdraw cryptocurrency to your external wallet. Please ensure you use a valid address.
          </DialogDescription>
        </DialogHeader>

        <WithdrawalForm
          balance={balance}
          onSuccess={() => {
            onOpenChange(false);
            onSuccess?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
