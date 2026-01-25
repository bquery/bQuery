/**
 * Miscellaneous utility helpers.
 *
 * @module bquery/core/utils/misc
 */

/**
 * Creates a stable unique ID for DOM usage.
 *
 * @param prefix - Optional prefix for the ID (default: 'bQuery')
 * @returns A unique identifier string
 *
 * @example
 * ```ts
 * const id = uid('modal'); // 'modal_x7k2m9p'
 * ```
 */
export function uid(prefix = 'bQuery'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Delays execution for a specified number of milliseconds.
 *
 * @param ms - Milliseconds to delay
 * @returns A promise that resolves after the delay
 *
 * @example
 * ```ts
 * await sleep(1000); // Wait 1 second
 * console.log('Done!');
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely parses a JSON string, returning a default value on error.
 *
 * @template T - The expected type of the parsed value
 * @param json - The JSON string to parse
 * @param fallback - The default value if parsing fails
 * @returns The parsed value or the fallback
 *
 * @example
 * ```ts
 * parseJson('{"name":"bQuery"}', {}); // { name: 'bQuery' }
 * parseJson('invalid', {}); // {}
 * ```
 */
export function parseJson<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Checks for emptiness across common value types.
 *
 * @param value - The value to check
 * @returns True if the value is empty (null, undefined, empty string, empty array, or empty object)
 *
 * @example
 * ```ts
 * isEmpty('');       // true
 * isEmpty([]);       // true
 * isEmpty({});       // true
 * isEmpty(null);     // true
 * isEmpty('hello');  // false
 * isEmpty([1, 2]);   // false
 * ```
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
}
