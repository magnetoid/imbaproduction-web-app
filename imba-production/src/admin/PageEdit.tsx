import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Puck, type Data } from '@puckeditor/core'
import '@puckeditor/core/puck.css'
import { config } from './page-builder/puck.config'
import { supabase } from '@/lib/supabase'
import type { Page } from '@/lib/supabase'
import { snapshotVersion } from '@/lib/versions'
import VersionHistory from './VersionHistory'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Save, Globe, History, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_DATA: Data = { content: [], root: { props: {} } }

function asData(value: unknown): Data {
  const v = value as { content?: unknown } | null
  return v && Array.isArray(v.content) ? (value as Data) : EMPTY_DATA
}

export default function PageEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState<Page | null>(null)
  const [data, setData] = useState<Data>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    if (!id) { navigate('/admin/pages'); return }
    supabase.from('pages').select('*').eq('id', id).single().then(({ data: row, error }) => {
      if (error || !row) { toast.error(error?.message || 'Page not found'); navigate('/admin/pages'); return }
      setPage(row as Page)
      setData(asData(row.data))
      setLoading(false)
    })
  }, [id, navigate])

  async function persist(opts: { publish?: boolean }) {
    if (!id || !page) return
    setSaving(true)
    const status: Page['status'] = opts.publish ? 'published' : page.status
    const payload = {
      data: data as unknown as Record<string, unknown>,
      status,
      published_at: opts.publish ? new Date().toISOString() : (page.published_at ?? null),
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('pages').update(payload).eq('id', id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    setPage({ ...page, status, published_at: payload.published_at ?? undefined })
    try {
      await snapshotVersion('page', id, { title: page.title, slug: page.slug, status, data: payload.data })
    } catch (e) { console.warn('Page version snapshot failed', e) }
    toast.success(opts.publish ? 'Page published' : 'Draft saved')
  }

  function restore(snap: Record<string, unknown>) {
    if (snap.data) { setData(asData(snap.data)); toast('Version loaded — Save to keep it.') }
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="h-screen puck-host">
      <Puck
        config={config}
        data={data}
        onChange={setData}
        headerTitle={page?.title}
        headerPath={page ? `/${page.slug}` : undefined}
        renderHeaderActions={() => (
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/admin/pages')}>
              <ArrowLeft className="h-4 w-4 mr-1" />Pages
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setHistoryOpen(true)}>
              <History className="h-4 w-4 mr-1" />History
            </Button>
            {page?.status === 'published' && (
              <a
                href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground px-2"
              >
                <Eye className="h-4 w-4 mr-1" />View
              </a>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => persist({})} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />Save draft
            </Button>
            <Button type="button" size="sm" onClick={() => persist({ publish: true })} disabled={saving}>
              <Globe className="h-4 w-4 mr-1" />Publish
            </Button>
          </div>
        )}
      />

      {id && (
        <VersionHistory
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          entityType="page"
          entityId={id}
          onRestore={restore}
        />
      )}
    </div>
  )
}
