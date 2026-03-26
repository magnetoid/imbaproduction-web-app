import Seo from '@/components/Seo'
import { useQuoteModal } from '@/contexts/QuoteModalContext'

const REVIEWS = [
  {
    name: 'Predrag Kozica',
    role: '',
    company: 'Kozica Soaps',
    initial: 'PK',
    color: '#3CBFAE',
    text: 'Imba Productions exceeded our expectations with their professionalism and creativity. They crafted a stunning corporate video that perfectly encapsulated our company\'s values and goals. The final product was incredibly polished, and we\'ve received countless compliments from clients and partners. We highly recommend Imba Production to anyone seeking high-quality video production services!',
  },
  {
    name: 'Bojan Ilić',
    role: 'CEO',
    company: 'Massive Movie Horse',
    initial: 'BI',
    color: '#C9A96E',
    text: 'Great cooperation with Ljubica and imba team. They provided us with great feedback and guided us through the entire process of creating our Videos. The end result is awesome and they continue to provide us with support whenever we need it. It was a pleasure working with Imba production, and Ljubica was very helpful throughout the whole development journey. Her expertise gave us confidence.',
  },
  {
    name: 'Dragan Dragovic',
    role: 'Developer & SEO Expert',
    company: 'Ogitive',
    initial: 'DD',
    color: '#6C7AE0',
    text: 'I loved working with imba production, initially, there was our help in equipping a full e-commerce shop. With full product images and product videos for advertising and website embedding. But SEO video embedding helped us to grow fast using video rich snippets.',
  },
]

export default function Reviews() {
  const { openModal } = useQuoteModal()

  return (
    <>
      <Seo
        title="Client Reviews — Video Production Testimonials"
        description="Real reviews from brands who worked with Imba Production. See what Kozica Soaps, Massive Movie Horse, Ogitive and others say about our video production work."
        canonicalPath="/reviews"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'name': 'Imba Production Client Reviews',
          'itemListElement': REVIEWS.map((r, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'item': {
              '@type': 'Review',
              'author': { '@type': 'Person', 'name': r.name },
              'reviewBody': r.text,
              'itemReviewed': {
                '@type': 'Organization',
                'name': 'Imba Production',
                'url': 'https://imbaproduction.com',
              },
            },
          })),
        }}
      />

      {/* ── HERO ── */}
      <section className="pt-36 pb-20 px-6 lg:px-12 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />
        <div className="absolute bottom-0 left-0 w-[60vw] h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 0% 100%, rgba(0,212,255,0.04) 0%, transparent 65%)' }}
        />
        <div className="relative max-w-screen-xl mx-auto">
          <p className="eyebrow mb-5 reveal">What clients say</p>
          <h1 className="font-display font-light leading-tight mb-6 reveal reveal-delay-1"
            style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}>
            Real results,<br />
            <em className="text-gold italic">real clients.</em>
          </h1>
          <p className="text-smoke-dim leading-relaxed max-w-lg reveal reveal-delay-2" style={{ fontSize: '0.95rem' }}>
            Every project is a partnership. Here's what the brands we've worked with have to say about the experience and results.
          </p>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="py-24 px-6 lg:px-12 bg-ink-2">
        <div className="max-w-screen-lg mx-auto flex flex-col gap-8">
          {REVIEWS.map((r, i) => (
            <article
              key={r.name}
              className="hud-card border border-white/8 bg-ink p-8 lg:p-12 reveal"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Quote mark */}
              <div className="font-display text-[5rem] leading-none font-light mb-2 select-none"
                style={{ color: r.color, opacity: 0.25 }}>
                "
              </div>

              <blockquote className="font-display font-light text-smoke leading-relaxed mb-8"
                style={{ fontSize: 'clamp(1.15rem, 2vw, 1.5rem)' }}>
                {r.text}
              </blockquote>

              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 flex items-center justify-center font-mono-custom text-sm font-medium flex-shrink-0"
                  style={{ background: `${r.color}18`, border: `1px solid ${r.color}40`, color: r.color }}>
                  {r.initial}
                </div>
                <div>
                  <p className="text-smoke font-medium text-sm">{r.name}</p>
                  <p className="text-smoke-faint text-xs mt-0.5">
                    {r.role ? `${r.role} · ` : ''}{r.company}
                  </p>
                </div>

                {/* Decorative line */}
                <div className="flex-1 hidden sm:block">
                  <div className="h-px" style={{ background: `linear-gradient(90deg, ${r.color}30, transparent)` }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 lg:px-12 bg-ink border-t border-white/5">
        <div className="max-w-screen-xl mx-auto text-center">
          <p className="eyebrow justify-center mb-5 reveal">Ready to work together?</p>
          <h2 className="font-display font-light leading-tight mb-8 reveal reveal-delay-1"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            Join our clients.<br />
            <em className="text-ember italic">Get results like these.</em>
          </h2>
          <button onClick={() => openModal()} className="btn btn-primary reveal reveal-delay-2">
            Start a project →
          </button>
        </div>
      </section>
    </>
  )
}
