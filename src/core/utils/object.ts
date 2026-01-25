/**
 * Object-focused utility helpers.
 *
 * @module bquery/core/utils/object
 */

/**
 * Checks if a value is a plain object (not null, array, or class instance).
 *
 * @param value - The value to check
 * @returns True if the value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Checks if a key could cause prototype pollution.
 * These keys are dangerous when used in object merging operations.
 *
 * @param key - The key to check
 * @returns True if the key is a prototype pollution vector
 *
 * @internal
 */
export function isPrototypePollutionKey(key: string): boolean {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}

/**
 * Creates a deep clone using structuredClone if available, otherwise fallback to JSON.
 *
 * @template T - The type of value being cloned
 * @param value - The value to clone
 * @returns A deep copy of the value
 *
 * @example
 * ```ts
 * const original = { nested: { value: 1 } };
 * const copy = clone(original);
 * copy.nested.value = 2;
 * console.log(original.nested.value); // 1
 * ```
 */
export function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Deep-merges plain objects into a new object.
 * Later sources override earlier ones for primitive values.
 * Objects are recursively merged.
 *
 * @template T - The type of the merged object
 * @param sources - Objects to merge
 * @returns A new object with all sources merged
 *
 * @example
 * ```ts
 * const result = merge(
 *   { a: 1, nested: { x: 1 } },
 *   { b: 2, nested: { y: 2 } }
 * );
 * // Result: { a: 1, b: 2, nested: { x: 1, y: 2 } }
 * ```
 *
 * @security This method is protected against prototype pollution attacks.
 * Keys like `__proto__`, `constructor`, and `prototype` are ignored.
 */
export function merge<T extends Record<string, unknown>>(...sources: T[]): T {
  const result: Record<string, unknown> = {};
  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (isPrototypePollutionKey(key)) continue;

      if (isPlainObject(value) && isPlainObject(result[key])) {
        result[key] = merge(
          result[key] as Record<string, unknown>,
          value as Record<string, unknown>
        );
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

/**
 * Picks specified keys from an object.
 *
 * @template T - The object type
 * @template K - The key type
 * @param obj - The source object
 * @param keys - Keys to pick
 * @returns A new object with only the specified keys
 *
 * @example
 * ```ts
 * const user = { name: 'John', age: 30, email: 'john@example.com' };
 * pick(user, ['name', 'email']); // { name: 'John', email: 'john@example.com' }
 * ```
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omits specified keys from an object.
 *
 * @template T - The object type
 * @template K - The key type
 * @param obj - The source object
 * @param keys - Keys to omit
 * @returns A new object without the specified keys
 *
 * @example
 * ```ts
 * const user = { name: 'John', age: 30, password: 'secret' };
 * omit(user, ['password']); // { name: 'John', age: 30 }
 * ```
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

/**
 * Checks if an object has a given own property.
 *
 * @template T - The object type
 * @param obj - The object to check
 * @param key - The property key
 * @returns True if the property exists on the object
 *
 * @example
 * ```ts
 * hasOwn({ a: 1 }, 'a'); // true
 * ```
 */
export function hasOwn<T extends object>(obj: T, key: PropertyKey): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
