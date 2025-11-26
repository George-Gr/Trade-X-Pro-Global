// This file re-exports the main Supabase client to maintain backward compatibility
// while avoiding multiple client instances that cause the GoTrueClient warning
import { supabase } from '@/integrations/supabase/client';

export { supabase };
