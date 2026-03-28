/**
 * Shared environment detection helpers.
 *
 * @internal
 */

type BQueryEnvGlobal = typeof globalThis & {
  __BQUERY_DEV__?: boolean;
  process?: {
    env?: {
      NODE_ENV?: string;
    };
  };
};

/**
 * Returns whether development-only diagnostics should be enabled.
 *
 * Priority:
 * 1. Explicit global override via `globalThis.__BQUERY_DEV__`
 * 2. `process.env.NODE_ENV`
 * 3. Node-like `process` without `NODE_ENV` defaults to development
 * 4. Production-safe fallback (`false`)
 *
 * @internal
 */
export const detectDevEnvironment = (): boolean => {
  try {
    const globalObject = globalThis as BQueryEnvGlobal;

    if (typeof globalObject.__BQUERY_DEV__ === 'boolean') {
      return globalObject.__BQUERY_DEV__;
    }

    const nodeEnv = globalObject.process?.env?.NODE_ENV;
    if (typeof nodeEnv === 'string') {
      return nodeEnv !== 'production';
    }

    if (typeof globalObject.process === 'object') {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};
