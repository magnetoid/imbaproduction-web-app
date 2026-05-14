import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PortfolioItem, Testimonial, HeroVideo } from '@/lib/supabase'
import Seo from '@/components/Seo'
import PillButton from '@/components/ui/PillButton'
import PillBadge from '@/components/ui/PillBadge'
import ClientLogoStrip from '@/components/ui/ClientLogoStrip'

// ── Static fallback data ──────────────────────────────────────────

const DEMO_PORTFOLIO: PortfolioItem[] = [
  { id:'1', title:'Cooking Heritage Campaign', slug:'cooking',   category:'brand', client_name:'FoodCo',          featured:true,  published:true, sort_order:0, created_at:'', description:'', youtube_id:'rzfWrv3ERxk', results:{ views:'4.2M', ctr:'↑38%' } },
  { id:'2', title:'Gen AI Campaign',           slug:'fashion',   category:'ai',    client_name:'NordShop',        featured:false, published:true, sort_order:1, created_at:'', description:'', youtube_id:'9k5w1iG_JHM' },
  { id:'3', title:'Perfume Brand Film',        slug:'perfume',   category:'brand', client_name:'Fragrance Brand', featured:false, published:true, sort_order:2, created_at:'', description:'', youtube_id:'SgHHbWp64cE' },
  { id:'4', title:'Creature VFX Reel',         slug:'ecomm',     category:'post',  client_name:'Velour Boutique', featured:false, published:true, sort_order:3, created_at:'', description:'', youtube_id:'EZUJiL9MeLw' },
  { id:'5', title:'Brand Film',                slug:'social',    category:'brand', client_name:'BrandX',          featured:false, published:true, sort_order:4, created_at:'', description:'', youtube_id:'HAHj0TDQZcg', results:{ views:'12M' } },
]

const DEMO_TESTIMONIALS: Testimonial[] = [
  { id:'1', client_name:'Sarah Andersen', client_role:'CMO',          client_company:'FoodCo International', text:'Imba transformed how we present our brand. The cooking series generated 3× more traffic than any previous content.', featured:true,  published:true },
  { id:'2', client_name:'Marco Kessler',  client_role:'Growth Lead',  client_company:'NordShop',             text:'The AI video campaign was something we had never seen. Personalisation at scale reduced our cost-per-acquisition by 40%.',  featured:false, published:true },
  { id:'3', client_name:'Julia Larsson',  client_role:'Founder',      client_company:'Velour Boutique',      text:'Professional, fast, genuinely creative. Full product video suite in 48 hours. The team is exceptional.', featured:false, published:true },
]

const SERVICES: { key: string; label: string; desc: string; href: string }[] = [
  { key:'brand',   label:'Brand & Commercial', desc:'Brand films, product launches and broadcast spots that lift engagement 80% above static ads.', href:'/services/brand-video' },
  { key:'ai',      label:'AI-Powered Video',   desc:'Sora, Runway and Veo through our pipeline. Hundreds of personalised variants from one shoot.',  href:'/services/ai-video' },
  { key:'product', label:'Product & Ecommerce',desc:'Conversion-focused product video for Amazon, Shopify and Meta. Stop the scroll. Win the checkout.', href:'/services/product-video' },
  { key:'social',  label:'Short & Social',     desc:'Vertical-native TikTok, Reels and Shorts. No repurposed landscape — engineered for the algorithm.', href:'/services/social-video' },
  { key:'post',    label:'Post Production',    desc:'Edit, colour, motion, sound and VFX — all in-house. 48-hour rush when launch dates are not suggestions.', href:'/services/post-production' },
  { key:'cooking', label:'Cooking & Food',     desc:'Culinary cinematography for restaurants, recipe creators and food brands. Styling included.', href:'/services/cooking-video' },
]

const STATS = [
  { num: '12+',  label:'Years in production' },
  { num: '500+', label:'Brands served' },
  { num: '48h',  label:'Rush turnaround' },
  { num: '98%',  label:'Client satisfaction' },
]

const DEMO_HERO_VIDEOS: HeroVideo[] = [
  { id: '1', youtube_id: 'HAHj0TDQZcg', title: 'Brand films', sort_order: 0, active: true, created_at: '',
    slide_eyebrow: 'Imba Production · Est. 2012',
    slide_headline: 'The video studio premium brands trust',
    slide_headline_em: 'to ship work that sells.',
    slide_subheadline: '12 years, 500+ brands, two continents — brand films, AI video, product, social and post-production.',
    slide_primary_cta_label: 'Book a strategy call',
    slide_primary_cta_href: '/contact',
    slide_secondary_cta_label: 'See the reel',
    slide_secondary_cta_href: '/work' },
  { id: '2', youtube_id: '9k5w1iG_JHM', title: 'AI video', sort_order: 1, active: true, created_at: '',
    slide_eyebrow: 'AI-Augmented Production',
    slide_headline: 'Generative video, directed by humans.',
    slide_headline_em: 'Shipped in days.',
    slide_subheadline: 'Sora, Runway and Veo through our pipeline. Hundreds of personalised variants from one shoot.',
    slide_primary_cta_label: 'Book a strategy call',
    slide_primary_cta_href: '/contact',
    slide_secondary_cta_label: 'See the reel',
    slide_secondary_cta_href: '/work' },
  { id: '3', youtube_id: 'EZUJiL9MeLw', title: 'Post + VFX', sort_order: 2, active: true, created_at: '',
    slide_eyebrow: 'Post Production & VFX',
    slide_headline: 'Send the footage.',
    slide_headline_em: 'Get back work that performs.',
    slide_subheadline: 'Edit, colour, motion, sound and VFX in-house. 48-hour rush available.',
    slide_primary_cta_label: 'Book a strategy call',
    slide_primary_cta_href: '/contact',
    slide_secondary_cta_label: 'See the reel',
    slide_secondary_cta_href: '/work' },
  { id: '4', youtube_id: 'PHxMQ6FSiks', title: 'Product + social', sort_order: 3, active: true, created_at: '',
    slide_eyebrow: 'Product & Social',
    slide_headline: 'Make the scroll stop.',
    slide_headline_em: 'Make the checkout work.',
    slide_subheadline: 'Vertical-native product and social video engineered for Meta, TikTok and Amazon.',
    slide_primary_cta_label: 'Book a strategy call',
    slide_primary_cta_href: '/contact',
    slide_secondary_cta_label: 'See the reel',
    slide_secondary_cta_href: '/work' },
]

export default function Home() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEMO_PORTFOLIO)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEMO_TESTIMONIALS)
  const [heroVideos, setHeroVideos] = useState<HeroVideo[]>(DEMO_HERO_VIDEOS)
  const [currentVideo, setCurrentVideo] = useState(0)
  const [playingVideo, setPlayingVideo] = useState(false)
  const [hoveredService, setHoveredService] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('portfolio_items').select('*').eq('published', true).eq('homepage_featured', true).order('sort_order')
      .then(({ data: featured }) => {
        if (featured?.length) setPortfolio(featured)
        else {
          supabase.from('portfolio_items').select('*').eq('published', true).order('sort_order').limit(5)
            .then(({ data }) => { if (data?.length) setPortfolio(data) })
        }
      })
    supabase.from('testimonials').select('*').eq('published', true)
      .then(({ data }) => { if (data?.length) setTestimonials(data) })
    supabase.from('hero_videos').select('*').eq('active', true).order('sort_order')
      .then(({ data }) => { if (data?.length) setHeroVideos(data) })
  }, [])

  useEffect(() => {
    if (heroVideos.length <= 1 || playingVideo) return
    const timer = setInterval(() => setCurrentVideo(i => (i + 1) % heroVideos.length), 11000)
    return () => clearInterval(timer)
  }, [heroVideos.length, playingVideo])

  const currentSlide = heroVideos[currentVideo]

  return (
    <>
      <Seo
        title="Cinematic Video Production for Brands"
        description="A premium video studio for brands that ship. AI video, brand films, product, social and post-production. 12 years, 500+ brands."
        canonicalPath="/"
        structuredData={[
          { '@context': 'https://schema.org', '@type': 'WebSite', 'name': 'Imba Production', 'url': 'https://imbaproduction.com' },
          { '@context': 'https://schema.org', '@type': 'Organization', 'name': 'Imba Production', 'url': 'https://imbaproduction.com',
            'logo': 'https://imbaproduction.com/og-default.jpg',
            'address': { '@type': 'PostalAddress', 'streetAddress': '007 N Orange St, 4th Floor, Suite #3601', 'addressLocality': 'Wilmington', 'addressRegion': 'DE', 'postalCode': '19801', 'addressCountry': 'US' },
            'contactPoint': { '@type': 'ContactPoint', 'email': 'hello@imbaproduction.com', 'contactType': 'customer service' },
            'sameAs': [
              'https://www.instagram.com/imbaproduction',
              'https://www.youtube.com/channel/UCV4zBHquBoo4NLw0tMi2ZKQ',
              'https://www.tiktok.com/@imbaproduction',
              'https://www.linkedin.com/company/imba-production',
              'https://twitter.com/productionimba',
            ] },
        ]}
      />

      {/* ── HERO — CINEMA PANEL ────────────────────────── */}
      <section className="cinema-panel relative min-h-screen flex flex-col justify-end overflow-hidden">

        {/* Slide thumbnails — full-bleed behind */}
        <div className="absolute inset-0 z-0">
          {heroVideos.map((video, i) => (
            <div
              key={video.id}
              className="absolute inset-0 overflow-hidden"
              style={{ opacity: i === currentVideo ? 1 : 0, transition: 'opacity 1.6s ease' }}
            >
              <img
                src={video.slide_image_url || `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: i === currentVideo && playingVideo ? 0 : 0.85, transition: 'opacity 0.5s ease' }}
                onError={e => {
                  const el = e.target as HTMLImageElement
                  el.src = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`
                }}
              />
              {i === currentVideo && playingVideo && (
                <iframe
                  key={`${video.youtube_id}-play`}
                  src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&mute=0&loop=1&playlist=${video.youtube_id}&controls=1&rel=0&iv_load_policy=3&modestbranding=1`}
                  style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'max(100%, calc(100vh * 1.7778))',
                    height: 'max(100%, calc(100vw * 0.5625))',
                    border: 'none',
                  }}
                  allow="autoplay; encrypted-media; fullscreen"
                />
              )}
            </div>
          ))}
        </div>

        {/* Single vignette darkening for text legibility — no decorative glow */}
        <div className="absolute inset-0 pointer-events-none z-[1]" style={{
          background: 'linear-gradient(to top, rgba(14,14,14,0.95) 0%, rgba(14,14,14,0.55) 35%, rgba(14,14,14,0.25) 70%, rgba(14,14,14,0.40) 100%)',
        }} />

        {/* Stop video button */}
        {playingVideo && (
          <button
            onClick={() => setPlayingVideo(false)}
            aria-label="Stop video"
            className="absolute z-[30] top-24 right-6 w-10 h-10 flex items-center justify-center bg-cinema/80 border border-hairline-cinema text-paper-cinema hover:bg-cinema"
          >
            ✕
          </button>
        )}

        {/* Slide content — bottom-left, editorial caption */}
        <div className="relative z-[10] px-6 lg:px-10 pb-20 lg:pb-24 max-w-screen-2xl mx-auto w-full">
          {heroVideos.map((video, i) => (
            <div
              key={video.id}
              className="absolute inset-x-6 lg:inset-x-10 bottom-20 lg:bottom-24 max-w-3xl"
              style={{
                opacity: i === currentVideo ? 1 : 0,
                transform: i === currentVideo ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.8s ease, transform 0.8s ease',
                transitionDelay: i === currentVideo ? '0.4s' : '0s',
                pointerEvents: i === currentVideo ? 'auto' : 'none',
              }}
            >
              <PillBadge>{video.slide_eyebrow || 'Imba Production · Est. 2012'}</PillBadge>

              <h1
                className="editorial-hero text-paper-cinema mt-6"
                style={{ fontSize: 'clamp(2.4rem, 6vw, 5.4rem)' }}
              >
                {video.slide_headline || 'The video studio premium brands trust'}
                {video.slide_headline_em && (
                  <>
                    <br />
                    <span className="text-paper-cinema/65">{video.slide_headline_em}</span>
                  </>
                )}
              </h1>

              {video.slide_subheadline && (
                <p className="text-paper-cinema/75 leading-relaxed mt-6 max-w-xl" style={{ fontSize: '1.05rem' }}>
                  {video.slide_subheadline}
                </p>
              )}

              <div className="flex items-center gap-3 mt-8 flex-wrap">
                <PillButton variant="primary" to={video.slide_primary_cta_href || '/contact'}>
                  {video.slide_primary_cta_label || 'Book a strategy call'}
                </PillButton>
                <PillButton variant="ghost" to={video.slide_secondary_cta_href || '/work'}>
                  {video.slide_secondary_cta_label || 'See the reel'}
                </PillButton>
              </div>
            </div>
          ))}

          {/* Spacer to maintain hero height when content is absolute-positioned */}
          <div className="invisible">
            <PillBadge>placeholder</PillBadge>
            <h1 className="editorial-hero mt-6" style={{ fontSize: 'clamp(2.4rem, 6vw, 5.4rem)' }}>
              Placeholder<br />Placeholder
            </h1>
            <p className="mt-6">Placeholder</p>
            <div className="mt-8 h-12">&nbsp;</div>
          </div>
        </div>

        {/* Slide indicator — bottom-right, single thin line per slide */}
        {heroVideos.length > 1 && (
          <div className="absolute z-[20] bottom-8 right-6 lg:right-10 flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              {heroVideos.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => { setCurrentVideo(i); setPlayingVideo(false) }}
                  aria-label={v.title}
                  className="cursor-pointer transition-all duration-500 border-none p-0"
                  style={{
                    height: '1px',
                    width: i === currentVideo ? '48px' : '14px',
                    background: i === currentVideo ? '#E8E5DE' : 'rgba(232,229,222,0.30)',
                  }}
                />
              ))}
            </div>
            {currentSlide && (
              <span className="font-mono-custom text-[0.6rem] tracking-[0.22em] uppercase text-paper-cinema/55">
                {String(currentVideo + 1).padStart(2, '0')} · {currentSlide.title}
              </span>
            )}
          </div>
        )}
      </section>

      {/* ── STAT STRIP — LIGHT ──────────────────────────── */}
      <section className="bg-canvas border-b border-hairline">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-12 grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
          {STATS.map(({ num, label }, i) => (
            <div key={label} className={`flex flex-col ${i > 0 ? 'lg:border-l lg:border-hairline lg:pl-12' : ''}`}>
              <div className="stat-num text-ink" style={{ fontSize: 'clamp(2rem, 3vw, 2.6rem)' }}>{num}</div>
              <div className="font-mono-custom text-[0.62rem] tracking-[0.22em] uppercase text-ink-dim mt-2">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES — LIGHT, NUMBERED INDEX (TOC) ──────── */}
      <section className="bg-canvas section-py px-6 lg:px-10">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 mb-16">
            <div>
              <PillBadge>Capabilities</PillBadge>
              <h2 className="editorial-h2 text-ink mt-6" style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}>
                One partner. Every video<br />
                <span className="text-ink-dim">you need to ship.</span>
              </h2>
            </div>
            <p className="editorial-lead self-end max-w-lg">
              From brand films to AI campaigns, product to post — built around your KPI, not our equipment list.
            </p>
          </div>

          {/* Magazine TOC */}
          <ul className="flex flex-col">
            {SERVICES.map((s, i) => (
              <li
                key={s.key}
                onMouseEnter={() => setHoveredService(s.key)}
                onMouseLeave={() => setHoveredService(null)}
                className="border-t border-hairline last:border-b group"
              >
                <Link
                  to={s.href}
                  className="grid grid-cols-[40px_1fr_auto_24px] gap-6 items-center py-7 lg:py-9 hover:bg-ink/[0.03] transition-colors duration-300"
                >
                  <span className="font-mono-custom text-[0.7rem] tracking-[0.22em] text-ink-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col lg:flex-row lg:items-baseline lg:gap-6">
                    <h3 className="editorial-h3 text-ink" style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2rem)' }}>
                      {s.label}
                    </h3>
                    <p className="text-ink-dim text-sm lg:text-base max-w-xl mt-2 lg:mt-0">
                      {s.desc}
                    </p>
                  </div>
                  <span className="hidden lg:inline-flex font-mono-custom text-[0.62rem] tracking-[0.22em] uppercase text-ink-dim group-hover:text-ink transition-colors">
                    {hoveredService === s.key ? 'Explore' : 'Service'}
                  </span>
                  <span className="text-ink-dim group-hover:text-ink transition-all duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── SELECTED WORK — CINEMA PANEL ─────────────────── */}
      <section className="cinema-panel section-py px-6 lg:px-10">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-12 mb-12 items-end">
            <div>
              <PillBadge>Selected work</PillBadge>
              <h2 className="editorial-h2 text-paper-cinema mt-6" style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}>
                The reel.
              </h2>
            </div>
            <div className="flex lg:justify-end">
              <PillButton variant="ghost" to="/work">View all work</PillButton>
            </div>
          </div>

          <div className="portfolio-mosaic">
            {portfolio.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                to={`/work#${item.slug}`}
                className="relative overflow-hidden group block bg-cinema-2"
              >
                {item.youtube_id ? (
                  <img
                    src={`https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg`}
                    alt={item.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
                    style={{ filter: 'saturate(0.45) brightness(0.85)' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg` }}
                  />
                ) : null}
                <div
                  className="absolute inset-0 transition-all duration-500 group-hover:opacity-0"
                  style={{ background: 'rgba(14,14,14,0.20)' }}
                />
                <img
                  src={`https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg`}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ filter: 'saturate(1.05)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cinema/85 via-cinema/0 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 lg:p-7">
                  <div className="font-mono-custom text-[0.6rem] tracking-[0.22em] uppercase text-paper-cinema/65 mb-2">
                    {item.client_name}
                  </div>
                  <div className="editorial-h3 text-paper-cinema" style={{ fontSize: '1.25rem' }}>
                    {item.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 pt-12 border-t border-hairline-cinema">
            <ClientLogoStrip variant="cinema" />
          </div>
        </div>
      </section>

      {/* ── ABOUT TEASER — LIGHT ────────────────────────── */}
      <section className="bg-canvas section-py px-6 lg:px-10">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-[2fr_1fr] gap-12 lg:gap-20">
          <div>
            <PillBadge>Studio</PillBadge>
            <h2 className="editorial-h2 text-ink mt-6 mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}>
              We don't make videos. <em className="text-ink-dim italic">We help marketing teams hit their number.</em>
            </h2>
            <div className="space-y-5 text-ink-dim leading-relaxed max-w-2xl" style={{ fontSize: '1.05rem' }}>
              <p>
                Since 2012, we've helped 500+ brands turn video into their highest-performing marketing channel.
                Cinematic craft, AI-augmented workflow, and KPI-aligned production from brief to wrap.
              </p>
              <p>
                One studio. One point of contact. Every format your marketing needs.
              </p>
            </div>
            <div className="mt-10">
              <PillButton variant="ghost" to="/about">Read the studio story</PillButton>
            </div>
          </div>

          <aside className="flex flex-col gap-6 lg:pt-2">
            {['Brief in 24 hours', 'Fixed-fee quote, no surprises', 'Real producer reading your brief', '48-hour rush available'].map((line, i) => (
              <div key={i} className="flex items-baseline gap-4 border-t border-hairline pt-5">
                <span className="font-mono-custom text-[0.62rem] tracking-[0.22em] uppercase text-ink-faint">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-ink leading-snug" style={{ fontSize: '0.95rem' }}>{line}</span>
              </div>
            ))}
          </aside>
        </div>
      </section>

      {/* ── TESTIMONIALS — LIGHT, PULL-QUOTE STYLE ──────── */}
      <section className="bg-canvas border-t border-hairline section-py px-6 lg:px-10">
        <div className="max-w-screen-xl mx-auto">
          <PillBadge>Client voice</PillBadge>
          <h2 className="editorial-h2 text-ink mt-6 mb-16" style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}>
            What clients say.
          </h2>

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {testimonials.slice(0, 3).map((t, i) => (
              <figure key={t.id} className={`flex flex-col ${i % 2 === 1 ? 'lg:mt-12' : ''}`}>
                <blockquote className="editorial-h3 text-ink leading-snug italic font-medium" style={{ fontSize: 'clamp(1.2rem, 1.6vw, 1.4rem)' }}>
                  "{t.text}"
                </blockquote>
                <figcaption className="mt-6 pt-5 border-t border-hairline">
                  <div className="text-ink font-medium">{t.client_name}</div>
                  <div className="font-mono-custom text-[0.6rem] tracking-[0.22em] uppercase text-ink-dim mt-1">
                    {t.client_role} {t.client_company ? `· ${t.client_company}` : ''}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
