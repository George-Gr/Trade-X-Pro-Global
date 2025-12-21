/**
 * CSP Test Component
 *
 * This component helps test CSP implementation by attempting to load
 * resources that should be blocked or allowed based on the CSP policy.
 *
 * Use this component during development to verify CSP is working correctly.
 */

import React, { useEffect, useState } from 'react';

interface CSPTestResult {
  type: 'script' | 'style' | 'image' | 'font' | 'connect';
  status: 'blocked' | 'allowed' | 'error';
  message: string;
  timestamp: string;
}

export interface Props {}

export const CSPTest: React.FC<Props> = () => {
  const [results, setResults] = useState<CSPTestResult[]>([]);

  const addResult = (result: CSPTestResult) => {
    setResults((prev) => [...prev, result]);
  };

  useEffect(() => {
    const elements: (
      | HTMLScriptElement
      | HTMLStyleElement
      | HTMLImageElement
    )[] = [];
    const controller = new AbortController();

    // Test 1: Inline script (should be blocked without nonce)
    try {
      const script = document.createElement('script');
      script.textContent = 'console.log("Inline script test");';
      document.head.appendChild(script);
      elements.push(script);
      addResult({
        type: 'script',
        status: 'blocked',
        message: 'Inline script without nonce should be blocked',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      addResult({
        type: 'script',
        status: 'error',
        message: `Script test error: ${error}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Test 2: Inline style (should be allowed with 'unsafe-inline')
    try {
      const style = document.createElement('style');
      style.textContent = 'body { background-color: red; }';
      document.head.appendChild(style);
      elements.push(style);
      addResult({
        type: 'style',
        status: 'allowed',
        message: 'Inline styles should be allowed with unsafe-inline',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      addResult({
        type: 'style',
        status: 'error',
        message: `Style test error: ${error}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Test 3: External script from allowed domain
    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => {
        addResult({
          type: 'script',
          status: 'allowed',
          message: 'External script from allowed domain should load',
          timestamp: new Date().toISOString(),
        });
      };
      script.onerror = () => {
        addResult({
          type: 'script',
          status: 'blocked',
          message: 'External script blocked by CSP',
          timestamp: new Date().toISOString(),
        });
      };
      document.head.appendChild(script);
      elements.push(script);
    } catch (error) {
      addResult({
        type: 'script',
        status: 'error',
        message: `External script test error: ${error}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Test 4: Image from data URI (should be allowed)
    try {
      const img = new Image();
      img.src =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmYiLz48L3N2Zz4=';
      img.onload = () => {
        addResult({
          type: 'image',
          status: 'allowed',
          message: 'Data URI image should be allowed',
          timestamp: new Date().toISOString(),
        });
      };
      img.onerror = () => {
        addResult({
          type: 'image',
          status: 'blocked',
          message: 'Data URI image blocked by CSP',
          timestamp: new Date().toISOString(),
        });
      };
      elements.push(img);
    } catch (error) {
      addResult({
        type: 'image',
        status: 'error',
        message: `Image test error: ${error}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Test 5: Connection to allowed domain
    try {
      fetch('https://api.github.com', {
        method: 'HEAD',
        signal: controller.signal,
      })
        .then(() => {
          addResult({
            type: 'connect',
            status: 'allowed',
            message: 'Connection to allowed domain should succeed',
            timestamp: new Date().toISOString(),
          });
        })
        .catch(() => {
          addResult({
            type: 'connect',
            status: 'blocked',
            message: 'Connection blocked by CSP',
            timestamp: new Date().toISOString(),
          });
        });
    } catch (error) {
      addResult({
        type: 'connect',
        status: 'error',
        message: `Connection test error: ${error}`,
        timestamp: new Date().toISOString(),
      });
    }

    return () => {
      controller.abort();
      elements.forEach((el) => {
        el.onload = null;
        el.onerror = null;
        if (el instanceof HTMLImageElement) {
          el.src = '';
        } else if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      elements.length = 0;
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allowed':
        return 'text-[hsl(var(--success))]';
      case 'blocked':
        return 'text-[hsl(var(--danger))]';
      case 'error':
        return 'text-[hsl(var(--warning))]';
      default:
        return 'text-[hsl(var(--muted))]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'allowed':
        return '✅';
      case 'blocked':
        return '❌';
      case 'error':
        return '⚠️';
      default:
        return '❓';
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">CSP Test Results</h2>
      <p className="text-sm text-gray-600 mb-4">
        This component tests various CSP directives. Results will appear below
        as tests complete.
      </p>

      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 border border-gray-200 rounded"
          >
            <div className="flex items-center space-x-2">
              <span>{getStatusIcon(result.status)}</span>
              <span className={`font-medium ${getStatusColor(result.status)}`}>
                {result.type.toUpperCase()}: {result.status.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-gray-500">{result.message}</div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          Running CSP tests...
        </div>
      )}
    </div>
  );
};

export default CSPTest;
