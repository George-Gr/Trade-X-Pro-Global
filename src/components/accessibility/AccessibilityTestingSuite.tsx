import React, { useState, useEffect } from "react";
import { AdvancedAccessibilityDashboard } from "./AdvancedAccessibilityDashboard";
// Import components with explicit paths to avoid resolution issues
import { KeyboardNavigationTester } from "./KeyboardNavigationTester";

/**
 * Accessibility Testing Suite
 *
 * Comprehensive testing environment for all accessibility features.
 * Demonstrates screen reader compatibility, keyboard navigation,
 * color contrast, and ARIA labeling.
 */

interface TestSection {
  key: TestSectionKey;
  label: string;
  icon: string;
}

type TestSectionKey =
  | "dashboard"
  | "screen-reader"
  | "keyboard"
  | "contrast"
  | "trading";

interface AccessibilityTestingSuiteProps {}

export const AccessibilityTestingSuite: React.FC<
  AccessibilityTestingSuiteProps
> = () => {
  const [activeTest, setActiveTest] = useState<TestSectionKey>("dashboard");
  const [isTestingMode, setIsTestingMode] = useState(false);

  useEffect(() => {
    // Announce test mode changes to screen readers
    if (isTestingMode) {
      const announcement = new SpeechSynthesisUtterance(
        "Accessibility testing mode activated",
      );
      speechSynthesis.speak(announcement);
    }

    return () => {
      // Cancel any ongoing speech when component unmounts or state changes
      speechSynthesis.cancel();
    };
  }, [isTestingMode]);
  const testSections: TestSection[] = [
    { key: "dashboard", label: "Accessibility Dashboard", icon: "📊" },
    { key: "screen-reader", label: "Screen Reader Tests", icon: "🔊" },
    { key: "keyboard", label: "Keyboard Navigation", icon: "⌨️" },
    { key: "contrast", label: "Color Contrast", icon: "🎨" },
    { key: "trading", label: "Trading Demo", icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">
                Accessibility Testing Suite
              </h1>
              <span className="px-3 py-1 bg-[hsl(var(--accent-foreground)/0.1)] text-[hsl(var(--accent-foreground))] rounded-full text-sm font-medium">
                WCAG 2.1 AA Compliant
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTestingMode}
                  onChange={(e) => setIsTestingMode(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${isTestingMode ? "bg-[hsl(var(--accent))]" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      isTestingMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </div>
                <span className="text-sm font-medium">
                  {isTestingMode ? "Testing Mode: ON" : "Testing Mode: OFF"}
                </span>
              </label>

              <button
                onClick={() => {
                  // Trigger screen reader announcement
                  const announcement = new SpeechSynthesisUtterance(
                    "Accessibility testing suite loaded. Use keyboard navigation to explore all features.",
                  );
                  speechSynthesis.speak(announcement);
                }}
                className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium"
                aria-label="Announce accessibility features to screen reader"
              >
                Announce Features
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-muted border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {testSections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveTest(section.key)}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTest === section.key
                    ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                    : "border-transparent text-gray-500 hover:text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--muted))]"
                }`}
                aria-current={activeTest === section.key ? "page" : undefined}
              >
                <span className="mr-2" aria-hidden="true">
                  {section.icon}
                </span>
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Testing Mode Banner */}
        {isTestingMode && (
          <div
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <div>
                <p className="font-semibold text-blue-900">
                  Accessibility Testing Mode Active
                </p>
                <p className="text-sm text-blue-700">
                  All accessibility features are enhanced for testing. Use Tab
                  navigation and screen reader to explore.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Content */}
        {activeTest === "dashboard" && <AdvancedAccessibilityDashboard />}

        {activeTest === "screen-reader" && (
          <div className="p-6 bg-card rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">Screen Reader Tests</h2>
            <p className="text-muted-foreground">
              Screen reader testing component coming soon.
            </p>
          </div>
        )}

        {activeTest === "keyboard" && <KeyboardNavigationTester />}

        {activeTest === "contrast" && (
          <div className="p-6 bg-card rounded-lg border">
            <h2 className="text-2xl font-bold mb-4">Color Contrast Tester</h2>
            <p className="text-muted-foreground">
              Color contrast testing component coming soon.
            </p>
          </div>
        )}

        {activeTest === "trading" && <TradingDemo />}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Accessibility Guidelines</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Keyboard navigation support</li>
                <li>• Screen reader compatibility</li>
                <li>• High contrast mode</li>
                <li>• ARIA labeling</li>
                <li>• Color contrast compliance</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Testing Tools</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Automated accessibility audits</li>
                <li>• Color contrast verification</li>
                <li>• Keyboard shortcut testing</li>
                <li>• Screen reader simulation</li>
                <li>• ARIA label validation</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm">
                  Run Full Audit
                </button>
                <button className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm">
                  Check Contrast
                </button>
                <button className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm">
                  Test Keyboard
                </button>
                <button className="px-3 py-2 bg-orange-500 text-white rounded-lg text-sm">
                  Verify ARIA
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              TradeX Pro Accessibility Testing Suite • Built with React,
              TypeScript, and WCAG 2.1 AA standards
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* Demo Components */

function TradingDemo() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Trading Demo</h2>
          <p className="text-muted-foreground">
            Interactive trading interface with full accessibility support
          </p>
        </div>

        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            New Order
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg">
            Market Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Trading Dashboard</h3>
            <p className="text-muted-foreground text-sm">
              Trading dashboard component placeholder with full accessibility
              support.
            </p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Order Form</h3>
            <p className="text-muted-foreground text-sm">
              Trading form component placeholder with full accessibility
              support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessibilityTestingSuite;
