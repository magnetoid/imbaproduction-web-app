import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Save } from 'lucide-react'

const EMPTY_FORM = {
  youtube_id: '',
  title: '',
  slide_eyebrow: '',
  slide_headline: '',
  slide_headline_em: '',
  slide_subheadline: '',
  slide_image_url: '',
  slide_primary_cta_label: '',
  slide_primary_cta_href: '',
  slide_secondary_cta_label: '',
  slide_secondary_cta_href: '',
  sort_order: 0,
  active: true,
}

type FormState = typeof EMPTY_FORM

export default function HeroVideoEdit() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [originalTitle, setOriginalTitle] = useState('')

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    supabase.from('hero_videos').select('*').eq('id', id!).single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError(err?.message || 'Hero video not found')
          setLoading(false)
          return
        }
        setOriginalTitle(data.title)
        setForm({
          youtube_id: data.youtube_id,
          title: data.title,
          slide_eyebrow: data.slide_eyebrow || '',
          slide_headline: data.slide_headline || '',
          slide_headline_em: data.slide_headline_em || '',
          slide_subheadline: data.slide_subheadline || '',
          slide_image_url: data.slide_image_url || '',
          slide_primary_cta_label: data.slide_primary_cta_label || '',
          slide_primary_cta_href: data.slide_primary_cta_href || '',
          slide_secondary_cta_label: data.slide_secondary_cta_label || '',
          slide_secondary_cta_href: data.slide_secondary_cta_href || '',
          sort_order: data.sort_order ?? 0,
          active: data.active,
        })
        setLoading(false)
      })
  }, [id, isEdit])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.youtube_id.trim()) { setError('YouTube ID is required'); return }
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    if (isEdit) {
      const { error: err } = await supabase.from('hero_videos').update(form).eq('id', id!)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('hero_videos').insert([form])
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false)
    navigate('/admin/hero-videos')
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  const thumbPreview = form.slide_image_url
    || (form.youtube_id ? `https://img.youtube.com/vi/${form.youtube_id}/mqdefault.jpg` : '')

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8 gap-4">
        <button
          onClick={() => navigate('/admin/hero-videos')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to hero slider
        </button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/hero-videos')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save</>}
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">
          {isEdit ? 'Edit hero slide' : 'New hero slide'}
        </p>
        <h1 className="text-3xl font-semibold text-foreground truncate">
          {isEdit ? (originalTitle || form.title || 'Untitled') : (form.title || 'New hero slide')}
        </h1>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Slide content</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="h-yt">YouTube Video ID *</Label>
                  <Input
                    id="h-yt"
                    value={form.youtube_id}
                    onChange={e => setForm(f => ({ ...f, youtube_id: e.target.value.trim() }))}
                    placeholder="e.g. SgHHbWp64cE"
                  />
                  <p className="text-xs text-muted-foreground">After ?v= in youtube.com/watch?v=…</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="h-title">Internal title *</Label>
                  <Input
                    id="h-title"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Perfume Ad"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="h-eyebrow">Eyebrow label</Label>
                <Input
                  id="h-eyebrow"
                  value={form.slide_eyebrow}
                  onChange={e => setForm(f => ({ ...f, slide_eyebrow: e.target.value }))}
                  placeholder="e.g. Brand & Commercial"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="h-head">Headline — first line</Label>
                  <Input
                    id="h-head"
                    value={form.slide_headline}
                    onChange={e => setForm(f => ({ ...f, slide_headline: e.target.value }))}
                    placeholder="e.g. Stories that define"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="h-headem">Headline — italic gold line</Label>
                  <Input
                    id="h-headem"
                    value={form.slide_headline_em}
                    onChange={e => setForm(f => ({ ...f, slide_headline_em: e.target.value }))}
                    placeholder="e.g. your brand."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="h-sub">Subheadline</Label>
                <Input
                  id="h-sub"
                  value={form.slide_subheadline}
                  onChange={e => setForm(f => ({ ...f, slide_subheadline: e.target.value }))}
                  placeholder="Supporting text under the headline"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="h-img">Slide background image URL</Label>
                <Input
                  id="h-img"
                  value={form.slide_image_url}
                  onChange={e => setForm(f => ({ ...f, slide_image_url: e.target.value.trim() }))}
                  placeholder="https://… (leave blank for YouTube thumbnail)"
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Overrides the YouTube thumbnail as the slide background. The video still plays from the YouTube ID.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Call-to-action buttons</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground">
                Optional. Leave blank to use defaults (primary → "See our work" /work, ghost → "Start a project" /contact). Href can be internal (e.g. /contact) or external URL.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Primary button — label</Label>
                  <Input
                    value={form.slide_primary_cta_label}
                    onChange={e => setForm(f => ({ ...f, slide_primary_cta_label: e.target.value }))}
                    placeholder="e.g. See our work"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Primary button — link</Label>
                  <Input
                    value={form.slide_primary_cta_href}
                    onChange={e => setForm(f => ({ ...f, slide_primary_cta_href: e.target.value.trim() }))}
                    placeholder="e.g. /work"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Ghost button — label</Label>
                  <Input
                    value={form.slide_secondary_cta_label}
                    onChange={e => setForm(f => ({ ...f, slide_secondary_cta_label: e.target.value }))}
                    placeholder="e.g. Start a project"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Ghost button — link</Label>
                  <Input
                    value={form.slide_secondary_cta_href}
                    onChange={e => setForm(f => ({ ...f, slide_secondary_cta_href: e.target.value.trim() }))}
                    placeholder="e.g. /contact"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Publish</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Switch id="h-active" checked={form.active}
                  onCheckedChange={c => setForm(f => ({ ...f, active: c }))} />
                <Label htmlFor="h-active">Active (show on site)</Label>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="h-order">Sort order</Label>
                <Input
                  id="h-order"
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                />
                <p className="text-xs text-muted-foreground">Lower numbers play first.</p>
              </div>
            </CardContent>
          </Card>

          {thumbPreview && (
            <Card>
              <CardHeader><CardTitle className="text-base">Preview</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">
                  {form.slide_image_url ? 'Custom image' : 'YouTube thumbnail'}
                </p>
                <img
                  src={thumbPreview}
                  alt="thumbnail"
                  className="w-full rounded border border-border object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {error && (
          <div className="lg:col-span-3">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="lg:col-span-3 flex items-center justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/hero-videos')}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save slide</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
