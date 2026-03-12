/**
 * Global bQuery configuration helpers.
 *
 * @module bquery/platform
 */

import { merge } from '../core/utils/object';

/** Supported response parsing strategies for fetch composables. */
export type BqueryFetchParseAs =
  | 'json'
  | 'text'
  | 'blob'
  | 'arrayBuffer'
  | 'formData'
  | 'response';

/** Global fetch defaults used by useFetch(). */
export interface BqueryFetchConfig {
  /** Optional base URL prepended to relative request URLs. */
  baseUrl?: string;
  /** Default request headers. */
  headers?: HeadersInit;
  /** Default response parser. */
  parseAs?: BqueryFetchParseAs;
}

/** Global cookie defaults used by useCookie(). */
export interface BqueryCookieConfig {
  /** Default cookie path. */
  path?: string;
  /** Default SameSite mode. */
  sameSite?: 'Strict' | 'Lax' | 'None';
  /** Whether cookies should be marked secure by default. */
  secure?: boolean;
}

/** Global announcer defaults used by useAnnouncer(). */
export interface BqueryAnnouncerConfig {
  /** Default politeness level. */
  politeness?: 'polite' | 'assertive';
  /** Whether announcements should be treated atomically. */
  atomic?: boolean;
  /** Delay before writing the message into the live region. */
  delay?: number;
  /** Delay after which the live region is cleared automatically. */
  clearDelay?: number;
}

/** Global page meta defaults used by definePageMeta(). */
export interface BqueryPageMetaConfig {
  /** Optional title template function. */
  titleTemplate?: (title: string) => string;
}

/** Global motion defaults used by transition(). */
export interface BqueryTransitionConfig {
  /** Skip transitions when reduced motion is preferred. */
  skipOnReducedMotion?: boolean;
  /** Classes applied to the root element during transitions. */
  classes?: string[];
  /** Transition type identifiers added when supported by the browser. */
  types?: string[];
}

/** Global default component library configuration. */
export interface BqueryComponentLibraryConfig {
  /** Prefix used by registerDefaultComponents(). */
  prefix?: string;
}

/** Complete global bQuery configuration object. */
export interface BqueryConfig {
  /** Fetch composable defaults. */
  fetch?: BqueryFetchConfig;
  /** Cookie composable defaults. */
  cookies?: BqueryCookieConfig;
  /** Announcer composable defaults. */
  announcer?: BqueryAnnouncerConfig;
  /** Page metadata defaults. */
  pageMeta?: BqueryPageMetaConfig;
  /** View transition defaults. */
  transitions?: BqueryTransitionConfig;
  /** Default component library options. */
  components?: BqueryComponentLibraryConfig;
}

const defaultConfig: BqueryConfig = {
  fetch: {
    headers: {},
    parseAs: 'json',
  },
  cookies: {
    path: '/',
    sameSite: 'Lax',
    secure: false,
  },
  announcer: {
    politeness: 'polite',
    atomic: true,
    delay: 16,
    clearDelay: 1000,
  },
  pageMeta: {},
  transitions: {
    skipOnReducedMotion: false,
    classes: [],
    types: [],
  },
  components: {
    prefix: 'bq',
  },
};

let currentConfig: BqueryConfig = merge({}, defaultConfig as Record<string, unknown>) as BqueryConfig;

/**
 * Define or extend the global bQuery configuration.
 *
 * @param config - Partial configuration values to merge into the current config
 * @returns The resolved configuration after merging
 *
 * @example
 * ```ts
 * defineBqueryConfig({
 *   fetch: { baseUrl: 'https://api.example.com' },
 *   components: { prefix: 'ui' },
 * });
 * ```
 */
export const defineBqueryConfig = (config: BqueryConfig): BqueryConfig => {
  currentConfig = merge(
    defaultConfig as Record<string, unknown>,
    currentConfig as Record<string, unknown>,
    config as Record<string, unknown>
  ) as BqueryConfig;
  return getBqueryConfig();
};

/**
 * Get the currently resolved bQuery configuration.
 *
 * @returns A cloned snapshot of the active configuration
 */
export const getBqueryConfig = (): BqueryConfig => {
  return merge({}, currentConfig as Record<string, unknown>) as BqueryConfig;
};
