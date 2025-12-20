import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface AccessibilityPreferences {
  fontSize: number;
  contrast: string;
  fontFamily: string;
  [key: string]: unknown;
}

interface AccessibilityStatusIndicatorProps {
  report: Record<string, unknown> | null;
  preferences: AccessibilityPreferences;
}

export function AccessibilityStatusIndicator({
  report,
  preferences,
}: AccessibilityStatusIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (!report) return null;

  const compliance = report.compliance as Record<string, unknown>;
  const score = typeof report.score === 'number' ? report.score : 0;
  const issues = Array.isArray(report.issues) ? report.issues : [];

  const highContrast = preferences.highContrast === true;
  const largeFonts = preferences.largeFonts === true;
  const reducedMotion = preferences.reducedMotion === true;
  const colorBlindMode = (preferences.colorBlindMode as string) || 'none';

  return (
    <div className="accessibility-status fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold">Accessibility Status</h3>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isVisible ? '−' : '+'}
        </button>
      </div>

      {isVisible && (
        <div className="p-3">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">WCAG Score</span>
              <span
                className={`text-sm font-bold ${
                  score >= 95
                    ? 'text-green-600'
                    : score >= 90
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  score >= 95
                    ? 'bg-green-500'
                    : score >= 90
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
            <div
              className={cn(
                'p-2 rounded text-center',
                compliance.wcagAA
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              )}
            >
              <div className="font-medium">WCAG AA</div>
              <div>{compliance.wcagAA ? '✓' : '✗'}</div>
            </div>
            <div
              className={cn(
                'p-2 rounded text-center',
                compliance.wcagAAA
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              )}
            >
              <div className="font-medium">WCAG AAA</div>
              <div>{compliance.wcagAAA ? '✓' : '✗'}</div>
            </div>
            <div
              className={cn(
                'p-2 rounded text-center',
                compliance.section508
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              )}
            >
              <div className="font-medium">Section 508</div>
              <div>{compliance.section508 ? '✓' : '✗'}</div>
            </div>
          </div>

          {highContrast && (
            <div className="mb-2 p-2 bg-blue-50 text-blue-800 rounded text-xs">
              High contrast mode enabled
            </div>
          )}

          {largeFonts && (
            <div className="mb-2 p-2 bg-blue-50 text-blue-800 rounded text-xs">
              Large fonts enabled
            </div>
          )}

          {reducedMotion && (
            <div className="mb-2 p-2 bg-blue-50 text-blue-800 rounded text-xs">
              Reduced motion enabled
            </div>
          )}

          {colorBlindMode !== 'none' && (
            <div className="mb-2 p-2 bg-blue-50 text-blue-800 rounded text-xs">
              Color vision: {colorBlindMode}
            </div>
          )}

          {issues.length > 0 && (
            <div className="mb-2">
              <h4 className="text-xs font-semibold text-red-600 mb-1">
                Issues ({issues.length})
              </h4>
              <div className="space-y-1">
                {issues.slice(0, 2).map((issue: unknown, index: number) => (
                  <div key={index} className="text-xs text-red-600">
                    • {String(issue)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
