import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)

const THEMES = ['light', 'dark', 'auto']

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode) {
  return mode === 'auto' ? getSystemTheme() : mode
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  const applyTheme = useCallback((resolved) => {
    document.documentElement.setAttribute('data-theme', resolved)
  }, [])

  // Apply theme on mode change
  useEffect(() => {
    localStorage.setItem('theme', mode)
    applyTheme(resolveTheme(mode))
  }, [mode, applyTheme])

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (mode !== 'auto') return

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => applyTheme(e.matches ? 'dark' : 'light')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [mode, applyTheme])

  const setTheme = (newMode) => {
    if (THEMES.includes(newMode)) setMode(newMode)
  }

  return (
    <ThemeContext.Provider value={{ mode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
