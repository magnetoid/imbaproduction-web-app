import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { BlogCategory } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2, ArrowLeft, X, Save, Sparkles } from 'lucide-react'
import TiptapEditor from './TiptapEditor'

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  cover_image_url: '',
  featured_image_url: '',
  category: '',
  category_id: '',
  tags: [] as string[],
  read_time_minutes: 5,
  published: false,
  status: 'draft' as 'draft' | 'published' | 'scheduled',
  author_name: '',
  seo_title: '',
  seo_description: '',
  og_image_url: '',
}

type FormState = typeof EMPTY_FORM

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function BlogPostEdit() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [originalTitle, setOriginalTitle] = useState('')
  const tagInputRef = useRef<HTMLInputElement>(null)
  const prefillApplied = useRef(false)

  // Load categories + (if editing) the existing post
  useEffect(() => {
    supabase.from('blog_categories').select('*').order('name')
      .then(({ data }) => setCategories(data || []))

    if (!isEdit) {
      // Apply AI-prefill from location.state once
      const prefill = (location.state as { prefill?: Partial<FormState> } | null)?.prefill
      if (prefill && !prefillApplied.current) {
        prefillApplied.current = true
        setForm(f => ({ ...f, ...prefill }))
        // Clear location state so a refresh doesn't re-prefill
        window.history.replaceState({}, '')
      }
      return
    }

    setLoading(true)
    supabase.from('blog_posts').select('*').eq('id', id!).single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError(err?.message || 'Post not found')
          setLoading(false)
          return
        }
        setOriginalTitle(data.title)
        setForm({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || '',
          body: data.body || '',
          cover_image_url: data.cover_image_url || '',
          featured_image_url: data.featured_image_url || '',
          category: data.category || '',
          category_id: data.category_id || '',
          tags: data.tags ? [...data.tags] : [],
          read_time_minutes: data.read_time_minutes ?? 5,
          published: data.published,
          status: data.status || 'draft',
          author_name: data.author_name || '',
          seo_title: data.seo_title || '',
          seo_description: data.seo_description || '',
          og_image_url: data.og_image_url || '',
        })
        setLoading(false)
      })
  }, [id, isEdit, location.state])

  function addTag() {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }))
    }
    setTagInput('')
    tagInputRef.current?.focus()
  }

  function removeTag(tag: string) {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    const payload = {
      title: form.title,
      slug: form.slug || toSlug(form.title),
      excerpt: form.excerpt,
      body: form.body,
      cover_image_url: form.cover_image_url,
      featured_image_url: form.featured_image_url,
      category: form.category,
      category_id: form.category_id || null,
      tags: form.tags,
      read_time_minutes: form.read_time_minutes,
      published: form.published,
      status: form.status,
      author_name: form.author_name,
      seo_title: form.seo_title,
      seo_description: form.seo_description,
      og_image_url: form.og_image_url,
      published_at: form.published ? new Date().toISOString() : null,
    }
    if (isEdit) {
      const { error: err } = await supabase.from('blog_posts').update(payload).eq('id', id!)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('blog_posts').insert([payload])
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false)
    navigate('/admin/blog')
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/admin/blog')}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to posts
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/blog')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save</>}
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">
          {isEdit ? 'Edit post' : 'New post'}
        </p>
        <h1 className="text-3xl font-semibold text-foreground truncate">
          {isEdit ? (originalTitle || form.title || 'Untitled') : (form.title || 'New post')}
        </h1>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-title">Title *</Label>
                <Input
                  id="b-title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: f.slug || toSlug(e.target.value) }))}
                  placeholder="Article title"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-slug">Slug</Label>
                <Input
                  id="b-slug"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))}
                  placeholder="auto-generated"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-excerpt">Excerpt</Label>
                <Textarea
                  id="b-excerpt"
                  rows={2}
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Short description shown in listings"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-body">Body</Label>
                <TiptapEditor
                  value={form.body}
                  onChange={(html) => setForm(f => ({ ...f, body: html }))}
                  placeholder="Write your blog post…"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-seo-title">SEO title</Label>
                <Input
                  id="b-seo-title"
                  value={form.seo_title}
                  onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))}
                  placeholder="Override page title for search engines"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-seo-desc">SEO description</Label>
                <Textarea
                  id="b-seo-desc"
                  rows={2}
                  value={form.seo_description}
                  onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))}
                  placeholder="Meta description (150–160 chars)"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-og-img">OG image URL</Label>
                <Input
                  id="b-og-img"
                  value={form.og_image_url}
                  onChange={e => setForm(f => ({ ...f, og_image_url: e.target.value }))}
                  placeholder="https://…"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar column */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publish</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={val => setForm(f => ({ ...f, status: val as FormState['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="b-published"
                  checked={form.published}
                  onCheckedChange={c => setForm(f => ({ ...f, published: c, status: c ? 'published' : 'draft' }))}
                />
                <Label htmlFor="b-published">Published</Label>
              </div>

              <Separator />

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-author">Author</Label>
                <Input
                  id="b-author"
                  value={form.author_name}
                  onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
                  placeholder="e.g. Imba Team"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-readtime">Read time (minutes)</Label>
                <Input
                  id="b-readtime"
                  type="number"
                  min={1}
                  value={form.read_time_minutes}
                  onChange={e => setForm(f => ({ ...f, read_time_minutes: parseInt(e.target.value) || 5 }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Taxonomy</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category_id || '__none__'}
                  onValueChange={val => {
                    if (val === '__none__') {
                      setForm(f => ({ ...f, category_id: '', category: '' }))
                    } else {
                      const cat = categories.find(c => c.id === val)
                      setForm(f => ({ ...f, category_id: val, category: cat?.name || '' }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No category</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1.5 min-h-[2rem] p-2 border border-input rounded-md bg-background">
                  {form.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); addTag() }
                      if (e.key === ',' ) { e.preventDefault(); addTag() }
                    }}
                    placeholder={form.tags.length === 0 ? 'Type tag + Enter' : 'Add more…'}
                    className="flex-1 min-w-[100px] outline-none bg-transparent text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Imagery</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-cover">Cover image URL</Label>
                <Input
                  id="b-cover"
                  value={form.cover_image_url}
                  onChange={e => setForm(f => ({ ...f, cover_image_url: e.target.value }))}
                  placeholder="https://…"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-featured-img">Featured image URL</Label>
                <Input
                  id="b-featured-img"
                  value={form.featured_image_url}
                  onChange={e => setForm(f => ({ ...f, featured_image_url: e.target.value }))}
                  placeholder="https://…"
                />
              </div>
            </CardContent>
          </Card>

          {Boolean((location.state as { prefill?: unknown } | null)?.prefill) && !isEdit && (
            <Card>
              <CardContent className="pt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Prefilled by AI generator. Review and save when ready.
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
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/blog')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save post</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
