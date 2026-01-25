/**
 * String-focused utility helpers.
 *
 * @module bquery/core/utils/string
 */

/**
 * Capitalizes the first letter of a string.
 *
 * @param str - The string to capitalize
 * @returns The capitalized string
 *
 * @example
 * ```ts
 * capitalize('hello'); // 'Hello'
 * ```
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to kebab-case.
 *
 * @param str - The string to convert
 * @returns The kebab-cased string
 *
 * @example
 * ```ts
 * toKebabCase('myVariableName'); // 'my-variable-name'
 * ```
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to camelCase.
 *
 * @param str - The string to convert
 * @returns The camelCased string
 *
 * @example
 * ```ts
 * toCamelCase('my-variable-name'); // 'myVariableName'
 * ```
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

/**
 * Truncates a string to a maximum length.
 *
 * @param str - The string to truncate
 * @param maxLength - The maximum length
 * @param suffix - The suffix to append when truncating (default: '…')
 * @returns The truncated string
 *
 * @example
 * ```ts
 * truncate('Hello world', 8); // 'Hello…'
 * ```
 */
export function truncate(str: string, maxLength: number, suffix = '…'): string {
  if (maxLength <= 0) return '';
  if (str.length <= maxLength) return str;
  const sliceLength = Math.max(0, maxLength - suffix.length);
  return `${str.slice(0, sliceLength)}${suffix}`;
}

/**
 * Converts a string to a URL-friendly slug.
 *
 * @param str - The string to slugify
 * @returns The slugified string
 *
 * @example
 * ```ts
 * slugify('Hello, World!'); // 'hello-world'
 * ```
 */
export function slugify(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .toLowerCase();
}

/**
 * Escapes a string for safe usage inside a RegExp.
 *
 * @param str - The string to escape
 * @returns The escaped string
 *
 * @example
 * ```ts
 * escapeRegExp('[a-z]+'); // '\\[a-z\\]+'
 * ```
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
