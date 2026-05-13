interface MarqueeProps {
  items: string[]
  /** Pixel gap between repetitions. */
  separator?: string
  className?: string
}

/**
 * Scrolling text strip — runs the items continuously left-to-right.
 * Doubled inline so the loop is seamless. Honours prefers-reduced-motion
 * via .marquee-track in CSS.
 */
export default function Marquee({ items, separator = '·', className = '' }: MarqueeProps) {
  const block = items.flatMap((item, i) => [
    <span key={`${i}-text`} className="text-paper-dim/60 font-mono-custom text-xs tracking-[0.18em] uppercase">
      {item}
    </span>,
    <span key={`${i}-sep`} className="text-paper-faint/40" aria-hidden="true">{separator}</span>,
  ])
  return (
    <div className={`relative overflow-hidden ${className}`.trim()}>
      <div className="marquee-track">
        <span className="inline-flex items-center gap-16 pr-16">{block}</span>
        <span className="inline-flex items-center gap-16 pr-16" aria-hidden="true">{block}</span>
      </div>
      {/* edge fade-out so the marquee melts into the surface */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ground to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ground to-transparent pointer-events-none" />
    </div>
  )
}
