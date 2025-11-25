import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, TrendingUp, TrendingDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WatchlistItem {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  isFavorite: boolean;
}

const Watchlist = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { symbol: "EURUSD", name: "Euro / US Dollar", bid: 1.0845, ask: 1.0847, change: 0.0012, changePercent: 0.11, isFavorite: true },
    { symbol: "GBPUSD", name: "British Pound / US Dollar", bid: 1.2634, ask: 1.2636, change: -0.0021, changePercent: -0.17, isFavorite: true },
    { symbol: "USDJPY", name: "US Dollar / Japanese Yen", bid: 149.82, ask: 149.85, change: 0.32, changePercent: 0.21, isFavorite: true },
    { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", bid: 0.6423, ask: 0.6425, change: 0.0008, changePercent: 0.12, isFavorite: true },
    { symbol: "BTCUSD", name: "Bitcoin / US Dollar", bid: 43250.00, ask: 43280.00, change: 850.00, changePercent: 2.01, isFavorite: false },
    { symbol: "XAUUSD", name: "Gold / US Dollar", bid: 2045.80, ask: 2046.20, change: -5.40, changePercent: -0.26, isFavorite: false },
  ]);

  const [availableSymbols] = useState([
    { symbol: "EURGBP", name: "Euro / British Pound" },
    { symbol: "EURJPY", name: "Euro / Japanese Yen" },
    { symbol: "USDCHF", name: "US Dollar / Swiss Franc" },
    { symbol: "NZDUSD", name: "New Zealand Dollar / US Dollar" },
    { symbol: "ETHUSD", name: "Ethereum / US Dollar" },
  ]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist((prev) =>
        prev.map((item) => {
          const volatility = item.symbol.includes("BTC") ? 100 : item.symbol.includes("XAU") ? 2 : 0.0002;
          const change = (Math.random() - 0.5) * volatility;
          const newBid = item.bid + change;
          const newAsk = item.ask + change;
          const newChange = item.change + change;
          const newChangePercent = (newChange / item.bid) * 100;

          return {
            ...item,
            bid: newBid,
            ask: newAsk,
            change: newChange,
            changePercent: newChangePercent,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (symbol: string) => {
    setWatchlist((prev) =>
      prev.map((item) =>
        item.symbol === symbol ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
  };

  const addToWatchlist = (symbol: string, name: string) => {
    const exists = watchlist.find((item) => item.symbol === symbol);
    if (!exists) {
      setWatchlist((prev) => [
        ...prev,
        {
          symbol,
          name,
          bid: Math.random() * 100,
          ask: Math.random() * 100 + 0.002,
          change: (Math.random() - 0.5) * 2,
          changePercent: (Math.random() - 0.5) * 2,
          isFavorite: false,
        },
      ]);
    }
  };

  const filteredWatchlist = watchlist.filter(
    (item) =>
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes("JPY")) return price.toFixed(2);
    if (symbol.includes("BTC") || symbol.includes("XAU")) return price.toFixed(2);
    return price.toFixed(4);
  };

  const getSpread = (bid: number, ask: number, symbol: string) => {
    const spread = ask - bid;
    if (symbol.includes("JPY")) return spread.toFixed(2);
    if (symbol.includes("BTC") || symbol.includes("XAU")) return spread.toFixed(2);
    return spread.toFixed(4);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">My Watchlist</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-4.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search symbols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-10 w-[200px] bg-input border-border"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4 pt-0 overflow-hidden">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {filteredWatchlist.map((item) => {
              const isPositive = item.change >= 0;
              const TrendIcon = isPositive ? TrendingUp : TrendingDown;

              return (
                <div
                  key={item.symbol}
                  className="group relative flex items-center gap-4 p-4 rounded-md bg-secondary/50 hover:bg-secondary transition-colors border border-border/50 hover:border-border"
                >
                  {/* Favorite Star */}
                  <button
                    onClick={() => toggleFavorite(item.symbol)}
                    className="transition-all hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "h-4 w-4 transition-colors",
                        item.isFavorite
                          ? "fill-primary text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    />
                  </button>

                  {/* Symbol & Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-sm">{item.symbol}</span>
                      <TrendIcon
                        className={cn(
                          "h-3 w-3",
                          isPositive ? "text-profit" : "text-loss"
                        )}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.name}
                    </p>
                  </div>

                  {/* Prices */}
                  <div className="text-right">
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Bid</div>
                        <div className="font-mono font-semibold">
                          {formatPrice(item.bid, item.symbol)}
                        </div>
                      </div>
                      <div className="text-muted-foreground">/</div>
                      <div>
                        <div className="text-xs text-muted-foreground">Ask</div>
                        <div className="font-mono font-semibold">
                          {formatPrice(item.ask, item.symbol)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Spread: {getSpread(item.bid, item.ask, item.symbol)}
                    </div>
                  </div>

                  {/* Change */}
                  <div className="text-right min-w-[80px]">
                    <div
                      className={cn(
                        "text-sm font-semibold font-mono",
                        isPositive ? "text-profit" : "text-loss"
                      )}
                    >
                      {isPositive ? "+" : ""}
                      {formatPrice(item.change, item.symbol)}
                    </div>
                    <div
                      className={cn(
                        "text-xs font-medium",
                        isPositive ? "text-profit" : "text-loss"
                      )}
                    >
                      {isPositive ? "+" : ""}
                      {item.changePercent.toFixed(2)}%
                    </div>
                  </div>

                  {/* Remove button (visible on hover) */}
                  <button
                    onClick={() => removeFromWatchlist(item.symbol)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 rounded p-4"
                    aria-label={`Remove ${item.symbol} from watchlist`}
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Add New Symbol Section */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Quick Add
          </div>
          <div className="flex flex-wrap gap-4">
            {availableSymbols
              .filter((s) => !watchlist.find((w) => w.symbol === s.symbol))
              .map((s) => (
                <Button
                  key={s.symbol}
                  variant="outline"
                  size="sm"
                  onClick={() => addToWatchlist(s.symbol, s.name)}
                  className="h-7 text-xs gap-4"
                >
                  <Plus className="h-3 w-3" />
                  {s.symbol}
                </Button>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Watchlist;
