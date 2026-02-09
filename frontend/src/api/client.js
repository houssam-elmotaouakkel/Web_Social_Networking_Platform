import axios from 'axios'
import { storage } from '../utils/storage'
import { API_URL } from '../utils/constants'

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

/* ------------------------------------------------------------------ */
/*  Callback registered by AuthContext — navigates via React Router   */
/* ------------------------------------------------------------------ */
let _onUnauthorized = null

/** Called once by AuthContext to wire up graceful logout. */
export function setOnUnauthorized(callback) {
  _onUnauthorized = callback
}

/* ------------------------------------------------------------------ */
/*  Request interceptor — attach token + proactive expiry check       */
/* ------------------------------------------------------------------ */
client.interceptors.request.use((config) => {
  // If the token is expired, proactively clear it and trigger logout
  // instead of waiting for the server 401.
  if (!storage.isTokenValid()) {
    storage.removeToken()
    // Only fire unauthorized callback if we actually had a token
    // (i.e. user was logged in, not a public route call)
    if (config.headers.Authorization || storage.getToken()) {
      _onUnauthorized?.()
    }
    delete config.headers.Authorization
    return config
  }

  const token = storage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* ------------------------------------------------------------------ */
/*  Response interceptor — handle 401 gracefully with dedup           */
/* ------------------------------------------------------------------ */
let _isLoggingOut = false

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !_isLoggingOut &&
      !error.config?._skipAuthRedirect
    ) {
      _isLoggingOut = true
      storage.removeToken()
      _onUnauthorized?.()
      // Reset flag after a tick so future sessions can still trigger logout
      setTimeout(() => { _isLoggingOut = false }, 1000)
    }
    return Promise.reject(error)
  }
)

export default client