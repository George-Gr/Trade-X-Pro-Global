import {
  highContrastStyles,
  useAccessibilityTesting,
  useColorBlindMode,
  useColorContrastVerification,
  useVisualAccessibilityPreferences,
} from '@/lib/colorContrastVerification';
import { useFormAccessibility } from '@/lib/completeAriaLabeling';
import { useTradingKeyboardShortcuts } from '@/lib/tradingKeyboardNavigation';
import { useEffect, useMemo, useState } from 'react';
import {
  AriaLabelsTab,
  ColorContrastTab,
  KeyboardNavigationTab,
  OverviewTab,
  ScreenReaderTab,
} from './tabs';
/**
 * Advanced Accessibility Dashboard
 *
 * Comprehensive accessibility monitoring and controls for TradeX Pro.
 * Includes screen reader testing, keyboard navigation, color contrast,
 * and ARIA labeling verification.
 *
 * This component orchestrates tab components and manages state/hooks
 * for accessibility features. Tab content components are extracted
 * to maintain modularity and keep this file focused on orchestration.
 */
export function AdvancedAccessibilityDashboard() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'screen-reader' | 'keyboard' | 'contrast' | 'aria'
  >('overview');
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
    return undefined;
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
          <h1 className="text-2xl font-bold">
            Advanced Accessibility Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive accessibility monitoring and controls
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium"
          >
            {isExpanded ? 'Collapse' : 'Expand'} View
          </button>
          <button
            onClick={() => accessibilityTesting.runFullAudit()}
            className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-lg font-medium"
          >
            Run Full Audit
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-6 border">
          <h3 className="font-semibold mb-2">Overall Score</h3>
          <p className="text-3xl font-bold">
            {overallScore.overallScore.toFixed(0)}%
          </p>
          <p className="text-sm text-muted-foreground">
            Accessibility compliance
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h3 className="font-semibold mb-2">WCAG AA Compliance</h3>
          <p className="text-3xl font-bold">
            {colorContrast.complianceReport.aaCompliance.toFixed(0)}%
          </p>
          <p className="text-sm text-muted-foreground">Color contrast ratio</p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h3 className="font-semibold mb-2">Keyboard Navigation</h3>
          <p className="text-3xl font-bold">
            {keyboardShortcuts.shortcuts.length}
          </p>
          <p className="text-sm text-muted-foreground">Available shortcuts</p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h3 className="font-semibold mb-2">Form Accessibility</h3>
          <p className="text-3xl font-bold">
            {formAccessibility.formFields.length}
          </p>
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
            { key: 'aria', label: 'ARIA Labels' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                  : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border))]'
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
          <ColorContrastTab colorContrast={colorContrast} />
        )}

        {activeTab === 'aria' && (
          <AriaLabelsTab formAccessibility={formAccessibility} />
        )}
      </div>
    </div>
  );
}

export default AdvancedAccessibilityDashboard;
