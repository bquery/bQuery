import { effect } from '../../reactive/index';
import { evaluate } from '../evaluate';
import type { DirectiveHandler } from '../types';

/**
 * Handles bq-show directive - toggle visibility.
 * @internal
 */
export const handleShow: DirectiveHandler = (el, expression, context, cleanups) => {
  const htmlEl = el as HTMLElement;
  const originalDisplay = htmlEl.style.display;

  const cleanup = effect(() => {
    const condition = evaluate<boolean>(expression, context);
    htmlEl.style.display = condition ? originalDisplay : 'none';
  });

  cleanups.push(cleanup);
};
