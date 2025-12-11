// Browser-facing Supabase client wrapper
// Re-exports the main client for backward compatibility
// The anon key is a PUBLISHABLE key (like Stripe's publishable key) - it's designed to be public
// Security is enforced via Row Level Security (RLS) policies, not by hiding this key

export { supabase } from '@/integrations/supabase/client';
