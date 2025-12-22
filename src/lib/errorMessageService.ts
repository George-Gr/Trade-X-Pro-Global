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

// Retry constants for error messages
export const DUPLICATE_ORDER_RETRY_SECONDS = 60;

export interface ActionableError {
  title: string;
  description: string;
  suggestion?: string;
  errorCode?: string;
}

// Maps backend error codes to user-friendly messages
const ERROR_CODE_MAP: Record<string, ActionableError> = {
  VALIDATION_FAILED: {
    title: 'Order Validation Failed',
    description: 'The order parameters are invalid.',
    suggestion:
      'Please check your order details (quantity, price, stops) and try again.',
  },
  INSUFFICIENT_MARGIN: {
    title: 'Insufficient Margin',
    description:
      "Your account doesn't have enough available margin to open this position.",
    suggestion:
      'Reduce your position size, close existing positions to free up margin, or deposit additional funds.',
  },
  INSUFFICIENT_BALANCE: {
    title: 'Insufficient Funds',
    description: 'Your account balance is too low to execute this order.',
    suggestion:
      'Deposit additional funds or reduce your position size to proceed.',
  },
  MARKET_DATA_UNAVAILABLE: {
    title: 'Market Data Unavailable',
    description: 'Unable to fetch current market prices for this asset.',
    suggestion:
      'Please try again in a moment. If the issue persists, the market might be closed.',
  },
  DUPLICATE_ORDER: {
    title: 'Duplicate Order Detected',
    description:
      'This order appears to be a duplicate of a recently submitted order.',
    suggestion: `Please wait ${DUPLICATE_ORDER_RETRY_SECONDS} seconds to see if your previous order was executed. Check your positions/orders tab.`,
  },
  RATE_LIMIT_EXCEEDED: {
    title: 'Rate Limit Exceeded',
    description: 'You are submitting orders too quickly.',
    suggestion: 'Please wait a moment before placing another order.',
  },
  RISK_LIMIT_VIOLATION: {
    title: 'Risk Limit Violation',
    description: 'This order violates your account risk management settings.',
    suggestion:
      'Check your risk settings (max daily loss, max position size) or contact support.',
  },
  TRANSACTION_FAILED: {
    title: 'Transaction Failed',
    description: 'The order transaction could not be completed.',
    suggestion: 'Please try again. If the problem persists, contact support.',
  },
  INTERNAL_ERROR: {
    title: 'System Error',
    description:
      'An internal system error occurred while processing your order.',
    suggestion: 'Please try again later or contact support if this persists.',
  },
};

/**
 * Maps generic error messages to actionable error messages with specific reasons
 * and suggested fixes.
 */
export function getActionableErrorMessage(
  error: Error | string | unknown,
  context?: string
): ActionableError {
  // Check if it's a structured error object from our backend
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const errObj = error as {
      code: string;
      message?: string;
      details?: unknown;
    };
    const mappedError = ERROR_CODE_MAP[errObj.code];
    if (mappedError) {
      return {
        title: mappedError.title,
        description: errObj.message || mappedError.description,
        ...(mappedError.suggestion
          ? { suggestion: mappedError.suggestion }
          : {}),
        errorCode: errObj.code,
      };
    }
  }

  const errorStr = error instanceof Error ? error.message : String(error);
  const errorLower = errorStr.toLowerCase();

  // Explicit mapping for known error types to safe error codes
  if (error instanceof Error) {
    const errorTypeMap: Record<string, string> = {
      TypeError: 'INTERNAL_ERROR',
      ReferenceError: 'INTERNAL_ERROR',
      SyntaxError: 'INTERNAL_ERROR',
      RangeError: 'INTERNAL_ERROR',
      EvalError: 'INTERNAL_ERROR',
      URIError: 'INTERNAL_ERROR',
      NetworkError: 'NETWORK_ERROR',
      TimeoutError: 'TIMEOUT_ERROR',
    };

    const safeErrorCode = errorTypeMap[error.constructor.name];
    if (safeErrorCode) {
      return {
        title: 'System Error',
        description: errorStr || 'An unexpected system error occurred.',
        suggestion:
          'Please try again or contact support if the problem persists.',
        errorCode: safeErrorCode,
      };
    }
  }

  // Trading and Order Errors (Legacy/Fallback matching)
  if (errorLower.includes('insufficient margin')) {
    const err = ERROR_CODE_MAP.INSUFFICIENT_MARGIN;
    return {
      title: err?.title || 'Insufficient Margin',
      description:
        err?.description ||
        "Your account doesn't have enough available margin.",
      ...(err?.suggestion ? { suggestion: err.suggestion } : {}),
      errorCode: 'INSUFFICIENT_MARGIN',
    };
  }

  if (
    errorLower.includes('insufficient balance') ||
    errorLower.includes('insufficient funds')
  ) {
    const err = ERROR_CODE_MAP.INSUFFICIENT_BALANCE;
    return {
      title: err?.title || 'Insufficient Funds',
      description: err?.description || 'Your account balance is too low.',
      ...(err?.suggestion ? { suggestion: err.suggestion } : {}),
      errorCode: 'INSUFFICIENT_BALANCE',
    };
  }

  if (
    errorLower.includes('invalid quantity') ||
    errorLower.includes('quantity')
  ) {
    if (errorLower.includes('min_quantity') || errorLower.includes('minimum')) {
      return {
        title: 'Order Failed: Quantity Below Minimum',
        description:
          'The requested quantity is below the minimum allowed for this asset.',
        suggestion:
          'Increase your order quantity to meet the minimum requirement.',
        errorCode: 'VALIDATION_FAILED',
      };
    }
    if (errorLower.includes('max_quantity') || errorLower.includes('maximum')) {
      return {
        title: 'Order Failed: Quantity Above Maximum',
        description:
          'The requested quantity exceeds the maximum allowed for this asset.',
        suggestion:
          'Reduce your order quantity to stay within the allowed limits.',
        errorCode: 'VALIDATION_FAILED',
      };
    }
    return {
      title: 'Order Failed: Invalid Quantity',
      description: 'The quantity specified is not valid for this asset.',
      suggestion:
        'Check the asset specifications and ensure your quantity is within allowed limits.',
      errorCode: 'VALIDATION_FAILED',
    };
  }

  if (errorLower.includes('invalid symbol') || errorLower.includes('symbol')) {
    return {
      title: 'Order Failed: Invalid Symbol',
      description:
        'The trading symbol is not recognized or not available for trading.',
      suggestion:
        'Verify the symbol is correct and that the asset is currently tradable.',
      errorCode: 'VALIDATION_FAILED',
    };
  }

  if (
    errorLower.includes('market closed') ||
    errorLower.includes('trading hours')
  ) {
    return {
      title: 'Order Failed: Market Closed',
      description:
        'This asset is not available for trading during current market hours.',
      suggestion: 'Try again during regular trading hours for this asset.',
      errorCode: 'MARKET_DATA_UNAVAILABLE',
    };
  }

  if (
    errorLower.includes('leverage exceeds') ||
    errorLower.includes('leverage')
  ) {
    return {
      title: 'Order Failed: Leverage Limit Exceeded',
      description:
        "The leverage for this asset exceeds your account's maximum allowed leverage.",
      suggestion:
        'Choose an asset with lower leverage or upgrade your account to access higher leverage.',
      errorCode: 'RISK_LIMIT_VIOLATION',
    };
  }

  if (
    errorLower.includes('account suspended') ||
    errorLower.includes('account closed')
  ) {
    return {
      title: 'Order Failed: Account Restricted',
      description: 'Your trading account is currently suspended or closed.',
      suggestion:
        'Contact support to resolve account restrictions and restore trading access.',
      errorCode: 'VALIDATION_FAILED',
    };
  }

  if (
    errorLower.includes('kyc') ||
    errorLower.includes('verification required')
  ) {
    return {
      title: 'Order Failed: Identity Verification Required',
      description: 'You need to complete KYC verification before trading.',
      suggestion:
        'Complete the KYC verification process in your account settings.',
      errorCode: 'VALIDATION_FAILED',
    };
  }

  // Form Validation Errors
  if (errorLower.includes('volume must be') || errorLower.includes('volume')) {
    return {
      title: 'Form Error: Invalid Volume',
      description: 'The volume entered is not valid.',
      suggestion: 'Enter a volume between 0.01 and 1000 lots.',
      errorCode: 'VALIDATION_FAILED',
    };
  }

  if (errorLower.includes('price')) {
    return {
      title: 'Form Error: Invalid Price',
      description: 'The price entered is not valid.',
      suggestion: 'Enter a valid numeric price value.',
      errorCode: 'VALIDATION_FAILED',
    };
  }

  // Network and System Errors
  if (
    errorLower.includes('network error') ||
    errorLower.includes('connection')
  ) {
    return {
      title: 'Connection Error',
      description: 'Unable to connect to the trading server.',
      suggestion:
        'Check your internet connection and try again. If the problem persists, contact support.',
      errorCode: 'INTERNAL_ERROR',
    };
  }

  if (
    errorLower.includes('timeout') ||
    errorLower.includes('request timeout')
  ) {
    return {
      title: 'Request Timeout',
      description: 'The server took too long to respond to your request.',
      suggestion:
        'Try again in a moment. High market volatility can cause temporary delays.',
      errorCode: 'INTERNAL_ERROR',
    };
  }

  // Authentication Errors
  if (
    errorLower.includes('unauthorized') ||
    errorLower.includes('authentication') ||
    errorLower.includes('login')
  ) {
    return {
      title: 'Authentication Required',
      description: 'You need to be logged in to perform this action.',
      suggestion: 'Please log in to your account and try again.',
      errorCode: 'VALIDATION_FAILED',
    };
  }

  if (
    errorLower.includes('session expired') ||
    errorLower.includes('token expired')
  ) {
    return {
      title: 'Session Expired',
      description: 'Your session has expired for security reasons.',
      suggestion: 'Please log in again to continue trading.',
      errorCode: 'VALIDATION_FAILED',
    };
  }

  // Generic Errors with Context
  if (context === 'order_submission') {
    return {
      title: 'Order Failed',
      description:
        errorStr || 'An unexpected error occurred while submitting your order.',
      suggestion:
        'Please try again or contact support if the problem persists.',
      errorCode: 'INTERNAL_ERROR',
    };
  }

  if (context === 'form_validation') {
    return {
      title: 'Form Validation Error',
      description: errorStr || 'Please check your input and try again.',
      suggestion:
        'Review the form fields for any missing or incorrect information.',
      errorCode: 'VALIDATION_FAILED',
    };
  }

  if (context === 'data_fetching') {
    return {
      title: 'Data Loading Error',
      description: errorStr || 'Unable to load the requested data.',
      suggestion:
        'Check your connection and refresh the page, or try again in a moment.',
      errorCode: 'INTERNAL_ERROR',
    };
  }

  // Default Generic Error
  return {
    title: 'An Error Occurred',
    description: errorStr || 'Something went wrong. Please try again.',
    suggestion: 'If this problem continues, please contact our support team.',
    errorCode: 'UNKNOWN_ERROR',
  };
}

/**
 * Creates a user-friendly error message from any error type
 */
export function formatUserFriendlyError(
  error: Error | string | unknown,
  context?: string
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
  context?: string
): {
  title: string;
  description: string;
  variant: 'destructive' | 'default';
  errorCode?: string;
} {
  const actionableError = getActionableErrorMessage(error, context);
  const errorCode = actionableError.errorCode;

  return {
    title: actionableError.title,
    description: actionableError.description,
    variant: 'destructive',
    ...(errorCode ? { errorCode } : {}),
  };
}

/**
 * Formats validation errors for form fields
 */
export function formatFieldError(
  error: Error | string | unknown,
  fieldName: string
): string {
  const actionableError = getActionableErrorMessage(error, 'form_validation');

  // For specific field errors, try to be more specific
  if (
    fieldName.toLowerCase().includes('volume') ||
    fieldName.toLowerCase().includes('quantity')
  ) {
    if (actionableError.description.includes('not valid')) {
      return 'Please enter a valid quantity (minimum 0.01 lots)';
    }
  }

  if (fieldName.toLowerCase().includes('price')) {
    if (actionableError.description.includes('not valid')) {
      return 'Please enter a valid price value';
    }
  }

  return actionableError.description;
}
