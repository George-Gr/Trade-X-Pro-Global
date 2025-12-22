/**
 * Authentication Migration Utility
 *
 * This utility helps migrate from implicit flow with localStorage to PKCE flow
 * with secure storage. It handles data migration, cleanup, and provides
 * rollback capabilities.
 */

import { featureFlags } from './featureFlags';
import { logger } from './logger';
import { SecureStorage } from './secureStorage';

interface MigrationState {
  completed: boolean;
  timestamp: number;
  fromFlow: string;
  toFlow: string;
  migratedItems: string[];
  errors: string[];
}

/**
 * Manages authentication migration from implicit flow to PKCE flow.
 * Handles data migration, rollback, and status tracking.
 */
class AuthMigrationManager {
  private readonly STORAGE_KEY = 'auth_migration_state';
  private readonly LEGACY_PREFIX = 'sb-';
  private secureStorage?: SecureStorage;

  /**
   * Check if migration is needed
   */
  isMigrationNeeded(): boolean {
    // Migration needed if:
    // 1. PKCE flow is enabled
    // 2. Secure storage is enabled
    // 3. Legacy auth data exists
    // 4. Migration hasn't been completed yet

    // Require persisted feature flag state for migration to avoid accidental
    // migrations triggered by in-memory state that may be stale across sessions.
    const stored = sessionStorage.getItem('trade_x_pro_feature_flags');
    if (!stored) return false;

    try {
      const parsed = JSON.parse(stored);
      if (!parsed.pkceAuthFlow || !parsed.secureStorage) return false;
    } catch (error) {
      // If parsing fails, be conservative and don't migrate
      return false;
    }

    const migrationState = this.getMigrationState();
    if (migrationState?.completed) {
      return false;
    }

    return this.hasLegacyAuthData();
  }

  /**
   * Migrates authentication data from implicit flow to PKCE flow.
   * Moves legacy localStorage data to secure storage and removes legacy entries.
   * @returns {Promise<MigrationState>} The migration state including:
   * - completed: boolean - Whether the migration completed successfully
   * - timestamp: number - Unix timestamp when migration started
   * - fromFlow: string - The source authentication flow (e.g., 'implicit')
   * - toFlow: string - The target authentication flow (e.g., 'pkce')
   * - migratedItems: string[] - List of keys that were successfully migrated
   * - errors: string[] - List of error messages encountered during migration
   * @throws {Error} If migration fails due to storage errors or other issues.
   */
  async migrateToPkce(): Promise<MigrationState> {
    const state: MigrationState = {
      completed: false,
      timestamp: Date.now(),
      fromFlow: 'implicit',
      toFlow: 'pkce',
      migratedItems: [],
      errors: [],
    };

    try {
      logger.info('Starting authentication migration to PKCE flow');

      // Create secure storage instance
      this.secureStorage ??= new SecureStorage();

      // Find legacy auth data
      const legacyKeys = this.findLegacyAuthKeys();

      if (legacyKeys.length === 0) {
        logger.info('No legacy auth data found, skipping migration');
        state.completed = true;
        this.saveMigrationState(state);
        return state;
      }

      logger.info(`Found ${legacyKeys.length} legacy auth items to migrate`);

      // Migrate each legacy item
      for (const legacyKey of legacyKeys) {
        try {
          const value = localStorage.getItem(legacyKey);
          if (value) {
            // Determine the new key name (remove legacy prefix)
            const newKey = legacyKey.replace(this.LEGACY_PREFIX, '');

            // Store in secure storage
            this.secureStorage!.setItem(newKey, value);
            state.migratedItems.push(newKey);

            // Remove legacy item
            localStorage.removeItem(legacyKey);

            logger.debug(`Migrated ${legacyKey} to ${newKey}`);
          }
        } catch (error) {
          const errorMsg = `Failed to migrate ${legacyKey}: ${error}`;
          state.errors.push(errorMsg);
          logger.error(errorMsg, error as Error);
        }
      }

      // Complete migration (only if no errors)
      state.completed = state.errors.length === 0;
      this.saveMigrationState(state);

      logger.info(
        `Migration ${
          state.completed ? 'completed successfully' : 'finished with errors'
        }. Migrated ${state.migratedItems.length} items.`
      );

      if (state.errors.length > 0) {
        logger.warn(
          `Migration completed with ${
            state.errors.length
          } errors: ${state.errors.join(', ')}`
        );
      }
      return state;
    } catch (error) {
      state.errors.push(`Migration failed: ${error}`);
      this.saveMigrationState(state);
      logger.error('Migration failed:', error as Error);
      throw error;
    }
  }

  /**
   * Rolls back the migration by moving data back to localStorage.
   * Restores secure storage data to legacy localStorage format and clears migration state.
   * @returns {Promise<void>}
   * @throws {Error} If rollback fails.
   */
  async rollbackMigration(): Promise<void> {
    try {
      logger.info('Starting migration rollback');

      this.secureStorage ??= new SecureStorage();
      const newKeys = this.findNewAuthKeys();

      for (const newKey of newKeys) {
        try {
          const value = await this.secureStorage!.getItem(newKey);
          if (value) {
            // Store back in localStorage with legacy prefix
            const legacyKey = `${this.LEGACY_PREFIX}${newKey}`;
            localStorage.setItem(legacyKey, value);

            // Remove from secure storage
            this.secureStorage!.removeItem(newKey);

            logger.debug(`Rolled back ${newKey} to ${legacyKey}`);
          }
        } catch (error) {
          logger.error(`Failed to rollback ${newKey}:`, error as Error);
        }
      }

      // Clear migration state
      localStorage.removeItem(this.STORAGE_KEY);

      // Disable PKCE features
      featureFlags.disableAllPkceFeatures();

      logger.info('Migration rollback completed');
    } catch (error) {
      logger.error('Migration rollback failed:', error as Error);
      throw error;
    }
  }

  /**
   * Get current migration state
   */
  getMigrationState(): MigrationState | null {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      logger.warn(
        'Failed to load migration state: ' +
          (error instanceof Error ? error.message : String(error))
      );
    }
    return null;
  }

  /**
   * Check if legacy auth data exists
   */
  private hasLegacyAuthData(): boolean {
    return this.findLegacyAuthKeys().length > 0;
  }

  /**
   * Find all legacy auth keys
   */
  private findLegacyAuthKeys(): string[] {
    return Object.keys(localStorage).filter(
      (key) =>
        key.startsWith(this.LEGACY_PREFIX) &&
        (key.includes('access_token') ||
          key.includes('refresh_token') ||
          key.includes('expires_at') ||
          key.includes('user') ||
          key.includes('currentSession'))
    );
  }

  /**
   * Find all new auth keys in secure storage
   */
  private findNewAuthKeys(): string[] {
    this.secureStorage ??= new SecureStorage();
    const keys: string[] = [];

    for (let i = 0; i < this.secureStorage!.length(); i++) {
      const key = this.secureStorage!.key(i);
      if (key) {
        keys.push(key);
      }
    }

    return keys.filter(
      (key) =>
        key.includes('access_token') ||
        key.includes('refresh_token') ||
        key.includes('expires_at') ||
        key.includes('user') ||
        key.includes('currentSession')
    );
  }

  /**
   * Save migration state
   */
  private saveMigrationState(state: MigrationState): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      logger.warn(
        'Failed to save migration state: ' +
          (error instanceof Error ? error.message : String(error))
      );
    }
  }

  /**
   * Clear all auth data (for testing or emergency cleanup)
   */
  clearAllAuthData(): void {
    // Clear legacy auth data
    const legacyKeys = this.findLegacyAuthKeys();
    legacyKeys.forEach((key) => localStorage.removeItem(key));

    // Clear new auth data
    this.secureStorage ??= new SecureStorage();
    try {
      const newKeys = this.findNewAuthKeys();
      newKeys.forEach((key) => this.secureStorage!.removeItem(key));
    } finally {
      this.secureStorage?.destroy();
    }

    // Clear migration state
    sessionStorage.removeItem(this.STORAGE_KEY);

    logger.info('Cleared all authentication data');
  }

  /**
   * Retrieves the current migration status and related information.
   * @returns {{needed: boolean, state: MigrationState | null, legacyItems: number, newItems: number}} Object containing migration status details.
   */
  getMigrationStatus(): {
    needed: boolean;
    state: MigrationState | null;
    legacyItems: number;
    newItems: number;
  } {
    return {
      needed: this.isMigrationNeeded(),
      state: this.getMigrationState(),
      legacyItems: this.findLegacyAuthKeys().length,
      newItems: this.findNewAuthKeys().length,
    };
  }

  /**
   * Cleanup method to release resources
   */
  destroy(): void {
    this.secureStorage?.destroy();
  }
}

// Export singleton instance
export const authMigration = new AuthMigrationManager();

// Export type for external use
export type { MigrationState };
