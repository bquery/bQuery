/**
 * Public types for the view module.
 */
import type { CleanupFn } from '../reactive/index';

/**
 * Context object passed to binding expressions.
 */
export type BindingContext = Record<string, unknown>;

/**
 * Configuration options for mount.
 */
export type MountOptions = {
  /** Prefix for directive attributes (default: 'bq') */
  prefix?: string;
  /** Whether to sanitize bq-html content (default: true) */
  sanitize?: boolean;
};

/**
 * Mounted view instance.
 */
export type View = {
  /** The root element */
  el: Element;
  /** The binding context */
  context: BindingContext;
  /** Update the context and re-render */
  update: (newContext: Partial<BindingContext>) => void;
  /** Destroy the view and cleanup effects */
  destroy: () => void;
};

/**
 * Internal directive handler type.
 * @internal
 */
export type DirectiveHandler = (
  el: Element,
  expression: string,
  context: BindingContext,
  cleanups: CleanupFn[]
) => void;
