# Concurrency

The concurrency module adds a small, explicit browser-side worker layer for bQuery's zero-build model.

It is intentionally narrower than `threadts-universal`: Milestones 1 and 2 focus on **safe task execution**, **explicit RPC-style method dispatch**, **lifecycle cleanup**, **timeout/abort handling**, and **support detection** without introducing pools, decorators, or runtime-specific adapters that would bloat the package.

## Import

```ts
import {
  createTaskWorker,
  createRpcWorker,
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
- Named request/response dispatch via `createRpcWorker()`
- One-off RPC method execution via `callWorkerMethod()`
- Explicit support detection
- Timeout handling
- Abort handling
- Worker lifecycle cleanup and termination errors
- Zero-build browser usage via inline `Blob` workers

### Planned for later milestones

- Pools and queueing
- Reactive bindings around worker state
- Higher-level array/pipeline helpers inspired by `threadts-universal`

### Intentionally out of scope for bQuery

- Node/Deno/Bun-specific worker adapters in the browser-focused package
- Decorator-heavy APIs
- Implicit bundler glue or code generation that breaks zero-build usage

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
- Pools, queues, and higher-level parallel collection APIs are intentionally deferred to later milestones
