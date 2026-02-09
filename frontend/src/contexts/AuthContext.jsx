import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api/auth.api'
import { storage } from '../utils/storage'
import { setOnUnauthorized } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Register the global 401 handler once --------------------------------------------------
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null)
      // ProtectedRoute will redirect to /login automatically
      navigate('/login', { replace: true })
    })
  }, [navigate])

  const fetchUser = useCallback(async () => {
    if (!storage.isTokenValid()) {
      storage.removeToken()
      setLoading(false)
      return
    }
    try {
      const { data } = await authAPI.getMe()
      setUser(data.user)
    } catch {
      storage.removeToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials)
    storage.setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (credentials) => {
    const { data } = await authAPI.register(credentials)
    storage.setToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    storage.removeToken()
    setUser(null)
  }

  const updateUser = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}