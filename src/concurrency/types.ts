/**
 * Public types for the concurrency module.
 *
 * @module bquery/concurrency
 */

/**
 * Standalone task handler executed inside a Web Worker.
 *
 * The function must be self-contained because it is stringified and evaluated
 * in the worker context without access to outer closures.
 *
 * @example
 * ```ts
 * const square = (value: number) => value * value;
 * ```
 */
export type WorkerTaskHandler<TInput = void, TResult = unknown> = (
  input: TInput
) => TResult | Promise<TResult>;

/** Lifecycle state of a reusable task worker. */
export type TaskWorkerState = 'idle' | 'running' | 'terminated';

/** Structured error codes emitted by the concurrency module. */
export type TaskWorkerErrorCode =
  | 'ABORT'
  | 'BUSY'
  | 'METHOD_NOT_FOUND'
  | 'SERIALIZATION'
  | 'TERMINATED'
  | 'TIMEOUT'
  | 'UNSUPPORTED'
  | 'WORKER';

/** Per-run options for worker task execution. */
export interface TaskRunOptions {
  /**
   * AbortSignal used to cancel the current run.
   * Cancellation terminates the active worker run so later runs start cleanly.
   */
  signal?: AbortSignal;
  /**
   * Optional timeout in milliseconds.
   * Non-finite or non-positive values disable timeout handling.
   */
  timeout?: number;
  /**
   * Transferable values passed together with the task payload.
   * Use this for large `ArrayBuffer`-backed payloads when appropriate.
   */
  transfer?: Transferable[];
}

/** Options for creating a reusable task worker. */
export interface CreateTaskWorkerOptions {
  /** Optional worker name shown in browser tooling where supported. */
  name?: string;
  /**
   * Default timeout applied to `run()` calls when the run itself does not
   * override it.
   */
  timeout?: number;
}

/** Options accepted by the one-off `runTask()` helper. */
export interface RunTaskOptions extends CreateTaskWorkerOptions, TaskRunOptions {}

/** Options for creating a reusable RPC worker. */
export interface CreateRpcWorkerOptions extends CreateTaskWorkerOptions {}

/** Options accepted by the one-off RPC method helper. */
export interface CallWorkerMethodOptions extends CreateRpcWorkerOptions, TaskRunOptions {}

/** Feature-detection snapshot for the browser concurrency runtime. */
export interface ConcurrencySupport {
  /** `Worker` constructor availability. */
  worker: boolean;
  /** `Blob` availability for zero-build inline worker scripts. */
  blob: boolean;
  /** `URL.createObjectURL()` availability. */
  objectUrl: boolean;
  /** `AbortController` availability for cancellation ergonomics. */
  abortController: boolean;
  /** Whether the minimum browser primitives for this module are present. */
  supported: boolean;
}

/**
 * Reusable worker-task handle.
 *
 * A task worker runs one task at a time. Queueing and pooling are intentionally
 * left for later milestones so the initial API stays explicit and lightweight.
 */
export interface TaskWorker<TInput = void, TResult = unknown> {
  /** Current lifecycle state. */
  readonly state: TaskWorkerState;
  /** Whether a task is currently running. */
  readonly busy: boolean;
  /**
   * Execute one task in the backing worker.
   *
   * @param input - Serializable input passed to the task handler
   * @param options - Per-run timeout, abort, and transfer options
   */
  run(input: TInput, options?: TaskRunOptions): Promise<TResult>;
  /**
   * Permanently terminate the backing worker.
   * Any in-flight task is rejected with a termination error.
   */
  terminate(): void;
}

/** Standalone named RPC handler executed inside a Web Worker. */
export type WorkerRpcHandler<TInput = void, TResult = unknown> = WorkerTaskHandler<TInput, TResult>;

/** Explicit map of named worker RPC handlers. */
export type WorkerRpcHandlers = Record<string, WorkerRpcHandler<any, any>>;

/** Reusable RPC-style worker handle with named method dispatch. */
export interface RpcWorker<TRoutes extends WorkerRpcHandlers = WorkerRpcHandlers> {
  /** Current lifecycle state. */
  readonly state: TaskWorkerState;
  /** Whether a method call is currently in progress. */
  readonly busy: boolean;
  /**
   * Call one named RPC method in the backing worker.
   *
   * @param method - Method name from the provided RPC handler map
   * @param input - Serializable payload for the selected method
   * @param options - Per-call timeout, abort, and transfer options
   */
  call<TMethod extends keyof TRoutes & string>(
    method: TMethod,
    input: Parameters<TRoutes[TMethod]>[0],
    options?: TaskRunOptions
  ): Promise<Awaited<ReturnType<TRoutes[TMethod]>>>;
  /**
   * Permanently terminate the backing worker.
   * Any in-flight call is rejected with a termination error.
   */
  terminate(): void;
}
