import { createContext, useContext, useState, useCallback } from 'react'

const PanelContext = createContext(null)

export function PanelProvider({ children }) {
  const [expanded, setExpanded] = useState(false)

  const togglePanel = useCallback(() => setExpanded((v) => !v), [])
  const collapsePanel = useCallback(() => setExpanded(false), [])
  const expandPanel = useCallback(() => setExpanded(true), [])

  return (
    <PanelContext.Provider value={{ expanded, togglePanel, collapsePanel, expandPanel }}>
      {children}
    </PanelContext.Provider>
  )
}

export function usePanel() {
  const ctx = useContext(PanelContext)
  if (!ctx) throw new Error('usePanel must be used inside PanelProvider')
  return ctx
}
