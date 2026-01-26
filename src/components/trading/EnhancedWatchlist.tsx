import React, { useState, useEffect } from 'react';
import { usePriceStream } from '@/hooks/usePriceStream';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Star, TrendingUp, TrendingDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WatchlistItem {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  isFavorite: boolean;
}

interface EnhancedWatchlistProps {
  onSelectSymbol: (symbol: string) => void;
  onQuickTrade: (symbol: string, side: 'buy' | 'sell') => void;
}

const AVAILABLE_SYMBOLS: WatchlistItem[] = [
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', bid: 0.6543, ask: 0.6545, change: 0.0002, changePercent: 0.03, isFavorite: false },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', bid: 1.3456, ask: 1.3458, change: -0.0012, changePercent: -0.09, isFavorite: false },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', bid: 0.9234, ask: 0.9236, change: 0.0008, changePercent: 0.09, isFavorite: false },
  { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar', bid: 0.5987, ask: 0.5989, change: 0.0015, changePercent: 0.25, isFavorite: false },
  { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', bid: 2650.00, ask: 2660.00, change: 85.00, changePercent: 3.31, isFavorite: false },
];

const INITIAL_WATCHLIST: WatchlistItem[] = [
  {
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    bid: 1.0845,
    ask: 1.0847,
    change: 0.0012,
    changePercent: 0.11,
    isFavorite: true,
  },
  {
    symbol: 'GBPUSD',
    name: 'British Pound / US Dollar',
    bid: 1.2723,
    ask: 1.2725,
    change: -0.0021,
    changePercent: -0.16,
    isFavorite: false,
  },
  {
    symbol: 'USDJPY',
    name: 'US Dollar / Japanese Yen',
    bid: 147.85,
    ask: 147.87,
    change: 0.15,
    changePercent: 0.10,
    isFavorite: true,
  },
  {
    symbol: 'BTCUSD',
    name: 'Bitcoin / US Dollar',
    bid: 43250.00,
    ask: 43275.00,
    change: 1250.00,
    changePercent: 2.98,
    isFavorite: false,
  },
];

const EnhancedWatchlist: React.FC<EnhancedWatchlistProps> = ({ onSelectSymbol, onQuickTrade }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(INITIAL_WATCHLIST);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const symbols = useMemo(() => watchlist.map(item => item.symbol), [watchlist]);
  const { prices } = usePriceStream({ symbols });
  useEffect(() => {
    setWatchlist(prev => prev.map(item => {
      const priceData = prices.get(item.symbol);
      if (priceData) {
        return {
          ...item,
          bid: priceData.bid,
          ask: priceData.ask,
          change: priceData.change,
          changePercent: priceData.changePercent,
        };
      }
      return item;
    }));
  }, [prices]);

  const filteredWatchlist = watchlist.filter(item =>
    item.symbol.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const addToWatchlist = (symbol: string, name: string) => {
    if (!watchlist.find(item => item.symbol === symbol)) {
      setWatchlist([...watchlist, {
        symbol,
        name,
        bid: 0,
        ask: 0,
        change: 0,
        changePercent: 0,
        isFavorite: false,
      }]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(item => item.symbol !== symbol));
  };

  const toggleFavorite = (symbol: string) => {
    setWatchlist(watchlist.map(item =>
      item.symbol === symbol ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  return (
    <Card className="h-full border-0 rounded-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Watchlist
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-1 p-4 pt-0">
            {filteredWatchlist.map((item) => (
              <div
                key={item.symbol}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/50 cursor-pointer transition-colors group"
                onClick={() => onSelectSymbol(item.symbol)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.symbol);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          item.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                        )}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(item.symbol);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove from watchlist"
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                    </button>
                    <div>
                      <div className="font-medium text-sm">{item.symbol}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm font-mono">
                      <div>Bid: {item.bid.toFixed(item.symbol.includes('JPY') ? 2 : 4)}</div>
                      <div>Ask: {item.ask.toFixed(item.symbol.includes('JPY') ? 2 : 4)}</div>
                    </div>
                    <div className={cn(
                      "text-sm font-medium flex items-center gap-1",
                      item.change >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {item.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs px-2 bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickTrade(item.symbol, 'buy');
                    }}
                  >
                    Buy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs px-2 bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickTrade(item.symbol, 'sell');
                    }}
                  >
                    Sell
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredWatchlist.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No symbols found</p>
            </div>
          )}

          <div className="p-4 border-t border-border/50">
            <div className="text-xs font-medium text-muted-foreground mb-2">Add to Watchlist</div>
            <div className="flex flex-wrap gap-1">
              {AVAILABLE_SYMBOLS
                .filter((s) => !watchlist.find((w) => w.symbol === s.symbol))
                .slice(0, 6)
                .map((s) => (
                  <Button
                    key={s.symbol}
                    variant="outline"
                    size="sm"
                    onClick={() => addToWatchlist(s.symbol, s.name)}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    {s.symbol}
                  </Button>
                ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

/**
 * @component EnhancedWatchlist
 * A component for displaying and managing a trading watchlist.
 * @param {EnhancedWatchlistProps} props - The props for the component.
 */
export default EnhancedWatchlist;