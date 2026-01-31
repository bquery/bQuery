/**
 * Array-focused utility helpers.
 *
 * @module bquery/core/utils/array
 */

/**
 * Ensures the input is always returned as an array.
 *
 * @template T - The item type
 * @param value - A single value, array, or nullish value
 * @returns An array (empty if nullish)
 *
 * @example
 * ```ts
 * ensureArray('a'); // ['a']
 * ensureArray(['a', 'b']); // ['a', 'b']
 * ensureArray(null); // []
 * ```
 */
export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Removes duplicate entries from an array.
 *
 * @template T - The item type
 * @param items - The array to deduplicate
 * @returns A new array with unique items
 *
 * @example
 * ```ts
 * unique([1, 2, 2, 3]); // [1, 2, 3]
 * ```
 */
export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

/**
 * Splits an array into chunks of a given size.
 *
 * @template T - The item type
 * @param items - The array to chunk
 * @param size - The maximum size of each chunk
 * @returns An array of chunks
 *
 * @example
 * ```ts
 * chunk([1, 2, 3, 4, 5], 2); // [[1,2],[3,4],[5]]
 * ```
 */
export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [];
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

/**
 * Removes falsy values from an array.
 *
 * @template T - The item type
 * @param items - The array to compact
 * @returns A new array without falsy values
 *
 * @example
 * ```ts
 * compact([0, 1, '', 'ok', null]); // [1, 'ok']
 * ```
 */
export function compact<T>(items: Array<T | null | undefined | false | 0 | ''>): T[] {
  return items.filter(Boolean) as T[];
}

/**
 * Flattens a single level of nested arrays.
 *
 * @template T - The item type
 * @param items - The array to flatten
 * @returns A new flattened array
 *
 * @example
 * ```ts
 * flatten([1, [2, 3], 4]); // [1, 2, 3, 4]
 * ```
 */
export function flatten<T>(items: Array<T | T[]>): T[] {
  const result: T[] = [];
  for (const item of items) {
    if (Array.isArray(item)) {
      result.push(...item);
    } else {
      result.push(item);
    }
  }
  return result;
}
