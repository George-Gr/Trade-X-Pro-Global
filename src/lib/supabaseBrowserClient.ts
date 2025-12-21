// Browser-facing Supabase client wrapper
// Strict environment validation - no fallback credentials for security
// Note: The anon key is a PUBLISHABLE key (like Stripe's publishable key) - designed to be public
// Security is enforced via Row Level Security (RLS) policies, not by hiding this key

import type { Database } from '@/integrations/supabase/types';
import { SecureStorage } from '@/lib/secureStorage';
import { createClient } from '@supabase/supabase-js';

/**
 * Get required environment variable with validation
 * Throws error if variable is missing to prevent fallback credentials
 */
const getRequiredEnvVar = (key: string): string => {
  const value = (import.meta.env as Record<string, string>)?.[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        'Please ensure .env.local is properly configured with your Supabase credentials.'
    );
  }
  return value;
};

/**
 * Validate Supabase URL format
 */
const validateSupabaseUrl = (url: string): void => {
  try {
    const urlObj = new URL(url);

    // Skip validation in development or for localhost URLs
    if (
      import.meta.env?.DEV ||
      urlObj.hostname === 'localhost' ||
      urlObj.hostname === '127.0.0.1' ||
      urlObj.hostname === '::1'
    ) {
      return;
    }

    if (
      !urlObj.hostname.endsWith('.supabase.co') &&
      !urlObj.hostname.endsWith('.supabase.in')
    ) {
      throw new Error(
        'Invalid Supabase URL format. Must be a valid Supabase project URL.'
      );
    }
  } catch (error) {
    throw new Error(
      `Invalid Supabase URL: ${url}. ${
        error instanceof Error ? error.message : ''
      }`
    );
  }
};

const SUPABASE_URL = getRequiredEnvVar('VITE_SUPABASE_URL');
const SUPABASE_PUBLISHABLE_KEY = getRequiredEnvVar(
  'VITE_SUPABASE_PUBLISHABLE_KEY'
);

// Validate configuration
validateSupabaseUrl(SUPABASE_URL);

// Initialize secure storage for enhanced security
const secureStorage = new SecureStorage();

/**
 * Supabase client instance for browser usage with PKCE flow and secure storage.
 * Replaces implicit flow with PKCE for enhanced security and uses encrypted
 * storage instead of plain localStorage.
 *
 * @export
 * @type {SupabaseClient<Database>}
 */
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: secureStorage,
      persistSession: true,
      autoRefreshToken: true,
      // Use PKCE flow for enhanced security (replaces implicit flow)
      flowType: 'pkce',
      // Disable debug mode in production
      debug: false,
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
  }
);
