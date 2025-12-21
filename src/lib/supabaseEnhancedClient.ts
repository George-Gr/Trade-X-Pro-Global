/**
 * Enhanced Supabase Client with Feature Flag Support
 *
 * This module provides a wrapper around the main Supabase client that
 * respects feature flags for safe rollout of PKCE authentication and
 * secure storage features.
 */

import type { Database } from '@/integrations/supabase/types';
import { featureFlags } from '@/lib/featureFlags';
import { logger } from '@/lib/logger';
import { SecureStorage } from '@/lib/secureStorage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

/**
 * Create Supabase client with feature flag support
 */
function createSupabaseClient(): SupabaseClient<Database> {
  const usePkceFlow = featureFlags.isPkceAuthFlowEnabled();
  const useSecureStorage = featureFlags.isSecureStorageEnabled();
  const useEnhancedHeaders = featureFlags.isEnhancedSecurityHeadersEnabled();

  logger.info('Creating Supabase client', {
    pkceFlow: usePkceFlow,
    secureStorage: useSecureStorage,
    enhancedHeaders: useEnhancedHeaders,
  } as Record<string, boolean>);

  // Initialize storage based on feature flags
  let storage: Storage | SecureStorage;

  if (useSecureStorage) {
    try {
      storage = new SecureStorage();
      logger.info('Using secure storage for authentication');
    } catch (error) {
      logger.error(
        'Failed to initialize secure storage, falling back to localStorage:',
        error
      );
      storage = localStorage;
    }
  } else {
    storage = localStorage;
    logger.info('Using localStorage for authentication');
  }

  // Configure auth options based on feature flags
  const authOptions: {
    storage: Storage | SecureStorage;
    persistSession: boolean;
    autoRefreshToken: boolean;
    debug: boolean;
    flowType?: 'implicit' | 'pkce';
    headers?: Record<string, string>;
  } = {
    storage: storage,
    persistSession: true,
    autoRefreshToken: true,
    debug: false,
  };

  if (usePkceFlow) {
    authOptions.flowType = 'pkce';
    logger.info('Using PKCE authentication flow');
  } else {
    authOptions.flowType = 'implicit';
    logger.info('Using implicit authentication flow');
  }

  // Global headers
  const globalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: authOptions,
    global: {
      headers: globalHeaders,
    },
  });
}

/**
 * Supabase client instance with feature flag support
 *
 * This client will automatically respect feature flags for:
 * - PKCE authentication flow (replaces implicit flow)
 * - Secure storage (encrypts sensitive data)
 * - Enhanced security headers
 *
 * @export
 * @type {SupabaseClient<Database>}
 */
export let supabase = createSupabaseClient();

/**
 * Force recreation of Supabase client with current feature flag settings
 *
 * Use this when feature flags are changed at runtime and you need to
 * recreate the client with the new settings. This function clears secure
 * storage keys and reassigns the exported supabase client to a new instance.
 */
export function recreateSupabaseClient(): void {
  logger.info('Recreating Supabase client with updated feature flags');

  // Clean up any existing secure storage instances if they exist
  if (typeof window !== 'undefined' && window.localStorage) {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith('secure_auth_')
    );
    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  // Recreate the client with current feature flags
  supabase = createSupabaseClient();
}
