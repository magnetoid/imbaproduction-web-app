import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { HeroVideo } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, ExternalLink, Loader2, Film } from 'lucide-react'

export default function HeroVideosAdmin() {
  const navigate = useNavigate()
  const [videos, setVideos] = useState<HeroVideo[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('hero_videos')
      .select('*')
      .order('sort_order')
    setVideos(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleActive(v: HeroVideo) {
    await supabase.from('hero_videos').update({ active: !v.active }).eq('id', v.id)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this video from the slider?')) return
    await supabase.from('hero_videos').delete().eq('id', id)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Hero Video Slider</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage homepage background videos
          </p>
        </div>
        <Button onClick={() => navigate('/admin/hero-videos/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add video
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg">
          <Film className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No videos yet</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/admin/hero-videos/new')}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add your first hero slide
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>YouTube ID</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((v) => (
              <TableRow
                key={v.id}
                className="cursor-pointer"
                onClick={() => navigate(`/admin/hero-videos/edit/${v.id}`)}
              >
                <TableCell>
                  <img
                    src={v.slide_image_url || `https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`}
                    alt={v.title}
                    className="w-24 h-14 object-cover rounded border border-border"
                    onError={e => {
                      const el = e.target as HTMLImageElement
                      if (v.slide_image_url && el.src !== `https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`) {
                        el.src = `https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`
                      } else {
                        el.style.display = 'none'
                      }
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium text-foreground">{v.title}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">{v.youtube_id}</TableCell>
                <TableCell className="text-muted-foreground">{v.sort_order}</TableCell>
                <TableCell>
                  <Badge variant={v.active ? 'success' : 'secondary'}>
                    {v.active ? 'Active' : 'Hidden'}
                  </Badge>
                </TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <Switch
                    checked={v.active}
                    onCheckedChange={() => toggleActive(v)}
                  />
                </TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a
                        href={`https://www.youtube.com/watch?v=${v.youtube_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/hero-videos/edit/${v.id}`)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(v.id)}
                    >
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

      <p className="text-muted-foreground/50 text-xs mt-6">
        Videos cycle every 10 seconds on the homepage. Update sort order values to change sequence.
      </p>
    </div>
  )
}
