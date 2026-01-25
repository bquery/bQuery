import { effect } from '../../reactive/index';
import { evaluate } from '../evaluate';
import type { DirectiveHandler } from '../types';

/**
 * Handles bq-if directive - conditional rendering.
 * @internal
 */
export const handleIf: DirectiveHandler = (el, expression, context, cleanups) => {
  const parent = el.parentNode;
  const placeholder = document.createComment(`bq-if: ${expression}`);

  // Store original element state
  let isInserted = true;

  const cleanup = effect(() => {
    const condition = evaluate<boolean>(expression, context);

    if (condition && !isInserted) {
      // Insert element
      parent?.replaceChild(el, placeholder);
      isInserted = true;
    } else if (!condition && isInserted) {
      // Remove element
      parent?.replaceChild(placeholder, el);
      isInserted = false;
    }
  });

  cleanups.push(cleanup);
};
