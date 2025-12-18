import { AlertCircle, HelpCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getActionableErrorMessage,
  type ActionableError,
} from "@/lib/errorMessageService";

interface ErrorStateProps {
  error: Error | string | unknown;
  context?: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
  actionText?: string;
  showRetry?: boolean;
  showSupport?: boolean;
  className?: string;
  variant?: "default" | "minimal" | "card";
}

/**
 * ErrorState Component
 *
 * Displays actionable error messages with specific reasons and suggested fixes.
 * Provides retry and support options to help users recover from errors.
 *
 * Usage:
 * <ErrorState
 *   error={error}
 *   context="order_submission"
 *   onRetry={handleRetry}
 *   showRetry={true}
 *   showSupport={true}
 * />
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  context,
  onRetry,
  onContactSupport,
  actionText = "Try Again",
  showRetry = false,
  showSupport = true,
  className = "",
  variant = "default",
}) => {
  const actionableError = getActionableErrorMessage(error, context);

  const getIcon = () => {
    if (variant === "minimal") {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    return <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />;
  };

  const getLayout = () => {
    switch (variant) {
      case "minimal":
        return (
          <div
            className={`flex items-center gap-2 text-destructive ${className}`}
          >
            {getIcon()}
            <span className="text-sm">{actionableError.description}</span>
            {actionableError.suggestion && (
              <span title={actionableError.suggestion}>
                <HelpCircle className="h-3 w-3 opacity-70 cursor-help" />
              </span>
            )}
          </div>
        );

      case "card":
        return (
          <div
            className={`bg-destructive/5 border border-destructive/20 rounded-lg p-4 ${className}`}
          >
            <div className="flex items-start gap-3">
              {getIcon()}
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-1">
                  {actionableError.title}
                </h3>
                <p className="text-sm text-foreground mb-2">
                  {actionableError.description}
                </p>
                {actionableError.suggestion && (
                  <p className="text-xs text-muted-foreground mb-3 italic">
                    <span className="font-medium">Suggestion:</span>{" "}
                    {actionableError.suggestion}
                  </p>
                )}
                <div className="flex gap-2">
                  {showRetry && onRetry && (
                    <Button variant="destructive" size="sm" onClick={onRetry}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      {actionText}
                    </Button>
                  )}
                  {showSupport && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onContactSupport}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Contact Support
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div
            className={`bg-destructive/10 border border-destructive/30 rounded-lg p-4 ${className}`}
          >
            <div className="flex gap-4">
              {getIcon()}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-destructive">
                    {actionableError.title}
                  </h3>
                  {actionableError.errorCode && (
                    <code className="text-xs bg-destructive/20 px-2 py-1 rounded text-destructive">
                      {actionableError.errorCode}
                    </code>
                  )}
                </div>
                <p className="text-sm text-destructive mb-3">
                  {actionableError.description}
                </p>
                {actionableError.suggestion && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-md p-3 mb-3">
                    <p className="text-sm font-medium text-destructive mb-1">
                      How to fix this:
                    </p>
                    <p className="text-sm text-foreground">
                      {actionableError.suggestion}
                    </p>
                  </div>
                )}
                {(showRetry || showSupport) && (
                  <div className="flex gap-2">
                    {showRetry && onRetry && (
                      <Button variant="destructive" onClick={onRetry}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {actionText}
                      </Button>
                    )}
                    {showSupport && (
                      <Button variant="outline" onClick={onContactSupport}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return getLayout();
};

// Convenience components for common error scenarios
export const OrderErrorState: React.FC<{
  error: Error | string | unknown;
  onRetry?: () => void;
  onContactSupport?: () => void;
  className?: string;
}> = ({ error, onRetry, onContactSupport, className }) => (
  <ErrorState
    error={error}
    context="order_submission"
    onRetry={onRetry}
    onContactSupport={onContactSupport}
    showRetry={true}
    showSupport={true}
    className={className}
  />
);

export const FormErrorState: React.FC<{
  error: Error | string | unknown;
  onRetry?: () => void;
  className?: string;
}> = ({ error, onRetry, className }) => (
  <ErrorState
    error={error}
    context="form_validation"
    onRetry={onRetry}
    showRetry={true}
    showSupport={false}
    variant="minimal"
    className={className}
  />
);

export const DataErrorState: React.FC<{
  error: Error | string | unknown;
  onRetry?: () => void;
  onContactSupport?: () => void;
  className?: string;
}> = ({ error, onRetry, onContactSupport, className }) => (
  <ErrorState
    error={error}
    context="data_fetching"
    onRetry={onRetry}
    onContactSupport={onContactSupport}
    showRetry={true}
    showSupport={true}
    className={className}
  />
);
