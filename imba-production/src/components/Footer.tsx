import { Link } from 'react-router-dom'
import { useQuoteModal } from '@/contexts/QuoteModalContext'
import { useSiteSettings } from '@/lib/site-settings'
import PillButton from '@/components/ui/PillButton'
import PillBadge from '@/components/ui/PillBadge'

export default function Footer() {
  const { openModal } = useQuoteModal()
  const s = useSiteSettings()
  const addr = s.contact_address

  return (
    <footer className="bg-canvas text-ink border-t border-hairline">
      {/* Single confident CTA section — replaces marquee + ribbon strips */}
      <section className="section-py px-6 lg:px-10">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-20 items-end">
          <div>
            <PillBadge className="mb-6">Start a conversation</PillBadge>
            <h2 className="editorial-hero text-ink" style={{ fontSize: 'clamp(2.4rem, 5vw, 4.2rem)' }}>
              Tell us what you're shipping.<br />
              <span className="text-ink-dim">We'll send back a plan in 24 hours.</span>
            </h2>
            <p className="editorial-lead mt-6 max-w-xl">
              {s.footer_tagline}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3">
            <PillButton variant="primary" onClick={() => openModal()}>Book a call</PillButton>
            <PillButton variant="ghost" to="/work">See the reel</PillButton>
          </div>
        </div>
      </section>

      {/* Hairline divider */}
      <div className="border-t border-hairline" />

      {/* Columns */}
      <div className="px-6 lg:px-10 pt-16 pb-12 grid grid-cols-2 lg:grid-cols-4 gap-10 max-w-screen-xl mx-auto">
        <div className="col-span-2 lg:col-span-1">
          <div className="font-display font-bold text-lg tracking-tight">
            imba<span className="opacity-50">.</span>production
          </div>
          <p className="text-sm text-ink-dim leading-relaxed max-w-xs mt-3">
            A video studio for brands that ship.
          </p>
        </div>

        <div>
          <p className="font-mono-custom text-[0.6rem] tracking-[0.22em] uppercase text-ink-faint mb-5">Services</p>
          <ul className="flex flex-col gap-2.5">
            {s.footer_services.map(({ label, href, to }) => {
              const dest = href || to || '/services'
              return (
                <li key={label + dest}>
                  <Link to={dest} className="text-sm text-ink hover:text-ink-navy transition-colors">{label}</Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <p className="font-mono-custom text-[0.6rem] tracking-[0.22em] uppercase text-ink-faint mb-5">Studio</p>
          <ul className="flex flex-col gap-2.5">
            {s.footer_company.map(({ label, to, href }) => {
              const dest = to || href || '/'
              return (
                <li key={label + dest}>
                  <Link to={dest} className="text-sm text-ink hover:text-ink-navy transition-colors">{label}</Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <p className="font-mono-custom text-[0.6rem] tracking-[0.22em] uppercase text-ink-faint mb-5">Contact</p>
          <div className="flex flex-col gap-3 text-sm text-ink">
            <a href={`mailto:${s.contact_email}`} className="hover:text-ink-navy transition-colors">
              {s.contact_email}
            </a>
            <p className="text-ink-dim leading-relaxed">
              {addr.line1 && <>{addr.line1}<br /></>}
              {addr.line2 && <>{addr.line2}<br /></>}
              {(addr.city || addr.region || addr.postal) && (
                <>{[addr.city, addr.region, addr.postal].filter(Boolean).join(', ')}<br /></>
              )}
              {addr.country}
            </p>
            <div className="flex gap-3 mt-3 flex-wrap">
              {s.social_links.map(({ label, href }) => (
                <a
                  key={label + href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono-custom text-[0.65rem] tracking-[0.18em] uppercase text-ink-dim hover:text-ink transition-colors"
                  aria-label={label}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-hairline px-6 lg:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="font-mono-custom text-[0.62rem] tracking-[0.18em] uppercase text-ink-faint">
          © {new Date().getFullYear()} Imba Production LLC
        </p>
        <div className="flex gap-6">
          <Link to="/privacy" className="font-mono-custom text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint hover:text-ink transition-colors">
            Privacy
          </Link>
          <Link to="/admin" className="font-mono-custom text-[0.62rem] uppercase tracking-[0.18em] text-ink-faint hover:text-ink transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
