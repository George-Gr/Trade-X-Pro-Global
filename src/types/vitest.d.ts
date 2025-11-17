declare module 'vitest' {
  import type { 
    Suite, 
    Test, 
    ExpectStatic, 
    Assertion,
    AsymmetricMatchersContaining,
    Vi
  } from 'vitest';

  export const describe: typeof Suite;
  export const it: typeof Test;
  export const expect: ExpectStatic;
  export const beforeAll: (fn: () => void | Promise<void>) => void;
  export const afterAll: (fn: () => void | Promise<void>) => void;
  export const beforeEach: (fn: () => void | Promise<void>) => void;
  export const afterEach: (fn: () => void | Promise<void>) => void;
  export const vi: typeof Vi;
}

