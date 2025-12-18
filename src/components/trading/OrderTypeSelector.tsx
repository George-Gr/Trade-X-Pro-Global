import { cn } from "@/lib/utils";

export type OrderType =
  | "market"
  | "limit"
  | "stop"
  | "stop_limit"
  | "trailing_stop";

interface OrderTypeSelectorProps {
  value: OrderType;
  onChange: (type: OrderType) => void;
  disabled?: boolean;
}

const orderTypes: { value: OrderType; label: string; shortLabel: string }[] = [
  { value: "market", label: "Market", shortLabel: "Market" },
  { value: "limit", label: "Limit", shortLabel: "Limit" },
  { value: "stop", label: "Stop", shortLabel: "Stop" },
  { value: "stop_limit", label: "Stop-Limit", shortLabel: "S-Limit" },
  { value: "trailing_stop", label: "Trailing", shortLabel: "Trail" },
];

export const OrderTypeSelector = ({
  value,
  onChange,
  disabled = false,
}: OrderTypeSelectorProps) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Order Type
      </label>
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
        {orderTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            disabled={disabled}
            className={cn(
              "flex-1 py-2 px-2 text-xs font-medium rounded-md transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === type.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            <span className="hidden sm:inline">{type.label}</span>
            <span className="sm:hidden">{type.shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrderTypeSelector;
