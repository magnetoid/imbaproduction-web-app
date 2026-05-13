interface PillBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'mono'
  className?: string
}

/**
 * Small rounded-full chip used to label sections (replaces the old `.eyebrow`
 * which had a leading dash). Two variants:
 *  - `default` — clean sans-serif chip ("Spacebar Visuals")
 *  - `mono`    — small uppercase mono label ("01 / 04")
 */
export default function PillBadge({ children, variant = 'default', className = '' }: PillBadgeProps) {
  const variantCls = variant === 'mono' ? 'pill-badge pill-badge--mono' : 'pill-badge'
  return <span className={`${variantCls} ${className}`.trim()}>{children}</span>
}
