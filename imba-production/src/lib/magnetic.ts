import { useEffect, useRef } from 'react'

/**
 * Magnetic-cursor hook. Attaches to a button-like element and pulls it
 * toward the pointer when the pointer is within `radius` pixels.
 *
 * 2026 pattern (Code Barcelona / Spacebar). Restraint matters — pull
 * factor 0.3, max radius ~120px so the effect is felt but not silly.
 *
 * Gated by:
 *   - pointer: fine (kills touch / Apple Pencil drift)
 *   - prefers-reduced-motion: reduce (kills the whole effect)
 */
export function useMagnetic(opts: { strength?: number; radius?: number } = {}) {
  const ref = useRef<HTMLElement | null>(null)
  const { strength = 0.3, radius = 120 } = opts

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === 'undefined') return

    const fineMatch = window.matchMedia('(pointer: fine)')
    const reducedMatch = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fineMatch.matches || reducedMatch.matches) return

    let raf = 0
    let active = false
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    function loop() {
      // simple lerp toward target
      currentX += (targetX - currentX) * 0.18
      currentY += (targetY - currentY) * 0.18
      if (el) {
        el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`
      }
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        raf = requestAnimationFrame(loop)
      } else {
        raf = 0
      }
    }

    function onMove(e: PointerEvent) {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      if (dist > radius) {
        if (active) {
          targetX = 0
          targetY = 0
          active = false
          if (!raf) raf = requestAnimationFrame(loop)
        }
        return
      }
      active = true
      targetX = dx * strength
      targetY = dy * strength
      if (!raf) raf = requestAnimationFrame(loop)
    }

    function onLeave() {
      targetX = 0
      targetY = 0
      active = false
      if (!raf) raf = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
      if (el) el.style.transform = ''
    }
  }, [strength, radius])

  return ref
}
