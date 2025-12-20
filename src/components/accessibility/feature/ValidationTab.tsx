import type { TabComponentProps } from '@/components/accessibility/types';

/**
 * ValidationTab Component
 *
 * Demonstrates form validation and error handling patterns.
 * Shows error states, success states, and validation summary.
 */
export function ValidationTab(_props: TabComponentProps) {
  return (
    <div className="space-y-6">
      {/* Error Validation Testing */}
      <div className="bg-card rounded-lg p-6 border">
        <h3 className="font-semibold mb-4">Error Validation Examples</h3>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Form Error States</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Invalid Email
                </label>
                <input
                  type="email"
                  defaultValue="invalid-email"
                  aria-invalid="true"
                  aria-describedby="email-error"
                  className="w-full p-3 border border-red-500 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <div
                  id="email-error"
                  className="text-sm text-red-600 mt-1"
                  role="alert"
                  aria-live="polite"
                >
                  Please enter a valid email address
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Required Field
                </label>
                <input
                  type="text"
                  aria-required="true"
                  aria-invalid="true"
                  aria-describedby="required-error"
                  className="w-full p-3 border border-red-500 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <div
                  id="required-error"
                  className="text-sm text-red-600 mt-1"
                  role="alert"
                  aria-live="polite"
                >
                  This field is required
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Success States</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Valid Email
                </label>
                <input
                  type="email"
                  defaultValue="user@example.com"
                  aria-invalid="false"
                  aria-describedby="email-success"
                  className="w-full p-3 border border-green-500 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <div id="email-success" className="text-sm text-green-600 mt-1">
                  ✓ Email format is valid
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      <div className="bg-card rounded-lg p-6 border">
        <h3 className="font-semibold mb-4">Validation Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Required fields have aria-required="true"</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            <span>Invalid fields have aria-invalid="true"</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 bg-blue-500 rounded-full" />
            <span>Error messages use role="alert" and aria-live="polite"</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 bg-purple-500 rounded-full" />
            <span>Success messages provide positive feedback</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValidationTab;
