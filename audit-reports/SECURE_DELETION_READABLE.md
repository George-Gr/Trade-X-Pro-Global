# Secure Deletion Report

**Generated:** 2025-12-25T20:00:59.308Z
**Method:** standard
**Passes:** 1
**Verification:** Enabled

## Summary

- **Total Files:** 1
- **Successfully Deleted:** 0
- **Failed Deletions:** 1
- **Total Space Freed:** 0 Bytes

## Failed Deletions

- `test-deletion.txt`

## Errors

- `test-deletion.txt`: fs.close is not a function

## Recommendations

### Failed Deletions

**Priority:** medium
**Description:** 1 files could not be deleted

### Security Enhancement

**Priority:** low
**Description:** Consider using NIST method or more passes for sensitive data

### Correct Secure Deletion Example (Node.js)

To securely delete a file and avoid the `fs.close is not a function` error, use the correct Node.js API:

**Synchronous:**

```js
const fs = require('fs');
try {
  const fd = fs.openSync(path, 'r+');
  fs.closeSync(fd);
  fs.unlinkSync(path);
} catch (err) {
  console.error('Secure deletion failed (sync):', err);
  throw err;
}
```

**Async/Promise:**

```js
const fs = require('fs');
async function secureDeleteAsync(path) {
  let fileHandle;
  try {
    fileHandle = await fs.promises.open(path, 'r+');
    await fs.promises.close(fileHandle.fd);
    await fs.promises.unlink(path);
  } catch (err) {
    console.error('Secure deletion failed (async):', err);
    throw err;
  }
}
```

**Notes:**

- Always use a valid file descriptor (`fd`) from `fs.open`/`fs.promises.open`.
- Always close the descriptor before unlinking.
- Always handle errors with try/catch and log them so failures are not silent.
