import React from 'react';
import type { TabComponentProps } from '../types';

/**
 * LiveRegionsTab Component
 * 
 * Demonstrates dynamic content updates and live regions.
 * Tests progress indicators, status messages, and modal dialogs.
 */
export function LiveRegionsTab({
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
  onSubmitForm
}: TabComponentProps) {
  return (
    <div className="space-y-6">
      {/* Dynamic Content Testing */}
      <div className="bg-card rounded-lg p-6 border">
        <h3 className="font-semibold mb-4">Dynamic Content Testing</h3>
        
        {/* Dedicated live region for announcements */}
        <div 
          id="announcement-region"
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        />
        
        <div className="space-y-4">
          <div className="flex space-x-4">
            <button
              onClick={() => onAnnounceToScreenReader('Content updated: New notification received')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Update Content (Polite)
            </button>
            
            <button
              onClick={() => onAnnounceToScreenReader('ALERT: Critical system notification')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Critical Alert (Assertive)
            </button>
            
            <button
              onClick={() => onAnnounceToScreenReader('Loading complete')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Status Update
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-medium mb-2">Progress Indicator</h4>
              <div 
                role="progressbar"
                aria-valuenow={75}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Loading progress"
                className="w-full bg-gray-200 rounded-full h-4"
              >
                <div className="bg-blue-600 h-4 rounded-full w-3/4" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">75% complete</p>
            </div>
            
            <div className="p-4 border rounded">
              <h4 className="font-medium mb-2">Search Results</h4>
              <div 
                role="status"
                aria-live="polite"
                className="text-sm text-muted-foreground"
              >
                Showing 1-10 of 150 results
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog Testing */}
      <div className="bg-card rounded-lg p-6 border">
        <h3 className="font-semibold mb-4">Modal Dialog Testing</h3>
        
        <div className="space-y-4">
          <button
            onClick={() => {
              // Simulate modal opening
              onAnnounceToScreenReader('Modal dialog opened. Press Escape to close.');
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg"
            aria-haspopup="dialog"
            aria-controls="test-modal"
          >
            Open Modal Dialog
          </button>
          
          <div 
            id="test-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="hidden p-6 bg-white border rounded-lg"
          >
            <h3 id="modal-title" className="font-semibold text-lg mb-4">
              Test Modal Dialog
            </h3>
            <p className="text-muted-foreground mb-4">
              This is a modal dialog example with proper ARIA attributes.
            </p>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                Confirm
              </button>
              <button className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveRegionsTab;
