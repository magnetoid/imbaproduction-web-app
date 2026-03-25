import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { HeroVideo } from '@/lib/supabase'

const EMPTY_FORM = { youtube_id: '', title: '', sort_order: 0, active: true }

export default function HeroVideosAdmin() {
  const [videos, setVideos] = useState<HeroVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

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

  function startAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowForm(true)
  }

  function startEdit(v: HeroVideo) {
    setEditingId(v.id)
    setForm({ youtube_id: v.youtube_id, title: v.title, sort_order: v.sort_order, active: v.active })
    setError('')
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.youtube_id.trim()) { setError('YouTube ID is required'); return }
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    if (editingId) {
      const { error: err } = await supabase.from('hero_videos').update(form).eq('id', editingId)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('hero_videos').insert([form])
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false)
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    load()
  }

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
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-light text-3xl text-smoke">Hero Video Slider</h1>
          <p className="font-mono-custom text-[0.65rem] tracking-widest uppercase text-smoke-faint mt-1">
            Manage homepage background videos
          </p>
        </div>
        <button onClick={startAdd} className="btn btn-primary text-sm">
          + Add video
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="mb-8 border border-ember/20 bg-ink-2 p-6">
          <h2 className="font-mono-custom text-[0.7rem] tracking-[0.14em] uppercase text-ember mb-5">
            {editingId ? 'Edit video' : 'Add video'}
          </h2>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">YouTube Video ID *</label>
                <input
                  className="form-input"
                  placeholder="e.g. SgHHbWp64cE"
                  value={form.youtube_id}
                  onChange={e => setForm(f => ({ ...f, youtube_id: e.target.value.trim() }))}
                />
                <p className="font-mono-custom text-[0.6rem] text-smoke-faint mt-1">
                  Found after ?v= in youtube.com/watch?v=XXXXXXXXXXX
                </p>
              </div>
              <div>
                <label className="form-label">Title *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Perfume Ad"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Sort order</label>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  id="active"
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 accent-ember"
                />
                <label htmlFor="active" className="form-label mb-0">Active (show on site)</label>
              </div>
            </div>

            {/* Preview thumbnail */}
            {form.youtube_id && (
              <div>
                <label className="form-label">Preview</label>
                <img
                  src={`https://img.youtube.com/vi/${form.youtube_id}/mqdefault.jpg`}
                  alt="thumbnail"
                  className="h-24 border border-white/10 object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}

            {error && <p className="text-ember text-sm">{error}</p>}

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn btn-primary text-sm">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null) }}
                className="btn btn-ghost text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Video list */}
      {loading ? (
        <div className="font-mono-custom text-smoke-faint text-sm animate-pulse">Loading...</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-16 border border-white/5">
          <p className="font-display text-xl text-smoke/40">No videos yet</p>
          <p className="font-mono-custom text-[0.65rem] text-smoke-faint mt-2">Add your first hero video above</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {videos.map((v, i) => (
            <div key={v.id} className={`flex items-center gap-4 p-4 border transition-colors ${v.active ? 'border-white/8 bg-ink-2' : 'border-white/4 bg-ink opacity-50'}`}>
              {/* Thumbnail */}
              <img
                src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`}
                alt={v.title}
                className="w-28 h-16 object-cover border border-white/10 flex-shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-display text-smoke text-lg leading-tight truncate">{v.title}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-mono-custom text-[0.6rem] tracking-widest text-smoke-faint">
                    ID: {v.youtube_id}
                  </span>
                  <span className="font-mono-custom text-[0.6rem] text-smoke-faint">
                    Order: {v.sort_order}
                  </span>
                  <span className={`font-mono-custom text-[0.6rem] tracking-widest uppercase ${v.active ? 'text-emerald-400' : 'text-smoke-faint'}`}>
                    {v.active ? '● Active' : '○ Hidden'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`https://www.youtube.com/watch?v=${v.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono-custom text-[0.62rem] tracking-wider text-smoke-faint hover:text-smoke uppercase transition-colors px-2 py-1 border border-white/8"
                >
                  Watch ↗
                </a>
                <button
                  onClick={() => toggleActive(v)}
                  className="font-mono-custom text-[0.62rem] tracking-wider uppercase transition-colors px-2 py-1 border border-white/8 hover:border-ember/40 text-smoke-faint hover:text-smoke"
                >
                  {v.active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => startEdit(v)}
                  className="font-mono-custom text-[0.62rem] tracking-wider uppercase px-2 py-1 border border-white/8 hover:border-ember/40 text-smoke-faint hover:text-smoke transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="font-mono-custom text-[0.62rem] tracking-wider uppercase px-2 py-1 border border-ember/20 text-ember/60 hover:text-ember hover:border-ember/60 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="font-mono-custom text-[0.6rem] text-smoke-faint/40 mt-6">
        Videos cycle every 10 seconds on the homepage. Drag-to-reorder by updating sort order values.
      </p>
    </div>
  )
}
