import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { PortfolioItem } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Loader2, Image } from 'lucide-react'

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

export default function PortfolioAdmin() {
  const navigate = useNavigate()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('sort_order')
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this portfolio item?')) return
    await supabase.from('portfolio_items').delete().eq('id', id)
    load()
  }

  async function togglePublished(item: PortfolioItem) {
    await supabase.from('portfolio_items').update({ published: !item.published }).eq('id', item.id)
    load()
  }

  const filtered = categoryFilter === 'all' ? items : items.filter(i => i.category === categoryFilter)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Portfolio</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your work showcase</p>
        </div>
        <Button onClick={() => navigate('/admin/portfolio/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add item
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${categoryFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
        >
          All ({items.length})
        </button>
        {CATEGORIES.map(c => {
          const count = items.filter(i => i.category === c.value).length
          if (!count) return null
          return (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${categoryFilter === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {c.label} ({count})
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg">
          <Image className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No items yet</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/admin/portfolio/new')}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add your first item
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Thumb</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(item => (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={() => navigate(`/admin/portfolio/edit/${item.id}`)}
              >
                <TableCell>
                  {item.youtube_id ? (
                    <img
                      src={`https://img.youtube.com/vi/${item.youtube_id}/mqdefault.jpg`}
                      alt={item.title}
                      className="w-20 h-12 object-cover rounded border border-border"
                    />
                  ) : item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-20 h-12 object-cover rounded border border-border"
                    />
                  ) : (
                    <div className="w-20 h-12 rounded border border-border bg-muted flex items-center justify-center">
                      <Image className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">{item.slug}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {CATEGORIES.find(c => c.value === item.category)?.label ?? item.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{item.client_name || '—'}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{item.sort_order}</TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <Switch checked={item.published} onCheckedChange={() => togglePublished(item)} />
                </TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/portfolio/edit/${item.id}`)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
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
    </div>
  )
}
