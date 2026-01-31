/**
 * Internal router state (active router and current route signal).
 * @module bquery/router
 */

import { computed, signal, type ReadonlySignal, type Signal } from '../reactive/index';
import type { Route, Router } from './types';

// ============================================================================
// Internal State
// ============================================================================

/** @internal */
let activeRouter: Router | null = null;

/** @internal */
export const routeSignal: Signal<Route> = signal<Route>({
  path: '',
  params: {},
  query: {},
  matched: null,
  hash: '',
});

/**
 * Reactive signal containing the current route.
 *
 * @example
 * ```ts
 * import { currentRoute } from 'bquery/router';
 * import { effect } from 'bquery/reactive';
 *
 * effect(() => {
 *   document.title = `Page: ${currentRoute.value.path}`;
 * });
 * ```
 */
export const currentRoute: ReadonlySignal<Route> = computed(() => routeSignal.value);

/** @internal */
export const getActiveRouter = (): Router | null => activeRouter;

/** @internal */
export const setActiveRouter = (router: Router | null): void => {
  activeRouter = router;
};
