interface HeroGlowProps {
  /** Where the radial gradient is centered. */
  position?: 'right' | 'center' | 'left'
  /** Opacity multiplier — 'soft' for ambient, 'bold' for backlight subjects. */
  intensity?: 'soft' | 'bold'
  className?: string
}

/**
 * Radial-gradient backlight used behind hero subjects in Spacebar style.
 * Drop inside a `relative` parent — fills with `absolute inset-0` and uses
 * mix-blend-mode: screen so the magenta / orange / violet stops bloom over
 * whatever (image, video) sits underneath.
 */
export default function HeroGlow({
  position = 'right',
  intensity = 'bold',
  className = '',
}: HeroGlowProps) {
  const positionCls =
    position === 'center' ? 'hero-glow--center' :
    position === 'left'   ? 'hero-glow hero-glow--left' :
    'hero-glow'
  const opacityStyle = intensity === 'soft' ? { opacity: 0.55 } : undefined
  return (
    <div
      aria-hidden="true"
      className={`${positionCls} ${className}`.trim()}
      style={opacityStyle}
    />
  )
}
