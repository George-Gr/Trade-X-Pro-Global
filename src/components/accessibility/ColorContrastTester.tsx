import { useRef, useState } from 'react';
import {
  useColorBlindMode,
  useColorContrastVerification,
  useVisualAccessibilityPreferences,
} from '../../lib/colorContrastVerification';

/**
 * Color Contrast Tester Component
 *
 * Interactive testing environment for color contrast verification.
 * Tests WCAG compliance, color blindness simulation, and visual preferences.
 */

/**
 * Union type for active test tabs
 */
type ActiveTestKey = 'compliance' | 'simulation' | 'preferences';

interface TestResult {
  type: 'color_contrast' | 'page_contrast' | 'highlight' | 'clear_highlight';
  foreground?: string;
  background?: string;
  ratio?: string;
  level?: string;
  passed?: boolean;
  message?: string;
  results?: unknown[];
  timestamp: string;
}

type ColorContrastTesterProps = {};

export const ColorContrastTester: React.FC<ColorContrastTesterProps> = () => {
  const [activeTest, setActiveTest] = useState<ActiveTestKey>('compliance');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedColors, setSelectedColors] = useState({
    foreground: '#000000',
    background: '#ffffff',
  });
  const [customElement, setCustomElement] = useState({
    text: 'Sample Text',
    fontSize: 16,
    fontWeight: 'normal',
  });

  const colorContrast = useColorContrastVerification();
  const colorBlindMode = useColorBlindMode();
  const visualPreferences = useVisualAccessibilityPreferences();

  const testContainerRef = useRef<HTMLDivElement>(null);

  const calculateContrast = (foreground: string, background: string) => {
    // Simple contrast calculation for demo
    const getLuminance = (hex: string) => {
      const rgb = hexToRgb(hex);
      if (!rgb) return 0;

      const { r, g, b } = rgb;
      const rs =
        r / 255 <= 0.03928
          ? r / 255 / 12.92
          : Math.pow((r / 255 + 0.055) / 1.055, 2.4);
      const gs =
        g / 255 <= 0.03928
          ? g / 255 / 12.92
          : Math.pow((g / 255 + 0.055) / 1.055, 2.4);
      const bs =
        b / 255 <= 0.03928
          ? b / 255 / 12.92
          : Math.pow((b / 255 + 0.055) / 1.055, 2.4);

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1] ?? '0', 16),
            g: parseInt(result[2] ?? '0', 16),
            b: parseInt(result[3] ?? '0', 16),
          }
        : null;
    };

    const lum1 = getLuminance(foreground);
    const lum2 = getLuminance(background);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  };

  const getContrastLevel = (ratio: number) => {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'AA Large';
    return 'Fail';
  };

  const testColorCombination = () => {
    const ratio = calculateContrast(
      selectedColors.foreground,
      selectedColors.background
    );
    const level = getContrastLevel(ratio);

    const result = {
      type: 'color_contrast' as const,
      foreground: selectedColors.foreground,
      background: selectedColors.background,
      ratio: ratio.toFixed(2),
      level,
      passed: level !== 'Fail',
      timestamp: new Date().toLocaleTimeString(),
    };

    setTestResults((prev) => [...prev, result]);

    // Announce result
    const message = `Contrast ratio ${ratio.toFixed(2)}:1, level ${level}`;
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      speechSynthesis.speak(utterance);
    }
  };

  const runPageContrastCheck = () => {
    const results = colorContrast.checkPageContrast();
    setTestResults((prev) => [
      ...prev,
      {
        type: 'page_contrast',
        message: `Checked ${results.length} elements on page`,
        results: results,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const highlightFailingElements = () => {
    colorContrast.highlightFailingElements(true);
    setTestResults((prev) => [
      ...prev,
      {
        type: 'highlight',
        message: 'Highlighted failing elements on page',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const clearHighlights = () => {
    colorContrast.highlightFailingElements(false);
    setTestResults((prev) => [
      ...prev,
      {
        type: 'clear_highlight',
        message: 'Cleared highlights',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const sampleColorCombinations = [
    {
      name: 'Dark Text on Light Background',
      fg: '#000000',
      bg: '#ffffff',
      expected: 'AAA',
    },
    {
      name: 'Light Text on Dark Background',
      fg: '#ffffff',
      bg: '#000000',
      expected: 'AAA',
    },
    {
      name: 'Gray Text on White',
      fg: '#666666',
      bg: '#ffffff',
      expected: 'AA',
    },
    {
      name: 'Blue Link on White',
      fg: '#1976d2',
      bg: '#ffffff',
      expected: 'AA',
    },
    { name: 'Red Error Text', fg: '#d32f2f', bg: '#ffffff', expected: 'AA' },
    {
      name: 'Green Success Text',
      fg: '#2e7d32',
      bg: '#ffffff',
      expected: 'AA',
    },
    {
      name: 'Orange Warning Text',
      fg: '#ef6c00',
      bg: '#ffffff',
      expected: 'AA',
    },
    {
      name: 'Purple Accent Text',
      fg: '#7b1fa2',
      bg: '#ffffff',
      expected: 'AA',
    },
    { name: 'Teal Info Text', fg: '#00695c', bg: '#ffffff', expected: 'AA' },
    { name: 'Brown Text', fg: '#5d4037', bg: '#ffffff', expected: 'AA' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Color Contrast Testing</h2>
          <p className="text-muted-foreground">
            Interactive testing environment for WCAG color contrast compliance
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={runPageContrastCheck}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium"
          >
            Check Page Contrast
          </button>
          <button
            onClick={highlightFailingElements}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium"
          >
            Highlight Failing
          </button>
          <button
            onClick={clearHighlights}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium"
          >
            Clear Highlights
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          {[
            { key: 'compliance' as const, label: 'WCAG Compliance' },
            { key: 'simulation' as const, label: 'Color Blind Simulation' },
            { key: 'preferences' as const, label: 'Visual Preferences' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTest(tab.key)}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
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
        {activeTest === 'compliance' && (
          <div className="space-y-6">
            {/* Color Picker */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Custom Color Testing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Foreground Color
                    </label>
                    <div className="flex space-x-4">
                      <input
                        type="color"
                        value={selectedColors.foreground}
                        onChange={(e) =>
                          setSelectedColors((prev) => ({
                            ...prev,
                            foreground: e.target.value,
                          }))
                        }
                        className="w-12 h-12 border rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedColors.foreground}
                        onChange={(e) =>
                          setSelectedColors((prev) => ({
                            ...prev,
                            foreground: e.target.value,
                          }))
                        }
                        className="flex-1 p-2 border rounded"
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Background Color
                    </label>
                    <div className="flex space-x-4">
                      <input
                        type="color"
                        value={selectedColors.background}
                        onChange={(e) =>
                          setSelectedColors((prev) => ({
                            ...prev,
                            background: e.target.value,
                          }))
                        }
                        className="w-12 h-12 border rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedColors.background}
                        onChange={(e) =>
                          setSelectedColors((prev) => ({
                            ...prev,
                            background: e.target.value,
                          }))
                        }
                        className="flex-1 p-2 border rounded"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <button
                    onClick={testColorCombination}
                    className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium"
                  >
                    Test Contrast
                  </button>
                </div>

                <div className="space-y-4">
                  <div
                    ref={testContainerRef}
                    className="p-6 rounded border-2 border-dashed"
                    style={{
                      backgroundColor: selectedColors.background,
                      color: selectedColors.foreground,
                      fontSize: `${customElement.fontSize}px`,
                      fontWeight: customElement.fontWeight,
                    }}
                  >
                    <h3 className="font-bold mb-2">Preview</h3>
                    <p>{customElement.text}</p>
                    <div className="mt-4 space-y-2">
                      <p>Normal text size</p>
                      <p className="text-lg">Large text size</p>
                      <p className="font-bold">Bold text</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="range"
                      min="12"
                      max="36"
                      value={customElement.fontSize}
                      onChange={(e) =>
                        setCustomElement((prev) => ({
                          ...prev,
                          fontSize: parseInt(e.target.value),
                        }))
                      }
                      className="w-full"
                    />
                    <select
                      value={customElement.fontWeight}
                      onChange={(e) =>
                        setCustomElement((prev) => ({
                          ...prev,
                          fontWeight: e.target.value,
                        }))
                      }
                      className="p-2 border rounded"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="bolder">Bolder</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    value={customElement.text}
                    onChange={(e) =>
                      setCustomElement((prev) => ({
                        ...prev,
                        text: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Custom text to test"
                  />
                </div>
              </div>
            </div>

            {/* Sample Combinations */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Sample Color Combinations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleColorCombinations.map((combo, index) => {
                  const ratio = calculateContrast(combo.fg, combo.bg);
                  const level = getContrastLevel(ratio);
                  const passed = level !== 'Fail';

                  return (
                    <div key={index} className="p-4 border rounded">
                      <div
                        className="p-3 rounded mb-3"
                        style={{
                          backgroundColor: combo.bg,
                          color: combo.fg,
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <p className="font-semibold">{combo.name}</p>
                        <p className="text-sm">Sample text preview</p>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-xs">
                          <p>Expected: {combo.expected}</p>
                          <p>Actual: {level}</p>
                          <p>Ratio: {ratio.toFixed(2)}:1</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            passed
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedColors({
                            foreground: combo.fg,
                            background: combo.bg,
                          });
                          testColorCombination();
                        }}
                        className="w-full mt-3 px-3 py-2 bg-blue-500 text-white rounded text-sm"
                      >
                        Test This Combination
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTest === 'simulation' && (
          <div className="space-y-6">
            {/* Color Blind Simulation */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">
                Color Blind Mode Simulation
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Test how your color choices appear to users with different types
                of color vision deficiency
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Available Modes</h4>
                  {colorBlindMode.availableModes.map((mode) => (
                    <label
                      key={mode.type}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="color-blind-mode"
                        value={mode.type}
                        checked={
                          colorBlindMode.colorBlindMode.type === mode.type
                        }
                        onChange={(e) =>
                          colorBlindMode.applyColorBlindSimulation({
                            type: e.target.value as
                              | 'none'
                              | 'deuteranopia'
                              | 'protanopia'
                              | 'tritanopia',
                            intensity: colorBlindMode.colorBlindMode.intensity,
                          })
                        }
                        className="text-blue-600"
                      />
                      <div>
                        <span className="font-medium">{mode.name}</span>
                        <p className="text-sm text-muted-foreground">
                          {mode.name}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Intensity Control</h4>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={colorBlindMode.colorBlindMode.intensity}
                    onChange={(e) =>
                      colorBlindMode.applyColorBlindSimulation({
                        type: colorBlindMode.colorBlindMode.type,
                        intensity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Intensity: {colorBlindMode.colorBlindMode.intensity}
                  </p>

                  <button
                    onClick={() =>
                      colorBlindMode.applyColorBlindSimulation({
                        type: 'none',
                        intensity: 0,
                      })
                    }
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium"
                  >
                    Reset Simulation
                  </button>
                </div>
              </div>
            </div>

            {/* Test Colors with Simulation */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">
                Test Colors with Simulation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Foreground Color
                    </label>
                    <input
                      type="color"
                      value={selectedColors.foreground}
                      onChange={(e) =>
                        setSelectedColors((prev) => ({
                          ...prev,
                          foreground: e.target.value,
                        }))
                      }
                      className="w-12 h-12 border rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={selectedColors.background}
                      onChange={(e) =>
                        setSelectedColors((prev) => ({
                          ...prev,
                          background: e.target.value,
                        }))
                      }
                      className="w-12 h-12 border rounded cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={testColorCombination}
                    className="px-4 py-3 bg-green-500 text-white rounded-lg font-medium"
                  >
                    Test with Current Simulation
                  </button>
                </div>

                <div className="space-y-4">
                  <div
                    className="p-6 rounded border-2 border-dashed"
                    style={{
                      backgroundColor: selectedColors.background,
                      color: selectedColors.foreground,
                    }}
                  >
                    <h3 className="font-bold mb-2">Preview with Simulation</h3>
                    <p>
                      This text shows how your colors appear with the current
                      color blind simulation applied.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {sampleColorCombinations.slice(0, 6).map((combo, index) => (
                      <div
                        key={index}
                        className="p-3 rounded border"
                        style={{
                          backgroundColor: combo.bg,
                          color: combo.fg,
                        }}
                      >
                        <p className="text-xs font-medium">{combo.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTest === 'preferences' && (
          <div className="space-y-6">
            {/* Visual Preferences */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">
                Visual Accessibility Preferences
              </h3>

              <div className="space-y-6">
                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">High Contrast Mode</span>
                    <p className="text-sm text-muted-foreground">
                      Enhances color contrast for better visibility
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={visualPreferences.preferences.highContrast}
                    onChange={(e) =>
                      visualPreferences.updatePreference(
                        'highContrast',
                        e.target.checked
                      )
                    }
                    className="text-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Reduce Motion</span>
                    <p className="text-sm text-muted-foreground">
                      Minimizes animations and transitions
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={visualPreferences.preferences.reduceMotion}
                    onChange={(e) =>
                      visualPreferences.updatePreference(
                        'reduceMotion',
                        e.target.checked
                      )
                    }
                    className="text-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Larger Text</span>
                    <p className="text-sm text-muted-foreground">
                      Increases default font size
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={visualPreferences.preferences.largerText}
                    onChange={(e) =>
                      visualPreferences.updatePreference(
                        'largerText',
                        e.target.checked
                      )
                    }
                    className="text-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Focus Indicators</span>
                    <p className="text-sm text-muted-foreground">
                      Enhances keyboard focus visibility
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={visualPreferences.preferences.focusIndicator}
                    onChange={(e) =>
                      visualPreferences.updatePreference(
                        'focusIndicator',
                        e.target.checked
                      )
                    }
                    className="text-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Reading Guide</span>
                    <p className="text-sm text-muted-foreground">
                      Adds a visual guide to help with reading
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={visualPreferences.preferences.readingGuide}
                    onChange={(e) =>
                      visualPreferences.updatePreference(
                        'readingGuide',
                        e.target.checked
                      )
                    }
                    className="text-blue-600"
                  />
                </label>
              </div>
            </div>

            {/* Preference Effects Demo */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-4">Preference Effects Demo</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">High Contrast Demo</h4>
                  <div className="space-y-3">
                    <div className="p-4 border rounded">
                      <p className="font-medium">Normal Contrast</p>
                      <div className="flex space-x-4 mt-2">
                        <span className="px-3 py-2 bg-gray-200 text-gray-800 rounded">
                          Gray Button
                        </span>
                        <span className="px-3 py-2 bg-blue-200 text-blue-800 rounded">
                          Blue Button
                        </span>
                        <span className="px-3 py-2 bg-green-200 text-green-800 rounded">
                          Green Button
                        </span>
                      </div>
                    </div>

                    <div className="p-4 border rounded bg-black text-white">
                      <p className="font-medium">High Contrast</p>
                      <div className="flex space-x-4 mt-2">
                        <span className="px-3 py-2 bg-white text-black rounded">
                          Gray Button
                        </span>
                        <span className="px-3 py-2 bg-blue-600 text-white rounded">
                          Blue Button
                        </span>
                        <span className="px-3 py-2 bg-green-600 text-white rounded">
                          Green Button
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Text Size Demo</h4>
                  <div className="space-y-3">
                    <div className="p-4 border rounded">
                      <p className="font-medium">Normal Text Size</p>
                      <p className="text-sm mt-2">
                        This is sample text at normal size.
                      </p>
                    </div>

                    <div className="p-4 border rounded text-lg">
                      <p className="font-medium">Large Text Size</p>
                      <p className="mt-2">
                        This is sample text at larger size.
                      </p>
                    </div>
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
            <p className="text-muted-foreground">
              No test results yet. Run tests to see results here.
            </p>
          ) : (
            testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.type === 'color_contrast'
                    ? result.passed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">
                      {result.type.replace('_', ' ').toUpperCase()}
                    </h4>
                    {result.type === 'color_contrast' ? (
                      <div className="text-sm text-muted-foreground mt-1">
                        <p>
                          Foreground: {result.foreground} | Background:{' '}
                          {result.background}
                        </p>
                        <p>
                          Ratio: {result.ratio}:1 | Level: {result.level}
                        </p>
                        <p>
                          {result.passed ? '✓ PASSED' : '✗ FAILED'} WCAG
                          compliance
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.message}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {result.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorContrastTester;
