import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseBrowserClient";
import { useAuth } from "./useAuth";
import type { Position } from "@/integrations/supabase/types/tables";

interface ProfileData {
  balance: number;
  equity: number;
  margin_used: number;
  free_margin: number;
  margin_level: number;
}

interface PositionWithPnL extends Position {
  unrealized_pnl: number;
  asset_class?: string;
  trailing_stop_enabled?: boolean;
  trailing_stop_distance?: number | null;
  trailing_stop_price?: number | null;
  highest_price?: number | null;
  lowest_price?: number | null;
  entry_price: number; // Added to align with PnLPosition
  current_price: number; // Added to align with PnLPosition
}

export const usePortfolioData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [positions, setPositions] = useState<PositionWithPnL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolioData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("balance, equity, margin_used, free_margin, margin_level")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch open positions
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "open")
        .order("opened_at", { ascending: false });

      if (positionsError) throw positionsError;

      setProfile(profileData);
      setPositions(positionsData || []);
      setError(null);
    } catch (err) {
      // Error fetching portfolio data
      setError(err instanceof Error ? err.message : "Failed to fetch portfolio data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPortfolioData();

    // Set up real-time subscription for positions
    const positionsChannel = supabase
      .channel("positions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "positions",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchPortfolioData();
        }
      )
  .subscribe();

    // Set up real-time subscription for profile updates
    const profileChannel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user?.id}`,
        },
        () => {
          fetchPortfolioData();
        }
      )
  .subscribe();

    return () => {
      // Properly unsubscribe from channels before removing to prevent memory leaks
      positionsChannel.unsubscribe();
      profileChannel.unsubscribe();
      supabase.removeChannel(positionsChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [user, fetchPortfolioData]);

  const calculateUnrealizedPnL = useCallback((position: Position, currentPrice: number): number => {
    const contractSize = 100000;
    const priceDiff = position.side === "buy"
      ? currentPrice - position.entry_price
      : position.entry_price - currentPrice;

    return priceDiff * position.quantity * contractSize;
  }, []);

  const updatePositionPrices = useCallback((pricesMap: Map<string, { currentPrice: number }>) => {
    setPositions((prevPositions) =>
      prevPositions.map((position) => {
        const priceData = pricesMap.get(position.symbol);
        if (priceData) {
          const unrealized_pnl = calculateUnrealizedPnL(position, priceData.currentPrice);
          return { ...position, current_price: priceData.currentPrice, unrealized_pnl };
        }
        return position;
      })
    );
  }, [calculateUnrealizedPnL]);

  const getTotalUnrealizedPnL = (): number => {
    return positions.reduce((sum, pos) => sum + (pos.unrealized_pnl || 0), 0);
  };

  const calculateEquity = (): number => {
    if (!profile) return 0;
    return profile.balance + getTotalUnrealizedPnL();
  };

  const calculateFreeMargin = (): number => {
    if (!profile) return 0;
    return calculateEquity() - profile.margin_used;
  };

  const calculateMarginLevel = (): number => {
    if (!profile || profile.margin_used === 0) return Infinity;
    return (calculateEquity() / profile.margin_used) * 100;
  };

  return {
    profile,
    positions,
    loading,
    error,
    updatePositionPrices,
    getTotalUnrealizedPnL,
    calculateEquity,
    calculateFreeMargin,
    calculateMarginLevel,
    refresh: fetchPortfolioData,
  };
};
