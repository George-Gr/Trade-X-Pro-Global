import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';

interface OrderTypeSelectorProps {
  value: OrderType;
  onChange: (type: OrderType) => void;
  disabled?: boolean;
}

/**
 * OrderTypeSelector Component
 * 
 * Provides UI for selecting order type with tabs interface.
 * Supports: Market, Limit, Stop, Stop-Limit, and Trailing Stop orders.
 * 
 * @param value - Currently selected order type
 * @param onChange - Callback when order type changes
 * @param disabled - Whether the selector is disabled
 */
export const OrderTypeSelector = ({
  value,
  onChange,
  disabled = false,
}: OrderTypeSelectorProps) => {
  const orderTypes: { value: OrderType; label: string; description: string }[] = [
    {
      value: 'market',
      label: 'Market',
      description: 'Buy/sell at current market price immediately',
    },
    {
      value: 'limit',
      label: 'Limit',
      description: 'Buy/sell at specified price or better',
    },
    {
      value: 'stop',
      label: 'Stop',
      description: 'Market order triggered at stop price',
    },
    {
      value: 'stop_limit',
      label: 'Stop-Limit',
      description: 'Limit order triggered at stop price',
    },
    {
      value: 'trailing_stop',
      label: 'Trailing',
      description: 'Stop that follows price movement',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold">Order Type</label>
        <p className="text-xs text-muted-foreground">
          {orderTypes.find((t) => t.value === value)?.description}
        </p>
      </div>
      <Tabs
        value={value}
        onValueChange={(v) => onChange(v as OrderType)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5">
          {orderTypes.map((type) => (
            <TabsTrigger
              key={type.value}
              value={type.value}
              disabled={disabled}
              className="text-xs"
            >
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default OrderTypeSelector;
