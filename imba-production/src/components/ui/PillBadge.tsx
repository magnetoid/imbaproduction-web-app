interface PillBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'mono'
  className?: string
}

/**
 * Editorial label — mono uppercase with a small leading rule. Replaces what
 * used to be a pill-shaped chip. Keeps `PillBadge` filename for compatibility.
 *
 * Rendered as a tiny magazine eyebrow ("STUDIO", "01 · CASE STUDY"). On
 * cinema-panel surfaces it inherits the paper-cinema colour automatically.
 */
export default function PillBadge({ children, className = '' }: PillBadgeProps) {
  return <span className={`editorial-label ${className}`.trim()}>{children}</span>
}
