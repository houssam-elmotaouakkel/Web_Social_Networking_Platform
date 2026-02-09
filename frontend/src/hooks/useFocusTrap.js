import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/**
 * Traps focus inside a container element while active.
 * Returns a ref to attach to the container.
 */
export function useFocusTrap(active) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const focusableEls = () => [...container.querySelectorAll(FOCUSABLE)]

    // Focus first element on mount
    const first = focusableEls()[0]
    first?.focus()

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return

      const els = focusableEls()
      if (els.length === 0) return

      const firstEl = els[0]
      const lastEl = els[els.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return containerRef
}
