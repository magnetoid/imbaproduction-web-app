import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Testimonial } from '@/lib/supabase'
import Seo from '@/components/Seo'
import PageHero from '@/components/ui/PageHero'
import { useQuoteModal } from '@/contexts/QuoteModalContext'

// Accent colors cycled per card
const COLORS = ['#3CBFAE', '#FAFAFA', '#6C7AE0', '#E8E3D6', '#E07A6C']

// Fallback reviews shown when DB is empty
const FALLBACK: Testimonial[] = [
  {
    id: 'f1',
    client_name: 'Predrag Kozica',
    client_role: undefined,
    client_company: 'Kozica Soaps',
    client_avatar_url: undefined,
    text: 'Imba Productions exceeded our expectations with their professionalism and creativity. They crafted a stunning corporate video that perfectly encapsulated our company\'s values and goals. The final product was incredibly polished, and we\'ve received countless compliments from clients and partners. We highly recommend Imba Production to anyone seeking high-quality video production services!',
    rating: 5,
    featured: true,
    published: true,
  },
  {
    id: 'f2',
    client_name: 'Bojan Ilić',
    client_role: 'CEO',
    client_company: 'Massive Movie Horse',
    client_avatar_url: undefined,
    text: 'Great cooperation with Ljubica and imba team. They provided us with great feedback and guided us through the entire process of creating our Videos. The end result is awesome and they continue to provide us with support whenever we need it. It was a pleasure working with Imba production, and Ljubica was very helpful throughout the whole development journey. Her expertise gave us confidence.',
    rating: 5,
    featured: true,
    published: true,
  },
  {
    id: 'f3',
    client_name: 'Dragan Dragovic',
    client_role: 'Developer & SEO Expert',
    client_company: 'Ogitive',
    client_avatar_url: undefined,
    text: 'I loved working with imba production, initially, there was our help in equipping a full e-commerce shop. With full product images and product videos for advertising and website embedding. But SEO video embedding helped us to grow fast using video rich snippets.',
    rating: 5,
    featured: false,
    published: true,
  },
]

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 mb-6">
      {[1,2,3,4,5].map(n => (
        <svg key={n} width="14" height="14" viewBox="0 0 24 24" fill={n <= rating ? '#FAFAFA' : 'none'}
          stroke={n <= rating ? '#FAFAFA' : 'rgba(255,255,255,0.2)'} strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  )
}

export default function Reviews() {
  const { openModal } = useQuoteModal()
  const [reviews, setReviews] = useState<Testimonial[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews(data && data.length > 0 ? (data as Testimonial[]) : FALLBACK)
        setLoaded(true)
      })
  }, [])

  const display = loaded ? reviews : FALLBACK

  return (
    <>
      <Seo
        title="Client Reviews — Video Production Testimonials"
        description="Real reviews from brands who worked with Imba Production. See what clients say about our cinematic video production work."
        canonicalPath="/reviews"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'name': 'Imba Production Client Reviews',
          'itemListElement': display.map((r, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'item': {
              '@type': 'Review',
              'author': { '@type': 'Person', 'name': r.client_name },
              'reviewBody': r.text,
              'reviewRating': r.rating ? { '@type': 'Rating', 'ratingValue': r.rating, 'bestRating': 5 } : undefined,
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
      <PageHero
        eyebrow="Client voice"
        title="What it's like to ship video"
        titleAccent="with Imba."
        subtitle="12 years of partnerships across SaaS, ecommerce, food, fashion and creative tech. Real results from named clients."
        
      />

      {/* ── REVIEWS ── */}
      <section className="py-24 px-6 lg:px-12 bg-canvas">
        <div className="max-w-screen-lg mx-auto flex flex-col gap-8">
          {display.map((r, i) => {
            const color = COLORS[i % COLORS.length]
            const initial = initials(r.client_name)
            return (
              <article
                key={r.id}
                className="hud-card border border-hairline bg-canvas p-8 lg:p-12 reveal"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Quote mark */}
                <div className="font-display text-[5rem] leading-none font-light mb-2 select-none"
                  style={{ color, opacity: 0.25 }}>
                  "
                </div>

                {r.rating && <StarRow rating={r.rating} />}

                <blockquote className="font-display font-bold text-smoke leading-relaxed mb-8"
                  style={{ fontSize: 'clamp(1.15rem, 2vw, 1.5rem)' }}>
                  {r.text}
                </blockquote>

                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {r.client_avatar_url ? (
                    <img src={r.client_avatar_url} alt={r.client_name}
                      className="w-12 h-12 rounded-sm object-cover flex-shrink-0"
                      style={{ border: `1px solid ${color}40` }} />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center font-mono-custom text-sm font-medium flex-shrink-0"
                      style={{ background: `${color}18`, border: `1px solid ${color}40`, color }}>
                      {initial}
                    </div>
                  )}
                  <div>
                    <p className="text-smoke font-medium text-sm">{r.client_name}</p>
                    <p className="text-ink-faint text-xs mt-0.5">
                      {r.client_role ? `${r.client_role} · ` : ''}{r.client_company}
                    </p>
                  </div>

                  {/* Decorative line */}
                  <div className="flex-1 hidden sm:block">
                    <div className="h-px" style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }} />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 lg:px-12 bg-canvas border-t border-hairline">
        <div className="max-w-screen-xl mx-auto text-center">
          <p className="eyebrow justify-center mb-5 reveal">Ready to work together?</p>
          <h2 className="font-display font-bold leading-tight mb-8 reveal reveal-delay-1"
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
