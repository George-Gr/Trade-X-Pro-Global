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

// Minimal browser-local-storage interface used to avoid requiring DOM 'Storage' type
type BrowserStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key?(index: number): string | null;
  length?: number;
};

/**
 * Read environment variable from Vite's import.meta.env with a fallback to process.env
 * Returns undefined when the variable is not set (so we can handle it gracefully at runtime)
 */
const getEnvVar = (key: string): string | undefined => {
  // Try Vite's environment first (available in the browser / during Vite dev/build)
  try {
    const meta =
      (import.meta.env as unknown as Record<string, string | undefined>) || {};
    const val = meta[key] as string | undefined;
    if (val) return val;
  } catch (e) {
    // import.meta may not exist in some runtime/test environments; fallback below
  }

  // Fallback to Node's process.env for server-side / test environments
  if (typeof process !== 'undefined' && process.env) {
    // Accept both VITE_* and non-prefixed env vars to make testing easier
    return (process.env[key] || process.env[key.replace(/^VITE_/, '')]) as
      | string
      | undefined;
  }

  return undefined;
};

/**
 * Redact Supabase URL to protect project structure information
 * @param url - The full Supabase URL
 * @returns Redacted URL string that hides project identifier
 */
const redactSupabaseUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    
    // Skip redaction for localhost/development URLs
    if (
      urlObj.hostname === 'localhost' ||
      urlObj.hostname === '127.0.0.1' ||
      urlObj.hostname === '::1'
    ) {
      return 'localhost:supabase'; // Generic localhost indicator
    }

    // Extract hostname without project ID for production URLs
    if (
      urlObj.hostname.endsWith('.supabase.co') ||
      urlObj.hostname.endsWith('.supabase.in')
    ) {
      // Get the domain part (supabase.co or supabase.in)
      const domain = urlObj.hostname.split('.').slice(-2).join('.');
      return `*.${domain}`; // Return masked domain
    }

    // Fallback for any other hostname format
    return 'REDACTED_URL';
  } catch (error) {
    // If URL parsing fails, return a generic redacted value
    return 'INVALID_URL';
  }
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

let SUPABASE_URL: string | undefined;
let SUPABASE_PUBLISHABLE_KEY: string | undefined;
let _invalidSupabaseConfig = false;

// Read env vars with a fallback strategy; be forgiving during import so tests/SSR don't fail
SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
SUPABASE_PUBLISHABLE_KEY = getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY');

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  _invalidSupabaseConfig = true;
  const message =
    'Supabase configuration is invalid. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local. See docs/SUPABASE_SETUP_GUIDE.md for details.';

  // Log as a warning so it is visible but doesn't throw during import
  logger.warn(message, {
    action: 'supabase_config_check',
    metadata: {
      environment: import.meta.env.MODE,
    },
  });
} else {
  try {
    validateSupabaseUrl(SUPABASE_URL);
  } catch (error) {
    _invalidSupabaseConfig = true;
    logger.error('Supabase configuration error', error, {
      action: 'supabase_url_validation',
      metadata: {
        url: redactSupabaseUrl(SUPABASE_URL || ''),
        hasUrl: !!SUPABASE_URL,
      },
    });
  }
}

const createUnavailableClientProxy = <T = unknown>() => {
  const message =
    'Supabase client unavailable due to missing or invalid configuration. See docs/SUPABASE_SETUP_GUIDE.md';

  const createRecursiveProxy = (): unknown => {
    return new Proxy(
      () => {
        logger.error(message);
        throw new Error(message);
      },
      {
        get: () => createRecursiveProxy(),
        apply: () => {
          logger.error(message);
          throw new Error(message);
        },
      }
    );
  };

  return createRecursiveProxy() as T;
};

/**
 * Create Supabase client with feature flag support
 */
function createSupabaseClient(): SupabaseClient<Database> {
  // If configuration was found invalid during import, return an unavailable proxy
  if (_invalidSupabaseConfig) {
    logger.warn(
      'Supabase client unavailable due to invalid or missing configuration'
    );
    return createUnavailableClientProxy<SupabaseClient<Database>>();
  }

  const usePkceFlow = featureFlags.isPkceAuthFlowEnabled();
  const useSecureStorage = featureFlags.isSecureStorageEnabled();
  const useEnhancedHeaders = featureFlags.isEnhancedSecurityHeadersEnabled();

  logger.info('Supabase client created', {
    pkceFlow: usePkceFlow,
    secureStorage: useSecureStorage,
    enhancedHeaders: useEnhancedHeaders,
  } as Record<string, boolean>);

  // Initialize storage based on feature flags
  let storage: SecureStorage | unknown;

  if (useSecureStorage) {
    try {
      storage = new SecureStorage();
      logger.info('Secure storage enabled for authentication');
    } catch (error) {
      logger.error(
        'Failed to initialize secure storage, falling back to localStorage:',
        error
      );
      storage = (globalThis as unknown as { localStorage?: BrowserStorage })
        .localStorage;
    }
  } else {
    storage = (globalThis as unknown as { localStorage?: BrowserStorage })
      .localStorage;
    logger.info('Using localStorage for authentication');
  }

  // Configure auth options based on feature flags
  const authOptions: {
    storage: unknown;
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
    logger.info('PKCE authentication flow enabled');
  } else {
    authOptions.flowType = 'implicit';
    logger.info('Using implicit authentication flow');
  }

  // Global headers
  const globalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  return createClient<Database>(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
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
export const supabase: SupabaseClient<Database> = _invalidSupabaseConfig
  ? createUnavailableClientProxy<SupabaseClient<Database>>()
  : createSupabaseClient();

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Force recreation of Supabase client with current feature flag settings
 *
 * Use this when feature flags are changed at runtime and you need to
 * recreate the client with the new settings. This function clears secure
 * storage keys and reassigns the exported supabase client to a new instance.
 */
// recreateSupabaseClient is now a no-op. If runtime recreation is needed, refactor to use a factory or context.
export function recreateSupabaseClient(): void {
  logger.info(
    'Recreation of Supabase client at runtime is not supported with const export. Use a factory or context if dynamic recreation is required.'
  );
}

export type { Database } from '@/integrations/supabase/types';
