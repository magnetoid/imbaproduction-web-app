interface ClientLogoStripProps {
  /** Plain client names. Rendered as text marks at low opacity / grayscale. */
  clients?: string[]
  className?: string
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
 * Grayscale client logo strip used at the bottom of hero sections.
 * Falls back to a hand-picked list when no clients are passed in.
 * Renders as text marks (not actual logo svgs) since we don't have
 * SVG logos for the clients on file yet.
 */
export default function ClientLogoStrip({
  clients = DEFAULT_CLIENTS,
  className = '',
}: ClientLogoStripProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-12 gap-y-4 ${className}`.trim()}>
      {clients.map((name) => (
        <span
          key={name}
          className="font-mono-custom text-[0.6rem] tracking-[0.18em] uppercase text-paper-dim/55 hover:text-paper-dim transition-colors"
        >
          {name}
        </span>
      ))}
    </div>
  )
}
