/**
 * Type definitions for the i18n module.
 * @module bquery/i18n
 */

import type { ReadonlySignal, Signal } from '../reactive/index';

/**
 * A nested record of translation messages.
 * Values can be strings or nested objects for namespacing.
 *
 * @example
 * ```ts
 * const messages: LocaleMessages = {
 *   greeting: 'Hello',
 *   user: {
 *     name: 'Name',
 *     welcome: 'Welcome, {name}!',
 *   },
 *   items: '{count} item | {count} items',
 * };
 * ```
 */
export type LocaleMessages = {
  [key: string]: string | LocaleMessages;
};

/**
 * Record of locale codes to their messages.
 */
export type Messages = {
  [locale: string]: LocaleMessages;
};

/**
 * Interpolation parameters for translation strings.
 * Values are converted to strings during interpolation.
 */
export type TranslateParams = Record<string, string | number>;

/**
 * Configuration for creating an i18n instance.
 */
export type I18nConfig = {
  /** The initial locale code (e.g. 'en', 'de', 'fr') */
  locale: string;
  /** Pre-loaded message dictionaries keyed by locale */
  messages: Messages;
  /** Fallback locale when a key is missing in the current locale */
  fallbackLocale?: string;
};

/**
 * A lazy-loader function that returns a promise resolving to locale messages.
 */
export type LocaleLoader = () => Promise<LocaleMessages | { default: LocaleMessages }>;

/**
 * Options for number formatting via `Intl.NumberFormat`.
 */
export type NumberFormatOptions = Intl.NumberFormatOptions & {
  /** Override the locale for this specific formatting call */
  locale?: string;
};

/**
 * Options for date formatting via `Intl.DateTimeFormat`.
 */
export type DateFormatOptions = Intl.DateTimeFormatOptions & {
  /** Override the locale for this specific formatting call */
  locale?: string;
};

/**
 * The public i18n instance returned by `createI18n()`.
 */
export type I18nInstance = {
  /**
   * Reactive signal holding the current locale code.
   * Setting `.value` switches the locale and reactively updates
   * all computed translations.
   */
  $locale: Signal<string>;

  /**
   * Translate a key path with optional interpolation and pluralization.
   *
   * @param key - Dot-delimited key path (e.g. 'user.welcome')
   * @param params - Interpolation values (e.g. `{ name: 'Ada' }`)
   * @returns The translated string, or the key itself if not found
   *
   * @example
   * ```ts
   * i18n.t('greeting');           // 'Hello'
   * i18n.t('user.welcome', { name: 'Ada' }); // 'Welcome, Ada!'
   * i18n.t('items', { count: 3 }); // '3 items'
   * ```
   */
  t: (key: string, params?: TranslateParams) => string;

  /**
   * Reactive translation — returns a ReadonlySignal that updates
   * when the locale changes.
   *
   * @param key - Dot-delimited key path
   * @param params - Interpolation values
   * @returns A reactive signal containing the translated string
   */
  tc: (key: string, params?: TranslateParams) => ReadonlySignal<string>;

  /**
   * Register a lazy-loader for a locale's messages.
   * The loader is invoked when the locale is first needed.
   *
   * @param locale - Locale code
   * @param loader - Async function returning messages
   *
   * @example
   * ```ts
   * i18n.loadLocale('de', () => import('./locales/de.json'));
   * ```
   */
  loadLocale: (locale: string, loader: LocaleLoader) => void;

  /**
   * Ensure a locale's messages are loaded (triggers lazy-loader if registered).
   *
   * @param locale - Locale code to load
   * @returns A promise that resolves when the locale is ready
   */
  ensureLocale: (locale: string) => Promise<void>;

  /**
   * Format a number according to the current locale using `Intl.NumberFormat`.
   *
   * @param value - Number to format
   * @param options - Intl.NumberFormat options
   * @returns The formatted number string
   */
  n: (value: number, options?: NumberFormatOptions) => string;

  /**
   * Format a date according to the current locale using `Intl.DateTimeFormat`.
   *
   * @param value - Date to format
   * @param options - Intl.DateTimeFormat options
   * @returns The formatted date string
   */
  d: (value: Date | number, options?: DateFormatOptions) => string;

  /**
   * Get all currently loaded messages for a locale.
   *
   * @param locale - Locale code
   * @returns The messages object, or undefined if not loaded
   */
  getMessages: (locale: string) => LocaleMessages | undefined;

  /**
   * Merge additional messages into an existing locale.
   *
   * @param locale - Locale code
   * @param messages - Messages to merge (deep merge)
   */
  mergeMessages: (locale: string, messages: LocaleMessages) => void;

  /**
   * List all available locale codes (loaded or registered for lazy-loading).
   */
  availableLocales: () => string[];
};
