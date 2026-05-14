import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useQuoteModal } from '@/contexts/QuoteModalContext'
import PillButton from '@/components/ui/PillButton'

const LINKS = [
  { to: '/work',     label: 'Work' },
  { to: '/services', label: 'Services' },
  { to: '/about',    label: 'Studio' },
  { to: '/blog',     label: 'Journal' },
  { to: '/contact',  label: 'Contact' },
]

/**
 * Editorial nav — anchored top-row, rectangular, no pill, no backdrop blur.
 * Inherits cinema vs editorial colour automatically from parent surface
 * (`.cinema-panel` switches link tones).
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { openModal } = useQuoteModal()
  const location = useLocation()

  // On Home, the nav floats on top of the cinema hero — apply cinema-panel
  // class to ourselves until the user scrolls past the hero band.
  const onHomeAtTop = location.pathname === '/' && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          onHomeAtTop
            ? 'cinema-panel border-b border-hairline-cinema'
            : scrolled
              ? 'bg-canvas/95 backdrop-blur border-b border-hairline'
              : 'bg-canvas border-b border-transparent'
        }`}
      >
        <div className="px-6 lg:px-10 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="font-display font-bold tracking-tight text-base inline-flex items-baseline gap-0">
            imba<span className="opacity-50">.</span><span>production</span>
          </Link>

          {/* Center links */}
          <nav className="hidden lg:flex items-center gap-8 editorial-nav" aria-label="Primary">
            {LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `editorial-nav__link ${isActive ? 'is-active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="hidden lg:flex items-center gap-5">
            <LanguageSwitcher />
            <PillButton variant="primary" onClick={() => openModal()} showArrow>
              Book a call
            </PillButton>
          </div>

          {/* Mobile burger */}
          <button
            className="lg:hidden inline-flex items-center justify-center w-10 h-10"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span className="relative w-5 h-4 inline-block">
              <span className={`absolute left-0 right-0 h-px bg-current transition-all ${open ? 'top-2 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 right-0 top-2 h-px bg-current transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 right-0 h-px bg-current transition-all ${open ? 'top-2 -rotate-45' : 'top-4'}`} />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden bg-canvas transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full justify-center px-8 gap-2">
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `font-display text-5xl font-bold tracking-tight transition-colors ${
                  isActive ? 'text-ink' : 'text-ink-dim hover:text-ink'
                }`
              }
              style={{ letterSpacing: '-0.035em', lineHeight: 1.0 }}
            >
              {label}
            </NavLink>
          ))}
          <div className="mt-10 flex flex-col gap-3 items-start">
            <PillButton variant="primary" onClick={() => { openModal(); setOpen(false) }}>
              Book a call
            </PillButton>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </>
  )
}
