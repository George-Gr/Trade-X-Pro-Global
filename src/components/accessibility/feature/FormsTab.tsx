import { useFormAccessibility } from '@/lib/completeAriaLabeling';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { TabComponentProps } from '../types';

/**
 * FormsTab Component
 *
 * Displays accessible form example and form field statistics.
 * Tests basic form accessibility including labels, error messages, and ARIA attributes.
 */
export function FormsTab({
  formData,
  setFormData,
  errors: externalErrors,
  setErrors,
  inputRefs,
  testResults,
  setTestResults,
  onValidateForm,
  onUpdateForm,
  onAnnounceToScreenReader,
  onSubmitForm,
}: TabComponentProps) {
  const formAccessibility = useFormAccessibility();

  // Zod schema for validation
  const formSchema = z
    .object({
      username: z.string().min(1, 'Username is required'),
      email: z.string().email('Enter a valid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
      country: z.string().min(1, 'Please select your country'),
      bio: z.string().max(500).optional().or(z.literal('')),
      terms: z
        .boolean()
        .refine((val) => val === true, 'You must accept the terms'),
      newsletter: z.boolean().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });

  type FormValues = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: formData.username ?? '',
      email: formData.email ?? '',
      password: formData.password ?? '',
      confirmPassword: formData.confirmPassword ?? '',
      country: formData.country ?? '',
      bio: formData.bio ?? '',
      terms: formData.terms ?? false,
      newsletter: formData.newsletter ?? false,
    },
  });

  // Keep external formData in sync if parent updates it
  useEffect(() => {
    reset({
      username: formData.username ?? '',
      email: formData.email ?? '',
      password: formData.password ?? '',
      confirmPassword: formData.confirmPassword ?? '',
      country: formData.country ?? '',
      bio: formData.bio ?? '',
      terms: formData.terms ?? false,
      newsletter: formData.newsletter ?? false,
    });
  }, [formData, reset]);

  // When validation from external source is needed, expose errors
  useEffect(() => {
    if (externalErrors && Object.keys(externalErrors).length) {
      setErrors?.(externalErrors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalErrors]);

  const onSubmit = (values: FormValues) => {
    // propagate validated values to parent
    setFormData?.(values as FormValues);

    // clear any previous external errors
    setErrors?.({});

    // call provided submit handler (now accepts undefined event)
    if (onSubmitForm) {
      onSubmitForm();
    }
  };

  return (
    <div className="space-y-6">
      {/* Accessible Form */}
      <div className="bg-card rounded-lg p-6 border">
        <h3 className="font-semibold mb-4">Accessible Form Example</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-2"
            >
              Username
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            </label>
            {/* register returns ref and handlers; preserve inputRefs for test harness */}
            {(() => {
              const { ref, ...rest } = register('username');
              return (
                <input
                  id="username"
                  type="text"
                  {...rest}
                  ref={(el) => {
                    ref(el);
                    if (inputRefs?.current) inputRefs.current.username = el;
                  }}
                  aria-describedby={
                    errors.username ? 'username-error' : 'username-help'
                  }
                  aria-required="true"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your username"
                />
              );
            })()}

            <div
              id="username-help"
              className="text-sm text-muted-foreground mt-1"
            >
              Your username will be visible to other users
            </div>
            {errors.username && (
              <div
                id="username-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
                aria-live="polite"
              >
                {errors.username.message as string}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            </label>
            {(() => {
              const { ref, ...rest } = register('email');
              return (
                <input
                  id="email"
                  type="email"
                  {...rest}
                  ref={(el) => {
                    ref(el);
                    if (inputRefs?.current) inputRefs.current.email = el;
                  }}
                  aria-describedby={errors.email ? 'email-error' : 'email-help'}
                  aria-required="true"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="user@example.com"
                />
              );
            })()}

            <div id="email-help" className="text-sm text-muted-foreground mt-1">
              We'll never share your email with third parties
            </div>
            {errors.email && (
              <div
                id="email-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
                aria-live="polite"
              >
                {errors.email.message as string}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              Password
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            </label>
            {(() => {
              const { ref, ...rest } = register('password');
              return (
                <input
                  id="password"
                  type="password"
                  {...rest}
                  ref={(el) => {
                    ref(el);
                    if (inputRefs?.current) inputRefs.current.password = el;
                  }}
                  aria-describedby={
                    errors.password ? 'password-error' : 'password-help'
                  }
                  aria-required="true"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a strong password"
                />
              );
            })()}
            <div
              id="password-help"
              className="text-sm text-muted-foreground mt-1"
            >
              Must be at least 8 characters long
            </div>
            {errors.password && (
              <div
                id="password-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
                aria-live="polite"
              >
                {errors.password.message as string}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
            >
              Confirm Password
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            </label>
            {(() => {
              const { ref, ...rest } = register('confirmPassword');
              return (
                <input
                  id="confirmPassword"
                  type="password"
                  {...rest}
                  ref={(el) => {
                    ref(el);
                    if (inputRefs?.current)
                      inputRefs.current.confirmPassword = el;
                  }}
                  aria-describedby={
                    errors.confirmPassword ? 'confirm-error' : 'confirm-help'
                  }
                  aria-required="true"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
              );
            })()}
            <div
              id="confirm-help"
              className="text-sm text-muted-foreground mt-1"
            >
              Must match the password above
            </div>
            {errors.confirmPassword && (
              <div
                id="confirm-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
                aria-live="polite"
              >
                {errors.confirmPassword.message as string}
              </div>
            )}
          </div>

          {/* Country Field */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-2">
              Country
              <span className="text-red-500 ml-1" aria-hidden="true">
                *
              </span>
            </label>
            {(() => {
              const { ref, ...rest } = register('country');
              return (
                <select
                  id="country"
                  {...rest}
                  ref={(el) => {
                    ref(el);
                    if (inputRefs?.current) inputRefs.current.country = el;
                  }}
                  aria-describedby={
                    errors.country ? 'country-error' : 'country-help'
                  }
                  aria-required="true"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your country</option>
                  <option value="us">United States</option>
                  <option value="ca">Canada</option>
                  <option value="uk">United Kingdom</option>
                  <option value="au">Australia</option>
                  <option value="de">Germany</option>
                </select>
              );
            })()}
            <div
              id="country-help"
              className="text-sm text-muted-foreground mt-1"
            >
              This helps us provide localized content
            </div>
            {errors.country && (
              <div
                id="country-error"
                className="text-sm text-red-600 mt-1"
                role="alert"
                aria-live="polite"
              >
                {errors.country.message as string}
              </div>
            )}
          </div>

          {/* Bio Field */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            {(() => {
              const { ref, ...rest } = register('bio');
              return (
                <textarea
                  id="bio"
                  {...rest}
                  ref={(el) => {
                    ref(el);
                    if (inputRefs?.current) inputRefs.current.bio = el;
                  }}
                  aria-describedby="bio-help"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-gray-300"
                  rows={4}
                  placeholder="Tell us about yourself"
                />
              );
            })()}
            <div id="bio-help" className="text-sm text-muted-foreground mt-1">
              Optional: Share something about yourself (max 500 characters)
            </div>
          </div>

          {/* Terms Checkbox */}
          <div>
            <label className="flex items-start space-x-3 cursor-pointer">
              {(() => {
                const { ref, ...rest } = register('terms');
                return (
                  <input
                    type="checkbox"
                    {...rest}
                    ref={(el) => {
                      ref(el);
                      if (inputRefs?.current)
                        (
                          inputRefs.current as Record<string, HTMLElement>
                        ).terms = el;
                    }}
                    aria-describedby={
                      errors.terms ? 'terms-error' : 'terms-help'
                    }
                    aria-required="true"
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                );
              })()}

              <div>
                <span className="font-medium">
                  I agree to the Terms of Service
                  <span className="text-red-500 ml-1" aria-hidden="true">
                    *
                  </span>
                </span>
                <div id="terms-help" className="text-sm text-muted-foreground">
                  You must accept the terms to create an account
                </div>
                {errors.terms && (
                  <div
                    id="terms-error"
                    className="text-sm text-red-600"
                    role="alert"
                    aria-live="polite"
                  >
                    {errors.terms.message as string}
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Newsletter Checkbox */}
          <div>
            <label className="flex items-start space-x-3 cursor-pointer">
              {(() => {
                const { ref, ...rest } = register('newsletter');
                return (
                  <input
                    type="checkbox"
                    {...rest}
                    ref={(el) => {
                      ref(el);
                      if (inputRefs?.current)
                        (
                          inputRefs.current as Record<string, HTMLElement>
                        ).newsletter = el;
                    }}
                    aria-label="Subscribe to newsletter for updates and promotions"
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                );
              })()}

              <div>
                <span className="font-medium">Subscribe to newsletter</span>
                <div className="text-sm text-muted-foreground">
                  Get updates about new features and promotions
                </div>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-describedby="submit-help"
            >
              Create Account
            </button>

            <button
              type="button"
              onClick={() => {
                reset();
                setErrors?.({});
                onAnnounceToScreenReader?.('Form cleared');
              }}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium focus:ring-2 focus:ring-gray-500 focus:outline-none"
            >
              Clear Form
            </button>
          </div>

          <div id="submit-help" className="text-sm text-muted-foreground">
            All required fields must be filled before submitting
          </div>
        </form>
      </div>

      {/* Form Field Statistics */}
      <div className="bg-card rounded-lg p-6 border">
        <h3 className="font-semibold mb-4">Form Field Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-semibold text-blue-900">Total Fields</h4>
            <p className="text-2xl font-bold text-blue-900">
              {formAccessibility.formFields.length}
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h4 className="font-semibold text-green-900">With Labels</h4>
            <p className="text-2xl font-bold text-green-900">
              {
                formAccessibility.formFields.filter(
                  (f: { label?: string | null }) => f.label
                ).length
              }
            </p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded">
            <h4 className="font-semibold text-purple-900">Required Fields</h4>
            <p className="text-2xl font-bold text-purple-900">
              {
                formAccessibility.formFields.filter(
                  (f: { required?: boolean }) => f.required
                ).length
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormsTab;
