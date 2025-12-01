/**
 * Shared utility functions for formatting data
 * Ported from web app: resources/js/utils/formatters.ts
 */

/**
 * Parse a value to a number, returning 0 if invalid
 */
export const parseOrZero = (
  value: number | string | undefined | null
): number => {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const parsed = parseFloat(value.toString());
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format a number as currency using US locale
 */
export const formatCurrency = (amount: number | string): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseOrZero(amount));
};

/**
 * Format a number as currency with dollar sign
 */
export const formatCurrencyWithSymbol = (amount: number | string): string => {
  return '$' + formatCurrency(amount);
};

/**
 * Format a number as a percentage
 */
export const formatPercentage = (
  value: number | string,
  decimals: number = 1
): string => {
  const num = parseOrZero(value);
  return num.toFixed(decimals) + '%';
};

/**
 * Format a number with specified decimal places
 */
export const formatNumber = (
  value: number | string,
  decimals: number = 2
): string => {
  const num = parseOrZero(value);
  return num.toFixed(decimals);
};

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateString);
  }
};
