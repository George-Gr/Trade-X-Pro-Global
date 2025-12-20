import type {
  AccessibilityTestingType,
  ColorContrastType,
  ContrastResult,
  FormAccessibilityType,
  KeyboardShortcutsType,
} from '../types';

export interface OverviewTabProps {
  accessibilityTesting: AccessibilityTestingType;
  colorContrast: ColorContrastType;
  keyboardShortcuts: KeyboardShortcutsType;
  formAccessibility: FormAccessibilityType;
  onShowShortcuts: () => void;
  onShowFormAccessibility: () => void;
}

/**
 * OverviewTab component displays an overview of accessibility features and metrics
 * @param props - Component props containing accessibility data and handlers
 * @returns JSX.Element
 */
export function OverviewTab({
  accessibilityTesting,
  colorContrast,
  keyboardShortcuts,
  formAccessibility,
  onShowShortcuts,
  onShowFormAccessibility,
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
          <p className="text-sm text-blue-700">
            Comprehensive accessibility check
          </p>
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
          <p className="text-sm text-purple-700">
            {keyboardShortcuts.shortcuts.length} available
          </p>
        </button>

        <button
          onClick={onShowFormAccessibility}
          type="button"
          className="p-6 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100"
          aria-label={`Show ${formAccessibility.formFields.length} enhanced form fields`}
        >
          <h4 className="font-semibold text-orange-900">Form Accessibility</h4>
          <p className="text-sm text-orange-700">
            {formAccessibility.formFields.length} enhanced
          </p>
        </button>
      </div>

      {/* Recent Issues */}
      <div className="bg-card rounded-lg p-6 border">
        <h3 className="font-semibold mb-4">Recent Accessibility Issues</h3>
        <div className="space-y-3">
          {colorContrast.contrastResults
            .filter((result: ContrastResult) => result.wcag === 'fail')
            .slice(0, 5)
            .map((result: ContrastResult, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded"
              >
                <div>
                  <p className="font-medium text-red-900">
                    Low contrast ratio: {(result.ratio as number).toFixed(2)}:1
                  </p>
                  <p className="text-sm text-red-700">
                    Element: {(result.element as HTMLElement).tagName}
                  </p>
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
