// Browser-facing Supabase client wrapper
// Avoids hard failure if environment variables are not injected at runtime
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Fallback values come from the managed Lovable Cloud configuration
// These are publishable (anon) keys and safe for client-side usage
const FALLBACK_URL = 'https://oaegicsinxhpilsihjxv.supabase.co';
const FALLBACK_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZWdpY3NpbnhocGlsc2loanh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDQxMTgsImV4cCI6MjA3NzkyMDExOH0.mnOyTKuVlVFMW3CrsI4bSccAq1F8eTSmM1IFHsP3ItU';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || FALLBACK_URL;
const SUPABASE_PUBLISHABLE_KEY = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  },
});