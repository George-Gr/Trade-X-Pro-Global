/**
 * Shared TypeScript types and interfaces for accessibility testing components
 */

import type { MutableRefObject, FormEvent } from 'react';
import type { ScreenReaderTest } from '../../lib/advancedAccessibility';

/**
 * Type definitions for accessibility hook returns and tab component props
 */

export interface AccessibilityTestingType {
  runFullAudit: () => { overallScore: number };
  headings: HTMLElement[];
  liveRegions: HTMLElement[];
  tests: ScreenReaderTest[];
  isValid: boolean;
  getHeadingStats: () => Record<string, number>;
}

export interface ContrastResult {
  wcag: 'fail' | 'aa' | 'aaa';
  ratio: number;
  element: { tagName: string };
  text: string;
  background: string;
}

export interface ColorContrastType {
  complianceReport: {
    aaCompliance: number;
    total: number;
    passing: number;
    failing: number;
  };
  contrastResults: ContrastResult[];
  checkPageContrast: () => void;
  highlightFailingElements: (isFailing: boolean) => void;
}

export interface ColorBlindMode {
  type: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  intensity: number;
}

export interface ColorBlindModeType {
  availableModes: readonly [
    { readonly type: 'none'; readonly name: 'Normal Vision' },
    { readonly type: 'protanopia'; readonly name: 'Red-Green (Protanopia)' },
    {
      readonly type: 'deuteranopia';
      readonly name: 'Red-Green (Deuteranopia)';
    },
    { readonly type: 'tritanopia'; readonly name: 'Blue-Yellow (Tritanopia)' },
    {
      readonly type: 'achromatopsia';
      readonly name: 'Complete Color Blindness';
    },
  ];
  colorBlindMode: ColorBlindMode;
  applyColorBlindSimulation: (mode: ColorBlindMode) => void;
  resetColorBlindMode?: () => void;
}

export interface VisualPreferencesType {
  preferences: {
    highContrast: boolean;
    reduceMotion: boolean;
    largerText: boolean;
    focusIndicator: boolean;
    readingGuide: boolean;
  };
  updatePreference: <
    K extends
      | 'highContrast'
      | 'reduceMotion'
      | 'largerText'
      | 'focusIndicator'
      | 'readingGuide',
  >(
    key: K,
    value: boolean
  ) => void;
}

export interface TradingShortcut {
  key: string;
  modifiers: { ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean };
  description: string;
  action: () => void;
  category: 'trading' | 'navigation' | 'charts' | 'general';
}

export interface KeyboardShortcutsType {
  shortcuts: TradingShortcut[];
  getShortcutsByCategory: (
    category: 'trading' | 'navigation' | 'charts' | 'general'
  ) => TradingShortcut[];
  addShortcut: (shortcut: TradingShortcut) => void;
  removeShortcut: (
    key: string,
    modifiers: TradingShortcut['modifiers']
  ) => void;
}

export interface FormField {
  label: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
}

export interface FormAccessibilityType {
  formFields: FormField[];
}

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
  onUpdateForm: (
    field: keyof FormData,
    value: FormData[keyof FormData]
  ) => void;
  onAnnounceToScreenReader: (message: string) => void;
  onSubmitForm?: (e?: React.FormEvent) => void;
}
