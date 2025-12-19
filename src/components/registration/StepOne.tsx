import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import type { RegistrationFormData } from './MultiStepRegistration';
type StepOneFormValues = Pick<
  RegistrationFormData,
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'address'
  | 'password'
  | 'confirmPassword'
>;

interface StepOneProps {
  formData: RegistrationFormData;
  updateFormData: (data: Partial<RegistrationFormData>) => void;
  onNext: () => void;
}

const StepOne: React.FC<StepOneProps> = ({
  formData,
  updateFormData,
  onNext,
}) => {
  const form = useForm<StepOneFormValues>({
    defaultValues: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = form;
  const password = watch('password');

  const onSubmit = (data: StepOneFormValues) => {
    updateFormData(data);
    onNext();
  };

  const inputClass =
    'bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-gold focus:ring-gold/20';

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            rules={{ required: 'First name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary-foreground">
                  First Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="John" className={inputClass} {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            rules={{ required: 'Last name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-primary-foreground">
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Doe" className={inputClass} {...field} />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email address',
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary-foreground">
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          rules={{ required: 'Phone number is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary-foreground">
                Phone Number
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          rules={{ required: 'Address is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary-foreground">Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="123 Main St, City, Country"
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          rules={{
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Password must contain uppercase, lowercase, and number',
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary-foreground">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          rules={{
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match',
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary-foreground">
                Confirm Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full btn-glow bg-gold text-gold-foreground hover:bg-gold-hover py-6 text-lg font-bold shadow-lg hover:shadow-gold/25 transition-all duration-300 group mt-6"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </form>
    </Form>
  );
};

export default StepOne;
