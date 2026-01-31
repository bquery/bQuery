/**
 * Prop coercion utilities.
 *
 * @module bquery/component
 */

import type { PropDefinition } from './types';

/**
 * Coerces a string attribute value into a typed prop value.
 * Supports String, Number, Boolean, Object, Array, and custom converters.
 *
 * @internal
 * @template T - The target type
 * @param rawValue - The raw string value from the attribute
 * @param config - The prop definition with type information
 * @returns The coerced value of type T
 */
export const coercePropValue = <T>(rawValue: string, config: PropDefinition<T>): T => {
  const { type } = config;

  if (type === String) return rawValue as T;

  if (type === Number) {
    return Number(rawValue) as T;
  }

  if (type === Boolean) {
    const normalized = rawValue.trim().toLowerCase();
    if (normalized === '' || normalized === 'true' || normalized === '1') {
      return true as T;
    }
    if (normalized === 'false' || normalized === '0') {
      return false as T;
    }
    return Boolean(rawValue) as T;
  }

  if (type === Object || type === Array) {
    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return rawValue as T;
    }
  }

  if (typeof type === 'function') {
    const callable = type as (value: unknown) => T;
    const constructable = type as new (value: unknown) => T;

    // Explicit construct mode takes precedence
    if (config.construct === true) {
      return Reflect.construct(constructable, [rawValue]) as T;
    }
    if (config.construct === false) {
      return callable(rawValue);
    }

    // Auto-detect: Check if type is constructable
    // A function is considered constructable if:
    // 1. It has a prototype with properties beyond just constructor, OR
    // 2. Its prototype.constructor is not itself (inherited), OR
    // 3. It's a class (toString starts with "class")
    const hasPrototype = type.prototype !== undefined && type.prototype !== null;
    const prototypeProps = hasPrototype ? Object.getOwnPropertyNames(type.prototype) : [];
    const hasPrototypeMethods = prototypeProps.length > 1;
    const hasInheritedConstructor = hasPrototype && type.prototype.constructor !== type;
    const isClassSyntax = /^class\s/.test(Function.prototype.toString.call(type));

    const isConstructable = hasPrototypeMethods || hasInheritedConstructor || isClassSyntax;

    // For constructable types (e.g. Date, custom classes), prefer `new` to avoid
    // silent wrong-type returns (Date() returns string, new Date() returns Date)
    if (isConstructable) {
      try {
        return Reflect.construct(constructable, [rawValue]) as T;
      } catch {
        // Fall back to calling as function if construction fails
        return callable(rawValue);
      }
    }

    // For non-constructable types (arrow functions, plain functions), call directly
    // but fall back to constructor if result is undefined (common for function constructors)
    try {
      const result = callable(rawValue);

      // If calling without `new` returned undefined and the function has a prototype,
      // it's likely a function constructor that should be called with `new`
      if (result === undefined && hasPrototype) {
        try {
          return Reflect.construct(constructable, [rawValue]) as T;
        } catch {
          // Construction also failed, return the undefined
          return result as T;
        }
      }

      return result as T;
    } catch (error) {
      // Fall back to constructor if error indicates 'new' is required
      const isNewRequired =
        error instanceof TypeError &&
        /cannot be invoked without 'new'|is not a function/i.test(error.message);

      if (isNewRequired) {
        return Reflect.construct(constructable, [rawValue]) as T;
      }

      // Rethrow original error for non-constructable converters
      throw error;
    }
  }

  return rawValue as T;
};
