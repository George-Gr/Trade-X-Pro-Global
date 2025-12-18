// Browser-facing Supabase client wrapper
// Provides fallback values for the preview environment when env vars aren't injected
// Note: The anon key is a PUBLISHABLE key (like Stripe's publishable key) - designed to be public
// Security is enforced via Row Level Security (RLS) policies, not by hiding this key

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Fallback values for Lovable Cloud preview environment
const FALLBACK_URL = "https://oaegicsinxhpilsihjxv.supabase.co";
const FALLBACK_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZWdpY3NpbnhocGlsc2loanh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDQxMTgsImV4cCI6MjA3NzkyMDExOH0.mnOyTKuVlVFMW3CrsI4bSccAq1F8eTSmM1IFHsP3ItU";

const getEnvVar = (key: string): string | undefined => {
  try {
    return (import.meta.env as Record<string, string>)?.[key];
  } catch {
    return undefined;
  }
};

const SUPABASE_URL = getEnvVar("VITE_SUPABASE_URL") || FALLBACK_URL;
const SUPABASE_PUBLISHABLE_KEY =
  getEnvVar("VITE_SUPABASE_PUBLISHABLE_KEY") || FALLBACK_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      // Use 'implicit' flow to avoid lock contention issues
      flowType: "implicit",
      // Disable debug mode in production
      debug: false,
    },
    global: {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
  },
);
