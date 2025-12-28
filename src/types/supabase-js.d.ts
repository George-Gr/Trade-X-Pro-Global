// Local ambient declaration to help TypeScript resolve the Supabase client types
// Some module resolution edge-cases prevent the built-in types from being discovered
// in certain environments (bundler moduleResolution, .d.cts exports). This file provides
// a lightweight fallback until the resolver can be upgraded.

declare module '@supabase/supabase-js' {
  // Ambient type definition for SupabaseClient to avoid circular dependency.
  // We define a minimal shape with the generic parameter as a fallback.
  export interface SupabaseClient<T = unknown> {
    [key: string]: any;
  }

  export function createClient<T = unknown>(
    url: string,
    key: string,
    opts?: unknown
  ): SupabaseClient<T>;

  // Enhanced types for authentication
  export interface User {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
    created_at?: string;
    updated_at?: string;
  }

  export interface Session {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at?: number;
    token_type: string;
    user: User;
  }

  export type AuthChangeEvent =
    | 'SIGNED_IN'
    | 'SIGNED_OUT'
    | 'TOKEN_REFRESHED'
    | 'USER_UPDATED';

  export interface AuthError {
    message: string;
    status?: number;
    name?: string;
  }

  export interface AuthResponse {
    data: {
      user: User | null;
      session: Session | null;
    } | null;
    error: AuthError | null;
  }

  // Realtime types
  export type RealtimeChannel = unknown;
  export type RealtimePostgresChangesPayload = unknown;
  export type RealtimeSubscription = unknown;

  export default createClient;
}
