import { Link } from 'react-router-dom'
import { useQuoteModal } from '@/contexts/QuoteModalContext'
import { useSiteSettings } from '@/lib/site-settings'
import PillButton from '@/components/ui/PillButton'

export default function Footer() {
  const { openModal } = useQuoteModal()
  const s = useSiteSettings()
  const addr = s.contact_address

  return (
    <footer className="bg-ground border-t border-white/[0.06]">

      {/* Top CTA strip */}
      <div className="border-b border-white/[0.06] px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h3 className="display-md text-paper text-2xl sm:text-3xl">
            Ready to make something memorable?
          </h3>
          <p className="text-paper-dim text-sm mt-2 max-w-md">
            Tell us what you're trying to achieve. Free quote in 24 hours.
          </p>
        </div>
        <PillButton variant="primary" onClick={() => openModal()}>
          Get in Touch
        </PillButton>
      </div>

      {/* Main footer */}
      <div className="px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="font-display font-bold text-2xl text-paper mb-4 tracking-tight">
            imba<span className="text-ember">.</span>production
          </div>
          <p className="text-sm text-paper-dim leading-relaxed max-w-xs mb-6">
            {s.footer_tagline}
          </p>
          <div className="flex gap-2 flex-wrap">
            {s.social_links.map(({ label, href }) => (
              <a
                key={label + href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-surface/40 font-mono-custom text-[0.6rem] text-paper-dim hover:border-white/30 hover:text-paper hover:bg-surface transition-all"
                aria-label={label}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <p className="font-mono-custom text-[0.6rem] tracking-[0.18em] uppercase text-paper-faint mb-5">Services</p>
          <ul className="flex flex-col gap-3">
            {s.footer_services.map(({ label, href, to }) => {
              const dest = href || to || '/services'
              const isExternal = /^https?:\/\//i.test(dest)
              return (
                <li key={label + dest}>
                  {isExternal ? (
                    <a href={dest} target="_blank" rel="noopener noreferrer" className="text-sm text-paper-dim hover:text-paper transition-colors">
                      {label}
                    </a>
                  ) : (
                    <Link to={dest} className="text-sm text-paper-dim hover:text-paper transition-colors">
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
          <p className="font-mono-custom text-[0.6rem] tracking-[0.18em] uppercase text-paper-faint mb-5">Company</p>
          <ul className="flex flex-col gap-3">
            {s.footer_company.map(({ label, to, href }) => {
              const dest = to || href || '/'
              const isExternal = /^https?:\/\//i.test(dest)
              return (
                <li key={label + dest}>
                  {isExternal ? (
                    <a href={dest} target="_blank" rel="noopener noreferrer" className="text-sm text-paper-dim hover:text-paper transition-colors">
                      {label}
                    </a>
                  ) : (
                    <Link to={dest} className="text-sm text-paper-dim hover:text-paper transition-colors">
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
          <p className="font-mono-custom text-[0.6rem] tracking-[0.18em] uppercase text-paper-faint mb-5">Contact</p>
          <div className="flex flex-col gap-3 text-sm text-paper-dim">
            <a href={`mailto:${s.contact_email}`} className="hover:text-paper transition-colors">
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
      <div className="border-t border-white/[0.06] px-6 lg:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="font-mono-custom text-[0.6rem] tracking-[0.1em] text-paper-faint/60">
          © {new Date().getFullYear()} Imba Production LLC. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link to="/privacy" className="font-mono-custom text-[0.6rem] text-paper-faint/60 hover:text-paper-dim transition-colors">
            Privacy Policy
          </Link>
          <Link to="/admin" className="font-mono-custom text-[0.6rem] text-paper-faint/40 hover:text-paper-dim transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
