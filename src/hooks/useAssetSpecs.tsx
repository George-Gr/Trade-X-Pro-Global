import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseBrowserClient';

export interface AssetSpec {
  symbol: string;
  asset_class: string;
  min_quantity: number;
  max_quantity: number;
  leverage: number; // Fixed broker-set leverage
  pip_size: number;
  base_commission: number;
  commission_type: 'per_lot' | 'percentage';
  is_tradable: boolean;
  created_at: string;
}

/**
 * Hook to fetch asset specifications from the database
 * Used to get fixed leverage and other parameters for a trading symbol
 */
export const useAssetSpecs = (symbol?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['asset-specs', symbol],
    queryFn: async () => {
      if (!symbol) return null;

      const { data: asset, error: err } = await supabase
        .from('asset_specs')
        .select('*')
        .eq('symbol', symbol)
        .eq('is_tradable', true)
        .maybeSingle();

      if (err) throw err;
      return asset as AssetSpec | null;
    },
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    assetSpec: data,
    isLoading,
    error,
    // Helper to get fixed leverage
    leverage: data?.leverage ?? 500, // Default max leverage if not found
  };
};
