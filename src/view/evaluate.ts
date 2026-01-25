import { isComputed, isSignal, type Signal } from '../reactive/index';
import type { BindingContext } from './types';

/**
 * Evaluates an expression in the given context using `new Function()`.
 *
 * @security **WARNING:** This function uses dynamic code execution via `new Function()`.
 * - NEVER pass expressions derived from user input or untrusted sources
 * - Expressions should only come from developer-controlled templates
 * - Malicious expressions can access and exfiltrate context data
 * - Consider this equivalent to `eval()` in terms of security implications
 *
 * @internal
 */
export const evaluate = <T = unknown>(expression: string, context: BindingContext): T => {
  try {
    // Build context keys for function scope
    const keys = Object.keys(context);
    const values = keys.map((key) => {
      const value = context[key];
      // Auto-unwrap signals/computed
      if (isSignal(value) || isComputed(value)) {
        return (value as Signal<unknown>).value;
      }
      return value;
    });

    // Create function with context variables in scope
    const fn = new Function(...keys, `return (${expression})`);
    return fn(...values) as T;
  } catch (error) {
    console.error(`bQuery view: Error evaluating "${expression}"`, error);
    return undefined as T;
  }
};

/**
 * Evaluates an expression and returns the raw value (for signal access).
 *
 * @security **WARNING:** Uses dynamic code execution. See {@link evaluate} for security notes.
 * @internal
 */
export const evaluateRaw = <T = unknown>(expression: string, context: BindingContext): T => {
  try {
    const keys = Object.keys(context);
    const values = keys.map((key) => context[key]);
    const fn = new Function(...keys, `return (${expression})`);
    return fn(...values) as T;
  } catch (error) {
    console.error(`bQuery view: Error evaluating "${expression}"`, error);
    return undefined as T;
  }
};

/**
 * Parses object expression like "{ active: isActive, disabled: !enabled }".
 * Handles nested structures like function calls, arrays, and template literals.
 * @internal
 */
export const parseObjectExpression = (expression: string): Record<string, string> => {
  const result: Record<string, string> = {};

  // Remove outer braces and trim
  const inner = expression
    .trim()
    .replace(/^\{|\}$/g, '')
    .trim();
  if (!inner) return result;

  // Split by comma at depth 0, respecting strings and nesting
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  let inString: string | null = null;

  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];
    const prevChar = i > 0 ? inner[i - 1] : '';

    // Handle string literals (including escape sequences)
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (inString === null) {
        inString = char;
      } else if (inString === char) {
        inString = null;
      }
      current += char;
      continue;
    }

    // Skip if inside string
    if (inString !== null) {
      current += char;
      continue;
    }

    // Track nesting depth for parentheses, brackets, and braces
    if (char === '(' || char === '[' || char === '{') {
      depth++;
      current += char;
    } else if (char === ')' || char === ']' || char === '}') {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0) {
      // Top-level comma - split point
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last part
  if (current.trim()) {
    parts.push(current.trim());
  }

  // Parse each part to extract key and value
  for (const part of parts) {
    // Find the first colon at depth 0 (to handle ternary operators in values)
    let colonIndex = -1;
    let partDepth = 0;
    let partInString: string | null = null;

    for (let i = 0; i < part.length; i++) {
      const char = part[i];
      const prevChar = i > 0 ? part[i - 1] : '';

      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (partInString === null) {
          partInString = char;
        } else if (partInString === char) {
          partInString = null;
        }
        continue;
      }

      if (partInString !== null) continue;

      if (char === '(' || char === '[' || char === '{') {
        partDepth++;
      } else if (char === ')' || char === ']' || char === '}') {
        partDepth--;
      } else if (char === ':' && partDepth === 0) {
        colonIndex = i;
        break;
      }
    }

    if (colonIndex > -1) {
      const key = part
        .slice(0, colonIndex)
        .trim()
        .replace(/^['"]|['"]$/g, '');
      const value = part.slice(colonIndex + 1).trim();
      result[key] = value;
    }
  }

  return result;
};
