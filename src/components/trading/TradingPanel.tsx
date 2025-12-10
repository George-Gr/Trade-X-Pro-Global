import { lazy, Suspense, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useOrderExecution } from "@/hooks/useOrderExecution";
import { usePriceUpdates } from "@/hooks/usePriceUpdates";
import { useAssetSpecs } from "@/hooks/useAssetSpecs";
import { useSLTPMonitoring } from "@/hooks/useSLTPMonitoring";
import { OrderTemplate } from "@/hooks/useOrderTemplates";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, RefreshCw, Signal } from "lucide-react";
import { OrderType } from "./OrderTypeSelector";
import { OrderFormData } from "./OrderForm";
import { cn } from "@/lib/utils";

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
 * TradingPanel Component (Enhanced)
 *
 * Main trading interface with improved layout, visual hierarchy, and UX:
 * - Clear price display with change indicators
 * - Better organized sections with visual separators
 * - Sticky Buy/Sell buttons
 * - Improved loading states
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
  const [activeView, setActiveView] = useState<'details' | 'preview'>('details');

  // Hooks
  const { toast } = useToast();
  const { executeOrder, isExecuting } = useOrderExecution();
  const { leverage: assetLeverage, isLoading: isAssetLoading } = useAssetSpecs(symbol);
  const { isMonitoring, monitoredCount, pricesConnected } = useSLTPMonitoring();

  // Real-time price updates
  const { getPrice, isLoading: isPriceLoading } = usePriceUpdates({
    symbols: [symbol],
    intervalMs: 2000,
    enabled: true,
  });

  const priceData = getPrice(symbol);
  const currentPrice = priceData?.currentPrice || 1.0856;
  const priceChange = priceData?.change || 0;
  const isConnected = !isPriceLoading;
  const priceChangePercent = priceData?.changePercent || 0;
  const isPositiveChange = priceChange >= 0;

  const handleOrderTypeChange = (newType: OrderType) => {
    setOrderType(newType);
    setFormData(prev => ({ ...prev, type: newType }));
  };

  const handleFormChange = (data: Partial<OrderFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleFormSubmit = async (data: OrderFormData, side: 'buy' | 'sell') => {
    setPendingOrder({ ...data, side });
    setConfirmDialogOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!pendingOrder) return;

    setConfirmDialogOpen(false);

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

  const handleCancelOrder = () => {
    setConfirmDialogOpen(false);
    setPendingOrder(null);
  };

  const handleApplyTemplate = (template: OrderTemplate) => {
    setFormData(prev => ({
      ...prev,
      quantity: template.volume,
      type: template.order_type as 'market' | 'limit' | 'stop' | 'stop_limit',
      stopLossPrice: template.stop_loss || undefined,
      takeProfitPrice: template.take_profit ?? undefined,
    }));
    setOrderType(template.order_type as OrderType);
    toast({
      title: "Template Applied",
      description: `"${template.name}" settings loaded. (Leverage is set per asset: 1:${assetLeverage})`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Trading Panel Container */}
      <Card className="flex-1 flex flex-col border-border overflow-hidden">
        {/* SL/TP Monitoring Status */}
        {isMonitoring && pricesConnected && (
          <div className="bg-status-info/10 border-b border-status-info-border px-3 py-2 flex items-center gap-2">
            <Signal className="h-3.5 w-3.5 text-status-info-foreground" />
            <p className="text-xs text-status-info-foreground">
              Monitoring SL/TP for {monitoredCount} position{monitoredCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Header - Symbol & Price */}
        <div className="border-b border-border px-4 py-3 bg-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base truncate">{symbol}</h3>
                <Suspense fallback={null}>
                  <OrderTemplatesDialog onApplyTemplate={handleApplyTemplate} />
                </Suspense>
              </div>
              
              {/* Price Display with Indicators */}
              <div className="flex items-center gap-3 mt-1">
                <span className={cn(
                  "font-mono text-xl font-bold transition-colors duration-300",
                  priceData?.isStale ? "text-muted-foreground" : "text-foreground"
                )}>
                  {currentPrice.toFixed(5)}
                </span>
                
                {/* Price Change Indicator */}
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                  isPositiveChange 
                    ? "bg-profit/10 text-profit" 
                    : "bg-loss/10 text-loss"
                )}>
                  {isPositiveChange ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{isPositiveChange ? '+' : ''}{priceChangePercent.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex flex-col items-end gap-1">
              <div className={cn(
                "flex items-center gap-1.5 text-xs",
                isConnected ? "text-profit" : "text-muted-foreground"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-profit animate-pulse" : "bg-muted-foreground"
                )} />
                <span>{isConnected ? 'Live' : 'Connecting...'}</span>
              </div>
              {priceData?.isStale && (
                <div className="flex items-center gap-1 text-xs text-warning">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Type Section */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <Suspense fallback={<div className="h-16 bg-muted/50 rounded animate-pulse" />}>
            <OrderTypeSelector
              value={orderType}
              onChange={handleOrderTypeChange}
              disabled={isExecuting}
            />
          </Suspense>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="md:hidden border-b border-border bg-muted/20">
          <div className="grid grid-cols-2">
            <button
              onClick={() => setActiveView('details')}
              className={cn(
                "py-2.5 text-sm font-medium transition-colors border-b-2",
                activeView === 'details' 
                  ? "border-primary text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Order Details
            </button>
            <button
              onClick={() => setActiveView('preview')}
              className={cn(
                "py-2.5 text-sm font-medium transition-colors border-b-2",
                activeView === 'preview' 
                  ? "border-primary text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Order Preview
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4 h-full">
            {/* Order Form */}
            <div className={cn(
              "md:border-r md:border-border p-4",
              activeView === 'details' ? 'block' : 'hidden md:block'
            )}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm">Order Details</h4>
                {(isExecuting || isAssetLoading) && (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {isExecuting ? 'Executing...' : 'Loading...'}
                    </span>
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
            <div className={cn(
              "p-4 bg-muted/20",
              activeView === 'preview' ? 'block' : 'hidden md:block'
            )}>
              <h4 className="font-medium text-sm mb-3">Order Preview</h4>
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
      <Suspense fallback={null}>
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
