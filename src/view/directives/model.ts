import { effect, isSignal, type Signal } from '../../reactive/index';
import { evaluateRaw } from '../evaluate';
import type { DirectiveHandler } from '../types';

/**
 * Handles bq-model directive - two-way binding.
 * @internal
 */
export const handleModel: DirectiveHandler = (el, expression, context, cleanups) => {
  const input = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  const rawValue = evaluateRaw<Signal<unknown>>(expression, context);

  if (!isSignal(rawValue)) {
    console.warn(`bQuery view: bq-model requires a signal, got "${expression}"`);
    return;
  }

  const sig = rawValue as Signal<unknown>;

  // Initial value sync
  const isCheckbox = input.type === 'checkbox';
  const isRadio = input.type === 'radio';

  const updateInput = () => {
    if (isCheckbox) {
      (input as HTMLInputElement).checked = Boolean(sig.value);
    } else if (isRadio) {
      (input as HTMLInputElement).checked = sig.value === input.value;
    } else {
      input.value = String(sig.value ?? '');
    }
  };

  // Effect to sync signal -> input
  const cleanup = effect(() => {
    updateInput();
  });
  cleanups.push(cleanup);

  // Event listener to sync input -> signal
  const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
  const handler = () => {
    if (isCheckbox) {
      sig.value = (input as HTMLInputElement).checked;
    } else if (isRadio) {
      if ((input as HTMLInputElement).checked) {
        sig.value = input.value;
      }
    } else {
      sig.value = input.value;
    }
  };

  input.addEventListener(eventType, handler);
  cleanups.push(() => input.removeEventListener(eventType, handler));
};
