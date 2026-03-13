import {
  escapeHtml,
  isTrustedHtml,
  type SanitizedHtml,
  unwrapTrustedHtml,
} from '../security/sanitize';

/**
 * Tagged template literal for creating HTML strings.
 *
 * This function handles interpolation of values into HTML templates,
 * converting null/undefined to empty strings.
 *
 * @param strings - Template literal string parts
 * @param values - Interpolated values
 * @returns Combined HTML string
 *
 * @example
 * ```ts
 * const name = 'World';
 * const greeting = html`<h1>Hello, ${name}!</h1>`;
 * // Result: '<h1>Hello, World!</h1>'
 * ```
 */
export const html = (strings: TemplateStringsArray, ...values: unknown[]): string => {
  return strings.reduce((acc, part, index) => `${acc}${part}${values[index] ?? ''}`, '');
};

/**
 * Escapes HTML entities in interpolated values for XSS prevention.
 * Use this when you need to safely embed user content in templates.
 *
 * @param strings - Template literal string parts
 * @param values - Interpolated values to escape
 * @returns Combined HTML string with escaped values
 *
 * @example
 * ```ts
 * const userInput = '<script>alert("xss")</script>';
 * const safe = safeHtml`<div>${userInput}</div>`;
 * // Result: '<div>&lt;script&gt;alert("xss")&lt;/script&gt;</div>'
 * ```
 */
export const safeHtml = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): SanitizedHtml => {
  const escape = (value: unknown): string => {
    if (value == null) return '';
    if (isTrustedHtml(value)) return unwrapTrustedHtml(value);
    return escapeHtml(String(value));
  };

  return strings.reduce(
    (acc, part, index) => `${acc}${part}${index < values.length ? escape(values[index]) : ''}`,
    ''
  ) as SanitizedHtml;
};
