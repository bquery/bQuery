/**
 * Accessibility (a11y) utilities module for bQuery.js.
 *
 * Provides essential accessibility helpers for building inclusive
 * web applications: focus trapping, screen reader announcements,
 * keyboard navigation patterns, skip navigation, media preference
 * signals, and development-time auditing.
 *
 * @module bquery/a11y
 *
 * @example
 * ```ts
 * import {
 *   trapFocus,
 *   announceToScreenReader,
 *   rovingTabIndex,
 *   skipLink,
 *   prefersReducedMotion,
 *   prefersColorScheme,
 *   auditA11y,
 * } from '@bquery/bquery/a11y';
 *
 * // Trap focus in a modal
 * const trap = trapFocus(dialogElement);
 *
 * // Announce changes to screen readers
 * announceToScreenReader('Form submitted successfully');
 *
 * // Arrow key navigation in a toolbar
 * const roving = rovingTabIndex(toolbar, 'button', {
 *   orientation: 'horizontal',
 * });
 *
 * // Auto-generate skip navigation
 * const skip = skipLink('#main-content');
 *
 * // Reactive media preferences
 * const reduced = prefersReducedMotion();
 * const scheme = prefersColorScheme();
 *
 * // Development-time audit
 * const result = auditA11y();
 * if (!result.passed) console.warn(result.findings);
 * ```
 */

export { announceToScreenReader, clearAnnouncements } from './announce';
export { auditA11y } from './audit';
export { prefersColorScheme, prefersContrast, prefersReducedMotion } from './media-preferences';
export { rovingTabIndex } from './roving-tab-index';
export { skipLink } from './skip-link';
export { getFocusableElements, releaseFocus, trapFocus } from './trap-focus';

export type {
  AnnouncePriority,
  AuditFinding,
  AuditResult,
  AuditSeverity,
  ColorScheme,
  ContrastPreference,
  FocusTrapHandle,
  RovingTabIndexHandle,
  RovingTabIndexOptions,
  SkipLinkHandle,
  SkipLinkOptions,
  TrapFocusOptions,
} from './types';
