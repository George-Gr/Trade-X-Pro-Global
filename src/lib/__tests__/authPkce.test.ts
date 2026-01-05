/**
 * PKCE Authentication Flow Tests
 *
 * This test suite verifies the PKCE authentication implementation,
 * secure storage functionality, and feature flag behavior.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authMigration } from '../authMigration';
import { featureFlags } from '../featureFlags';
import { SecureStorage } from '../secureStorage';

// Mock crypto.subtle for testing
interface MockCryptoKey {
  type: string;
  extractable: boolean;
  algorithm: { name: string; length?: number };
}

interface MockCryptoSubtle {
  generateKey: typeof vi.fn & ((...args: unknown[]) => Promise<MockCryptoKey>);
  importKey: typeof vi.fn & ((...args: unknown[]) => Promise<MockCryptoKey>);
  exportKey: typeof vi.fn & ((...args: unknown[]) => Promise<ArrayBuffer>);
  deriveKey: typeof vi.fn & ((...args: unknown[]) => Promise<MockCryptoKey>);
  encrypt: typeof vi.fn & ((...args: unknown[]) => Promise<ArrayBuffer>);
  decrypt: typeof vi.fn &
    ((
      algorithm: { name: string; iv?: BufferSource; tagLength?: number },
      key: MockCryptoKey,
      data: BufferSource
    ) => Promise<ArrayBuffer>);
}

interface MockCrypto {
  subtle: MockCryptoSubtle;
  getRandomValues: (arr: Uint8Array) => Uint8Array;
}

const mockCrypto: MockCrypto = {
  subtle: {
    generateKey: vi.fn().mockResolvedValue({
      type: 'secret',
      extractable: true,
      algorithm: { name: 'PBKDF2' },
    }),
    importKey: vi.fn().mockResolvedValue({
      type: 'secret',
      extractable: true,
      algorithm: { name: 'PBKDF2' },
    }),
    exportKey: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    deriveKey: vi.fn().mockResolvedValue({
      type: 'secret',
      extractable: true,
      algorithm: { name: 'AES-GCM', length: 256 },
    }),
    encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    decrypt: vi
      .fn()
      .mockImplementation(
        (
          _algorithm: { name: string; iv?: BufferSource; tagLength?: number },
          _key: MockCryptoKey,
          _data: BufferSource
        ) => {
          // Return mock decrypted data based on the input
          return Promise.resolve(new ArrayBuffer(32));
        }
      ),
  },
  getRandomValues: vi.fn((arr: Uint8Array) => {
    // Return predictable values for testing
    for (let i = 0; i < arr.length; i++) {
      arr[i] = i % 256;
    }
    return arr;
  }) as (arr: Uint8Array) => Uint8Array,
};

Object.defineProperty(window, 'crypto', {
  value: mockCrypto,
});

describe('SecureStorage', () => {
  let storage: SecureStorage;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storage = new SecureStorage({ encryptionEnabled: true });
  });

  afterEach(() => {
    storage.destroy();
    localStorage.clear();
    // Reset all mocks to prevent state leakage between tests
    vi.resetAllMocks();
  });

  it('should encrypt sensitive data', async () => {
    const sensitiveKey = 'access_token';
    const sensitiveValue = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

    await storage.setItem(sensitiveKey, sensitiveValue);

    const stored = localStorage.getItem('secure_auth_access_token');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.data).toBeTruthy();
    expect(parsed.iv).toBeTruthy();
    expect(parsed.timestamp).toBeTruthy();
  });

  it('should store non-sensitive data as plain text', async () => {
    const nonSensitiveKey = 'some_config';
    const nonSensitiveValue = 'config_value';

    await storage.setItem(nonSensitiveKey, nonSensitiveValue);

    const stored = localStorage.getItem('secure_auth_some_config');
    expect(stored).toBe(JSON.stringify(nonSensitiveValue));
  });

  it('should retrieve encrypted data correctly', async () => {
    const sensitiveKey = 'refresh_token';
    const sensitiveValue = 'refresh_token_value_123';

    await storage.setItem(sensitiveKey, sensitiveValue);
    const retrieved = await storage.getItem(sensitiveKey);

    expect(retrieved).toBe(sensitiveValue);
  });

  it('should handle encryption failures gracefully', async () => {
    // Mock encryption to throw error using test-scoped spy
    const encryptSpy = vi
      .spyOn(mockCrypto.subtle, 'encrypt')
      .mockRejectedValue(new Error('Encryption failed'));

    const storageNoEncryption = new SecureStorage({ encryptionEnabled: false });

    const sensitiveKey = 'access_token';
    const sensitiveValue = 'token_value';

    // Should not throw and should store as plain text
    await expect(async () => {
      await storageNoEncryption.setItem(sensitiveKey, sensitiveValue);
    }).not.toThrow();

    const stored = localStorage.getItem('secure_auth_access_token');
    expect(stored).toBe(JSON.stringify(sensitiveValue));

    // Restore the spy after this test
    encryptSpy.mockRestore();
  });

  it('should remove items correctly', async () => {
    const key = 'test_key';
    const value = 'test_value';

    await storage.setItem(key, value);
    expect(await storage.getItem(key)).toBe(value);

    storage.removeItem(key);
    expect(await storage.getItem(key)).toBeNull();
  });

  it('should clear all items correctly', async () => {
    await storage.setItem('key1', 'value1');
    await storage.setItem('key2', 'value2');
    await storage.setItem('key3', 'value3');

    expect(storage.length()).toBe(3);

    storage.clear();
    expect(storage.length()).toBe(0);
  });
});

describe('FeatureFlags', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should have default flags', () => {
    expect(featureFlags.isPkceAuthFlowEnabled()).toBe(true);
    expect(featureFlags.isSecureStorageEnabled()).toBe(true);
    expect(featureFlags.isEnhancedSecurityHeadersEnabled()).toBe(true);
  });

  it('should enable and disable PKCE auth flow', () => {
    expect(featureFlags.isPkceAuthFlowEnabled()).toBe(true);

    featureFlags.enablePkceAuthFlow();
    expect(featureFlags.isPkceAuthFlowEnabled()).toBe(true);

    featureFlags.disablePkceAuthFlow();
    expect(featureFlags.isPkceAuthFlowEnabled()).toBe(false);
  });

  it('should enable and disable secure storage', () => {
    expect(featureFlags.isSecureStorageEnabled()).toBe(true);

    featureFlags.enableSecureStorage();
    expect(featureFlags.isSecureStorageEnabled()).toBe(true);

    featureFlags.disableSecureStorage();
    expect(featureFlags.isSecureStorageEnabled()).toBe(false);
  });

  it('should persist flags to localStorage', () => {
    featureFlags.enablePkceAuthFlow();
    featureFlags.enableSecureStorage();

    // Verify the data is actually stored in localStorage
    const stored = localStorage.getItem('trade_x_pro_feature_flags');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.pkceAuthFlow).toBe(true);
    expect(parsed.secureStorage).toBe(true);
  });

  it('should reset to defaults', () => {
    featureFlags.enablePkceAuthFlow();
    featureFlags.enableSecureStorage();

    expect(featureFlags.isPkceAuthFlowEnabled()).toBe(true);
    expect(featureFlags.isSecureStorageEnabled()).toBe(true);

    featureFlags.resetToDefaults();

    expect(featureFlags.isPkceAuthFlowEnabled()).toBe(true);
    expect(featureFlags.isSecureStorageEnabled()).toBe(true);
  });
});

describe('AuthMigration', () => {
  let secureStorage: SecureStorage;

  beforeEach(() => {
    localStorage.clear();
    secureStorage = new SecureStorage();
  });

  afterEach(() => {
    secureStorage.destroy();
    localStorage.clear();
  });

  it('should detect when migration is needed', () => {
    // Set up legacy data
    localStorage.setItem('sb-access_token', 'legacy_token');
    localStorage.setItem('sb-refresh_token', 'legacy_refresh');

    // Enable PKCE features
    featureFlags.enablePkceAuthFlow();
    featureFlags.enableSecureStorage();

    expect(authMigration.isMigrationNeeded()).toBe(true);
  });

  it('should detect when migration is not needed', () => {
    // No legacy data
    expect(authMigration.isMigrationNeeded()).toBe(false);

    // PKCE not enabled
    localStorage.setItem('sb-access_token', 'legacy_token');
    expect(authMigration.isMigrationNeeded()).toBe(false);

    // Migration already completed
    featureFlags.enablePkceAuthFlow();
    featureFlags.enableSecureStorage();
    localStorage.setItem(
      'auth_migration_state',
      JSON.stringify({ completed: true })
    );
    expect(authMigration.isMigrationNeeded()).toBe(false);
  });

  it('should migrate legacy auth data', async () => {
    // Set up legacy data
    localStorage.setItem('sb-access_token', 'legacy_access_token');
    localStorage.setItem('sb-refresh_token', 'legacy_refresh_token');
    localStorage.setItem('sb-expires_at', '1234567890');

    // Enable PKCE features
    featureFlags.enablePkceAuthFlow();
    featureFlags.enableSecureStorage();

    const result = await authMigration.migrateToPkce();

    expect(result.completed).toBe(true);
    expect(result.migratedItems).toHaveLength(3);
    expect(result.errors).toHaveLength(0);

    // Legacy data should be removed
    expect(localStorage.getItem('sb-access_token')).toBeNull();
    expect(localStorage.getItem('sb-refresh_token')).toBeNull();
    expect(localStorage.getItem('sb-expires_at')).toBeNull();

    // New data should be in secure storage
    expect(await secureStorage.getItem('access_token')).toBe(
      'legacy_access_token'
    );
    expect(await secureStorage.getItem('refresh_token')).toBe(
      'legacy_refresh_token'
    );
    expect(await secureStorage.getItem('expires_at')).toBe('1234567890');
  });

  it('should handle migration errors gracefully', async () => {
    // Set up legacy data
    localStorage.setItem('sb-access_token', 'legacy_access_token');

    // Mock SecureStorage prototype to throw error
    const originalSetItem = SecureStorage.prototype.setItem;
    SecureStorage.prototype.setItem = vi.fn().mockImplementation(() => {
      throw new Error('Storage error');
    });

    featureFlags.enablePkceAuthFlow();
    featureFlags.enableSecureStorage();

    const result = await authMigration.migrateToPkce();

    expect(result.completed).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Storage error');

    // Legacy data should still be there since migration failed
    expect(localStorage.getItem('sb-access_token')).toBe('legacy_access_token');

    // Restore original
    SecureStorage.prototype.setItem = originalSetItem;
  });

  it('should rollback migration', async () => {
    // Set up new data in secure storage
    await secureStorage.setItem('access_token', 'new_access_token');
    await secureStorage.setItem('refresh_token', 'new_refresh_token');

    // Complete migration state
    localStorage.setItem(
      'auth_migration_state',
      JSON.stringify({
        completed: true,
        timestamp: Date.now(),
        fromFlow: 'implicit',
        toFlow: 'pkce',
        migratedItems: ['access_token', 'refresh_token'],
        errors: [],
      })
    );

    await authMigration.rollbackMigration();

    // Migration state should be cleared
    expect(localStorage.getItem('auth_migration_state')).toBeNull();

    // PKCE features should be disabled
    expect(featureFlags.isPkceAuthFlowEnabled()).toBe(false);
    expect(featureFlags.isSecureStorageEnabled()).toBe(false);

    // Data should be back in localStorage
    expect(localStorage.getItem('sb-access_token')).toBe('new_access_token');
    expect(localStorage.getItem('sb-refresh_token')).toBe('new_refresh_token');

    // Secure storage should be empty
    expect(await secureStorage.getItem('access_token')).toBeNull();
    expect(await secureStorage.getItem('refresh_token')).toBeNull();
  });
});

describe('Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should handle complete PKCE migration workflow', async () => {
    // 1. Start with legacy data
    localStorage.setItem('sb-access_token', 'legacy_token');
    localStorage.setItem('sb-user', JSON.stringify({ id: 'user123' }));

    // 2. Enable PKCE features
    featureFlags.enablePkceAuthFlow();
    featureFlags.enableSecureStorage();

    // 3. Check migration is needed
    expect(authMigration.isMigrationNeeded()).toBe(true);

    // 4. Perform migration
    const migrationResult = await authMigration.migrateToPkce();
    expect(migrationResult.completed).toBe(true);

    // 5. Verify migration status
    const status = authMigration.getMigrationStatus();
    expect(status.needed).toBe(false);
    expect(status.state?.completed).toBe(true);

    // 6. Verify data is migrated
    const secureStorage = new SecureStorage();
    expect(await secureStorage.getItem('access_token')).toBe('legacy_token');
    expect(await secureStorage.getItem('user')).toBe(
      JSON.stringify({ id: 'user123' })
    );

    // 7. Legacy data should be cleaned up
    expect(localStorage.getItem('sb-access_token')).toBeNull();
    expect(localStorage.getItem('sb-user')).toBeNull();

    secureStorage.destroy();
  });

  it('should handle feature flag changes gracefully', () => {
    // Start with PKCE enabled
    featureFlags.enablePkceAuthFlow();
    featureFlags.enableSecureStorage();

    expect(featureFlags.isPkceAuthFlowEnabled()).toBe(true);
    expect(featureFlags.isSecureStorageEnabled()).toBe(true);

    // Disable features
    featureFlags.disablePkceAuthFlow();
    featureFlags.disableSecureStorage();

    expect(featureFlags.isPkceAuthFlowEnabled()).toBe(false);
    expect(featureFlags.isSecureStorageEnabled()).toBe(false);

    // Re-enable
    featureFlags.enableAllPkceFeatures();

    expect(featureFlags.isPkceAuthFlowEnabled()).toBe(true);
    expect(featureFlags.isSecureStorageEnabled()).toBe(true);
  });
});
