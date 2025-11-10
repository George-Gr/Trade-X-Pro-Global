import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { usePriceUpdates } from "@/hooks/usePriceUpdates";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CompareSymbolsDialogProps {
  symbols: string[];
}

export const CompareSymbolsDialog = ({ symbols }: CompareSymbolsDialogProps) => {
  const [open, setOpen] = useState(false);
  const { prices, getPrice } = usePriceUpdates({
    symbols,
    intervalMs: 3000,
    enabled: open,
  });

  // Convert prices Map to array and sort by change percent
  const priceArray = symbols.map(symbol => getPrice(symbol)).filter(Boolean);
  const sortedByChange = priceArray.sort((a, b) => (b?.changePercent || 0) - (a?.changePercent || 0));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Compare
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Compare Symbols</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {sortedByChange.map((price) => {
              if (!price) return null;
              const isPositive = price.change >= 0;
              return (
                <div
                  key={price.symbol}
                  className="border border-border rounded-lg p-4 bg-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{price.symbol}</span>
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-profit" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-loss" />
                      )}
                    </div>
                    <div className={cn("text-lg font-semibold font-mono", isPositive ? "text-profit" : "text-loss")}>
                      {isPositive ? "+" : ""}{price.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Current</div>
                      <div className="font-mono font-semibold">{price.currentPrice.toFixed(5)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Bid</div>
                      <div className="font-mono">{price.bid.toFixed(5)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Ask</div>
                      <div className="font-mono">{price.ask.toFixed(5)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Change</div>
                      <div className={cn("font-mono font-medium", isPositive ? "text-profit" : "text-loss")}>
                        {isPositive ? "+" : ""}{price.change.toFixed(5)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t border-border">
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Open</div>
                      <div className="font-mono text-xs">{price.open?.toFixed(5) || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">High</div>
                      <div className="font-mono text-xs text-profit">{price.high?.toFixed(5) || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Low</div>
                      <div className="font-mono text-xs text-loss">{price.low?.toFixed(5) || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Prev Close</div>
                      <div className="font-mono text-xs">{price.previousClose?.toFixed(5) || "N/A"}</div>
                    </div>
                  </div>

                  {/* Performance bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all", isPositive ? "bg-profit" : "bg-loss")}
                        style={{
                          width: `${Math.min(Math.abs(price.changePercent) * 10, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
