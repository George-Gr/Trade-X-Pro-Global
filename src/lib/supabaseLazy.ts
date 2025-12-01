// Lazy-load Supabase client to avoid bundling it into the initial entry.
// Returns a cached Supabase client instance stored on globalThis.
import type { Database } from '@/integrations/supabase/types';
import type { SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://oaegicsinxhpilsihjxv.supabase.co';
const FALLBACK_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZWdpY3NpbnhocGlsc2loanh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDQxMTgsImV4cCI6MjA3NzkyMDExOH0.mnOyTKuVlVFMW3CrsI4bSccAq1F8eTSmM1IFHsP3ItU';

const _env = (import.meta as unknown as { env: { VITE_SUPABASE_URL?: string; VITE_SUPABASE_PUBLISHABLE_KEY?: string } }).env;
const SUPABASE_URL = (_env?.VITE_SUPABASE_URL as string) || FALLBACK_URL;
const SUPABASE_PUBLISHABLE_KEY = (_env?.VITE_SUPABASE_PUBLISHABLE_KEY as string) || FALLBACK_PUBLISHABLE_KEY;

export async function getSupabase(): Promise<SupabaseClient<Database>> {
    const g = globalThis as unknown as { __supabaseClient?: SupabaseClient<Database> };
    if (g.__supabaseClient) return g.__supabaseClient;

    const mod = await import('@supabase/supabase-js');
    const { createClient } = mod;
    const client = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
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

    g.__supabaseClient = client;
    return client;
}
