/**
 * AssetSearchDialog Component
 * 
 * Purpose: Full-text search and filtering dialog for assets from asset_specs table
 * Features:
 * - Real-time search with 500ms debounce
 * - Filters: asset class, country, liquidity tier
 * - Favorites/watchlist functionality
 * - Displays leverage, spreads, and commission per asset
 * 
 * TASK 2.1: Asset Specs Population & Trading Expansion
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Search, X, Star, TrendingUp, Filter } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AssetSpec {
  id: string;
  symbol: string;
  name: string;
  asset_class: string;
  country?: string;
  min_quantity: number;
  max_quantity: number;
  leverage: number;
  spread: number;
  commission: number;
  is_tradable: boolean;
  liquidity_tier?: 'premium' | 'standard' | 'low';
  created_at?: string;
}

interface AssetSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAsset: (asset: AssetSpec) => void;
}

const ASSET_CLASSES = ['Forex', 'Stock', 'Index', 'Commodity', 'Crypto', 'ETF', 'Bond'];
const LIQUIDITY_TIERS = ['Premium', 'Standard', 'Low'];

export function AssetSearchDialog({
  open,
  onOpenChange,
  onSelectAsset,
}: AssetSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedLiquidity, setSelectedLiquidity] = useState<string>('');
  const [assets, setAssets] = useState<AssetSpec[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<AssetSpec[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('favoriteAssets') || '[]'))
  );
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Initialize Supabase client
  const supabase = useMemo(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.error('Missing Supabase credentials');
      return null;
    }
    return createClient(url, key);
  }, []);

  // Fetch assets from database
  useEffect(() => {
    if (!open || !supabase) return;

    const fetchAssets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('asset_specs')
          .select('*')
          .eq('is_tradable', true)
          .order('symbol', { ascending: true });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        setAssets(data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assets';
        setError(errorMessage);
        console.error('Error fetching assets:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [open, supabase]);

  // Filter assets based on search and filters
  const filterAssets = useCallback(
    (query: string, assetClass: string, liquidity: string) => {
      let filtered = [...assets];

      // Text search on symbol, name, country
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter(
          (asset) =>
            asset.symbol.toLowerCase().includes(lowerQuery) ||
            asset.name?.toLowerCase().includes(lowerQuery) ||
            asset.country?.toLowerCase().includes(lowerQuery)
        );
      }

      // Asset class filter
      if (assetClass) {
        filtered = filtered.filter(
          (asset) => asset.asset_class.toLowerCase() === assetClass.toLowerCase()
        );
      }

      // Liquidity filter
      if (liquidity) {
        filtered = filtered.filter(
          (asset) => asset.liquidity_tier?.toLowerCase() === liquidity.toLowerCase()
        );
      }

      // Sort: favorites first, then by symbol
      filtered.sort((a, b) => {
        const aFav = favorites.has(a.symbol) ? 0 : 1;
        const bFav = favorites.has(b.symbol) ? 0 : 1;
        if (aFav !== bFav) return aFav - bFav;
        return a.symbol.localeCompare(b.symbol);
      });

      setFilteredAssets(filtered);
    },
    [assets, favorites]
  );

  // Debounced search and filter
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer (500ms debounce)
    debounceTimerRef.current = setTimeout(() => {
      filterAssets(query, selectedClass, selectedLiquidity);
    }, 500);
  }, [selectedClass, selectedLiquidity, filterAssets]);

  // Apply filters when they change
  useEffect(() => {
    filterAssets(searchQuery, selectedClass, selectedLiquidity);
  }, [searchQuery, selectedClass, selectedLiquidity, filterAssets]);

  // Toggle favorite
  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(symbol)) {
      newFavorites.delete(symbol);
    } else {
      newFavorites.add(symbol);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoriteAssets', JSON.stringify(Array.from(newFavorites)));
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClass('');
    setSelectedLiquidity('');
  };

  // Handle asset selection
  const handleSelectAsset = (asset: AssetSpec) => {
    onSelectAsset(asset);
    onOpenChange(false);
  };

  // Auto-focus search input when dialog opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search & Filter Assets</DialogTitle>
          <DialogDescription>
            Find and select from {assets.length} premium trading assets
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search by symbol, name, or country..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-3"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Filters */}
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Asset Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              {ASSET_CLASSES.map((cls) => (
                <SelectItem key={cls} value={cls.toLowerCase()}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLiquidity} onValueChange={setSelectedLiquidity}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Liquidity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tiers</SelectItem>
              {LIQUIDITY_TIERS.map((tier) => (
                <SelectItem key={tier} value={tier.toLowerCase()}>
                  {tier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchQuery || selectedClass || selectedLiquidity) && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive-foreground px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                {assets.length === 0 ? 'No assets available' : 'No results found'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset)}
                  className="w-full p-3 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Symbol and Name */}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{asset.symbol}</span>
                        <span className="text-sm text-muted-foreground">
                          {asset.name}
                        </span>
                        <button
                          onClick={(e) => toggleFavorite(asset.symbol, e)}
                          className="ml-auto"
                        >
                          <Star
                            className={`h-4 w-4 transition-colors ${
                              favorites.has(asset.symbol)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground hover:text-yellow-400'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Asset Details */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="capitalize">
                          {asset.asset_class}
                        </Badge>
                        <Badge variant="secondary">
                          Leverage: 1:{asset.leverage}
                        </Badge>
                        <Badge variant="secondary">
                          Spread: {asset.spread.toFixed(4)}
                        </Badge>
                        <Badge variant="secondary">
                          Comm: {asset.commission.toFixed(2)}%
                        </Badge>
                        {asset.liquidity_tier && (
                          <Badge variant="outline" className="capitalize">
                            {asset.liquidity_tier}
                          </Badge>
                        )}
                        {asset.country && (
                          <Badge variant="outline">
                            {asset.country}
                          </Badge>
                        )}
                      </div>

                      {/* Quantity Range */}
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span>Min qty: {asset.min_quantity} | Max qty: {asset.max_quantity}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-green-500 opacity-50" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground text-center py-2 border-t">
          Showing {filteredAssets.length} of {assets.length} assets
        </div>
      </DialogContent>
    </Dialog>
  );
}
