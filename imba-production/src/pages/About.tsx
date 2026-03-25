import { Link } from 'react-router-dom'

const TEAM = [
  {
    name: 'Ljubica Jevremovic',
    role: 'Partner & Creative Director',
    bio: 'A visionary video producer who has worked for leading Silicon Valley brands. The creative engine of Imba Production — she brings cinematic craft and bold storytelling to every project.',
    initials: 'LJ',
    color: '#C9A96E',
  },
  {
    name: 'Marko Tiosavljevic',
    role: 'Partner & Marketing Strategist',
    bio: '20+ years in creative and digital marketing. Ensures every video is built around a clear business strategy — driving leads, sales, and brand equity for clients worldwide.',
    initials: 'MT',
    color: '#E8452A',
  },
]

const VALUES = [
  {
    n: '01',
    title: 'Cinematic craft',
    desc: 'We treat every frame as art. From pre-production planning to final colour grade, the standard is broadcast quality — regardless of project size or budget.',
  },
  {
    n: '02',
    title: 'Strategy first',
    desc: 'Beautiful video that doesn\'t convert is a decoration. Every project is built around a measurable goal: more leads, more sales, stronger brand recall.',
  },
  {
    n: '03',
    title: 'True partnership',
    desc: 'We immerse ourselves in your brand. Your vision, goals, and audience guide every creative decision — we function as an extension of your team, not a vendor.',
  },
  {
    n: '04',
    title: 'Speed without compromise',
    desc: '48-hour turnarounds are possible because we\'ve engineered an efficient production pipeline. Fast delivery never means lower quality — our workflow guarantees both.',
  },
]

const STATS = [
  { num: '12', sup: '+', label: 'Years producing' },
  { num: '500', sup: '+', label: 'Videos crafted' },
  { num: '20', sup: '+', label: 'Service types' },
  { num: '48', sup: 'h', label: 'Average delivery' },
]

const CLIENTS = [
  'FoodCo International', 'NordShop', 'Velour Boutique', 'Irving Books',
  'Kozica Soaps', 'Ogitive', 'Massive Movie Horse', 'Prime Real Estate',
]

const TESTIMONIALS = [
  {
    name: 'Predrag Kozica',
    company: 'Kozica Soaps',
    text: 'Imba Productions exceeded our expectations with their professionalism and creativity. The results spoke for themselves.',
  },
  {
    name: 'Bojan Ilić',
    role: 'CEO',
    company: 'Massive Movie Horse',
    text: 'Great cooperation with Ljubica and the Imba team. They provided great feedback and guided us through the entire process.',
  },
  {
    name: 'Dragan Dragovic',
    role: 'Developer & SEO Expert',
    company: 'Ogitive',
    text: 'I loved working with Imba Production. Their expertise helped us build a complete ecommerce presence from the ground up.',
  },
]

export default function About() {
  return (
    <>
      {/* ── PAGE HERO ─────────────────────────────────────── */}
      <section className="pt-36 pb-20 px-6 lg:px-12 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />
        <div className="absolute top-0 left-0 w-[50vw] h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 0% 40%, rgba(201,169,110,0.06) 0%, transparent 65%)' }}
        />
        <div className="relative max-w-screen-xl mx-auto">
          <p className="eyebrow mb-6 reveal">Est. 2012 · Kragujevac, Serbia</p>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-display font-light leading-tight mb-6 reveal reveal-delay-1"
                style={{ fontSize: 'clamp(2.8rem, 5.5vw, 5rem)' }}>
                A next-generation<br />
                <em className="text-gold italic">video studio</em><br />
                built for results
              </h1>
              <p className="text-smoke-dim leading-relaxed mb-8 reveal reveal-delay-2" style={{ fontSize: '1rem' }}>
                We are a team of passionate visual strategists dedicated to producing brand videos that captivate audiences and drive meaningful, measurable growth for businesses worldwide.
              </p>
              <div className="flex gap-4 reveal reveal-delay-3">
                <Link to="/work" className="btn btn-primary">See our work</Link>
                <Link to="/contact" className="btn btn-ghost">Get in touch →</Link>
              </div>
            </div>

            {/* Film reel visual */}
            <div className="relative aspect-[4/3] bg-ink-2 border border-white/5 overflow-hidden reveal reveal-delay-2 hidden lg:block">
              <div className="absolute left-4 top-0 bottom-0 flex flex-col gap-1.5 py-3 w-7">
                {Array.from({ length: 22 }).map((_, i) => (
                  <div key={i} className="flex-1 border border-white/6 bg-ink-3" />
                ))}
              </div>
              <div className="absolute right-4 top-0 bottom-0 flex flex-col gap-1.5 py-3 w-7">
                {Array.from({ length: 22 }).map((_, i) => (
                  <div key={i} className="flex-1 border border-white/6 bg-ink-3" />
                ))}
              </div>
              <div className="absolute inset-x-14 inset-y-0 flex flex-col items-center justify-center gap-6 text-center px-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center border border-ember/25"
                  style={{ background: 'rgba(232,69,42,0.08)' }}>
                  <div style={{ borderLeft: '16px solid rgba(232,69,42,0.6)', borderTop: '10px solid transparent', borderBottom: '10px solid transparent', marginLeft: '3px' }} />
                </div>
                <div>
                  <p className="font-mono-custom text-[0.58rem] tracking-[0.2em] uppercase text-smoke-faint mb-2">Our mission</p>
                  <p className="font-display font-light text-smoke/60 leading-snug" style={{ fontSize: '1.05rem' }}>
                    Building content that helps<br />brands generate real sales
                  </p>
                </div>
                <div className="font-mono-custom text-[0.52rem] text-smoke-faint/25 tracking-widest">
                  imbaproduction.com · 2012 – {new Date().getFullYear()}
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(232,69,42,0.05) 0%, transparent 70%)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <div className="border-y border-white/6 grid grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ num, sup, label }, i) => (
          <div key={label} className={`px-8 lg:px-12 py-8 ${i < 3 ? 'border-r border-white/6' : ''}`}>
            <div className="font-display font-light text-smoke leading-none" style={{ fontSize: '3rem' }}>
              {num}<em className="text-ember not-italic">{sup}</em>
            </div>
            <div className="font-mono-custom text-[0.6rem] tracking-[0.18em] uppercase text-smoke-faint mt-2">{label}</div>
          </div>
        ))}
      </div>

      {/* ── MISSION / WHAT WE DO ──────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-ink-2">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="eyebrow mb-4 reveal">What we do</p>
            <h2 className="font-display font-light leading-tight mb-8 reveal reveal-delay-1"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
              We build content that<br /><em className="text-gold italic">generates sales</em>
            </h2>
            <div className="space-y-5 text-smoke-dim leading-relaxed reveal reveal-delay-2" style={{ fontSize: '0.95rem' }}>
              <p>Founded in 2012, Imba Production is a digital brand-focused video production studio empowering businesses worldwide with high-impact video content for their marketing.</p>
              <p>We combine cinematic craft with AI-powered strategy to create videos that don't just look beautiful — they drive clicks, conversions, and lasting brand loyalty.</p>
              <p>From brand films and ecommerce product videos to TikTok content, drone cinematography, eLearning, and AI-generated campaigns — we cover every format, every platform, every business goal.</p>
            </div>
          </div>

          {/* Services list */}
          <div className="reveal reveal-delay-2">
            <p className="font-mono-custom text-[0.65rem] tracking-[0.18em] uppercase text-smoke-faint mb-6">What we produce</p>
            <div className="grid grid-cols-2 gap-x-4">
              {[
                'Brand & Commercial Video', 'AI-Powered Video',
                'Product & Ecommerce', 'Cooking & Food Video',
                'TikTok & Social Reels', 'Drone & Aerial',
                'Post Production', 'eLearning Video',
                'Fashion Video', 'Testimonial Videos',
                'YouTube Production', 'White Label Production',
              ].map(s => (
                <div key={s} className="flex items-center gap-2 py-2.5 border-b border-white/5">
                  <div className="w-1 h-1 rounded-full bg-ember flex-shrink-0" />
                  <span className="font-mono-custom text-[0.62rem] tracking-wide text-smoke-dim">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ──────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-ink">
        <div className="max-w-screen-xl mx-auto">
          <p className="eyebrow mb-4 reveal">The team</p>
          <h2 className="font-display font-light leading-tight mb-14 reveal reveal-delay-1"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
            The people behind<br /><em className="text-gold italic">the lens</em>
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
            {TEAM.map((member, i) => (
              <div key={member.name}
                className="bg-ink-2 border border-white/5 p-8 hover:border-white/10 transition-colors reveal"
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center font-mono-custom text-lg font-medium mb-6"
                  style={{ background: `${member.color}15`, border: `1px solid ${member.color}30`, color: member.color }}>
                  {member.initials}
                </div>
                <h3 className="font-display font-light text-smoke text-2xl mb-1">{member.name}</h3>
                <p className="font-mono-custom text-[0.62rem] tracking-[0.16em] uppercase mb-5" style={{ color: member.color }}>{member.role}</p>
                <p className="text-smoke-dim leading-relaxed" style={{ fontSize: '0.88rem' }}>{member.bio}</p>
              </div>
            ))}
          </div>
          <p className="font-mono-custom text-[0.62rem] tracking-widest uppercase text-smoke-faint/35 mt-10 reveal">
            + specialist videographers, editors, colorists, and motion designers across Europe & US
          </p>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-ink-2">
        <div className="max-w-screen-xl mx-auto">
          <p className="eyebrow mb-4 reveal">Why choose us</p>
          <h2 className="font-display font-light leading-tight mb-14 reveal reveal-delay-1"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
            How we work,<br /><em className="text-gold italic">why it matters</em>
          </h2>
          <div className="grid md:grid-cols-2 gap-px bg-white/5">
            {VALUES.map(({ n, title, desc }, i) => (
              <div key={n}
                className="bg-ink-2 p-10 hover:bg-ink-3 transition-colors reveal"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="font-mono-custom text-[0.65rem] text-ember/70">{n}</span>
                <h3 className="font-display font-light text-smoke text-2xl mt-3 mb-4">{title}</h3>
                <p className="text-smoke-dim leading-relaxed" style={{ fontSize: '0.9rem' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-ink">
        <div className="max-w-screen-xl mx-auto">
          <p className="eyebrow mb-4 reveal">Client voice</p>
          <h2 className="font-display font-light leading-tight mb-14 reveal reveal-delay-1"
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
            What our clients <em className="text-gold italic">say</em>
          </h2>
          <div className="grid md:grid-cols-3 gap-px bg-white/5">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="bg-ink p-8 relative reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="absolute top-5 right-6 font-display text-[5rem] font-light leading-none select-none"
                  style={{ color: 'rgba(232,69,42,0.05)' }}>"</div>
                <p className="font-display text-lg font-light italic text-smoke/80 leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-mono-custom text-[0.6rem]"
                    style={{ background: 'rgba(232,69,42,0.1)', border: '1px solid rgba(232,69,42,0.2)', color: '#E8452A' }}>
                    {t.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm text-smoke font-medium">{t.name}</p>
                    <p className="font-mono-custom text-[0.58rem] tracking-wider text-smoke-faint">
                      {t.role ? `${t.role} · ` : ''}{t.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLIENTS ───────────────────────────────────────── */}
      <section className="py-16 px-6 lg:px-12 bg-ink-2 border-t border-white/5">
        <div className="max-w-screen-xl mx-auto">
          <p className="font-mono-custom text-[0.62rem] tracking-[0.2em] uppercase text-smoke-faint/50 mb-8 text-center reveal">
            Trusted by brands worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 reveal reveal-delay-1">
            {CLIENTS.map(c => (
              <span key={c} className="font-mono-custom text-[0.65rem] tracking-[0.14em] uppercase text-smoke-faint/35 hover:text-smoke-faint transition-colors">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#E8452A' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 8px)',
        }} />
        <div className="relative px-6 lg:px-12 py-20 max-w-screen-xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <h2 className="font-display font-light leading-tight text-ink"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)' }}>
              Ready to work<br /><em>together?</em>
            </h2>
            <p className="text-ink/60 mt-3" style={{ fontSize: '0.95rem' }}>
              Free consultation · Free estimate · Reply within 24 hours.
            </p>
          </div>
          <Link to="/contact"
            className="flex-shrink-0 font-mono-custom text-[0.7rem] tracking-[0.14em] uppercase px-8 py-4"
            style={{ background: '#0A0A0B', color: '#F5F4F0' }}>
            Get a free quote
          </Link>
        </div>
      </section>
    </>
  )
}
