import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { ComponentType } from 'react'

interface PillButtonProps {
  children: React.ReactNode
  to?: string
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'default' | 'ghost'
  showArrow?: boolean
  icon?: ComponentType<{ className?: string }>
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  ariaLabel?: string
  /** Deprecated — magnetic pull is gone in the Editorial Cinema direction. */
  magnetic?: boolean
}

const VARIANTS: Record<NonNullable<PillButtonProps['variant']>, string> = {
  primary: 'editorial-button editorial-button--primary',
  default: 'editorial-button',
  ghost:   'editorial-button editorial-button--ghost',
}

/**
 * Editorial rectangular button. Keeps the `PillButton` filename + import path
 * for compatibility with existing JSX; visually it's no longer a pill.
 */
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
}: PillButtonProps) {
  const cls = `${VARIANTS[variant]} ${className}`.trim()
  const showArrowInGhost = variant === 'ghost' && showArrow
  const body = (
    <>
      <span>{children}</span>
      {showArrow && variant !== 'ghost' && (
        Icon ? <Icon className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />
      )}
      {showArrowInGhost && (
        <span aria-hidden="true">→</span>
      )}
    </>
  )

  if (to) return <Link to={to} className={cls} aria-label={ariaLabel}>{body}</Link>
  if (href) {
    const external = /^https?:\/\//i.test(href)
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={cls}
        aria-label={ariaLabel}
      >
        {body}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>
      {body}
    </button>
  )
}
