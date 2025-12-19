'use client';

import * as React from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type ButtonProps } from '@/components/ui/buttonVariants';
import { cn } from '@/lib/utils';

export interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  loadingIcon?: React.ReactNode;
  successIcon?: React.ReactNode;
  errorIcon?: React.ReactNode;
  showSpinner?: boolean;
  animationDuration?: number;
}

export const LoadingButton = ({
  isLoading = false,
  isSuccess = false,
  isError = false,
  loadingText = 'Loading...',
  successText = 'Success!',
  errorText = 'Error',
  loadingIcon,
  successIcon,
  errorIcon,
  showSpinner = true,
  animationDuration = 300,
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) => {
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          {showSpinner &&
            (loadingIcon || <Loader2 className="h-4 w-4 mr-2 animate-spin" />)}
          {loadingText}
        </>
      );
    }

    if (isSuccess) {
      return (
        <>
          {successIcon || <CheckCircle2 className="h-4 w-4 mr-2" />}
          {successText}
        </>
      );
    }

    if (isError) {
      return (
        <>
          {errorIcon || <XCircle className="h-4 w-4 mr-2" />}
          {errorText}
        </>
      );
    }

    return children;
  };

  const getButtonDisabled = () => {
    if (disabled !== undefined) return disabled;
    return isLoading;
  };

  return (
    <Button
      {...props}
      disabled={getButtonDisabled()}
      className={cn(
        className,
        (isLoading || isSuccess || isError) &&
          `transition-all duration-${animationDuration} ease-in-out`,
        isLoading && 'opacity-90 hover:opacity-90',
        isSuccess &&
          'bg-success-contrast text-success-contrast-foreground hover:bg-success-contrast/90',
        isError &&
          'bg-danger-contrast text-danger-contrast-foreground hover:bg-danger-contrast/90'
      )}
    >
      {getButtonContent()}
    </Button>
  );
};

LoadingButton.displayName = 'LoadingButton';
