import { useState, useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import PageHero from '@/components/ui/PageHero'
import PillButton from '@/components/ui/PillButton'
import { fetchServiceBySlug, fetchServices, getServiceBySlug, SERVICES_DATA, type ServiceData } from './data'
import Seo from '@/components/Seo'
import { useQuoteModal } from '@/contexts/QuoteModalContext'
import { Loader2 } from 'lucide-react'

export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>()
  const [playingId, setPlayingId] = useState<string | null>(null)
  const { openModal } = useQuoteModal()

  // Seed with synchronous fallback so the first paint is never empty.
  const initial = getServiceBySlug(slug ?? '')
  const [service, setService] = useState<ServiceData | undefined>(initial)
  const [otherServices, setOtherServices] = useState<ServiceData[]>(
    SERVICES_DATA.filter(s => s.slug !== slug).slice(0, 4),
  )
  const [resolving, setResolving] = useState(!initial)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    fetchServiceBySlug(slug).then(s => {
      if (cancelled) return
      setService(s)
      setResolving(false)
    })
    fetchServices().then(all => {
      if (cancelled) return
      setOtherServices(all.filter(s => s.slug !== slug).slice(0, 4))
    })
    return () => { cancelled = true }
  }, [slug])

  if (resolving) return (
    <div className="pt-36 pb-20 px-6 lg:px-12 bg-canvas flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-ink-faint" />
    </div>
  )
  if (!service) return <Navigate to="/services" replace />

  return (
    <>
      <Seo
        title={`${service.label} | Video Production Services`}
        description={service.heroDesc}
        canonicalPath={`/services/${service.slug}`}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://imbaproduction.com/' },
              { '@type': 'ListItem', 'position': 2, 'name': 'Services', 'item': 'https://imbaproduction.com/services' },
              { '@type': 'ListItem', 'position': 3, 'name': service.label, 'item': `https://imbaproduction.com/services/${service.slug}` },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            'name': service.label,
            'serviceType': service.label,
            'description': service.heroDesc,
            'url': `https://imbaproduction.com/services/${service.slug}`,
            'provider': { '@type': 'Organization', 'name': 'Imba Production', 'url': 'https://imbaproduction.com' },
          },
          ...(service.portfolio.length > 0 ? [{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            'itemListElement': service.portfolio.map((p, i) => ({
              '@type': 'ListItem',
              'position': i + 1,
              'item': {
                '@type': 'VideoObject',
                'name': p.title,
                'description': `${p.title} — produced by Imba Production for ${p.client}.`,
                'thumbnailUrl': `https://img.youtube.com/vi/${p.youtube_id}/maxresdefault.jpg`,
                'embedUrl': `https://www.youtube.com/embed/${p.youtube_id}`,
                'uploadDate': '2024-01-01',
                'contentUrl': `https://www.youtube.com/watch?v=${p.youtube_id}`,
                'publisher': { '@type': 'Organization', 'name': 'Imba Production' },
              },
            })),
          }] : []),
          ...(service.faq.length > 0 ? [{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': service.faq.map(item => ({
              '@type': 'Question',
              'name': item.q,
              'acceptedAnswer': { '@type': 'Answer', 'text': item.a },
            })),
          }] : []),
        ]}
      />
      {/* ── HERO ───────────────────────────────────────────── */}
      <PageHero
        eyebrow={service.label}
        title={service.tagline.includes(' — ') ? service.tagline.split(' — ')[0] : service.tagline}
        titleAccent={service.tagline.includes(' — ') ? service.tagline.split(' — ')[1] : undefined}
        subtitle={service.heroDesc}
        
        actions={
          <>
            <PillButton variant="primary" to="/contact">Book a strategy call</PillButton>
            <PillButton variant="default" to="/work">See the reel</PillButton>
          </>
        }
        rightSlot={
          <div className="grid grid-cols-2 gap-2">
            {service.stats.map(({ num, label }) => (
              <div key={label} className="bg-surface border border-hairline rounded-2xl p-5">
                <div className="display-md text-paper" style={{ fontSize: '2rem' }}>{num}</div>
                <div className="font-mono-custom text-[0.6rem] tracking-[0.14em] uppercase text-paper-dim leading-snug mt-2">{label}</div>
              </div>
            ))}
          </div>
        }
      />

      {/* Breadcrumb strip */}
      <div className="bg-ground border-y border-hairline px-6 lg:px-10 py-4">
        <nav className="max-w-screen-2xl mx-auto flex items-center gap-2 font-mono-custom text-[0.62rem] tracking-widest uppercase">
          <Link to="/services" className="text-paper-faint hover:text-paper transition-colors">Services</Link>
          <span className="text-paper-faint/40">→</span>
          <span className="text-paper-dim">{service.label}</span>
        </nav>
      </div>

      {/* ── WHAT WE CREATE ─────────────────────────────────── */}
      <section className="bg-canvas py-24 px-6 lg:px-12">
        <div className="max-w-screen-xl mx-auto">
          <p className="eyebrow mb-4 reveal">What we create</p>
          <h2 className="font-display font-bold leading-tight mb-14 reveal reveal-delay-1"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}>
            Everything included in<br />
            <em className="italic">{service.label}</em>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {service.features.map(({ title, desc }, i) => (
              <div key={title}
                className="bg-canvas p-8 hover:bg-canvas transition-colors reveal"
                style={{ transitionDelay: `${i * 50}ms` }}>
                <div className="w-1.5 h-1.5 rounded-full mb-5" style={{ background: service.color }} />
                <h3 className="font-display font-bold text-smoke text-xl mb-3">{title}</h3>
                <p className="text-ink-dim text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-canvas">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="eyebrow mb-4 reveal">How it works</p>
            <h2 className="font-display font-bold leading-tight mb-12 reveal reveal-delay-1"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}>
              From brief<br /><em className="italic">to final delivery</em>
            </h2>
            {service.process.map(({ n, title, desc }, i) => (
              <div key={n}
                className="flex gap-5 py-6 border-b border-hairline group hover:pl-3 transition-all duration-300 reveal"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="font-mono-custom text-[0.7rem] mt-1 min-w-[2rem] opacity-70" style={{ color: service.color }}>{n}</span>
                <div>
                  <h3 className="font-display text-xl text-smoke mb-1.5 group-hover:text-ember transition-colors">{title}</h3>
                  <p className="text-sm text-ink-dim leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA side panel */}
          <div className="reveal reveal-delay-2 lg:pt-16">
            <div className="bg-canvas border border-hairline p-8 sticky top-24">
              <p className="font-mono-custom text-[0.62rem] tracking-[0.18em] uppercase mb-3" style={{ color: service.color }}>
                Ready to start?
              </p>
              <h3 className="font-display font-bold text-smoke leading-tight mb-5"
                style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)' }}>
                Free quote,<br />24-hour reply
              </h3>
              <p className="text-ink-dim text-sm leading-relaxed mb-7">
                Tell us about your project and we'll come back with a full quote, timeline, and creative approach — at no cost and with no obligation.
              </p>
              <Link to="/contact" className="btn btn-primary w-full text-center block mb-4">
                Get a free quote
              </Link>
              <Link to="/work" className="btn btn-ghost w-full text-center block">
                See our portfolio →
              </Link>
              <div className="mt-8 pt-6 border-t border-hairline">
                <p className="font-mono-custom text-[0.58rem] tracking-wider uppercase text-ink-faint/40 mb-3">We also offer</p>
                <ul className="space-y-2">
                  {['Free creative consultation', 'Detailed production timeline', 'Itemised cost breakdown', '48h rush turnaround available'].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: service.color }} />
                      <span className="font-mono-custom text-[0.6rem] text-ink-dim tracking-wide">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO ──────────────────────────────────────── */}
      {service.portfolio.length > 0 && (
        <section className="bg-canvas py-24 px-6 lg:px-12 border-t border-hairline">
          <div className="max-w-screen-xl mx-auto">
            <p className="eyebrow mb-4 reveal">Real work</p>
            <h2 className="font-display font-bold leading-tight mb-12 reveal reveal-delay-1"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}>
              {service.label} <em className="italic">in action</em>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.portfolio.map((item, i) => (
                <div
                  key={item.youtube_id}
                  className="group relative aspect-video cursor-pointer overflow-hidden bg-canvas reveal"
                  style={{ transitionDelay: `${i * 80}ms` }}
                  onClick={() => setPlayingId(item.youtube_id)}
                >
                  <img
                    src={`https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg`}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={e => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg` }}
                  />
                  <div className="absolute inset-0 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.2) 50%, transparent 100%)' }}
                  />
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center"
                      style={{ background: `${service.color}30`, backdropFilter: 'blur(4px)' }}>
                      <div style={{ borderLeft: '16px solid rgba(255,255,255,0.9)', borderTop: '10px solid transparent', borderBottom: '10px solid transparent', marginLeft: '4px' }} />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="font-mono-custom text-[0.55rem] tracking-[0.18em] uppercase mb-1" style={{ color: service.color }}>
                      {item.client}
                    </div>
                    <div className="font-display font-bold text-smoke text-lg leading-tight">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/work" className="btn btn-ghost">View all work →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── SHORTS / SOCIAL CLIPS ──────────────────────────── */}
      {service.shorts && service.shorts.length > 0 && (
        <section className="py-20 px-6 lg:px-12 bg-canvas border-t border-hairline">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="eyebrow mb-4 reveal">Scroll-stopping content</p>
                <h2 className="font-display font-bold leading-tight reveal reveal-delay-1"
                  style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}>
                  Cooking <em style={{ color: service.color, fontStyle: 'italic' }}>Shorts</em> & Reels
                </h2>
              </div>
              <span className="hidden lg:flex items-center gap-2 font-mono-custom text-[0.6rem] tracking-widest uppercase opacity-40 reveal">
                Vertical · 9:16 · TikTok / Reels / Shorts
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {service.shorts.map((short, i) => (
                <div
                  key={short.youtube_id}
                  className="relative group cursor-pointer overflow-hidden reveal"
                  style={{ aspectRatio: '9/16', transitionDelay: `${i * 60}ms` }}
                  onClick={() => setPlayingId(short.youtube_id)}
                >
                  <img
                    src={`https://img.youtube.com/vi/${short.youtube_id}/maxresdefault.jpg`}
                    alt={short.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${short.youtube_id}/hqdefault.jpg` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {/* Play */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border border-white/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100"
                      style={{ borderColor: `${service.color}80` }}>
                      <div style={{ borderLeft: `12px solid ${service.color}`, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', marginLeft: '3px' }} />
                    </div>
                  </div>
                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-mono-custom text-[0.55rem] tracking-wider text-white/70 uppercase">{short.title}</p>
                  </div>
                  {/* Short badge */}
                  <div className="absolute top-2 left-2 font-mono-custom text-[0.5rem] tracking-widest uppercase px-1.5 py-0.5"
                    style={{ background: `${service.color}22`, color: service.color, border: `1px solid ${service.color}44` }}>
                    Short
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-canvas">
        <div className="max-w-screen-xl mx-auto max-w-3xl">
          <p className="eyebrow mb-4 reveal">Common questions</p>
          <h2 className="font-display font-bold leading-tight mb-12 reveal reveal-delay-1"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}>
            Everything you need<br /><em className="italic">to know</em>
          </h2>
          <div className="space-y-0">
            {service.faq.map(({ q, a }, i) => (
              <div key={q}
                className="border-b border-hairline py-7 reveal"
                style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="flex gap-5">
                  <span className="font-mono-custom text-[0.65rem] opacity-50 mt-1 min-w-[1.5rem] flex-shrink-0" style={{ color: service.color }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-smoke text-xl mb-3">{q}</h3>
                    <p className="text-ink-dim text-sm leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OTHER SERVICES ─────────────────────────────────── */}
      <section className="bg-canvas py-20 px-6 lg:px-12 border-t border-hairline">
        <div className="max-w-screen-xl mx-auto">
          <p className="eyebrow mb-4 reveal">Explore more</p>
          <h2 className="font-display font-bold text-smoke mb-10 reveal reveal-delay-1"
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
            Other <em className="italic">services</em>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
            {otherServices.map((s, i) => (
              <Link key={s.slug} to={`/services/${s.slug}`}
                className="group bg-canvas p-6 hover:bg-canvas transition-colors reveal"
                style={{ transitionDelay: `${i * 50}ms` }}>
                <div className="w-8 h-8 border flex items-center justify-center mb-4 text-sm transition-colors"
                  style={{ borderColor: `${s.color}40`, color: s.color }}>
                  {s.icon}
                </div>
                <h3 className="font-display font-bold text-smoke text-lg leading-snug mb-2 group-hover:text-ember transition-colors">{s.label}</h3>
                <p className="font-mono-custom text-[0.58rem] tracking-wider uppercase" style={{ color: s.color }}>{s.tagline.split(' — ')[0]}</p>
                <div className="mt-4 font-mono-custom text-[0.62rem] tracking-[0.12em] uppercase text-ink-faint group-hover:text-smoke transition-colors">
                  Learn more →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ───────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: service.color }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 8px)',
        }} />
        <div className="relative px-6 lg:px-12 py-20 max-w-screen-xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h2 className="font-display font-bold leading-tight text-ink"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)' }}>
              Ready to create<br /><em>something extraordinary?</em>
            </h2>
            <p className="text-ink/60 mt-3" style={{ fontSize: '0.95rem' }}>
              Free consultation · Free estimate · Reply within 24 hours.
            </p>
          </div>
          <button
            onClick={() => openModal(service.label)}
            className="flex-shrink-0 font-mono-custom text-[0.7rem] tracking-[0.14em] uppercase px-8 py-4 cursor-pointer"
            style={{ background: '#0A0A0A', color: '#FAFAFA', border: 'none' }}>
            Get a free quote
          </button>
        </div>
      </section>

      {/* ── VIDEO MODAL ────────────────────────────────────── */}
      {playingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-16"
          style={{ background: 'rgba(0,0,0,0.97)' }}
          onClick={() => setPlayingId(null)}
        >
          <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPlayingId(null)}
              className="absolute -top-10 right-0 font-mono-custom text-[0.65rem] tracking-widest uppercase text-ink-faint hover:text-smoke transition-colors"
            >
              Close ✕
            </button>
            <div className="absolute -top-px -left-px w-5 h-5 border-t border-l border-ember/50" />
            <div className="absolute -top-px -right-px w-5 h-5 border-t border-r border-ember/50" />
            <div className="absolute -bottom-px -left-px w-5 h-5 border-b border-l border-ember/50" />
            <div className="absolute -bottom-px -right-px w-5 h-5 border-b border-r border-ember/50" />
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${playingId}?autoplay=1&controls=1&rel=0&modestbranding=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
