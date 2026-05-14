import PillBadge from './PillBadge'
import type { ReactNode } from 'react'

interface PageHeroProps {
  eyebrow?: string
  title: string
  /** Optional second-line title fragment, rendered in ink-dim. */
  titleAccent?: string
  subtitle?: string
  /** Slot for stats / image / sidebar content. */
  rightSlot?: ReactNode
  actions?: ReactNode
  /** Visual variant: `editorial` (light canvas) or `cinema` (dark panel). */
  variant?: 'editorial' | 'cinema'
  /** Default alignment — `default` (left) or `centered`. */
  align?: 'default' | 'centered'
  className?: string
}

/**
 * Unified hero scaffold used by every page except Home (Home keeps its own
 * cinema reel hero). Two variants: editorial (light canvas, default) or
 * cinema (dark panel for pages that lead with video).
 *
 * No decorative chrome — restraint is the point.
 */
export default function PageHero({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  rightSlot,
  actions,
  variant = 'editorial',
  align = 'default',
  className = '',
}: PageHeroProps) {
  const isCinema = variant === 'cinema'
  const bg = isCinema ? 'cinema-panel' : 'bg-canvas'
  const titleColor = isCinema ? 'text-paper-cinema' : 'text-ink'
  const accentColor = isCinema ? 'text-paper-cinema/60' : 'text-ink-dim'
  const subtitleColor = isCinema ? 'text-paper-cinema/75' : 'text-ink-dim'
  return (
    <section className={`${bg} pt-36 pb-20 lg:pb-28 px-6 lg:px-10 ${className}`.trim()}>
      <div className="max-w-screen-2xl mx-auto">
        <div className={`grid gap-12 ${rightSlot ? 'lg:grid-cols-[1.6fr_1fr] items-end' : 'lg:grid-cols-1'} ${align === 'centered' ? 'text-center' : ''}`}>
          <div className={`flex flex-col gap-6 max-w-3xl ${align === 'centered' ? 'mx-auto items-center' : ''}`}>
            {eyebrow && <PillBadge>{eyebrow}</PillBadge>}

            <h1
              className={`editorial-hero ${titleColor} reveal`}
              style={{ fontSize: 'clamp(2.6rem, 6vw, 5.2rem)' }}
            >
              {title}
              {titleAccent && (
                <>
                  <br />
                  <span className={accentColor}>{titleAccent}</span>
                </>
              )}
            </h1>

            {subtitle && (
              <p
                className={`${subtitleColor} leading-relaxed max-w-2xl reveal reveal-delay-1`}
                style={{ fontSize: '1.1rem' }}
              >
                {subtitle}
              </p>
            )}

            {actions && (
              <div
                className={`flex items-center gap-4 flex-wrap mt-2 reveal reveal-delay-2 ${align === 'centered' ? 'justify-center' : ''}`}
              >
                {actions}
              </div>
            )}
          </div>

          {rightSlot && <div className="reveal reveal-delay-2">{rightSlot}</div>}
        </div>
      </div>
    </section>
  )
}
