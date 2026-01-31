import { effect } from '../../reactive/index';
import { evaluate } from '../evaluate';
import type { DirectiveHandler } from '../types';

/**
 * Handles bq-text directive - sets text content.
 * @internal
 */
export const handleText: DirectiveHandler = (el, expression, context, cleanups) => {
  const cleanup = effect(() => {
    const value = evaluate(expression, context);
    el.textContent = String(value ?? '');
  });
  cleanups.push(cleanup);
};
