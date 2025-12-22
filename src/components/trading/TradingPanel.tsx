import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAssetSpecs } from '@/hooks/useAssetSpecs';
import { useOrderExecution } from '@/hooks/useOrderExecution';
import { OrderTemplate } from '@/hooks/useOrderTemplates';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';
import { useSLTPMonitoring } from '@/hooks/useSLTPMonitoring';
import { cn } from '@/lib/utils';
import { Loader2, Signal, TrendingDown, TrendingUp } from 'lucide-react';
import { Suspense, lazy, useState } from 'react';
import TradingErrorBoundary from '../TradingErrorBoundary';
import { OrderFormData } from './OrderForm';
import { OrderType } from './OrderTypeSelector';

// Default constants for trading panel
const DEFAULT_PRICE = 1.0856;
const DEFAULT_PRICE_CHANGE = 0;
const DEFAULT_PRICE_CHANGE_PERCENT = 0;
const DEFAULT_QUANTITY = 0.01;

const OrderTemplatesDialog = lazy(() =>
  import('./OrderTemplatesDialog').then((module) => ({
    default: module.OrderTemplatesDialog,
  }))
);
const OrderForm = lazy(() =>
  import('./OrderForm').then((module) => ({ default: module.OrderForm }))
);
const OrderPreview = lazy(() =>
  import('./OrderPreview').then((module) => ({ default: module.OrderPreview }))
);
const OrderTypeSelector = lazy(() =>
  import('./OrderTypeSelector').then((module) => ({
    default: module.OrderTypeSelector,
  }))
);
const AlertDialogComponent = lazy(() =>
  import('./TradingPanelConfirmationDialog').then((module) => ({
    default: module.default,
  }))
);

interface TradingPanelProps {
  symbol: string;
}

const TradingPanel = ({ symbol }: TradingPanelProps) => {
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [formData, setFormData] = useState<Partial<OrderFormData>>({
    symbol,
    side: 'buy',
    quantity: DEFAULT_QUANTITY,
    type: 'market',
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<OrderFormData | null>(null);
  const [activeView, setActiveView] = useState<'details' | 'preview'>(
    'details'
  );

  const { toast } = useToast();
  const { executeOrder, isExecuting } = useOrderExecution();
  const { leverage: assetLeverage, isLoading: isAssetLoading } =
    useAssetSpecs(symbol);
  const { isMonitoring, monitoredCount, pricesConnected } = useSLTPMonitoring();

  const { getPrice, isLoading: isPriceLoading } = usePriceUpdates({
    symbols: [symbol],
    intervalMs: 2000,
    enabled: true,
  });

  const priceData = getPrice(symbol);
  const currentPrice = priceData?.currentPrice || DEFAULT_PRICE;
  const priceChange = priceData?.change || DEFAULT_PRICE_CHANGE;
  const isConnected = !isPriceLoading;
  const priceChangePercent =
    priceData?.changePercent || DEFAULT_PRICE_CHANGE_PERCENT;
  const isPositiveChange = priceChange >= 0;

  const handleOrderTypeChange = (newType: OrderType) => {
    setOrderType(newType);
    setFormData((prev) => ({ ...prev, type: newType }));
  };

  const handleFormSubmit = async (
    data: OrderFormData,
    side: 'buy' | 'sell'
  ) => {
    setPendingOrder({ ...data, side });
    setConfirmDialogOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!pendingOrder) return;

    setConfirmDialogOpen(false);

    // Build order request with proper optional property handling
    const orderRequest: Parameters<typeof executeOrder>[0] = {
      symbol: pendingOrder.symbol,
      order_type: pendingOrder.type as
        | 'market'
        | 'limit'
        | 'stop'
        | 'stop_limit',
      side: pendingOrder.side,
      quantity: pendingOrder.quantity,
    };

    // Only add optional properties if they have values
    if (pendingOrder.limitPrice) {
      orderRequest.price = pendingOrder.limitPrice;
    }
    if (pendingOrder.stopLossPrice) {
      orderRequest.stop_loss = pendingOrder.stopLossPrice;
    }
    if (pendingOrder.takeProfitPrice) {
      orderRequest.take_profit = pendingOrder.takeProfitPrice;
    }

    const result = await executeOrder(orderRequest);

    if (result) {
      // Reset form on success but keep symbol
      setFormData({
        symbol,
        side: 'buy',
        quantity: DEFAULT_QUANTITY,
        type: 'market',
      });
      // Order execution hook handles success toast
    }

    setPendingOrder(null);
  };

  const handleCancelOrder = () => {
    setConfirmDialogOpen(false);
    setPendingOrder(null);
  };

  const handleApplyTemplate = (template: OrderTemplate) => {
    const updatedData: Partial<OrderFormData> = {
      ...formData,
      quantity: template.volume,
      type: template.order_type as 'market' | 'limit' | 'stop' | 'stop_limit',
    };

    if (template.stop_loss) {
      updatedData.stopLossPrice = template.stop_loss;
    }
    if (template.take_profit) {
      updatedData.takeProfitPrice = template.take_profit;
    }

    setFormData(updatedData);
    setOrderType(template.order_type as OrderType);
    toast({
      title: 'Template Applied',
      description: `"${template.name}" settings loaded.`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <TradingErrorBoundary critical={true}>
        <Card className="flex-1 flex flex-col border-border overflow-hidden">
          {/* SL/TP Monitoring Status */}
          {isMonitoring && pricesConnected && (
            <div className="bg-status-info/10 border-b border-status-info-border px-3 py-1.5 flex items-center gap-2">
              <Signal className="h-3 w-3 text-status-info-foreground" />
              <p className="text-xs text-status-info-foreground">
                Monitoring {monitoredCount} position
                {monitoredCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Header */}
          <div className="border-b border-border px-4 py-3 bg-card">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{symbol}</h3>
                  <Suspense fallback={null}>
                    <OrderTemplatesDialog
                      onApplyTemplate={handleApplyTemplate}
                    />
                  </Suspense>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={cn(
                      'font-mono text-2xl font-bold tabular-nums',
                      priceData?.isStale
                        ? 'text-muted-foreground'
                        : 'text-foreground'
                    )}
                  >
                    {currentPrice.toFixed(5)}
                  </span>

                  <div
                    className={cn(
                      'flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold',
                      isPositiveChange
                        ? 'bg-profit/10 text-profit'
                        : 'bg-loss/10 text-loss'
                    )}
                  >
                    {isPositiveChange ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                      {isPositiveChange ? '+' : ''}
                      {priceChangePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    isConnected
                      ? 'bg-profit animate-pulse'
                      : 'bg-muted-foreground'
                  )}
                />
                <span
                  className={
                    isConnected ? 'text-profit' : 'text-muted-foreground'
                  }
                >
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Type */}
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <Suspense
              fallback={
                <div className="h-12 bg-muted/50 rounded animate-pulse" />
              }
            >
              <OrderTypeSelector
                value={orderType}
                onChange={handleOrderTypeChange}
                disabled={isExecuting}
              />
            </Suspense>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="md:hidden border-b border-border">
            <div className="grid grid-cols-2">
              <button
                onClick={() => setActiveView('details')}
                className={cn(
                  'py-2.5 text-xs font-medium border-b-2 transition-colors',
                  activeView === 'details'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground'
                )}
              >
                Order Details
              </button>
              <button
                onClick={() => setActiveView('preview')}
                className={cn(
                  'py-2.5 text-xs font-medium border-b-2 transition-colors',
                  activeView === 'preview'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground'
                )}
              >
                Order Preview
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              {/* Order Form */}
              <div
                className={cn(
                  'md:border-r md:border-border p-4 h-full overflow-y-auto',
                  activeView === 'details' ? 'block' : 'hidden md:block'
                )}
              >
                {(isExecuting || isAssetLoading) && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {isExecuting ? 'Executing...' : 'Loading...'}
                    </span>
                  </div>
                )}
                <TradingErrorBoundary>
                  <Suspense
                    fallback={
                      <div className="h-64 bg-muted/50 rounded-lg animate-pulse" />
                    }
                  >
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
                </TradingErrorBoundary>
              </div>

              {/* Order Preview */}
              <div
                className={cn(
                  'p-4 bg-muted/10 h-full overflow-y-auto',
                  activeView === 'preview' ? 'block' : 'hidden md:block'
                )}
              >
                <Suspense
                  fallback={
                    <div className="h-64 bg-muted/50 rounded-lg animate-pulse" />
                  }
                >
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
      </TradingErrorBoundary>
    </div>
  );
};

export default TradingPanel;
