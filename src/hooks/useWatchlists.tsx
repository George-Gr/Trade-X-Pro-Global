import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [watchlistItems, setWatchlistItems] = useState<Record<string, WatchlistItem[]>>({});
  const [activeWatchlistId, setActiveWatchlistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWatchlists = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lists, error } = await supabase
        .from("watchlists")
        .select("*")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (lists && lists.length > 0) {
        setWatchlists(lists);
        setActiveWatchlistId(lists[0].id);
      } else {
        // Create default watchlist if none exists
        const { data: newList, error: createError } = await supabase
          .from("watchlists")
          .insert({ name: "My Watchlist", is_default: true, user_id: user.id })
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
        title: "Error loading watchlists",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchWatchlistItems = useCallback(async (watchlistId: string) => {
    try {
      const { data, error } = await supabase
        .from("watchlist_items")
        .select("*")
        .eq("watchlist_id", watchlistId)
        .order("order_index", { ascending: true });

      if (error) throw error;

      setWatchlistItems((prev) => ({
        ...prev,
        [watchlistId]: data || [],
      }));
    } catch (error: any) {
      toast({
        title: "Error loading watchlist items",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const createWatchlist = async (name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("watchlists")
        .insert({ name, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setWatchlists((prev) => [...prev, data]);
      toast({
        title: "Watchlist created",
        description: `"${name}" has been created successfully.`,
      });

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error creating watchlist",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteWatchlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from("watchlists")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setWatchlists((prev) => prev.filter((w) => w.id !== id));
      if (activeWatchlistId === id) {
        const remaining = watchlists.filter((w) => w.id !== id);
        setActiveWatchlistId(remaining[0]?.id || null);
      }

      toast({
        title: "Watchlist deleted",
        description: "Watchlist has been removed successfully.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error deleting watchlist",
        description: message,
        variant: "destructive",
      });
    }
  };

  const addSymbolToWatchlist = async (watchlistId: string, symbol: string) => {
    try {
      const items = watchlistItems[watchlistId] || [];
      const exists = items.find((item) => item.symbol === symbol);

      if (exists) {
        toast({
          title: "Symbol already in watchlist",
          description: `${symbol} is already in this watchlist.`,
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("watchlist_items")
        .insert({
          watchlist_id: watchlistId,
          symbol,
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
        title: "Symbol added",
        description: `${symbol} has been added to your watchlist.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error adding symbol",
        description: message,
        variant: "destructive",
      });
    }
  };

  const removeSymbolFromWatchlist = async (watchlistId: string, itemId: string) => {
    try {
      const { error } = await supabase
        .from("watchlist_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setWatchlistItems((prev) => ({
        ...prev,
        [watchlistId]: (prev[watchlistId] || []).filter((item) => item.id !== itemId),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Error removing symbol",
        description: message,
        variant: "destructive",
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
