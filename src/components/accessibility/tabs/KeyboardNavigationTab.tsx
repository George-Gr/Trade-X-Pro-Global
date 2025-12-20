import type {
  ColorBlindMode,
  ColorBlindModeType,
  KeyboardShortcutsType,
  TradingShortcut,
  VisualPreferencesType,
} from '../types';

export interface KeyboardNavigationTabProps {
  keyboardShortcuts: KeyboardShortcutsType;
  colorBlindMode: ColorBlindModeType;
  visualPreferences: VisualPreferencesType;
}

export function KeyboardNavigationTab({
  keyboardShortcuts,
  colorBlindMode,
  visualPreferences,
}: KeyboardNavigationTabProps) {
  return (
    <div className="space-y-6">
      {/* Trading Shortcuts */}
      <div className="bg-card rounded-lg p-6 border">
        <h4 className="font-semibold mb-4">Trading Keyboard Shortcuts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {keyboardShortcuts
            .getShortcutsByCategory('trading')
            .map((shortcut: TradingShortcut, index: number) => (
              <div
                key={index}
                className="p-4 bg-blue-50 border border-blue-200 rounded"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                    {shortcut.description as string}
                  </span>
                  <span className="px-2 py-1 bg-blue-600 text-white rounded text-sm">
                    {shortcut.key as string}
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Category: {shortcut.category as string}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Visual Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-4">Color Blind Mode</h4>
          <div className="space-y-3">
            {colorBlindMode.availableModes.map(
              (mode: { readonly type: string; readonly name: string }) => (
                <label key={mode.type} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="color-blind-mode"
                    value={mode.type}
                    checked={colorBlindMode.colorBlindMode.type === mode.type}
                    onChange={(e) =>
                      colorBlindMode.applyColorBlindSimulation({
                        type: e.target.value as ColorBlindMode['type'],
                        intensity: colorBlindMode.colorBlindMode.intensity,
                      })
                    }
                    className="text-blue-600"
                  />
                  <span>{mode.name}</span>
                </label>
              )
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-4">Visual Preferences</h4>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="font-medium">High Contrast</span>
                <p className="text-sm text-muted-foreground">
                  Enhanced color contrast
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
                  Minimize animations
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
                  Increase font size
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
          </div>
        </div>
      </div>
    </div>
  );
}
