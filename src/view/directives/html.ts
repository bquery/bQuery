import { effect } from '../../reactive/index';
import { sanitizeHtml } from '../../security/index';
import { evaluate } from '../evaluate';
import type { DirectiveHandler } from '../types';

/**
 * Handles bq-html directive - sets innerHTML (sanitized by default).
 * @internal
 */
export const handleHtml = (sanitize: boolean): DirectiveHandler => {
  return (el, expression, context, cleanups) => {
    const cleanup = effect(() => {
      const value = evaluate<string>(expression, context);
      const html = String(value ?? '');
      el.innerHTML = sanitize ? sanitizeHtml(html) : html;
    });
    cleanups.push(cleanup);
  };
};
