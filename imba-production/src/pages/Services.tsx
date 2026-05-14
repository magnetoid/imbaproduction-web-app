import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Seo from '@/components/Seo'
import PageHero from '@/components/ui/PageHero'
import { fetchServices } from './services/data'
import type { ServiceData } from './services/data'

const FALLBACK_SERVICES = [
  {
    key: 'brand', slug: 'brand-video',
    icon: '▶',
    label: 'Brand & Commercial Video',
    tagline: 'Brand films that make customers choose you',
    desc: 'Brand stories, product launches, and commercial spots built to lift engagement 80% above static ads — and turn viewers into loyal buyers across every channel.',
    features: ['Brand story films', 'Product launch videos', 'Corporate culture & profiles', 'Event & campaign coverage'],
    stat: '80%',
    statLabel: 'higher engagement vs. static ads',
    color: '#FAFAFA',
  },
  {
    key: 'ai', slug: 'ai-video',
    icon: '◈',
    label: 'AI-Powered Video',
    tagline: '10× your content output without 10× the budget',
    desc: 'AI-augmented scripts, generative B-roll, and personalised video at scale. The same tools Fortune 500 brands use — delivering 3× higher response rates at a fraction of traditional cost.',
    features: ['AI-driven editing & post-production', 'Script & storyboard generation', 'Personalised video at scale', 'AI avatar production & explainers'],
    stat: '3×',
    statLabel: 'more response rates with AI video',
    color: '#FAFAFA',
  },
  {
    key: 'product', slug: 'product-video',
    icon: '▣',
    label: 'Product & Ecommerce',
    tagline: 'Turn scrollers into buyers — in under 60 seconds',
    desc: 'Product demos, unboxing, and ecommerce spots that lift conversions up to 80%. Built for Amazon, Shopify, and paid social — with cutdowns in every aspect ratio included.',
    features: ['Product demonstration videos', 'Cooking & recipe content', 'eCommerce ad spots', 'Customer testimonial videos'],
    stat: '80%',
    statLabel: 'increase in conversions with product video',
    color: '#6C7AE0',
  },
  {
    key: 'social', slug: 'social-video',
    icon: '◉',
    label: 'Short & Social (TikTok / Reels)',
    tagline: 'Vertical content built to go viral — on purpose',
    desc: 'TikTok, Reels, and Shorts crafted for the scroll-first viewer. Trending formats, sticky hooks, and cutdown-ready exports — engineered to win the algorithm and your audience.',
    features: ['TikTok brand & product videos', 'Instagram Reels & Stories', 'YouTube Shorts', 'Promotional teasers & ad spots'],
    stat: '2B+',
    statLabel: 'monthly YouTube users reachable',
    color: '#3CBFAE',
  },
  {
    key: 'cooking', slug: 'cooking-video',
    icon: '◎',
    label: 'Cooking & Food Video',
    tagline: 'Make food impossible to scroll past',
    desc: 'Specialist cooking content that fills tables and sells products — recipe reels, restaurant promos, and food ecommerce spots. Styling, props, and lighting all handled in-house.',
    features: ['Recipe & tutorial videos', 'Restaurant & brand promos', 'Social media food content', 'eCommerce food product videos'],
    stat: '12M+',
    statLabel: 'views on client cooking content',
    color: '#E87A2A',
  },
  {
    key: 'post', slug: 'post-production',
    icon: '◫',
    label: 'Post Production',
    tagline: 'Send us the footage. Get back content that performs.',
    desc: 'Edit, colour, motion, sound, and VFX — all in-house, all broadcast-quality. Works with footage from any crew, any camera. 48-hour rush delivery when you need it yesterday.',
    features: ['Advanced editing & assembly', 'Expert colour grading & HDR', 'Motion graphics & 3D animation', 'Sound design & music licensing'],
    stat: '48h',
    statLabel: 'turnaround available',
    color: '#E87A2A',
  },
  {
    key: 'elearning', slug: 'elearning-video',
    icon: '◰',
    label: 'eLearning & Corporate Training',
    tagline: 'Training your team will actually finish',
    desc: 'eLearning video with 9× better retention than text. Scripting, presenter filming, animation, and SCORM-ready delivery — a complete module ready for your LMS in weeks.',
    features: ['Lecture & tutorial videos', 'Screen-recorded walkthroughs', 'Animated explainers', 'Corporate onboarding content'],
    stat: '80%',
    statLabel: 'of companies need training video',
    color: '#FAFAFA',
  },
  {
    key: 'fashion', slug: 'fashion-video',
    icon: '◇',
    label: 'Fashion & Lifestyle Video',
    tagline: 'Lookbooks that drive 4× higher purchase intent',
    desc: 'Cinematic fashion film for brands that lead. Lookbooks, campaigns, and social content — with full casting, wardrobe, and location production handled by a team that speaks fashion.',
    features: ['Lookbook & collection films', 'Product demonstration videos', 'Social media fashion content', 'Brand story & campaign videos'],
    stat: '4×',
    statLabel: 'higher purchase intent from fashion video',
    color: '#FAFAFA',
  },
  {
    key: 'testimonial', slug: 'testimonial-video',
    icon: '◐',
    label: 'Testimonial & Review Videos',
    tagline: 'Let your best customers sell for you',
    desc: 'Authentic testimonial films and case studies that turn hesitant prospects into confident buyers. Pre-interview prep, remote or on-location filming, and distribution strategy — all handled.',
    features: ['Customer testimonial films', 'Case study videos', 'Short-form social testimonials', 'Strategic placement & distribution'],
    stat: '92%',
    statLabel: 'of buyers trust peer recommendations',
    color: '#FAFAFA',
  },
]

const PROCESS = [
  { n: '01', title: 'Discovery & Strategy', desc: 'We immerse in your brand, audience, and goals. Every project starts with a creative brief that aligns vision with measurable business outcomes.' },
  { n: '02', title: 'Pre-Production', desc: 'Scripting, storyboarding, casting, location scouting, and shot-by-shot planning. Nothing left to chance on shoot day.' },
  { n: '03', title: 'Production', desc: 'On-location or studio shoot with our full crew, professional lighting, broadcast audio, and direction by our senior team.' },
  { n: '04', title: 'Post & Delivery', desc: 'Edit, colour grade, motion graphics, sound design. Delivered in every format you need — with revision rounds included and 48h turnaround available.' },
]

// Map fetched ServiceData -> the local rendering shape this page already uses.
// Most fields map directly; we just need to derive `desc` and `stat` from the
// service record's hero_desc/stats arrays.
function toCard(s: ServiceData): typeof FALLBACK_SERVICES[number] {
  const firstStat = s.stats[0] || { num: '', label: '' }
  const featureTitles = s.features.slice(0, 4).map(f => f.title)
  return {
    key: s.key,
    slug: s.slug,
    icon: s.icon,
    label: s.label,
    tagline: s.tagline,
    desc: s.heroDesc.slice(0, 240),
    features: featureTitles.length > 0 ? featureTitles : ['—'],
    stat: firstStat.num,
    statLabel: firstStat.label,
    color: s.color,
  }
}

export default function Services() {
  const [services, setServices] = useState(FALLBACK_SERVICES)

  useEffect(() => {
    fetchServices().then(rows => {
      if (rows.length > 0) setServices(rows.map(toCard))
    })
  }, [])

  return (
    <>
      <Seo
        title="Video Production Services — Brand Film to AI Campaigns"
        description="Brand films, AI-powered campaigns, product videos, social content, post-production, fashion, and eLearning — end-to-end video for every format."
        canonicalPath="/services"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'name': 'Imba Production Video Services',
          'url': 'https://imbaproduction.com/services',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Brand Video', 'url': 'https://imbaproduction.com/services/brand-video' },
            { '@type': 'ListItem', 'position': 2, 'name': 'AI Video', 'url': 'https://imbaproduction.com/services/ai-video' },
            { '@type': 'ListItem', 'position': 3, 'name': 'Product Video', 'url': 'https://imbaproduction.com/services/product-video' },
            { '@type': 'ListItem', 'position': 4, 'name': 'Social Video', 'url': 'https://imbaproduction.com/services/social-video' },
            { '@type': 'ListItem', 'position': 5, 'name': 'Cooking & Food Video', 'url': 'https://imbaproduction.com/services/cooking-video' },
            { '@type': 'ListItem', 'position': 6, 'name': 'Post Production', 'url': 'https://imbaproduction.com/services/post-production' },
            { '@type': 'ListItem', 'position': 7, 'name': 'eLearning Video', 'url': 'https://imbaproduction.com/services/elearning-video' },
            { '@type': 'ListItem', 'position': 8, 'name': 'Fashion & Lifestyle', 'url': 'https://imbaproduction.com/services/fashion-video' },
            { '@type': 'ListItem', 'position': 9, 'name': 'Testimonial Video', 'url': 'https://imbaproduction.com/services/testimonial-video' },
          ],
        }}
      />
      {/* ── PAGE HERO ─────────────────────────────────────── */}
      <PageHero
        eyebrow="Capabilities"
        title="One partner. Every video"
        titleAccent="you need to ship."
        subtitle="From brand films to AI campaigns, product to post — built around your KPI, not our equipment list."
        
        rightSlot={
          <div className="bg-surface border border-hairline rounded-3xl p-7">
            <p className="font-mono-custom text-[0.62rem] tracking-[0.18em] uppercase text-paper-faint mb-4">Why video works</p>
            {[
              { stat: '80%', label: 'lift in conversions with product video' },
              { stat: '92%', label: 'of buyers trust peer video' },
              { stat: '2/3', label: 'say video influenced a purchase' },
            ].map(({ stat, label }) => (
              <div key={stat} className="flex items-center gap-4 py-3 border-b border-hairline last:border-0">
                <span className="display-md text-paper text-3xl w-14 flex-shrink-0">{stat}</span>
                <span className="font-mono-custom text-[0.62rem] text-paper-dim tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        }
      />

      {/* ── SERVICES GRID ─────────────────────────────────── */}
      <section className="bg-canvas py-20 px-6 lg:px-12" id="all-services">
        <div className="max-w-screen-xl mx-auto">
          <p className="eyebrow mb-12 reveal">All services</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {services.map(({ key, slug, icon, label, tagline, desc, features, stat, statLabel, color }, i) => (
              <div
                key={key}
                className="bg-canvas p-8 relative overflow-hidden transition-colors duration-300 hover:bg-canvas reveal flex flex-col"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {/* Ghost number */}
                <span className="absolute top-4 right-5 font-display text-[4.5rem] font-light leading-none select-none"
                  style={{ color: 'rgba(255,255,255,0.03)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Icon */}
                <div className="w-10 h-10 border flex items-center justify-center mb-6 text-lg"
                  style={{ borderColor: `${color}40`, color }}>
                  {icon}
                </div>

                <h3 className="font-display font-bold text-smoke text-xl mb-1.5">{label}</h3>
                <p className="font-mono-custom text-[0.6rem] tracking-[0.14em] uppercase mb-4" style={{ color }}>{tagline}</p>
                <p className="text-sm text-ink-dim leading-relaxed mb-5">{desc}</p>

                {/* Features */}
                <ul className="space-y-1.5 mb-6 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="font-mono-custom text-[0.62rem] text-ink-dim tracking-wide">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Stat + Learn more */}
                <div className="pt-5 border-t border-hairline">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-display font-bold text-2xl" style={{ color }}>{stat}</span>
                    <span className="font-mono-custom text-[0.58rem] text-ink-faint tracking-wide">{statLabel}</span>
                  </div>
                  <Link
                    to={`/services/${slug}`}
                    className="font-mono-custom text-[0.62rem] tracking-[0.14em] uppercase flex items-center gap-2 transition-colors duration-200 hover:gap-3"
                    style={{ color }}
                  >
                    <span>Learn more</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ───────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-canvas">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="eyebrow mb-4 reveal">How we work</p>
            <h2 className="font-display font-bold leading-tight mb-12 reveal reveal-delay-1"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
              From brief to<br /><em className="italic">final cut</em>
            </h2>
            {PROCESS.map(({ n, title, desc }, i) => (
              <div key={n}
                className="flex gap-5 py-6 border-b border-hairline group hover:pl-3 transition-all duration-300 reveal"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="font-mono-custom text-[0.7rem] text-ember opacity-70 mt-1 min-w-[2rem]">{n}</span>
                <div>
                  <h3 className="font-display text-xl text-smoke mb-1.5 group-hover:text-ember transition-colors">{title}</h3>
                  <p className="text-sm text-ink-dim leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Why choose panel */}
          <div className="reveal reveal-delay-2 lg:pt-20">
            <div className="bg-canvas border border-hairline p-8">
              <p className="font-mono-custom text-[0.62rem] tracking-[0.18em] uppercase text-ink-faint mb-6">Why teams choose Imba</p>
              {[
                { title: 'Every video earns its budget', desc: 'We start from your KPIs — more leads, higher conversions, stronger recall — and work backwards. If it won\'t move the number, we won\'t shoot it.' },
                { title: 'Broadcast quality, startup pricing', desc: 'The same cameras, lighting, and sound you see in major campaigns — at a fraction of what an agency would charge. Fixed price, zero hidden costs.' },
                { title: 'AI cuts weeks off every project', desc: 'Our AI-augmented pipeline ships faster, tests more variants, and doubles down on what converts — so you get more performing content, sooner.' },
                { title: '48h delivery, worldwide', desc: 'Producing on-location across Europe and the US, delivering fully remote. Need it live this week? 48-hour rush turnarounds are standard.' },
              ].map(({ title, desc }, i) => (
                <div key={title}
                  className="flex gap-4 py-5 border-b border-hairline last:border-0"
                  style={{ transitionDelay: `${i * 60}ms` }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-ember mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-smoke font-medium text-sm mb-1">{title}</p>
                    <p className="text-ink-dim text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHITE LABEL STRIP ─────────────────────────────── */}
      <section className="bg-canvas border-t border-hairline py-16 px-6 lg:px-12">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-lg">
            <p className="eyebrow mb-3">For agencies & resellers</p>
            <h2 className="font-display font-bold text-smoke leading-tight" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
              Expand your offering — <em className="italic">under your brand</em>
            </h2>
            <p className="text-ink-dim mt-3" style={{ fontSize: '0.9rem' }}>
              Sell every video service we offer as your own. No gear to buy, no crew to hire, no delivery to manage — just one trusted partner behind your agency brand.
            </p>
          </div>
          <Link to="/contact" className="btn btn-primary flex-shrink-0">Enquire about white label</Link>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-canvas border-y border-hairline">
        <div className="relative px-6 lg:px-12 py-24 max-w-screen-xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="angular-divider mb-8 w-24" />
            <h2 className="font-display font-normal leading-[1.05] text-smoke"
              style={{ fontSize: 'clamp(2.4rem, 4.5vw, 4rem)' }}>
              Stop describing your product.<br />
              <em className="italic font-normal">Start selling it.</em>
            </h2>
            <p className="text-ink-dim mt-5 max-w-lg" style={{ fontSize: '0.98rem', fontWeight: 300 }}>
              Free strategy call. Fixed-price quote. 24-hour reply. Zero pressure.
            </p>
          </div>
          <Link to="/contact" className="btn btn-primary flex-shrink-0">
            Start a project →
          </Link>
        </div>
      </section>
    </>
  )
}
