import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, TrendingUp, TrendingDown, Plus, X, FolderPlus, Trash2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWatchlists } from "@/hooks/useWatchlists";
import { usePriceUpdates } from "@/hooks/usePriceUpdates";
import { PriceAlertDialog } from "./PriceAlertDialog";
import { CompareSymbolsDialog } from "./CompareSymbolsDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface EnhancedWatchlistProps {
  onSelectSymbol?: (symbol: string) => void;
  onQuickTrade?: (symbol: string, side: "buy" | "sell") => void;
}

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

const EnhancedWatchlist = ({ onSelectSymbol, onQuickTrade }: EnhancedWatchlistProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addSymbolDialogOpen, setAddSymbolDialogOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");

  const {
    watchlists,
    watchlistItems,
    activeWatchlistId,
    setActiveWatchlistId,
    isLoading,
    createWatchlist,
    deleteWatchlist,
    addSymbolToWatchlist,
    removeSymbolFromWatchlist,
  } = useWatchlists();

  const activeItems = activeWatchlistId ? watchlistItems[activeWatchlistId] || [] : [];
  const activeSymbols = activeItems.map((item) => item.symbol);

  const { prices, getPrice } = usePriceUpdates({
    symbols: activeSymbols,
    intervalMs: 2000,
    enabled: activeSymbols.length > 0,
  });

  const handleCreateWatchlist = async () => {
    if (newWatchlistName.trim()) {
      await createWatchlist(newWatchlistName);
      setNewWatchlistName("");
      setCreateDialogOpen(false);
    }
  };

  const handleAddSymbol = async () => {
    if (activeWatchlistId && selectedSymbol) {
      await addSymbolToWatchlist(activeWatchlistId, selectedSymbol);
      setSelectedSymbol("");
      setAddSymbolDialogOpen(false);
    }
  };

  const handleSymbolClick = (symbol: string) => {
    if (onSelectSymbol) {
      onSelectSymbol(symbol);
    }
  };

  const handleQuickTrade = (symbol: string, side: "buy" | "sell", e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickTrade) {
      onQuickTrade(symbol, side);
    }
  };

  const filteredItems = activeItems.filter((item) =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes("JPY")) return price.toFixed(2);
    if (symbol.includes("BTC") || symbol.includes("ETH") || symbol.includes("XAU")) return price.toFixed(2);
    return price.toFixed(5);
  };

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading watchlists...</div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-lg">Watchlists</CardTitle>
          <div className="flex items-center gap-2">
            <CompareSymbolsDialog symbols={activeSymbols} />
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Watchlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Watchlist Name</Label>
                    <Input
                      placeholder="e.g., Forex Pairs"
                      value={newWatchlistName}
                      onChange={(e) => setNewWatchlistName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateWatchlist()}
                    />
                  </div>
                  <Button onClick={handleCreateWatchlist} className="w-full">
                    Create Watchlist
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 bg-input border-border"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3 pt-0 overflow-hidden flex flex-col">
        {watchlists.length > 0 && (
          <Tabs
            value={activeWatchlistId || undefined}
            onValueChange={setActiveWatchlistId}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-3">
              <ScrollArea className="flex-1">
                <TabsList className="w-full justify-start">
                  {watchlists.map((list) => (
                    <TabsTrigger key={list.id} value={list.id} className="relative group">
                      {list.name}
                      {!list.is_default && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Watchlist</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{list.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteWatchlist(list.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>
              
              <Dialog open={addSymbolDialogOpen} onOpenChange={setAddSymbolDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Symbol to Watchlist</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Symbol</Label>
                      <Input
                        placeholder="Enter symbol (e.g., EURUSD)"
                        value={selectedSymbol}
                        onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleAddSymbol()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Popular Symbols</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {POPULAR_SYMBOLS.map((s) => (
                          <Button
                            key={s.symbol}
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSymbol(s.symbol)}
                            className={cn(
                              "justify-start text-xs",
                              selectedSymbol === s.symbol && "border-primary"
                            )}
                          >
                            {s.symbol}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleAddSymbol} className="w-full">
                      Add Symbol
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {watchlists.map((list) => (
              <TabsContent key={list.id} value={list.id} className="flex-1 overflow-hidden mt-0">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-2">
                    {filteredItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="mb-2">No symbols in this watchlist</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAddSymbolDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Symbol
                        </Button>
                      </div>
                    ) : (
                      filteredItems.map((item) => {
                        const priceData = getPrice(item.symbol);
                        const isPositive = (priceData?.change || 0) >= 0;
                        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSymbolClick(item.symbol)}
                            className="group relative flex items-center gap-3 p-3 rounded-md bg-secondary/50 hover:bg-secondary transition-colors border border-border/50 hover:border-border cursor-pointer"
                          >
                            {/* Symbol & Name */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">{item.symbol}</span>
                                <TrendIcon
                                  className={cn("h-3 w-3", isPositive ? "text-profit" : "text-loss")}
                                />
                              </div>
                            </div>

                            {/* Prices */}
                            <div className="text-right">
                              <div className="font-mono font-semibold text-sm">
                                {priceData ? formatPrice(priceData.currentPrice, item.symbol) : "---"}
                              </div>
                              {priceData && (
                                <div
                                  className={cn(
                                    "text-xs font-medium",
                                    isPositive ? "text-profit" : "text-loss"
                                  )}
                                >
                                  {isPositive ? "+" : ""}
                                  {priceData.changePercent.toFixed(2)}%
                                </div>
                              )}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleQuickTrade(item.symbol, "buy", e)}
                                className="h-7 px-2 text-xs bg-buy/10 hover:bg-buy/20 text-buy-foreground"
                              >
                                Buy
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleQuickTrade(item.symbol, "sell", e)}
                                className="h-7 px-2 text-xs bg-sell/10 hover:bg-sell/20 text-sell-foreground"
                              >
                                Sell
                              </Button>
                              {priceData && (
                                <PriceAlertDialog
                                  symbol={item.symbol}
                                  currentPrice={priceData.currentPrice}
                                />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSymbolFromWatchlist(list.id, item.id);
                                }}
                                className="hover:bg-destructive/20 rounded p-1"
                              >
                                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedWatchlist;
