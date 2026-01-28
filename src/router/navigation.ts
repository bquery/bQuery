/**
 * Navigation helpers and global router access.
 * @module bquery/router
 */

import { getActiveRouter } from './state';

/**
 * Navigates to a new path.
 *
 * @param path - The path to navigate to
 * @param options - Navigation options
 *
 * @example
 * ```ts
 * import { navigate } from 'bquery/router';
 *
 * // Push to history
 * await navigate('/dashboard');
 *
 * // Replace current entry
 * await navigate('/login', { replace: true });
 * ```
 */
export const navigate = async (
  path: string,
  options: { replace?: boolean } = {}
): Promise<void> => {
  const activeRouter = getActiveRouter();
  if (!activeRouter) {
    throw new Error('bQuery router: No router initialized. Call createRouter() first.');
  }

  await activeRouter[options.replace ? 'replace' : 'push'](path);
};

/**
 * Programmatically go back in history.
 *
 * @example
 * ```ts
 * import { back } from 'bquery/router';
 * back();
 * ```
 */
export const back = (): void => {
  const activeRouter = getActiveRouter();
  if (activeRouter) {
    activeRouter.back();
  } else {
    history.back();
  }
};

/**
 * Programmatically go forward in history.
 *
 * @example
 * ```ts
 * import { forward } from 'bquery/router';
 * forward();
 * ```
 */
export const forward = (): void => {
  const activeRouter = getActiveRouter();
  if (activeRouter) {
    activeRouter.forward();
  } else {
    history.forward();
  }
};
