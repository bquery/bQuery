/**
 * Number and date formatting helpers using Intl APIs.
 * @module bquery/i18n
 */

import type { DateFormatOptions, NumberFormatOptions } from './types';

/**
 * Formats a number using the Intl.NumberFormat API.
 *
 * @param value - The number to format
 * @param locale - The locale code (e.g. 'en-US', 'de-DE')
 * @param options - Intl.NumberFormat options
 * @returns The formatted number string
 *
 * @example
 * ```ts
 * formatNumber(1234.56, 'en-US'); // '1,234.56'
 * formatNumber(1234.56, 'de-DE'); // '1.234,56'
 * formatNumber(0.42, 'en-US', { style: 'percent' }); // '42%'
 * formatNumber(9.99, 'en-US', { style: 'currency', currency: 'USD' }); // '$9.99'
 * ```
 */
export const formatNumber = (
  value: number,
  locale: string,
  options?: NumberFormatOptions
): string => {
  const { locale: _ignored, ...intlOptions } = options ?? {};
  try {
    return new Intl.NumberFormat(locale, intlOptions).format(value);
  } catch {
    // Fall back to basic toString on Intl errors
    return String(value);
  }
};

/**
 * Formats a date using the Intl.DateTimeFormat API.
 *
 * @param value - The date to format (Date object or timestamp)
 * @param locale - The locale code
 * @param options - Intl.DateTimeFormat options
 * @returns The formatted date string
 *
 * @example
 * ```ts
 * const date = new Date('2026-03-26');
 * formatDate(date, 'en-US'); // '3/26/2026'
 * formatDate(date, 'de-DE'); // '26.3.2026'
 * formatDate(date, 'en-US', { dateStyle: 'long' }); // 'March 26, 2026'
 * ```
 */
export const formatDate = (
  value: Date | number,
  locale: string,
  options?: DateFormatOptions
): string => {
  const { locale: _ignored, ...intlOptions } = options ?? {};
  const date = typeof value === 'number' ? new Date(value) : value;
  try {
    return new Intl.DateTimeFormat(locale, intlOptions).format(date);
  } catch {
    // Fall back to toLocaleString on Intl errors
    return date.toLocaleString();
  }
};
