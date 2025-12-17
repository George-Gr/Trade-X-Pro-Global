/**
 * Shared TypeScript types and interfaces for accessibility testing components
 */

import type { MutableRefObject, FormEvent } from 'react';

/**
 * Represents a single test result from accessibility testing
 */
export interface TestResult {
  type: string;
  element?: string;
  expected?: string;
  actual?: string;
  passed?: boolean;
  message: string;
  timestamp: string;
  data?: unknown;
}

/**
 * Form data structure for the ARIA label tester form
 */
export interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
  newsletter: boolean;
  country: string;
  bio: string;
}

/**
 * Form validation errors mapped to form fields
 */
export type FormErrors = Partial<Record<keyof FormData, string>>;

/**
 * References to input form elements
 */
export interface InputRefs {
  username?: HTMLInputElement | null;
  email?: HTMLInputElement | null;
  password?: HTMLInputElement | null;
  confirmPassword?: HTMLInputElement | null;
  country?: HTMLSelectElement | null;
  bio?: HTMLTextAreaElement | null;
  terms?: HTMLInputElement | null;
  newsletter?: HTMLInputElement | null;
}

/**
 * Properties for tab components
 */
export interface TabComponentProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: FormErrors;
  setErrors: (errors: FormErrors) => void;
  inputRefs: MutableRefObject<InputRefs>;
  testResults: TestResult[];
  setTestResults: (results: TestResult[]) => void;
  onValidateForm: () => boolean;
  onUpdateForm: (field: keyof FormData, value: FormData[keyof FormData]) => void;
  onAnnounceToScreenReader: (message: string) => void;
  onSubmitForm?: (e?: React.FormEvent) => void;
}
