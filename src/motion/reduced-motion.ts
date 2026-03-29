/**
 * Reduced motion detection and global toggle helpers.
 *
 * @module bquery/motion
 */

/**
 * Global override for reduced motion preference.
 * When `null`, the system preference is used.
 * When `true`, reduced motion is forced on.
 * When `false`, reduced motion is forced off.
 *
 * @internal
 */
let reducedMotionOverride: boolean | null = null;

/**
 * Check whether reduced motion should be applied.
 *
 * Returns the global override if set via {@link setReducedMotion},
 * otherwise checks the user's system preference.
 *
 * @returns `true` if reduced motion should be applied
 *
 * @example
 * ```ts
 * if (prefersReducedMotion()) {
 *   // skip animation
 * }
 * ```
 */
export const prefersReducedMotion = (): boolean => {
  if (reducedMotionOverride !== null) {
    return reducedMotionOverride;
  }
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Programmatically override the reduced motion preference globally.
 *
 * When set to `true`, all motion functions that respect reduced motion
 * will skip animations. When set to `false`, animations run regardless
 * of system settings. Pass `null` to restore system-preference detection.
 *
 * @param override - `true` to force reduced motion, `false` to force
 *   full motion, or `null` to use system preference
 *
 * @example
 * ```ts
 * // Force all animations to be instant
 * setReducedMotion(true);
 *
 * // Re-enable animations regardless of system
 * setReducedMotion(false);
 *
 * // Restore system preference
 * setReducedMotion(null);
 * ```
 */
export const setReducedMotion = (override: boolean | null): void => {
  reducedMotionOverride = override;
};
