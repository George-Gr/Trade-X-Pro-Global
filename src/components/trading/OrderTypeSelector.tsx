import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';

interface OrderTypeSelectorProps {
  value: OrderType;
  onChange: (type: OrderType) => void;
  disabled?: boolean;
}

/**
 * OrderTypeSelector Component (Enhanced)
 * 
 * Improved order type selection with:
 * - Better visual hierarchy
 * - Larger touch targets
 * - Clear active state
 * - Responsive sizing
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

  const selectedType = orderTypes.find((t) => t.value === value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium">Order Type</label>
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
          {selectedType?.description}
        </p>
      </div>
      
      <Tabs
        value={value}
        onValueChange={(v) => onChange(v as OrderType)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5 h-10 bg-muted/50 rounded-lg p-1 gap-1">
          {orderTypes.map((type) => (
            <TabsTrigger
              key={type.value}
              value={type.value}
              disabled={disabled}
              className={cn(
                "text-xs font-medium rounded-md transition-all duration-200",
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                "data-[state=active]:shadow-sm",
                "hover:bg-muted/80",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
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
