import { effect } from '../../reactive/index';
import { evaluate } from '../evaluate';
import type { DirectiveHandler } from '../types';

/**
 * Handles bq-if directive - conditional rendering.
 * @internal
 */
export const handleIf: DirectiveHandler = (el, expression, context, cleanups) => {
  const placeholder = document.createComment(`bq-if: ${expression}`);

  // Store original element state
  let isInserted = true;

  const cleanup = effect(() => {
    const condition = evaluate<boolean>(expression, context);

    if (condition && !isInserted) {
      // Insert element using replaceWith to handle moved elements
      placeholder.replaceWith(el);
      isInserted = true;
    } else if (!condition && isInserted) {
      // Remove element using replaceWith to handle moved elements
      el.replaceWith(placeholder);
      isInserted = false;
    }
  });

  cleanups.push(cleanup);
};
