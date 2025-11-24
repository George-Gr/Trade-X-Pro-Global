import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWatchlists } from "@/hooks/useWatchlists";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import WatchlistItems from "./WatchlistItems";

interface WatchlistTabsProps {
  activeWatchlistId: string | null;
  onActiveWatchlistChange: (id: string) => void;
  onDeleteWatchlist: (id: string) => void;
  onSelectSymbol?: (symbol: string) => void;
  onQuickTrade?: (symbol: string, side: "buy" | "sell") => void;
}

export const WatchlistTabs = ({ 
  activeWatchlistId, 
  onActiveWatchlistChange,
  onDeleteWatchlist,
  onSelectSymbol,
  onQuickTrade
}: WatchlistTabsProps) => {
  const { watchlists, watchlistItems, isLoading } = useWatchlists();

  if (isLoading || watchlists.length === 0) {
    return null;
  }

  return (
    <Tabs
      value={activeWatchlistId || undefined}
      onValueChange={onActiveWatchlistChange}
      className="flex-1 flex flex-col overflow-hidden"
    >
      <div className="flex items-center gap-4 mb-4">
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
                        className="ml-2 opacity-0 group-hover:opacity-100 hover:text-destructive"
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
                        <AlertDialogAction onClick={() => onDeleteWatchlist(list.id)}>
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
      </div>

      {watchlists.map((list) => {
        const listItems = Array.isArray(watchlistItems)
          ? watchlistItems.filter(item => item.watchlist_id === list.id)
          : [];
        
        return (
          <TabsContent key={list.id} value={list.id} className="flex-1 overflow-hidden mt-2">
            <WatchlistItems
              items={listItems}
              onSymbolClick={onSelectSymbol}
              onQuickTrade={onQuickTrade}
              getPrice={(symbol: string) => null} // TODO: Replace with actual price getter
              onRemoveSymbol={(symbol: string) => {}} // TODO: Implement remove logic
              onAddSymbolClick={() => {}} // TODO: Implement add symbol logic
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
};