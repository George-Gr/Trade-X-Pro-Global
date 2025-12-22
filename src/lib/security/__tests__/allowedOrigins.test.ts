/**
 * Test for allowedOrigins environment variable parsing
 */

import { APIOrderSecurity } from '../orderSecurity';

describe('Allowed Origins Environment Variable Parsing', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('should use fallback defaults when ALLOWED_ORIGINS is not set', () => {
    delete process.env.ALLOWED_ORIGINS;

    const security = new APIOrderSecurity();
    const config = security['config'];

    expect(config.allowedOrigins).toEqual([
      'http://localhost:3000',
      'http://localhost:5173',
    ]);
  });

  test('should parse comma-separated origins from environment variable', () => {
    process.env.ALLOWED_ORIGINS =
      'https://example.com,https://app.example.com,http://localhost:3000';

    const security = new APIOrderSecurity();
    const config = security['config'];

    expect(config.allowedOrigins).toEqual([
      'https://example.com',
      'https://app.example.com',
      'http://localhost:3000',
    ]);
  });

  test('should trim whitespace from origin entries', () => {
    process.env.ALLOWED_ORIGINS =
      ' https://example.com , https://app.example.com , http://localhost:3000 ';

    const security = new APIOrderSecurity();
    const config = security['config'];

    expect(config.allowedOrigins).toEqual([
      'https://example.com',
      'https://app.example.com',
      'http://localhost:3000',
    ]);
  });

  test('should filter out empty entries', () => {
    process.env.ALLOWED_ORIGINS =
      'https://example.com,,https://app.example.com,,http://localhost:3000,';

    const security = new APIOrderSecurity();
    const config = security['config'];

    expect(config.allowedOrigins).toEqual([
      'https://example.com',
      'https://app.example.com',
      'http://localhost:3000',
    ]);
  });

  test('should filter out invalid origin URLs', () => {
    process.env.ALLOWED_ORIGINS =
      'https://example.com,invalid-url,https://app.example.com,http://localhost:3000';

    const security = new APIOrderSecurity();
    const config = security['config'];

    expect(config.allowedOrigins).toEqual([
      'https://example.com',
      'https://app.example.com',
      'http://localhost:3000',
    ]);
  });

  test('should handle single origin', () => {
    process.env.ALLOWED_ORIGINS = 'https://example.com';

    const security = new APIOrderSecurity();
    const config = security['config'];

    expect(config.allowedOrigins).toEqual(['https://example.com']);
  });

  test('should handle empty string and fall back to defaults', () => {
    process.env.ALLOWED_ORIGINS = '';

    const security = new APIOrderSecurity();
    const config = security['config'];

    expect(config.allowedOrigins).toEqual([
      'http://localhost:3000',
      'http://localhost:5173',
    ]);
  });

  test('should handle only whitespace and fall back to defaults', () => {
    process.env.ALLOWED_ORIGINS = '   ';

    const security = new APIOrderSecurity();
    const config = security['config'];

    expect(config.allowedOrigins).toEqual([
      'http://localhost:3000',
      'http://localhost:5173',
    ]);
  });
});
