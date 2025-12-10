import { OrderFormData } from "./OrderForm";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const isBuy = pendingOrder?.side === 'buy';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isBuy ? (
              <TrendingUp className="h-5 w-5 text-profit" />
            ) : (
              <TrendingDown className="h-5 w-5 text-loss" />
            )}
            Confirm Order
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2">
              {pendingOrder && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Side</span>
                    <span className={cn(
                      "font-semibold text-sm px-2 py-0.5 rounded",
                      isBuy ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                    )}>
                      {pendingOrder.side.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Quantity</span>
                    <span className="font-mono font-semibold text-sm">{pendingOrder.quantity} lots</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Type</span>
                    <span className="font-semibold text-sm capitalize">{pendingOrder.type.replace('_', '-')}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground text-sm">Leverage</span>
                    <span className="font-mono font-semibold text-sm">1:{assetLeverage}</span>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isExecuting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isExecuting}
            className={cn(
              "flex-1 font-semibold",
              isBuy 
                ? "bg-profit hover:bg-profit/90 text-white" 
                : "bg-loss hover:bg-loss/90 text-white"
            )}
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
