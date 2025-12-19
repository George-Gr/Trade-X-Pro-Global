/**
 * Common Type Definitions
 * Provides standardized types for optional properties with explicit undefined handling
 * Required for strict TypeScript mode with exactOptionalPropertyTypes: true
 */

/**
 * Optional property patterns with explicit undefined handling
 * Use these types when defining interfaces with optional properties in strict mode
 */

// React props patterns
export interface BaseProps {
  children?: React.ReactNode | undefined;
  className?: string | undefined;
  id?: string | undefined;
  key?: React.Key | undefined;
}

export interface CallbackProps<T = unknown> {
  onClose?: (() => void) | undefined;
  onChange?: ((value: T) => void) | undefined;
  onSubmit?: (() => void) | undefined;
  onClick?: (() => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
  onSuccess?: ((result: T) => void) | undefined;
}

export interface FormProps extends BaseProps {
  name?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  error?: string | undefined;
  helperText?: string | undefined;
}

export interface LayoutProps extends BaseProps {
  variant?: string | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl' | undefined;
}

// Data type patterns
export interface BaseEntity {
  id: string;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  deletedAt?: Date | null | undefined;
}

export interface PaginationParams {
  page?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  sort?: string | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number | undefined;
  limit?: number | undefined;
  hasMore?: boolean | undefined;
}

// API response patterns
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T | undefined;
  error?: string | Error | undefined;
  message?: string | undefined;
  statusCode?: number | undefined;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown> | undefined;
  statusCode?: number | undefined;
}

// Trading-specific patterns
export interface TradeRequest {
  symbol: string;
  quantity: number;
  price?: number | undefined;
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  comment?: string | undefined;
}

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice?: number | undefined;
  stopLoss?: number | null | undefined;
  takeProfit?: number | null | undefined;
  side: 'buy' | 'sell';
  status?: 'open' | 'closed' | undefined;
  openedAt: Date;
  closedAt?: Date | undefined;
}

// Utility types for strict mode compliance
export type OptionalString = string | undefined;
export type OptionalNumber = number | undefined;
export type OptionalBoolean = boolean | undefined;
export type NullableString = string | null | undefined;
export type NullableNumber = number | null | undefined;

/**
 * Helper type to make all properties of T optional with explicit undefined
 * Useful for patch/update operations
 */
export type PartialWithUndefined<T> = {
  [P in keyof T]?: T[P] | undefined;
};

/**
 * Helper type to add undefined to all optional properties
 * Converts { prop?: string } to { prop?: string | undefined }
 */
export type StrictOptional<T> = {
  [K in keyof T]: T[K] extends infer U | undefined
    ? U | undefined
    : T[K] | undefined;
};
