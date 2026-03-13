/**
 * Security utilities for HTML sanitization.
 * All DOM writes are sanitized by default to prevent XSS attacks.
 *
 * @module bquery/security
 */

import { sanitizeHtmlCore } from './sanitize-core';
import type { SanitizeOptions } from './types';
export { generateNonce } from './csp';
export { isTrustedTypesSupported } from './trusted-types';

const sanitizedHtmlBrand: unique symbol = Symbol('bquery.sanitized-html');
const trustedHtmlBrand: unique symbol = Symbol('bquery.trusted-html.brand');

/**
 * Branded HTML string that has already been sanitized for safe DOM insertion.
 */
export type SanitizedHtml = string & { readonly [sanitizedHtmlBrand]: true };

/**
 * Marker object that safeHtml can splice into templates without escaping again.
 */
export type TrustedHtml = { readonly [trustedHtmlBrand]: true; toString(): string };

const TRUSTED_HTML_VALUE = Symbol('bquery.trusted-html');

type TrustedHtmlValue = TrustedHtml & { readonly [TRUSTED_HTML_VALUE]: string };

const toSanitizedHtml = (html: string): SanitizedHtml => html as SanitizedHtml;

/**
 * Sanitize HTML string, removing dangerous elements and attributes.
 * Uses Trusted Types when available for CSP compliance.
 *
 * @param html - The HTML string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized HTML string
 *
 * @example
 * ```ts
 * const safe = sanitizeHtml('<div onclick="alert(1)">Hello</div>');
 * // Returns: '<div>Hello</div>'
 * ```
 */
export const sanitizeHtml = (html: string, options: SanitizeOptions = {}): SanitizedHtml => {
  return toSanitizedHtml(sanitizeHtmlCore(html, options));
};

/**
 * Escape HTML entities to prevent XSS.
 * Use this for displaying user content as text.
 *
 * @param text - The text to escape
 * @returns Escaped HTML string
 *
 * @example
 * ```ts
 * escapeHtml('<script>alert(1)</script>');
 * // Returns: '&lt;script&gt;alert(1)&lt;/script&gt;'
 * ```
 */
export const escapeHtml = (text: string): string => {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;',
  };
  return text.replace(/[&<>"'`]/g, (char) => escapeMap[char]);
};

/**
 * Mark a sanitized HTML string for verbatim splicing into safeHtml templates.
 *
 * @param html - HTML previously produced by sanitizeHtml or another trusted bQuery helper
 * @returns Trusted HTML marker object for safeHtml interpolations
 *
 * @example
 * ```ts
 * const icon = trusted(sanitizeHtml('<svg><circle /></svg>'));
 * const markup = safeHtml`<span>${icon}</span>`;
 * ```
 */
export const trusted = (html: SanitizedHtml): TrustedHtml => {
  const value = String(html);
  return Object.freeze({
    [trustedHtmlBrand]: true as const,
    [TRUSTED_HTML_VALUE]: value,
    toString: () => value,
  });
};

/**
 * Check whether a value is a trusted HTML marker created by trusted().
 *
 * @internal
 */
export const isTrustedHtml = (value: unknown): value is TrustedHtml => {
  return typeof value === 'object' && value !== null && TRUSTED_HTML_VALUE in value;
};

/**
 * Unwrap the raw HTML string stored inside a trusted HTML marker.
 *
 * @internal
 */
export const unwrapTrustedHtml = (value: TrustedHtml): string => {
  return (value as TrustedHtmlValue)[TRUSTED_HTML_VALUE];
};

/**
 * Strip all HTML tags and return plain text.
 *
 * @param html - The HTML string to strip
 * @returns Plain text content
 */
export const stripTags = (html: string): string => {
  return sanitizeHtmlCore(html, { stripAllTags: true });
};

export type { SanitizeOptions } from './types';
