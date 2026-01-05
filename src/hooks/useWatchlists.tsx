import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { QuerySchemas, validateQueryParam } from '@/lib/queryValidation';
import { useCallback, useEffect, useState } from 'react';

interface Watchlist {
  id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

interface WatchlistItem {
  id: string;
  watchlist_id: string;
  symbol: string;
  order_index: number;
}

export const useWatchlists = () => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<
    Record<string, WatchlistItem[]>
  >({});
  const [activeWatchlistId, setActiveWatchlistId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWatchlists = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lists, error } = await supabase
        .from('watchlists')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (lists && lists.length > 0) {
        setWatchlists(lists);
        setActiveWatchlistId(lists[0].id);
      } else {
        // Create default watchlist if none exists
        const { data: newList, error: createError } = await supabase
          .from('watchlists')
          .insert({ name: 'My Watchlist', is_default: true, user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        if (newList) {
          setWatchlists([newList]);
          setActiveWatchlistId(newList.id);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error loading watchlists',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchWatchlistItems = useCallback(
    async (watchlistId: string) => {
      try {
        // Validate watchlist ID to prevent injection
        const validatedId = validateQueryParam(
          QuerySchemas.uuid,
          watchlistId,
          'watchlistId'
        );

        const { data, error } = await supabase
          .from('watchlist_items')
          .select('*')
          .eq('watchlist_id', validatedId)
          .order('order_index', { ascending: true });

        if (error) throw error;

        setWatchlistItems((prev) => ({
          ...prev,
          [watchlistId]: data || [],
        }));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        toast({
          title: 'Error loading watchlist items',
          description: message,
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  const createWatchlist = async (name: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate watchlist name to prevent injection
      const validatedName = validateQueryParam(
        QuerySchemas.watchlistName,
        name,
        'name'
      );

      const { data, error } = await supabase
        .from('watchlists')
        .insert({ name: validatedName, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setWatchlists((prev) => [...prev, data]);
      toast({
        title: 'Watchlist created',
        description: `"${name}" has been created successfully.`,
      });

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error creating watchlist',
        description: message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteWatchlist = async (id: string) => {
    try {
      // Validate ID to prevent injection
      const validatedId = validateQueryParam(QuerySchemas.uuid, id, 'id');

      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', validatedId);

      if (error) throw error;

      setWatchlists((prev) => prev.filter((w) => w.id !== validatedId));
      if (activeWatchlistId === validatedId) {
        const remaining = watchlists.filter((w) => w.id !== validatedId);
        setActiveWatchlistId(remaining[0]?.id || null);
      }

      toast({
        title: 'Watchlist deleted',
        description: 'Watchlist has been removed successfully.',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error deleting watchlist',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const addSymbolToWatchlist = async (watchlistId: string, symbol: string) => {
    try {
      // Validate inputs to prevent injection
      const validatedId = validateQueryParam(
        QuerySchemas.uuid,
        watchlistId,
        'watchlistId'
      );
      const validatedSymbol = validateQueryParam(
        QuerySchemas.symbol,
        symbol,
        'symbol'
      );

      const items = watchlistItems[validatedId] || [];
      const exists = items.find((item) => item.symbol === validatedSymbol);

      if (exists) {
        toast({
          title: 'Symbol already in watchlist',
          description: `${validatedSymbol} is already in this watchlist.`,
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('watchlist_items')
        .insert({
          watchlist_id: validatedId,
          symbol: validatedSymbol,
          order_index: items.length,
        })
        .select()
        .single();

      if (error) throw error;

      setWatchlistItems((prev) => ({
        ...prev,
        [watchlistId]: [...(prev[watchlistId] || []), data],
      }));

      toast({
        title: 'Symbol added',
        description: `${symbol} has been added to your watchlist.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error adding symbol',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const removeSymbolFromWatchlist = async (
    watchlistId: string,
    itemId: string
  ) => {
    try {
      // Validate IDs to prevent injection
      const validatedWatchlistId = validateQueryParam(
        QuerySchemas.uuid,
        watchlistId,
        'watchlistId'
      );
      const validatedItemId = validateQueryParam(
        QuerySchemas.uuid,
        itemId,
        'itemId'
      );

      const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('id', validatedItemId);

      if (error) throw error;

      setWatchlistItems((prev) => ({
        ...prev,
        [validatedWatchlistId]: (prev[validatedWatchlistId] || []).filter(
          (item) => item.id !== validatedItemId
        ),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Error removing symbol',
        description: message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  useEffect(() => {
    if (activeWatchlistId) {
      fetchWatchlistItems(activeWatchlistId);
    }
  }, [activeWatchlistId, fetchWatchlistItems]);

  return {
    watchlists,
    watchlistItems,
    activeWatchlistId,
    setActiveWatchlistId,
    isLoading,
    createWatchlist,
    deleteWatchlist,
    addSymbolToWatchlist,
    removeSymbolFromWatchlist,
    refetch: fetchWatchlists,
  };
};
