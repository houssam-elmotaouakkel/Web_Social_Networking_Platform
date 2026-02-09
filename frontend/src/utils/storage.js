const TOKEN_KEY = 'token'

/**
 * Decode a JWT payload without a library.
 * Returns null if the token is malformed.
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  /**
   * Returns true only if a token exists AND has not expired.
   * Considers the token expired if less than 30 s remain (clock-skew margin).
   */
  isTokenValid() {
    const token = this.getToken()
    if (!token) return false
    const payload = parseJwt(token)
    if (!payload?.exp) return false
    return payload.exp * 1000 > Date.now() + 30_000
  },
}