// Type declarations for Deno-specific modules used in edge functions

// Deno standard library HTTP server types
declare module 'https://deno.land/std@0.208.0/http/server.ts' {
  export interface Request {
    method: string;
    headers: Headers;
    url: string;
    json(): Promise<any>;
  }

  export interface Response {
    status: number;
    headers: Headers;
    body?: string | Uint8Array | ReadableStream<Uint8Array> | null;
  }

  export interface Headers {
    get(name: string): string | null;
    set(name: string, value: string): void;
  }

  export function serve(
    handler: (req: Request) => Response | Promise<Response>
  ): void;
}

// Supabase client types for Deno
declare module 'https://esm.sh/@supabase/supabase-js@2.89.0' {
  export interface SupabaseClient {
    from<T = any>(table: string): PostgrestQueryBuilder<T>;
    auth: {
      getUser(
        token?: string
      ): Promise<{ data: { user: any } | null; error: any }>;
    };
    rpc<T = any>(
      fn: string,
      params?: Record<string, any>
    ): Promise<{ data: T | null; error: any }>;
  }

  export interface PostgrestQueryBuilder<T> {
    select(
      columns?: string,
      options?: { count?: 'exact' | 'planned' | 'estimated' }
    ): PostgrestQueryBuilder<T>;
    eq(column: string, value: any): PostgrestQueryBuilder<T>;
    maybeSingle(): Promise<{ data: T | null; error: any }>;
    single(): Promise<{ data: T; error: any }>;
    insert(data: any): PostgrestQueryBuilder<T>;
    update(data: any): PostgrestQueryBuilder<T>;
    head(): Promise<{ data: null; error: any; count?: number }>;
    then(
      onfulfilled?: (value: any) => any,
      onrejected?: (reason: any) => any
    ): Promise<any>;
  }

  export function createClient(
    supabaseUrl: string,
    supabaseKey: string
  ): SupabaseClient;
}

// Global fetch API for Deno
declare function fetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response>;

// Global crypto API for Deno
declare var crypto: {
  randomUUID(): string;
};

// Web Crypto API types
interface Crypto {
  randomUUID(): string;
}
