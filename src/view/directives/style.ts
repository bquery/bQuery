import { effect } from '../../reactive/index';
import { evaluate, parseObjectExpression } from '../evaluate';
import type { DirectiveHandler } from '../types';

/**
 * Handles bq-style directive - dynamic style binding.
 * @internal
 */
export const handleStyle: DirectiveHandler = (el, expression, context, cleanups) => {
  const htmlEl = el as HTMLElement;

  const cleanup = effect(() => {
    if (expression.startsWith('{')) {
      const styleMap = parseObjectExpression(expression);
      for (const [prop, valueExpr] of Object.entries(styleMap)) {
        const value = evaluate<string>(valueExpr, context);
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        htmlEl.style.setProperty(cssProp, String(value ?? ''));
      }
    } else {
      const result = evaluate<Record<string, string>>(expression, context);
      if (result && typeof result === 'object') {
        for (const [prop, value] of Object.entries(result)) {
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
          htmlEl.style.setProperty(cssProp, String(value ?? ''));
        }
      }
    }
  });

  cleanups.push(cleanup);
};
