import React, { useState, useRef } from 'react';
import { FormsTab } from './feature/FormsTab';
import { RolesTab } from './feature/RolesTab';
import { LiveRegionsTab } from './feature/LiveRegionsTab';
import { ValidationTab } from './feature/ValidationTab';
import { TestResults } from './feature/TestResults';
import type { TestResult, FormData, FormErrors, InputRefs } from './types';

/**
 * ARIA Label Tester Component
 * 
 * Interactive testing environment for ARIA labeling and form accessibility.
 * Tests form field labeling, dynamic content, ARIA roles, and validation.
 * 
 * This component coordinates state management and renders tab-specific components.
 */
export function AriaLabelTester() {
  const [activeTest, setActiveTest] = useState<'forms' | 'roles' | 'live' | 'validation'>('forms');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
    newsletter: false,
    country: '',
    bio: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const inputRefs = useRef<InputRefs>({});

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.country) {
      newErrors.country = 'Please select a country';
    }
    
    if (!formData.terms) {
      newErrors.terms = 'You must accept the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update form field and clear associated error
  const updateForm = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Test ARIA label on element - checks for proper label association patterns
  const testAriaLabel = (element: HTMLElement, fieldName: string) => {
    const elementId = element.id;
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledby = element.getAttribute('aria-labelledby');
    
    // Check for aria-label (explicit label)
    const hasAriaLabel = !!ariaLabel && ariaLabel.trim().length > 0;
    
    // Check for aria-labelledby (label reference)
    let hasAriaLabelledby = false;
    let ariaLabelledbyText = '';
    if (ariaLabelledby) {
      const labelElement = document.getElementById(ariaLabelledby);
      if (labelElement) {
        ariaLabelledbyText = labelElement.textContent?.trim() || '';
        hasAriaLabelledby = ariaLabelledbyText.length > 0;
      }
    }
    
    // Check for associated label element via htmlFor/id pairing
    let hasAssociatedLabel = false;
    let associatedLabelText = '';
    if (elementId) {
      const associatedLabel = document.querySelector(`label[for="${elementId}"]`);
      if (associatedLabel) {
        associatedLabelText = associatedLabel.textContent?.trim() || '';
        hasAssociatedLabel = associatedLabelText.length > 0;
      }
    }
    
    // Element is properly labeled if it has ANY of the valid labeling patterns
    const isProperlyLabeled = hasAriaLabel || hasAriaLabelledby || hasAssociatedLabel;
    
    const labelingMethod = hasAriaLabel ? 'aria-label' : 
                          hasAriaLabelledby ? 'aria-labelledby' : 
                          hasAssociatedLabel ? 'label-htmlFor' : 'none';
    
    const actualLabel = ariaLabel || ariaLabelledbyText || associatedLabelText || '';
    
    setTestResults(prev => [...prev, {
      type: 'aria_label',
      element: element.tagName.toLowerCase(),
      expected: `${fieldName} (any valid label)`,
      actual: actualLabel || `(no label found - ${labelingMethod})`,
      passed: isProperlyLabeled,
      message: isProperlyLabeled 
        ? `Field properly labeled via ${labelingMethod}` 
        : `Field missing proper label association (checked: aria-label, aria-labelledby, label[htmlFor])`,
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    return isProperlyLabeled;
  };

  // Test form accessibility
  const testFormAccessibility = () => {
    Object.entries(inputRefs.current).forEach(([field, element]) => {
      if (element) {
        testAriaLabel(element, field);
      }
    });
    
    setTestResults(prev => [...prev, {
      type: 'form_test',
      message: 'Form accessibility test completed',
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Clear test results
  const clearResults = () => {
    setTestResults([]);
  };

  // Announce message to screen reader
  const announceToScreenReader = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Submit form
  const submitForm = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (validateForm()) {
      setTestResults(prev => [...prev, {
        type: 'form_submit',
        message: 'Form submitted successfully',
        data: formData,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      announceToScreenReader('Form submitted successfully');
    } else {
      announceToScreenReader('Please fix the form errors before submitting');
    }
  };

  const tabProps = {
    formData,
    setFormData,
    errors,
    setErrors,
    inputRefs,
    testResults,
    setTestResults,
    onValidateForm: validateForm,
    onUpdateForm: updateForm,
    onAnnounceToScreenReader: announceToScreenReader,
    onSubmitForm: submitForm
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">ARIA Label Testing</h2>
          <p className="text-muted-foreground">
            Interactive testing environment for ARIA labeling and form accessibility
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={testFormAccessibility}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium"
          >
            Test Form Accessibility
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          {[
            { key: 'forms', label: 'Form Accessibility' },
            { key: 'roles', label: 'ARIA Roles' },
            { key: 'live', label: 'Live Regions' },
            { key: 'validation', label: 'Error Validation' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTest(tab.key as typeof activeTest)}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTest === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTest === 'forms' && <FormsTab {...tabProps} />}
        {activeTest === 'roles' && <RolesTab {...tabProps} />}
        {activeTest === 'live' && <LiveRegionsTab {...tabProps} />}
        {activeTest === 'validation' && <ValidationTab {...tabProps} />}
      </div>

      {/* Test Results */}
      <TestResults testResults={testResults} onClearResults={clearResults} />
    </div>
  );
}

export default AriaLabelTester;
