import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Page } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Loader2, Layout, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function PagesAdmin() {
  const navigate = useNavigate()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [newOpen, setNewOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('pages').select('*').order('updated_at', { ascending: false })
    setPages((data || []) as Page[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createPage() {
    const finalSlug = (slug || toSlug(title)).trim()
    if (!title.trim()) { setError('Title is required'); return }
    if (!finalSlug) { setError('Slug is required'); return }
    setCreating(true)
    setError('')
    const { data, error: err } = await supabase.from('pages').insert([{
      title: title.trim(),
      slug: finalSlug,
      status: 'draft',
      data: { content: [], root: { props: {} } },
      seo: {},
    }]).select('id').single()
    setCreating(false)
    if (err) { setError(err.message); return }
    navigate(`/admin/pages/edit/${data!.id}`)
  }

  async function deletePage(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this page permanently?')) return
    const { error: err } = await supabase.from('pages').delete().eq('id', id)
    if (err) { toast.error(err.message); return }
    toast.success('Page deleted')
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pages</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visually-built pages. {pages.length > 0 && `${pages.length} total · ${pages.filter(p => p.status === 'published').length} published.`}
          </p>
        </div>
        <Button onClick={() => { setNewOpen(true); setTitle(''); setSlug(''); setError('') }}>
          <Plus className="h-4 w-4 mr-2" />New page
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg">
          <Layout className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm mb-1">No pages yet</p>
          <p className="text-muted-foreground/60 text-xs mb-5">Build landing pages visually with drag-and-drop blocks.</p>
          <Button size="sm" onClick={() => { setNewOpen(true); setTitle(''); setSlug(''); setError('') }}>
            <Plus className="h-3.5 w-3.5 mr-1" />Create your first page
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map(page => (
              <TableRow key={page.id} className="cursor-pointer" onClick={() => navigate(`/admin/pages/edit/${page.id}`)}>
                <TableCell>
                  <div className="font-medium text-foreground">{page.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">/{page.slug}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className="text-xs capitalize">
                    {page.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {page.updated_at ? new Date(page.updated_at).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    {page.status === 'published' && (
                      <a
                        href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground px-2"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/pages/edit/${page.id}`)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={e => deletePage(page.id, e)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New page</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-title">Title</Label>
              <Input
                id="p-title"
                value={title}
                onChange={e => { setTitle(e.target.value); if (!slug) setSlug(toSlug(e.target.value)) }}
                placeholder="Landing page"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-slug">Slug</Label>
              <Input
                id="p-slug"
                value={slug}
                onChange={e => setSlug(toSlug(e.target.value))}
                placeholder="landing-page"
              />
              <p className="text-xs text-muted-foreground">Public URL: <span className="font-mono">/p/{slug || 'slug'}</span></p>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={createPage} disabled={creating}>
              {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : 'Create & open'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
