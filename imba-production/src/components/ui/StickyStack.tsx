interface StickyStackItem {
  id: string
  /** Header eyebrow on the card (e.g., "01 / 04"). */
  index: string
  title: string
  description?: string
  /** Optional background image URL. Falls back to surface. */
  imageUrl?: string
  /** Optional accent colour for the eyebrow + index. */
  accent?: string
}

interface StickyStackProps {
  items: StickyStackItem[]
  className?: string
}

/**
 * Sticky-peel stack of cards. Each card sticks to its top offset as the
 * user scrolls; subsequent cards slide over it. The 2026 pattern from
 * Awwwards (Phamily, Faktory). Pure CSS via position:sticky.
 *
 * Layout: the section is `min-height: items.length * 100vh`; each card
 * is `sticky top-X` where X increases per card so cards stack.
 */
export default function StickyStack({ items, className = '' }: StickyStackProps) {
  return (
    <div className={`px-6 lg:px-10 ${className}`.trim()}>
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col gap-0">
          {items.map((item, i) => (
            <article
              key={item.id}
              className="sticky bg-surface border border-white/8 rounded-3xl overflow-hidden"
              style={{
                top: `${72 + i * 16}px`,
                marginTop: i === 0 ? '0' : '24px',
                minHeight: '60vh',
              }}
            >
              <div className="grid lg:grid-cols-[1.1fr_1fr] gap-0 h-full">
                {/* Visual */}
                <div className="relative aspect-video lg:aspect-auto min-h-[260px] bg-surface-2">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : null}
                  <div className="absolute top-4 left-4 font-mono-custom text-[0.65rem] tracking-[0.18em] uppercase px-3 py-1 rounded-full bg-ground/70 border border-white/10"
                    style={{ color: item.accent || '#F0EEE9' }}>
                    {item.index}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <h3 className="display-lg text-paper mb-4" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-paper-dim leading-relaxed max-w-xl" style={{ fontSize: '1rem' }}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export type { StickyStackItem }
