import { useState, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWatchlists } from "@/hooks/useWatchlists";
import { usePriceUpdates } from "@/hooks/usePriceUpdates";
import { CompareSymbolsDialog } from "./CompareSymbolsDialog";
import CreateWatchlistDialog from "./CreateWatchlistDialog";
import AddSymbolDialog from "./AddSymbolDialog";
import DeleteWatchlistDialog from "./DeleteWatchlistDialog";
import WatchlistItems from "./WatchlistItems";

// Lazy load heavy components
const PriceAlertDialog = lazy(() => import("./PriceAlertDialog").then(mod => ({ default: mod.PriceAlertDialog })));

interface EnhancedWatchlistProps {
  onSelectSymbol?: (symbol: string) => void;
  onQuickTrade?: (symbol: string, side: "buy" | "sell") => void;
}

/**
 * EnhancedWatchlist Component (Optimized)
 * 
 * Main watchlist component with refactored subcomponents for better code splitting.
 * Delegates dialog logic to specialized components:
 * - CreateWatchlistDialog: Create new watchlist
 * - AddSymbolDialog: Add symbol to watchlist
 * - DeleteWatchlistDialog: Delete watchlist confirmation
 * - WatchlistItems: List rendering with memoized rows
 * 
 * This reduces the component size from 355 lines to ~150 lines,
 * enabling better tree-shaking and bundle splitting.
 */
const EnhancedWatchlist = ({ onSelectSymbol, onQuickTrade }: EnhancedWatchlistProps) => {
  const [searchQuery, setSearchQuery] = useState("");

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

  const { getPrice } = usePriceUpdates({
    symbols: activeSymbols,
    intervalMs: 2000,
    enabled: activeSymbols.length > 0,
  });

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

  const handleRemoveSymbol = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeWatchlistId) {
      removeSymbolFromWatchlist(activeWatchlistId, itemId);
    }
  };

  const filteredItems = activeItems.filter((item) =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading watchlists...</div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg">Watchlists</CardTitle>
          <div className="flex items-center gap-4">
            <CompareSymbolsDialog symbols={activeSymbols} />
            <CreateWatchlistDialog onCreateWatchlist={createWatchlist} />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-4.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 bg-input border-border"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4 pt-0 overflow-hidden flex flex-col">
        {watchlists.length > 0 && (
          <Tabs
            value={activeWatchlistId || undefined}
            onValueChange={setActiveWatchlistId}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-4 mb-4">
              <ScrollArea className="flex-1">
                <TabsList className="w-full justify-start">
                  {watchlists.map((list) => (
                    <div key={list.id} className="relative group">
                      <TabsTrigger value={list.id}>
                        {list.name}
                      </TabsTrigger>
                      {!list.is_default && (
                        <DeleteWatchlistDialog
                          watchlistName={list.name}
                          onDelete={() => deleteWatchlist(list.id)}
                        />
                      )}
                    </div>
                  ))}
                </TabsList>
              </ScrollArea>
              
              <AddSymbolDialog 
                onAddSymbol={async (symbol) => {
                  if (activeWatchlistId) {
                    await addSymbolToWatchlist(activeWatchlistId, symbol);
                  }
                }}
              />
            </div>

            {watchlists.map((list) => (
              <TabsContent key={list.id} value={list.id} className="flex-1 overflow-hidden mt-2">
                <WatchlistItems
                  items={filteredItems}
                  getPrice={getPrice}
                  onSymbolClick={handleSymbolClick}
                  onQuickTrade={handleQuickTrade}
                  onRemoveSymbol={handleRemoveSymbol}
                  onAddSymbolClick={() => {/* Dialog opens on button click */}}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedWatchlist;
