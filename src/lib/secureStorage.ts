/**
 * Secure Storage Wrapper for Supabase Authentication
 *
 * This wrapper provides enhanced security for storing authentication tokens
 * by encrypting sensitive data before storing it in localStorage and
 * implementing additional security measures.
 *
 * Features:
 * - NaCl secretbox encryption for sensitive data
 * - Automatic key rotation
 * - Secure key generation using random bytes with per-instance salt
 * - Fallback to plain localStorage for non-sensitive data
 * - Automatic cleanup of expired tokens
 */

interface SecureStorageOptions {
  keyRotationInterval?: number; // milliseconds
  cleanupInterval?: number; // milliseconds
  encryptionEnabled?: boolean;
}

import nacl from 'tweetnacl';

interface EncryptedData {
  data: string;
  iv: string;
  authTag: string;
  timestamp: number;
}

export class SecureStorage {
  private readonly NAMESPACE = 'secure_auth_';
  private readonly KEY_ROTATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  private ENCRYPTION_ENABLED: boolean = true;

  // Synchronous symmetric key for NaCl secretbox (32 bytes)
  private symmetricKey: Uint8Array | null = null;
  private salt: Uint8Array | null = null;
  private keyRotationTimer: number | null = null;
  private cleanupTimer: number | null = null;
  private _initPromise: Promise<void>;

  constructor(options: SecureStorageOptions = {}) {
    const {
      keyRotationInterval = this.KEY_ROTATION_INTERVAL,
      cleanupInterval = this.CLEANUP_INTERVAL,
      encryptionEnabled = this.ENCRYPTION_ENABLED,
    } = options;

    this.ENCRYPTION_ENABLED = encryptionEnabled;

    if (this.ENCRYPTION_ENABLED) {
      this._initPromise = this.initializeEncryption();
      this._initPromise
        .then(() => {
          this.startKeyRotation(keyRotationInterval);
          this.startCleanup(cleanupInterval);
        })
        .catch((error: unknown) => {
          import('@/lib/logger')
            .then(({ logger }) => {
              logger.warn(
                'Failed to initialize encryption, falling back to plain storage',
                {
                  component: 'SecureStorage',
                  action: 'initialize_encryption',
                  metadata: { error },
                }
              );
            })
            .catch(() => {
              // Silently ignore logger import failures in error path
            });
          this.ENCRYPTION_ENABLED = false;
        });
    } else {
      this._initPromise = Promise.resolve();
    }
  }

  /**
   * Initialize encryption key synchronously using native RNG and localStorage
   */
  private async initializeEncryption(): Promise<void> {
    // Initialize salt
    const storedSalt = localStorage.getItem(`${this.NAMESPACE}salt`);
    const OLD_SALT = new TextEncoder().encode('supabase_auth_salt_v1');

    if (storedSalt) {
      this.salt = new Uint8Array(this.base64ToArrayBuffer(storedSalt));
    } else {
      // Check for existing key_material to determine if migration needed
      const hasExistingKey =
        localStorage.getItem(`${this.NAMESPACE}key_material`) !== null;
      if (hasExistingKey) {
        // Existing data, use old static salt for migration
        this.salt = new Uint8Array(OLD_SALT);
      } else {
        // New instance, generate random salt
        this.salt = new Uint8Array(16);
        crypto.getRandomValues(this.salt);
      }
      localStorage.setItem(
        `${this.NAMESPACE}salt`,
        this.arrayBufferToBase64(this.salt.buffer)
      );
    }

    const storedKey = localStorage.getItem(`${this.NAMESPACE}key_material`);

    if (storedKey) {
      const keyBuf = this.base64ToArrayBuffer(storedKey);
      this.symmetricKey = new Uint8Array(keyBuf);
      return;
    }

    // Generate 32 bytes key synchronously
    const key = new Uint8Array(32);
    crypto.getRandomValues(key);

    localStorage.setItem(
      `${this.NAMESPACE}key_material`,
      this.arrayBufferToBase64(key.buffer)
    );
    this.symmetricKey = key;
  }

  /**
   * Start automatic key rotation
   */
  private startKeyRotation(interval: number): void {
    this.keyRotationTimer = setInterval(() => {
      try {
        this.rotateKey();
      } catch (error: unknown) {
        import('@/lib/logger')
          .then(({ logger }) => {
            logger.warn('Key rotation failed', {
              component: 'SecureStorage',
              action: 'rotate_key',
              metadata: { error },
            });
          })
          .catch(() => {
            // Silently ignore logger import failures in error path
          });
      }
    }, interval) as unknown as number;
  }

  /**
   * Start automatic cleanup of expired tokens
   */
  private startCleanup(interval: number): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredTokens();
    }, interval) as unknown as number;
  }

  /**
   * Rotate encryption key and re-encrypt existing data (synchronous)
   */
  private rotateKey(): void {
    if (!this.ENCRYPTION_ENABLED || !this.symmetricKey) return;

    const oldKey = this.symmetricKey;

    // Generate a new symmetric key synchronously
    const newKey = new Uint8Array(32);
    crypto.getRandomValues(newKey);
    localStorage.setItem(
      `${this.NAMESPACE}key_material`,
      this.arrayBufferToBase64(newKey.buffer)
    );
    this.symmetricKey = newKey;

    // Re-encrypt existing data with new key
    const keys = Object.keys(localStorage).filter(
      (key) => key.startsWith(this.NAMESPACE) && !key.endsWith('key_material')
    );

    for (const key of keys) {
      try {
        const encryptedData = JSON.parse(localStorage.getItem(key) || '{}');
        if (encryptedData.data) {
          // Decrypt with old key (synchronously)
          const decrypted = this.decryptWithKeySync(encryptedData, oldKey);
          // Encrypt with new key
          const reEncrypted = this.encryptSync(decrypted);
          localStorage.setItem(key, JSON.stringify(reEncrypted));
        }
      } catch (error: unknown) {
        import('@/lib/logger')
          .then(({ logger }) => {
            logger.warn(`Failed to re-encrypt key ${key}`, {
              component: 'SecureStorage',
              action: 're_encrypt',
              metadata: { key, error },
            });
          })
          .catch(() => {
            // Silently ignore logger import failures in error path
          });
      }
    }
  }

  /**
   * Encrypt data synchronously using tweetnacl secretbox
   */
  private encryptSync(plaintext: string): EncryptedData {
    if (!this.ENCRYPTION_ENABLED || !this.symmetricKey) {
      throw new Error('Encryption not available');
    }

    const encoder = new TextEncoder();
    // Ensure message is a Uint8Array
    const message =
      typeof plaintext === 'string'
        ? encoder.encode(plaintext)
        : encoder.encode(String(plaintext));

    // Create nonce as Uint8Array
    const nonce = new Uint8Array(nacl.secretbox.nonceLength);
    crypto.getRandomValues(nonce);

    // Ensure symmetricKey is Uint8Array
    const key = new Uint8Array(this.symmetricKey!);

    try {
      // Coerce to ``Uint8Array`` instances in current realm to avoid cross-realm
      const m = Uint8Array.from(message as Iterable<number>);
      const n = Uint8Array.from(nonce as Iterable<number>);
      const k = Uint8Array.from(key as Iterable<number>);

      const cipher = nacl.secretbox(m, n, k);

      return {
        data: this.bytesToBase64(cipher),
        iv: this.bytesToBase64(n),
        authTag: '',
        timestamp: Date.now(),
      };
    } catch (err) {
      throw new Error(`Encryption failed: ${(err as Error).message}`);
    }
  }

  /**
   * Decrypt data synchronously using tweetnacl secretbox
   */
  private decryptSync(encryptedData: EncryptedData): string {
    if (!this.ENCRYPTION_ENABLED || !this.symmetricKey) {
      throw new Error('Encryption not available');
    }

    const nonceBuf = this.base64ToArrayBuffer(encryptedData.iv);
    const cipherBuf = this.base64ToArrayBuffer(encryptedData.data);

    const nonce = Uint8Array.from(new Uint8Array(nonceBuf));
    const cipher = Uint8Array.from(new Uint8Array(cipherBuf));
    const key = Uint8Array.from(new Uint8Array(this.symmetricKey!));

    try {
      const opened = nacl.secretbox.open(cipher, nonce, key);

      if (!opened) {
        throw new Error('Failed to decrypt data');
      }

      const decoder = new TextDecoder();
      return decoder.decode(opened);
    } catch (err) {
      throw new Error(`Decryption failed: ${(err as Error).message}`);
    }
  }

  /**
   * Decrypt data with specific key (for key rotation) - synchronous
   */
  private decryptWithKeySync(
    encryptedData: EncryptedData,
    key: Uint8Array
  ): string {
    const nonceBuf = this.base64ToArrayBuffer(encryptedData.iv);
    const cipherBuf = this.base64ToArrayBuffer(encryptedData.data);

    const nonce = new Uint8Array(nonceBuf);
    const cipher = new Uint8Array(cipherBuf);
    const k = new Uint8Array(key);

    try {
      const opened = nacl.secretbox.open(cipher, nonce, k);

      if (!opened) {
        throw new Error('Failed to decrypt data with provided key');
      }

      const decoder = new TextDecoder();
      return decoder.decode(opened);
    } catch (err) {
      throw new Error(
        `Decryption with provided key failed: ${(err as Error).message}`
      );
    }
  }

  /**
   * Check if data should be encrypted based on key name
   */
  private shouldEncrypt(key: string): boolean {
    const sensitiveKeys = [
      'access_token',
      'refresh_token',
      'expires_at',
      'user',
      'provider_token',
      'provider_refresh_token',
    ];

    return sensitiveKeys.some((sensitiveKey) => key.includes(sensitiveKey));
  }

  /**
   * Cleanup expired tokens
   */
  private cleanupExpiredTokens(): void {
    const keys = Object.keys(localStorage).filter(
      (key) => key.startsWith(this.NAMESPACE) && !key.endsWith('key_material')
    );

    for (const key of keys) {
      try {
        const item = localStorage.getItem(key);
        if (!item) continue;

        const data = JSON.parse(item);
        if (
          data.timestamp &&
          Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000
        ) {
          // Remove items older than 7 days
          localStorage.removeItem(key);
        }
      } catch (error) {
        // Remove corrupted items
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Utility: Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      const byte = bytes[i];
      if (byte !== undefined) {
        binary += String.fromCharCode(byte);
      }
    }
    return btoa(binary);
  }

  /**
   * Utility: Convert Uint8Array to base64 string (preserves length)
   */
  private bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      if (byte !== undefined) {
        binary += String.fromCharCode(byte);
      }
    }
    return btoa(binary);
  }

  /**
   * Utility: Convert base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return bytes.buffer;
  }

  // Supabase Storage API implementation (asynchronous)
  async getItem(key: string): Promise<string | null> {
    await this._initPromise;
    const fullKey = `${this.NAMESPACE}${key}`;
    const item = localStorage.getItem(fullKey);

    if (!item) return null;

    try {
      const data = JSON.parse(item);

      // Check if this is encrypted data
      if (data.data && data.iv && typeof data.timestamp === 'number') {
        if (!this.ENCRYPTION_ENABLED || !this.symmetricKey) {
          // Fallback: return raw encrypted payload (base64 string) if encryption is disabled or key missing
          // This maintains compatibility with existing code that expects the encrypted payload
          return data.data;
        }
        return this.decryptSync(data);
      }

      // Return plain data
      return data;
    } catch (error: unknown) {
      import('@/lib/logger')
        .then(({ logger }) => {
          logger.warn(`Failed to get item ${key}`, {
            component: 'SecureStorage',
            action: 'get_item',
            metadata: { key, error },
          });
        })
        .catch(() => {
          // Silently ignore logger import failures in error path
        });
      return null;
    }
  }
  async setItem(key: string, value: string): Promise<void> {
    await this._initPromise;
    const fullKey = `${this.NAMESPACE}${key}`;

    if (this.ENCRYPTION_ENABLED && this.shouldEncrypt(key)) {
      try {
        const encrypted = this.encryptSync(value);
        localStorage.setItem(fullKey, JSON.stringify(encrypted));
      } catch (error: unknown) {
        import('@/lib/logger')
          .then(({ logger }) => {
            logger.warn(`Failed to encrypt item ${key}, storing plain`, {
              component: 'SecureStorage',
              action: 'set_item',
              metadata: { key, error },
            });
          })
          .catch(() => {
            // Silently ignore logger import failures in error path
          });
        localStorage.setItem(fullKey, JSON.stringify(value));
      }
    } else {
      // Store non-sensitive data as plain JSON
      localStorage.setItem(fullKey, JSON.stringify(value));
    }
  }

  removeItem(key: string): void {
    const fullKey = `${this.NAMESPACE}${key}`;
    localStorage.removeItem(fullKey);
  }

  clear(): void {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(this.NAMESPACE)
    );

    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  length(): number {
    return Object.keys(localStorage).filter(
      (key) =>
        key.startsWith(this.NAMESPACE) &&
        !key.endsWith('key_material') &&
        !key.endsWith('salt')
    ).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(localStorage)
      .filter(
        (key) =>
          key.startsWith(this.NAMESPACE) &&
          !key.endsWith('key_material') &&
          !key.endsWith('salt')
      )
      .map((key) => key.replace(this.NAMESPACE, ''));

    return index >= 0 && index < keys.length ? keys[index] || null : null;
  }

  // Cleanup method to stop timers
  destroy(): void {
    if (this.keyRotationTimer) {
      clearInterval(this.keyRotationTimer);
      this.keyRotationTimer = null;
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}
