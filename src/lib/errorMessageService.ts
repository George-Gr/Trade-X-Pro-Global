/**
 * Error Message Service
 *
 * Provides actionable error messages with specific reasons and suggested fixes
 * for better user experience and reduced support tickets.
 *
 * Usage:
 * import { getActionableErrorMessage } from '@/lib/errorMessageService';
 *
 * const message = getActionableErrorMessage(error);
 */

export interface ActionableError {
  title: string;
  description: string;
  suggestion?: string;
  errorCode?: string;
}

/**
 * Maps generic error messages to actionable error messages with specific reasons
 * and suggested fixes.
 */
export function getActionableErrorMessage(
  error: Error | string | unknown,
  context?: string,
): ActionableError {
  const errorStr = error instanceof Error ? error.message : String(error);
  const errorLower = errorStr.toLowerCase();

  // Trading and Order Errors
  if (errorLower.includes("insufficient margin")) {
    return {
      title: "Order Failed: Insufficient Margin",
      description:
        "Your account doesn't have enough available margin to open this position.",
      suggestion:
        "Reduce your position size, close existing positions to free up margin, or deposit additional funds.",
    };
  }

  if (
    errorLower.includes("insufficient balance") ||
    errorLower.includes("insufficient funds")
  ) {
    return {
      title: "Order Failed: Insufficient Funds",
      description: "Your account balance is too low to execute this order.",
      suggestion:
        "Deposit additional funds or reduce your position size to proceed.",
    };
  }

  if (
    errorLower.includes("invalid quantity") ||
    errorLower.includes("quantity")
  ) {
    if (errorLower.includes("min_quantity") || errorLower.includes("minimum")) {
      return {
        title: "Order Failed: Quantity Below Minimum",
        description:
          "The requested quantity is below the minimum allowed for this asset.",
        suggestion:
          "Increase your order quantity to meet the minimum requirement.",
      };
    }
    if (errorLower.includes("max_quantity") || errorLower.includes("maximum")) {
      return {
        title: "Order Failed: Quantity Above Maximum",
        description:
          "The requested quantity exceeds the maximum allowed for this asset.",
        suggestion:
          "Reduce your order quantity to stay within the allowed limits.",
      };
    }
    return {
      title: "Order Failed: Invalid Quantity",
      description: "The quantity specified is not valid for this asset.",
      suggestion:
        "Check the asset specifications and ensure your quantity is within allowed limits.",
    };
  }

  if (errorLower.includes("invalid symbol") || errorLower.includes("symbol")) {
    return {
      title: "Order Failed: Invalid Symbol",
      description:
        "The trading symbol is not recognized or not available for trading.",
      suggestion:
        "Verify the symbol is correct and that the asset is currently tradable.",
    };
  }

  if (
    errorLower.includes("market closed") ||
    errorLower.includes("trading hours")
  ) {
    return {
      title: "Order Failed: Market Closed",
      description:
        "This asset is not available for trading during current market hours.",
      suggestion: "Try again during regular trading hours for this asset.",
    };
  }

  if (
    errorLower.includes("leverage exceeds") ||
    errorLower.includes("leverage")
  ) {
    return {
      title: "Order Failed: Leverage Limit Exceeded",
      description:
        "The leverage for this asset exceeds your account's maximum allowed leverage.",
      suggestion:
        "Choose an asset with lower leverage or upgrade your account to access higher leverage.",
    };
  }

  if (
    errorLower.includes("account suspended") ||
    errorLower.includes("account closed")
  ) {
    return {
      title: "Order Failed: Account Restricted",
      description: "Your trading account is currently suspended or closed.",
      suggestion:
        "Contact support to resolve account restrictions and restore trading access.",
    };
  }

  if (
    errorLower.includes("kyc") ||
    errorLower.includes("verification required")
  ) {
    return {
      title: "Order Failed: Identity Verification Required",
      description: "You need to complete KYC verification before trading.",
      suggestion:
        "Complete the KYC verification process in your account settings.",
    };
  }

  // Form Validation Errors
  if (errorLower.includes("volume must be") || errorLower.includes("volume")) {
    return {
      title: "Form Error: Invalid Volume",
      description: "The volume entered is not valid.",
      suggestion: "Enter a volume between 0.01 and 1000 lots.",
    };
  }

  if (errorLower.includes("price")) {
    return {
      title: "Form Error: Invalid Price",
      description: "The price entered is not valid.",
      suggestion: "Enter a valid numeric price value.",
    };
  }

  // Network and System Errors
  if (
    errorLower.includes("network error") ||
    errorLower.includes("connection")
  ) {
    return {
      title: "Connection Error",
      description: "Unable to connect to the trading server.",
      suggestion:
        "Check your internet connection and try again. If the problem persists, contact support.",
    };
  }

  if (
    errorLower.includes("timeout") ||
    errorLower.includes("request timeout")
  ) {
    return {
      title: "Request Timeout",
      description: "The server took too long to respond to your request.",
      suggestion:
        "Try again in a moment. High market volatility can cause temporary delays.",
    };
  }

  // Authentication Errors
  if (
    errorLower.includes("unauthorized") ||
    errorLower.includes("authentication") ||
    errorLower.includes("login")
  ) {
    return {
      title: "Authentication Required",
      description: "You need to be logged in to perform this action.",
      suggestion: "Please log in to your account and try again.",
    };
  }

  if (
    errorLower.includes("session expired") ||
    errorLower.includes("token expired")
  ) {
    return {
      title: "Session Expired",
      description: "Your session has expired for security reasons.",
      suggestion: "Please log in again to continue trading.",
    };
  }

  // Generic Errors with Context
  if (context === "order_submission") {
    return {
      title: "Order Failed",
      description:
        errorStr || "An unexpected error occurred while submitting your order.",
      suggestion:
        "Please try again or contact support if the problem persists.",
    };
  }

  if (context === "form_validation") {
    return {
      title: "Form Validation Error",
      description: errorStr || "Please check your input and try again.",
      suggestion:
        "Review the form fields for any missing or incorrect information.",
    };
  }

  if (context === "data_fetching") {
    return {
      title: "Data Loading Error",
      description: errorStr || "Unable to load the requested data.",
      suggestion:
        "Check your connection and refresh the page, or try again in a moment.",
    };
  }

  // Default Generic Error
  return {
    title: "An Error Occurred",
    description: errorStr || "Something went wrong. Please try again.",
    suggestion: "If this problem continues, please contact our support team.",
    errorCode: error instanceof Error ? error.name : undefined,
  };
}

/**
 * Creates a user-friendly error message from any error type
 */
export function formatUserFriendlyError(
  error: Error | string | unknown,
  context?: string,
): string {
  const actionableError = getActionableErrorMessage(error, context);

  if (actionableError.suggestion) {
    return `${actionableError.description} ${actionableError.suggestion}`;
  }

  return actionableError.description;
}

/**
 * Formats error for toast notifications with appropriate styling
 */
export function formatToastError(
  error: Error | string | unknown,
  context?: string,
): { title: string; description: string; variant?: string } {
  const actionableError = getActionableErrorMessage(error, context);

  return {
    title: actionableError.title,
    description: actionableError.description,
    variant: "destructive", // Matches toast variants
  };
}

/**
 * Formats validation errors for form fields
 */
export function formatFieldError(
  error: Error | string | unknown,
  fieldName: string,
): string {
  const actionableError = getActionableErrorMessage(error, "form_validation");

  // For specific field errors, try to be more specific
  if (
    fieldName.toLowerCase().includes("volume") ||
    fieldName.toLowerCase().includes("quantity")
  ) {
    if (actionableError.description.includes("not valid")) {
      return "Please enter a valid quantity (minimum 0.01 lots)";
    }
  }

  if (fieldName.toLowerCase().includes("price")) {
    if (actionableError.description.includes("not valid")) {
      return "Please enter a valid price value";
    }
  }

  return actionableError.description;
}
