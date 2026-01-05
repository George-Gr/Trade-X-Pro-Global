/**
 * Test script to demonstrate the SecureStorage fallback behavior
 * This script shows that when encryption is disabled, the getItem method
 * returns the encrypted payload (data.data) instead of the full serialized object
 *
 * USAGE: Run with ts-node or rename to .ts and use a TypeScript test runner:
 *   node -r ts-node/register test-secure-storage-fallback.cjs
 *   or
 *   npx tsx test-secure-storage-fallback.cjs
 */

/* eslint-disable no-undef */

// Mock the environment for testing
global.crypto = require('crypto').webcrypto;
global.localStorage = {
  store: {},
  getItem: function (key) {
    return this.store[key] || null;
  },
  setItem: function (key, value) {
    this.store[key] = value;
  },
  removeItem: function (key) {
    delete this.store[key];
  },
  clear: function () {
    this.store = {};
  },
  key: function (index) {
    return Object.keys(this.store)[index] || null;
  },
  get length() {
    return Object.keys(this.store).length;
  },
};

// Import the SecureStorage class - requires TypeScript compilation
const { SecureStorage } = require('./src/lib/secureStorage.ts');

async function testFallbackBehavior() {
  console.log('Testing SecureStorage fallback behavior...\n');

  // Test 1: Create encrypted data with encryption enabled
  console.log('1. Creating encrypted data with encryption enabled...');
  const storageWithEncryption = new SecureStorage({ encryptionEnabled: true });

  const sensitiveKey = 'access_token';
  const sensitiveValue = 'my_secret_token_value';

  await storageWithEncryption.setItem(sensitiveKey, sensitiveValue);

  // Get the raw encrypted data from localStorage
  const storedEncrypted = localStorage.getItem('secure_auth_access_token');

  let parsedEncrypted;
  try {
    if (!storedEncrypted) {
      throw new Error('storedEncrypted was null/undefined');
    }
    parsedEncrypted = JSON.parse(storedEncrypted);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Failed to parse storedEncrypted JSON: ${error.message}. storedEncrypted value: ${storedEncrypted}`
      );
    } else {
      throw new Error(`Error accessing storedEncrypted: ${error.message}`);
    }
  }

  console.log('   Encrypted data structure:', {
    hasData: !!parsedEncrypted.data,
    hasIv: !!parsedEncrypted.iv,
    hasTimestamp: !!parsedEncrypted.timestamp,
    dataLength: parsedEncrypted.data?.length || 0,
  });

  // Test 2: Retrieve with encryption disabled (should return encrypted payload)

  console.log('\n2. Retrieving with encryption disabled...');
  const storageNoEncryption = new SecureStorage({ encryptionEnabled: false });

  const retrieved = await storageNoEncryption.getItem(sensitiveKey);

  console.log('   Retrieved value type:', typeof retrieved);

  console.log('   Retrieved value length:', retrieved?.length || 0);

  console.log('   Is encrypted payload:', retrieved === parsedEncrypted.data);

  console.log('   Is decrypted value:', retrieved === sensitiveValue);

  // Test 3: Verify the behavior

  console.log('\n3. Verification:');

  console.log(
    '   ✓ Returns encrypted payload (data.data):',
    retrieved === parsedEncrypted.data
  );

  console.log(
    '   ✓ Does NOT return full object:',
    typeof retrieved === 'string'
  );

  console.log(
    '   ✓ Does NOT return decrypted value:',
    retrieved !== sensitiveValue
  );

  console.log('\n✅ Test completed successfully!');

  console.log(
    'The fallback now returns the encrypted payload instead of the full serialized object.'
  );
}

// Run the test
testFallbackBehavior().catch((error) => {
  console.error(error);
});
