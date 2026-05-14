interface ClientLogoStripProps {
  clients?: string[]
  className?: string
  /** When `cinema`, renders for dark-panel context. */
  variant?: 'editorial' | 'cinema'
}

const DEFAULT_CLIENTS = [
  'FoodCo International',
  'NordShop',
  'Velour Boutique',
  'Irving Books',
  'Kozica Soaps',
  'Prime Real Estate',
]

/**
 * Client name strip — text-only (we don't ship vector logos for each client).
 * On light surface renders ink-dim, on cinema renders paper-cinema.
 */
export default function ClientLogoStrip({
  clients = DEFAULT_CLIENTS,
  variant = 'editorial',
  className = '',
}: ClientLogoStripProps) {
  const color = variant === 'cinema'
    ? 'text-paper-cinema/45 hover:text-paper-cinema/80'
    : 'text-ink-dim/45 hover:text-ink-dim'
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-12 gap-y-3 ${className}`.trim()}>
      {clients.map((name) => (
        <span
          key={name}
          className={`font-mono-custom text-[0.65rem] tracking-[0.22em] uppercase transition-colors ${color}`}
        >
          {name}
        </span>
      ))}
    </div>
  )
}
