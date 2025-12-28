// Re-export the Supabase client from the single source of truth
// This ensures only ONE GoTrueClient instance is created in the entire application
export {
  supabase,
  type TypedSupabaseClient,
} from '@/lib/supabaseEnhancedClient';
export type { Database } from './types';
