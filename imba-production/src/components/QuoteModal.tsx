import { useState, useEffect } from 'react'
import { useQuoteModal } from '@/contexts/QuoteModalContext'
import { supabase } from '@/lib/supabase'
import PillButton from '@/components/ui/PillButton'
import PillBadge from '@/components/ui/PillBadge'
import { X, Check } from 'lucide-react'

const SERVICES = [
  'Brand & Commercial Video',
  'AI-Powered Video',
  'Product & Ecommerce Video',
  'Short & Social Video',
  'Cooking & Food Video',
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

export default function QuoteModal() {
  const { open, closeModal, preselectedService } = useQuoteModal()
  const [form, setForm] = useState({
    full_name: '', email: '', company: '', service_type: '', budget_range: '', message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(f => ({ ...f, service_type: preselectedService || '' }))
      setSubmitted(false)
      setError('')
    }
  }, [open, preselectedService])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.message) {
      setError('Please fill in your name, email, and project description.')
      return
    }
    setSubmitting(true)
    setError('')
    const { error: err } = await supabase.from('quote_requests').insert([form])
    setSubmitting(false)
    if (err) setError('Something went wrong. Please email us at hello@imbaproduction.com')
    else setSubmitted(true)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) closeModal() }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-ink-2 border border-white/[0.08] relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-white/[0.06] flex items-start justify-between gap-4">
          <div>
            <PillBadge variant="mono">Free strategy call · 24h reply · Zero pressure</PillBadge>
            <h2 className="display-md text-paper text-2xl sm:text-3xl mt-4">
              Tell us your goal
            </h2>
          </div>
          <button
            onClick={closeModal}
            aria-label="Close"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/10 text-paper-dim hover:text-paper hover:border-white/25 transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-7">
          {submitted ? (
            <div className="flex flex-col gap-5 py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.06] border border-white/[0.12]">
                <Check className="h-5 w-5 text-paper" />
              </div>
              <div>
                <h3 className="display-md text-paper text-2xl mb-2">
                  Got it. Talk soon.
                </h3>
                <p className="text-paper-dim leading-relaxed">
                  We'll reply within 24 hours with a creative plan, a fixed-price quote, and a clear timeline — tailored to what you just told us.
                </p>
              </div>
              <PillButton variant="ghost" onClick={closeModal} showArrow={false}>
                Close
              </PillButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Your name *">
                  <input
                    className="form-input"
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="Full name"
                  />
                </Field>
                <Field label="Email *">
                  <input
                    type="email"
                    className="form-input"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@company.com"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company">
                  <input
                    className="form-input"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Company name"
                  />
                </Field>
                <Field label="Service">
                  <select
                    className="form-select"
                    value={form.service_type}
                    onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                  >
                    <option value="">Select service…</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Budget range">
                <select
                  className="form-select"
                  value={form.budget_range}
                  onChange={e => setForm(f => ({ ...f, budget_range: e.target.value }))}
                >
                  <option value="">Select budget…</option>
                  {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>

              <Field label="Describe your project *">
                <textarea
                  className="form-textarea"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us about your project, goals, and timeline…"
                  rows={5}
                />
              </Field>

              {error && (
                <p className="text-sm text-paper" style={{ color: '#FF6B6B' }}>{error}</p>
              )}

              <div className="flex items-center justify-between gap-4 pt-2">
                <PillButton type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send request'}
                </PillButton>
                <span className="font-mono-custom text-[0.65rem] tracking-widest uppercase text-paper-faint/60">
                  No commitment
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="form-label">{label}</label>
      {children}
    </div>
  )
}
