import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import {
  ArticleSection,
  MainContent,
  NavigationSection,
} from '../accessibility/SemanticHTMLEnhancer';
import {
  AccessibilitySettingsPanel,
  WCAGAAAEnhancer,
} from '../accessibility/WCAGAAAEnhancer';
import { AccessibilityStatusIndicator } from './AccessibilityStatusIndicator';
import { EnhancedAccessibilityFeatures } from './EnhancedAccessibilityFeatures';

interface AccessibilityIntegrationProps {
  children: React.ReactNode;
  enableAccessibility?: boolean;
  enableEnhancedFeatures?: boolean;
  enableSettingsPanel?: boolean;
  customPreferences?: {
    highContrast?: boolean;
    largeFonts?: boolean;
    reducedMotion?: boolean;
    colorBlindMode?: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  };
}

export function AccessibilityIntegration({
  children,
  enableAccessibility = true,
  enableEnhancedFeatures = true,
  enableSettingsPanel = false,
  customPreferences = {},
}: AccessibilityIntegrationProps) {
  const [accessibilityReport, setAccessibilityReport] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const wcagEnhancer = WCAGAAAEnhancer.getInstance();

  useEffect(() => {
    if (!enableAccessibility) {
      return;
    }

    // Apply custom preferences if provided
    Object.entries(customPreferences).forEach(([key, value]) => {
      if (value !== undefined) {
        wcagEnhancer.updatePreference(
          key as keyof typeof customPreferences,
          value
        );
      }
    });

    // Generate accessibility report
    const report = wcagEnhancer.generateAccessibilityReport();
    setAccessibilityReport(report);

    // Setup accessibility monitoring
    const handlePreferenceChange = () => {
      // Handle accessibility preference changes silently
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Track keyboard navigation usage
        wcagEnhancer.updatePreference('keyboardNavigationOptimized', true);
      }
    };

    document.addEventListener(
      'accessibilityPreferenceChanged',
      handlePreferenceChange
    );
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener(
        'accessibilityPreferenceChanged',
        handlePreferenceChange
      );
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enableAccessibility, customPreferences, wcagEnhancer]);

  // Early return for disabled accessibility
  if (!enableAccessibility) {
    return <div className="accessibility-disabled">{children}</div>;
  }

  return (
    <div
      className={cn('accessibility-container', {
        'accessibility-enabled': enableAccessibility,
        'enhanced-features': enableEnhancedFeatures,
        'high-contrast': wcagEnhancer.getPreferences().highContrast,
        'large-fonts': wcagEnhancer.getPreferences().largeFonts,
        'reduced-motion': wcagEnhancer.getPreferences().reducedMotion,
        [`colorblind-${wcagEnhancer.getPreferences().colorBlindMode}`]:
          wcagEnhancer.getPreferences().colorBlindMode !== 'none',
      })}
    >
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      {/* Main content wrapper with semantic HTML */}
      <div id="main-content">
        <MainContent ariaLabel="Main content">{children}</MainContent>
      </div>

      {/* Accessibility settings panel */}
      {enableSettingsPanel && (
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50 hover:bg-blue-700 transition-colors"
          aria-expanded={isSettingsOpen}
          aria-controls="accessibility-settings-panel"
          aria-label="Open accessibility settings"
        >
          Accessibility Settings
        </button>
      )}

      {isSettingsOpen && enableSettingsPanel && (
        <AccessibilitySettingsPanel className="fixed top-16 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-40" />
      )}

      {/* Accessibility status indicator */}
      {enableAccessibility && (
        <AccessibilityStatusIndicator
          report={accessibilityReport}
          preferences={wcagEnhancer.getPreferences()}
        />
      )}

      {/* Enhanced features for accessibility */}
      {enableEnhancedFeatures && <EnhancedAccessibilityFeatures />}
    </div>
  );
}

// Semantic HTML wrapper for better structure
export function AccessibleSection({
  children,
  title,
  level = 2,
  id,
  landmark = true,
}: {
  children: React.ReactNode;
  title: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  id?: string;
  landmark?: boolean;
}) {
  return (
    <ArticleSection
      title={title}
      headingLevel={level}
      id={id}
      landmark={landmark}
      ariaLabel={title}
    >
      {children}
    </ArticleSection>
  );
}

// Accessible navigation component
export function AccessibleNavigation({
  children,
  ariaLabel = 'Main navigation',
}: {
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <NavigationSection ariaLabel={ariaLabel}>{children}</NavigationSection>
  );
}

// High contrast mode toggle
export function HighContrastToggle() {
  const wcagEnhancer = WCAGAAAEnhancer.getInstance();
  const preferences = wcagEnhancer.getPreferences();

  return (
    <button
      onClick={() =>
        wcagEnhancer.updatePreference('highContrast', !preferences.highContrast)
      }
      className={cn(
        'px-4 py-2 rounded border-2 transition-colors',
        preferences.highContrast
          ? 'bg-black text-white border-white'
          : 'bg-white text-black border-black hover:bg-gray-100'
      )}
      aria-pressed={preferences.highContrast}
      aria-label={`${
        preferences.highContrast ? 'Disable' : 'Enable'
      } high contrast mode`}
    >
      {preferences.highContrast
        ? 'Disable High Contrast'
        : 'Enable High Contrast'}
    </button>
  );
}
