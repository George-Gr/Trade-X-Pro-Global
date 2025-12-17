import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Complete ARIA Labeling System for TradeX Pro
 * 
 * Comprehensive ARIA labeling, dynamic content announcements,
 * form accessibility enhancement, and chart/data accessibility.
 */

interface AriaLabel {
  id: string;
  element: HTMLElement;
  label: string;
  description?: string;
  role?: string;
  live?: 'polite' | 'assertive' | 'off';
  busy?: boolean;
  expanded?: boolean;
  checked?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  level?: number;
  orientation?: 'horizontal' | 'vertical';
  valuemin?: number;
  valuemax?: number;
  valuenow?: number;
  valuetext?: string;
}

interface FormFieldAria {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  autocomplete?: string;
  pattern?: string;
  minlength?: number;
  maxlength?: number;
}

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ChartData {
  title?: string;
  type?: 'line' | 'bar' | string;
  axes?: { x?: { label?: string }; y?: { label?: string } };
  data?: ChartDataPoint[];
  interactive?: boolean;
  currentIndex?: number;
  trend?: string;
}

export function useCompleteAriaLabeling() {
  const [ariaLabels, setAriaLabels] = useState<AriaLabel[]>([]);
  const [formFields, setFormFields] = useState<FormFieldAria[]>([]);
  const [liveRegions, setLiveRegions] = useState<HTMLElement[]>([]);
  const clearTimeoutRef = useRef<number | null>(null);

  const getAccessibleName = useCallback((element: Element): string => {
    // 1. aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // 2. aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent?.trim() || '';
    }

    // 3. label element
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
      const input = element as HTMLInputElement;
      const label = input.labels?.[0];
      if (label) return label.textContent?.trim() || '';
    }

    // 4. title attribute
    const title = element.getAttribute('title');
    if (title) return title;

    // 5. text content
    const textContent = element.textContent?.trim();
    if (textContent) return textContent;

    // 6. alt attribute (for images)
    if (element.tagName === 'IMG') {
      const alt = (element as HTMLImageElement).alt;
      if (alt) return alt;
    }

    return '';
  }, []);

  const enhanceFormField = useCallback((input: HTMLElement, field: FormFieldAria) => {
    // Set aria-label if not present
    if (!input.getAttribute('aria-label')) {
      input.setAttribute('aria-label', field.label);
    }

    // Set aria-required
    if (field.required) {
      input.setAttribute('aria-required', 'true');
    }

    // Set aria-readonly
    if (field.readonly) {
      input.setAttribute('aria-readonly', 'true');
    }

    // Set aria-disabled
    if (field.disabled) {
      input.setAttribute('aria-disabled', 'true');
    }

    // Set autocomplete
    if (field.autocomplete) {
      input.setAttribute('autocomplete', field.autocomplete);
    }

    // Set pattern
    if (field.pattern) {
      input.setAttribute('pattern', field.pattern);
    }

    // Set min/max length
    if (field.minlength !== undefined) {
      input.setAttribute('minlength', field.minlength.toString());
    }
    if (field.maxlength !== undefined) {
      input.setAttribute('maxlength', field.maxlength.toString());
    }

    // Create error message element if needed
    if (field.error) {
      const errorId = `${input.id || input.getAttribute('name')}-error`;
      let errorElement = document.getElementById(errorId);
      
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'sr-only';
        errorElement.setAttribute('role', 'alert');
        errorElement.textContent = field.error;
        input.parentNode?.appendChild(errorElement);
      }

      input.setAttribute('aria-describedby', errorId);
      input.setAttribute('aria-invalid', 'true');
      }
    }, []);

  const enhanceButton = useCallback((button: HTMLElement, ariaLabel: AriaLabel) => {
    // Set aria-label if not present
    if (!button.getAttribute('aria-label')) {
      button.setAttribute('aria-label', ariaLabel.label);
    }

    // Set aria-busy
    if (ariaLabel.busy) {
      button.setAttribute('aria-busy', 'true');
    }

    // Set aria-disabled
    if (ariaLabel.disabled) {
      button.setAttribute('aria-disabled', 'true');
    }

    // Set aria-hidden
    if (ariaLabel.hidden) {
      button.setAttribute('aria-hidden', 'true');
    }
  }, []);

  // Auto-discover and enhance existing elements
  useEffect(() => {
    const discoverElements = () => {
      const newLabels: AriaLabel[] = [];
      const newFormFields: FormFieldAria[] = [];
      const newLiveRegions: HTMLElement[] = [];

      // Discover form fields
      const formInputs = document.querySelectorAll('input, textarea, select');
      formInputs.forEach((input, index) => {
        const id = input.id || `form-field-${index}`;
        const labelElement = (input as HTMLInputElement).labels?.[0] || 
          document.querySelector(`label[for="${input.id}"]`) ||
          input.closest('label');
        
        let labelText = '';
        if (labelElement) {
          labelText = labelElement.textContent?.trim() || '';
        } else {
          // Look for adjacent text
          const sibling = input.previousElementSibling;
          if (sibling && sibling.nodeType === Node.ELEMENT_NODE) {
            labelText = sibling.textContent?.trim() || '';
          }
        }

        const field: FormFieldAria = {
          id,
          label: labelText || (input as HTMLInputElement).placeholder || 'Input field',
          description: input.getAttribute('aria-describedby') 
            ? document.getElementById(input.getAttribute('aria-describedby')!)?.textContent || ''
            : '',
          required: input.hasAttribute('required'),
          readonly: input.hasAttribute('readonly'),
          disabled: input.hasAttribute('disabled'),
          autocomplete: input.getAttribute('autocomplete') || undefined,
          pattern: input.getAttribute('pattern') || undefined,
          minlength: input.getAttribute('minlength') ? parseInt(input.getAttribute('minlength')!) : undefined,
          maxlength: input.getAttribute('maxlength') ? parseInt(input.getAttribute('maxlength')!) : undefined
        };

        newFormFields.push(field);

        // Enhance the input with proper ARIA attributes
        enhanceFormField(input as HTMLElement, field);
      });

      // Discover buttons and interactive elements
      const buttons = document.querySelectorAll('button, [role="button"], a[href]');
      buttons.forEach((button, index) => {
        const label = getAccessibleName(button);
        const description = button.getAttribute('title') || 
          button.getAttribute('aria-describedby') ||
          button.textContent?.trim() || '';

        const ariaLabel: AriaLabel = {
          id: button.id || `button-${index}`,
          element: button as HTMLElement,
          label,
          description,
          role: button.getAttribute('role') || button.tagName.toLowerCase(),
          busy: button.getAttribute('aria-busy') === 'true',
          disabled: button.getAttribute('aria-disabled') === 'true',
          hidden: button.getAttribute('aria-hidden') === 'true'
        };

        newLabels.push(ariaLabel);
        enhanceButton(button as HTMLElement, ariaLabel);
      });

      // Discover live regions
      const liveElements = document.querySelectorAll('[aria-live]');
      liveElements.forEach(element => {
        newLiveRegions.push(element as HTMLElement);
      });

      setAriaLabels(newLabels);
      setFormFields(newFormFields);
      setLiveRegions(newLiveRegions);
    };

    discoverElements();

    // Watch for new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          // New elements added, re-discover
          setTimeout(discoverElements, 100);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      if (clearTimeoutRef.current !== null) {
        clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = null;
      }
    }; 
  }, [getAccessibleName, enhanceFormField, enhanceButton]);

  // Dynamic content announcer
  const announceContentChange = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Find or create live region
    let liveRegion = document.getElementById('dynamic-content-live-region');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'dynamic-content-live-region';
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;

    // Clear any existing pending timeout
    if (clearTimeoutRef.current !== null) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }

    clearTimeoutRef.current = setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = '';
      }
      clearTimeoutRef.current = null;
    }, 1000);
  }, []);

  // Chart accessibility enhancer
  const createChartDataDescription = useCallback((chartData: ChartData): string => {
    let description = '';

    if (chartData.title) {
      description += `Chart titled "${chartData.title}". `;
    }

    if (chartData.type) {
      description += `This is a ${chartData.type} chart. `;
    }

    if (chartData.axes) {
      description += `X-axis represents ${chartData.axes?.x?.label || 'values'}. `;
      description += `Y-axis represents ${chartData.axes?.y?.label || 'values'}. `;
    }

    if (chartData.data && chartData.data.length) {
      description += `The chart contains ${chartData.data.length} data points. `;
      
      // Add key insights
      if (chartData.type === 'line' || chartData.type === 'bar') {
        const values = chartData.data.map(d => d.value);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const maxPoint = chartData.data.find(d => d.value === maxValue);
        const minPoint = chartData.data.find(d => d.value === minValue);

        if (maxPoint) description += `Highest value is ${maxValue} at ${maxPoint.label}. `;
        if (minPoint) description += `Lowest value is ${minValue} at ${minPoint.label}. `;
      }
    }

    if (chartData.trend) {
      description += `The overall trend is ${chartData.trend}. `;
    }

    return description;
  }, []);

  const highlightChartPoint = useCallback((chartData: ChartData, index: number) => {
    // This would integrate with your charting library
    // For example, with Chart.js or D3.js
    // No-op placeholder for accessibility enhancement
    // Implementation depends on chart library integration
  }, []);
  const handleChartNavigation = useCallback((event: KeyboardEvent, chartData: ChartData) => {
    const key = event.key;
    let newIndex = -1;

    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = Math.min((chartData.currentIndex ?? 0) + 1, (chartData.data?.length ?? 1) - 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = Math.max((chartData.currentIndex ?? 0) - 1, 0);
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = (chartData.data?.length ?? 1) - 1;
        break;
    }

    if (newIndex >= 0 && chartData.data && chartData.data.length) {
      chartData.currentIndex = newIndex;
      const currentPoint = chartData.data[newIndex];

      // Announce current point
      announceContentChange(
        `Selected point ${newIndex + 1} of ${chartData.data.length}. ${currentPoint.label}: ${currentPoint.value}`,
        'polite'
      );

      // Highlight current point (implementation depends on chart library)
      highlightChartPoint(chartData, newIndex);
    }
  }, [announceContentChange, highlightChartPoint]);

  const enhanceChartAccessibility = useCallback((chartElement: HTMLElement, chartData: ChartData) => {
    // Set chart role and label
    chartElement.setAttribute('role', 'img');
    chartElement.setAttribute('aria-label', chartData.title || 'Chart');

    // Create detailed description
    const description = createChartDataDescription(chartData);
    const descId = `${chartElement.id}-description`;
    chartElement.setAttribute('aria-describedby', descId);

    // Create or update description element
    let descElement = document.getElementById(descId);
    if (!descElement) {
      descElement = document.createElement('div');
      descElement.id = descId;
      descElement.className = 'sr-only';
      descElement.textContent = description;
      chartElement.appendChild(descElement);
    } else {
      descElement.textContent = description;
    }

    // Add keyboard navigation for interactive charts
    if (chartData.interactive) {
      const keyHandler = (event: KeyboardEvent) => handleChartNavigation(event, chartData);
      chartElement.addEventListener('keydown', keyHandler);

      // Return cleanup function to remove event listener
      return () => chartElement.removeEventListener('keydown', keyHandler);
    }

    // Return no-op cleanup function for non-interactive charts
    return () => {};
  }, [createChartDataDescription, handleChartNavigation]);

  return {
    ariaLabels,
    formFields,
    liveRegions,
    getAccessibleName,
    enhanceFormField,
    enhanceButton,
    announceContentChange,
    enhanceChartAccessibility,
    createChartDataDescription
  };
}

/**
 * Form Accessibility Enhancer
 */
export function useFormAccessibility() {
  const ariaLabeling = useCompleteAriaLabeling();

  const validateInput = useCallback((input: HTMLElement) => {
    const value = (input as HTMLInputElement).value;
    const required = input.hasAttribute('required');
    const pattern = input.getAttribute('pattern');
    const minlength = input.getAttribute('minlength');
    const maxlength = input.getAttribute('maxlength');

    let error = '';

    if (required && !value.trim()) {
      error = 'This field is required';
    } else if (pattern && !new RegExp(pattern).test(value)) {
      error = 'Invalid format';
    } else if (minlength && value.length < parseInt(minlength)) {
      error = `Minimum length is ${minlength} characters`;
    } else if (maxlength && value.length > parseInt(maxlength)) {
      error = `Maximum length is ${maxlength} characters`;
    }

    if (error) {
      input.setAttribute('aria-invalid', 'true');
      const errorId = `${input.id || input.getAttribute('name')}-error`;
      let errorElement = document.getElementById(errorId);
      
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'sr-only';
        errorElement.setAttribute('role', 'alert');
        input.parentNode?.appendChild(errorElement);
      }

      errorElement.textContent = error;
      input.setAttribute('aria-describedby', errorId);
      
      ariaLabeling.announceContentChange?.(error, 'assertive');
    }
  }, [ariaLabeling]);

  const validateFormAccessibility = useCallback((formElement: HTMLFormElement) => {
    const issues: string[] = [];
    
    const inputs = formElement.querySelectorAll('input, textarea, select');
    inputs.forEach((input, index) => {
      const id = input.id || input.getAttribute('name');
      const hasLabel = ((input as HTMLInputElement).labels?.length ?? 0) > 0 || 
        Boolean(input.getAttribute('aria-label')) ||
        Boolean(input.getAttribute('aria-labelledby'));

      if (!hasLabel) {
        issues.push(`Input ${index + 1} (${id || 'unnamed'}) is missing a label`);
      }

      // Check for required field indicators
      if (input.hasAttribute('required') && !input.getAttribute('aria-required')) {
        issues.push(`Input ${index + 1} is required but missing aria-required="true"`);
      }

      // Check for error messages
      const errorId = input.getAttribute('aria-describedby');
      if (input.getAttribute('aria-invalid') === 'true' && !errorId) {
        issues.push(`Input ${index + 1} has errors but no error message is associated`);
      }
    });

    return issues;
  }, []);

  const enhanceFormValidation = useCallback((formElement: HTMLFormElement) => {
    // Named handler for form submit
    const handleSubmit = (event: SubmitEvent) => {
      const issues = validateFormAccessibility(formElement);
      
      if (issues.length > 0) {
        event.preventDefault();
        
        // Announce errors
        issues.forEach(issue => {
          ariaLabeling.announceContentChange?.(issue, 'assertive');
        });

        // Focus first invalid field
        const firstInvalid = formElement.querySelector('[aria-invalid="true"]') as HTMLElement;
        if (firstInvalid) {
          firstInvalid.focus();
        }
      }
    };

    // Named handlers for input events
    const inputHandlers = new Map<HTMLElement, { blur: () => void; input: () => void }>();

    // Real-time validation
    const inputs = formElement.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const blurHandler = () => {
        validateInput(input as HTMLElement);
      };

      const inputHandler = () => {
        // Clear error state on input
        input.removeAttribute('aria-invalid');
        const errorId = input.getAttribute('aria-describedby');
        if (errorId) {
          const errorElement = document.getElementById(errorId);
          if (errorElement) {
            errorElement.textContent = '';
          }
        }
      };

      input.addEventListener('blur', blurHandler);
      input.addEventListener('input', inputHandler);

      // Store handlers for cleanup
      inputHandlers.set(input as HTMLElement, { blur: blurHandler, input: inputHandler });
    });

    // Add submit listener
    formElement.addEventListener('submit', handleSubmit);

    // Return cleanup function
    return () => {
      // Remove submit listener
      formElement.removeEventListener('submit', handleSubmit);

      // Remove all input event listeners
      inputHandlers.forEach(({ blur, input }, element) => {
        element.removeEventListener('blur', blur);
        element.removeEventListener('input', input);
      });

      // Clear the map
      inputHandlers.clear();
    };
  }, [validateFormAccessibility, ariaLabeling, validateInput]);

  return {
    ariaLabels: ariaLabeling.ariaLabels,
    formFields: ariaLabeling.formFields,
    liveRegions: ariaLabeling.liveRegions,
    getAccessibleName: ariaLabeling.getAccessibleName,
    enhanceFormField: ariaLabeling.enhanceFormField,
    enhanceButton: ariaLabeling.enhanceButton,
    announceContentChange: ariaLabeling.announceContentChange,
    enhanceChartAccessibility: ariaLabeling.enhanceChartAccessibility,
    createChartDataDescription: ariaLabeling.createChartDataDescription,
    validateFormAccessibility,
    enhanceFormValidation,
    validateInput
  };
}

export default {
  useCompleteAriaLabeling,
  useFormAccessibility
};