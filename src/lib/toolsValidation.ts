/**
 * Validate and normalize tool inputs to prevent common errors
 * Required for Language Model Tools Service stability
 */

/**
 * Ensure file path is absolute
 * ✅ Fixes: "Invalid input path: README.md. Be sure to use an absolute path."
 */
export const normalizeFilePath = (inputPath: string): string => {
  // Already absolute (starts with /)
  if (inputPath.startsWith('/')) {
    return inputPath;
  }

  // Check if it's a Windows-style absolute path (C:\ etc.)
  if (/^[A-Za-z]:\\/.test(inputPath)) {
    return inputPath;
  }

  // Relative path - prepend with / to make it absolute
  return '/' + inputPath;
};

/**
 * Validate terminal ID before use
 */
export const validateTerminalId = (terminalId: string | number): boolean => {
  if (typeof terminalId === 'number') {
    return terminalId > 0 && terminalId < 10000;
  }
  return typeof terminalId === 'string' && terminalId.length > 0;
};

/**
 * Add timeout to async operations
 * ✅ Prevents: Race conditions, canceled operations
 */
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
};

/**
 * Safe tool invocation wrapper
 */
export const safeToolInvoke = async <T>(
  toolName: string,
  operation: () => Promise<T>,
  options: { timeout?: number; retries?: number } = {}
): Promise<T> => {
  const { timeout = 30000, retries = 1 } = options;
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await withTimeout(operation(), timeout);
    } catch (error) {
      lastError = error as Error;
      console.warn(`[${toolName}] Attempt ${i + 1} failed:`, lastError.message);

      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }

  throw new Error(
    `[${toolName}] Failed after ${retries} attempts: ${lastError?.message}`
  );
};