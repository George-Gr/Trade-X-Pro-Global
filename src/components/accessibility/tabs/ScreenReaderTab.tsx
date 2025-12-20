import type { AccessibilityTestingType } from '@/components/accessibility/types';
import React from 'react';

export interface ScreenReaderTabProps {
  accessibilityTesting: AccessibilityTestingType;
}

/**
 * Screen Reader Tab Component
 *
 * Displays accessibility testing metrics for screen reader compatibility including
 * heading hierarchy validation, ARIA live regions count, and automated test results.
 * Shows detailed heading statistics (H1-H6 distribution) for semantic structure analysis.
 *
 * @component
 * @param {ScreenReaderTabProps} props - Component props
 * @param {AccessibilityTestingType} props.accessibilityTesting - Accessibility testing data and utilities
 * @returns {JSX.Element} Screen reader testing dashboard
 */
export const ScreenReaderTab: React.FC<ScreenReaderTabProps> = ({
  accessibilityTesting,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Heading Hierarchy</h4>
          <p className="text-2xl font-bold">
            {accessibilityTesting.headings.length}
          </p>
          <p className="text-sm text-muted-foreground">
            {accessibilityTesting.isValid
              ? 'Valid hierarchy'
              : 'Issues detected'}
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Live Regions</h4>
          <p className="text-2xl font-bold">
            {accessibilityTesting.liveRegions.length}
          </p>
          <p className="text-sm text-muted-foreground">ARIA live regions</p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Screen Reader Tests</h4>
          <p className="text-2xl font-bold">
            {accessibilityTesting.tests.length}
          </p>
          <p className="text-sm text-muted-foreground">Automated tests</p>
        </div>
      </div>

      {/* Heading Statistics */}
      <div className="bg-card rounded-lg p-6 border">
        <h4 className="font-semibold mb-4">Heading Statistics</h4>
        <div className="grid grid-cols-6 gap-4">
          {Object.entries(accessibilityTesting.getHeadingStats()).map(
            ([level, count]: [string, number]) => (
              <div key={level} className="text-center p-4 bg-muted rounded">
                <p className="font-semibold">H{level.charAt(1)}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
