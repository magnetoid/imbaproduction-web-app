import { Link } from 'react-router-dom'
import { useQuoteModal } from '@/contexts/QuoteModalContext'
import { useSiteSettings } from '@/lib/site-settings'

export default function Footer() {
  const { openModal } = useQuoteModal()
  const s = useSiteSettings()
  const addr = s.contact_address

  return (
    <footer className="bg-ink-3 border-t border-white/5">
      {/* Top strip */}
      <div className="border-b border-white/5 px-6 lg:px-12 py-6 flex items-center justify-between">
        <p className="font-mono-custom text-[0.6rem] tracking-[0.2em] text-smoke-faint uppercase">
          Ready to outperform your last campaign?
        </p>
        <button onClick={() => openModal()} className="btn btn-primary text-[0.65rem]">
          Get a free quote →
        </button>
      </div>

      {/* Main footer */}
      <div className="px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="font-display font-light text-2xl text-smoke mb-4">
            imba<span className="text-ember italic">.</span>production
          </div>
          <p className="text-sm text-smoke-dim leading-relaxed max-w-xs mb-6">
            {s.footer_tagline}
          </p>
          <div className="flex gap-2 flex-wrap">
            {s.social_links.map(({ label, href }) => (
              <a
                key={label + href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 border border-white/10 flex items-center justify-center font-mono-custom text-[0.6rem] text-smoke-dim hover:border-ember hover:text-ember transition-all"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <p className="font-mono-custom text-[0.6rem] tracking-[0.18em] uppercase text-smoke mb-5">Services</p>
          <ul className="flex flex-col gap-3">
            {s.footer_services.map(({ label, href, to }) => {
              const dest = href || to || '/services'
              const isExternal = /^https?:\/\//i.test(dest)
              return (
                <li key={label + dest}>
                  {isExternal ? (
                    <a href={dest} target="_blank" rel="noopener noreferrer" className="text-sm text-smoke-dim hover:text-smoke transition-colors">
                      {label}
                    </a>
                  ) : (
                    <Link to={dest} className="text-sm text-smoke-dim hover:text-smoke transition-colors">
                      {label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Company */}
        <div>
          <p className="font-mono-custom text-[0.6rem] tracking-[0.18em] uppercase text-smoke mb-5">Company</p>
          <ul className="flex flex-col gap-3">
            {s.footer_company.map(({ label, to, href }) => {
              const dest = to || href || '/'
              const isExternal = /^https?:\/\//i.test(dest)
              return (
                <li key={label + dest}>
                  {isExternal ? (
                    <a href={dest} target="_blank" rel="noopener noreferrer" className="text-sm text-smoke-dim hover:text-smoke transition-colors">
                      {label}
                    </a>
                  ) : (
                    <Link to={dest} className="text-sm text-smoke-dim hover:text-smoke transition-colors">
                      {label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="font-mono-custom text-[0.6rem] tracking-[0.18em] uppercase text-smoke mb-5">Contact</p>
          <div className="flex flex-col gap-3 text-sm text-smoke-dim">
            <a href={`mailto:${s.contact_email}`} className="hover:text-ember transition-colors">
              {s.contact_email}
            </a>
            <p className="leading-relaxed">
              {addr.line1 && <>{addr.line1}<br /></>}
              {addr.line2 && <>{addr.line2}<br /></>}
              {(addr.city || addr.region || addr.postal) && (
                <>{[addr.city, addr.region, addr.postal].filter(Boolean).join(', ')}<br /></>
              )}
              {addr.country}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/5 px-6 lg:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="font-mono-custom text-[0.6rem] tracking-[0.1em] text-smoke-faint/50">
          © {new Date().getFullYear()} Imba Production LLC. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link to="/privacy" className="font-mono-custom text-[0.6rem] text-smoke-faint/50 hover:text-smoke-dim transition-colors">
            Privacy Policy
          </Link>
          <Link to="/admin" className="font-mono-custom text-[0.6rem] text-smoke-faint/30 hover:text-smoke-dim transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
