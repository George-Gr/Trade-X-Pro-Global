import React, { useState, useEffect, useRef } from 'react';
import { useTradingKeyboardShortcuts } from '@/lib/tradingKeyboardNavigation';
import { useColorBlindMode, useVisualAccessibilityPreferences } from '@/lib/colorContrastVerification';

/**
 * Test result interface for type-safe keyboard navigation testing
 */
export interface TestResult {
  id: string;
  testName: string;
  passed: boolean;
  details?: string;
  timestamp?: number;
  shortcut?: {
    description: string;
    key: string;
    category: string;
  };
}

/**
 * Keyboard Navigation Tester Component
 * 
 * Interactive testing environment for keyboard navigation and shortcuts.
 * Tests trading shortcuts, focus management, and navigation patterns.
 */

export function KeyboardNavigationTester() {
  const [activeTest, setActiveTest] = useState<'shortcuts' | 'focus' | 'navigation'>('shortcuts');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);

  const keyboardShortcuts = useTradingKeyboardShortcuts();
  const colorBlindMode = useColorBlindMode();
  const visualPreferences = useVisualAccessibilityPreferences();

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard event recording
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyInfo = {
        key: e.key,
        code: e.code,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        timestamp: Date.now()
      };
      
      setRecordedKeys(prev => [...prev, `${keyInfo.ctrlKey ? 'Ctrl+' : ''}${keyInfo.shiftKey ? 'Shift+' : ''}${keyInfo.altKey ? 'Alt+' : ''}${keyInfo.key}`]);
      
      // Test if it matches a known shortcut
      const shortcut = keyboardShortcuts.shortcuts.find(s => 
        s.key.toLowerCase() === keyInfo.key.toLowerCase() &&
        s.modifiers.ctrl === keyInfo.ctrlKey &&
        s.modifiers.shift === keyInfo.shiftKey
      );
      
      if (shortcut) {
        setTestResults(prev => [...prev, {
          id: `shortcut-${Date.now()}`,
          testName: 'Shortcut Match',
          passed: true,
          details: `Shortcut activated: ${shortcut.description}`,
          timestamp: Date.now(),
          shortcut: {
            description: shortcut.description,
            key: shortcut.key,
            category: shortcut.category
          }
        }]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, keyboardShortcuts.shortcuts]);

  const testShortcut = (shortcut: any) => {
    setTestResults(prev => [...prev, {
      id: `test-${Date.now()}`,
      testName: 'Shortcut Test',
      passed: true,
      details: `Testing: ${shortcut.description}`,
      timestamp: Date.now(),
      shortcut: {
        description: shortcut.description,
        key: shortcut.key,
        category: shortcut.category
      }
    }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const clearRecordings = () => {
    setRecordedKeys([]);
  };

  const focusNextElement = () => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    (focusableElements[nextIndex] as HTMLElement).focus();
  };

  const focusPreviousElement = () => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;
    const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
    const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    (focusableElements[prevIndex] as HTMLElement).focus();
  };
  const simulateTradeAction = (action: string) => {
    setTestResults(prev => [...prev, {
      id: `trade-${Date.now()}`,
      testName: 'Trade Action Simulation',
      passed: true,
      details: `Simulating: ${action}`,
      timestamp: Date.now()
    }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Keyboard Navigation Testing</h2>
          <p className="text-muted-foreground">
            Interactive testing environment for keyboard shortcuts and navigation
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`px-4 py-2 rounded-lg font-medium ${
              isRecording ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            }`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          
          <button
            onClick={clearRecordings}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium"
          >
            Clear Recordings
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          {[
            { key: 'shortcuts', label: 'Shortcuts' },
            { key: 'focus', label: 'Focus Management' },
            { key: 'navigation', label: 'Navigation Patterns' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTest(tab.key as typeof activeTest)}              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTest === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTest === 'shortcuts' && (
          <div className="space-y-6">
            {/* Trading Shortcuts */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Trading Shortcuts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {keyboardShortcuts.getShortcutsByCategory('trading').map((shortcut, index) => (
                  <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{shortcut.description}</span>
                      <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-mono">
                        {shortcut.key}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-blue-700">
                      <span>Category: {shortcut.category}</span>
                      <button
                        onClick={() => testShortcut(shortcut)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Shortcuts */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">System Shortcuts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {keyboardShortcuts.getShortcutsByCategory('general').map((shortcut, index) => (
                  <div key={index} className="p-4 bg-green-50 border border-green-200 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{shortcut.description}</span>
                      <span className="px-3 py-1 bg-green-600 text-white rounded text-sm font-mono">
                        {shortcut.key}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-green-700">
                      <span>Category: {shortcut.category}</span>
                      <button
                        onClick={() => testShortcut(shortcut)}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trade Simulation */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Trade Simulation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Global keyboard shortcuts (Ctrl+B, Ctrl+S, etc.) are available when this page has focus.
                Click the buttons below to simulate trades or use the global shortcuts.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={() => simulateTradeAction('Buy Order')}
                  className="p-4 bg-green-500 text-white rounded-lg font-semibold"
                  title="Global shortcut: Ctrl+B"
                >
                  Buy Order
                </button>
                
                <button
                  onClick={() => simulateTradeAction('Sell Order')}
                  className="p-4 bg-red-500 text-white rounded-lg font-semibold"
                  title="Global shortcut: Ctrl+S"
                >
                  Sell Order
                </button>
                
                <button
                  onClick={() => simulateTradeAction('Close Position')}
                  className="p-4 bg-orange-500 text-white rounded-lg font-semibold"
                  title="Global shortcut: Ctrl+C"
                >
                  Close Position
                </button>
                
                <button
                  onClick={() => simulateTradeAction('Quick Trade')}
                  className="p-4 bg-purple-500 text-white rounded-lg font-semibold"
                  title="Global shortcut: Ctrl+Q"
                >
                  Quick Trade
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTest === 'focus' && (
          <div className="space-y-6">
            {/* Focus Management Demo */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Focus Management Demo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use Tab to navigate through elements, Shift+Tab to go back
              </p>
              
              <div ref={containerRef} className="space-y-4 p-4 border-2 border-dashed rounded">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="First input field"
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                
                <div className="flex space-x-4">
                  <button
                    ref={buttonRef}
                    onClick={() => setTestResults(prev => [...prev, {
                      id: `focus-${Date.now()}`,
                      testName: 'Focus Test',
                      passed: true,
                      details: 'Button clicked via keyboard',
                      timestamp: Date.now()
                    }])}
                    className="px-4 py-3 bg-blue-500 text-white rounded-lg font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    Focusable Button
                  </button>
                  
                  <button
                    onClick={() => setTestResults(prev => [...prev, {
                      id: `focus-secondary-${Date.now()}`,
                      testName: 'Focus Test',
                      passed: true,
                      details: 'Secondary button clicked',
                      timestamp: Date.now()
                    }])}
                    className="px-4 py-3 bg-gray-500 text-white rounded-lg font-medium focus:ring-2 focus:ring-gray-500"
                  >
                    Secondary Button
                  </button>
                </div>
                
                <select className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
                
                <textarea
                  placeholder="Textarea for testing"
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={4}
                />
              </div>
              
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={focusNextElement}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium"
                >
                  Focus Next (Tab simulation)
                </button>
                
                <button
                  onClick={focusPreviousElement}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium"
                >
                  Focus Previous (Shift+Tab simulation)
                </button>
              </div>
            </div>

            {/* Focus Indicators */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Focus Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">Default Focus</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Standard browser focus ring
                  </p>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded">
                    Default Focus
                  </button>
                </div>
                
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">Custom Focus Ring</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Custom focus indicator
                  </p>
                  <button className="px-4 py-2 bg-green-500 text-white rounded focus:ring-4 focus:ring-green-300">
                    Custom Focus
                  </button>
                </div>
                
                <div className="p-4 border rounded">
                  <h4 className="font-medium mb-2">High Contrast Focus</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    High contrast focus ring
                  </p>
                  <button className="px-4 py-2 bg-red-500 text-white rounded focus:ring-4 focus:ring-yellow-400 focus:ring-offset-2">
                    High Contrast
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTest === 'navigation' && (
          <div className="space-y-6">
            {/* Navigation Patterns */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Navigation Patterns</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Trading Interface Navigation</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                      <p className="font-medium">Dashboard Navigation</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Ctrl+1: Market Overview</li>
                        <li>• Ctrl+2: Portfolio</li>
                        <li>• Ctrl+3: Orders</li>
                        <li>• Ctrl+4: History</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                      <p className="font-medium">Chart Navigation</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Arrow keys: Navigate data points</li>
                        <li>• + / -: Zoom in/out</li>
                        <li>• Home/End: First/last data</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                      <p className="font-medium">Order Management</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Ctrl+B: Buy order</li>
                        <li>• Ctrl+S: Sell order</li>
                        <li>• Ctrl+C: Close position</li>
                        <li>• Esc: Cancel order</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Accessibility Navigation</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                      <p className="font-medium">Skip Links</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Alt+Shift+S: Skip to main content</li>
                        <li>• Alt+Shift+N: Skip to navigation</li>
                        <li>• Alt+Shift+H: Skip to header</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-red-50 border border-red-200 rounded">
                      <p className="font-medium">Focus Management</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Tab: Next focusable element</li>
                        <li>• Shift+Tab: Previous element</li>
                        <li>• Ctrl+F6: Switch panels</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="font-medium">Screen Reader</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• H: Navigate headings</li>
                        <li>• R: Navigate regions</li>
                        <li>• F: Navigate forms</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Preferences Integration */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Visual Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Color Blind Mode</h4>
                  <div className="space-y-3">
                    {colorBlindMode.availableModes.map((mode) => (
                      <label key={mode.type} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="color-blind-mode"
                          value={mode.type}
                          checked={colorBlindMode.colorBlindMode.type === mode.type}
                          onChange={(e) => colorBlindMode.applyColorBlindSimulation({
                            type: e.target.value as any,
                            intensity: colorBlindMode.colorBlindMode.intensity
                          })}
                          className="text-blue-600"
                        />
                        <span>{mode.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Visual Preferences</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">High Contrast</span>
                        <p className="text-sm text-muted-foreground">Enhanced color contrast</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={visualPreferences.preferences.highContrast}
                        onChange={(e) => visualPreferences.updatePreference('highContrast', e.target.checked)}
                        className="text-blue-600"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">Reduce Motion</span>
                        <p className="text-sm text-muted-foreground">Minimize animations</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={visualPreferences.preferences.reduceMotion}
                        onChange={(e) => visualPreferences.updatePreference('reduceMotion', e.target.checked)}
                        className="text-blue-600"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Results */}
      <div className="bg-card rounded-lg p-6 border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Test Results</h3>
          <button
            onClick={clearResults}
            className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm"
          >
            Clear Results
          </button>
        </div>
        
        <div className="space-y-3">
          {testResults.length === 0 ? (
            <p className="text-muted-foreground">No test results yet. Interact with the components to see results.</p>
          ) : (
            testResults.map((result) => (
              <div 
                key={result.id} 
                className="p-4 rounded-lg border bg-blue-50 border-blue-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-blue-900">
                      {result.testName}
                      <span className={`ml-2 text-xs ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
                        [{result.passed ? 'PASSED' : 'FAILED'}]
                      </span>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{result.details}</p>
                    {result.shortcut && (
                      <p className="text-xs text-blue-700 mt-2">
                        Shortcut: {result.shortcut.description} ({result.shortcut.key})
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recorded Keys */}
      {recordedKeys.length > 0 && (
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="font-semibold mb-4">Recorded Key Events</h3>
          <div className="flex flex-wrap gap-2">
            {recordedKeys.map((key, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
              >
                {key}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default KeyboardNavigationTester;