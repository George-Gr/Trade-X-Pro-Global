/**
 * Utility functions for Lead Management components
 */

/**
 * Format currency values for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Get color class for lead status badge
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'new':
      return 'bg-blue-500';
    case 'contacted':
      return 'bg-yellow-500';
    case 'qualified':
      return 'bg-green-500';
    case 'converted':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

/**
 * Get color class for KYC status badge
 */
export const getKycColor = (status: string): string => {
  switch (status) {
    case 'approved':
      return 'bg-green-500';
    case 'rejected':
      return 'bg-red-500';
    case 'pending':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

/**
 * Static lookup object for trading experience labels
 */
export const EXPERIENCE_LABELS: Record<string, string> = {
  none: 'No Experience',
  beginner: 'Beginner (< 1 year)',
  intermediate: 'Intermediate (1-3 years)',
  experienced: 'Experienced (3-5 years)',
  expert: 'Expert (5+ years)',
};

/**
 * Static lookup object for financial capability labels
 */
export const FINANCIAL_LABELS: Record<string, string> = {
  'under-1000': 'Under $1,000',
  '1000-5000': '$1,000 - $5,000',
  '5000-25000': '$5,000 - $25,000',
  '25000-100000': '$25,000 - $100,000',
  'over-100000': 'Over $100,000',
};

/**
 * Get trading experience label from key
 */
export const getExperienceLabel = (exp: string): string => {
  return EXPERIENCE_LABELS[exp] || exp;
};

/**
 * Get financial capability label from key
 */
export const getFinancialLabel = (fin: string): string => {
  return FINANCIAL_LABELS[fin] || fin;
};
