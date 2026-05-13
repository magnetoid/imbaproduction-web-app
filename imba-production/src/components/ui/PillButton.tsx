import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { ComponentType } from 'react'
import { useMagnetic } from '@/lib/magnetic'

interface PillButtonProps {
  children: React.ReactNode
  /** Internal route (Link). Pass `href` instead for external. */
  to?: string
  /** External href (anchor). Mutually exclusive with `to`. */
  href?: string
  /** Click handler — renders as <button>. */
  onClick?: () => void
  variant?: 'primary' | 'default' | 'ghost'
  /** Set false to omit the trailing arrow. */
  showArrow?: boolean
  /** Override the arrow icon. */
  icon?: ComponentType<{ className?: string }>
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  ariaLabel?: string
  /** Enable magnetic-cursor pull (hero CTAs only — restraint matters). */
  magnetic?: boolean
}

const VARIANTS: Record<NonNullable<PillButtonProps['variant']>, string> = {
  primary: 'pill-button pill-button--primary',
  default: 'pill-button',
  ghost:   'pill-button pill-button--ghost',
}

export default function PillButton({
  children,
  to,
  href,
  onClick,
  variant = 'default',
  showArrow = true,
  icon: Icon,
  type = 'button',
  disabled = false,
  className = '',
  ariaLabel,
  magnetic = false,
}: PillButtonProps) {
  const cls = `${VARIANTS[variant]} ${className}`.trim()
  const magneticRef = useMagnetic(magnetic ? { strength: 0.3, radius: 120 } : { strength: 0, radius: 0 })

  const body = (
    <>
      <span>{children}</span>
      {showArrow && (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-current/20">
          {Icon ? <Icon className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
        </span>
      )}
    </>
  )

  const refProp = magnetic ? { ref: magneticRef as React.RefObject<HTMLAnchorElement & HTMLButtonElement> } : {}

  if (to) {
    return (
      <Link
        to={to}
        className={cls}
        aria-label={ariaLabel}
        ref={magnetic ? (magneticRef as React.RefObject<HTMLAnchorElement>) : undefined}
      >
        {body}
      </Link>
    )
  }
  if (href) {
    const external = /^https?:\/\//i.test(href)
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={cls}
        aria-label={ariaLabel}
        ref={magnetic ? (magneticRef as React.RefObject<HTMLAnchorElement>) : undefined}
      >
        {body}
      </a>
    )
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cls}
      aria-label={ariaLabel}
      ref={magnetic ? (magneticRef as React.RefObject<HTMLButtonElement>) : undefined}
      {...(refProp ? {} : {})}
    >
      {body}
    </button>
  )
}
