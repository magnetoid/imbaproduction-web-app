import { Link } from 'react-router-dom'
import Seo from '@/components/Seo'

const SERVICES = [
  {
    key: 'brand', slug: 'brand-video',
    icon: '▶',
    label: 'Brand & Commercial Video',
    tagline: 'Cinematic films that define your identity',
    desc: 'From brand story films and product launches to company culture videos and campaign spots — we produce broadcast-quality commercial content that elevates your brand across every channel.',
    features: ['Brand story films', 'Product launch videos', 'Corporate culture & profiles', 'Event & campaign coverage'],
    stat: '80%',
    statLabel: 'higher engagement vs. static ads',
    color: '#E8452A',
  },
  {
    key: 'ai', slug: 'ai-video',
    icon: '◈',
    label: 'AI-Powered Video',
    tagline: 'Human creativity, machine speed',
    desc: 'AI-driven editing, scriptwriting, personalisation at scale, and generative B-roll. We leverage Runway, Sora, and Stable Diffusion to create campaigns that were previously impossible.',
    features: ['AI-driven editing & post-production', 'Script & storyboard generation', 'Personalised video at scale', 'AI avatar production & explainers'],
    stat: '3×',
    statLabel: 'more response rates with AI video',
    color: '#C9A96E',
  },
  {
    key: 'product', slug: 'product-video',
    icon: '▣',
    label: 'Product & Ecommerce',
    tagline: 'Videos that convert browsers into buyers',
    desc: 'Product demos, unboxing, recipe videos, and ecommerce spots — conversion-focused content built to stop the scroll and drive purchases on Amazon, Shopify, and social platforms.',
    features: ['Product demonstration videos', 'Cooking & recipe content', 'eCommerce ad spots', 'Customer testimonial videos'],
    stat: '80%',
    statLabel: 'increase in conversions with product video',
    color: '#6C7AE0',
  },
  {
    key: 'social', slug: 'social-video',
    icon: '◉',
    label: 'Short & Social (TikTok / Reels)',
    tagline: 'Native to every algorithm',
    desc: 'TikTok, Instagram Reels, and YouTube Shorts — natively crafted vertical content with special effects, trending sounds, and storytelling built for maximum organic reach and paid performance.',
    features: ['TikTok brand & product videos', 'Instagram Reels & Stories', 'YouTube Shorts', 'Promotional teasers & ad spots'],
    stat: '2B+',
    statLabel: 'monthly YouTube users reachable',
    color: '#3CBFAE',
  },
  {
    key: 'cooking', slug: 'cooking-video',
    icon: '◎',
    label: 'Cooking & Food Video',
    tagline: 'Culinary cinematography that sells',
    desc: 'We are specialist cooking video producers — blending technical expertise with culinary passion. From step-by-step recipe videos to high-end restaurant promos, we make food irresistible on screen.',
    features: ['Recipe & tutorial videos', 'Restaurant & brand promos', 'Social media food content', 'eCommerce food product videos'],
    stat: '12M+',
    statLabel: 'views on client cooking content',
    color: '#E87A2A',
  },
  {
    key: 'post', slug: 'post-production',
    icon: '◫',
    label: 'Post Production',
    tagline: 'Where raw footage becomes a masterpiece',
    desc: 'Full-service editing, colour grading, motion graphics, sound design, and VFX from our in-house studio. We also work with footage shot by other teams — just send us your files.',
    features: ['Advanced editing & assembly', 'Expert colour grading & HDR', 'Motion graphics & 3D animation', 'Sound design & music licensing'],
    stat: '48h',
    statLabel: 'turnaround available',
    color: '#E87A2A',
  },
  {
    key: 'elearning', slug: 'elearning-video',
    icon: '◰',
    label: 'eLearning & Corporate Training',
    tagline: 'Education that actually engages',
    desc: 'Professional eLearning and corporate training video production for MOOCs, LMS platforms, and internal training. We handle scripting, filming, animation, and SCORM-ready delivery.',
    features: ['Lecture & tutorial videos', 'Screen-recorded walkthroughs', 'Animated explainers', 'Corporate onboarding content'],
    stat: '80%',
    statLabel: 'of companies need training video',
    color: '#C9A96E',
  },
  {
    key: 'fashion', slug: 'fashion-video',
    icon: '◇',
    label: 'Fashion & Lifestyle Video',
    tagline: 'Style that moves',
    desc: 'Fashion videos for brands, designers, and influencers. We shoot with diverse models, high-quality lighting, and cinematic framing to showcase your products in their best light — literally.',
    features: ['Lookbook & collection films', 'Product demonstration videos', 'Social media fashion content', 'Brand story & campaign videos'],
    stat: '4×',
    statLabel: 'higher purchase intent from fashion video',
    color: '#FF5A3D',
  },
  {
    key: 'testimonial', slug: 'testimonial-video',
    icon: '◐',
    label: 'Testimonial & Review Videos',
    tagline: 'Social proof that converts',
    desc: 'Authentic testimonial videos and case studies that build trust and drive conversions. We handle pre-interviews, scripting, professional filming, and distribution-optimised editing.',
    features: ['Customer testimonial films', 'Case study videos', 'Short-form social testimonials', 'Strategic placement & distribution'],
    stat: '92%',
    statLabel: 'of buyers trust peer recommendations',
    color: '#C9A96E',
  },
]

const PROCESS = [
  { n: '01', title: 'Discovery & Strategy', desc: 'We immerse in your brand, audience, and goals. Every project starts with a creative brief that aligns vision with measurable business outcomes.' },
  { n: '02', title: 'Pre-Production', desc: 'Scripting, storyboarding, casting, location scouting, and shot-by-shot planning. Nothing left to chance on shoot day.' },
  { n: '03', title: 'Production', desc: 'On-location or studio shoot with our full crew, professional lighting, broadcast audio, and direction by our senior team.' },
  { n: '04', title: 'Post & Delivery', desc: 'Edit, colour grade, motion graphics, sound design. Delivered in every format you need — with revision rounds included and 48h turnaround available.' },
]

export default function Services() {
  return (
    <>
      <Seo
        title="Video Production Services"
        description="Brand films, AI campaigns, product videos, social content, drone, post production and eLearning — end-to-end video production for every channel and format."
        canonicalPath="/services"
      />
      {/* ── PAGE HERO ─────────────────────────────────────── */}
      <section className="pt-36 pb-20 px-6 lg:px-12 bg-ink relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />
        <div className="absolute bottom-0 right-0 w-[50vw] h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 100% 100%, rgba(201,169,110,0.06) 0%, transparent 65%)' }}
        />
        <div className="relative max-w-screen-xl mx-auto">
          <p className="eyebrow mb-5 reveal">What we create</p>
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <h1 className="font-display font-light leading-tight mb-6 reveal reveal-delay-1"
                style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)' }}>
                20 exclusive<br />
                <em className="text-gold italic">video services</em>
              </h1>
              <p className="text-smoke-dim leading-relaxed max-w-md reveal reveal-delay-2" style={{ fontSize: '0.95rem' }}>
                We create high-quality, compelling video content to captivate your audience and drive meaningful engagement. Your message resonates — enhancing brand visibility and boosting sales.
              </p>
            </div>
            <div className="hidden lg:flex flex-col gap-3 reveal reveal-delay-2">
              <div className="bg-ink-2 border border-white/5 p-6">
                <p className="font-mono-custom text-[0.62rem] tracking-[0.18em] uppercase text-smoke-faint mb-3">Why video works</p>
                {[
                  { stat: '80%', label: 'increase in conversions with product video' },
                  { stat: '92%', label: 'of buyers trust peer recommendations on video' },
                  { stat: '2/3', label: 'of shoppers say video influenced a purchase' },
                ].map(({ stat, label }) => (
                  <div key={stat} className="flex items-center gap-4 py-2.5 border-b border-white/5 last:border-0">
                    <span className="font-display font-light text-2xl text-ember w-12 flex-shrink-0">{stat}</span>
                    <span className="font-mono-custom text-[0.62rem] text-smoke-dim tracking-wide">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ─────────────────────────────────── */}
      <section className="bg-ink-2 py-20 px-6 lg:px-12" id="all-services">
        <div className="max-w-screen-xl mx-auto">
          <p className="eyebrow mb-12 reveal">All services</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
            {SERVICES.map(({ key, slug, icon, label, tagline, desc, features, stat, statLabel, color }, i) => (
              <div
                key={key}
                className="bg-ink-2 p-8 relative overflow-hidden transition-colors duration-300 hover:bg-ink-3 reveal flex flex-col"
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

                <h3 className="font-display font-light text-smoke text-xl mb-1.5">{label}</h3>
                <p className="font-mono-custom text-[0.6rem] tracking-[0.14em] uppercase mb-4" style={{ color }}>{tagline}</p>
                <p className="text-sm text-smoke-dim leading-relaxed mb-5">{desc}</p>

                {/* Features */}
                <ul className="space-y-1.5 mb-6 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="font-mono-custom text-[0.62rem] text-smoke-dim tracking-wide">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Stat + Learn more */}
                <div className="pt-5 border-t border-white/5">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-display font-light text-2xl" style={{ color }}>{stat}</span>
                    <span className="font-mono-custom text-[0.58rem] text-smoke-faint tracking-wide">{statLabel}</span>
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
      <section className="py-24 px-6 lg:px-12 bg-ink">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="eyebrow mb-4 reveal">How we work</p>
            <h2 className="font-display font-light leading-tight mb-12 reveal reveal-delay-1"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)' }}>
              From brief to<br /><em className="text-gold italic">final cut</em>
            </h2>
            {PROCESS.map(({ n, title, desc }, i) => (
              <div key={n}
                className="flex gap-5 py-6 border-b border-white/5 group hover:pl-3 transition-all duration-300 reveal"
                style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="font-mono-custom text-[0.7rem] text-ember opacity-70 mt-1 min-w-[2rem]">{n}</span>
                <div>
                  <h3 className="font-display text-xl text-smoke mb-1.5 group-hover:text-ember transition-colors">{title}</h3>
                  <p className="text-sm text-smoke-dim leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Why choose panel */}
          <div className="reveal reveal-delay-2 lg:pt-20">
            <div className="bg-ink-2 border border-white/5 p-8">
              <p className="font-mono-custom text-[0.62rem] tracking-[0.18em] uppercase text-smoke-faint mb-6">Why Imba Production</p>
              {[
                { title: 'Strategic storytelling', desc: 'Every video is built around a clear goal — more leads, stronger brand recall, or higher conversions. Beautiful content that doesn\'t convert is a decoration.' },
                { title: 'Broadcast quality', desc: 'We use professional cameras, lighting, and audio equipment. The production value you\'d expect from a major brand — at a fraction of agency pricing.' },
                { title: 'AI-augmented workflow', desc: 'We leverage cutting-edge AI tools to cut timelines, generate creative variants, and deliver data-informed content that performs.' },
                { title: 'Worldwide delivery', desc: 'Based in Serbia & US, we produce on-location globally and deliver fully remote. 48-hour turnarounds available on post-production.' },
              ].map(({ title, desc }, i) => (
                <div key={title}
                  className="flex gap-4 py-5 border-b border-white/5 last:border-0"
                  style={{ transitionDelay: `${i * 60}ms` }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-ember mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-smoke font-medium text-sm mb-1">{title}</p>
                    <p className="text-smoke-dim text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHITE LABEL STRIP ─────────────────────────────── */}
      <section className="bg-ink-2 border-t border-white/5 py-16 px-6 lg:px-12">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-lg">
            <p className="eyebrow mb-3">For agencies & resellers</p>
            <h2 className="font-display font-light text-smoke leading-tight" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
              White label production — <em className="text-gold italic">your brand, our craft</em>
            </h2>
            <p className="text-smoke-dim mt-3" style={{ fontSize: '0.9rem' }}>
              Offer our full range of video production services under your own branding. Expand your service offering without investing in equipment or a full crew.
            </p>
          </div>
          <Link to="/contact" className="btn btn-primary flex-shrink-0">Enquire about white label</Link>
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
              Don't just tell your story.<br /><em>Show it.</em>
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
