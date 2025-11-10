-- Create watchlists table for custom user watchlists
CREATE TABLE public.watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create watchlist_items table for symbols in each watchlist
CREATE TABLE public.watchlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(watchlist_id, symbol)
);

-- Enable Row Level Security
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for watchlists
CREATE POLICY "Users can view own watchlists"
  ON public.watchlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own watchlists"
  ON public.watchlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlists"
  ON public.watchlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists"
  ON public.watchlists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for watchlist_items
CREATE POLICY "Users can view own watchlist items"
  ON public.watchlist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.watchlists
      WHERE watchlists.id = watchlist_items.watchlist_id
      AND watchlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own watchlist items"
  ON public.watchlist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.watchlists
      WHERE watchlists.id = watchlist_items.watchlist_id
      AND watchlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own watchlist items"
  ON public.watchlist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.watchlists
      WHERE watchlists.id = watchlist_items.watchlist_id
      AND watchlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own watchlist items"
  ON public.watchlist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.watchlists
      WHERE watchlists.id = watchlist_items.watchlist_id
      AND watchlists.user_id = auth.uid()
    )
  );

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_watchlists_updated_at
  BEFORE UPDATE ON public.watchlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX idx_watchlist_items_watchlist_id ON public.watchlist_items(watchlist_id);
CREATE INDEX idx_watchlist_items_symbol ON public.watchlist_items(symbol);