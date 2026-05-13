import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useQuoteModal } from '@/contexts/QuoteModalContext'
import PillButton from '@/components/ui/PillButton'

const LINKS = [
  { to: '/work',     label: 'Work' },
  { to: '/services', label: 'Services' },
  { to: '/about',    label: 'Studio' },
  { to: '/blog',     label: 'Blog' },
  { to: '/contact',  label: 'Contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { openModal } = useQuoteModal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-3' : 'py-5'
        }`}
      >
        <div className="px-6 lg:px-10 flex items-center justify-between gap-4">

          {/* Logo — left */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 group flex-shrink-0"
            aria-label="Imba Production — home"
          >
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/[0.04] border border-white/10 group-hover:bg-white/[0.08] transition-colors">
              <span className="font-display font-bold text-base text-paper">
                i<span className="text-ember">.</span>
              </span>
            </span>
            <span className="hidden sm:inline font-display text-base font-semibold tracking-tight text-paper">
              imba
            </span>
          </Link>

          {/* Center floating pill nav — desktop only */}
          <nav className="hidden lg:block pill-nav" aria-label="Primary">
            {LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `pill-nav__link ${isActive ? 'is-active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster — language + Get in Touch */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <LanguageSwitcher />
            <PillButton variant="primary" onClick={() => openModal()}>
              Get in Touch
            </PillButton>
          </div>

          {/* Mobile burger */}
          <button
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-surface/60 backdrop-blur"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span className="relative w-5 h-4 inline-block">
              <span className={`absolute left-0 right-0 h-px bg-paper transition-all ${open ? 'top-2 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 right-0 top-2 h-px bg-paper transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 right-0 h-px bg-paper transition-all ${open ? 'top-2 -rotate-45' : 'top-4'}`} />
            </span>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex flex-col h-full justify-center px-8 gap-2">
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `font-display text-4xl font-semibold tracking-tight transition-colors ${
                  isActive ? 'text-paper' : 'text-paper-dim hover:text-paper'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="mt-10 flex flex-col gap-3 items-start">
            <PillButton
              variant="primary"
              onClick={() => { openModal(); setOpen(false) }}
            >
              Get in Touch
            </PillButton>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </>
  )
}
