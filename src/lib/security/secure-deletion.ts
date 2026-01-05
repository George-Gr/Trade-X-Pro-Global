/**
 * Secure File Deletion Module
 *
 * Provides secure file deletion functionality with configurable methods
 * and error handling for file operations.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface SecureDeletionConfig {
  method: 'standard' | 'dod' | 'random';
  passes: number;
  backupMetadata: boolean;
}

export interface SecureDeletionResult {
  success: boolean;
  errors?: string[] | undefined;
  metadataFile?: string | undefined;
}

export default class SecureDeletion {
  private config: SecureDeletionConfig;

  constructor(config: SecureDeletionConfig) {
    this.config = {
      method: config.method || 'standard',
      passes: config.passes || 1,
      backupMetadata: config.backupMetadata || false,
    };
  }

  /**
   * Securely delete files with error handling
   */
  async secureDelete(filePaths: string[]): Promise<SecureDeletionResult> {
    const errors: string[] = [];
    let metadataFile: string | undefined;

    try {
      // Create metadata file if requested
      if (this.config.backupMetadata) {
        metadataFile = await this.createMetadataFile(filePaths);
      }

      // Process each file
      for (const filePath of filePaths) {
        try {
          await this.deleteFileSecurely(filePath);
        } catch (error) {
          const errorMessage = `Failed to delete ${filePath}: ${
            (error as Error).message
          }`;
          errors.push(errorMessage);
          console.error('Failed to close file handle', error);
        }
      }

      return {
        success: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        metadataFile: metadataFile || undefined,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Secure deletion failed: ${(error as Error).message}`],
        metadataFile: metadataFile || undefined,
      };
    }
  }

  /**
   * Delete a single file securely
   */
  private async deleteFileSecurely(filePath: string): Promise<void> {
    const absolutePath = path.resolve(filePath);

    // Check if file exists
    try {
      await fs.access(absolutePath);
    } catch {
      // File doesn't exist, nothing to delete
      return;
    }

    // Perform secure deletion based on method
    switch (this.config.method) {
      case 'dod':
        await this.dodMethod(absolutePath);
        break;
      case 'random':
        await this.randomMethod(absolutePath);
        break;
      case 'standard':
      default:
        await this.standardMethod(absolutePath);
        break;
    }

    // Remove the file
    await fs.unlink(absolutePath);
  }

  /**
   * Standard deletion method - overwrite with zeros
   */
  private async standardMethod(filePath: string): Promise<void> {
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;

    // Open file for writing
    const fd = await fs.open(filePath, 'r+');

    try {
      // Write zeros for specified passes
      for (let pass = 0; pass < this.config.passes; pass++) {
        const buffer = Buffer.alloc(fileSize, 0);
        await fd.write(buffer, 0, buffer.length, 0);
        await fd.sync();
      }
    } catch (error) {
      // Close file handle before rethrowing
      try {
        await fd.close();
      } catch (closeError) {
        console.error('Failed to close file handle', closeError);
      }
      throw error;
    } finally {
      // Ensure file handle is closed
      try {
        await fd.close();
      } catch (closeError) {
        console.error('Failed to close file handle', closeError);
      }
    }
  }

  /**
   * DoD 5220.22-M standard deletion method
   */
  private async dodMethod(filePath: string): Promise<void> {
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;

    const fd = await fs.open(filePath, 'r+');

    try {
      // Pass 1: Write 0xFF
      let buffer = Buffer.alloc(fileSize, 0xff);
      await fd.write(buffer, 0, buffer.length, 0);
      await fd.sync();

      // Pass 2: Write 0x00
      buffer = Buffer.alloc(fileSize, 0x00);
      await fd.write(buffer, 0, buffer.length, 0);
      await fd.sync();

      // Pass 3: Write random data
      for (let pass = 0; pass < this.config.passes; pass++) {
        buffer = Buffer.alloc(fileSize);
        crypto.getRandomValues(buffer);
        await fd.write(buffer, 0, buffer.length, 0);
        await fd.sync();
      }
    } finally {
      try {
        await fd.close();
      } catch (closeError) {
        // File handle already closed or close failed - ignore
      }
    }
  }

  private async randomMethod(filePath: string): Promise<void> {
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;

    const fd = await fs.open(filePath, 'r+');

    try {
      for (let pass = 0; pass < this.config.passes; pass++) {
        const buffer = Buffer.alloc(fileSize);
        crypto.getRandomValues(buffer);
        await fd.write(buffer, 0, buffer.length, 0);
        await fd.sync();
      }
    } catch (error) {
      try {
        await fd.close();
      } catch (closeError) {
        console.error('Failed to close file handle', closeError);
      }
      throw error;
    } finally {
      try {
        await fd.close();
      } catch (closeError) {
        console.error('Failed to close file handle', closeError);
      }
    }
  }

  /**
   * Create metadata file for tracking deletion
   */
  private async createMetadataFile(filePaths: string[]): Promise<string> {
    if (!filePaths.length) {
      throw new Error('No file paths provided for metadata creation');
    }

    const firstFilePath = filePaths[0];
    if (!firstFilePath) {
      throw new Error('Invalid file path provided');
    }

    const metadata = {
      timestamp: new Date().toISOString(),
      method: this.config.method,
      passes: this.config.passes,
      files: filePaths,
      version: '1.0',
    };

    const metadataPath = path.join(
      path.dirname(firstFilePath),
      `.metadata_${Date.now()}.json`
    );

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    return metadataPath;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SecureDeletionConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): SecureDeletionConfig {
    return { ...this.config };
  }
}
