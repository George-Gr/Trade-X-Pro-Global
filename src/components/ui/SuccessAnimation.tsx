import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
  message?: string;
  onComplete?: () => void;
  duration?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * SuccessAnimation Component
 * 
 * Displays an animated checkmark with optional message and auto-fade out.
 * Used for form submissions, confirmations, and successful actions.
 * 
 * Usage:
 * <SuccessAnimation 
 *   message="Saved successfully!"
 *   onComplete={() => setShowSuccess(false)}
 *   duration={2000}
 * />
 */
export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  message,
  onComplete,
  duration = 2000,
  className = "",
  size = "md",
}) => {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, duration]);

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        "animate-fade-in",
        className
      )}
      style={{
        animation: `fadeIn 0.3s ease-out, fadeOut 0.5s ease-out ${duration - 500}ms`,
      }}
    >
      <div
        className={cn(
          "rounded-full bg-accent/20 flex items-center justify-center",
          "animate-scale-in",
          sizeClasses[size]
        )}
      >
        <CheckCircle2 
          className={cn(
            "text-accent",
            size === "sm" && "h-6 w-6",
            size === "md" && "h-8 w-8",
            size === "lg" && "h-12 w-12"
          )}
        />
      </div>
      {message && (
        <p className="text-sm font-medium text-foreground animate-fade-in">
          {message}
        </p>
      )}
    </div>
  );
};

// Convenience hook for managing success state
export const useSuccessAnimation = (duration: number = 2000) => {
  const [showSuccess, setShowSuccess] = React.useState(false);

  const triggerSuccess = React.useCallback(() => {
    setShowSuccess(true);
  }, []);

  const handleComplete = React.useCallback(() => {
    setShowSuccess(false);
  }, []);

  return {
    showSuccess,
    triggerSuccess,
    SuccessAnimation: showSuccess ? (
      <SuccessAnimation duration={duration} onComplete={handleComplete} />
    ) : null,
  };
};
