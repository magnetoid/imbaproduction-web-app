import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Save, X } from 'lucide-react'

const EMPTY_FORM = {
  name: '',
  slug: '',
  role: '',
  bio: '',
  photo_url: '',
  social_links: {} as Record<string, string>,
  sort_order: 0,
  published: true,
}

type FormState = typeof EMPTY_FORM

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const SOCIAL_PLATFORMS = ['linkedin', 'instagram', 'twitter', 'youtube', 'tiktok', 'website']

export default function TeamMemberEdit() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customPlatform, setCustomPlatform] = useState('')
  const [customUrl, setCustomUrl] = useState('')

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    supabase.from('team_members').select('*').eq('id', id!).single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError(err?.message || 'Team member not found')
          setLoading(false)
          return
        }
        setForm({
          name: data.name,
          slug: data.slug,
          role: data.role || '',
          bio: data.bio || '',
          photo_url: data.photo_url || '',
          social_links: (data.social_links as Record<string, string>) || {},
          sort_order: data.sort_order ?? 0,
          published: data.published,
        })
        setLoading(false)
      })
  }, [id, isEdit])

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    const payload = {
      name: form.name.trim(),
      slug: form.slug || toSlug(form.name),
      role: form.role.trim() || null,
      bio: form.bio.trim() || null,
      photo_url: form.photo_url.trim() || null,
      social_links: form.social_links,
      sort_order: form.sort_order,
      published: form.published,
    }
    const { error: err } = isEdit
      ? await supabase.from('team_members').update(payload).eq('id', id!)
      : await supabase.from('team_members').insert(payload)
    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }
    setSaving(false)
    navigate('/admin/team')
  }

  function setSocial(platform: string, url: string) {
    setForm(f => {
      const next = { ...f.social_links }
      if (url.trim()) next[platform] = url.trim()
      else delete next[platform]
      return { ...f, social_links: next }
    })
  }

  function addCustomSocial() {
    const p = customPlatform.trim().toLowerCase()
    const u = customUrl.trim()
    if (!p || !u) return
    setSocial(p, u)
    setCustomPlatform('')
    setCustomUrl('')
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  const extraPlatforms = Object.keys(form.social_links).filter(p => !SOCIAL_PLATFORMS.includes(p))

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8 gap-4">
        <button
          onClick={() => navigate('/admin/team')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to team
        </button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/team')}>Cancel</Button>
          <Button onClick={() => handleSave()} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save</>}
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">
          {isEdit ? 'Edit team member' : 'New team member'}
        </p>
        <h1 className="text-3xl font-semibold text-foreground truncate">
          {form.name || 'New team member'}
        </h1>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="t-name">Name *</Label>
                  <Input
                    id="t-name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || toSlug(e.target.value) }))}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="t-slug">Slug</Label>
                  <Input
                    id="t-slug"
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))}
                    placeholder="auto-from-name"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="t-role">Role</Label>
                <Input
                  id="t-role"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  placeholder="e.g. Partner & Creative Director"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="t-bio">Bio</Label>
                <Textarea
                  id="t-bio"
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  rows={5}
                  placeholder="Short bio shown on the About page."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="t-photo">Photo URL</Label>
                <Input
                  id="t-photo"
                  value={form.photo_url}
                  onChange={e => setForm(f => ({ ...f, photo_url: e.target.value.trim() }))}
                  placeholder="https://… or /team/name.jpg"
                />
                {form.photo_url && (
                  <img
                    src={form.photo_url}
                    alt="preview"
                    className="mt-2 w-24 h-24 object-cover rounded-full border border-border"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Social links</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {SOCIAL_PLATFORMS.map(p => (
                <div key={p} className="grid grid-cols-[120px_1fr] gap-3 items-center">
                  <Label className="capitalize">{p}</Label>
                  <Input
                    value={form.social_links[p] || ''}
                    onChange={e => setSocial(p, e.target.value)}
                    placeholder={`https://${p}.com/…`}
                  />
                </div>
              ))}
              {extraPlatforms.map(p => (
                <div key={p} className="grid grid-cols-[120px_1fr_auto] gap-3 items-center">
                  <Label className="capitalize">{p}</Label>
                  <Input
                    value={form.social_links[p]}
                    onChange={e => setSocial(p, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSocial(p, '')}
                    aria-label={`Remove ${p}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="grid grid-cols-[120px_1fr_auto] gap-3 items-center pt-2 border-t border-border">
                <Input
                  placeholder="custom platform"
                  value={customPlatform}
                  onChange={e => setCustomPlatform(e.target.value)}
                />
                <Input
                  placeholder="https://…"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomSocial}
                  disabled={!customPlatform.trim() || !customUrl.trim()}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Publish</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="t-published"
                  checked={form.published}
                  onCheckedChange={c => setForm(f => ({ ...f, published: c }))}
                />
                <Label htmlFor="t-published">Published</Label>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="t-order">Sort order</Label>
                <Input
                  id="t-order"
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                />
                <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
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
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/team')}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save team member</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
