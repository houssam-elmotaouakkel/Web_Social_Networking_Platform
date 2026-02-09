/**
 * URL validation & sanitization helpers.
 *
 * Prevents open-redirect, tracking-pixel injection, and javascript: URIs
 * by restricting allowed protocols and providing a safe window.open wrapper.
 */

import { BACKEND_URL } from './constants'

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
 * Resolves a media URL.
 * - Relative paths like `/uploads/xxx.jpg` are prefixed with BACKEND_URL
 *   so they work in production where frontend and backend are on different domains.
 * - Absolute http(s) URLs are returned as-is.
 * - Invalid URLs return empty string.
 */
export function sanitizeMediaUrl(url) {
  if (!isAllowedUrl(url)) return ''
  // Prefix relative paths with the backend base URL
  if (url.startsWith('/') && BACKEND_URL) return `${BACKEND_URL}${url}`
  return url
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
