import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useOrderExecution } from "@/hooks/useOrderExecution";
import { usePriceUpdates } from "@/hooks/usePriceUpdates";
import { useAssetSpecs } from "@/hooks/useAssetSpecs";
import { useSLTPMonitoring } from "@/hooks/useSLTPMonitoring";
import { OrderTemplatesDialog } from "./OrderTemplatesDialog";
import { OrderTemplate } from "@/hooks/useOrderTemplates";
import { OrderForm, type OrderFormData } from "./OrderForm";
import { OrderPreview } from "./OrderPreview";
import { OrderTypeSelector, type OrderType } from "./OrderTypeSelector";
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
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface TradingPanelProps {
  symbol: string;
}

/**
 * TradingPanel Component (Refactored)
 *
 * Main trading interface composed of modular components:
 * - OrderTypeSelector: Select order type (market, limit, stop, etc.)
 * - OrderForm: Form inputs with validation
 * - OrderPreview: Real-time order preview with P&L calculations
 *
 * Features:
 * - Real-time price updates
 * - Order execution integration
 * - Order templates support
 * - Confirmation dialog before execution
 */
const TradingPanel = ({ symbol }: TradingPanelProps) => {
  // State
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [formData, setFormData] = useState<Partial<OrderFormData>>({
    symbol,
    side: 'buy',
    quantity: 0.01,
    type: 'market',
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<OrderFormData | null>(null);
  
  // Hooks
  const { toast } = useToast();
  const { executeOrder, isExecuting } = useOrderExecution();
  const { leverage: assetLeverage, isLoading: isAssetLoading } = useAssetSpecs(symbol);
  
  // SL/TP Monitoring
  const { isMonitoring, monitoredCount, pricesConnected } = useSLTPMonitoring();
  
  // Real-time price updates
  const { getPrice } = usePriceUpdates({
    symbols: [symbol],
    intervalMs: 2000,
    enabled: true,
  });

  const priceData = getPrice(symbol);
  const currentPrice = priceData?.currentPrice || 1.0856;

  /**
   * Handle order type change
   */
  const handleOrderTypeChange = (newType: OrderType) => {
    setOrderType(newType);
    setFormData(prev => ({
      ...prev,
      type: newType,
    }));
  };

  /**
   * Handle form data changes
   */
  const handleFormChange = (data: Partial<OrderFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...data,
    }));
  };

  /**
   * Handle form submission - opens confirmation dialog
   */
  const handleFormSubmit = async (data: OrderFormData, side: 'buy' | 'sell') => {
    setPendingOrder({ ...data, side });
    setConfirmDialogOpen(true);
  };

  /**
   * Confirm and execute the order
   */
  const handleConfirmOrder = async () => {
    if (!pendingOrder) return;

    setConfirmDialogOpen(false);

    // Determine price based on order type
    let orderPrice: number | undefined;
    if (pendingOrder.type === 'limit' && pendingOrder.limitPrice) {
      orderPrice = pendingOrder.limitPrice;
    } else if (pendingOrder.type === 'stop' && pendingOrder.stopPrice) {
      orderPrice = pendingOrder.stopPrice;
    } else if (pendingOrder.type === 'stop_limit' && pendingOrder.limitPrice) {
      orderPrice = pendingOrder.limitPrice;
    }

    const result = await executeOrder({
      symbol: pendingOrder.symbol,
      order_type: pendingOrder.type as 'market' | 'limit' | 'stop' | 'stop_limit',
      side: pendingOrder.side,
      quantity: pendingOrder.quantity,
      price: orderPrice,
      stop_loss: pendingOrder.stopLossPrice,
      take_profit: pendingOrder.takeProfitPrice,
    });

    if (result) {
      // Reset form on success
      setFormData({
        symbol,
        side: 'buy',
        quantity: 0.01,
        type: 'market',
      });
      toast({
        title: "Order Executed",
        description: `${pendingOrder.side.toUpperCase()} order for ${pendingOrder.quantity} lots executed successfully.`,
      });
    }

    setPendingOrder(null);
  };

  /**
   * Cancel the order confirmation
   */
  const handleCancelOrder = () => {
    setConfirmDialogOpen(false);
    setPendingOrder(null);
  };

  /**
   * Handle order template application
   */
  const handleApplyTemplate = (template: OrderTemplate) => {
    setFormData(prev => ({
      ...prev,
      quantity: template.volume,
      // NOTE: Leverage is now fixed per asset - template.leverage is ignored
      type: template.order_type as OrderType,
      stopLossPrice: template.stop_loss,
      takeProfitPrice: template.take_profit,
    }));
    setOrderType(template.order_type as OrderType);
    
    toast({
      title: "Template Applied",
      description: `"${template.name}" settings loaded. (Leverage is set per asset: 1:${assetLeverage})`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Trading Panel Container */}
      <Card className="bg-card border-border p-4">
        {/* SL/TP Monitoring Status Badge */}
        {isMonitoring && pricesConnected && (
          <div className="bg-[hsl(var(--status-info))] dark:bg-[hsl(var(--status-info-dark))] border-b border-[hsl(var(--status-info-border))] dark:border-[hsl(var(--status-info-dark-border))] px-4 py-4">
            <p className="text-sm text-[hsl(var(--status-info-foreground))] dark:text-[hsl(var(--status-info-dark-foreground))]">
              ✓ Monitoring SL/TP for {monitoredCount} position{monitoredCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}
        
        {/* Header with Symbol and Current Price */}
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{symbol}</h3>
              <p className="text-sm text-muted-foreground">
                Current Price: <span className="font-mono font-semibold text-foreground">${currentPrice.toFixed(5)}</span>
              </p>
            </div>
            <OrderTemplatesDialog onApplyTemplate={handleApplyTemplate} />
          </div>
        </div>

        {/* Main Trading Area */}
        <div className="p-4 space-y-4">
          {/* Order Type Selector */}
          <div>
            <h4 className="text-sm font-medium mb-2">Order Type</h4>
            <OrderTypeSelector
              value={orderType}
              onChange={handleOrderTypeChange}
              disabled={isExecuting}
            />
          </div>

          {/* Order Form and Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Form */}
            <div>
              <OrderForm
                symbol={symbol}
                orderType={orderType}
                currentPrice={currentPrice}
                onOrderTypeChange={handleOrderTypeChange}
                onSubmit={handleFormSubmit}
                isLoading={isExecuting || isAssetLoading}
                assetLeverage={assetLeverage}
              />
            </div>

            {/* Order Preview */}
            <div>
              <OrderPreview
                formData={formData}
                currentPrice={currentPrice}
                assetLeverage={assetLeverage}
                commission={0.0005}
                slippage={orderType === 'market' ? 0.0001 : 0}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
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
            <AlertDialogCancel disabled={isExecuting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmOrder}
              disabled={isExecuting}
              className="bg-profit hover:bg-profit/90"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                'Execute Order'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TradingPanel;
