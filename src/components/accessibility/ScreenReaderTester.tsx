import React, { useState } from 'react';import { 
  useAccessibilityTesting
} from '@/lib/colorContrastVerification';

/**
 * Test result details interface
 */
interface TestResultDetails {
  [key: string]: any;
}

/**
 * Test case interface for screen reader testing
 */
export interface TestCase {
  id: string;
  title: string;
  description: string;
  action: () => {
    passed: boolean;
    details: TestResultDetails;
    message: string;
  };
}

/**
 * Test result interface for storing test execution results
 */
export interface TestResult {
  id: string;
  testName: string;
  passed: boolean;
  details?: TestResultDetails;
  message: string;
  timestamp?: number;
}

/**
 * Screen Reader Tester Component
 * 
 * Interactive testing environment for screen reader compatibility.
 * Tests heading hierarchy, live regions, and semantic structure.
 */

export function ScreenReaderTester() {
  const [isTesting, setIsTesting] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const accessibilityTesting = useAccessibilityTesting();

  // Test cases for screen reader functionality
  const testCases: TestCase[] = [
    {
      id: 'heading-hierarchy',
      title: 'Heading Hierarchy Test',
      description: 'Tests proper H1-H6 structure and semantic organization',
      action: () => {
        const stats = accessibilityTesting.getHeadingStats();
        const isValid = accessibilityTesting.isValid;
        return {
          passed: isValid,
          details: stats,
          message: isValid ? 'Heading hierarchy is valid' : 'Heading hierarchy has issues'
        };
      }
    },
    {
      id: 'live-regions',
      title: 'Live Regions Test',
      description: 'Tests ARIA live regions for dynamic content updates',
      action: () => {
        const hasLiveRegions = accessibilityTesting.liveRegions.length > 0;
        return {
          passed: hasLiveRegions,
          details: accessibilityTesting.liveRegions,
          message: hasLiveRegions 
            ? `Found ${accessibilityTesting.liveRegions.length} live regions` 
            : 'No live regions detected'
        };
      }
    },
    {
      id: 'semantic-structure',
      title: 'Semantic Structure Test',
      description: 'Tests proper use of semantic HTML elements',
      action: () => {
        const elements = document.querySelectorAll('main, nav, aside, section, article, header, footer');
        const hasSemanticStructure = elements.length > 0;
        return {
          passed: hasSemanticStructure,
          details: Array.from(elements).map(el => el.tagName.toLowerCase()),
          message: hasSemanticStructure 
            ? `Found ${elements.length} semantic elements` 
            : 'No semantic structure detected'
        };
      }
    },
    {
      id: 'alt-text',
      title: 'Alternative Text Test',
      description: 'Tests image alternative text for screen readers',
      action: () => {
        const images = document.querySelectorAll('img');
        const imagesWithAlt = Array.from(images).filter(img => img.alt && img.alt.trim() !== '');
        const hasAltText = imagesWithAlt.length === images.length && images.length > 0;
        return {
          passed: hasAltText,
          details: {
            total: images.length,
            withAlt: imagesWithAlt.length,
            missing: images.length - imagesWithAlt.length
          },
          message: hasAltText 
            ? `All ${images.length} images have alt text` 
            : `${images.length - imagesWithAlt.length} images missing alt text`
        };
      }
    },
    {
      id: 'focus-management',
      title: 'Focus Management Test',
      description: 'Tests keyboard focus indicators and management',
      action: () => {
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const hasFocusManagement = focusableElements.length > 0;
        return {
          passed: hasFocusManagement,
          details: {
            total: focusableElements.length,
            elements: Array.from(focusableElements).map(el => el.tagName.toLowerCase())
          },
          message: hasFocusManagement 
            ? `Found ${focusableElements.length} focusable elements` 
            : 'No focusable elements detected'
        };
      }
    }
  ];

  const announceToScreenReader = (message: string) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const runTest = async (testCase: TestCase) => {
    setCurrentTest(testCase.id);
    setIsTesting(true);
    
    // Simulate test execution time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = testCase.action();
    setTestResults(prev => [...prev, { 
      id: `result-${Date.now()}`,
      testName: testCase.title,
      passed: result.passed,
      details: result.details,
      message: result.message,
      timestamp: Date.now()
    }]);
    
    announceToScreenReader(`${testCase.title}. ${result.message}`);
    setIsTesting(false);
    setCurrentTest('');
  };

  const runAllTests = async () => {
    setTestResults([]);
    for (const testCase of testCases) {
      await runTest(testCase);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const clearResults = () => {
    setTestResults([]);
    announceToScreenReader('Test results cleared');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Screen Reader Testing</h2>
          <p className="text-muted-foreground">
            Interactive testing environment for screen reader compatibility
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-colors ${
              voiceEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                voiceEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </div>
            <span className="text-sm font-medium">Voice Announcements</span>
          </label>
          
          <button
            onClick={runAllTests}
            disabled={isTesting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium"
          >
            {isTesting ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testCases.map((testCase: TestCase) => (
          <div key={testCase.id} className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">{testCase.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{testCase.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Test ID: {testCase.id}
              </span>
              <button
                onClick={() => runTest(testCase)}
                disabled={isTesting}
                className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium"
              >
                {currentTest === testCase.id ? 'Running...' : 'Run Test'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Test Results */}
      <div className="bg-card rounded-lg p-6 border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Test Results</h3>
          <div className="flex space-x-2">
            <button
              onClick={clearResults}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm"
            >
              Clear Results
            </button>
            <button
              onClick={() => {
                const results = JSON.stringify(testResults, null, 2);
                navigator.clipboard.writeText(results);
                announceToScreenReader('Test results copied to clipboard');
              }}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm"
            >
              Copy Results
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {testResults.length === 0 ? (
            <p className="text-muted-foreground">No test results yet. Run a test to see results here.</p>
          ) : (
            testResults.map((result: TestResult) => (
              <div 
                key={result.id} 
                className={`p-4 rounded-lg border ${
                  result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-semibold ${
                      result.passed ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {result.testName}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.passed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                
                {result.details && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                      View Details
                    </summary>
                    <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Live Region Demo */}
      <div className="bg-card rounded-lg p-6 border">
        <h3 className="font-semibold mb-4">Live Region Demo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This demonstrates ARIA live regions for dynamic content updates
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <button
              onClick={() => {
                const message = 'Price updated: AAPL is now $150.25';
                announceToScreenReader(message);
              }}
              aria-live="polite"
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium"
            >
              Update Price (Polite)
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Polite live region - won't interrupt user
            </p>
          </div>
          
          <div>
            <button
              onClick={() => {
                const message = 'ALERT: Market closed due to volatility';
                announceToScreenReader(message);
              }}
              aria-live="assertive"
              className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium"
            >
              Market Alert (Assertive)
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Assertive live region - interrupts user
            </p>
          </div>
          
          <div>
            <button
              onClick={() => {
                const message = 'Order executed: 100 shares of AAPL bought at $150.25';
                announceToScreenReader(message);
              }}
              aria-live="polite"
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium"
            >
              Order Executed (Polite)
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Transaction updates
            </p>
          </div>
        </div>
      </div>

      {/* Accessibility Tips */}
      <div className="bg-card rounded-lg p-6 border">
        <h3 className="font-semibold mb-4">Screen Reader Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">For Developers</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use semantic HTML elements</li>
              <li>• Provide meaningful alt text for images</li>
              <li>• Implement proper heading hierarchy</li>
              <li>• Add ARIA labels for complex widgets</li>
              <li>• Test with actual screen readers</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">For Users</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use screen reader shortcuts</li>
              <li>• Navigate by headings and landmarks</li>
              <li>• Listen to live region announcements</li>
              <li>• Use focus mode for better navigation</li>
              <li>• Report accessibility issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScreenReaderTester;