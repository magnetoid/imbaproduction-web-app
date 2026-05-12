import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Testimonial } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Loader2, Star } from 'lucide-react'

export default function TestimonialsAdmin() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })
    setItems((data as Testimonial[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return
    await supabase.from('testimonials').delete().eq('id', id)
    load()
  }

  async function toggleField(id: string, field: 'published' | 'featured', value: boolean) {
    await supabase.from('testimonials').update({ [field]: value }).eq('id', id)
    setItems(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Testimonials</h1>
          <p className="text-muted-foreground text-sm mt-1">{items.length} total · {items.filter(t => t.featured).length} featured</p>
        </div>
        <Button onClick={() => navigate('/admin/testimonials/new')} className="gap-2">
          <Plus className="h-4 w-4" /> Add testimonial
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Star className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p>No testimonials yet.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/admin/testimonials/new')}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add your first testimonial
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={() => navigate(`/admin/testimonials/edit/${item.id}`)}
              >
                <TableCell>
                  <div className="font-medium text-sm">{item.client_name}</div>
                  {item.client_role && <div className="text-xs text-muted-foreground">{item.client_role}</div>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.client_company || '—'}</TableCell>
                <TableCell>
                  {item.rating ? (
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={`h-3.5 w-3.5 ${n <= item.rating! ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                  ) : '—'}
                </TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <Switch
                    checked={item.featured}
                    onCheckedChange={v => toggleField(item.id, 'featured', v)}
                  />
                </TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <Switch
                    checked={item.published}
                    onCheckedChange={v => toggleField(item.id, 'published', v)}
                  />
                </TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/testimonials/edit/${item.id}`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
