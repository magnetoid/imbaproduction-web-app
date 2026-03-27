import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Loader2, Sparkles, Plus, Trash2, Mail, Phone, Globe, Building, Check, Copy, FileText, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { STAGES } from './CRMDashboard'
import type { CRMLead } from './CRMDashboard'

interface Activity {
  id: string
  lead_id: string
  type: string
  subject?: string
  body: string
  created_by: string
  created_at: string
}

const ACTIVITY_TYPES = ['note', 'email', 'call', 'meeting', 'proposal', 'follow_up']
const ACTIVITY_ICONS: Record<string, string> = {
  note: '📝', email: '✉️', call: '📞', meeting: '🤝', proposal: '📄', follow_up: '🔔',
}
const CONTACT_TYPES = new Set(['email', 'call', 'meeting'])

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lead, setLead] = useState<CRMLead | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiKey] = useState(() => localStorage.getItem('anthropic_api_key') || '')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiTemplate, setAiTemplate] = useState('')
  const [aiProposal, setAiProposal] = useState('')
  const [aiTab, setAiTab] = useState<'email' | 'proposal'>('email')
  const [copied, setCopied] = useState(false)
  const [newActivity, setNewActivity] = useState({ type: 'note', subject: '', body: '' })
  const [addingActivity, setAddingActivity] = useState(false)
  const [deletingActivity, setDeletingActivity] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    if (!id) return
    const [leadRes, activitiesRes] = await Promise.all([
      supabase.from('crm_leads').select('*').eq('id', id).single(),
      supabase.from('crm_activities').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    ])
    setLead(leadRes.data)
    setActivities(activitiesRes.data || [])
    setLoading(false)
  }, [id])

  useEffect(() => { loadAll() }, [loadAll])

  async function saveField(field: string, value: unknown) {
    if (!lead) return
    setSaving(true)
    await supabase.from('crm_leads').update({ [field]: value }).eq('id', lead.id)
    setLead(l => l ? { ...l, [field]: value } : l)
    setSaving(false)
  }

  async function addActivity(e: React.FormEvent) {
    e.preventDefault()
    if (!newActivity.body.trim() || !id || !lead) return
    setAddingActivity(true)
    const updates: Record<string, unknown> = {}
    if (CONTACT_TYPES.has(newActivity.type)) {
      updates.last_contacted_at = new Date().toISOString()
    }
    await supabase.from('crm_activities').insert([{
      lead_id: id,
      type: newActivity.type,
      subject: newActivity.subject || null,
      body: newActivity.body,
    }])
    if (Object.keys(updates).length > 0) {
      await supabase.from('crm_leads').update(updates).eq('id', lead.id)
      setLead(l => l ? { ...l, ...updates } : l)
    }
    setNewActivity({ type: 'note', subject: '', body: '' })
    setAddingActivity(false)
    loadAll()
  }

  async function deleteActivity(activityId: string) {
    setDeletingActivity(activityId)
    await supabase.from('crm_activities').delete().eq('id', activityId)
    setActivities(a => a.filter(x => x.id !== activityId))
    setDeletingActivity(null)
  }

  async function generateEmailTemplate() {
    if (!aiKey || !lead) return
    setAiLoading(true)
    setAiTemplate('')
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
          max_tokens: 600,
          messages: [{
            role: 'user',
            content: `Write a short, warm, professional follow-up email for a video production company (Imba Production) to send to this lead.

Lead info:
- Name: ${lead.name}
- Company: ${lead.company || 'unknown company'}
- Service interest: ${lead.service_interest || 'video production'}
- Budget: ${lead.budget_range || 'unknown'}
- Stage: ${lead.stage}
- Notes: ${lead.notes || 'none'}
- AI score: ${lead.ai_score ?? 'not scored'}
- AI notes: ${lead.ai_notes || 'none'}

Write a natural, not-too-salesy follow-up email. Subject line first, then body. Keep it under 150 words.`,
          }],
        }),
      })
      const data = await res.json() as { content: Array<{ text: string }> }
      setAiTemplate(data.content[0]?.text || '')
    } catch (_) {
      toast.error('Failed to generate email. Check your API key.')
      setAiTemplate('Failed to generate. Check your API key.')
    }
    setAiLoading(false)
  }

  async function generateProposal() {
    if (!aiKey || !lead) return
    setAiLoading(true)
    setAiProposal('')
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
          max_tokens: 900,
          messages: [{
            role: 'user',
            content: `Create a concise video production proposal outline for Imba Production to send to this client.

Client info:
- Name: ${lead.name}
- Company: ${lead.company || 'unknown company'}
- Service needed: ${lead.service_interest || 'video production'}
- Budget: ${lead.budget_range || 'unknown'}
- Notes: ${lead.notes || 'none'}
- Stage: ${lead.stage}

Format as a proposal outline with sections: Executive Summary, Project Scope, Deliverables, Timeline (suggested), Investment, and Next Steps. Keep each section brief (2-4 bullet points). Be specific to video production.`,
          }],
        }),
      })
      const data = await res.json() as { content: Array<{ text: string }> }
      setAiProposal(data.content[0]?.text || '')
    } catch (_) {
      toast.error('Failed to generate proposal. Check your API key.')
      setAiProposal('Failed to generate. Check your API key.')
    }
    setAiLoading(false)
  }

  async function scoreWithAI() {
    if (!aiKey || !lead) return
    setAiLoading(true)
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
          max_tokens: 400,
          messages: [{
            role: 'user',
            content: `Score this lead for a video production company (0-100) and give a 2-3 sentence follow-up recommendation.

Lead: ${lead.name}, ${lead.company || 'no company'}, ${lead.service_interest || 'unknown service'}, budget: ${lead.budget_range || 'unknown'}, stage: ${lead.stage}, notes: ${lead.notes || 'none'}

Return ONLY valid JSON: {"score": NUMBER, "notes": "recommendation"}`,
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
      setLead(l => l ? { ...l, ai_score: parsed.score, ai_notes: parsed.notes } : l)
    } catch (_) {
      toast.error('AI scoring failed. Check your API key.')
    }
    setAiLoading(false)
  }

  async function deleteLead() {
    if (!lead || !confirm(`Delete lead "${lead.name}"?`)) return
    await supabase.from('crm_leads').delete().eq('id', lead.id)
    navigate('/admin/crm')
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  if (!lead) return (
    <div className="p-8">
      <p className="text-muted-foreground">Lead not found.</p>
      <Button variant="ghost" onClick={() => navigate('/admin/crm')} className="mt-4">
        <ArrowLeft className="h-4 w-4 mr-2" />Back to CRM
      </Button>
    </div>
  )

  const stageInfo = STAGES.find(s => s.key === lead.stage)
  const stageIndex = STAGES.findIndex(s => s.key === lead.stage)
  const isOverdue = lead.next_follow_up && new Date(lead.next_follow_up) < new Date() && !['won', 'lost'].includes(lead.stage)

  const aiContent = aiTab === 'email' ? aiTemplate : aiProposal

  return (
    <div className="p-6 max-w-screen-lg">
      {/* Back + delete */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/crm')}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back to pipeline
        </Button>
        <div className="flex items-center gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <Button variant="destructive" size="sm" onClick={deleteLead}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
          </Button>
        </div>
      </div>

      {/* Stage stepper */}
      <div className="flex items-center gap-0 mb-6 overflow-x-auto pb-1">
        {STAGES.map((s, i) => {
          const isPast = i < stageIndex
          const isCurrent = i === stageIndex
          return (
            <button
              key={s.key}
              onClick={() => saveField('stage', s.key)}
              className="flex items-center group"
            >
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${
                isCurrent ? 'text-white' : isPast ? 'text-muted-foreground' : 'text-muted-foreground/40'
              }`}
                style={isCurrent ? { background: s.color } : isPast ? { background: `${s.color}20` } : {}}
              >
                {isPast && <Check className="h-3 w-3" />}
                {s.label}
              </div>
              {i < STAGES.length - 1 && (
                <div className={`h-px w-3 flex-shrink-0 ${i < stageIndex ? 'bg-border' : 'bg-border/30'}`} />
              )}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lead info */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Header card */}
          <div className="border border-border rounded-lg p-5" style={{ borderLeft: `3px solid ${stageInfo?.color || '#6C7AE0'}` }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{lead.name}</h1>
                {lead.company && <p className="text-muted-foreground mt-1 flex items-center gap-1.5"><Building className="h-3.5 w-3.5" />{lead.company}</p>}
              </div>
              <Select value={lead.stage} onValueChange={v => saveField('stage', v)}>
                <SelectTrigger className="w-[160px]" style={{ borderColor: `${stageInfo?.color}40`, color: stageInfo?.color }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <Mail className="h-3.5 w-3.5" />{lead.email}
                </a>
              )}
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <Phone className="h-3.5 w-3.5" />{lead.phone}
                </a>
              )}
              {lead.website && (
                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <Globe className="h-3.5 w-3.5" />{lead.website}
                </a>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">Lead details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Service interest', field: 'service_interest', value: lead.service_interest },
                { label: 'Budget range', field: 'budget_range', value: lead.budget_range },
                { label: 'Deal value ($)', field: 'value', value: lead.value?.toString() },
                { label: 'Probability (%)', field: 'probability', value: lead.probability.toString() },
              ].map(({ label, field, value }) => (
                <div key={field} className="flex flex-col gap-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    defaultValue={value || ''}
                    onBlur={e => saveField(field, field === 'value' ? (parseFloat(e.target.value) || null) : (field === 'probability' ? parseInt(e.target.value) : e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Follow-up date */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label className={`text-xs flex items-center gap-1.5 ${isOverdue ? 'text-red-400' : ''}`}>
                  <Calendar className="h-3 w-3" />
                  Next follow-up {isOverdue && <span className="text-red-400">— overdue!</span>}
                </Label>
                <Input
                  type="date"
                  defaultValue={lead.next_follow_up ? lead.next_follow_up.split('T')[0] : ''}
                  onBlur={e => saveField('next_follow_up', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className={`h-8 text-sm ${isOverdue ? 'border-red-400/50 text-red-400' : ''}`}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Last contacted</Label>
                <Input
                  type="date"
                  defaultValue={lead.last_contacted_at ? lead.last_contacted_at.split('T')[0] : ''}
                  onBlur={e => saveField('last_contacted_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-xs">Notes</Label>
              <Textarea
                defaultValue={lead.notes || ''}
                onBlur={e => saveField('notes', e.target.value)}
                rows={3}
                className="mt-1 text-sm"
                placeholder="Internal notes about this lead…"
              />
            </div>
          </div>

          {/* Activity timeline */}
          <div className="border border-border rounded-lg p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">Activity timeline</h3>
            <form onSubmit={addActivity} className="flex flex-col gap-3 mb-5">
              <div className="flex gap-2">
                <Select value={newActivity.type} onValueChange={v => setNewActivity(a => ({ ...a, type: v }))}>
                  <SelectTrigger className="w-[140px] h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{ACTIVITY_ICONS[t]} {t.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={newActivity.subject}
                  onChange={e => setNewActivity(a => ({ ...a, subject: e.target.value }))}
                  placeholder="Subject (optional)"
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={newActivity.body}
                  onChange={e => setNewActivity(a => ({ ...a, body: e.target.value }))}
                  placeholder="Log a note, email, call…"
                  rows={2}
                  className="text-sm"
                />
                <Button type="submit" size="sm" disabled={addingActivity} className="self-end">
                  {addingActivity ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                </Button>
              </div>
              {CONTACT_TYPES.has(newActivity.type) && (
                <p className="text-xs text-muted-foreground/60">Logging this will update "Last contacted" to now.</p>
              )}
            </form>

            <div className="flex flex-col gap-3">
              {activities.map(a => (
                <div key={a.id} className="flex gap-3 group/activity">
                  <div className="text-base mt-0.5 flex-shrink-0">{ACTIVITY_ICONS[a.type] || '📝'}</div>
                  <div className="flex-1 min-w-0">
                    {a.subject && <p className="text-sm font-medium text-foreground">{a.subject}</p>}
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.body}</p>
                    <p className="text-xs text-muted-foreground/40 mt-1">
                      {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteActivity(a.id)}
                    disabled={deletingActivity === a.id}
                    className="flex-shrink-0 opacity-0 group-hover/activity:opacity-100 transition-opacity p-1 text-muted-foreground/40 hover:text-destructive"
                    title="Delete"
                  >
                    {deletingActivity === a.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  </button>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-xs text-muted-foreground/50 text-center py-4">No activities yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: AI sidebar */}
        <div className="flex flex-col gap-5">
          {/* AI Score */}
          <div className="border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">AI Lead Score</h3>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono"
                style={{ background: 'rgba(201,169,110,0.1)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.2)' }}>
                Claude
              </span>
            </div>
            {lead.ai_score != null ? (
              <div className="mb-3">
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold" style={{ color: lead.ai_score >= 70 ? '#22c55e' : lead.ai_score >= 40 ? '#C9A96E' : '#ef4444' }}>
                    {lead.ai_score}
                  </span>
                  <span className="text-muted-foreground text-sm mb-1">/100</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${lead.ai_score}%`,
                      background: lead.ai_score >= 70 ? '#22c55e' : lead.ai_score >= 40 ? '#C9A96E' : '#ef4444',
                    }} />
                </div>
                {lead.ai_notes && <p className="text-xs text-muted-foreground leading-relaxed">{lead.ai_notes}</p>}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-3">Not scored yet. Click below to analyse this lead with AI.</p>
            )}
            <Button variant="outline" size="sm" className="w-full" onClick={scoreWithAI} disabled={aiLoading || !aiKey}>
              {aiLoading ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Analysing…</> : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Score with AI</>}
            </Button>
            {!aiKey && <p className="text-xs text-muted-foreground/50 mt-2 text-center">Set API key in Translations admin</p>}
          </div>

          {/* AI Generator — email + proposal tabs */}
          <div className="border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">AI Generator</h3>
              <div className="flex border border-border rounded overflow-hidden">
                {([
                  { key: 'email', icon: Mail, label: 'Email' },
                  { key: 'proposal', icon: FileText, label: 'Proposal' },
                ] as const).map(({ key, icon: Icon, label }) => (
                  <button key={key} onClick={() => setAiTab(key)}
                    className={`flex items-center gap-1 px-2 py-1 text-xs transition-colors ${aiTab === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    <Icon className="h-3 w-3" />{label}
                  </button>
                ))}
              </div>
            </div>

            {aiContent && (
              <div className="bg-muted/30 border border-border rounded p-3 mb-3 relative">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-60 overflow-y-auto">{aiContent}</pre>
                <button
                  onClick={() => copyToClipboard(aiContent)}
                  className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <><Check className="h-3 w-3 text-green-500" />Copied!</> : <><Copy className="h-3 w-3" />Copy</>}
                </button>
              </div>
            )}

            <Button variant="outline" size="sm" className="w-full" disabled={aiLoading || !aiKey}
              onClick={aiTab === 'email' ? generateEmailTemplate : generateProposal}>
              {aiLoading
                ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Generating…</>
                : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />{aiTab === 'email' ? 'Generate email' : 'Generate proposal'}</>}
            </Button>
          </div>

          {/* Meta */}
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-3">Meta</p>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Source</span>
                <Badge variant="outline" className="text-[0.65rem]">{lead.source.replace(/_/g, ' ')}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Probability</span>
                <span className="text-foreground font-mono">{lead.probability}%</span>
              </div>
              {lead.value && (
                <div className="flex justify-between">
                  <span>Deal value</span>
                  <span className="text-foreground font-mono">${lead.value.toLocaleString()}</span>
                </div>
              )}
              {lead.last_contacted_at && (
                <div className="flex justify-between">
                  <span>Last contacted</span>
                  <span>{new Date(lead.last_contacted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between">
                <span>Created</span>
                <span>{new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
