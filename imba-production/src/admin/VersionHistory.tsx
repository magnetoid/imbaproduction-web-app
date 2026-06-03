import { useEffect, useState } from 'react'
import { listVersions } from '@/lib/versions'
import type { ContentVersion } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Loader2, History, X, RotateCcw, Save } from 'lucide-react'

interface VersionHistoryProps {
  open: boolean
  onClose: () => void
  entityType: string
  entityId: string
  /** Restore a snapshot into the editor form (does not persist until the user saves). */
  onRestore: (snapshot: Record<string, unknown>) => void
}

function relTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const min = Math.round(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 30) return `${day}d ago`
  return new Date(iso).toLocaleDateString()
}

export default function VersionHistory({ open, onClose, entityType, entityId, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !entityId) return
    setLoading(true)
    setError('')
    listVersions(entityType, entityId)
      .then(setVersions)
      .catch(err => setError(err.message ?? String(err)))
      .finally(() => setLoading(false))
  }, [open, entityType, entityId])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      {/* Panel */}
      <aside className="relative w-full max-w-md bg-background border-l border-border h-full overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Version history</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : versions.length === 0 ? (
            <p className="text-sm text-muted-foreground/70 py-8 text-center">
              No saved versions yet. A snapshot is captured each time you save.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {versions.map((v, i) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 border border-border rounded-md px-3 py-2.5 hover:bg-accent/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">v{v.version}</span>
                      {i === 0 && (
                        <span className="text-[0.6rem] font-mono uppercase tracking-widest text-primary">latest</span>
                      )}
                      {v.is_autosave && (
                        <span className="text-[0.6rem] font-mono uppercase tracking-widest text-muted-foreground/60">auto</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {relTime(v.created_at)}
                      {v.author_email ? ` · ${v.author_email}` : ''}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { onRestore(v.snapshot); onClose() }}
                    title="Load this version into the editor (review, then Save)"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Restore
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-5 flex items-start gap-2 text-[0.7rem] text-muted-foreground/60 leading-snug">
            <Save className="h-3 w-3 mt-0.5 flex-shrink-0" />
            Restoring loads that version into the editor without publishing — review the content, then Save to make it live.
          </p>
        </div>
      </aside>
    </div>
  )
}
