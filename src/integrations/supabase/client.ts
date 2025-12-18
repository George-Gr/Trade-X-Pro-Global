// Re-export the Supabase client from the single source of truth
// This ensures only ONE GoTrueClient instance is created in the entire application
export { supabase } from "@/lib/supabaseBrowserClient";
export type { Database } from "./types";
