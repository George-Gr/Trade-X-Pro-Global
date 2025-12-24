import { useAccessibility } from '@/contexts/AccessibilityContext';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

/**
 * Zod schema for trade form validation
 */
const tradeSchema = z
  .object({
    symbol: z.enum(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']),
    quantity: z
      .string()
      .min(1, 'Quantity is required')
      .refine(
        (val) => /^\d+$/.test(val) && parseInt(val) > 0,
        'Quantity must be greater than 0'
      ),
    price: z.string().optional(),
    orderType: z.enum(['market', 'limit', 'stop']),
    timeInForce: z.enum(['day', 'gtc', 'ioc', 'fok']),
    stopLoss: z.string().optional(),
    takeProfit: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      // Price is required for limit and stop orders
      if (
        (data.orderType === 'limit' || data.orderType === 'stop') &&
        !data.price
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Price is required for limit and stop orders',
      path: ['price'],
    }
  )
  .refine(
    (data) => {
      // If price is provided, it must be a valid number greater than 0
      if (data.price) {
        const p = parseFloat(data.price);
        if (!Number.isFinite(p) || p <= 0) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Price must be a valid number greater than 0',
      path: ['price'],
    }
  )
  .refine(
    (data) => {
      // If stopLoss is provided, it must be a valid number greater than 0
      if (data.stopLoss) {
        const sl = parseFloat(data.stopLoss);
        if (!Number.isFinite(sl) || sl <= 0) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Stop loss must be a valid number greater than 0',
      path: ['stopLoss'],
    }
  )
  .refine(
    (data) => {
      // If takeProfit is provided, it must be a valid number greater than 0
      if (data.takeProfit) {
        const tp = parseFloat(data.takeProfit);
        if (!Number.isFinite(tp) || tp <= 0) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Take profit must be a valid number greater than 0',
      path: ['takeProfit'],
    }
  );

type TradeData = z.infer<typeof tradeSchema>;

/**
 * Default form values for the trading form
 * Used for initialization and reset operations
 */
// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_FORM_VALUES = {
  symbol: 'AAPL' as const,
  quantity: '',
  price: undefined,
  orderType: 'market' as const,
  timeInForce: 'day' as const,
  stopLoss: undefined,
  takeProfit: undefined,
  notes: undefined,
};

/**
 * Accessible Trading Form Component
 *
 * A comprehensive trading form with full accessibility support including ARIA labeling,
 * keyboard navigation, and screen reader announcements via ARIA live regions.
 * Supports market, limit, and stop orders with optional stop-loss and take-profit levels.
 *
 * @component
 * @returns {JSX.Element} The trading form with accessibility features
 */
export const TradingForm: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm<TradeData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onChange',
  });

  const [submitMessage, setSubmitMessage] = useState('');
  const { visualPreferences, complianceScore } = useAccessibility();

  const orderType = watch('orderType');
  const quantity = watch('quantity');
  const price = watch('price');

  // Refs for timer cleanup to prevent state updates on unmounted components
  const submitTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (submitTimeoutRef.current) {
        window.clearTimeout(submitTimeoutRef.current);
        submitTimeoutRef.current = null;
      }
    };
  }, []);

  const orderTypes = [
    {
      value: 'market',
      label: 'Market Order',
      description: 'Execute at current market price',
    },
    {
      value: 'limit',
      label: 'Limit Order',
      description: 'Execute at specified price or better',
    },
    {
      value: 'stop',
      label: 'Stop Order',
      description: 'Execute when price reaches stop level',
    },
  ];

  const timeInForceOptions = [
    {
      value: 'day',
      label: 'Day',
      description: 'Valid for the current trading day',
    },
    {
      value: 'gtc',
      label: 'Good Till Cancelled',
      description: 'Remains active until filled or cancelled',
    },
    {
      value: 'ioc',
      label: 'Immediate or Cancel',
      description: 'Fill immediately or cancel',
    },
    {
      value: 'fok',
      label: 'Fill or Kill',
      description: 'Fill completely or cancel',
    },
  ];

  const calculateEstimatedCost = () => {
    if (!quantity || !price) return 0;
    return parseFloat(quantity) * parseFloat(price);
  };

  const onSubmit = async (data: TradeData) => {
    setSubmitMessage('Submitting order...');
    announceToScreenReader('Submitting order');

    // Clear any existing timeout before starting a new one
    if (submitTimeoutRef.current) {
      window.clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }

    // Simulate API call with proper cleanup
    await new Promise<void>((resolve) => {
      submitTimeoutRef.current = window.setTimeout(() => {
        if (isMountedRef.current) {
          setSubmitMessage('Order submitted successfully!');
          announceToScreenReader('Order submitted successfully');
          reset(DEFAULT_FORM_VALUES);
        }
        resolve();
      }, 2000);
    });
  };

  /**
   * Announce message to screen readers via ARIA live region
   * Note: This function is intentionally a no-op as announcements are handled
   * by the ARIA live region (role="status" aria-live="polite") in the UI.
   * The message parameter is kept for API compatibility.
   */
  const [screenReaderMessage, setScreenReaderMessage] = useState('');

  /**
   * Announce message to screen readers via ARIA live region
   */
  const announceToScreenReader = (message: string) => {
    setScreenReaderMessage(message);
    // Clear the message after a short delay to ensure it can be announced again if repeated
    setTimeout(() => {
      setScreenReaderMessage('');
    }, 1000);
  };

  const quickFill = (preset: 'buy' | 'sell' | 'clear') => {
    if (preset === 'clear') {
      reset(DEFAULT_FORM_VALUES);
      announceToScreenReader('Form cleared');
      return;
    }

    const samplePrice = 150.25;
    setValue('quantity', '100');
    setValue('price', samplePrice.toString());
    setValue('orderType', 'limit');
    setValue(
      'stopLoss',
      preset === 'buy'
        ? (samplePrice * 0.95).toFixed(2)
        : (samplePrice * 1.05).toFixed(2)
    );
    setValue(
      'takeProfit',
      preset === 'buy'
        ? (samplePrice * 1.1).toFixed(2)
        : (samplePrice * 0.9).toFixed(2)
    );
    setValue(
      'notes',
      preset === 'buy'
        ? 'Buy position with stop loss and take profit'
        : 'Sell position with stop loss and take profit'
    );

    announceToScreenReader(`Quick fill ${preset} completed`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">New Trade Order</h2>
          <p className="text-muted-foreground">
            Create and submit trading orders with full accessibility support
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => quickFill('buy')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium"
            aria-label="Quick fill buy order"
          >
            Quick Buy
          </button>
          <button
            onClick={() => quickFill('sell')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium"
            aria-label="Quick fill sell order"
          >
            Quick Sell
          </button>
          <button
            onClick={() => quickFill('clear')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium"
            aria-label="Clear form"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Current Price Info */}
      <div className="bg-card rounded-lg p-4 border">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold">AAPL</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              $150.25
            </span>
            <span className="text-sm text-muted-foreground">
              +0.50 (+0.33%)
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Accessibility Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
              Accessibility: {Math.round(complianceScore)}%
            </span>
            <span className="text-sm text-blue-800">
              {visualPreferences.preferences.highContrast
                ? 'High contrast mode enabled'
                : visualPreferences.preferences.largerText
                ? 'Larger text enabled'
                : 'Standard accessibility settings'}
            </span>
          </div>
          <div className="text-sm text-blue-800">
            Use Tab to navigate • Enter to submit • Esc to cancel
          </div>
        </div>
      </div>

      {/* Trading Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Symbol and Order Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium mb-2">
              Trading Symbol
            </label>
            <select
              {...register('symbol')}
              id="symbol"
              aria-describedby="symbol-help"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
            >
              <option value="AAPL">AAPL - Apple Inc.</option>
              <option value="MSFT">MSFT - Microsoft Corporation</option>
              <option value="GOOGL">GOOGL - Alphabet Inc.</option>
              <option value="AMZN">AMZN - Amazon.com, Inc.</option>
              <option value="TSLA">TSLA - Tesla, Inc.</option>
            </select>
            <div
              id="symbol-help"
              className="text-sm text-muted-foreground mt-1"
            >
              Select the trading symbol for your order
            </div>
          </div>

          <div>
            <label
              htmlFor="orderType"
              className="block text-sm font-medium mb-2"
            >
              Order Type
            </label>
            <select
              {...register('orderType')}
              id="orderType"
              aria-describedby="orderType-help"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
            >
              {orderTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div
              id="orderType-help"
              className="text-sm text-muted-foreground mt-1"
            >
              {orderTypes.find((t) => t.value === orderType)?.description}
            </div>
          </div>
        </div>

        {/* Quantity and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium mb-2"
            >
              Quantity
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            </label>
            <input
              {...register('quantity')}
              id="quantity"
              type="text"
              aria-describedby={
                errors.quantity ? 'quantity-error' : 'quantity-help'
              }
              aria-required="true"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter quantity"
            />
            <div
              id="quantity-help"
              className="text-sm text-muted-foreground mt-1"
            >
              Number of shares to trade
            </div>
            {errors.quantity && (
              <div
                id="quantity-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
                aria-live="polite"
              >
                {errors.quantity.message}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-2">
              Price
              {orderType !== 'market' && (
                <span className="text-red-500 ml-1" aria-hidden="true">
                  *
                </span>
              )}
            </label>
            <input
              {...register('price')}
              id="price"
              type="text"
              aria-describedby={errors.price ? 'price-error' : 'price-help'}
              aria-required={orderType !== 'market'}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={
                orderType === 'market' ? 'Market price' : 'Enter price'
              }
              disabled={orderType === 'market'}
            />
            <div id="price-help" className="text-sm text-muted-foreground mt-1">
              {orderType === 'market'
                ? 'Market orders execute at current price'
                : 'Specify the price for limit/stop orders'}
            </div>
            {errors.price && (
              <div
                id="price-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
                aria-live="polite"
              >
                {errors.price.message}
              </div>
            )}
          </div>
        </div>

        {/* Time in Force and Estimated Cost */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="timeInForce"
              className="block text-sm font-medium mb-2"
            >
              Time in Force
            </label>
            <select
              {...register('timeInForce')}
              id="timeInForce"
              aria-describedby="timeInForce-help"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
            >
              {timeInForceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div
              id="timeInForce-help"
              className="text-sm text-muted-foreground mt-1"
            >
              {
                timeInForceOptions.find((t) => t.value === watch('timeInForce'))
                  ?.description
              }
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Estimated Cost
            </label>
            <div className="p-3 border rounded-lg bg-gray-50 border-gray-300">
              <p className="text-lg font-semibold">
                ${calculateEstimatedCost().toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Based on quantity × price
              </p>
            </div>
          </div>
        </div>

        {/* Stop Loss and Take Profit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="stopLoss"
              className="block text-sm font-medium mb-2"
            >
              Stop Loss
            </label>
            <input
              {...register('stopLoss')}
              id="stopLoss"
              type="text"
              aria-describedby={
                errors.stopLoss ? 'stopLoss-error' : 'stopLoss-help'
              }
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.stopLoss ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Optional stop loss price"
            />
            <div
              id="stopLoss-help"
              className="text-sm text-muted-foreground mt-1"
            >
              Automatically sell if price drops to this level
            </div>
            {errors.stopLoss && (
              <div
                id="stopLoss-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
                aria-live="polite"
              >
                {errors.stopLoss.message}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="takeProfit"
              className="block text-sm font-medium mb-2"
            >
              Take Profit
            </label>
            <input
              {...register('takeProfit')}
              id="takeProfit"
              type="text"
              aria-describedby={
                errors.takeProfit ? 'takeProfit-error' : 'takeProfit-help'
              }
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                errors.takeProfit ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Optional take profit price"
            />
            <div
              id="takeProfit-help"
              className="text-sm text-muted-foreground mt-1"
            >
              Automatically sell if price rises to this level
            </div>
            {errors.takeProfit && (
              <div
                id="takeProfit-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
                aria-live="polite"
              >
                {errors.takeProfit.message}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            Notes
          </label>
          <textarea
            {...register('notes')}
            id="notes"
            aria-describedby="notes-help"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
            rows={3}
            placeholder="Optional notes about this trade"
          />
          <div id="notes-help" className="text-sm text-muted-foreground mt-1">
            Add any additional information about this trade
          </div>
        </div>

        {/* Submit Section */}
        <div className="bg-card rounded-lg p-6 border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Review Order</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Order Type:{' '}
                {orderTypes.find((t) => t.value === orderType)?.label}
              </span>
              <span className="text-sm text-muted-foreground">
                Time in Force:{' '}
                {
                  timeInForceOptions.find(
                    (t) => t.value === watch('timeInForce')
                  )?.label
                }
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-muted-foreground">Symbol</p>
              <p className="text-lg font-semibold">{watch('symbol')}</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="text-lg font-semibold">{quantity || '0'}</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-lg font-semibold">
                {price ? `$${parseFloat(price).toLocaleString()}` : 'Market'}
              </p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm text-muted-foreground">Estimated Cost</p>
              <p className="text-lg font-semibold">
                ${calculateEstimatedCost().toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                isSubmitting
                  ? 'bg-gray-500 text-white cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              aria-describedby="submit-help"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Order'}
            </button>

            <button
              type="button"
              onClick={() => {
                reset(DEFAULT_FORM_VALUES);
                announceToScreenReader('Form reset to defaults');
              }}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium focus:ring-2 focus:ring-gray-500 focus:outline-none"
            >
              Reset
            </button>
          </div>

          <div id="submit-help" className="text-sm text-muted-foreground mt-3">
            Review your order details before submitting. All fields will be
            validated.
          </div>

          {submitMessage && (
            <div
              className={`mt-4 p-3 rounded ${
                submitMessage.includes('successfully')
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-blue-50 border border-blue-200 text-blue-800'
              }`}
              role="status"
              aria-live="polite"
            >
              {submitMessage}
            </div>
          )}
        </div>

        {/* Screen Reader Announcements */}
        <div role="status" aria-live="polite" className="sr-only">
          {screenReaderMessage}
        </div>
      </form>
    </div>
  );
};

export default TradingForm;
