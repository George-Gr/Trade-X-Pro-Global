import { useCallback } from 'react';
import { normalizeFilePath, validateTerminalId, safeToolInvoke } from '@/lib/toolsValidation';

export const useToolInvocation = () => {
  // ✅ Safe file reading
  const readFile = useCallback(async (filePath: string) => {
    const absolutePath = normalizeFilePath(filePath);
    
    return safeToolInvoke('readFile', async () => {
      // Actual tool invocation here
      const response = await fetch('/api/readFile', {
        method: 'POST',
        body: JSON.stringify({ path: absolutePath }),
      });
      return response.json();
    });
  }, []);

  // ✅ Safe terminal operations
  const terminalCommand = useCallback(async (terminalId: string | number, command: string) => {
    if (!validateTerminalId(terminalId)) {
      throw new Error(`Invalid terminal ID: ${terminalId}`);
    }

    return safeToolInvoke('terminalCommand', async () => {
      const response = await fetch('/api/terminal/execute', {
        method: 'POST',
        body: JSON.stringify({ terminalId, command }),
      });
      return response.json();
    }, { timeout: 60000, retries: 2 });
  }, []);

  return { readFile, terminalCommand };
};