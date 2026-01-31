/**
 * Number-focused utility helpers.
 *
 * @module bquery/core/utils/number
 */

/**
 * Generates a random integer between min and max (inclusive).
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns A random integer in the range [min, max]
 *
 * @example
 * ```ts
 * const roll = randomInt(1, 6); // Random dice roll
 * ```
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamps a number between a minimum and maximum value.
 *
 * @param value - The value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns The clamped value
 *
 * @example
 * ```ts
 * clamp(150, 0, 100); // 100
 * clamp(-10, 0, 100); // 0
 * clamp(50, 0, 100);  // 50
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Checks if a number is within a range.
 *
 * @param value - The value to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @param inclusive - Whether the range is inclusive (default: true)
 * @returns True if the value is within the range
 *
 * @example
 * ```ts
 * inRange(5, 1, 10); // true
 * inRange(10, 1, 10, false); // false
 * ```
 */
export function inRange(value: number, min: number, max: number, inclusive = true): boolean {
  if (inclusive) return value >= min && value <= max;
  return value > min && value < max;
}

/**
 * Converts a value to a number with a fallback on NaN.
 *
 * @param value - The value to convert
 * @param fallback - The fallback value if conversion fails (default: 0)
 * @returns The parsed number or the fallback
 *
 * @example
 * ```ts
 * toNumber('42'); // 42
 * toNumber('nope', 10); // 10
 * ```
 */
export function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}
