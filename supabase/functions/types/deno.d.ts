// Deno runtime type definitions for Supabase Edge Functions
// This file provides type definitions for Deno globals and remote imports

/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// Deno namespace
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }

  export interface ServeOptions {
    port?: number;
    hostname?: string;
  }

  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: ServeOptions
  ): void;

  export const env: Env;
}

// HTTP Server types from std/http
declare module "https://deno.land/std@0.208.0/http/server.ts" {
  export interface ServeHandler {
    (req: Request): Response | Promise<Response>;
  }

  export function serve(
    handler: ServeHandler,
    options?: { port?: number; hostname?: string }
  ): void;
}

// Supabase client types
declare module "https://esm.sh/@supabase/supabase-js@2.79.0" {
  import type { SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';

  export { SupabaseClient, SupabaseClientOptions };
  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: SupabaseClientOptions<string>
  ): SupabaseClient;
}

// Zod types
declare module "https://deno.land/x/zod@v3.22.4/mod.ts" {
  import type { z } from 'zod';
  export = z;
}

// Resend types
declare module "npm:resend@2.0.0" {
  export interface EmailSendRequest {
    from: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
  }

  export interface EmailSendResponse {
    id: string;
  }

  export class Resend {
    constructor(apiKey: string);
    emails: {
      send: (request: EmailSendRequest) => Promise<EmailSendResponse>;
    };
  }
}

// Global fetch function (available in Deno)
declare function fetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response>;

// Global Request and Response types
declare class Request extends globalThis.Request {}
declare class Response extends globalThis.Response {}
declare class Headers extends globalThis.Headers {}
declare class URL extends globalThis.URL {}

// Console types
declare let console: {
  log(...data: unknown[]): void;
  error(...data: unknown[]): void;
  warn(...data: unknown[]): void;
  info(...data: unknown[]): void;
  debug(...data: unknown[]): void;
};

// Crypto types
declare let crypto: {
  randomUUID(): string;
};

// WindowOrWorkerGlobalScope types
interface WindowOrWorkerGlobalScope {
  fetch: typeof globalThis.fetch;
  Headers: typeof globalThis.Headers;
  Request: typeof globalThis.Request;
  Response: typeof globalThis.Response;
  URL: typeof globalThis.URL;
  crypto: typeof globalThis.crypto;
  console: typeof globalThis.console;
}

// Extend global scope with Deno
interface Window extends WindowOrWorkerGlobalScope {
  Deno: typeof Deno;
}

declare let self: Window & typeof globalThis;
declare let window: Window;
declare let global: Window & typeof globalThis;