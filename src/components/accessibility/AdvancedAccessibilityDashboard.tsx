import React, { useState, useEffect, useMemo } from 'react';
import { 
  useAccessibilityTesting,
  useColorContrastVerification,
  useColorBlindMode,
  useVisualAccessibilityPreferences,
  highContrastStyles
} from '@/lib/colorContrastVerification';
import { useTradingKeyboardShortcuts } from '@/lib/tradingKeyboardNavigation';
import { useFormAccessibility } from '@/lib/completeAriaLabeling';

/**
 * Type definitions for accessibility hook returns and tab component props
 */

interface AccessibilityTestingType {
  runFullAudit: () => { overallScore: number };
  headings: any[];
  liveRegions: any[];
  tests: any[];
  isValid: boolean;
  getHeadingStats: () => Record<string, number>;
}

interface ContrastResult {
  wcag: 'fail' | 'aa' | 'aaa';
  ratio: number;
  element: { tagName: string };
  text: string;
  background: string;
}

interface ColorContrastType {
  complianceReport: {
    aaCompliance: number;
    total: number;
    passing: number;
    failing: number;
  };
  contrastResults: ContrastResult[];
  checkPageContrast: () => void;
  highlightFailingElements: (isFailing: boolean) => void;
}

interface ColorBlindMode {
  type: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  intensity: number;
}

interface ColorBlindModeType {
  availableModes: readonly [
    { readonly type: 'none'; readonly name: 'Normal Vision' },
    { readonly type: 'protanopia'; readonly name: 'Red-Green (Protanopia)' },
    { readonly type: 'deuteranopia'; readonly name: 'Red-Green (Deuteranopia)' },
    { readonly type: 'tritanopia'; readonly name: 'Blue-Yellow (Tritanopia)' },
    { readonly type: 'achromatopsia'; readonly name: 'Complete Color Blindness' }
  ];
  colorBlindMode: ColorBlindMode;
  applyColorBlindSimulation: (mode: ColorBlindMode) => void;
  resetColorBlindMode?: () => void;
}

interface VisualPreferencesType {
  preferences: {
    highContrast: boolean;
    reduceMotion: boolean;
    largerText: boolean;
    focusIndicator: boolean;
    readingGuide: boolean;
  };
  updatePreference: <K extends 'highContrast' | 'reduceMotion' | 'largerText' | 'focusIndicator' | 'readingGuide'>(key: K, value: boolean) => void;
}

interface TradingShortcut {
  key: string;
  modifiers: { ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean };
  description: string;
  action: () => void;
  category: 'trading' | 'navigation' | 'charts' | 'general';
}

interface KeyboardShortcutsType {
  shortcuts: TradingShortcut[];
  getShortcutsByCategory: (category: 'trading' | 'navigation' | 'charts' | 'general') => TradingShortcut[];
  addShortcut: (shortcut: TradingShortcut) => void;
  removeShortcut: (key: string, modifiers: TradingShortcut['modifiers']) => void;
}

interface FormField {
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
}

interface FormAccessibilityType {
  formFields: FormField[];
}

/**
 * Tab Component Props Interfaces
 */

interface OverviewTabProps {
  accessibilityTesting: AccessibilityTestingType;
  colorContrast: ColorContrastType;
  keyboardShortcuts: KeyboardShortcutsType;
  formAccessibility: FormAccessibilityType;
  onShowShortcuts: () => void;
  onShowFormAccessibility: () => void;
}

interface ScreenReaderTabProps {
  accessibilityTesting: AccessibilityTestingType;
}

interface KeyboardNavigationTabProps {
  keyboardShortcuts: KeyboardShortcutsType;
  colorBlindMode: ColorBlindModeType;
  visualPreferences: VisualPreferencesType;
}

interface ColorContrastTabProps {
  colorContrast: ColorContrastType;
  colorBlindMode: ColorBlindModeType;
  visualPreferences: VisualPreferencesType;
}

interface AriaLabelsTabProps {
  formAccessibility: FormAccessibilityType;
}

/**
 * Advanced Accessibility Dashboard
 * 
 * Comprehensive accessibility monitoring and controls for TradeX Pro.
 * Includes screen reader testing, keyboard navigation, color contrast,
 * and ARIA labeling verification.
 */

export function AdvancedAccessibilityDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'screen-reader' | 'keyboard' | 'contrast' | 'aria'>('overview');
  const [isExpanded, setIsExpanded] = useState(false);

  // Accessibility hooks
  const accessibilityTesting = useAccessibilityTesting();
  const colorContrast = useColorContrastVerification();
  const colorBlindMode = useColorBlindMode();
  const visualPreferences = useVisualAccessibilityPreferences();
  const keyboardShortcuts = useTradingKeyboardShortcuts();
  const formAccessibility = useFormAccessibility();

  // Apply high contrast styles if needed
  useEffect(() => {
    if (visualPreferences.preferences.highContrast) {
      const style = document.createElement('style');
      style.textContent = highContrastStyles;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [visualPreferences.preferences.highContrast]);

  const overallScore = useMemo(() => {
    return accessibilityTesting.runFullAudit();
  }, [accessibilityTesting]);

  // Handlers for quick action buttons
  const showShortcuts = () => {
    setActiveTab('keyboard');
  };

  const showFormAccessibility = () => {
    setActiveTab('aria');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Advanced Accessibility Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive accessibility monitoring and controls</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium"
          >
            {isExpanded ? 'Collapse' : 'Expand'} View
          </button>
          <button
            onClick={() => accessibilityTesting.runFullAudit()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium"
          >
            Run Full Audit
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="font-semibold mb-2">Overall Score</h3>
          <p className="text-3xl font-bold">{overallScore.overallScore.toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground">Accessibility compliance</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="font-semibold mb-2">WCAG AA Compliance</h3>
          <p className="text-3xl font-bold">{colorContrast.complianceReport.aaCompliance.toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground">Color contrast ratio</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="font-semibold mb-2">Keyboard Navigation</h3>
          <p className="text-3xl font-bold">{keyboardShortcuts.shortcuts.length}</p>
          <p className="text-sm text-muted-foreground">Available shortcuts</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="font-semibold mb-2">Form Accessibility</h3>
          <p className="text-3xl font-bold">{formAccessibility.formFields.length}</p>
          <p className="text-sm text-muted-foreground">Enhanced form fields</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'screen-reader', label: 'Screen Reader' },
            { key: 'keyboard', label: 'Keyboard Navigation' },
            { key: 'contrast', label: 'Color Contrast' },
            { key: 'aria', label: 'ARIA Labels' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === tab.key
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
        {activeTab === 'overview' && (
          <OverviewTab 
            accessibilityTesting={accessibilityTesting}
            colorContrast={colorContrast}
            keyboardShortcuts={keyboardShortcuts}
            formAccessibility={formAccessibility}
            onShowShortcuts={showShortcuts}
            onShowFormAccessibility={showFormAccessibility}
          />
        )}

        {activeTab === 'screen-reader' && (
          <ScreenReaderTab accessibilityTesting={accessibilityTesting} />
        )}

        {activeTab === 'keyboard' && (
          <KeyboardNavigationTab 
            keyboardShortcuts={keyboardShortcuts}
            colorBlindMode={colorBlindMode}
            visualPreferences={visualPreferences}
          />
        )}

        {activeTab === 'contrast' && (
          <ColorContrastTab 
            colorContrast={colorContrast}
            colorBlindMode={colorBlindMode}
            visualPreferences={visualPreferences}
          />
        )}

        {activeTab === 'aria' && (
          <AriaLabelsTab formAccessibility={formAccessibility} />
        )}
      </div>
    </div>
  );
}

/* Tab Components */

function OverviewTab({
  accessibilityTesting,
  colorContrast,
  keyboardShortcuts,
  formAccessibility,
  onShowShortcuts,
  onShowFormAccessibility
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => accessibilityTesting.runFullAudit()}
          className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
        >
          <h4 className="font-semibold text-blue-900">Run Full Audit</h4>
          <p className="text-sm text-blue-700">Comprehensive accessibility check</p>
        </button>
        
        <button
          onClick={() => colorContrast.checkPageContrast()}
          className="p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
        >
          <h4 className="font-semibold text-green-900">Check Contrast</h4>
          <p className="text-sm text-green-700">WCAG compliance verification</p>
        </button>
        
        <button
          onClick={onShowShortcuts}
          type="button"
          className="p-6 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
          aria-label={`Show ${keyboardShortcuts.shortcuts.length} keyboard shortcuts`}
        >
          <h4 className="font-semibold text-purple-900">Keyboard Shortcuts</h4>
          <p className="text-sm text-purple-700">{keyboardShortcuts.shortcuts.length} available</p>
        </button>
        
        <button
          onClick={onShowFormAccessibility}
          type="button"
          className="p-6 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100"
          aria-label={`Show ${formAccessibility.formFields.length} enhanced form fields`}
        >
          <h4 className="font-semibold text-orange-900">Form Accessibility</h4>
          <p className="text-sm text-orange-700">{formAccessibility.formFields.length} enhanced</p>
        </button>
      </div>

      {/* Recent Issues */}
      <div className="bg-card rounded-lg p-6 border">
        <h3 className="font-semibold mb-4">Recent Accessibility Issues</h3>
        <div className="space-y-3">
          {colorContrast.contrastResults
            .filter((result: any) => result.wcag === 'fail')
            .slice(0, 5)
            .map((result: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded">
                <div>
                  <p className="font-medium text-red-900">Low contrast ratio: {result.ratio.toFixed(2)}:1</p>
                  <p className="text-sm text-red-700">Element: {result.element.tagName}</p>
                </div>
                <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                  Fix
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function ScreenReaderTab({ accessibilityTesting }: ScreenReaderTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Heading Hierarchy</h4>
          <p className="text-2xl font-bold">{accessibilityTesting.headings.length}</p>
          <p className="text-sm text-muted-foreground">
            {accessibilityTesting.isValid ? 'Valid hierarchy' : 'Issues detected'}
          </p>
        </div>
        
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Live Regions</h4>
          <p className="text-2xl font-bold">{accessibilityTesting.liveRegions.length}</p>
          <p className="text-sm text-muted-foreground">ARIA live regions</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Screen Reader Tests</h4>
          <p className="text-2xl font-bold">{accessibilityTesting.tests.length}</p>
          <p className="text-sm text-muted-foreground">Automated tests</p>
        </div>
      </div>

      {/* Heading Statistics */}
      <div className="bg-card rounded-lg p-6 border">
        <h4 className="font-semibold mb-4">Heading Statistics</h4>
        <div className="grid grid-cols-6 gap-4">
          {Object.entries(accessibilityTesting.getHeadingStats()).map(([level, count]) => (
            <div key={level} className="text-center p-4 bg-muted rounded">
              <p className="font-semibold">H{level.charAt(1)}</p>
              <p className="text-2xl font-bold">{count as number}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KeyboardNavigationTab({ keyboardShortcuts, colorBlindMode, visualPreferences }: KeyboardNavigationTabProps) {
  return (
    <div className="space-y-6">
      {/* Trading Shortcuts */}
      <div className="bg-card rounded-lg p-6 border">
        <h4 className="font-semibold mb-4">Trading Keyboard Shortcuts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {keyboardShortcuts.getShortcutsByCategory('trading').map((shortcut: any, index: number) => (
            <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{shortcut.description}</span>
                <span className="px-2 py-1 bg-blue-600 text-white rounded text-sm">
                  {shortcut.key}
                </span>
              </div>
              <p className="text-sm text-blue-700">Category: {shortcut.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-4">Color Blind Mode</h4>
          <div className="space-y-3">
            {colorBlindMode.availableModes.map((mode: any) => (
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

        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-4">Visual Preferences</h4>
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
            
            <label className="flex items-center justify-between">
              <div>
                <span className="font-medium">Larger Text</span>
                <p className="text-sm text-muted-foreground">Increase font size</p>
              </div>
              <input
                type="checkbox"
                checked={visualPreferences.preferences.largerText}
                onChange={(e) => visualPreferences.updatePreference('largerText', e.target.checked)}
                className="text-blue-600"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorContrastTab({ colorContrast, colorBlindMode, visualPreferences }: ColorContrastTabProps) {
  return (
    <div className="space-y-6">
      {/* Compliance Report */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Total Elements</h4>
          <p className="text-3xl font-bold">{colorContrast.complianceReport.total}</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Passing</h4>
          <p className="text-3xl font-bold text-green-600">{colorContrast.complianceReport.passing}</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Failing</h4>
          <p className="text-3xl font-bold text-red-600">{colorContrast.complianceReport.failing}</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">AA Compliance</h4>
          <p className="text-3xl font-bold">{colorContrast.complianceReport.aaCompliance.toFixed(0)}%</p>
        </div>
      </div>

      {/* Contrast Results */}
      <div className="bg-card rounded-lg p-6 border">
        <h4 className="font-semibold mb-4">Contrast Results</h4>
        <div className="space-y-3">
          {colorContrast.contrastResults.slice(0, 10).map((result: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 border rounded">
              <div className="flex items-center space-x-4">
                <span 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: result.background }}
                />
                <span 
                  className="px-2 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: result.text }}
                >
                  Text
                </span>
                <span className="text-sm">Ratio: {result.ratio.toFixed(2)}:1</span>
                <span 
                  className={`px-2 py-1 rounded text-white text-xs ${
                    result.wcag === 'aaa' ? 'bg-green-600' :
                    result.wcag === 'aa' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                >
                  {result.wcag.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => colorContrast.highlightFailingElements(result.wcag === 'fail')}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                Highlight
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AriaLabelsTab({ formAccessibility }: AriaLabelsTabProps) {
  return (
    <div className="space-y-6">
      {/* Form Fields */}
      <div className="bg-card rounded-lg p-6 border">
        <h4 className="font-semibold mb-4">Enhanced Form Fields</h4>
        <div className="space-y-3">
          {formAccessibility.formFields.slice(0, 10).map((field: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">{field.label}</p>
                {field.description && (
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                {field.required && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">Required</span>
                )}
                {field.readonly && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">Read-only</span>
                )}
                {field.disabled && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">Disabled</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ARIA Labeling Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Form Fields</h4>
          <p className="text-2xl font-bold">{formAccessibility.formFields.length}</p>
          <p className="text-sm text-muted-foreground">Enhanced with ARIA</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Labels</h4>
          <p className="text-2xl font-bold">
            {formAccessibility.formFields.filter((f: any) => f.label).length}
          </p>
          <p className="text-sm text-muted-foreground">With proper labels</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Required Fields</h4>
          <p className="text-2xl font-bold">
            {formAccessibility.formFields.filter((f: any) => f.required).length}
          </p>
          <p className="text-sm text-muted-foreground">Marked as required</p>
        </div>
      </div>
    </div>
  );
}

export default AdvancedAccessibilityDashboard;
