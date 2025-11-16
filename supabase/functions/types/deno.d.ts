/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="webworker.imports" />

// Global Deno namespace declarations
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
    function set(key: string, value: string): void;
    function remove(key: string): boolean;
    function toObject(): Record<string, string>;
  }
}

// Global fetch function
declare function fetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response>;

// Global console object
declare const console: Console;

// Global crypto object
declare const crypto: Crypto;

// Global TextEncoder and TextDecoder
declare const TextEncoder: {
  new (encoding?: string): {
    encode(input?: string): Uint8Array;
    encoding: string;
  };
};

declare const TextDecoder: {
  new (encoding?: string, options?: { fatal?: boolean; ignoreBOM?: boolean }): {
    decode(input?: Uint8Array): string;
    encoding: string;
  };
};

// Global Response and Request types
declare class Response {
  constructor(body?: BodyInit | null, init?: ResponseInit);
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  readonly body: ReadableStream<Uint8Array> | null;
  readonly bodyUsed: boolean;
  clone(): Response;
  error(): Response;
  redirect(url: string | URL, status?: number): Response;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  json(): Promise<any>;
  text(): Promise<string>;
  static redirect(url: string | URL, status?: number): Response;
  static error(): Response;
}

declare class Request {
  constructor(input: RequestInfo, init?: RequestInit);
  readonly headers: Headers;
  readonly method: string;
  readonly url: string;
  readonly body: ReadableStream<Uint8Array> | null;
  readonly bodyUsed: boolean;
  readonly cache: RequestCache;
  readonly credentials: RequestCredentials;
  readonly destination: RequestDestination;
  readonly integrity: string;
  readonly keepAlive: boolean;
  readonly mode: RequestMode;
  readonly redirect: RequestRedirect;
  readonly referrer: string;
  readonly referrerPolicy: ReferrerPolicy;
  readonly signal: AbortSignal;
  clone(): Request;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  json(): Promise<any>;
  text(): Promise<string>;
}

declare type RequestInfo = Request | string;

interface RequestInit {
  method?: string;
  keepalive?: boolean;
  signal?: AbortSignal | null;
  body?: BodyInit | null;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  integrity?: string;
  keepalive?: boolean;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  window?: any;
  headers?: HeadersInit;
}

interface ResponseInit {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
}

// Ambient type declarations for remote imports
declare module "https://deno.land/std@0.208.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.79.0" {
  export function createClient(supabaseUrl: string, supabaseKey: string): {
    from(table: string): {
      select(columns?: string): {
        eq(column: string, value: any): any;
        single(): Promise<{ data: any; error: any }>;
        order(column: string, options?: { ascending?: boolean }): any;
      };
      insert(data: any): {
        eq(column: string, value: any): any;
      };
      update(data: any): {
        eq(column: string, value: any): Promise<{ error: any }>;
      };
      delete(): {
        eq(column: string, value: any): Promise<{ error: any }>;
      };
    };
    auth: {
      getUser(token: string): Promise<{ data: { user: any }; error: any }>;
    };
    functions: {
      invoke(name: string, options?: { body: any }): Promise<{ data: any; error: any }>;
    };
  };
}

declare module "https://deno.land/x/zod@v3.22.4/mod.ts" {
  export interface z {
    object<T extends Record<string, any>>(shape: {
      [K in keyof T]: z.Schema<T[K]>;
    }): z.Schema<T>;
    string(): z.Schema<string>;
    number(): z.Schema<number>;
    boolean(): z.Schema<boolean>;
    uuid(): z.Schema<string>;
    enum<T extends readonly string[]>(values: T): z.Schema<T[number]>;
    optional<T>(schema: z.Schema<T>): z.Schema<T | undefined>;
  }
  
  export namespace z {
    export interface Schema<T> {
      safeParse(data: any): { success: boolean; data?: T; error?: any };
    }
  }
  
  const zExports: z;
  export default zExports;
  export = zExports;
}