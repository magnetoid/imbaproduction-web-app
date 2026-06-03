import { useEffect, useRef } from 'react'

/**
 * Custom cinematic cursor — a lagging champagne ring + a crisp dot, blend-mode
 * difference so it reads on any background. Desktop pointers only; disabled for
 * touch and prefers-reduced-motion. Fully cleans up on unmount.
 */
export default function CinematicCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return

    document.body.classList.add('has-cursor')
    let mx = window.innerWidth / 2, my = window.innerHeight / 2
    let rx = mx, ry = my
    let raf = 0

    const onMove = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY
      if (dot.current) dot.current.style.transform = `translate(${mx}px, ${my}px)`
    }
    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      const interactive = !!t?.closest?.('a, button, [role="button"], input, textarea, select, label, .group')
      document.body.classList.toggle('cursor-active', interactive)
    }
    const loop = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      cancelAnimationFrame(raf)
      document.body.classList.remove('has-cursor', 'cursor-active')
    }
  }, [])

  return (
    <>
      <div ref={ring} className="cc-ring" aria-hidden="true" />
      <div ref={dot} className="cc-dot" aria-hidden="true" />
    </>
  )
}
