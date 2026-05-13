import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export interface BentoServiceItem {
  key: string
  label: string
  desc: string
  href?: string
  /** Optional cover image URL — shows on hover. */
  imageUrl?: string
}

interface BentoServicesProps {
  items: BentoServiceItem[]
  className?: string
}

/**
 * Hierarchical bento services grid — the lead service takes a 2×2 hero
 * cell, the rest are 1×1. Hover swaps in the cover image. 2026 pattern.
 *
 * Layout (lg+):
 *   ┌─────────────┬───────┬───────┐
 *   │             │  02   │  03   │
 *   │      01     ├───────┼───────┤
 *   │             │  04   │  05   │
 *   ├─────────────┴───────┴───────┤
 *   │              06             │
 *   └─────────────────────────────┘
 *
 * Works with 1-6 items; extra items wrap into a third row.
 */
export default function BentoServices({ items, className = '' }: BentoServicesProps) {
  const [lead, ...rest] = items
  if (!lead) return null
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[1fr_1fr] gap-2 ${className}`.trim()}>
      {/* Lead cell — 2×2 on lg+ */}
      <Card item={lead} className="lg:col-span-1 lg:row-span-2 lg:min-h-[460px]" lead />

      {/* Remaining cells */}
      {rest.slice(0, 4).map((item) => (
        <Card key={item.key} item={item} />
      ))}

      {/* Optional 7th+ items wrap to a third row, full-width */}
      {rest.slice(4).map((item) => (
        <Card key={item.key} item={item} className="lg:col-span-3" />
      ))}
    </div>
  )
}

function Card({ item, className = '', lead = false }: { item: BentoServiceItem; className?: string; lead?: boolean }) {
  const href = item.href || '/services'
  return (
    <Link
      to={href}
      className={`group relative overflow-hidden rounded-3xl bg-surface border border-white/8 transition-all duration-500 hover:border-white/15 hover:bg-surface-2 ${className}`.trim()}
    >
      {/* Cover image — fades in on hover */}
      {item.imageUrl && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <img
            src={item.imageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ground/95 via-ground/40 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className={`relative flex flex-col h-full ${lead ? 'p-9 lg:p-12' : 'p-7 lg:p-9'}`}>
        <h3 className={`text-paper font-display font-semibold tracking-tight leading-[1.1] ${lead ? 'text-3xl lg:text-4xl mb-4' : 'text-xl lg:text-2xl mb-3'}`}>
          {item.label}
        </h3>
        <p className={`text-paper-dim leading-relaxed ${lead ? 'text-base lg:text-lg' : 'text-sm'}`}>
          {item.desc}
        </p>
        <div className="mt-auto pt-6 flex items-center gap-2 text-paper font-mono-custom text-[0.62rem] tracking-[0.14em] uppercase transition-all duration-300 group-hover:gap-3">
          <span>Explore</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  )
}
