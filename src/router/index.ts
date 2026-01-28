/**
 * Minimal SPA router with History API integration.
 *
 * This module provides a lightweight, signal-based router for single-page
 * applications. Features include:
 * - History API navigation
 * - Route matching with params and wildcards
 * - Lazy route loading
 * - Navigation guards (beforeEach, afterEach)
 * - Reactive current route via signals
 * - Multi-value query params (e.g., `?tag=a&tag=b` → `{ tag: ['a', 'b'] }`)
 *
 * @module bquery/router
 *
 * @example
 * ```ts
 * import { createRouter, navigate, currentRoute } from 'bquery/router';
 * import { effect } from 'bquery/reactive';
 *
 * const router = createRouter({
 *   routes: [
 *     { path: '/', component: () => import('./Home') },
 *     { path: '/user/:id', component: () => import('./User') },
 *     { path: '*', component: () => import('./NotFound') },
 *   ],
 * });
 *
 * effect(() => {
 *   console.log('Route changed:', currentRoute.value);
 * });
 *
 * navigate('/user/42');
 * ```
 */

export { interceptLinks, link } from './links';
export { back, forward, navigate } from './navigation';
export { createRouter } from './router';
export { currentRoute } from './state';
export type { NavigationGuard, Route, RouteDefinition, Router, RouterOptions } from './types';
export { isActive, isActiveSignal, resolve } from './utils';
