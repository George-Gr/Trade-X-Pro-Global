import SecureDeletion from '@/scripts/secure-deletion';
import fs from 'fs/promises';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const testFile = path.join(__dirname, 'test-close-error.txt');

describe('SecureDeletion file close error handling', () => {
  beforeAll(async () => {
    await fs.writeFile(testFile, 'Sensitive data');
  });

  afterAll(async () => {
    try {
      await fs.unlink(testFile);
    } catch {}
    try {
      await fs.unlink(testFile + '.metadata.json');
    } catch {}
  });

  it('logs error if fd.close() fails', async () => {
    const sd = new SecureDeletion({
      method: 'standard',
      passes: 1,
      backupMetadata: false,
    });
    // Monkey-patch open to inject a FileHandle with a close that throws
    const origOpen = fs.open;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      fs.open = async (...args) => {
        const fh = await origOpen(...args);
        fh.close = async () => {
          throw new Error('Simulated close failure');
        };
        return fh;
      };

      await sd.secureDelete([testFile]);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to close file handle'),
        expect.objectContaining({ message: 'Simulated close failure' })
      );
    } finally {
      consoleSpy.mockRestore();
      fs.open = origOpen;
    }
  });
});
