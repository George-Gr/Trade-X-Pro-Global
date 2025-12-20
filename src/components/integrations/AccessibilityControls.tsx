import React, { useEffect, useState } from 'react';
import { WCAGAAAEnhancer } from '../accessibility/WCAGAAAEnhancer';

/**
 * FontSizeControl component - Provides buttons to adjust document font size for accessibility
 *
 * Allows users to increase, decrease, or reset the base font size from 12px to 24px.
 * Changes are applied to the document root and preferences are saved via WCAGAAAEnhancer.
 *
 * @component
 * @returns {React.ReactElement} A div containing three buttons for font size adjustment
 */
export function FontSizeControl() {
  const wcagEnhancer = WCAGAAAEnhancer.getInstance();

  const increaseFont = () => {
    const currentSize = parseInt(
      document.documentElement.style.fontSize || '16'
    );
    const newSize = Math.min(currentSize + 2, 24);
    document.documentElement.style.fontSize = `${newSize}px`;
  };

  const decreaseFont = () => {
    const currentSize = parseInt(
      document.documentElement.style.fontSize || '16'
    );
    const newSize = Math.max(currentSize - 2, 12);
    document.documentElement.style.fontSize = `${newSize}px`;
  };

  const resetFont = () => {
    document.documentElement.style.fontSize = '16px';
    wcagEnhancer.updatePreference('largeFonts', false);
  };

  return (
    <div className="font-size-controls flex gap-2">
      <button
        onClick={decreaseFont}
        className="px-3 py-1 border-[hsl(var(--border))] border rounded hover:bg-[hsl(var(--muted))]"
        aria-label="Decrease font size"
      >
        A-
      </button>
      <button
        onClick={resetFont}
        className="px-3 py-1 border-[hsl(var(--border))] border rounded hover:bg-[hsl(var(--muted))]"
        aria-label="Reset font size"
      >
        A
      </button>
      <button
        onClick={increaseFont}
        className="px-3 py-1 border-[hsl(var(--border))] border rounded hover:bg-[hsl(var(--muted))]"
        aria-label="Increase font size"
      >
        A+
      </button>
    </div>
  );
}

/**
 * ColorBlindModeSelector component - Dropdown to select color vision simulation mode
 *
 * Displays a select dropdown with four color vision modes: Normal Vision, Deuteranopia,
 * Protanopia, and Tritanopia. Selection updates user preferences and applies visual filters.
 * Subscribes to accessibility preference changes to keep state synchronized.
 *
 * @component
 * @returns {React.ReactElement} A select dropdown for color blindness mode selection
 */
export function ColorBlindModeSelector() {
  const wcagEnhancer = WCAGAAAEnhancer.getInstance();
  const [colorBlindMode, setColorBlindMode] = useState(
    () => wcagEnhancer.getPreferences().colorBlindMode
  );

  const modes = [
    { value: 'none', label: 'Normal Vision' },
    { value: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
    { value: 'protanopia', label: 'Protanopia (Red-Blind)' },
    { value: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
  ];

  useEffect(() => {
    // Subscribe to preference changes
    const handlePreferenceChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.preferences) {
        setColorBlindMode(customEvent.detail.preferences.colorBlindMode);
      }
    };

    document.addEventListener(
      'accessibilityPreferenceChanged',
      handlePreferenceChange
    );

    // Return cleanup function to unsubscribe
    return () => {
      document.removeEventListener(
        'accessibilityPreferenceChanged',
        handlePreferenceChange
      );
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as
      | 'none'
      | 'deuteranopia'
      | 'protanopia'
      | 'tritanopia';
    setColorBlindMode(newValue);
    wcagEnhancer.updatePreference('colorBlindMode', newValue);
  };

  return (
    <select
      value={colorBlindMode}
      onChange={handleChange}
      className="px-3 py-1 border-[hsl(var(--border))] border rounded"
      aria-label="Select color vision mode"
    >
      {modes.map((mode) => (
        <option key={mode.value} value={mode.value}>
          {mode.label}
        </option>
      ))}
    </select>
  );
}
