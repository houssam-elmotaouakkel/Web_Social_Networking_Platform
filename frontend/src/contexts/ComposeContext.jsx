import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ComposeContext = createContext(null)

export function ComposeProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const listenersRef = useRef(new Set())

  const openCompose = useCallback(() => setIsOpen(true), [])
  const closeCompose = useCallback(() => setIsOpen(false), [])

  const onCreated = useCallback((thread) => {
    listenersRef.current.forEach((fn) => fn(thread))
  }, [])

  const subscribe = useCallback((fn) => {
    listenersRef.current.add(fn)
    return () => listenersRef.current.delete(fn)
  }, [])

  return (
    <ComposeContext.Provider value={{ isOpen, openCompose, closeCompose, onCreated, subscribe }}>
      {children}
    </ComposeContext.Provider>
  )
}

export function useCompose() {
  const ctx = useContext(ComposeContext)
  if (!ctx) throw new Error('useCompose must be inside ComposeProvider')
  return ctx
}
