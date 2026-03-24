import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PortfolioItem, Testimonial } from '@/lib/supabase'

// ── Static fallback data ──────────────────────────

const DEMO_PORTFOLIO: PortfolioItem[] = [
  { id:'1', title:'Cooking Heritage Campaign', slug:'cooking', category:'brand', client_name:'FoodCo', featured:true, published:true, sort_order:0, created_at:'', description:'', thumbnail_url:'', results:{ views:'4.2M', ctr:'↑38%' } },
  { id:'2', title:'FashionTech Reel', slug:'fashion', category:'ai', client_name:'NordShop', featured:false, published:true, sort_order:1, created_at:'', description:'' },
  { id:'3', title:'Coastal Estate Tour', slug:'drone', category:'drone', client_name:'Prime Real Estate', featured:false, published:true, sort_order:2, created_at:'', description:'' },
  { id:'4', title:'Ecommerce Spot', slug:'ecomm', category:'product', client_name:'Velour Boutique', featured:false, published:true, sort_order:3, created_at:'', description:'' },
  { id:'5', title:'TikTok Series', slug:'social', category:'social', client_name:'BrandX', featured:false, published:true, sort_order:4, created_at:'', description:'', results:{ views:'12M' } },
]

const DEMO_TESTIMONIALS: Testimonial[] = [
  { id:'1', client_name:'Sarah Andersen', client_role:'CMO', client_company:'FoodCo International', text:'Imba transformed how we present our brand. The cooking series generated 3× more traffic than any previous content.', featured:true, published:true },
  { id:'2', client_name:'Marco Kessler', client_role:'Growth Lead', client_company:'NordShop', text:'The AI video campaign was something we had never seen. Personalisation at scale reduced our cost-per-acquisition by 40%.', featured:false, published:true },
  { id:'3', client_name:'Julia Larsson', client_role:'Founder', client_company:'Velour Boutique', text:'Professional, fast, genuinely creative. Full product video suite in 48 hours. The team is exceptional.', featured:false, published:true },
]

const SERVICES = [
  { key:'brand', icon:'▶', label:'Brand & Commercial', desc:'Cinematic brand films and TV-quality commercial spots built to elevate your identity across every channel.' },
  { key:'ai', icon:'◈', label:'AI-Powered Video', desc:'Hyper-personalised, AI-generated campaigns that scale content production without sacrificing quality.' },
  { key:'product', icon:'▣', label:'Product & Ecommerce', desc:'Conversion-focused product videos and cooking content designed to stop the scroll and drive purchases.' },
  { key:'social', icon:'◉', label:'Short & Social', desc:'TikTok, Reels, Shorts — natively-crafted vertical content that algorithms and audiences love.' },
  { key:'post', icon:'◫', label:'Post Production', desc:'Full-service editing, colour grading, motion graphics, and sound design from our in-house studio.' },
  { key:'drone', icon:'◬', label:'Drone & Aerial', desc:'Licensed aerial cinematography for events, real estate, sports, and outdoor brands.' },
]

const STATS = [
  { num: '12', sup:'+', label:'Years' },
  { num: '500', sup:'+', label:'Videos' },
  { num: '48', sup:'h', label:'Turnaround' },
  { num: '98', sup:'%', label:'Satisfaction' },
]

// ── Category accent colors ──
const CAT_COLOR: Record<string, string> = {
  brand: '#E8452A',
  ai: '#C9A96E',
  product: '#6C7AE0',
  social: '#3CBFAE',
  drone: '#8A8AFF',
  post: '#E87A2A',
}

export default function Home() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEMO_PORTFOLIO)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEMO_TESTIMONIALS)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('portfolio_items').select('*').eq('published', true).order('sort_order').limit(5)
      .then(({ data }) => { if (data?.length) setPortfolio(data) })
    supabase.from('testimonials').select('*').eq('published', true)
      .then(({ data }) => { if (data?.length) setTestimonials(data) })
  }, [])

  // Parallax hero
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        {/* BG layer */}
        <div ref={heroRef} className="absolute inset-0 will-change-transform">
          {/* Radial ember glow */}
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 80% 70% at 65% 35%, rgba(232,69,42,0.07) 0%, transparent 65%)' }}
          />
          {/* Gold accent */}
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 50% 60% at 15% 80%, rgba(201,169,110,0.04) 0%, transparent 55%)' }}
          />
          {/* Grid lines */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }} />
        </div>

        {/* Video frame - top right */}
        <div className="absolute top-24 right-6 lg:right-12 w-[42vw] max-w-[560px] aspect-video hidden lg:block">
          {/* Outer frame with corner marks */}
          <CornerMarkedFrame>
            <div className="w-full h-full bg-ink-3 flex items-center justify-center relative overflow-hidden cursor-film">
              {/* Scanline effect */}
              <div className="absolute inset-0"
                style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 3px)' }}
              />
              {/* Inner glow */}
              <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 40%, rgba(232,69,42,0.1) 0%, transparent 70%)' }}
              />
              {/* Play indicator */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-14 h-14 border border-ember/30 rounded-full flex items-center justify-center">
                  <div style={{ borderLeft: '16px solid rgba(232,69,42,0.7)', borderTop: '9px solid transparent', borderBottom: '9px solid transparent', marginLeft: '3px' }} />
                </div>
                <span className="font-mono-custom text-[0.6rem] text-smoke-faint/40 tracking-widest uppercase">
                  Showreel 2025
                </span>
              </div>
              {/* Timecode overlay */}
              <div className="absolute bottom-3 left-4 font-mono-custom text-[0.55rem] text-smoke-faint/30 tracking-widest">
                00:00:00:00
              </div>
              <div className="absolute bottom-3 right-4 font-mono-custom text-[0.55rem] text-smoke-faint/30 tracking-widest">
                REC
                <span className="inline-block w-[5px] h-[5px] rounded-full bg-ember ml-1 blink" />
              </div>
            </div>
          </CornerMarkedFrame>

          {/* Film strip left edge */}
          <div className="absolute -left-5 top-0 bottom-0 w-4 flex flex-col gap-[3px] py-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="flex-1 border border-white/6 bg-ink-4" />
            ))}
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-6 lg:px-12 pb-20 pt-36">
          <p className="eyebrow mb-6 reveal">Next-generation video production · Est. 2012</p>

          <h1 className="font-display font-light leading-none mb-6 reveal reveal-delay-1"
            style={{ fontSize: 'clamp(3.2rem, 7vw, 6.8rem)' }}
          >
            Stories that<br />
            <em className="text-gold italic">move</em> people<br />
            to act.
          </h1>

          <p className="text-smoke-dim leading-relaxed max-w-sm mb-10 reveal reveal-delay-2"
            style={{ fontSize: '0.95rem' }}
          >
            We combine cinematic craft with AI-powered strategy to produce brand videos that captivate, convert, and endure.
          </p>

          <div className="flex items-center gap-6 reveal reveal-delay-3">
            <Link to="/work" className="btn btn-primary">
              See our work
            </Link>
            <Link to="/services" className="btn btn-ghost flex items-center gap-2">
              <span>Explore services</span>
              <span>→</span>
            </Link>
          </div>

          {/* Floating tags */}
          <div className="flex flex-wrap gap-3 mt-8 reveal reveal-delay-4">
            {['Brand Films', 'AI Video', 'Ecommerce', 'Social', 'Drone', 'Post Production'].map(t => (
              <span key={t} className="font-mono-custom text-[0.58rem] tracking-[0.15em] uppercase px-3 py-1.5 border border-white/8 text-smoke-faint">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-12 hidden lg:flex flex-col items-center gap-3">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/20" />
          <span className="font-mono-custom text-[0.55rem] tracking-[0.25em] text-smoke-faint/40 uppercase" style={{ writingMode:'vertical-rl' }}>
            Scroll
          </span>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <div className="border-y border-white/6 grid grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ num, sup, label }, i) => (
          <div key={label} className={`px-8 lg:px-12 py-8 ${i < 3 ? 'border-r border-white/6' : ''}`}>
            <div className="font-display font-light text-smoke leading-none" style={{ fontSize: '3rem' }}>
              {num}<em className="text-ember not-italic">{sup}</em>
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
              <p className="eyebrow mb-4 reveal">What we create</p>
              <h2 className="font-display font-light leading-tight reveal reveal-delay-1"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}
              >
                Production for every<br /><em className="text-gold">channel and format</em>
              </h2>
            </div>
            <Link to="/services" className="btn btn-ghost reveal">
              All services →
            </Link>
          </div>

          <div className="services-grid border border-white/5">
            {SERVICES.map(({ key, icon, label, desc }, i) => (
              <div
                key={key}
                className="bg-ink-2 p-8 relative overflow-hidden transition-colors duration-300 hover:bg-ink-3 cursor-pointer reveal"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                {/* Ghost number */}
                <span className="absolute top-4 right-5 font-display text-[4.5rem] font-light leading-none select-none"
                  style={{ color: 'rgba(255,255,255,0.03)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* Icon */}
                <div className="w-10 h-10 border flex items-center justify-center mb-6 text-lg"
                  style={{ borderColor: 'rgba(232,69,42,0.25)', color: CAT_COLOR[key] }}
                >
                  {icon}
                </div>
                <h3 className="font-display font-light text-smoke text-xl mb-3">{label}</h3>
                <p className="text-sm text-smoke-dim leading-relaxed">{desc}</p>
                <div className="flex items-center gap-2 mt-6 font-mono-custom text-[0.62rem] tracking-[0.14em] uppercase text-ember">
                  <span>Explore</span>
                  <span>→</span>
                </div>
              </div>
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
              <h2 className="font-display font-light leading-tight reveal reveal-delay-1"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}
              >
                Our <em className="text-gold">latest</em> productions
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
                className="relative overflow-hidden cursor-film group bg-ink-3"
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Colored accent per category */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(ellipse 60% 60% at 30% 70%, ${CAT_COLOR[item.category] || '#E8452A'}14 0%, transparent 70%)` }}
                />
                {/* Scanlines */}
                <div className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)' }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Corner marks on hover */}
                <div className={`absolute inset-3 transition-opacity duration-300 ${hoveredCard === item.id ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
                  {/* TL */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-ember/60" />
                  {/* TR */}
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-ember/60" />
                  {/* BL */}
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-ember/60" />
                  {/* BR */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-ember/60" />
                </div>

                {/* Play circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-14 h-14 border border-white/20 rounded-full flex items-center justify-center transition-all duration-400 ${hoveredCard === item.id ? 'scale-110 border-ember/50' : 'scale-90 opacity-0'}`}>
                    <div style={{ borderLeft: '14px solid rgba(255,255,255,0.8)', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', marginLeft: '3px' }} />
                  </div>
                </div>

                {/* Meta */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="font-mono-custom text-[0.58rem] tracking-[0.18em] uppercase mb-1.5"
                    style={{ color: CAT_COLOR[item.category] || '#E8452A' }}
                  >
                    {item.category} · {item.client_name}
                  </div>
                  <div className="font-display font-light text-smoke text-xl leading-tight">
                    {item.title}
                  </div>
                  {item.results && (
                    <div className="flex gap-4 mt-2">
                      {Object.entries(item.results).map(([k, v]) => (
                        <span key={k} className="font-mono-custom text-[0.58rem] text-smoke-faint tracking-wider">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Category top-right badge */}
                <div className="absolute top-4 right-4 font-mono-custom text-[0.55rem] tracking-widest uppercase px-2 py-1"
                  style={{ background: `${CAT_COLOR[item.category] || '#E8452A'}22`, color: CAT_COLOR[item.category] || '#E8452A', border: `1px solid ${CAT_COLOR[item.category] || '#E8452A'}33` }}
                >
                  {item.category}
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
            <h2 className="font-display font-light leading-tight mb-12 reveal reveal-delay-1"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}
            >
              From brief to<br /><em className="text-gold">final cut</em>
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

          {/* Visual panel — film metaphor */}
          <div className="relative aspect-[3/4] bg-ink-3 border border-white/5 overflow-hidden reveal reveal-delay-2">
            {/* Vertical film strip */}
            <div className="absolute left-6 top-0 bottom-0 flex flex-col gap-2 py-4 w-8">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex-1 border border-white/6 bg-ink-4" />
              ))}
            </div>
            <div className="absolute right-6 top-0 bottom-0 flex flex-col gap-2 py-4 w-8">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex-1 border border-white/6 bg-ink-4" />
              ))}
            </div>
            {/* Center content */}
            <div className="absolute inset-16 flex flex-col justify-center items-center text-center gap-8">
              <div className="w-16 h-16 border border-ember/20 rounded-full flex items-center justify-center">
                <div style={{ borderLeft: '18px solid rgba(232,69,42,0.5)', borderTop: '11px solid transparent', borderBottom: '11px solid transparent', marginLeft: '4px' }} />
              </div>
              <div>
                <p className="font-mono-custom text-[0.6rem] tracking-[0.2em] uppercase text-smoke-faint mb-2">Behind the scenes</p>
                <p className="font-display font-light text-smoke/50" style={{ fontSize: '1.1rem' }}>
                  Your brand story,<br />frame by frame
                </p>
              </div>
            </div>
            {/* Ember glow */}
            <div className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(232,69,42,0.06) 0%, transparent 70%)' }}
            />
          </div>
        </div>
      </section>

      {/* ── AI SECTION ─────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12" id="ai">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          {/* Code terminal visual */}
          <div className="bg-ink-2 border border-white/5 overflow-hidden reveal">
            {/* Terminal bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-ember/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-gold/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="font-mono-custom text-[0.58rem] tracking-widest text-smoke-faint ml-3 uppercase">
                imba_ai_engine.log
              </span>
            </div>
            <div className="p-6 font-mono-custom text-[0.72rem] leading-[2.1] text-smoke-faint/60">
              <span className="text-ember/80">$</span> run analysis --input showreel_draft.mp4<br />
              <span className="text-smoke-faint/30">→</span> frames_analyzed: <span className="text-gold">1,847</span><br />
              <span className="text-smoke-faint/30">→</span> faces_detected: <span className="text-smoke/70">3</span><br />
              <span className="text-smoke-faint/30">→</span> emotion_map:<br />
              <span className="text-smoke-faint/30 ml-4">joy:</span> <span className="text-gold">0.87</span><br />
              <span className="text-smoke-faint/30 ml-4">surprise:</span> <span className="text-gold">0.71</span><br />
              <span className="text-smoke-faint/30">→</span> pacing_score: <span className="text-ember">94 / 100</span><br />
              <span className="text-smoke-faint/30">→</span> suggested_cuts: <span className="text-smoke/70">14</span><br />
              <br />
              <span className="text-ember/80">$</span> generate variants --cta-test<br />
              <span className="text-smoke-faint/30">→</span> variant_a: hook_3s — CTR: <span className="text-gold">+32%</span><br />
              <span className="text-smoke-faint/30">→</span> variant_b: long_form — Conv: <span className="text-gold">+18%</span><br />
              <span className="text-smoke-faint/30">→</span> winner: <span className="text-ember">variant_a</span> <span className="blink text-ember">_</span>
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="eyebrow mb-4 reveal">AI-native production</p>
            <h2 className="font-display font-light leading-tight mb-8 reveal reveal-delay-1"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}
            >
              Human creativity,<br /><em className="text-gold">machine speed</em>
            </h2>
            <div className="flex flex-col gap-4">
              {[
                { t:'Script & concept generation', d:'Brief-to-script in minutes. We explore 20+ creative directions before locking a concept.' },
                { t:'Personalised video at scale', d:'Dynamic video personalisation for email, paid, and social — one shoot, thousands of variants.' },
                { t:'Performance optimisation', d:'AI-analysed cut variants tested against your KPIs. We ship what actually converts.' },
                { t:'Generative B-roll & VFX', d:'Runway, Sora, and Stable Diffusion integrated into production pipelines.' },
              ].map(({ t, d }, i) => (
                <div key={t} className="flex gap-4 p-4 border border-white/4 hover:border-ember/20 hover:bg-ember/2 transition-all reveal"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-ember mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-smoke font-medium text-sm mb-1">{t}</p>
                    <p className="text-smoke-dim text-sm leading-relaxed">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section className="bg-ink-2 py-24 px-6 lg:px-12">
        <div className="max-w-screen-xl mx-auto">
          <p className="eyebrow mb-4 reveal">Client voice</p>
          <h2 className="font-display font-light leading-tight mb-14 reveal reveal-delay-1"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}
          >
            What our clients <em className="text-gold">say</em>
          </h2>
          <div className="grid md:grid-cols-3 gap-px bg-white/5">
            {testimonials.map((t, i) => (
              <div key={t.id} className="bg-ink-2 p-8 relative reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                {/* Decorative quote mark */}
                <div className="absolute top-5 right-6 font-display text-[6rem] font-light leading-none select-none"
                  style={{ color: 'rgba(232,69,42,0.05)' }}
                >"</div>
                <p className="font-display text-lg font-light italic text-smoke/80 leading-relaxed mb-6">
                  {t.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-mono-custom text-[0.6rem]"
                    style={{ background: 'rgba(232,69,42,0.1)', border: '1px solid rgba(232,69,42,0.2)', color: '#E8452A' }}
                  >
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

      {/* ── CTA BAND ───────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#E8452A' }}>
        {/* Diagonal texture */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 8px)',
        }} />
        <div className="relative px-6 lg:px-12 py-20 max-w-screen-xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h2 className="font-display font-light leading-tight text-ink"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)' }}
            >
              Ready to create something<br /><em>extraordinary?</em>
            </h2>
            <p className="text-ink/60 mt-3" style={{ fontSize: '0.95rem' }}>
              Talk to our team and get a free estimate within 24 hours.
            </p>
          </div>
          <Link to="/contact"
            className="flex-shrink-0 font-mono-custom text-[0.7rem] tracking-[0.14em] uppercase px-8 py-4 text-decoration-none"
            style={{ background: '#0A0A0B', color: '#F5F4F0' }}
          >
            Get a free quote
          </Link>
        </div>
      </section>

      {/* ── QUOTE FORM (inline on home) ────────────────────── */}
      <section className="bg-ink-2 py-24 px-6 lg:px-12" id="quote">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16">
          <div>
            <p className="eyebrow mb-4 reveal">Start your project</p>
            <h2 className="font-display font-light leading-tight mb-10 reveal reveal-delay-1"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
            >
              Get an <em className="text-gold">estimate</em>
            </h2>
            <QuoteForm />
          </div>
          <div className="reveal reveal-delay-2 pt-4">
            <h3 className="font-display font-light text-2xl text-smoke mb-6 leading-snug">
              We respond within <em className="text-gold">24 hours</em>, always.
            </h3>
            {[
              { n:'01', t:'Free consultation and creative brief session — no commitment required.' },
              { n:'02', t:'Detailed proposal with timeline, deliverables, and transparent pricing.' },
              { n:'03', t:'Fixed-price contracts. No surprise costs at delivery.' },
              { n:'04', t:'White-label production available for agencies and resellers.' },
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

function CornerMarkedFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full">
      {/* Corner marks */}
      <div className="absolute -top-px -left-px w-5 h-5 border-t border-l border-ember/50 z-10" />
      <div className="absolute -top-px -right-px w-5 h-5 border-t border-r border-ember/50 z-10" />
      <div className="absolute -bottom-px -left-px w-5 h-5 border-b border-l border-ember/50 z-10" />
      <div className="absolute -bottom-px -right-px w-5 h-5 border-b border-r border-ember/50 z-10" />
      {children}
    </div>
  )
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
            {['Brand & Commercial', 'AI Video', 'Product & Ecommerce', 'Social Video', 'Post Production', 'Drone & Aerial', 'eLearning', 'Other'].map(s => (
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
