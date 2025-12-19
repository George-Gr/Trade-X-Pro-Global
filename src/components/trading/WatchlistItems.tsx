import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import WatchlistRow from './WatchlistRow';

interface WatchlistItem {
  id: string;
  symbol: string;
}

interface WatchlistItemsProps {
  items: WatchlistItem[];
  getPrice: (
    symbol: string
  ) =>
    | { currentPrice: number; change: number; changePercent: number }
    | undefined;
  onSymbolClick: (symbol: string) => void;
  onQuickTrade: (
    symbol: string,
    side: 'buy' | 'sell',
    e: React.MouseEvent
  ) => void;
  onRemoveSymbol: (itemId: string, e: React.MouseEvent) => void;
  onAddSymbolClick: () => void;
}

/**
 * WatchlistItems Component
 *
 * Renders the list of symbols in a watchlist with memoized row items
 * to prevent unnecessary re-renders during price updates.
 */
const WatchlistItems = ({
  items,
  getPrice,
  onSymbolClick,
  onQuickTrade,
  onRemoveSymbol,
  onAddSymbolClick,
}: WatchlistItemsProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="mb-2">No symbols in this watchlist</p>
        <Button variant="outline" size="sm" onClick={onAddSymbolClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Symbol
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-2">
        {items.map((item) => {
          const priceData = getPrice(item.symbol);
          return (
            <WatchlistRow
              key={item.id}
              id={item.id}
              symbol={item.symbol}
              priceData={priceData}
              onSymbolClick={onSymbolClick}
              onQuickTrade={onQuickTrade}
              onRemove={(e) => onRemoveSymbol(item.id, e)}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default WatchlistItems;
