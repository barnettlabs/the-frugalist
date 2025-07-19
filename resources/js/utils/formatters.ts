/**
 * Shared utility functions for formatting data
 */

/**
 * Format a number as currency using US locale
 * @param {number|string} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(parseOrZero(amount));
};

/**
 * Format a number as a percentage
 * @param {number|string} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (
    value: number | string,
    decimals: number = 1,
) => {
    const num = parseOrZero(value);
    return num.toFixed(decimals) + "%";
};

/**
 * Parse a value to a number, returning 0 if invalid
 * @param {string|number} value - The value to parse
 * @returns {number} - Parsed number or 0
 */
export const parseOrZero = (value: number | string) => {
    const parsed = parseFloat(value.toString()) || 0;
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format a number with specified decimal places
 * @param {number|string} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted number string
 */
export const formatNumber = (value: number | string, decimals: number = 2) => {
    const num = parseOrZero(value);
    return num.toFixed(decimals);
};
