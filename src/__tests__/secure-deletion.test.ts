import SecureDeletion from '@/lib/security/secure-deletion';
import * as path from 'path';
import { describe, expect, it } from 'vitest';

const testFile = path.join(__dirname, 'test-close-error.txt');

describe('SecureDeletion module', () => {
  it('can be imported and instantiated', () => {
    const sd = new SecureDeletion({
      method: 'standard',
      passes: 1,
      backupMetadata: false,
    });

    expect(sd).toBeDefined();
    expect(sd.getConfig()).toBeDefined();
    expect(sd.getConfig().method).toBe('standard');
    expect(sd.getConfig().passes).toBe(1);
    expect(sd.getConfig().backupMetadata).toBe(false);
  });

  it('can update configuration', () => {
    const sd = new SecureDeletion({
      method: 'standard',
      passes: 1,
      backupMetadata: false,
    });

    sd.updateConfig({
      method: 'dod',
      passes: 3,
      backupMetadata: true,
    });

    const config = sd.getConfig();
    expect(config.method).toBe('dod');
    expect(config.passes).toBe(3);
    expect(config.backupMetadata).toBe(true);
  });
});
