/**
 * Thin high-level helpers layered on top of the explicit worker primitives.
 *
 * @module bquery/concurrency
 */

import { createTaskPool } from './pool';
import { validateTaskHandler } from './internal';
import type {
  ParallelMapHandler,
  ParallelMapOptions,
  ParallelOptions,
  ParallelResults,
  ParallelTask,
  TaskPool,
  WorkerTaskHandler,
} from './types';

interface SerializedParallelTask {
  handlerSource: string;
  input: unknown;
}

interface SerializedMapChunk<TInput = unknown> {
  items: Array<{
    index: number;
    value: TInput;
  }>;
  mapperSource: string;
}

interface IndexedMapResult<TResult> {
  index: number;
  value: TResult;
}

const executeSerializedTask = async (job: SerializedParallelTask): Promise<unknown> => {
  const revive = new Function(`return (${job.handlerSource});`);
  const handler = revive() as ((input: unknown) => unknown | Promise<unknown>) | undefined;

  if (typeof handler !== 'function') {
    throw new TypeError('The serialized task handler did not revive as a function.');
  }

  return await handler(job.input);
};

const executeSerializedMapChunk = async (
  job: SerializedMapChunk
): Promise<Array<IndexedMapResult<unknown>>> => {
  const revive = new Function(`return (${job.mapperSource});`);
  const mapper = revive() as ((value: unknown, index: number) => unknown | Promise<unknown>) | undefined;

  if (typeof mapper !== 'function') {
    throw new TypeError('The serialized mapper did not revive as a function.');
  }

  const results: Array<IndexedMapResult<unknown>> = [];
  for (const item of job.items) {
    results.push({
      index: item.index,
      value: await mapper(item.value, item.index),
    });
  }

  return results;
};

const normalizeBatchSize = (batchSize: number | undefined, label: string): number => {
  if (batchSize === undefined) {
    return 1;
  }

  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new RangeError(`${label} batchSize must be a positive integer.`);
  }

  return batchSize;
};

const createSerializedTaskPool = (options: ParallelOptions): TaskPool<SerializedParallelTask, unknown> => {
  return createTaskPool(executeSerializedTask, options);
};

const serializeTask = <TInput, TResult>(task: ParallelTask<TInput, TResult>): SerializedParallelTask => ({
  handlerSource: validateTaskHandler(task.handler),
  input: task.input,
});

/**
 * Executes multiple standalone tasks in parallel using a bounded worker pool.
 *
 * @example
 * ```ts
 * import { parallel } from '@bquery/bquery/concurrency';
 *
 * const results = await parallel([
 *   { handler: (value: number) => value * 2, input: 5 },
 *   { handler: ({ a, b }: { a: number; b: number }) => a + b, input: { a: 1, b: 2 } },
 * ]);
 * ```
 */
export async function parallel<TTasks extends readonly ParallelTask[]>(
  tasks: TTasks,
  options: ParallelOptions = {}
): Promise<ParallelResults<TTasks>> {
  if (tasks.length === 0) {
    return [] as unknown as ParallelResults<TTasks>;
  }

  const pool = createSerializedTaskPool(options);

  try {
    const results = await Promise.all(
      tasks.map((task) => pool.run(serializeTask(task), task.options))
    );
    return results as ParallelResults<TTasks>;
  } finally {
    pool.terminate();
  }
}

/**
 * Executes tasks in sequential batches while each batch still uses parallel workers.
 *
 * This adapts `threadts-universal`'s batch helper to bQuery without colliding
 * with the reactive module's existing `batch()` export.
 *
 * @example
 * ```ts
 * import { batchTasks } from '@bquery/bquery/concurrency';
 *
 * const results = await batchTasks(
 *   [
 *     { handler: (value: number) => value * 2, input: 1 },
 *     { handler: (value: number) => value * 2, input: 2 },
 *     { handler: (value: number) => value * 2, input: 3 },
 *   ],
 *   2
 * );
 * ```
 */
export async function batchTasks<TTasks extends readonly ParallelTask[]>(
  tasks: TTasks,
  batchSize?: number,
  options: ParallelOptions = {}
): Promise<ParallelResults<TTasks>> {
  if (tasks.length === 0) {
    return [] as unknown as ParallelResults<TTasks>;
  }

  const normalizedBatchSize = normalizeBatchSize(batchSize, 'batchTasks');
  const pool = createSerializedTaskPool(options);
  const results: unknown[] = [];

  try {
    for (let index = 0; index < tasks.length; index += normalizedBatchSize) {
      const batch = tasks.slice(index, index + normalizedBatchSize);
      const batchResults = await Promise.all(
        batch.map((task) => pool.run(serializeTask(task), task.options))
      );
      results.push(...batchResults);
    }

    return results as ParallelResults<TTasks>;
  } finally {
    pool.terminate();
  }
}

/**
 * Maps an array in parallel using optional chunking on top of `createTaskPool()`.
 *
 * @example
 * ```ts
 * import { map } from '@bquery/bquery/concurrency';
 *
 * const results = await map([1, 2, 3], (value, index) => value + index, {
 *   batchSize: 2,
 *   concurrency: 2,
 * });
 * ```
 */
export async function map<TInput, TResult>(
  values: readonly TInput[],
  mapper: ParallelMapHandler<TInput, TResult>,
  options: ParallelMapOptions = {}
): Promise<TResult[]> {
  if (values.length === 0) {
    return [];
  }

  const mapperSource = validateTaskHandler(
    mapper as unknown as WorkerTaskHandler<TInput, TResult>
  );
  const normalizedBatchSize = normalizeBatchSize(options.batchSize, 'map');
  const { batchSize: _batchSize, signal, ...poolOptions } = options;
  const pool = createTaskPool(executeSerializedMapChunk, poolOptions);
  const chunks: Array<SerializedMapChunk<TInput>> = [];

  for (let index = 0; index < values.length; index += normalizedBatchSize) {
    const items = values.slice(index, index + normalizedBatchSize).map((value, offset) => ({
      index: index + offset,
      value,
    }));
    chunks.push({ items, mapperSource });
  }

  try {
    const chunkResults = await Promise.all(
      chunks.map((chunk) => pool.run(chunk, signal ? { signal } : undefined))
    );
    const mapped = new Array<TResult>(values.length);

    for (const chunk of chunkResults) {
      for (const item of chunk) {
        mapped[item.index] = item.value as TResult;
      }
    }

    return mapped;
  } finally {
    pool.terminate();
  }
}
