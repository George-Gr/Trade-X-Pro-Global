import fs from 'fs/promises';
import path from 'path';
import SecureDeletion from './secure-deletion';

describe('SecureDeletion file close error handling', () => {
  const testFile = path.join(__dirname, 'test-close-error.txt');

  beforeAll(async () => {
    await fs.writeFile(testFile, 'Sensitive data');
  });

  afterAll(async () => {
    try { await fs.unlink(testFile); } catch {}

  });

  it('logs error if fd.close() fails', async () => {
    const sd = new SecureDeletion({ method: 'standard', passes: 1, backupMetadata: false });
    // Monkey-patch open to inject a FileHandle with a close that throws
    const origOpen = fs.open;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    try {
      // Monkey-patch open to inject a FileHandle with a close that throws
      fs.open = async (...args) => {
        const fh = await origOpen(...args);
        fh.close = async () => { throw new Error('Simulated close failure'); };
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
