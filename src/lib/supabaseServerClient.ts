import type { Database } from '@/integrations/supabase/types';
import { createClient } from '@supabase/supabase-js';

// Removed unused function getServerEnvVar

const getServerEnvVarWithFallback = (keys: string[]): string => {
  for (const key of keys) {
    if (typeof process !== 'undefined' && process.env[key]) {
      return process.env[key] as string;
    }
    const v = (import.meta.env as Record<string, string | undefined>)[key];
    if (v) return v;
  }
  throw new Error(
    `Missing required server environment variable: ${keys.join(' or ')}`
  );
};

const SUPABASE_URL = getServerEnvVarWithFallback([
  'SUPABASE_URL',
  'VITE_SUPABASE_URL',
]);
const SUPABASE_SERVICE_ROLE_KEY = getServerEnvVarWithFallback([
  'SUPABASE_SERVICE_ROLE_KEY',
]);

export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
    global: {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  }
);
