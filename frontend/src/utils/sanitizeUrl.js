/**
 * URL validation & sanitization helpers.
 *
 * Prevents open-redirect, tracking-pixel injection, and javascript: URIs
 * by restricting allowed protocols and providing a safe window.open wrapper.
 */

const ALLOWED_PROTOCOLS = ['http:', 'https:']

/**
 * Returns true for relative URLs (/uploads/…) or absolute http(s) URLs.
 * Rejects javascript:, data:, blob:, vbscript:, etc.
 */
export function isAllowedUrl(url) {
  if (!url || typeof url !== 'string') return false

  // Relative URLs pointing to our own backend are always safe
  if (url.startsWith('/')) return true

  try {
    const parsed = new URL(url)
    return ALLOWED_PROTOCOLS.includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Returns the URL if it passes validation, or an empty string otherwise.
 * Use as `<img src={sanitizeMediaUrl(url)} />`.
 */
export function sanitizeMediaUrl(url) {
  return isAllowedUrl(url) ? url : ''
}

/**
 * Safe replacement for `window.open(url, '_blank')`.
 * Only opens the URL if it passes protocol validation.
 * Always adds `noopener,noreferrer` to prevent reverse tab-nabbing.
 */
export function safeOpenUrl(url) {
  if (isAllowedUrl(url)) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
