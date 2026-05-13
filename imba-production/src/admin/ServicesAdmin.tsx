import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { ServiceRecord } from '@/lib/supabase'
import { SERVICES_DATA } from '@/pages/services/data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Loader2, Layers, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ServicesAdmin() {
  const navigate = useNavigate()
  const [items, setItems] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('sort_order')
    setItems((data as ServiceRecord[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this service?')) return
    await supabase.from('services').delete().eq('id', id)
    load()
  }

  async function togglePublished(item: ServiceRecord) {
    await supabase.from('services').update({ published: !item.published }).eq('id', item.id)
    setItems(prev => prev.map(s => s.id === item.id ? { ...s, published: !item.published } : s))
  }

  async function seedFromDefaults() {
    if (items.length > 0) {
      if (!confirm(`Services already contain ${items.length} rows. Seeding will only insert services whose slugs aren't already in the database. Continue?`)) return
    }
    setSeeding(true)
    const existingSlugs = new Set(items.map(i => i.slug))
    const rows = SERVICES_DATA
      .filter(s => !existingSlugs.has(s.slug))
      .map((s, i) => ({
        slug: s.slug,
        service_key: s.key,
        icon: s.icon,
        label: s.label,
        tagline: s.tagline,
        color: s.color,
        hero_desc: s.heroDesc,
        stats: s.stats,
        features: s.features,
        process: s.process,
        portfolio: s.portfolio,
        shorts: s.shorts || [],
        faq: s.faq,
        sort_order: existingSlugs.size + i,
        published: true,
      }))
    if (rows.length === 0) {
      setSeeding(false)
      toast('All default services already exist.', { icon: 'ℹ️' })
      return
    }
    const { error } = await supabase.from('services').insert(rows)
    setSeeding(false)
    if (error) {
      toast.error(`Seed failed: ${error.message}`)
    } else {
      toast.success(`Seeded ${rows.length} service${rows.length === 1 ? '' : 's'}`)
      load()
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Services</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Drives /services, every /services/:slug detail page, and the homepage grid.
            {items.length > 0 && ` ${items.length} total · ${items.filter(s => s.published).length} live.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {items.length < SERVICES_DATA.length && (
            <Button variant="outline" onClick={seedFromDefaults} disabled={seeding}>
              {seeding ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Seeding…</> : <><Sparkles className="h-4 w-4 mr-2" />Seed from defaults</>}
            </Button>
          )}
          <Button onClick={() => navigate('/admin/services/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add service
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground border border-border rounded-lg">
          <Layers className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="mb-1">No services in the database yet.</p>
          <p className="text-xs text-muted-foreground/60 mb-4">
            The public site is currently rendering the 9 hard-coded defaults from src/pages/services/data.ts.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={seedFromDefaults} disabled={seeding}>
              {seeding ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Seeding…</> : <><Sparkles className="h-3.5 w-3.5 mr-1" />Seed from defaults</>}
            </Button>
            <Button size="sm" onClick={() => navigate('/admin/services/new')}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add a custom service
            </Button>
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={() => navigate(`/admin/services/edit/${item.id}`)}
              >
                <TableCell>
                  <span className="font-display text-xl text-muted-foreground" style={{ color: item.color || undefined }}>
                    {item.icon || '◆'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{item.label}</div>
                  {item.tagline && <div className="text-xs text-muted-foreground">{item.tagline}</div>}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs font-mono">{item.slug}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.sort_order}</TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <Switch checked={item.published} onCheckedChange={() => togglePublished(item)} />
                </TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/services/edit/${item.id}`)}>
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
