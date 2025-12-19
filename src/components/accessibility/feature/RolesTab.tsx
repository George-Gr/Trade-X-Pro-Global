import type { TabComponentProps } from '@/components/accessibility/types';
import { useState, type KeyboardEvent, type MouseEvent } from 'react';

/**
 * RolesTab Component
 *
 * Demonstrates ARIA roles and their usage.
 * Includes examples of interactive elements, navigation, and live regions.
 */
export function RolesTab({
  formData,
  setFormData,
  errors,
  setErrors,
  inputRefs,
  testResults,
  setTestResults,
  onValidateForm,
  onUpdateForm,
  onAnnounceToScreenReader,
  onSubmitForm,
}: TabComponentProps) {
  // State for the interactive slider
  const [sliderValue, setSliderValue] = useState(50);
  const sliderMin = 0;
  const sliderMax = 100;
  const sliderStep = 5;

  /**
   * Handle keyboard input for slider control
   * Supports: Arrow keys (Left/Down decrement, Right/Up increment), Home (min), End (max)
   */
  const handleSliderKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        setSliderValue((prev) => Math.max(sliderMin, prev - sliderStep));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        setSliderValue((prev) => Math.min(sliderMax, prev + sliderStep));
        break;
      case 'Home':
        e.preventDefault();
        setSliderValue(sliderMin);
        break;
      case 'End':
        e.preventDefault();
        setSliderValue(sliderMax);
        break;
      default:
        break;
    }
  };

  /**
   * Handle mouse/pointer input for slider dragging
   */
  const handleSliderMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const slider = e.currentTarget;
    const rect = slider.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    const newValue = Math.round(
      Math.max(sliderMin, Math.min(sliderMax, percentage))
    );
    setSliderValue(newValue);
  };
  return (
    <div className="space-y-6">
      {/* ARIA Roles Examples */}
      <div className="bg-card rounded-lg p-6 border">
        <h3 className="font-semibold mb-4">ARIA Roles Examples</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Interactive Elements</h4>
            <div className="space-y-3">
              <button
                role="button"
                aria-label="Primary action button"
                className="w-full p-3 bg-blue-500 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                Primary Button
              </button>

              <button
                role="button"
                aria-pressed="false"
                className="w-full p-3 bg-gray-500 text-white rounded-lg focus:ring-2 focus:ring-gray-500"
              >
                Toggle Button
              </button>

              <div
                role="slider"
                aria-label="Volume control"
                aria-valuemin={sliderMin}
                aria-valuemax={sliderMax}
                aria-valuenow={sliderValue}
                tabIndex={0}
                onKeyDown={handleSliderKeyDown}
                onMouseDown={handleSliderMouseDown}
                className="w-full h-8 bg-gray-200 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              />
              <div className="text-sm text-gray-600 mt-2">
                Volume: {sliderValue}%
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Navigation Elements</h4>
            <nav role="navigation" aria-label="Main navigation">
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    role="link"
                    className="block p-3 bg-blue-50 border border-blue-200 rounded"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    role="link"
                    className="block p-3 bg-green-50 border border-green-200 rounded"
                  >
                    Portfolio
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    role="link"
                    className="block p-3 bg-purple-50 border border-purple-200 rounded"
                  >
                    Settings
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Live Region Examples */}
      <div className="bg-card rounded-lg p-6 border">
        <h3 className="font-semibold mb-4">Live Region Examples</h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Polite Live Region</h4>
            <div
              aria-live="polite"
              className="p-4 border rounded bg-blue-50 border-blue-200"
            >
              This content will be announced to screen readers when it changes,
              but won't interrupt the user.
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Assertive Live Region</h4>
            <div
              aria-live="assertive"
              className="p-4 border rounded bg-red-50 border-red-200"
            >
              This content will interrupt the user when it changes. Use for
              important alerts.
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Status Region</h4>
            <div
              role="status"
              aria-live="polite"
              className="p-4 border rounded bg-green-50 border-green-200"
            >
              This is a status message that provides information about the state
              of an operation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RolesTab;
