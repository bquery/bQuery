import { effect } from '../../reactive/index';
import { evaluate } from '../evaluate';
import type { DirectiveHandler } from '../types';

/**
 * Handles bq-bind:attr directive - attribute binding.
 * @internal
 */
export const handleBind = (attrName: string): DirectiveHandler => {
  return (el, expression, context, cleanups) => {
    const cleanup = effect(() => {
      const value = evaluate(expression, context);
      if (value == null || value === false) {
        el.removeAttribute(attrName);
      } else if (value === true) {
        el.setAttribute(attrName, '');
      } else {
        el.setAttribute(attrName, String(value));
      }
    });
    cleanups.push(cleanup);
  };
};
