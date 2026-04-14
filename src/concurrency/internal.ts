/**
 * Internal helpers shared across concurrency implementations.
 *
 * @internal
 */

import {
  TaskWorkerError,
  TaskWorkerSerializationError,
  TaskWorkerTimeoutError,
} from './errors';
import type { TaskWorkerErrorCode, WorkerTaskHandler } from './types';

/** @internal */
export interface SerializedWorkerError {
  code?: TaskWorkerErrorCode;
  message?: string;
  name?: string;
  stack?: string;
}

/** @internal */
export const normalizeTimeout = (timeout?: number): number | undefined => {
  if (typeof timeout !== 'number' || !Number.isFinite(timeout) || timeout <= 0) {
    return undefined;
  }

  return timeout;
};

/** @internal */
export const validateTaskHandler = <TInput, TResult>(
  handler: WorkerTaskHandler<TInput, TResult>
): string => {
  const source = handler.toString().trim();

  if (!source || source.includes('[native code]')) {
    throw new TaskWorkerSerializationError(
      'Task handlers must be standalone user-defined functions or arrow functions.'
    );
  }

  try {
    const revived = new Function(`return (${source});`)() as unknown;
    if (typeof revived !== 'function') {
      throw new TypeError('Task handler did not revive as a function.');
    }
  } catch (error) {
    throw new TaskWorkerSerializationError(
      'Task handlers must be standalone functions that can be reconstructed in a worker context.',
      error
    );
  }

  return source;
};

/** @internal */
export const createWorkerInstance = (scriptSource: string, name?: string): Worker => {
  const blob = new Blob([scriptSource], { type: 'text/javascript' });
  const scriptUrl = URL.createObjectURL(blob);

  try {
    return new Worker(scriptUrl, name ? { name } : undefined);
  } finally {
    URL.revokeObjectURL(scriptUrl);
  }
};

/** @internal */
export const restoreWorkerError = (payload: SerializedWorkerError | undefined): TaskWorkerError => {
  const message = payload?.message || 'Worker task failed.';
  const error =
    payload?.code === 'TIMEOUT'
      ? new TaskWorkerTimeoutError(message)
      : new TaskWorkerError(message, payload?.code ?? 'WORKER');

  error.name = payload?.name || error.name;
  if (payload?.stack) {
    error.stack = payload.stack;
  }

  return error;
};
