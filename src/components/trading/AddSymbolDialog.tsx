import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_SYMBOLS = [
  { symbol: "EURUSD", name: "Euro / US Dollar" },
  { symbol: "GBPUSD", name: "British Pound / US Dollar" },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen" },
  { symbol: "AUDUSD", name: "Australian Dollar / US Dollar" },
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar" },
  { symbol: "ETHUSD", name: "Ethereum / US Dollar" },
  { symbol: "XAUUSD", name: "Gold / US Dollar" },
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
];

interface AddSymbolDialogProps {
  onAddSymbol: (symbol: string) => Promise<void>;
}

/**
 * AddSymbolDialog Component
 *
 * Dialog for adding a symbol to the active watchlist.
 * Extracted to reduce main component size and improve reusability.
 */
const AddSymbolDialog = ({ onAddSymbol }: AddSymbolDialogProps) => {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (symbol.trim()) {
      setIsLoading(true);
      try {
        await onAddSymbol(symbol);
        setSymbol("");
        setOpen(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Add symbol to watchlist"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Symbol to Watchlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="symbol-input">Select Symbol</Label>
            <Input
              id="symbol-input"
              placeholder="Enter symbol (e.g., EURUSD)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Popular Symbols
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {POPULAR_SYMBOLS.map((s) => (
                <Button
                  key={s.symbol}
                  variant="outline"
                  size="sm"
                  onClick={() => setSymbol(s.symbol)}
                  className={cn(
                    "justify-start text-xs",
                    symbol === s.symbol && "border-primary",
                  )}
                >
                  {s.symbol}
                </Button>
              ))}
            </div>
          </div>
          <Button
            onClick={handleAdd}
            className="w-full"
            disabled={isLoading || !symbol.trim()}
          >
            {isLoading ? "Adding..." : "Add Symbol"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSymbolDialog;
