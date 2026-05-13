import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSiteSettings } from '@/lib/site-settings'
import Seo from '@/components/Seo'
import PageHero from '@/components/ui/PageHero'

const SERVICES = [
  'Brand & Commercial Video',
  'AI-Powered Video',
  'Product & Ecommerce Video',
  'Short & Social Video',
  'Post Production & VFX',
  'eLearning Video',
  'Other',
]

const BUDGETS = [
  'Under $5,000',
  '$5,000 – $15,000',
  '$15,000 – $30,000',
  '$30,000 – $75,000',
  '$75,000+',
]

const FAQ = [
  {
    q: 'How long does a typical project take?',
    a: 'Most brand video projects are delivered in 2–4 weeks from brief to final cut. Rush delivery in 48–72 hours is available for product and social content.',
  },
  {
    q: 'Do you work with international clients?',
    a: 'Yes — we work remotely with brands across North America, Europe, and the Middle East. For on-location shoots we travel globally.',
  },
  {
    q: 'What does the creative process look like?',
    a: 'We start with a discovery call to understand your goals, then deliver a concept, script, and production plan. Once approved, we shoot, edit, and deliver. You get two rounds of revisions included.',
  },
  {
    q: 'Can you handle everything in-house?',
    a: 'Yes — from pre-production and scripting through shoot, post-production, colour grade, sound design, and motion graphics. AI video, post-production, and editing are all dedicated in-house capabilities.',
  },
]

export default function Contact() {
  const site = useSiteSettings()
  const addr = site.contact_address
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    company: '',
    service_type: '',
    budget_range: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.message) {
      setError('Please fill in name, email and message.')
      return
    }
    setSubmitting(true)
    setError('')
    const { error: err } = await supabase.from('quote_requests').insert([form])
    setSubmitting(false)
    if (err) {
      setError('Something went wrong. Please try again or email us directly.')
    } else {
      setSubmitted(true)
    }
  }

  return (
    <>
      <Seo
        title="Contact — Free Strategy Call in 24 Hours"
        description="Tell us what you're trying to achieve. We'll reply in 24 hours with a creative plan and a fixed-price quote — free, with zero pressure."
        canonicalPath="/contact"
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <PageHero
        eyebrow="Tell us what you're shipping"
        title="A producer reads every brief."
        titleAccent="You'll have a plan in 24 hours."
        subtitle="No sales calls. No automated funnels. Real humans, real production timelines, real fixed-fee quotes."
        glow="right"
      />

      {/* ── FORM + INFO ──────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-12 bg-ink-2">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16">

          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="flex flex-col items-start gap-6 py-12">
                <div className="w-12 h-12 rounded-full bg-ember/15 flex items-center justify-center">
                  <span className="text-ember text-xl">✓</span>
                </div>
                <div>
                  <h2 className="font-display font-bold text-3xl text-smoke mb-3">
                    Message sent.
                  </h2>
                  <p className="text-smoke-dim text-base" style={{ fontWeight: 300 }}>
                    We'll be in touch within 24 hours. In the meantime, browse{' '}
                    <a href="/work" className="text-smoke underline underline-offset-4 hover:text-ember transition-colors">our work</a>.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="form-label">Full name *</label>
                    <input className="form-input" type="text" placeholder="Jane Smith"
                      value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" placeholder="jane@company.com"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="form-label">Company</label>
                  <input className="form-input" type="text" placeholder="Your company or brand"
                    value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="form-label">Service type</label>
                    <select className="form-select" value={form.service_type}
                      onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}>
                      <option value="">Select a service</option>
                      {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Budget range</label>
                    <select className="form-select" value={form.budget_range}
                      onChange={e => setForm(f => ({ ...f, budget_range: e.target.value }))}>
                      <option value="">Select a range</option>
                      {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Tell us about your project *</label>
                  <textarea className="form-textarea" rows={5}
                    placeholder="What are you creating? What's the goal? Any timeline or format requirements?"
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </div>

                {error && (
                  <p className="text-ember text-sm">{error}</p>
                )}

                <div>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Send message →'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            <div>
              <p className="eyebrow mb-5">Direct contact</p>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-mono-custom text-[0.65rem] tracking-wider text-smoke-faint uppercase mb-1">Email</p>
                  <a href={`mailto:${site.contact_email}`}
                    className="text-smoke hover:text-ember transition-colors text-base">
                    {site.contact_email}
                  </a>
                </div>
                <div>
                  <p className="font-mono-custom text-[0.65rem] tracking-wider text-smoke-faint uppercase mb-1">Address</p>
                  <p className="text-smoke-dim text-base" style={{ fontWeight: 300 }}>
                    {addr.line1 && <>{addr.line1}<br /></>}
                    {addr.line2 && <>{addr.line2}<br /></>}
                    {[addr.city, addr.region, addr.postal].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="eyebrow mb-5">Response time</p>
              <p className="text-smoke-dim text-base" style={{ fontWeight: 300 }}>
                {site.contact_response}
              </p>
            </div>

            <div>
              <p className="eyebrow mb-5">Follow our work</p>
              <div className="flex gap-4">
                {[
                  { label: 'Instagram', href: 'https://instagram.com/imbaproduction' },
                  { label: 'YouTube', href: 'https://youtube.com/@imbaproduction' },
                  { label: 'LinkedIn', href: 'https://linkedin.com/company/imbaproduction' },
                ].map(({ label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="font-mono-custom text-[0.65rem] tracking-wider text-smoke-faint hover:text-smoke uppercase transition-colors">
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-12 bg-ink">
        <div className="max-w-screen-xl mx-auto">
          <p className="eyebrow mb-8 reveal">Common questions</p>
          <div className="max-w-2xl flex flex-col divide-y divide-white/8">
            {FAQ.map((item, i) => (
              <div key={i} className="py-5">
                <button
                  className="w-full flex items-center justify-between text-left gap-4 group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-display font-bold text-lg text-smoke group-hover:text-smoke transition-colors">
                    {item.q}
                  </span>
                  <span className="text-smoke-faint flex-shrink-0 transition-transform duration-200"
                    style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <p className="mt-3 text-smoke-dim text-base leading-relaxed" style={{ fontWeight: 300 }}>
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-12 bg-ink border-y border-white/[0.06]">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <div className="angular-divider mb-6 w-24" />
            <p className="font-display font-normal text-2xl text-smoke mb-2">
              Prefer to skip the form?
            </p>
            <p className="text-smoke-dim text-sm" style={{ fontWeight: 300 }}>
              We have space for three more projects this month. Email us directly.
            </p>
          </div>
          <a href={`mailto:${site.contact_email}`} className="btn btn-primary flex-shrink-0">
            Email us directly →
          </a>
        </div>
      </section>
    </>
  )
}
