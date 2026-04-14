import { describe, expect, it } from 'bun:test';
import {
  createTaskWorker,
  getConcurrencySupport,
  isConcurrencySupported,
  runTask,
  TaskWorkerAbortError,
  TaskWorkerSerializationError,
  TaskWorkerTimeoutError,
  TaskWorkerUnsupportedError,
} from '../src/concurrency/index';
import type { WorkerTaskHandler } from '../src/concurrency/index';

interface MockBlobShape {
  source: string;
}

type MockWorkerScope = {
  onmessage?: (event: { data: unknown }) => unknown;
  postMessage: (data: unknown) => void;
};

const withMockWorkerEnvironment = async (
  callback: (ctx: { revokedUrls: string[] }) => Promise<void> | void
): Promise<void> => {
  const originalWorker = globalThis.Worker;
  const originalBlob = globalThis.Blob;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  const sourceRegistry = new Map<string, string>();
  const revokedUrls: string[] = [];
  let nextUrlId = 0;

  class MockBlob {
    readonly source: string;

    constructor(parts: BlobPart[]) {
      this.source = parts.map((part) => String(part)).join('');
    }
  }

  class MockWorker {
    onerror: ((event: ErrorEvent) => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;
    private readonly scope: MockWorkerScope;
    private terminated = false;

    constructor(url: string) {
      const source = sourceRegistry.get(url);
      if (!source) {
        throw new Error(`Unknown worker URL: ${url}`);
      }

      this.scope = {
        postMessage: (data: unknown) => {
          if (this.terminated) {
            return;
          }

          queueMicrotask(() => {
            this.onmessage?.({ data } as MessageEvent);
          });
        },
      };

      try {
        new Function('self', source)(this.scope);
      } catch (error) {
        queueMicrotask(() => {
          this.onerror?.({
            message: error instanceof Error ? error.message : String(error),
          } as ErrorEvent);
        });
      }
    }

    postMessage(data: unknown): void {
      if (this.terminated) {
        return;
      }

      queueMicrotask(() => {
        try {
          void this.scope.onmessage?.({ data });
        } catch (error) {
          this.onerror?.({
            message: error instanceof Error ? error.message : String(error),
          } as ErrorEvent);
        }
      });
    }

    terminate(): void {
      this.terminated = true;
    }
  }

  (globalThis as { Blob: typeof Blob }).Blob = MockBlob as unknown as typeof Blob;
  (globalThis as { Worker: typeof Worker }).Worker = MockWorker as unknown as typeof Worker;
  URL.createObjectURL = ((blob: Blob) => {
    const url = `blob:mock-${++nextUrlId}`;
    sourceRegistry.set(url, (blob as unknown as MockBlobShape).source);
    return url;
  }) as typeof URL.createObjectURL;
  URL.revokeObjectURL = ((url: string) => {
    revokedUrls.push(url);
    sourceRegistry.delete(url);
  }) as typeof URL.revokeObjectURL;

  try {
    await callback({ revokedUrls });
  } finally {
    (globalThis as { Blob: typeof Blob }).Blob = originalBlob;
    (globalThis as { Worker: typeof Worker }).Worker = originalWorker;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  }
};

describe('concurrency/support', () => {
  it('reports when worker primitives are unavailable', () => {
    const originalWorker = globalThis.Worker;
    const originalBlob = globalThis.Blob;
    const originalCreateObjectURL = URL.createObjectURL;

    try {
      (globalThis as { Worker?: typeof Worker }).Worker = undefined;
      (globalThis as { Blob?: typeof Blob }).Blob = undefined;
      URL.createObjectURL = undefined as unknown as typeof URL.createObjectURL;

      const support = getConcurrencySupport();
      expect(support.supported).toBe(false);
      expect(isConcurrencySupported()).toBe(false);
      expect(() => createTaskWorker((value: number) => value * 2)).toThrow(
        TaskWorkerUnsupportedError
      );
    } finally {
      (globalThis as { Worker?: typeof Worker }).Worker = originalWorker;
      (globalThis as { Blob?: typeof Blob }).Blob = originalBlob;
      URL.createObjectURL = originalCreateObjectURL;
    }
  });

  it('detects support when zero-build worker primitives are present', async () => {
    await withMockWorkerEnvironment(() => {
      const support = getConcurrencySupport();
      expect(support.worker).toBe(true);
      expect(support.blob).toBe(true);
      expect(support.objectUrl).toBe(true);
      expect(support.supported).toBe(true);
      expect(isConcurrencySupported()).toBe(true);
    });
  });
});

describe('concurrency/runTask', () => {
  it('executes a one-off task and revokes the generated object URL', async () => {
    await withMockWorkerEnvironment(async ({ revokedUrls }) => {
      const result = await runTask((value: number) => value * 2, 21);
      expect(result).toBe(42);
      expect(revokedUrls).toHaveLength(1);
    });
  });

  it('rejects native functions that cannot be reconstructed safely', async () => {
    await withMockWorkerEnvironment(() => {
      const nativeHandler = Math.max as unknown as WorkerTaskHandler<number, number>;
      expect(() => createTaskWorker(nativeHandler)).toThrow(TaskWorkerSerializationError);
    });
  });
});

describe('concurrency/createTaskWorker', () => {
  it('reuses the worker across sequential runs', async () => {
    await withMockWorkerEnvironment(async () => {
      const worker = createTaskWorker(async ({ delay, value }: { delay: number; value: number }) => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return value * 3;
      });

      expect(worker.state).toBe('idle');
      const firstPromise = worker.run({ delay: 1, value: 2 });
      expect(worker.busy).toBe(true);
      expect(worker.state).toBe('running');
      expect(await firstPromise).toBe(6);
      expect(worker.busy).toBe(false);
      expect(worker.state).toBe('idle');
      expect(await worker.run({ delay: 0, value: 4 })).toBe(12);

      worker.terminate();
      expect(worker.state).toBe('terminated');
    });
  });

  it('rejects overlapping runs on the same reusable worker', async () => {
    await withMockWorkerEnvironment(async () => {
      const worker = createTaskWorker(async ({ delay, value }: { delay: number; value: number }) => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return value;
      });

      const firstRun = worker.run({ delay: 20, value: 1 });
      await expect(worker.run({ delay: 0, value: 2 })).rejects.toMatchObject({ code: 'BUSY' });
      expect(await firstRun).toBe(1);
      worker.terminate();
    });
  });

  it('times out the active run and allows a clean follow-up run', async () => {
    await withMockWorkerEnvironment(async () => {
      const worker = createTaskWorker(async ({ delay, value }: { delay: number; value: number }) => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return value * 2;
      });

      await expect(worker.run({ delay: 30, value: 2 }, { timeout: 5 })).rejects.toBeInstanceOf(
        TaskWorkerTimeoutError
      );
      expect(worker.state).toBe('idle');
      expect(await worker.run({ delay: 0, value: 3 }, { timeout: 50 })).toBe(6);
      worker.terminate();
    });
  });

  it('aborts the active run and allows the worker to be used again', async () => {
    await withMockWorkerEnvironment(async () => {
      const worker = createTaskWorker(async ({ delay, value }: { delay: number; value: number }) => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return value;
      });
      const controller = new AbortController();

      const pending = worker.run({ delay: 30, value: 7 }, { signal: controller.signal });
      controller.abort();

      await expect(pending).rejects.toBeInstanceOf(TaskWorkerAbortError);
      expect(worker.state).toBe('idle');
      expect(await worker.run({ delay: 0, value: 9 })).toBe(9);
      worker.terminate();
    });
  });

  it('rejects the in-flight task when the worker is terminated', async () => {
    await withMockWorkerEnvironment(async () => {
      const worker = createTaskWorker(async ({ delay, value }: { delay: number; value: number }) => {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return value;
      });

      const pending = worker.run({ delay: 30, value: 5 });
      worker.terminate();

      await expect(pending).rejects.toMatchObject({ code: 'TERMINATED' });
      await expect(worker.run({ delay: 0, value: 1 })).rejects.toMatchObject({
        code: 'TERMINATED',
      });
    });
  });
});
