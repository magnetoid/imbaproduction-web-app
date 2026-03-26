import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Plus, Loader2, Sparkles, Users, TrendingUp, DollarSign, Target, ArrowRight, Import } from 'lucide-react'

export interface CRMLead {
  id: string
  name: string
  email?: string
  company?: string
  phone?: string
  website?: string
  source: string
  quote_request_id?: string
  stage: string
  value?: number
  probability: number
  service_interest?: string
  budget_range?: string
  notes?: string
  ai_score?: number
  ai_notes?: string
  last_contacted_at?: string
  next_follow_up?: string
  created_at: string
  updated_at: string
}

const STAGES: { key: string; label: string; color: string }[] = [
  { key: 'new',          label: 'New',           color: '#6C7AE0' },
  { key: 'qualified',    label: 'Qualified',     color: '#3CBFAE' },
  { key: 'proposal',     label: 'Proposal Sent', color: '#C9A96E' },
  { key: 'negotiation',  label: 'Negotiation',   color: '#E87A2A' },
  { key: 'won',          label: 'Won',           color: '#22c55e' },
  { key: 'lost',         label: 'Lost',          color: '#64748b' },
]

const SOURCES = ['manual', 'quote_form', 'referral', 'cold_outreach', 'social', 'event']

const EMPTY_FORM = {
  name: '', email: '', company: '', phone: '', website: '',
  source: 'manual', stage: 'new', value: '', probability: '50',
  service_interest: '', budget_range: '', notes: '',
}

export default function CRMDashboard() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState<CRMLead[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [search, setSearch] = useState('')
  const [aiKey, setAiKey] = useState(() => localStorage.getItem('anthropic_api_key') || '')
  const [scoringId, setScoringId] = useState<string | null>(null)
  const [importingQuotes, setImportingQuotes] = useState(false)

  const loadLeads = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('crm_leads').select('*').order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadLeads() }, [loadLeads])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    const { error: err } = await supabase.from('crm_leads').insert([{
      ...form,
      value: form.value ? parseFloat(form.value) : null,
      probability: parseInt(form.probability) || 50,
    }])
    setSaving(false)
    if (err) { setError(err.message); return }
    setAddOpen(false)
    setForm(EMPTY_FORM)
    loadLeads()
  }

  async function importFromQuotes() {
    setImportingQuotes(true)
    // Load unimported quote requests
    const { data: quotes } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (!quotes?.length) { setImportingQuotes(false); return }

    // Get existing imported IDs
    const { data: existing } = await supabase
      .from('crm_leads')
      .select('quote_request_id')
      .not('quote_request_id', 'is', null)

    const existingIds = new Set((existing || []).map(r => r.quote_request_id))
    const toImport = quotes.filter(q => !existingIds.has(q.id))

    if (toImport.length > 0) {
      await supabase.from('crm_leads').insert(
        toImport.map(q => ({
          name: q.full_name,
          email: q.email,
          company: q.company,
          source: 'quote_form',
          quote_request_id: q.id,
          stage: 'new',
          service_interest: q.service_type,
          budget_range: q.budget_range,
          notes: q.message,
          probability: 50,
        }))
      )
    }
    setImportingQuotes(false)
    loadLeads()
  }

  async function scoreWithAI(lead: CRMLead) {
    if (!aiKey) { alert('Enter your Anthropic API key in the AI Translate section first.'); return }
    setScoringId(lead.id)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': aiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-allow-browser': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 512,
          messages: [{
            role: 'user',
            content: `You are a B2B sales expert for a video production company (Imba Production). Score this lead from 0-100 and give a brief follow-up recommendation.

Lead info:
- Name: ${lead.name}
- Company: ${lead.company || 'Unknown'}
- Service interest: ${lead.service_interest || 'Unknown'}
- Budget: ${lead.budget_range || 'Unknown'}
- Notes: ${lead.notes || 'None'}
- Stage: ${lead.stage}

Return ONLY valid JSON: {"score": NUMBER, "notes": "2-3 sentence follow-up recommendation"}`,
          }],
        }),
      })
      const data = await res.json() as { content: Array<{ text: string }> }
      const text = data.content[0]?.text || '{}'
      const cleaned = text.replace(/```(?:json)?\n?/g, '').replace(/```\s*$/g, '').trim()
      const parsed = JSON.parse(cleaned) as { score: number; notes: string }
      await supabase.from('crm_leads').update({
        ai_score: parsed.score,
        ai_notes: parsed.notes,
        last_ai_scored_at: new Date().toISOString(),
      }).eq('id', lead.id)
      setLeads(l => l.map(x => x.id === lead.id ? { ...x, ai_score: parsed.score, ai_notes: parsed.notes } : x))
    } catch (_) {
      // silent fail
    }
    setScoringId(null)
  }

  const filtered = leads.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase())
  )

  // Pipeline stats
  const totalValue = leads.filter(l => l.stage !== 'lost').reduce((s, l) => s + (l.value || 0), 0)
  const wonValue = leads.filter(l => l.stage === 'won').reduce((s, l) => s + (l.value || 0), 0)
  const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.stage)).length

  function stageColor(stage: string) {
    return STAGES.find(s => s.key === stage)?.color || '#6C7AE0'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">AI CRM</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{ background: 'rgba(201,169,110,0.1)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.2)' }}>
              Powered by Claude
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Lead Pipeline</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={importFromQuotes} disabled={importingQuotes}>
            {importingQuotes ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Import className="h-3.5 w-3.5 mr-1.5" />}
            Import quotes
          </Button>
          <Button onClick={() => { setForm(EMPTY_FORM); setError(''); setAddOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />Add lead
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users,      label: 'Total leads',    value: leads.length.toString() },
          { icon: Target,     label: 'Active',         value: activeLeads.toString() },
          { icon: DollarSign, label: 'Pipeline value', value: totalValue ? `$${totalValue.toLocaleString()}` : '—' },
          { icon: TrendingUp, label: 'Won value',      value: wonValue ? `$${wonValue.toLocaleString()}` : '—' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-5">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search leads…"
          className="max-w-xs"
        />
        <div className="flex border border-border rounded-md overflow-hidden">
          {(['kanban', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {v === 'kanban' ? 'Board' : 'List'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : view === 'kanban' ? (
        /* ── KANBAN VIEW ── */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: `${STAGES.length * 240}px` }}>
            {STAGES.map(stage => {
              const stageLeads = filtered.filter(l => l.stage === stage.key)
              return (
                <div key={stage.key} className="flex-1" style={{ minWidth: '220px' }}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                      <span className="text-xs font-mono tracking-wider uppercase text-muted-foreground">{stage.label}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground/50">{stageLeads.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {stageLeads.map(lead => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        stageColor={stage.color}
                        onNavigate={() => navigate(`/admin/crm/${lead.id}`)}
                        onScore={() => scoreWithAI(lead)}
                        scoring={scoringId === lead.id}
                      />
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="border border-dashed border-border rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground/40">No leads</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">Company</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">AI Score</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-muted-foreground">Value</th>
                <th className="px-4 py-3 text-right text-xs font-mono text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.company || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" style={{ borderColor: `${stageColor(lead.stage)}40`, color: stageColor(lead.stage) }}>
                      {STAGES.find(s => s.key === lead.stage)?.label || lead.stage}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {lead.ai_score != null ? (
                      <AIScorePip score={lead.ai_score} />
                    ) : (
                      <button onClick={() => scoreWithAI(lead)} disabled={scoringId === lead.id}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        {scoringId === lead.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        Score
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.value ? `$${lead.value.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/crm/${lead.id}`)}>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No leads yet — add one or import from quote requests.</p>
            </div>
          )}
        </div>
      )}

      {/* Add lead dialog */}
      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) setError('') }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add lead</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@company.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Company</Label>
                <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company name" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555…" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Stage</Label>
                <Select value={form.stage} onValueChange={v => setForm(f => ({ ...f, stage: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Source</Label>
                <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Service interest</Label>
                <Input value={form.service_interest} onChange={e => setForm(f => ({ ...f, service_interest: e.target.value }))} placeholder="e.g. Brand Video" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Deal value ($)</Label>
                <Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="0" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Notes</Label>
              <Textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="What did they say? Any context…" />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Separator />

            {/* AI Key hint */}
            <div className="flex flex-col gap-1.5">
              <Label>Anthropic API key (for AI scoring)</Label>
              <Input type="password" value={aiKey}
                onChange={e => { setAiKey(e.target.value); localStorage.setItem('anthropic_api_key', e.target.value) }}
                placeholder="sk-ant-…" />
              <p className="text-xs text-muted-foreground">Stored locally in your browser. Used for AI lead scoring.</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : 'Add lead'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LeadCard({
  lead, stageColor, onNavigate, onScore, scoring,
}: {
  lead: CRMLead
  stageColor: string
  onNavigate: () => void
  onScore: () => void
  scoring: boolean
}) {
  return (
    <div
      className="border border-border rounded-lg p-3 bg-card hover:border-primary/30 transition-all cursor-pointer group"
      onClick={onNavigate}
      style={{ borderLeft: `2px solid ${stageColor}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-sm font-medium text-foreground leading-tight">{lead.name}</p>
          {lead.company && <p className="text-xs text-muted-foreground mt-0.5">{lead.company}</p>}
        </div>
        {lead.ai_score != null && <AIScorePip score={lead.ai_score} />}
      </div>

      {lead.service_interest && (
        <p className="text-xs text-muted-foreground mb-2">{lead.service_interest}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {lead.value && (
            <span className="text-xs font-mono text-muted-foreground">${lead.value.toLocaleString()}</span>
          )}
          {lead.budget_range && !lead.value && (
            <span className="text-xs text-muted-foreground/60">{lead.budget_range}</span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button
            onClick={onScore}
            disabled={scoring}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            title="AI score"
          >
            {scoring ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {lead.ai_notes && (
        <p className="text-xs text-muted-foreground/60 mt-2 border-t border-border pt-2 line-clamp-2"
          style={{ color: '#C9A96E', opacity: 0.7 }}>
          {lead.ai_notes}
        </p>
      )}
    </div>
  )
}

function AIScorePip({ score }: { score: number }) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#C9A96E' : '#ef4444'
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-xs font-mono font-bold" style={{ color }}>{score}</span>
    </div>
  )
}
