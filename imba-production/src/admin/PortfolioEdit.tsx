import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { PortfolioItem } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2, ArrowLeft, Save } from 'lucide-react'

const CATEGORIES = [
  { value: 'brand',       label: 'Brand & Commercial' },
  { value: 'ai',          label: 'AI Video' },
  { value: 'product',     label: 'Product' },
  { value: 'social',      label: 'Social Media' },
  { value: 'cooking',     label: 'Cooking' },
  { value: 'post',        label: 'Post Production' },
  { value: 'elearning',   label: 'E-Learning' },
  { value: 'fashion',     label: 'Fashion' },
  { value: 'testimonial', label: 'Testimonial' },
]

const EMPTY_FORM = {
  title: '',
  slug: '',
  category: 'brand' as PortfolioItem['category'],
  client_name: '',
  youtube_id: '',
  vimeo_id: '',
  description: '',
  thumbnail_url: '',
  tags: '',
  featured: false,
  homepage_featured: false,
  published: true,
  sort_order: 0,
}

type FormState = typeof EMPTY_FORM

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function PortfolioEdit() {
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
    supabase.from('portfolio_items').select('*').eq('id', id!).single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError(err?.message || 'Portfolio item not found')
          setLoading(false)
          return
        }
        setOriginalTitle(data.title)
        setForm({
          title: data.title,
          slug: data.slug,
          category: data.category,
          client_name: data.client_name || '',
          youtube_id: data.youtube_id || '',
          vimeo_id: data.vimeo_id || '',
          description: data.description || '',
          thumbnail_url: data.thumbnail_url || '',
          tags: data.tags ? data.tags.join(', ') : '',
          featured: data.featured,
          homepage_featured: data.homepage_featured || false,
          published: data.published,
          sort_order: data.sort_order ?? 0,
        })
        setLoading(false)
      })
  }, [id, isEdit])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    const payload = {
      title: form.title,
      slug: form.slug || toSlug(form.title),
      category: form.category,
      client_name: form.client_name || null,
      youtube_id: form.youtube_id || null,
      vimeo_id: form.vimeo_id || null,
      description: form.description || null,
      thumbnail_url: form.thumbnail_url || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      featured: form.featured,
      homepage_featured: form.homepage_featured,
      published: form.published,
      sort_order: form.sort_order,
    }
    if (isEdit) {
      const { error: err } = await supabase.from('portfolio_items').update(payload).eq('id', id!)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('portfolio_items').insert([payload])
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false)
    navigate('/admin/portfolio')
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  const thumbPreview = form.youtube_id
    ? `https://img.youtube.com/vi/${form.youtube_id}/mqdefault.jpg`
    : form.thumbnail_url || ''

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8 gap-4">
        <button
          onClick={() => navigate('/admin/portfolio')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to portfolio
        </button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/portfolio')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save</>}
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">
          {isEdit ? 'Edit portfolio item' : 'New portfolio item'}
        </p>
        <h1 className="text-3xl font-semibold text-foreground truncate">
          {isEdit ? (originalTitle || form.title || 'Untitled') : (form.title || 'New portfolio item')}
        </h1>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-title">Title *</Label>
                <Input
                  id="p-title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: f.slug || toSlug(e.target.value) }))}
                  placeholder="Video title"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-slug">Slug</Label>
                <Input
                  id="p-slug"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))}
                  placeholder="auto-generated-from-title"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-desc">Description</Label>
                <Textarea
                  id="p-desc"
                  rows={4}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief project description"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-tags">Tags (comma-separated)</Label>
                <Input
                  id="p-tags"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="e.g. cinematic, brand, 4k"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Video sources</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-yt">YouTube ID</Label>
                <Input
                  id="p-yt"
                  value={form.youtube_id}
                  onChange={e => setForm(f => ({ ...f, youtube_id: e.target.value.trim() }))}
                  placeholder="e.g. dQw4w9WgXcQ"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-vimeo">Vimeo ID</Label>
                <Input
                  id="p-vimeo"
                  value={form.vimeo_id}
                  onChange={e => setForm(f => ({ ...f, vimeo_id: e.target.value.trim() }))}
                  placeholder="e.g. 123456789"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-thumb">Thumbnail URL (overrides YouTube)</Label>
                <Input
                  id="p-thumb"
                  value={form.thumbnail_url}
                  onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value.trim() }))}
                  placeholder="https://…"
                />
              </div>
              {thumbPreview && (
                <div className="flex flex-col gap-1.5">
                  <Label>Preview</Label>
                  <img
                    src={thumbPreview}
                    alt="thumbnail"
                    className="h-32 rounded border border-border object-cover w-auto max-w-md"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar column */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Publish</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="p-published"
                  checked={form.published}
                  onCheckedChange={c => setForm(f => ({ ...f, published: c }))}
                />
                <Label htmlFor="p-published">Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="p-featured"
                  checked={form.featured}
                  onCheckedChange={c => setForm(f => ({ ...f, featured: c }))}
                />
                <Label htmlFor="p-featured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="p-homepage"
                  checked={form.homepage_featured}
                  onCheckedChange={c => setForm(f => ({ ...f, homepage_featured: c }))}
                />
                <Label htmlFor="p-homepage">Show on homepage</Label>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-order">Sort order</Label>
                <Input
                  id="p-order"
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Taxonomy</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={v => setForm(f => ({ ...f, category: v as PortfolioItem['category'] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="p-client">Client name</Label>
                <Input
                  id="p-client"
                  value={form.client_name}
                  onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                  placeholder="Client or brand"
                />
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
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/portfolio')}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save item</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
