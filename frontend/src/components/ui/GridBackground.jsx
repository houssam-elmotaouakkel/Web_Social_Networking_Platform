import { useEffect, useRef, useCallback } from 'react'

const CELL = 50       // px per square
const FADE_MS = 1500  // how long the glow lingers

export default function GridBackground() {
  const canvasRef = useRef(null)
  const cellsRef = useRef(new Map())   // key "col-row" → { ts }
  const rafRef = useRef(null)
  const isAnimatingRef = useRef(false)

  const resize = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    c.width = window.innerWidth
    c.height = window.innerHeight
  }, [])

  const drawOnce = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    const cols = Math.ceil(c.width / CELL)
    const rows = Math.ceil(c.height / CELL)
    const now = Date.now()
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light'

    ctx.clearRect(0, 0, c.width, c.height)

    // grid lines
    ctx.strokeStyle = isDark ? 'rgba(168, 85, 247, 0.08)' : 'rgba(147, 51, 234, 0.12)'
    ctx.lineWidth = 1
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath()
      ctx.moveTo(x * CELL, 0)
      ctx.lineTo(x * CELL, c.height)
      ctx.stroke()
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * CELL)
      ctx.lineTo(c.width, y * CELL)
      ctx.stroke()
    }

    // glowing cells
    cellsRef.current.forEach((cell, key) => {
      const elapsed = now - cell.ts
      if (elapsed > FADE_MS) {
        cellsRef.current.delete(key)
        return
      }
      const alpha = 0.9 * (1 - elapsed / FADE_MS)
      const [col, row] = key.split('-').map(Number)
      ctx.fillStyle = isDark
        ? `rgba(168, 85, 247, ${alpha})`
        : `rgba(147, 51, 234, ${alpha * 0.35})`
      ctx.fillRect(col * CELL + 1, row * CELL + 1, CELL - 2, CELL - 2)
    })

    // Stop the loop once all cells have faded out
    if (cellsRef.current.size > 0) {
      rafRef.current = requestAnimationFrame(drawOnce)
    } else {
      isAnimatingRef.current = false
    }
  }, [])

  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true
    rafRef.current = requestAnimationFrame(drawOnce)
  }, [drawOnce])

  /* ---- pointer tracking ---- */
  const handlePointer = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const col = Math.floor(x / CELL)
    const row = Math.floor(y / CELL)

    // light up a 3×3 area around cursor for a softer effect
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${col + dx}-${row + dy}`
        cellsRef.current.set(key, { ts: Date.now() })
      }
    }
    startAnimation()
  }, [startAnimation])

  useEffect(() => {
    resize()
    window.addEventListener('resize', resize)

    // Draw initial grid lines (no animation loop until pointer moves)
    drawOnce()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [resize, drawOnce])

  return (
    <canvas
      ref={canvasRef}
      onPointerMove={handlePointer}
      className="fixed inset-0 w-full h-full z-0"
      style={{ background: 'var(--color-bg-secondary, #050505)' }}
    />
  )
}
