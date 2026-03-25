import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { BlogPost } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Loader2, FileText } from 'lucide-react'

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  cover_image_url: '',
  category: '',
  tags: '',
  read_time_minutes: 5,
  published: false,
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
    setDialogOpen(true)
  }

  function startEdit(post: BlogPost) {
    setEditingId(post.id)
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      body: post.body || '',
      cover_image_url: post.cover_image_url || '',
      category: post.category || '',
      tags: post.tags ? post.tags.join(', ') : '',
      read_time_minutes: post.read_time_minutes ?? 5,
      published: post.published,
    })
    setError('')
    setDialogOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      slug: form.slug || toSlug(form.title),
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      published_at: form.published ? new Date().toISOString() : null,
    }
    if (editingId) {
      const { error: err } = await supabase.from('blog_posts').update(payload).eq('id', editingId)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('blog_posts').insert([payload])
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    load()
  }

  async function togglePublished(post: BlogPost) {
    await supabase.from('blog_posts').update({
      published: !post.published,
      published_at: !post.published ? new Date().toISOString() : null,
    }).eq('id', post.id)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Blog</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage articles and insights</p>
        </div>
        <Button onClick={startAdd}>
          <Plus className="h-4 w-4 mr-2" />
          New post
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg">
          <FileText className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No posts yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1">Create your first article above</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Read time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map(post => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="font-medium text-foreground">{post.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">{post.slug}</div>
                </TableCell>
                <TableCell>
                  {post.category ? (
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {post.read_time_minutes ? `${post.read_time_minutes} min` : '—'}
                </TableCell>
                <TableCell>
                  <Switch checked={post.published} onCheckedChange={() => togglePublished(post)} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm font-mono text-xs">
                  {post.created_at ? new Date(post.created_at).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(post)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) setEditingId(null) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit post' : 'New post'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-category">Category</Label>
                <Input
                  id="b-category"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Production Tips"
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
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="b-cover">Cover image URL</Label>
              <Input
                id="b-cover"
                value={form.cover_image_url}
                onChange={e => setForm(f => ({ ...f, cover_image_url: e.target.value }))}
                placeholder="https://..."
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
              <Label htmlFor="b-body">Body (Markdown)</Label>
              <Textarea
                id="b-body"
                rows={10}
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Write your article in Markdown..."
                className="font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="b-tags">Tags (comma-separated)</Label>
                <Input
                  id="b-tags"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="video, production, tips"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch id="b-published" checked={form.published} onCheckedChange={c => setForm(f => ({ ...f, published: c }))} />
                <Label htmlFor="b-published">Published</Label>
              </div>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
