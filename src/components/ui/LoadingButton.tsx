"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

export interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

export const LoadingButton = ({
  isLoading = false,
  loadingText = "Loading...",
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      {...props}
      disabled={disabled || isLoading}
      className={`relative ${className || ""}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

LoadingButton.displayName = "LoadingButton";