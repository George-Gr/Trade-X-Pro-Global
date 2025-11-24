import { OrderFormData } from "./OrderForm";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface TradingPanelConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingOrder: OrderFormData | null;
  isExecuting: boolean;
  assetLeverage: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const TradingPanelConfirmationDialog = ({
  open,
  onOpenChange,
  pendingOrder,
  isExecuting,
  assetLeverage,
  onConfirm,
  onCancel,
}: TradingPanelConfirmationDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Order</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingOrder && (
              <div className="space-y-2 text-sm mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Side</p>
                    <p className="font-semibold capitalize">{pendingOrder.side}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-semibold">{pendingOrder.quantity} lots</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-semibold capitalize">{pendingOrder.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Leverage (Fixed)</p>
                    <p className="font-semibold">1:{assetLeverage}</p>
                  </div>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isExecuting}
            className="font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isExecuting}
            className="bg-profit hover:bg-profit/90 text-foreground font-medium"
          >
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              'Execute Order'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TradingPanelConfirmationDialog;