import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Pencil, Trash2, Loader2, ExternalLink, Eye, AlertCircle, CheckCircle, Globe, FileText } from 'lucide-react'

interface SeoPage {
  id: string
  path: string
  title?: string
  description?: string
  og_title?: string
  og_description?: string
  og_image?: string
  canonical?: string
  noindex: boolean
  structured_data?: object
  created_at: string
}

const SITE_URL = 'https://imbaproduction.com'
const SITE_NAME = 'Imba Production'

const ALL_PAGES = [
  { path: '/',                              label: 'Homepage' },
  { path: '/work',                          label: 'Portfolio / Work' },
  { path: '/services',                      label: 'Services' },
  { path: '/pricing',                       label: 'Pricing' },
  { path: '/about',                         label: 'About' },
  { path: '/blog',                          label: 'Blog' },
  { path: '/contact',                       label: 'Contact' },
  { path: '/services/brand-video',          label: 'Brand Video' },
  { path: '/services/ai-video',             label: 'AI Video' },
  { path: '/services/product-video',        label: 'Product Video' },
  { path: '/services/social-video',         label: 'Social Video' },
  { path: '/services/cooking-video',        label: 'Cooking Video' },
  { path: '/services/post-production',      label: 'Post Production' },
  { path: '/services/elearning-video',      label: 'eLearning Video' },
  { path: '/services/fashion-video',        label: 'Fashion Video' },
  { path: '/services/testimonial-video',    label: 'Testimonial Video' },
  { path: '/services/drone-video',          label: 'Drone & Aerial' },
]

const EMPTY: Omit<SeoPage, 'id' | 'created_at'> = {
  path: '', title: '', description: '', og_title: '', og_description: '',
  og_image: '', canonical: '', noindex: false, structured_data: undefined,
}

function titleScore(title?: string) {
  if (!title) return { score: 0, label: 'Missing', color: 'text-red-400' }
  const l = title.length
  if (l <= 60) return { score: 100, label: `${l}/60 ✓`, color: 'text-green-400' }
  if (l <= 70) return { score: 60, label: `${l}/60 — too long`, color: 'text-yellow-400' }
  return { score: 20, label: `${l}/60 — way too long`, color: 'text-red-400' }
}

function descScore(desc?: string) {
  if (!desc) return { score: 0, label: 'Missing', color: 'text-red-400' }
  const l = desc.length
  if (l >= 120 && l <= 160) return { score: 100, label: `${l} chars ✓`, color: 'text-green-400' }
  if (l >= 80 && l < 120) return { score: 60, label: `${l} chars — a bit short`, color: 'text-yellow-400' }
  if (l > 160) return { score: 60, label: `${l} chars — truncated by Google`, color: 'text-yellow-400' }
  return { score: 20, label: `${l} chars — too short`, color: 'text-red-400' }
}

function pageHealth(row: SeoPage): number {
  let score = 0
  if (row.title) score += 25
  if (row.description) score += 25
  if (row.og_image) score += 20
  if (row.og_title || row.og_description) score += 15
  if (row.structured_data) score += 15
  return row.noindex ? 0 : score
}

function HealthBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-7 flex-shrink-0">{score}</span>
    </div>
  )
}

function SerpPreview({ title, description, path }: { title?: string; description?: string; path: string }) {
  const displayTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Cinematic Video Production`
  const displayDesc = description || 'Next-gen video production powered by cinematic craft and AI strategy.'
  const displayUrl = `${SITE_URL}${path}`

  return (
    <div className="bg-white rounded-lg p-4 text-left max-w-xl">
      {/* URL breadcrumb */}
      <div className="flex items-center gap-1 mb-1">
        <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0" />
        <span className="text-xs text-gray-600 truncate">{SITE_NAME} › {path === '/' ? 'Home' : path.replace(/^\//, '').replace(/\//g, ' › ')}</span>
      </div>
      {/* Title */}
      <p className="text-blue-700 text-lg font-normal leading-tight mb-1 line-clamp-2" style={{ fontFamily: 'Arial, sans-serif' }}>
        {displayTitle.length > 60 ? displayTitle.slice(0, 57) + '…' : displayTitle}
      </p>
      {/* URL */}
      <p className="text-green-700 text-xs mb-1 truncate" style={{ fontFamily: 'Arial, sans-serif' }}>{displayUrl}</p>
      {/* Description */}
      <p className="text-gray-600 text-sm leading-snug" style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.4' }}>
        {displayDesc.length > 160 ? displayDesc.slice(0, 157) + '…' : displayDesc}
      </p>
    </div>
  )
}

export default function SEOManager() {
  const [rows, setRows] = useState<SeoPage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [previewPath, setPreviewPath] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [structuredRaw, setStructuredRaw] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'pages' | 'sitemap' | 'robots'>('pages')

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('seo_pages').select('*').order('path')
    setRows(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd(prefillPath = '') {
    setEditingId(null)
    setForm({ ...EMPTY, path: prefillPath })
    setStructuredRaw('')
    setJsonError('')
    setError('')
    setDialogOpen(true)
  }

  function openEdit(row: SeoPage) {
    setEditingId(row.id)
    setForm({
      path: row.path, title: row.title || '', description: row.description || '',
      og_title: row.og_title || '', og_description: row.og_description || '',
      og_image: row.og_image || '', canonical: row.canonical || '',
      noindex: row.noindex, structured_data: row.structured_data,
    })
    setStructuredRaw(row.structured_data ? JSON.stringify(row.structured_data, null, 2) : '')
    setJsonError('')
    setError('')
    setDialogOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.path.trim()) { setError('Path is required'); return }
    let structured: object | undefined
    if (structuredRaw.trim()) {
      try { structured = JSON.parse(structuredRaw) }
      catch { setJsonError('Invalid JSON — check your schema syntax'); return }
    }
    setSaving(true)
    setError('')
    const payload = { ...form, path: form.path.trim(), structured_data: structured ?? null }
    const { error: err } = editingId
      ? await supabase.from('seo_pages').update(payload).eq('id', editingId)
      : await supabase.from('seo_pages').upsert([payload], { onConflict: 'path' })
    setSaving(false)
    if (err) { setError(err.message); return }
    setDialogOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this SEO override?')) return
    await supabase.from('seo_pages').delete().eq('id', id)
    load()
  }

  // Map existing rows by path for quick lookup
  const rowByPath = Object.fromEntries(rows.map(r => [r.path, r]))

  const previewRow = previewPath ? rowByPath[previewPath] : null

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">AI CRM</span>
            <Badge variant="outline" className="text-xs font-mono">SEO Manager</Badge>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">SEO Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage meta tags, Open Graph, schema, and technical SEO for every page</p>
        </div>
        <Button onClick={() => openAdd()}>
          <Plus className="h-4 w-4 mr-2" />Add page override
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {([
          { key: 'pages', label: 'Pages', icon: Globe },
          { key: 'sitemap', label: 'Sitemap', icon: FileText },
          { key: 'robots', label: 'Robots & LLMs', icon: ExternalLink },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors -mb-px ${
              activeTab === key
                ? 'border-primary text-foreground font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── PAGES TAB ── */}
      {activeTab === 'pages' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex gap-6">
              {/* Page list */}
              <div className="flex-1 min-w-0">
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">Page</th>
                        <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">Title len</th>
                        <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">Desc len</th>
                        <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">Health</th>
                        <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-mono text-muted-foreground"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ALL_PAGES.map(({ path, label }) => {
                        const row = rowByPath[path]
                        const ts = titleScore(row?.title)
                        const ds = descScore(row?.description)
                        const health = row ? pageHealth(row) : 0
                        return (
                          <tr
                            key={path}
                            className={`border-b border-border last:border-0 transition-colors hover:bg-muted/10 cursor-pointer ${previewPath === path ? 'bg-muted/20' : ''}`}
                            onClick={() => setPreviewPath(previewPath === path ? null : path)}
                          >
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-foreground text-xs">{label}</p>
                                <p className="text-xs text-muted-foreground font-mono">{path}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 max-w-[160px]">
                              <p className="text-xs text-muted-foreground truncate">{row?.title || <span className="text-muted-foreground/40 italic">default</span>}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-mono ${ts.color}`}>{ts.label}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-mono ${ds.color}`}>{ds.label}</span>
                            </td>
                            <td className="px-4 py-3">
                              {row ? <HealthBar score={health} /> : <span className="text-xs text-muted-foreground/40 italic">no override</span>}
                            </td>
                            <td className="px-4 py-3">
                              {row?.noindex
                                ? <Badge variant="destructive" className="text-[0.6rem]">noindex</Badge>
                                : row
                                  ? <Badge variant="secondary" className="text-[0.6rem]">✓ override</Badge>
                                  : <Badge variant="outline" className="text-[0.6rem] text-muted-foreground">default</Badge>
                              }
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" onClick={() => setPreviewPath(previewPath === path ? null : path)} title="SERP preview">
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                {row ? (
                                  <>
                                    <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button variant="ghost" size="sm" onClick={() => openAdd(path)}>
                                    <Plus className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Additional overrides not in ALL_PAGES */}
                {rows.filter(r => !ALL_PAGES.find(p => p.path === r.path)).length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2 font-mono">Other overrides</p>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody>
                          {rows.filter(r => !ALL_PAGES.find(p => p.path === r.path)).map(row => (
                            <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                              <td className="px-4 py-3 font-mono text-xs text-foreground">{row.path}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[200px]">{row.title || '—'}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => openEdit(row)}><Pencil className="h-3.5 w-3.5" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* SERP Preview panel */}
              {previewPath !== null && (
                <div className="w-[340px] flex-shrink-0">
                  <div className="border border-border rounded-lg p-4 sticky top-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">SERP Preview</p>
                      <a href={`${SITE_URL}${previewPath}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />Live
                      </a>
                    </div>
                    <SerpPreview
                      title={previewRow?.title}
                      description={previewRow?.description}
                      path={previewPath}
                    />

                    {/* Checklist */}
                    <div className="mt-4 flex flex-col gap-1.5">
                      {[
                        { label: 'Title tag',     ok: !!previewRow?.title },
                        { label: 'Meta description', ok: !!previewRow?.description },
                        { label: 'OG image',      ok: !!previewRow?.og_image },
                        { label: 'OG title/desc', ok: !!(previewRow?.og_title || previewRow?.og_description) },
                        { label: 'Schema markup', ok: !!previewRow?.structured_data },
                        { label: 'Canonical',     ok: !!previewRow?.canonical },
                      ].map(({ label, ok }) => (
                        <div key={label} className="flex items-center gap-2">
                          {ok
                            ? <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            : <AlertCircle className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                          }
                          <span className={`text-xs ${ok ? 'text-foreground' : 'text-muted-foreground/50'}`}>{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Schema preview */}
                    {previewRow?.structured_data && (
                      <div className="mt-4">
                        <p className="text-xs font-mono text-muted-foreground mb-1">JSON-LD</p>
                        <pre className="text-[0.6rem] text-muted-foreground bg-muted/30 rounded p-2 overflow-x-auto max-h-32">
                          {JSON.stringify(previewRow.structured_data, null, 2)}
                        </pre>
                      </div>
                    )}

                    <Button size="sm" className="w-full mt-3" variant="outline"
                      onClick={() => previewRow ? openEdit(previewRow) : openAdd(previewPath)}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      {previewRow ? 'Edit override' : 'Add override'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── SITEMAP TAB ── */}
      {activeTab === 'sitemap' && (
        <div className="max-w-2xl">
          <div className="border border-border rounded-lg p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">sitemap.xml</h3>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-3.5 w-3.5" />View
              </a>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Static sitemap at <code className="bg-muted px-1 rounded font-mono">/public/sitemap.xml</code>. Contains {ALL_PAGES.length} URLs with lastmod dates.</p>
            <div className="flex flex-col gap-1">
              {ALL_PAGES.map(({ path, label }) => (
                <div key={path} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                  <span className="text-xs text-muted-foreground font-mono">{path}</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium text-foreground mb-2">Submission checklist</h3>
            {[
              { label: 'Submit to Google Search Console', href: 'https://search.google.com/search-console', done: false },
              { label: 'Submit to Bing Webmaster Tools', href: 'https://www.bing.com/webmasters', done: false },
              { label: 'Verify robots.txt allows sitemap', done: true },
              { label: 'All URLs return 200 status', done: true },
              { label: 'lastmod dates are current', done: true },
            ].map(({ label, href, done }) => (
              <div key={label} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
                {done
                  ? <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  : <AlertCircle className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                }
                <span className="text-xs text-foreground flex-1">{label}</span>
                {href && (
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-0.5">
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ROBOTS & LLMS TAB ── */}
      {activeTab === 'robots' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl">
          <div className="border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">robots.txt</h3>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-3.5 w-3.5" />View
              </a>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Located at <code className="bg-muted px-1 rounded font-mono">/public/robots.txt</code></p>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'All bots: allow /', ok: true },
                { label: 'Admin: disallowed', ok: true },
                { label: 'GPTBot: allowed', ok: true },
                { label: 'anthropic-ai: allowed', ok: true },
                { label: 'Claude-Web: allowed', ok: true },
                { label: 'PerplexityBot: allowed', ok: true },
                { label: 'Sitemap URL declared', ok: true },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-2">
                  {ok
                    ? <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    : <AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                  }
                  <span className="text-xs text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">llms.txt</h3>
              <a href="/llms.txt" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-3.5 w-3.5" />View
              </a>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              AI crawler context file. Helps ChatGPT, Claude, Perplexity accurately describe your business.
              Located at <code className="bg-muted px-1 rounded font-mono">/public/llms.txt</code>
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Business description', ok: true },
                { label: 'All services listed', ok: true },
                { label: 'Pricing overview', ok: true },
                { label: 'Social media links', ok: true },
                { label: 'Contact information', ok: true },
                { label: 'Content policy (AI use OK)', ok: true },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-2">
                  {ok
                    ? <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    : <AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                  }
                  <span className="text-xs text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border rounded-lg p-5 lg:col-span-2">
            <h3 className="text-sm font-medium text-foreground mb-3">SEO health summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Pages with override', value: rows.filter(r => !r.noindex).length, total: ALL_PAGES.length },
                { label: 'noindex pages', value: rows.filter(r => r.noindex).length, total: null },
                { label: 'With schema markup', value: rows.filter(r => r.structured_data).length, total: null },
                { label: 'With OG image', value: rows.filter(r => r.og_image).length, total: null },
              ].map(({ label, value, total }) => (
                <div key={label} className="border border-border rounded-lg p-3">
                  <p className="text-2xl font-bold text-foreground font-mono">{value}{total ? `/${total}` : ''}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT DIALOG ── */}
      <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) setEditingId(null) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit SEO override' : 'Add SEO override'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            {/* Path */}
            <div className="flex flex-col gap-1.5">
              <Label>Page path *</Label>
              <Select value={form.path} onValueChange={v => setForm(f => ({ ...f, path: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a page" /></SelectTrigger>
                <SelectContent>
                  {ALL_PAGES.map(p => <SelectItem key={p.path} value={p.path}>{p.label} — {p.path}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                value={form.path}
                onChange={e => setForm(f => ({ ...f, path: e.target.value }))}
                placeholder="Or type a custom path, e.g. /blog/my-post"
                className="mt-1"
              />
            </div>

            <Separator />

            {/* Live SERP preview */}
            {(form.title || form.description) && (
              <div>
                <Label className="text-xs mb-2 block">SERP preview</Label>
                <SerpPreview title={form.title} description={form.description} path={form.path || '/'} />
              </div>
            )}

            <Separator />
            <p className="text-sm font-medium text-foreground">Meta tags</p>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center justify-between">
                Title
                <span className={`text-xs ${titleScore(form.title).color}`}>{titleScore(form.title).label}</span>
              </Label>
              <Input
                value={form.title ?? ''}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Page title — keep under 60 characters"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center justify-between">
                Description
                <span className={`text-xs ${descScore(form.description).color}`}>{descScore(form.description).label}</span>
              </Label>
              <Textarea
                rows={2}
                value={form.description ?? ''}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Meta description — 120–160 characters, include a CTA"
              />
            </div>

            <Separator />
            <p className="text-sm font-medium text-foreground">Open Graph (social sharing)</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>OG Title</Label>
                <Input
                  value={form.og_title ?? ''}
                  onChange={e => setForm(f => ({ ...f, og_title: e.target.value }))}
                  placeholder="Social share title (defaults to title)"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>OG Image URL</Label>
                <Input
                  value={form.og_image ?? ''}
                  onChange={e => setForm(f => ({ ...f, og_image: e.target.value }))}
                  placeholder="https://… (1200×630px)"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>OG Description</Label>
              <Textarea
                rows={2}
                value={form.og_description ?? ''}
                onChange={e => setForm(f => ({ ...f, og_description: e.target.value }))}
                placeholder="Social share description"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Canonical URL</Label>
                <Input
                  value={form.canonical ?? ''}
                  onChange={e => setForm(f => ({ ...f, canonical: e.target.value }))}
                  placeholder="https://imbaproduction.com/…"
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch id="noindex" checked={form.noindex} onCheckedChange={c => setForm(f => ({ ...f, noindex: c }))} />
                <Label htmlFor="noindex">noindex — hide from search</Label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>JSON-LD Structured data</Label>
              <Textarea
                rows={8}
                value={structuredRaw}
                onChange={e => { setStructuredRaw(e.target.value); setJsonError('') }}
                placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "Page name"\n}'}
                className="font-mono text-xs"
              />
              {jsonError && <p className="text-destructive text-xs">{jsonError}</p>}
              <p className="text-xs text-muted-foreground">Supports all schema.org types: WebPage, Article, FAQPage, Service, BreadcrumbList, VideoObject, etc.</p>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Save override'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
