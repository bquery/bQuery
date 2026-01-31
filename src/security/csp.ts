/**
 * Content Security Policy helpers.
 *
 * @module bquery/security
 */

/** Maximum allowed nonce length to prevent memory issues */
const MAX_NONCE_LENGTH = 1024;

/** Chunk size for building strings to avoid argument limit in String.fromCharCode */
const CHUNK_SIZE = 8192;

/**
 * Generate a nonce for inline scripts/styles.
 * Use with Content-Security-Policy nonce directives.
 *
 * @param length - Nonce length in bytes (default: 16, max: 1024)
 * @returns Cryptographically random nonce string
 * @throws {Error} If crypto.getRandomValues or btoa are not available
 * @throws {RangeError} If length is invalid (negative, non-integer, or exceeds maximum)
 */
export const generateNonce = (length: number = 16): string => {
  // Validate length parameter
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError('generateNonce length must be a positive integer');
  }
  if (length > MAX_NONCE_LENGTH) {
    throw new RangeError(`generateNonce length must not exceed ${MAX_NONCE_LENGTH}`);
  }

  // Check for required globals in browser/crypto environments
  if (
    typeof globalThis.crypto === 'undefined' ||
    typeof globalThis.crypto.getRandomValues !== 'function'
  ) {
    throw new Error(
      'generateNonce requires crypto.getRandomValues (not available in this environment)'
    );
  }
  if (typeof globalThis.btoa !== 'function') {
    throw new Error('generateNonce requires btoa (not available in this environment)');
  }

  const array = new Uint8Array(length);
  globalThis.crypto.getRandomValues(array);

  // Build string in chunks to avoid argument limit in String.fromCharCode
  let binaryString = '';
  for (let i = 0; i < array.length; i += CHUNK_SIZE) {
    const chunk = array.subarray(i, Math.min(i + CHUNK_SIZE, array.length));
    binaryString += String.fromCharCode(...chunk);
  }

  return globalThis.btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Check if a CSP header is present with specific directive.
 * Useful for feature detection and fallback strategies.
 *
 * @param directive - The CSP directive to check (e.g., 'script-src')
 * @returns True if the directive appears to be enforced
 */
export const hasCSPDirective = (directive: string): boolean => {
  // Guard for non-DOM environments (SSR, tests, etc.)
  if (typeof document === 'undefined') {
    return false;
  }

  // Check meta tag
  const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (meta) {
    const content = meta.getAttribute('content') ?? '';
    return content.includes(directive);
  }
  return false;
};
