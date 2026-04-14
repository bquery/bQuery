# Concurrency

The concurrency module adds a small, explicit browser-side worker layer for bQuery's zero-build model.

It is intentionally narrower than `threadts-universal`: the current milestones focus on **safe task execution**, **explicit RPC-style method dispatch**, **bounded pools/queueing**, **lifecycle cleanup**, **timeout/abort handling**, and **support detection** without introducing decorators, implicit proxies, or runtime-specific adapters that would bloat the package.

## Import

```ts
import {
  createTaskWorker,
  createTaskPool,
  createRpcWorker,
  createRpcPool,
  callWorkerMethod,
  getConcurrencySupport,
  isConcurrencySupported,
  runTask,
} from '@bquery/bquery/concurrency';
```

## Current scope

### Included now

- One-off worker execution via `runTask()`
- Reusable single-task workers via `createTaskWorker()`
- Reusable task pools via `createTaskPool()`
- Named request/response dispatch via `createRpcWorker()`
- One-off RPC method execution via `callWorkerMethod()`
- Reusable RPC pools via `createRpcPool()`
- Explicit support detection
- Timeout handling
- Abort handling
- Worker lifecycle cleanup and termination errors
- FIFO queueing with configurable backpressure
- Zero-build browser usage via inline `Blob` workers

### Planned for later milestones

- Reactive bindings around worker state
- Higher-level array/pipeline helpers inspired by `threadts-universal`

### Intentionally out of scope for bQuery

- Node/Deno/Bun-specific worker adapters in the browser-focused package
- Decorator-heavy APIs
- Implicit bundler glue or code generation that breaks zero-build usage

## ThreadTS parity matrix

| Feature group | `threadts-universal` | bQuery status |
| --- | --- | --- |
| One-off task execution | `run()` | **Supported** via `runTask()` |
| Explicit reusable workers | low-level worker APIs | **Supported** via `createTaskWorker()` |
| Explicit RPC dispatch | named methods / adapters | **Supported** via `createRpcWorker()` and `callWorkerMethod()` |
| Pools + queueing | auto-scaling pools / priority queues | **Adapted** via `createTaskPool()` and `createRpcPool()` with explicit bounded concurrency + FIFO queueing |
| Worker lifecycle | termination / reuse | **Supported** with explicit `terminate()` on workers and pools |
| Timeout + cancellation | supported | **Supported** via `timeout` and `AbortSignal` |
| Support detection | runtime-dependent | **Supported** via `getConcurrencySupport()` / `isConcurrencySupported()` |
| Array / batch / pipeline helpers | broad high-level surface | **Planned later**; only after low-level browser primitives stay stable |
| Decorators / implicit magic | broad decorator suite | **Not adopted**; conflicts with bQuery's explicit, lightweight browser-first design |
| Node / Deno / Bun adapters | universal runtime adapters | **Not adopted** in this browser-focused package |

## `runTask()`

Use `runTask()` when you need one isolated computation and do not want to manage worker lifecycle manually.

```ts
import { runTask } from '@bquery/bquery/concurrency';

const result = await runTask(
  ({ values }: { values: number[] }) => values.reduce((sum, value) => sum + value, 0),
  { values: [1, 2, 3, 4] },
  { timeout: 1_000 }
);
```

## `createTaskWorker()`

Use `createTaskWorker()` when you want to reuse the same worker for repeated runs.

```ts
import { createTaskWorker } from '@bquery/bquery/concurrency';

const worker = createTaskWorker(
  async ({ delay, value }: { delay: number; value: number }) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    return value * 2;
  },
  { name: 'double-worker', timeout: 2_000 }
);

const first = await worker.run({ delay: 10, value: 21 });
const second = await worker.run({ delay: 0, value: 5 });

console.log(first, second); // 42, 10
worker.terminate();
```

### Behavior

- A reusable task worker runs **one task at a time**
- Calling `run()` while another task is active rejects with a `BUSY` error
- Abort and timeout handling terminate the active worker run so the next run starts cleanly
- Calling `terminate()` permanently disposes the worker handle

## `createRpcWorker()`

Use `createRpcWorker()` when one worker should expose a small set of named methods.

```ts
import { createRpcWorker } from '@bquery/bquery/concurrency';

const rpc = createRpcWorker({
  formatUser: ({ first, last }: { first: string; last: string }) => `${last}, ${first}`,
  sum: ({ values }: { values: number[] }) => values.reduce((total, value) => total + value, 0),
});

console.log(await rpc.call('formatUser', { first: 'Ada', last: 'Lovelace' }));
console.log(await rpc.call('sum', { values: [1, 2, 3, 4] }));

rpc.terminate();
```

### RPC behavior

- Only explicitly provided method names can be called
- Unknown methods reject with `code: 'METHOD_NOT_FOUND'`
- The current Milestone 2 API still processes **one call at a time per worker**
- Timeout and abort handling reset the worker so the next call starts cleanly

## `createTaskPool()`

Use `createTaskPool()` when the same standalone task should run across multiple workers with explicit bounded concurrency and FIFO queueing.

```ts
import { createTaskPool } from '@bquery/bquery/concurrency';

const pool = createTaskPool(
  async ({ delay, value }: { delay: number; value: number }) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    return value * 2;
  },
  { concurrency: 4, maxQueue: 16, name: 'double-pool' }
);

const results = await Promise.all([
  pool.run({ delay: 20, value: 1 }),
  pool.run({ delay: 20, value: 2 }),
  pool.run({ delay: 0, value: 3 }),
]);

console.log(results); // [2, 4, 6]
pool.terminate();
```

### Task-pool behavior

- Runs up to `concurrency` tasks in parallel
- Additional runs wait in a **FIFO queue**
- `maxQueue` bounds queued-but-not-started work
- `clear()` rejects queued tasks with `code: 'QUEUE_CLEARED'` without interrupting active tasks
- Calls beyond `maxQueue` reject with `code: 'QUEUE_FULL'`
- Abort signals can cancel queued tasks before they start or active tasks while they run

## `createRpcPool()`

Use `createRpcPool()` when a small set of named methods should run across multiple reusable workers with bounded concurrency and FIFO queueing.

```ts
import { createRpcPool } from '@bquery/bquery/concurrency';

const pool = createRpcPool(
  {
    sum: ({ values }: { values: number[] }) => values.reduce((total, value) => total + value, 0),
  },
  { concurrency: 2, maxQueue: 8 }
);

const totals = await Promise.all([
  pool.call('sum', { values: [1, 2, 3] }),
  pool.call('sum', { values: [4, 5, 6] }),
  pool.call('sum', { values: [7, 8, 9] }),
]);

console.log(totals); // [6, 15, 24]
pool.terminate();
```

### RPC-pool behavior

- Uses the same explicit named-method model as `createRpcWorker()`
- Spreads calls across up to `concurrency` workers
- Queues overflow calls in FIFO order
- `clear()` only affects queued calls
- `terminate()` rejects queued and active calls, then tears down all backing workers

## `callWorkerMethod()`

Use `callWorkerMethod()` when you want one RPC call without manually managing a worker handle.

```ts
import { callWorkerMethod } from '@bquery/bquery/concurrency';

const total = await callWorkerMethod(
  {
    sum: ({ values }: { values: number[] }) => values.reduce((result, value) => result + value, 0),
  },
  'sum',
  { values: [2, 4, 6] }
);
```

## Timeout and abort

```ts
import {
  createTaskWorker,
  TaskWorkerAbortError,
  TaskWorkerTimeoutError,
} from '@bquery/bquery/concurrency';

const worker = createTaskWorker(async ({ delay }: { delay: number }) => {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return 'done';
});

try {
  await worker.run({ delay: 5_000 }, { timeout: 50 });
} catch (error) {
  if (error instanceof TaskWorkerTimeoutError) {
    console.warn('Timed out');
  }
}

const controller = new AbortController();
const pending = worker.run({ delay: 5_000 }, { signal: controller.signal });
controller.abort();

try {
  await pending;
} catch (error) {
  if (error instanceof TaskWorkerAbortError) {
    console.warn('Aborted');
  }
}
```

## Support detection

```ts
import { getConcurrencySupport, isConcurrencySupported } from '@bquery/bquery/concurrency';

const support = getConcurrencySupport();
console.log(support.worker, support.blob, support.objectUrl);

if (!isConcurrencySupported()) {
  console.warn('Inline worker tasks are unavailable in this environment.');
}
```

## Transferables

Pass transferable objects through the `transfer` option when sending large `ArrayBuffer`-backed payloads:

```ts
const buffer = new ArrayBuffer(1024);

await runTask((input: ArrayBuffer) => input.byteLength, buffer, {
  transfer: [buffer],
});
```

## Limitations

- Task handlers must be **standalone functions**; they cannot rely on outer closures
- The module currently targets **browser worker primitives** (`Worker`, `Blob`, `URL.createObjectURL`)
- CSP setups may need `worker-src blob:` for inline worker creation
- Higher-level array/pipeline helpers remain intentionally deferred to later milestones
