import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PortfolioItem, Testimonial, HeroVideo } from '@/lib/supabase'
import Seo from '@/components/Seo'
import PillButton from '@/components/ui/PillButton'
import PillBadge from '@/components/ui/PillBadge'
import ClientLogoStrip from '@/components/ui/ClientLogoStrip'
import { ChevronDown } from 'lucide-react'

// ── Static fallback data ──────────────────────────

const DEMO_PORTFOLIO: PortfolioItem[] = [
  { id:'1', title:'Cooking Heritage Campaign', slug:'cooking', category:'brand', client_name:'FoodCo', featured:true, published:true, sort_order:0, created_at:'', description:'', youtube_id:'rzfWrv3ERxk', results:{ views:'4.2M', ctr:'↑38%' } },
  { id:'2', title:'Gen AI Campaign', slug:'fashion', category:'ai', client_name:'NordShop', featured:false, published:true, sort_order:1, created_at:'', description:'', youtube_id:'9k5w1iG_JHM' },
  { id:'3', title:'Perfume Brand Film', slug:'perfume', category:'brand', client_name:'Fragrance Brand', featured:false, published:true, sort_order:2, created_at:'', description:'', youtube_id:'SgHHbWp64cE' },
  { id:'4', title:'Creature VFX Reel', slug:'ecomm', category:'post', client_name:'Velour Boutique', featured:false, published:true, sort_order:3, created_at:'', description:'', youtube_id:'EZUJiL9MeLw' },
  { id:'5', title:'Brand Film', slug:'social', category:'brand', client_name:'BrandX', featured:false, published:true, sort_order:4, created_at:'', description:'', youtube_id:'HAHj0TDQZcg', results:{ views:'12M' } },
]

const DEMO_TESTIMONIALS: Testimonial[] = [
  { id:'1', client_name:'Sarah Andersen', client_role:'CMO', client_company:'FoodCo International', text:'Imba transformed how we present our brand. The cooking series generated 3× more traffic than any previous content.', featured:true, published:true },
  { id:'2', client_name:'Marco Kessler', client_role:'Growth Lead', client_company:'NordShop', text:'The AI video campaign was something we had never seen. Personalisation at scale reduced our cost-per-acquisition by 40%.', featured:false, published:true },
  { id:'3', client_name:'Julia Larsson', client_role:'Founder', client_company:'Velour Boutique', text:'Professional, fast, genuinely creative. Full product video suite in 48 hours. The team is exceptional.', featured:false, published:true },
]

const SERVICES = [
  { key:'brand', icon:'▶', label:'Brand & Commercial', desc:'Brand films that lift engagement 80% above static ads — and turn viewers into buyers.' },
  { key:'ai', icon:'◈', label:'AI-Powered Video', desc:'10× your content output without 10× the budget. Personalised campaigns that deliver 3× higher response rates.' },
  { key:'product', icon:'▣', label:'Product & Ecommerce', desc:'Product videos that stop the scroll and lift conversions by up to 80% on Amazon, Shopify, and social.' },
  { key:'social', icon:'◉', label:'Short & Social', desc:'Vertical content built to go viral — on purpose. Native TikTok, Reels, and Shorts that audiences share.' },
  { key:'post', icon:'◫', label:'Post Production', desc:'Send us the footage. Get back content that performs — edit, grade, motion, sound, and VFX in-house.' },
  { key:'cooking', icon:'◎', label:'Cooking & Food', desc:'Culinary cinematography for restaurants, recipe creators, and food brands — styling, lighting, and macro craft handled in-house.' },
]

const STATS = [
  { num: '12', sup:'+', label:'Years driving results' },
  { num: '500', sup:'+', label:'Brands served' },
  { num: '48', sup:'h', label:'Rush delivery' },
  { num: '98', sup:'%', label:'Client satisfaction' },
]

const DEMO_HERO_VIDEOS: HeroVideo[] = [
  { id: '1', youtube_id: 'HAHj0TDQZcg', title: 'A Steampunk Princess',  sort_order: 0, active: true, created_at: '', slide_eyebrow: 'Brand films that move markets',   slide_headline: 'Stories audiences',           slide_headline_em: 'can\'t scroll past.',    slide_subheadline: 'Cinematic brand video built to drive recall, revenue, and referrals — delivered in weeks, not months.' },
  { id: '2', youtube_id: 'SgHHbWp64cE', title: 'Virus House Teaser',    sort_order: 1, active: true, created_at: '', slide_eyebrow: 'Brand & Commercial',   slide_headline: 'Brand films that make',   slide_headline_em: 'customers choose you.',            slide_subheadline: 'Lift engagement 80% above static ads with cinematic films built around your business goals.' },
  { id: '3', youtube_id: '9k5w1iG_JHM', title: 'Gen AI Video',          sort_order: 2, active: true, created_at: '', slide_eyebrow: 'AI-Powered Video',  slide_headline: 'Personalised at scale.',     slide_headline_em: 'Delivered in days.',         slide_subheadline: 'AI-augmented production that creates hundreds of variants from one shoot — and ships the ones that convert.' },
  { id: '4', youtube_id: 'EZUJiL9MeLw', title: 'The Creature Transformation', sort_order: 3, active: true, created_at: '', slide_eyebrow: 'Post Production & VFX', slide_headline: 'Send us the footage.', slide_headline_em: 'Get back content that performs.',      slide_subheadline: 'Full in-house edit, colour, motion, sound, and VFX — broadcast-quality delivered in as little as 48 hours.' },
]

export default function Home() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEMO_PORTFOLIO)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEMO_TESTIMONIALS)
  const [heroVideos, setHeroVideos] = useState<HeroVideo[]>(DEMO_HERO_VIDEOS)
  const [currentVideo, setCurrentVideo] = useState(0)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [playingVideo, setPlayingVideo] = useState(false)

  useEffect(() => {
    // Prefer homepage_featured items, fall back to sort_order
    supabase.from('portfolio_items').select('*').eq('published', true).eq('homepage_featured', true).order('sort_order')
      .then(({ data: featured }) => {
        if (featured?.length) {
          setPortfolio(featured)
        } else {
          supabase.from('portfolio_items').select('*').eq('published', true).order('sort_order').limit(5)
            .then(({ data }) => { if (data?.length) setPortfolio(data) })
        }
      })
    supabase.from('testimonials').select('*').eq('published', true)
      .then(({ data }) => { if (data?.length) setTestimonials(data) })
    supabase.from('hero_videos').select('*').eq('active', true).order('sort_order')
      .then(({ data }) => { if (data?.length) setHeroVideos(data) })
  }, [])

  // Auto-advance slider — pauses while a video is playing
  useEffect(() => {
    if (heroVideos.length <= 1 || playingVideo) return
    const timer = setInterval(() => {
      setCurrentVideo(i => (i + 1) % heroVideos.length)
    }, 10000)
    return () => clearInterval(timer)
  }, [heroVideos.length, playingVideo])

  function goToSlide(i: number) {
    setCurrentVideo(i)
    setPlayingVideo(false)
  }

  return (
    <>
      <Seo
        title="Cinematic Video Production for Brands"
        description="Cinematic video production studio — AI video, brand films, product videos, post-production, and social content. Concept to delivery, in-house."
        canonicalPath="/"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': 'Imba Production',
            'url': 'https://imbaproduction.com',
            'potentialAction': {
              '@type': 'SearchAction',
              'target': { '@type': 'EntryPoint', 'urlTemplate': 'https://imbaproduction.com/work?q={search_term_string}' },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': 'Imba Production',
            'url': 'https://imbaproduction.com',
            'logo': 'https://imbaproduction.com/og-default.jpg',
            'description': 'Next-generation video production company powered by cinematic craft and AI strategy.',
            'address': {
              '@type': 'PostalAddress',
              'streetAddress': '007 N Orange St, 4th Floor, Suite #3601',
              'addressLocality': 'Wilmington',
              'addressRegion': 'DE',
              'postalCode': '19801',
              'addressCountry': 'US',
            },
            'contactPoint': {
              '@type': 'ContactPoint',
              'email': 'hello@imbaproduction.com',
              'contactType': 'customer service',
            },
            'sameAs': [
              'https://www.instagram.com/imbaproduction',
              'https://www.youtube.com/channel/UCV4zBHquBoo4NLw0tMi2ZKQ',
              'https://www.tiktok.com/@imbaproduction',
              'https://www.linkedin.com/company/imba-production',
              'https://twitter.com/productionimba',
            ],
          },
        ]}
      />
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-ground">

        {/* Slide thumbnail layer — anchored bottom-right behind text */}
        <div className="absolute inset-0 z-0">
          {heroVideos.map((video, i) => (
            <div
              key={video.id}
              className="absolute inset-0 overflow-hidden"
              style={{ opacity: i === currentVideo ? 1 : 0, transition: 'opacity 1.4s ease' }}
            >
              <img
                src={video.slide_image_url || `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
                style={{ opacity: i === currentVideo && playingVideo ? 0 : 0.55, transition: 'opacity 0.5s ease' }}
                onError={e => {
                  const el = e.target as HTMLImageElement
                  if (video.slide_image_url && el.src === video.slide_image_url) {
                    el.src = `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`
                  } else {
                    el.src = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`
                  }
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

        {/* Spacebar-style radial gradient glow — magenta/orange/violet,
            right-anchored. Sits above the thumbnail, below the text. */}
        {!playingVideo && (
          <div className="absolute inset-0 z-[1] pointer-events-none">
            <div className="hero-glow" />
          </div>
        )}

        {/* Vignette darkening for text legibility */}
        <div className="absolute inset-0 pointer-events-none z-[2]" style={{
          background: 'linear-gradient(to right, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.55) 50%, rgba(10,10,10,0.20) 100%)',
        }} />
        <div className="absolute inset-0 pointer-events-none z-[2]" style={{
          background: 'linear-gradient(to top, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.30) 35%, transparent 60%)',
        }} />

        {/* Stop video button */}
        {playingVideo && (
          <button
            onClick={() => setPlayingVideo(false)}
            aria-label="Stop video"
            className="absolute z-[30] top-24 right-6 w-10 h-10 rounded-full flex items-center justify-center bg-surface/80 border border-white/15 text-paper hover:bg-surface backdrop-blur"
          >
            ✕
          </button>
        )}

        {/* Per-slide hero text */}
        {heroVideos.map((video, i) => (
          <div
            key={video.id}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 lg:px-12 z-[10]"
            style={{
              opacity: i === currentVideo ? 1 : 0,
              transform: i === currentVideo ? 'translateY(-50%)' : 'translateY(calc(-50% + 14px))',
              transition: 'opacity 0.75s ease, transform 0.75s ease',
              transitionDelay: i === currentVideo ? '0.55s' : '0s',
              pointerEvents: i === currentVideo ? 'auto' : 'none',
            }}
          >
            <div className="max-w-screen-2xl mx-auto">
              <div className="max-w-2xl flex flex-col items-start gap-6">
                <PillBadge>
                  {video.slide_eyebrow || 'Imba Production'}
                </PillBadge>

                <h1 className="display-xl text-paper" style={{ fontSize: 'clamp(2.8rem, 6vw, 5.6rem)' }}>
                  {video.slide_headline || 'More pipeline. Less friction.'}
                  {video.slide_headline_em ? <><br />{video.slide_headline_em}</> : ''}
                </h1>

                <p className="text-paper-dim leading-relaxed max-w-lg" style={{ fontSize: '1.05rem' }}>
                  {video.slide_subheadline || 'The brands you know. The stories you remember. The videos we create.'}
                </p>

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <HeroCta
                    href={video.slide_primary_cta_href || '/work'}
                    label={video.slide_primary_cta_label || 'See our work'}
                    variant="primary"
                  />
                  <HeroCta
                    href={video.slide_secondary_cta_href || '/contact'}
                    label={video.slide_secondary_cta_label || 'Book a call'}
                    variant="default"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Client logo strip — bottom of hero */}
        <div className="absolute inset-x-0 bottom-12 z-[10] px-6 lg:px-12">
          <ClientLogoStrip className="max-w-screen-xl mx-auto" />
        </div>

        {/* Scroll chevron — bottom-left */}
        <div className="absolute bottom-6 left-6 lg:left-12 z-[20]">
          <span className="scroll-chevron animate-bounce" aria-hidden="true">
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>

        {/* Slide indicators — bottom-right of hero */}
        {heroVideos.length > 1 && (
          <div className="absolute bottom-6 right-6 lg:right-12 z-[20] flex items-center gap-3">
            {heroVideos.map((v, i) => (
              <button
                key={v.id}
                onClick={() => goToSlide(i)}
                aria-label={v.title}
                className="cursor-pointer transition-all duration-300 border-none p-0"
                style={{
                  height: '2px',
                  width: i === currentVideo ? '32px' : '12px',
                  background: i === currentVideo ? '#FAFAFA' : 'rgba(250,250,250,0.22)',
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <div className="border-y border-white/[0.06] grid grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ num, sup, label }, i) => (
          <div key={label} className={`px-8 lg:px-12 py-9 ${i < 3 ? 'border-r border-white/[0.06]' : ''}`}>
            <div className="stat-num font-display font-bold leading-none" style={{ fontSize: '3rem' }}>
              {num}<em className="not-italic text-ember">{sup}</em>
            </div>
            <div className="font-mono-custom text-[0.6rem] tracking-[0.18em] uppercase text-smoke-faint mt-2">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── SERVICES ───────────────────────────────────────── */}
      <section className="bg-ink-2 py-24 px-6 lg:px-12" id="services">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
            <div>
              <p className="eyebrow mb-4 reveal">Built around your goals</p>
              <h2 className="font-display font-bold leading-tight reveal reveal-delay-1"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}
              >
                One partner for every<br /><em className="text-paper">channel you sell on</em>
              </h2>
            </div>
            <Link to="/services" className="btn btn-ghost reveal">
              All services →
            </Link>
          </div>

          <div className="services-grid border border-white/[0.05]">
            {SERVICES.map(({ key, label, desc }, i) => (
              <Link
                key={key}
                to="/services"
                className="bg-ink-2 p-9 relative overflow-hidden transition-colors duration-300 hover:bg-ink-3 reveal group block"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {/* Editorial two-digit number */}
                <span className="font-mono-custom text-[0.62rem] tracking-[0.18em] uppercase text-smoke-faint/60 mb-6 block">
                  {String(i + 1).padStart(2, '0')} / 06
                </span>
                <h3 className="font-display font-normal text-smoke text-2xl mb-3 leading-tight">{label}</h3>
                <p className="text-sm text-smoke-dim leading-relaxed mb-6" style={{ fontWeight: 300 }}>{desc}</p>
                <div className="flex items-center gap-2 font-mono-custom text-[0.62rem] tracking-[0.14em] uppercase text-ember transition-all duration-300 group-hover:gap-3">
                  <span>Explore</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO ──────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12" id="work">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="eyebrow mb-4 reveal">Selected work</p>
              <h2 className="font-display font-bold leading-tight reveal reveal-delay-1"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}
              >
                Our <em className="text-paper">latest</em> productions
              </h2>
            </div>
            <Link to="/work" className="btn btn-ghost hidden lg:flex reveal">
              View all work →
            </Link>
          </div>

          <div className="portfolio-mosaic reveal">
            {portfolio.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden group bg-ink-3"
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* YouTube thumbnail — desaturated by default, in colour on hover (Maxx Hat pattern) */}
                {item.youtube_id ? (
                  <img
                    src={`https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg`}
                    alt={item.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
                    style={{ filter: hoveredCard === item.id ? 'saturate(1) brightness(1)' : 'saturate(0.55) brightness(0.85)' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg` }}
                  />
                ) : item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt={item.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                ) : null}

                {/* Bottom gradient for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent transition-opacity duration-500"
                  style={{ opacity: hoveredCard === item.id ? 0.85 : 0.7 }}
                />

                {/* Meta */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="font-mono-custom text-[0.58rem] tracking-[0.2em] uppercase mb-2 text-ember">
                    {item.client_name}
                  </div>
                  <div className="font-display font-normal text-smoke text-xl leading-tight">
                    {item.title}
                  </div>
                  {item.results && (
                    <div className="flex gap-4 mt-3">
                      {Object.entries(item.results).map(([k, v]) => (
                        <span key={k} className="font-mono-custom text-[0.58rem] text-smoke-faint tracking-wider">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ────────────────────────────────────────── */}
      <section className="bg-ink-2 py-24 px-6 lg:px-12" id="process">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="eyebrow mb-4 reveal">How we work</p>
            <h2 className="font-display font-bold leading-tight mb-12 reveal reveal-delay-1"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}
            >
              From brief to<br /><em className="text-paper">final cut</em>
            </h2>
            {[
              { n:'01', title:'Discovery & Strategy', desc:'We immerse in your brand, audience, and goals. Every production starts with a creative brief that aligns vision with measurable outcomes.' },
              { n:'02', title:'Pre-production', desc:'Scripting, storyboarding, casting, location scouting, and shot-by-shot planning. Nothing left to chance on shoot day.' },
              { n:'03', title:'Production', desc:'On-location or studio shoot with full crew, lighting, audio, and direction by our senior team.' },
              { n:'04', title:'Post & Delivery', desc:'Edit, grade, motion graphics, sound design. Delivered in every format you need, with revision rounds included.' },
            ].map(({ n, title, desc }, i) => (
              <div key={n}
                className="flex gap-5 py-6 border-b border-white/5 group hover:pl-3 transition-all duration-300 reveal"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="font-mono-custom text-[0.7rem] text-ember opacity-70 mt-1 min-w-[2rem]">{n}</span>
                <div>
                  <h3 className="font-display text-xl text-smoke mb-1.5 group-hover:text-ember transition-colors">{title}</h3>
                  <p className="text-sm text-smoke-dim leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Visual panel — film metaphor, restrained */}
          <div className="relative aspect-[3/4] bg-ink-3 border border-white/[0.05] overflow-hidden reveal reveal-delay-2">
            {/* Vertical film strip */}
            <div className="absolute left-6 top-0 bottom-0 flex flex-col gap-2 py-4 w-8">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex-1 border border-white/[0.06] bg-ink-4" />
              ))}
            </div>
            <div className="absolute right-6 top-0 bottom-0 flex flex-col gap-2 py-4 w-8">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex-1 border border-white/[0.06] bg-ink-4" />
              ))}
            </div>
            {/* Center content */}
            <div className="absolute inset-16 flex flex-col justify-center items-center text-center gap-8">
              <div className="w-16 h-16 border rounded-full flex items-center justify-center"
                style={{ borderColor: 'rgba(255,255,255,0.22)' }}>
                <div style={{ borderLeft: '18px solid rgba(255,255,255,0.55)', borderTop: '11px solid transparent', borderBottom: '11px solid transparent', marginLeft: '4px' }} />
              </div>
              <div>
                <p className="font-mono-custom text-[0.6rem] tracking-[0.2em] uppercase text-smoke-faint mb-2">Behind the scenes</p>
                <p className="font-display font-normal text-smoke/55" style={{ fontSize: '1.15rem' }}>
                  Your brand story,<br />frame by frame
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI AS ONE CAPABILITY ────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12" id="ai">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-5 reveal">How we use AI</p>
            <h2 className="font-display font-normal leading-[1.05] mb-6 reveal reveal-delay-1"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}>
              A human team,<br />
              <em className="italic font-normal">augmented.</em>
            </h2>
            <p className="text-smoke-dim leading-relaxed reveal reveal-delay-2" style={{ fontSize: '0.98rem', fontWeight: 300 }}>
              AI doesn't replace our directors, editors, or colorists — it accelerates them.
              We ship more variants, test against your KPIs, and produce scenes a camera couldn't
              capture last year. Every frame still goes through human hands before it goes out the door.
            </p>
          </div>

          <div className="lg:col-span-7 flex flex-col">
            {[
              { n:'01', t:'Faster iteration', d:'Concepts in hours, not weeks. Twenty creative directions explored in an afternoon — locked before competitors finish their brief.' },
              { n:'02', t:'Personalised at scale', d:'One shoot becomes hundreds of variants for email, paid, and social. Same budget, materially more reach.' },
              { n:'03', t:'Ship what converts', d:'We A/B test cut variants against your KPIs and ship the winners — not just what looks good in the review.' },
              { n:'04', t:'Scenes cameras can\'t capture', d:'Generative pipelines integrated where they earn their place — for visuals that would have been impossible or unaffordable in 2024.' },
            ].map(({ n, t, d }, i) => (
              <div key={t}
                className="grid grid-cols-[auto_1fr] gap-6 py-6 border-b border-white/[0.06] last:border-0 reveal"
                style={{ transitionDelay: `${i * 60}ms` }}>
                <span className="font-mono-custom text-[0.65rem] tracking-[0.18em] text-ember pt-1">{n}</span>
                <div>
                  <h3 className="font-display font-normal text-smoke text-xl mb-1.5">{t}</h3>
                  <p className="text-smoke-dim text-sm leading-relaxed" style={{ fontWeight: 300 }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section className="bg-ink-2 py-24 px-6 lg:px-12">
        <div className="max-w-screen-xl mx-auto">
          <p className="eyebrow mb-4 reveal">Client voice</p>
          <h2 className="font-display font-bold leading-tight mb-14 reveal reveal-delay-1"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}
          >
            What our clients <em className="text-paper">say</em>
          </h2>
          <div className="grid md:grid-cols-3 gap-px bg-white/[0.05]">
            {testimonials.map((t, i) => (
              <div key={t.id} className="bg-ink-2 p-9 relative reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                {/* Decorative quote mark */}
                <div className="absolute top-5 right-6 font-display text-[6rem] font-light leading-none select-none text-smoke/[0.05]">"</div>
                <p className="font-display text-[1.05rem] font-normal italic text-smoke/85 leading-relaxed mb-7" style={{ fontWeight: 400 }}>
                  {t.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-mono-custom text-[0.6rem]"
                    style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)', color: '#FAFAFA' }}>
                    {t.client_name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm text-smoke font-medium">{t.client_name}</p>
                    <p className="font-mono-custom text-[0.58rem] tracking-wider text-smoke-faint">
                      {t.client_role} · {t.client_company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND — ground, accent rule ─────────────────── */}
      <section className="relative overflow-hidden bg-ink border-y border-white/[0.06]">
        <div className="relative px-6 lg:px-12 py-24 max-w-screen-xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="angular-divider mb-8 w-24" />
            <h2 className="font-display font-normal leading-[1.05] text-smoke"
              style={{ fontSize: 'clamp(2.4rem, 4.5vw, 4rem)' }}>
              Your next breakthrough video<br />
              <em className="italic font-normal">starts here.</em>
            </h2>
            <p className="text-smoke-dim mt-5 max-w-lg" style={{ fontSize: '0.98rem', fontWeight: 300 }}>
              Tell us what you're trying to achieve — we'll reply within 24 hours with a creative plan and a fixed quote. No commitment.
            </p>
          </div>
          <Link to="/contact" className="btn btn-primary flex-shrink-0">
            Start a project →
          </Link>
        </div>
      </section>

      {/* ── QUOTE FORM (inline on home) ────────────────────── */}
      <section className="bg-ink-2 py-24 px-6 lg:px-12" id="quote">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16">
          <div>
            <p className="eyebrow mb-4 reveal">Free quote · 24h reply</p>
            <h2 className="font-display font-bold leading-tight mb-10 reveal reveal-delay-1"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
            >
              Tell us your <em className="text-paper">goal.</em>
            </h2>
            <QuoteForm />
          </div>
          <div className="reveal reveal-delay-2 pt-4">
            <h3 className="font-display font-bold text-2xl text-smoke mb-6 leading-snug">
              One reply within <em className="text-paper">24 hours.</em> No sales pressure.
            </h3>
            {[
              { n:'01', t:'Free 30-minute strategy call — walk away with ideas, even if you don\'t hire us.' },
              { n:'02', t:'A concrete proposal: creative plan, timeline, and fixed price with zero surprises.' },
              { n:'03', t:'One partner, every format — brand, product, AI, post, social. We handle it all.' },
              { n:'04', t:'Agency-friendly: white-label production with your branding and zero overhead.' },
            ].map(({ n, t }) => (
              <div key={n} className="flex gap-4 py-4 border-b border-white/5">
                <span className="font-mono-custom text-[0.65rem] text-ember min-w-[2rem]">{n}</span>
                <p className="text-sm text-smoke-dim leading-relaxed">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

// ── Sub-components ──────────────────────────────

function HeroCta({ href, label, variant }: { href: string; label: string; variant: 'primary' | 'default' | 'ghost' }) {
  const isExternal = /^https?:\/\//i.test(href)
  return isExternal
    ? <PillButton variant={variant} href={href}>{label}</PillButton>
    : <PillButton variant={variant} to={href}>{label}</PillButton>
}

function QuoteForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      full_name: fd.get('full_name') as string,
      email: fd.get('email') as string,
      company: fd.get('company') as string,
      service_type: fd.get('service_type') as string,
      budget_range: fd.get('budget_range') as string,
      message: fd.get('message') as string,
    }
    await supabase.from('quote_requests').insert([payload])
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="border border-ember/20 p-8 text-center">
        <div className="font-display text-2xl text-smoke mb-2">Thank you.</div>
        <p className="text-sm text-smoke-dim">We'll be in touch within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full name *</label>
          <input name="full_name" required className="form-input" placeholder="Jane Smith" />
        </div>
        <div>
          <label className="form-label">Company</label>
          <input name="company" className="form-input" placeholder="Acme Corp" />
        </div>
      </div>
      <div>
        <label className="form-label">Email *</label>
        <input name="email" type="email" required className="form-input" placeholder="jane@acme.com" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Service type</label>
          <select name="service_type" className="form-select">
            <option value="">Select...</option>
            {['Brand & Commercial', 'AI Video', 'Product & Ecommerce', 'Social Video', 'Post Production', 'eLearning', 'Other'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Budget range</label>
          <select name="budget_range" className="form-select">
            <option value="">Select...</option>
            {['< $1,000', '$1k – $5k', '$5k – $15k', '$15k – $50k', '$50k+'].map(b => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="form-label">Project brief</label>
        <textarea name="message" className="form-textarea" placeholder="Tell us about your vision, timeline, and goals..." />
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary self-start">
        {loading ? 'Sending...' : 'Send request →'}
      </button>
    </form>
  )
}
