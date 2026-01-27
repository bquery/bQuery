/**
 * Dependency tracking control helpers.
 */

import { withoutCurrentObserver } from './internals';

/**
 * Executes a function without tracking any signal dependencies.
 * Useful when reading a signal value without creating a reactive dependency.
 *
 * This implementation temporarily hides the current observer rather than
 * disabling tracking globally. This ensures that nested reactive internals
 * (e.g., computed recomputation triggered during untrack) can still properly
 * track their own dependencies.
 *
 * @template T - The return type of the function
 * @param fn - The function to execute without tracking
 * @returns The result of the function
 *
 * @example
 * ```ts
 * const count = signal(0);
 * effect(() => {
 *   // This read creates a dependency
 *   console.log(count.value);
 *   // This read does not create a dependency
 *   const snapshot = untrack(() => count.value);
 * });
 * ```
 */
export const untrack = <T>(fn: () => T): T => withoutCurrentObserver(fn);
