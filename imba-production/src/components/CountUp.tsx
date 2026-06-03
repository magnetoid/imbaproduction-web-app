import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

/**
 * Animated number that counts up when scrolled into view.
 * Accepts display strings like "500+", "48h", "98%", "12+" — animates the
 * numeric part and preserves any prefix/suffix.
 */
export default function CountUp({ value, duration = 1500 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-12%' })

  const match = value.match(/^(\D*)([\d,]+)(.*)$/)
  const prefix = match?.[1] ?? ''
  const target = match ? parseInt(match[2].replace(/,/g, ''), 10) : NaN
  const suffix = match?.[3] ?? ''

  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView || Number.isNaN(target)) return
    let raf = 0
    const start = performance.now()
    const ease = (p: number) => 1 - Math.pow(1 - p, 3) // easeOutCubic
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setN(Math.round(ease(p) * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration])

  // Non-numeric values render as-is.
  if (Number.isNaN(target)) return <span ref={ref}>{value}</span>

  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>
}
