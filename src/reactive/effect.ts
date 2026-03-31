/**
 * Reactive effects.
 */

import { CleanupFn, Observer, track, clearDependencies } from './internals';
import { getActiveScope } from './scope';

/**
 * Creates a side effect that automatically re-runs when dependencies change.
 *
 * The effect runs immediately upon creation and then re-runs whenever
 * any signal or computed value read inside it changes.
 *
 * If created inside an {@link effectScope}, the effect is automatically
 * collected and will be disposed when the scope stops.
 *
 * @param fn - The effect function to run
 * @returns A cleanup function to stop the effect
 */
export const effect = (fn: () => void | CleanupFn): CleanupFn => {
  let cleanupFn: CleanupFn | void;
  let isDisposed = false;

  const runCleanup = (): void => {
    if (cleanupFn) {
      try {
        cleanupFn();
      } catch (error) {
        console.error('bQuery reactive: Error in effect cleanup', error);
      }
      cleanupFn = undefined;
    }
  };

  const observer: Observer = () => {
    if (isDisposed) return;

    runCleanup();

    // Clear old dependencies before running to avoid stale subscriptions
    clearDependencies(observer);

    try {
      cleanupFn = track(observer, fn);
    } catch (error) {
      console.error('bQuery reactive: Error in effect', error);
    }
  };

  observer();

  const dispose: CleanupFn = () => {
    isDisposed = true;
    runCleanup();
    // Clean up all dependencies when effect is disposed
    clearDependencies(observer);
  };

  // Auto-register with the current scope so scope.stop() disposes this effect
  const scope = getActiveScope();
  if (scope) {
    scope._addDisposer(dispose);
  }

  return dispose;
};
