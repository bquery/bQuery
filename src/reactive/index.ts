/**
 * Reactive module providing fine-grained reactivity primitives.
 *
 * @module bquery/reactive
 */

export {
  Computed,
  Signal,
  batch,
  computed,
  createUseFetch,
  effect,
  effectScope,
  getCurrentScope,
  isComputed,
  isSignal,
  linkedSignal,
  onScopeDispose,
  persistedSignal,
  readonly,
  signal,
  toValue,
  useAsyncData,
  useFetch,
  untrack,
  watch,
} from './signal';

export type {
  AsyncDataState,
  AsyncDataStatus,
  AsyncWatchSource,
  CleanupFn,
  EffectScope,
  FetchInput,
  LinkedSignal,
  MaybeSignal,
  Observer,
  ReadonlySignal,
  ReadonlySignalHandle,
  UseAsyncDataOptions,
  UseFetchOptions,
} from './signal';
