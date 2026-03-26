/**
 * bQuery.js Testing Utilities
 *
 * Helpers for mounting components, controlling signals, mocking the router,
 * dispatching events, and asserting async conditions in tests.
 *
 * @module bquery/testing
 *
 * @example
 * ```ts
 * import {
 *   renderComponent,
 *   flushEffects,
 *   mockSignal,
 *   mockRouter,
 *   fireEvent,
 *   waitFor,
 * } from '@bquery/bquery/testing';
 * ```
 */

// Runtime API
export { renderComponent, flushEffects, mockSignal, mockRouter, fireEvent, waitFor } from './testing';

// Types
export type {
  FireEventOptions,
  MockRouter,
  MockRouterOptions,
  MockSignal,
  RenderComponentOptions,
  RenderResult,
  Route,
  WaitForOptions,
} from './types';
