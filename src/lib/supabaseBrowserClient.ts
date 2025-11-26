import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Browser-side Supabase client with safe fallbacks.
// Uses environment variables when available, otherwise falls back to the
// known public project URL and anon key configured for this app.

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://oaegicsinxhpilsihjxv.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZWdpY3NpbnhocGlsc2loanh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDQxMTgsImV4cCI6MjA3NzkyMDExOH0.mnOyTKuVlVFMW3CrsI4bSccAq1F8eTSmM1IFHsP3ItU';

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error(
    '[Supabase] URL or public key is missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.',
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
});
