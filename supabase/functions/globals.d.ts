// Minimal ambient declarations to satisfy the TypeScript server in the editor.
// These are intentionally small and only cover what the functions in this folder use.

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

declare function serve(handler: (req: Request) => Promise<Response> | Response): void;

declare class Request {
  readonly method: string;
  readonly headers: Headers;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json(): Promise<any>;
  formData(): Promise<FormData>;
}

declare class Response {
  constructor(body?: BodyInit | null, init?: ResponseInit);
}

declare class File {
  readonly name: string;
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
}

declare const console: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(...args: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...args: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(...args: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(...args: any[]): void;
};

// Ambient module declarations for remote imports used in this workspace
declare module "https://deno.land/std@0.208.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.79.0" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function createClient(url: string, key: string): any;
  export default { createClient };
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function createClient(url: string, key: string): any;
  export default { createClient };
}

declare module "https://deno.land/x/zod@v3.22.4/mod.ts" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const z: any;
  export default z;
}

// Fallback for other exact URL import variants
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module "https://esm.sh/@supabase/supabase-js@2.79.0/*" { const _a: any; export default _a; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module "https://deno.land/x/zod@v3.22.4/*" { const _b: any; export default _b; }
