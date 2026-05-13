import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { TeamMember } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Loader2, Users } from 'lucide-react'

export default function TeamAdmin() {
  const navigate = useNavigate()
  const [items, setItems] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('sort_order')
    setItems((data as TeamMember[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Delete this team member?')) return
    await supabase.from('team_members').delete().eq('id', id)
    load()
  }

  async function togglePublished(m: TeamMember) {
    await supabase.from('team_members').update({ published: !m.published }).eq('id', m.id)
    setItems(prev => prev.map(t => t.id === m.id ? { ...t, published: !m.published } : t))
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team</h1>
          <p className="text-muted-foreground text-sm mt-1">
            People shown on the About page. {items.length} total · {items.filter(m => m.published).length} live.
          </p>
        </div>
        <Button onClick={() => navigate('/admin/team/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add member
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground border border-border rounded-lg">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p>No team members yet.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/admin/team/new')}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add your first team member
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(m => (
              <TableRow
                key={m.id}
                className="cursor-pointer"
                onClick={() => navigate(`/admin/team/edit/${m.id}`)}
              >
                <TableCell>
                  {m.photo_url ? (
                    <img
                      src={m.photo_url}
                      alt={m.name}
                      className="w-12 h-12 object-cover rounded-full border border-border"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-border bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                      {m.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-foreground">{m.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{m.slug}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.role || '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.sort_order}</TableCell>
                <TableCell onClick={e => e.stopPropagation()}>
                  <Switch checked={m.published} onCheckedChange={() => togglePublished(m)} />
                </TableCell>
                <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/team/edit/${m.id}`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(m.id)}
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
