/**
 * Validation rules for form fields with react-hook-form.
 *
 * Provides pre-configured validation rules for common form inputs including email, password,
 * full name, document type, amount, and cryptocurrency addresses.
 *
 * @constant
 * @readonly
 *
 * **Rule Structure:**
 * - `email`: Email validation with pattern matching
 * - `password`: Password strength validation (min 8 chars, uppercase, lowercase, number)
 * - `confirmPassword(getValues)`: Password confirmation validator (requires getValues function from react-hook-form)
 * - `fullName`: Name validation (min 2 chars, letters and spaces only)
 * - `documentType`: Required document type selection
 * - `amount`: Numeric amount validation (min 0.01)
 * - `address`: Cryptocurrency address validation with currency-specific patterns
 *
 * **Validator Callback Types:**
 * - `validate: (value: string) => boolean | string` - Custom validation function
 * - `validate: (value: string, currency: string) => boolean | string` - Currency-aware validation
 *
 * **Supported Currency Addresses:**
 * BTC, ETH, USDT, USDC, LTC, BNB
 *
 * **Example Usage:**
 * ```tsx
 * import { useForm } from 'react-hook-form';
 * import { validationRules } from '@/lib/validationRules';
 *
 * const { register, getValues } = useForm();
 *
 * <input {...register('email', validationRules.email)} />
 * <input {...register('password', validationRules.password)} />
 * <input {...register('confirmPassword', validationRules.confirmPassword(getValues))} />
 * ```
 */
// Validation utilities for forms
export const validationRules = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address',
    },
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters',
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    },
  },
  confirmPassword: (getValues: () => Record<string, unknown>) => ({
    required: 'Please confirm your password',
    validate: (value: string) =>
      value === getValues().password || 'Passwords do not match',
  }),
  fullName: {
    required: 'Full name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters',
    },
    pattern: {
      value: /^[a-zA-Z\s]+$/,
      message: 'Name can only contain letters and spaces',
    },
  },
  documentType: {
    required: 'Please select a document type',
  },
  amount: {
    required: 'Amount is required',
    min: {
      value: 0.01,
      message: 'Amount must be greater than 0',
    },
    validate: (value: string) =>
      !isNaN(parseFloat(value)) || 'Please enter a valid amount',
  },
  address: {
    required: 'Address is required',
    validate: (value: string, currency: string) => {
      const patterns: Record<string, RegExp> = {
        BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
        ETH: /^0x[a-fA-F0-9]{40}$/,
        USDT: /^0x[a-fA-F0-9]{40}$/,
        USDC: /^0x[a-fA-F0-9]{40}$/,
        LTC: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
        BNB: /^0x[a-fA-F0-9]{40}$/,
      };
      return (
        patterns[currency]?.test(value) ||
        `Please enter a valid ${currency} address`
      );
    },
  },
};
