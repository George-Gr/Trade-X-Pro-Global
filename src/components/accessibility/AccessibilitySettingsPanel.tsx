import type { AccessibilityPreferences } from '@/components/accessibility/WCAGAAAEnhancer';
import { useAccessibilityPreferences } from '@/hooks/useAccessibilityPreferences';
import { cn } from '@/lib/utils';
import type { FC } from 'react';

interface AccessibilitySettingsPanelProps {
  className?: string;
}

/**
 * AccessibilitySettingsPanel provides UI controls for users to customize
 * accessibility preferences including high contrast, large fonts, reduced motion,
 * enhanced focus indicators, and color vision modes.
 *
 * @param props - Component props
 * @param props.className - Optional additional CSS classes to apply to the panel
 */
export const AccessibilitySettingsPanel: FC<
  AccessibilitySettingsPanelProps
> = ({ className }) => {
  const { preferences, updatePreference } = useAccessibilityPreferences();

  return (
    <div className={cn('accessibility-settings', className)}>
      <h2 className="text-lg font-semibold mb-4">Accessibility Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="high-contrast">High Contrast</label>
          <input
            id="high-contrast"
            type="checkbox"
            checked={preferences.highContrast}
            onChange={(e) => updatePreference('highContrast', e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="large-fonts">Large Fonts</label>
          <input
            id="large-fonts"
            type="checkbox"
            checked={preferences.largeFonts}
            onChange={(e) => updatePreference('largeFonts', e.target.checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="reduced-motion">Reduced Motion</label>
          <input
            id="reduced-motion"
            type="checkbox"
            checked={preferences.reducedMotion}
            onChange={(e) =>
              updatePreference('reducedMotion', e.target.checked)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="enhanced-focus">Enhanced Focus Indicators</label>
          <input
            id="enhanced-focus"
            type="checkbox"
            checked={preferences.focusIndicatorEnhanced}
            onChange={(e) =>
              updatePreference('focusIndicatorEnhanced', e.target.checked)
            }
          />
        </div>

        <div>
          <label htmlFor="colorblind-mode">Color Vision Mode</label>
          <select
            id="colorblind-mode"
            value={preferences.colorBlindMode}
            onChange={(e) =>
              updatePreference(
                'colorBlindMode',
                e.target.value as AccessibilityPreferences['colorBlindMode']
              )
            }
            className="mt-1 block w-full"
          >
            <option value="none">Normal Vision</option>
            <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
            <option value="protanopia">Protanopia (Red-Blind)</option>
            <option value="tritanopia">Tritanopia (Blue-Blind)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
