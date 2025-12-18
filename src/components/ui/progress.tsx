import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all duration-500 ease-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

// Multi-step progress component
interface Step {
  id: string;
  label: string;
  status: "pending" | "active" | "completed";
}

interface MultiStepProgressProps {
  steps: Step[];
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export const MultiStepProgress: React.FC<MultiStepProgressProps> = ({
  steps,
  className,
  size = "md",
  animated = true,
}) => {
  const sizeClasses = {
    sm: { container: "h-8", circle: "w-6 h-6", line: "h-1", text: "text-xs" },
    md: { container: "h-12", circle: "w-8 h-8", line: "h-2", text: "text-sm" },
    lg: {
      container: "h-16",
      circle: "w-10 h-10",
      line: "h-3",
      text: "text-base",
    },
  };

  const getStatusClasses = (status: Step["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500 border-green-500";
      case "active":
        return "bg-primary border-primary ring-2 ring-primary/20";
      case "pending":
        return "bg-muted border-border";
      default:
        return "bg-muted border-border";
    }
  };

  const getLineClasses = (index: number) => {
    const currentStep = steps[index];
    const nextStep = steps[index + 1];

    if (currentStep?.status === "completed" && nextStep?.status !== "pending") {
      return "bg-green-500";
    }
    if (currentStep?.status === "active" || nextStep?.status === "active") {
      return "bg-primary/50";
    }
    return "bg-border";
  };

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center space-y-2 flex-1">
            <div
              className={cn(
                "flex items-center justify-center rounded-full border-2 transition-all duration-300",
                getStatusClasses(step.status),
                sizeClasses[size].circle,
                animated && step.status === "active" && "animate-focus-pulse",
                animated && step.status === "completed" && "animate-scale-in",
              )}
            >
              {step.status === "completed" ? (
                <svg
                  className={cn(
                    "text-white",
                    size === "sm"
                      ? "w-3 h-3"
                      : size === "md"
                        ? "w-4 h-4"
                        : "w-5 h-5",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <span className={cn("font-medium", sizeClasses[size].text)}>
                  {index + 1}
                </span>
              )}
            </div>
            <span
              className={cn("text-center", sizeClasses[size].text, {
                "text-green-600 font-medium": step.status === "completed",
                "text-primary font-medium": step.status === "active",
                "text-muted-foreground": step.status === "pending",
              })}
            >
              {step.label}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 mx-2 rounded-full transition-all duration-300",
                getLineClasses(index),
                sizeClasses[size].line,
                animated && "animate-progress-fill",
              )}
              style={{
                animationDuration:
                  step.status === "completed" ? "0.8s" : "0.5s",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export { Progress };
