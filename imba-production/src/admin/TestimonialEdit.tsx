import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Save, Star } from 'lucide-react'

const EMPTY_FORM = {
  client_name: '',
  client_role: '',
  client_company: '',
  client_avatar_url: '',
  text: '',
  rating: 5,
  featured: false,
  published: true,
}

type FormState = typeof EMPTY_FORM

export default function TestimonialEdit() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    supabase.from('testimonials').select('*').eq('id', id!).single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError(err?.message || 'Testimonial not found')
          setLoading(false)
          return
        }
        setForm({
          client_name: data.client_name,
          client_role: data.client_role || '',
          client_company: data.client_company || '',
          client_avatar_url: data.client_avatar_url || '',
          text: data.text,
          rating: data.rating ?? 5,
          featured: data.featured,
          published: data.published,
        })
        setLoading(false)
      })
  }, [id, isEdit])

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault()
    if (!form.client_name.trim() || !form.text.trim()) {
      setError('Client name and review text are required.')
      return
    }
    setSaving(true)
    setError('')
    const payload = {
      client_name: form.client_name.trim(),
      client_role: form.client_role.trim() || null,
      client_company: form.client_company.trim() || null,
      client_avatar_url: form.client_avatar_url.trim() || null,
      text: form.text.trim(),
      rating: form.rating,
      featured: form.featured,
      published: form.published,
    }
    const { error: err } = isEdit
      ? await supabase.from('testimonials').update(payload).eq('id', id!)
      : await supabase.from('testimonials').insert(payload)
    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }
    setSaving(false)
    navigate('/admin/testimonials')
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8 gap-4">
        <button
          onClick={() => navigate('/admin/testimonials')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to testimonials
        </button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/testimonials')}>Cancel</Button>
          <Button onClick={() => handleSave()} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save</>}
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">
          {isEdit ? 'Edit testimonial' : 'New testimonial'}
        </p>
        <h1 className="text-3xl font-semibold text-foreground truncate">
          {form.client_name || 'New testimonial'}
        </h1>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Client</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="t-name">Client name *</Label>
                  <Input
                    id="t-name"
                    value={form.client_name}
                    onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                    placeholder="Jane Smith"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="t-role">Role</Label>
                  <Input
                    id="t-role"
                    value={form.client_role}
                    onChange={e => setForm(f => ({ ...f, client_role: e.target.value }))}
                    placeholder="CEO"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="t-company">Company</Label>
                  <Input
                    id="t-company"
                    value={form.client_company}
                    onChange={e => setForm(f => ({ ...f, client_company: e.target.value }))}
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="t-avatar">Avatar URL</Label>
                  <Input
                    id="t-avatar"
                    value={form.client_avatar_url}
                    onChange={e => setForm(f => ({ ...f, client_avatar_url: e.target.value.trim() }))}
                    placeholder="https://…"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Review</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="t-text">Review text *</Label>
                <Textarea
                  id="t-text"
                  value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  rows={6}
                  placeholder="What did the client say?"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, rating: n }))}
                    >
                      <Star className={`h-6 w-6 transition-colors ${n <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30 hover:text-amber-400'}`} />
                    </button>
                  ))}
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
                <Switch id="t-published" checked={form.published}
                  onCheckedChange={v => setForm(prev => ({ ...prev, published: v }))} />
                <Label htmlFor="t-published">Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="t-featured" checked={form.featured}
                  onCheckedChange={v => setForm(prev => ({ ...prev, featured: v }))} />
                <Label htmlFor="t-featured">Featured</Label>
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
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/testimonials')}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save testimonial</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
