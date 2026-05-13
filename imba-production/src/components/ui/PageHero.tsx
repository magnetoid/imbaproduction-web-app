import PillBadge from './PillBadge'
import HeroGlow from './HeroGlow'
import SplitText from './SplitText'
import type { ReactNode } from 'react'

interface PageHeroProps {
  eyebrow?: string
  title: string
  /** Optional second-line title fragment rendered with text-paper-dim. */
  titleAccent?: string
  subtitle?: string
  glow?: 'right' | 'center' | 'left' | false
  /** Extra slots (e.g., stats panel, CTA pair). */
  rightSlot?: ReactNode
  /** Action row under the subtitle. */
  actions?: ReactNode
  /** Default `default` is left-aligned, `centered` is centered. */
  align?: 'default' | 'centered'
  className?: string
}

/**
 * Unified hero used by every public page except Home (Home keeps its
 * scrubbable reel hero). Replaces the inline grid-overlay + radial-
 * gradient + plain h1 scaffold that lived in 7 pages.
 *
 * Always renders inside a `relative overflow-hidden` section with the
 * warm ground background, optional <HeroGlow> behind the content, and
 * a SplitText reveal on the title.
 */
export default function PageHero({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  glow = 'right',
  rightSlot,
  actions,
  align = 'default',
  className = '',
}: PageHeroProps) {
  return (
    <section className={`relative overflow-hidden bg-ground pt-36 pb-20 lg:pb-28 px-6 lg:px-10 ${className}`.trim()}>
      {glow && <div className="absolute inset-0 pointer-events-none"><HeroGlow position={glow} intensity="soft" /></div>}

      {/* Subtle vignette so glow doesn't compete with text */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(15,13,12,0.85) 0%, rgba(15,13,12,0.40) 60%, transparent 100%)',
      }} />

      <div className="relative max-w-screen-2xl mx-auto">
        <div className={`grid gap-12 ${rightSlot ? 'lg:grid-cols-[1.6fr_1fr] items-end' : 'lg:grid-cols-1'} ${align === 'centered' ? 'text-center' : ''}`}>
          <div className={`flex flex-col gap-6 max-w-3xl ${align === 'centered' ? 'mx-auto items-center' : ''}`}>
            {eyebrow && <PillBadge>{eyebrow}</PillBadge>}

            <h1 className="display-xl text-paper" style={{ fontSize: 'clamp(2.6rem, 6vw, 5.2rem)' }}>
              <SplitText text={title} />
              {titleAccent && (
                <>
                  <br />
                  <span className="text-paper-dim">
                    <SplitText text={titleAccent} delay={title.split(' ').length * 0.04} />
                  </span>
                </>
              )}
            </h1>

            {subtitle && (
              <p className="text-paper-dim leading-relaxed max-w-2xl" style={{ fontSize: '1.05rem' }}>
                {subtitle}
              </p>
            )}

            {actions && <div className={`flex items-center gap-3 flex-wrap mt-2 ${align === 'centered' ? 'justify-center' : ''}`}>{actions}</div>}
          </div>

          {rightSlot && <div>{rightSlot}</div>}
        </div>
      </div>
    </section>
  )
}
