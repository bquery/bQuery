/**
 * Optional concurrency helpers built on zero-build Web Workers.
 *
 * The initial milestone intentionally focuses on explicit task execution,
 * lifecycle cleanup, timeout handling, and cancellation without introducing
 * pools, decorators, or build-time worker glue.
 *
 * @module bquery/concurrency
 */

export { callWorkerMethod, createRpcWorker } from './rpc';
export { createRpcPool, createTaskPool } from './pool';
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
  CallWorkerMethodOptions,
  CreateRpcPoolOptions,
  CreateRpcWorkerOptions,
  CreateTaskPoolOptions,
  CreateTaskWorkerOptions,
  RpcPool,
  RpcWorker,
  RunTaskOptions,
  TaskPool,
  TaskRunOptions,
  TaskWorker,
  TaskWorkerErrorCode,
  TaskWorkerState,
  WorkerRpcHandler,
  WorkerRpcHandlers,
  WorkerTaskHandler,
} from './types';
