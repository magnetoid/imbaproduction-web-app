import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

interface StatRow      { num: string;       label: string }
interface FeatureRow   { title: string;     desc: string }
interface ProcessRow   { n: string;         title: string; desc: string }
interface PortfolioRow { youtube_id: string; title: string; client: string }
interface ShortRow     { youtube_id: string; title: string }
interface FaqRow       { q: string;         a: string }

interface FormState {
  slug: string
  service_key: string
  icon: string
  label: string
  tagline: string
  color: string
  hero_desc: string
  stats: StatRow[]
  features: FeatureRow[]
  process: ProcessRow[]
  portfolio: PortfolioRow[]
  shorts: ShortRow[]
  faq: FaqRow[]
  sort_order: number
  published: boolean
}

const EMPTY_FORM: FormState = {
  slug: '',
  service_key: '',
  icon: '◆',
  label: '',
  tagline: '',
  color: '#D97757',
  hero_desc: '',
  stats: [],
  features: [],
  process: [],
  portfolio: [],
  shorts: [],
  faq: [],
  sort_order: 0,
  published: true,
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// Helpers to mutate ordered arrays
function moveItem<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir
  if (target < 0 || target >= arr.length) return arr
  const next = [...arr]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export default function ServiceEdit() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [originalLabel, setOriginalLabel] = useState('')

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    supabase.from('services').select('*').eq('id', id!).single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError(err?.message || 'Service not found')
          setLoading(false)
          return
        }
        setOriginalLabel(data.label)
        setForm({
          slug: data.slug,
          service_key: data.service_key || '',
          icon: data.icon || '◆',
          label: data.label,
          tagline: data.tagline || '',
          color: data.color || '#D97757',
          hero_desc: data.hero_desc || '',
          stats: (data.stats as StatRow[]) || [],
          features: (data.features as FeatureRow[]) || [],
          process: (data.process as ProcessRow[]) || [],
          portfolio: (data.portfolio as PortfolioRow[]) || [],
          shorts: (data.shorts as ShortRow[]) || [],
          faq: (data.faq as FaqRow[]) || [],
          sort_order: data.sort_order ?? 0,
          published: data.published,
        })
        setLoading(false)
      })
  }, [id, isEdit])

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault()
    if (!form.label.trim()) { setError('Label is required'); return }
    setSaving(true)
    setError('')
    const payload = {
      slug: form.slug || toSlug(form.label),
      service_key: form.service_key || toSlug(form.label),
      icon: form.icon || null,
      label: form.label,
      tagline: form.tagline || null,
      color: form.color || null,
      hero_desc: form.hero_desc || null,
      stats: form.stats,
      features: form.features,
      process: form.process,
      portfolio: form.portfolio,
      shorts: form.shorts,
      faq: form.faq,
      sort_order: form.sort_order,
      published: form.published,
    }
    const { error: err } = isEdit
      ? await supabase.from('services').update(payload).eq('id', id!)
      : await supabase.from('services').insert(payload)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    navigate('/admin/services')
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8 gap-4">
        <button
          onClick={() => navigate('/admin/services')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to services
        </button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/services')}>Cancel</Button>
          <Button onClick={() => handleSave()} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save</>}
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">
          {isEdit ? 'Edit service' : 'New service'}
        </p>
        <h1 className="text-3xl font-semibold text-foreground truncate">
          {isEdit ? (originalLabel || form.label || 'Untitled') : (form.label || 'New service')}
        </h1>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Identity</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="s-label">Label *</Label>
                  <Input
                    id="s-label"
                    value={form.label}
                    onChange={e => setForm(f => ({ ...f, label: e.target.value, slug: f.slug || toSlug(e.target.value), service_key: f.service_key || toSlug(e.target.value).split('-')[0] }))}
                    placeholder="e.g. Brand & Commercial Video"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="s-tagline">Tagline</Label>
                  <Input
                    id="s-tagline"
                    value={form.tagline}
                    onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                    placeholder="One-liner under the hero"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="s-slug">Slug</Label>
                  <Input
                    id="s-slug"
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))}
                    placeholder="auto-from-label"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="s-key">Key</Label>
                  <Input
                    id="s-key"
                    value={form.service_key}
                    onChange={e => setForm(f => ({ ...f, service_key: e.target.value }))}
                    placeholder="brand / ai / product…"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="s-icon">Icon glyph</Label>
                  <Input
                    id="s-icon"
                    value={form.icon}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    placeholder="◆"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="s-hero">Hero description</Label>
                <Textarea
                  id="s-hero"
                  value={form.hero_desc}
                  onChange={e => setForm(f => ({ ...f, hero_desc: e.target.value }))}
                  rows={5}
                  placeholder="The long paragraph at the top of the service detail page."
                />
              </div>
            </CardContent>
          </Card>

          <RowEditor
            title="Stats"
            help="4 little KPI tiles next to the hero (e.g. 80% / 12+ years)."
            rows={form.stats}
            onChange={v => setForm(f => ({ ...f, stats: v }))}
            blank={{ num: '', label: '' }}
            render={(row, set) => (
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="num (80%)" value={row.num} onChange={e => set({ ...row, num: e.target.value })} />
                <Input className="col-span-2" placeholder="label" value={row.label} onChange={e => set({ ...row, label: e.target.value })} />
              </div>
            )}
          />

          <RowEditor
            title="Features"
            help="What we deliver — title + 1–2 sentence description per feature."
            rows={form.features}
            onChange={v => setForm(f => ({ ...f, features: v }))}
            blank={{ title: '', desc: '' }}
            render={(row, set) => (
              <div className="flex flex-col gap-2">
                <Input placeholder="title" value={row.title} onChange={e => set({ ...row, title: e.target.value })} />
                <Textarea rows={2} placeholder="description" value={row.desc} onChange={e => set({ ...row, desc: e.target.value })} />
              </div>
            )}
          />

          <RowEditor
            title="Process"
            help="Step-by-step list. n is the badge (01, 02), title + desc per step."
            rows={form.process}
            onChange={v => setForm(f => ({ ...f, process: v }))}
            blank={{ n: '', title: '', desc: '' }}
            render={(row, set) => (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[80px_1fr] gap-2">
                  <Input placeholder="01" value={row.n} onChange={e => set({ ...row, n: e.target.value })} />
                  <Input placeholder="step title" value={row.title} onChange={e => set({ ...row, title: e.target.value })} />
                </div>
                <Textarea rows={2} placeholder="description" value={row.desc} onChange={e => set({ ...row, desc: e.target.value })} />
              </div>
            )}
          />

          <RowEditor
            title="Portfolio examples"
            help="Featured videos shown on this service page."
            rows={form.portfolio}
            onChange={v => setForm(f => ({ ...f, portfolio: v }))}
            blank={{ youtube_id: '', title: '', client: '' }}
            render={(row, set) => (
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="YouTube ID" value={row.youtube_id} onChange={e => set({ ...row, youtube_id: e.target.value.trim() })} />
                <Input placeholder="title" value={row.title} onChange={e => set({ ...row, title: e.target.value })} />
                <Input placeholder="client" value={row.client} onChange={e => set({ ...row, client: e.target.value })} />
              </div>
            )}
          />

          <RowEditor
            title="Shorts (optional)"
            help="Vertical / short-form examples. Only used by service pages that have them."
            rows={form.shorts}
            onChange={v => setForm(f => ({ ...f, shorts: v }))}
            blank={{ youtube_id: '', title: '' }}
            render={(row, set) => (
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="YouTube ID" value={row.youtube_id} onChange={e => set({ ...row, youtube_id: e.target.value.trim() })} />
                <Input placeholder="title" value={row.title} onChange={e => set({ ...row, title: e.target.value })} />
              </div>
            )}
          />

          <RowEditor
            title="FAQ"
            help="Question + answer pairs surfaced on the service detail page and as FAQPage schema."
            rows={form.faq}
            onChange={v => setForm(f => ({ ...f, faq: v }))}
            blank={{ q: '', a: '' }}
            render={(row, set) => (
              <div className="flex flex-col gap-2">
                <Input placeholder="question" value={row.q} onChange={e => set({ ...row, q: e.target.value })} />
                <Textarea rows={3} placeholder="answer" value={row.a} onChange={e => set({ ...row, a: e.target.value })} />
              </div>
            )}
          />
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Publish</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Switch id="s-published" checked={form.published}
                  onCheckedChange={c => setForm(f => ({ ...f, published: c }))} />
                <Label htmlFor="s-published">Published</Label>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="s-order">Sort order</Label>
                <Input
                  id="s-order"
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Theme</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="s-color">Accent colour</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="s-color"
                    type="color"
                    value={form.color}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={form.color}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    placeholder="#D97757"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Used on the service hero icon and CTAs.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="lg:col-span-3">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="lg:col-span-3 flex items-center justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/services')}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save service</>}
          </Button>
        </div>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Generic ordered-array editor used for every nested section.

function RowEditor<T>({
  title,
  help,
  rows,
  onChange,
  blank,
  render,
}: {
  title: string
  help?: string
  rows: T[]
  onChange: (v: T[]) => void
  blank: T
  render: (row: T, set: (next: T) => void) => React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {help && <p className="text-xs text-muted-foreground">{help}</p>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {rows.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No rows yet.</p>
        )}
        {rows.map((row, idx) => (
          <div key={idx} className="border border-border rounded-md p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[0.6rem] font-mono text-muted-foreground tracking-widest uppercase">
                {String(idx + 1).padStart(2, '0')} / {String(rows.length).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={idx === 0}
                  onClick={() => onChange(moveItem(rows, idx, -1))}
                  aria-label="Move up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={idx === rows.length - 1}
                  onClick={() => onChange(moveItem(rows, idx, 1))}
                  aria-label="Move down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => onChange(rows.filter((_, i) => i !== idx))}
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {render(row, next => onChange(rows.map((r, i) => i === idx ? next : r)))}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => onChange([...rows, blank])}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add row
        </Button>
      </CardContent>
    </Card>
  )
}
