/**
 * Optional concurrency helpers built on zero-build Web Workers.
 *
 * The initial milestone intentionally focuses on explicit task execution,
 * lifecycle cleanup, timeout handling, and cancellation without introducing
 * pools, decorators, or build-time worker glue.
 *
 * @module bquery/concurrency
 */

export { createTaskWorker, runTask } from './task';
export { getConcurrencySupport, isConcurrencySupported } from './support';
export {
  TaskWorkerAbortError,
  TaskWorkerError,
  TaskWorkerSerializationError,
  TaskWorkerTimeoutError,
  TaskWorkerUnsupportedError,
} from './errors';

export type {
  ConcurrencySupport,
  CreateTaskWorkerOptions,
  RunTaskOptions,
  TaskRunOptions,
  TaskWorker,
  TaskWorkerErrorCode,
  TaskWorkerState,
  WorkerTaskHandler,
} from './types';
