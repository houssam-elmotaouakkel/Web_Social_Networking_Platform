export const API_URL = import.meta.env.VITE_API_URL || '/api'

// Base URL of the backend server (for resolving relative paths like /uploads/...)
export const BACKEND_URL = API_URL.endsWith('/api')
  ? API_URL.slice(0, -4)   // 'https://xxx.onrender.com/api' → 'https://xxx.onrender.com'
  : ''                     // '/api' (dev proxy) → '' (relative)

export const UPLOADS_URL = `${BACKEND_URL}/uploads`

export const THREAD_MAX_LENGTH = 2000
export const BIO_MAX_LENGTH = 300
export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 30
export const PASSWORD_MIN_LENGTH = 8

export const FEED_PAGE_SIZE = 20
export const NOTIFICATIONS_PAGE_SIZE = 20
export const FOLLOWERS_PAGE_SIZE = 50

export const BADGE_POLL_INTERVAL_MS = 30000
export const SEARCH_DEBOUNCE_MS = 300
export const MAX_MEDIA_PER_THREAD = 4