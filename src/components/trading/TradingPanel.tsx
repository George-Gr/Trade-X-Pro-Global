import { lazy, Suspense, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getActionableErrorMessage } from "@/lib/errorMessageService";
import { useOrderExecution } from "@/hooks/useOrderExecution";
import { usePriceUpdates } from "@/hooks/usePriceUpdates";
import { useAssetSpecs } from "@/hooks/useAssetSpecs";
import { useSLTPMonitoring } from "@/hooks/useSLTPMonitoring";
import { OrderTemplate } from "@/hooks/useOrderTemplates";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { OrderType } from "@/lib/trading/orderMatching";
import { OrderFormData } from "./OrderForm";

// Lazy load heavy components
const OrderTemplatesDialog = lazy(() => import("./OrderTemplatesDialog").then(module => ({ default: module.OrderTemplatesDialog })));
const OrderForm = lazy(() => import("./OrderForm").then(module => ({ default: module.OrderForm })));
const OrderPreview = lazy(() => import("./OrderPreview").then(module => ({ default: module.OrderPreview })));
const OrderTypeSelector = lazy(() => import("./OrderTypeSelector").then(module => ({ default: module.OrderTypeSelector })));
const AlertDialogComponent = lazy(() => import("./TradingPanelConfirmationDialog").then(module => ({ default: module.default })));

interface TradingPanelProps {
  symbol: string;
}

/**
 * TradingPanel Component (Optimized)
 *
 * Main trading interface with lazy-loaded components for better bundle splitting:
 * - OrderTypeSelector: Select order type (market, limit, stop, etc.)
 * - OrderForm: Form inputs with validation
 * - OrderPreview: Real-time order preview with P&L calculations
 *
 * Features:
 * - Real-time price updates
 * - Order execution integration
 * - Order templates support
 * - Confirmation dialog before execution
 * - Lazy loading for improved performance
 */
const TradingPanel = ({ symbol }: TradingPanelProps) => {
  // State
  const [orderType, setOrderType] = useState<OrderType>(OrderType.Market);
  const [formData, setFormData] = useState<Partial<OrderFormData>>({
    symbol,
    side: 'buy',
    quantity: 0.01,
    type: OrderType.Market,
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<OrderFormData | null>(null);
  
  // Hooks (moved to hooks directory for better separation)
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
      <Card className="panel border-border p-4">
        {/* SL/TP Monitoring Status Badge */}
        {isMonitoring && pricesConnected && (
          <div className="bg-[hsl(var(--status-info))] dark:bg-[hsl(var(--status-info-dark))] border-b border-[hsl(var(--status-info-border))] dark:border-[hsl(var(--status-info-dark-border))] px-4 py-4">
            <p className="text-sm text-[hsl(var(--status-info-foreground))] dark:text-[hsl(var(--status-info-dark-foreground))]">
              ✓ Monitoring SL/TP for {monitoredCount} position{monitoredCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}
        
        {/* Header with Symbol and Current Price */}
        <div className="panel-header border-b border-panel px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{symbol}</h3>
              <p className="text-sm text-muted-foreground">
                Current Price: 
                <span className={`font-mono font-semibold transition-colors duration-300 ${priceData?.isStale ? 'text-destructive' : 'text-foreground'}`}>
                  ${currentPrice.toFixed(5)}
                  {priceData?.isStale && (
                    <Loader2 className="ml-1 inline-block h-3 w-3 animate-spin text-destructive" />
                  )}
                </span>
              </p>
              {priceData?.isStale && (
                <p className="text-xs text-destructive mt-1">Price updating...</p>
              )}
            </div>
            <OrderTemplatesDialog onApplyTemplate={handleApplyTemplate} />
          </div>
        </div>

        {/* Main Trading Area */}
        <div className="panel-content p-4 space-y-4">
          {/* Order Type Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Order Type</h4>
              {isExecuting && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Executing...</span>
                </div>
              )}
            </div>
            <OrderTypeSelector
              value={orderType}
              onChange={handleOrderTypeChange}
              disabled={isExecuting}
            />
          </div>

          {/* Order Form and Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Form */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Order Details</h4>
                {(isExecuting || isAssetLoading) && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Loading...</span>
                  </div>
                )}
              </div>
              <Suspense fallback={<div className="h-64 bg-muted/50 rounded-lg animate-pulse" />}>
                <OrderForm
                  symbol={symbol}
                  orderType={orderType}
                  currentPrice={currentPrice}
                  onOrderTypeChange={handleOrderTypeChange}
                  onSubmit={handleFormSubmit}
                  isLoading={isExecuting || isAssetLoading}
                  assetLeverage={assetLeverage}
                />
              </Suspense>
            </div>

            {/* Order Preview */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Order Preview</h4>
              <Suspense fallback={<div className="h-64 bg-muted/50 rounded-lg animate-pulse" />}>
                <OrderPreview
                  formData={formData}
                  currentPrice={currentPrice}
                  assetLeverage={assetLeverage}
                  commission={0.0005}
                  slippage={orderType === 'market' ? 0.0001 : 0}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <Suspense fallback={<div />}>
        <AlertDialogComponent
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          pendingOrder={pendingOrder}
          isExecuting={isExecuting}
          assetLeverage={assetLeverage}
          onConfirm={handleConfirmOrder}
          onCancel={handleCancelOrder}
        />
      </Suspense>
    </div>
  );
};

export default TradingPanel;
