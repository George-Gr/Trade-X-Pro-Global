/**
 * Client-Side Data Encryption Module
 * 
 * Provides secure client-side encryption for sensitive data using Web Crypto API
 * and AES-GCM encryption. Designed to protect sensitive user data stored locally.
 * 
 * Features:
 * - AES-GCM encryption with 256-bit keys
 * - PBKDF2 key derivation with salt
 * - Automatic key generation and management
 * - Secure storage wrapper for localStorage/sessionStorage
 * - Encrypted session management
 * - Data integrity verification
 */

import { logger } from './logger';

/**
 * Encryption configuration
 */
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM' as const,
  keyLength: 256,
  iterations: 100000,
  ivLength: 12, // 96 bits
  saltLength: 16, // 128 bits
  tagLength: 16, // 128 bits
  encoding: 'utf-8' as const,
  storagePrefix: 'enc_',
};

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  data: string; // Base64 encoded encrypted data
  iv: string;   // Base64 encoded initialization vector
  salt: string; // Base64 encoded salt
  tag?: string; // Base64 encoded authentication tag (for AES-GCM)
  timestamp: number;
  version: string;
}

/**
 * Encryption error class
 */
export class EncryptionError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'EncryptionError';
  }
}

/**
 * Key management class
 */
class KeyManager {
  private keyCache: Map<string, CryptoKey> = new Map();
  private readonly keyStoreKey = 'encryption_key_store';

  /**
   * Generate a key from password and salt
   */
  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: ENCRYPTION_CONFIG.iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: ENCRYPTION_CONFIG.algorithm,
        length: ENCRYPTION_CONFIG.keyLength,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate a new encryption key
   */
  async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        length: ENCRYPTION_CONFIG.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export key as JWK (JSON Web Key)
   */
  async exportKey(key: CryptoKey): Promise<JsonWebKey> {
    return crypto.subtle.exportKey('jwk', key);
  }

  /**
   * Import key from JWK
   */
  async importKey(jwk: JsonWebKey): Promise<CryptoKey> {
    return crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: ENCRYPTION_CONFIG.algorithm,
        length: ENCRYPTION_CONFIG.keyLength,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Get or generate a master key
   */
  async getMasterKey(): Promise<CryptoKey> {
    const cached = this.keyCache.get('master');
    if (cached) {
      return cached;
    }

    // Try to load existing key from storage
    const stored = this.loadStoredKey();
    if (stored) {
      try {
        const key = await this.importKey(stored);
        this.keyCache.set('master', key);
        return key;
      } catch (error) {
        logger.warn('Key import failed', {
          metadata: {
            reason: 'Failed to import stored key',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    // Generate new key and store it
    const newKey = await this.generateKey();
    const jwk = await this.exportKey(newKey);
    this.saveKey(jwk);

    this.keyCache.set('master', newKey);
    return newKey;
  }

  /**
   * Save key to storage
   */
  private saveKey(jwk: JsonWebKey): void {
    try {
      localStorage.setItem(this.keyStoreKey, JSON.stringify(jwk));
    } catch (error) {
      logger.warn('Key save failed', {
        metadata: {
          reason: 'Failed to save encryption key',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw new EncryptionError('Failed to save encryption key', 'KEY_SAVE_ERROR', error as Error);
    }
  }

  /**
   * Load key from storage
   */
  private loadStoredKey(): JsonWebKey | null {
    try {
      const stored = localStorage.getItem(this.keyStoreKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      logger.warn('Key load failed', {
        metadata: {
          reason: 'Failed to load encryption key',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      return null;
    }
  }

  /**
   * Clear stored key
   */
  clearKey(): void {
    try {
      localStorage.removeItem(this.keyStoreKey);
      this.keyCache.clear();
    } catch (error) {
      logger.warn('Key clear failed', {
        metadata: {
          reason: 'Failed to clear encryption key',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
}

/**
 * Main encryption service
 */
class EncryptionService {
  private keyManager = new KeyManager();
  private readonly encryptionKeyPromise: Promise<CryptoKey>;

  constructor() {
    // Initialize master key asynchronously
    this.encryptionKeyPromise = this.keyManager.getMasterKey();
  }

  /**
   * Encrypt data
   */
  async encrypt(data: string): Promise<EncryptedData> {
    try {
      const key = await this.encryptionKeyPromise;
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Generate random salt and IV
      const salt = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength));
      const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength));

      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: ENCRYPTION_CONFIG.algorithm,
          iv: iv,
        },
        key,
        dataBuffer
      );

      // Convert to base64
      const encryptedBase64 = this.arrayBufferToBase64(encryptedBuffer);
      const ivBase64 = this.arrayBufferToBase64(iv as unknown as ArrayBuffer);
      const saltBase64 = this.arrayBufferToBase64(salt as unknown as ArrayBuffer);

      const encryptedData: EncryptedData = {
        data: encryptedBase64,
        iv: ivBase64,
        salt: saltBase64,
        timestamp: Date.now(),
        version: '1.0.0',
      };

      return encryptedData;
    } catch (error) {
      logger.error('Encryption failed', {
        reason: 'Failed to encrypt data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new EncryptionError('Failed to encrypt data', 'ENCRYPTION_ERROR', error as Error);
    }
  }

  /**
   * Decrypt data
   */
  async decrypt(encryptedData: EncryptedData): Promise<string> {
    try {
      const key = await this.encryptionKeyPromise;

      // Convert base64 to Uint8Array
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData.data);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const salt = this.base64ToArrayBuffer(encryptedData.salt);

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: ENCRYPTION_CONFIG.algorithm,
          iv: iv,
        },
        key,
        encryptedBuffer
      );

      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      logger.error('Decryption failed', {
        reason: 'Failed to decrypt data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new EncryptionError('Failed to decrypt data', 'DECRYPTION_ERROR', error as Error);
    }
  }

  /**
   * Encrypt and store data in localStorage
   */
  async setSecureItem(key: string, data: string): Promise<void> {
    try {
      const encrypted = await this.encrypt(data);
      const storageKey = this.getStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify(encrypted));
    } catch (error) {
      logger.warn('Secure storage failed', {
        metadata: {
          reason: 'Failed to store encrypted data',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw new EncryptionError('Failed to store encrypted data', 'STORAGE_ERROR', error as Error);
    }
  }

  /**
   * Retrieve and decrypt data from localStorage
   */
  async getSecureItem(key: string): Promise<string | null> {
    try {
      const storageKey = this.getStorageKey(key);
      const stored = localStorage.getItem(storageKey);

      if (!stored) {
        return null;
      }

      const encryptedData: EncryptedData = JSON.parse(stored);
      return await this.decrypt(encryptedData);
    } catch (error) {
      logger.warn('Secure retrieval failed', {
        metadata: {
          reason: 'Failed to retrieve encrypted data',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      return null;
    }
  }

  /**
   * Remove encrypted item from localStorage
   */
  removeSecureItem(key: string): void {
    try {
      const storageKey = this.getStorageKey(key);
      localStorage.removeItem(storageKey);
    } catch (error) {
      logger.warn('Secure removal failed', {
        metadata: {
          reason: 'Failed to remove encrypted data',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * Encrypt and store data in sessionStorage
   */
  async setSecureSessionItem(key: string, data: string): Promise<void> {
    try {
      const encrypted = await this.encrypt(data);
      const storageKey = this.getStorageKey(key);
      sessionStorage.setItem(storageKey, JSON.stringify(encrypted));
    } catch (error) {
      logger.warn('Secure session storage failed', {
        metadata: {
          reason: 'Failed to store encrypted session data',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      throw new EncryptionError('Failed to store encrypted session data', 'SESSION_STORAGE_ERROR', error as Error);
    }
  }

  /**
   * Retrieve and decrypt data from sessionStorage
   */
  async getSecureSessionItem(key: string): Promise<string | null> {
    try {
      const storageKey = this.getStorageKey(key);
      const stored = sessionStorage.getItem(storageKey);

      if (!stored) {
        return null;
      }

      const encryptedData: EncryptedData = JSON.parse(stored);
      return await this.decrypt(encryptedData);
    } catch (error) {
      logger.warn('Secure session retrieval failed', {
        metadata: {
          reason: 'Failed to retrieve encrypted session data',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
      return null;
    }
  }

  /**
   * Remove encrypted item from sessionStorage
   */
  removeSecureSessionItem(key: string): void {
    try {
      const storageKey = this.getStorageKey(key);
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      logger.warn('Secure session removal failed', {
        metadata: {
          reason: 'Failed to remove encrypted session data',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * Clear all encrypted data
   */
  clearAllSecureData(): void {
    try {
      // Clear localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(ENCRYPTION_CONFIG.storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage
      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(ENCRYPTION_CONFIG.storagePrefix)) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

      // Clear encryption key
      this.keyManager.clearKey();
    } catch (error) {
      logger.warn('Secure clear failed', {
        metadata: {
          reason: 'Failed to clear encrypted data',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * Get storage key with prefix
   */
  private getStorageKey(key: string): string {
    return `${ENCRYPTION_CONFIG.storagePrefix}${key}`;
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Check if Web Crypto API is available
   */
  static isAvailable(): boolean {
    return typeof crypto !== 'undefined' &&
      typeof crypto.subtle !== 'undefined' &&
      typeof crypto.getRandomValues !== 'undefined';
  }
}

// Create singleton instance
export const encryptionService = new EncryptionService();

/**
 * Secure storage wrapper for sensitive data
 */
export class SecureStorage {
  /**
   * Store sensitive user data
   */
  static async setUserData<T = unknown>(key: string, data: T): Promise<void> {
    const jsonString = JSON.stringify(data);
    await encryptionService.setSecureItem(key, jsonString);
  }

  /**
   * Retrieve sensitive user data
   */
  static async getUserData<T = unknown>(key: string): Promise<T | null> {
    const jsonString = await encryptionService.getSecureItem(key);
    if (!jsonString) {
      return null;
    }
    return JSON.parse(jsonString);
  }

  /**
   * Remove sensitive user data
   */
  static removeUserData(key: string): void {
    encryptionService.removeSecureItem(key);
  }

  /**
   * Store session data
   */
  static async setSessionData<T = unknown>(key: string, data: T): Promise<void> {
    const jsonString = JSON.stringify(data);
    await encryptionService.setSecureSessionItem(key, jsonString);
  }

  /**
   * Retrieve session data
   */
  static async getSessionData<T = unknown>(key: string): Promise<T | null> {
    const jsonString = await encryptionService.getSecureSessionItem(key);
    if (!jsonString) {
      return null;
    }
    return JSON.parse(jsonString);
  }

  /**
   * Remove session data
   */
  static removeSessionData(key: string): void {
    encryptionService.removeSecureSessionItem(key);
  }

  /**
   * Clear all sensitive data
   */
  static clearAll(): void {
    encryptionService.clearAllSecureData();
  }
}

/**
 * Hook for secure data management
 */
export function useSecureStorage() {
  const setUserData = async <T = unknown>(key: string, data: T): Promise<void> => {
    await SecureStorage.setUserData(key, data);
  };

  const getUserData = async <T = unknown>(key: string): Promise<T | null> => {
    return SecureStorage.getUserData<T>(key);
  };

  const removeUserData = (key: string): void => {
    SecureStorage.removeUserData(key);
  };

  const setSessionData = async <T = unknown>(key: string, data: T): Promise<void> => {
    await SecureStorage.setSessionData(key, data);
  };

  const getSessionData = async <T = unknown>(key: string): Promise<T | null> => {
    return SecureStorage.getSessionData<T>(key);
  };

  const removeSessionData = (key: string): void => {
    SecureStorage.removeSessionData(key);
  };

  const clearAll = (): void => {
    SecureStorage.clearAll();
  };

  return {
    setUserData,
    getUserData,
    removeUserData,
    setSessionData,
    getSessionData,
    removeSessionData,
    clearAll,
  };
}

/**
 * Encrypt sensitive data for API transmission
 */
export async function encryptForTransmission<T = unknown>(data: T): Promise<string> {
  const jsonString = JSON.stringify(data);
  const encrypted = await encryptionService.encrypt(jsonString);
  return JSON.stringify(encrypted);
}

/**
 * Decrypt sensitive data from API
 */
export async function decryptFromTransmission<T = unknown>(encryptedData: string): Promise<T> {
  const parsed = JSON.parse(encryptedData);
  const jsonString = await encryptionService.decrypt(parsed);
  return JSON.parse(jsonString);
}

/**
 * Check if encryption is available in current environment
 */
export function isEncryptionAvailable(): boolean {
  return EncryptionService.isAvailable();
}

/**
 * Initialize encryption service
 */
export async function initializeEncryption(): Promise<boolean> {
  if (!isEncryptionAvailable()) {
    logger.warn('Encryption unavailable', {
      metadata: {
        reason: 'Web Crypto API not available in this environment',
      },
    });
    return false;
  }

  try {
    // Test encryption/decryption
    const testData = 'test_encryption_' + Date.now();
    const encrypted = await encryptionService.encrypt(testData);
    const decrypted = await encryptionService.decrypt(encrypted);

    if (decrypted !== testData) {
      throw new Error('Encryption test failed');
    }

    logger.info('Encryption initialized', {
      metadata: {
        reason: 'Encryption service initialized successfully',
      },
    });

    return true;
  } catch (error) {
    logger.error('Encryption initialization failed', {
      metadata: {
        reason: 'Failed to initialize encryption service',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    return false;
  }
}