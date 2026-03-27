import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import toast from 'react-hot-toast'
import {
  Mail, Sparkles, Loader2, Send, CheckCircle2,
  Plus, Pencil, Trash2, Eye, RefreshCw, Filter, Building2, Copy, Check,
} from 'lucide-react'

interface CRMLead {
  id: string
  name: string
  company: string
  email: string
  service_interest: string
  ai_score: number
  ai_notes: string
}

interface OutreachEmail {
  id: string
  lead_id: string
  subject: string
  body: string
  status: string
  ai_generated: boolean
  sent_at: string | null
  created_at: string
  crm_leads?: { id: string; name: string; company: string; email: string } | null
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  draft:    { label: 'Draft',    color: 'text-muted-foreground' },
  approved: { label: 'Approved', color: 'text-blue-400' },
  queued:   { label: 'Queued',   color: 'text-amber-400' },
  sent:     { label: 'Sent',     color: 'text-emerald-400' },
  bounced:  { label: 'Bounced',  color: 'text-red-400' },
  opened:   { label: 'Opened',   color: 'text-cyan-400' },
  replied:  { label: 'Replied',  color: 'text-purple-400' },
}

async function getSchedulingUrl(): Promise<string> {
  const { data } = await supabase.from('crm_ai_settings').select('value').eq('key', 'company_profile').maybeSingle()
  return (data?.value as { scheduling_url?: string })?.scheduling_url || ''
}

async function generateEmailWithClaude(apiKey: string, lead: CRMLead): Promise<{ subject: string; body: string }> {
  const calendarUrl = await getSchedulingUrl()
  const calendarInstruction = calendarUrl
    ? `\n- End with a calendar booking link: "Book a time here: ${calendarUrl}"`
    : '\n- CTA: reply or book a 15-min call'

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Write a personalized cold outreach email for Imba Production (cinematic video production) to ${lead.company || 'the team'} at ${lead.name} (${lead.service_interest || 'video production'}).

Lead context: ${lead.ai_notes || 'A growing company that could benefit from professional video.'}

Requirements:
- Professional but human tone
- Non-generic subject line (no "quick question" or "hope you're well")
- Mention a specific pain point for their industry
- One concrete result Imba has achieved (invent a plausible example)${calendarInstruction}
- Max 120 words body

Return ONLY valid JSON (no markdown):
{"subject": "string", "body": "string (plain text, \\n for line breaks)"}`
      }],
    }),
  })
  const data = await res.json()
  const text: string = data.content?.[0]?.text || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in AI response')
  return JSON.parse(match[0])
}

export default function AIOutreach() {
  const [apiKey] = useState(() => localStorage.getItem('anthropic_api_key') || '')
  const [leads, setLeads] = useState<CRMLead[]>([])
  const [emails, setEmails] = useState<OutreachEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [generating, setGenerating] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [editDialog, setEditDialog] = useState<OutreachEmail | null>(null)
  const [composeDialog, setComposeDialog] = useState(false)
  const [composeLead, setComposeLead] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [composeSaving, setComposeSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [leadsRes, emailsRes] = await Promise.all([
      supabase.from('crm_leads').select('id,name,company,email,service_interest,ai_score,ai_notes').order('created_at', { ascending: false }),
      supabase.from('crm_outreach_emails').select('*, crm_leads(id,name,company,email)').order('created_at', { ascending: false }),
    ])
    setLeads((leadsRes.data as CRMLead[]) || [])
    setEmails((emailsRes.data as OutreachEmail[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function generateEmail(lead: CRMLead) {
    if (!apiKey) { toast.error('Add your Anthropic API key in Settings first.'); return }
    setGenerating(lead.id)
    try {
      const email = await generateEmailWithClaude(apiKey, lead)
      await supabase.from('crm_outreach_emails').insert({
        lead_id: lead.id, subject: email.subject, body: email.body,
        status: 'draft', ai_generated: true,
      })
      toast.success('Email draft created')
      load()
    } catch {
      toast.error('Generation failed — check your API key.')
    }
    setGenerating(null)
  }

  async function approveEmail(id: string) {
    await supabase.from('crm_outreach_emails').update({ status: 'approved' }).eq('id', id)
    setEmails(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e))
    toast.success('Email approved')
  }

  async function sendEmail(email: OutreachEmail) {
    setSendingId(email.id)
    const toEmail = email.crm_leads?.email
    if (!toEmail) { toast.error('Lead has no email address.'); setSendingId(null); return }

    const { data: smtpRow } = await supabase.from('crm_ai_settings').select('value').eq('key', 'smtp_config').maybeSingle()

    if (smtpRow?.value) {
      // Try Edge Function
      const { error } = await supabase.functions.invoke('send-email', {
        body: { to: toEmail, to_name: email.crm_leads?.company, subject: email.subject, body: email.body, smtp: smtpRow.value },
      })
      if (!error) {
        await supabase.from('crm_outreach_emails').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', email.id)
        toast.success('Email sent!')
        load()
        setSendingId(null)
        return
      }
    }

    // Fallback: open mailto
    window.open(`mailto:${toEmail}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`)
    await supabase.from('crm_outreach_emails').update({ status: 'queued' }).eq('id', email.id)
    toast('Opened in your mail client. Mark as sent when done.', { icon: '✉️' })
    load()
    setSendingId(null)
  }

  async function deleteEmail(id: string) {
    if (!confirm('Delete this email?')) return
    await supabase.from('crm_outreach_emails').delete().eq('id', id)
    setEmails(prev => prev.filter(e => e.id !== id))
    toast.success('Deleted')
  }

  async function saveEdit() {
    if (!editDialog) return
    setComposeSaving(true)
    await supabase.from('crm_outreach_emails').update({ subject: editDialog.subject, body: editDialog.body, status: 'draft' }).eq('id', editDialog.id)
    setEditDialog(null)
    setComposeSaving(false)
    toast.success('Saved as draft')
    load()
  }

  async function saveCompose() {
    if (!composeLead || !composeSubject || !composeBody) return
    setComposeSaving(true)
    await supabase.from('crm_outreach_emails').insert({ lead_id: composeLead, subject: composeSubject, body: composeBody, status: 'draft', ai_generated: false })
    setComposeDialog(false)
    setComposeLead(''); setComposeSubject(''); setComposeBody('')
    setComposeSaving(false)
    toast.success('Draft saved')
    load()
  }

  function copyEmail(email: OutreachEmail) {
    navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`)
    setCopied(email.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const filtered = statusFilter === 'all' ? emails : emails.filter(e => e.status === statusFilter)
  const leadsWithoutEmail = leads.filter(l => !emails.some(e => e.lead_id === l.id))

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-amber-500" />
          <h1 className="text-2xl font-semibold">AI Outreach</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" className="gap-2 bg-amber-500 hover:bg-amber-600 text-black" onClick={() => setComposeDialog(true)}>
            <Plus className="h-4 w-4" /> Compose
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground text-sm mb-8">Generate, review, approve and send AI-personalized cold emails. SMTP or mailto fallback.</p>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Total', value: emails.length },
          { label: 'Drafts', value: emails.filter(e => e.status === 'draft').length, color: 'text-muted-foreground' },
          { label: 'Approved', value: emails.filter(e => e.status === 'approved').length, color: 'text-blue-400' },
          { label: 'Sent', value: emails.filter(e => ['sent','opened','replied'].includes(e.status)).length, color: 'text-emerald-400' },
          { label: 'Replied', value: emails.filter(e => e.status === 'replied').length, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg px-4 py-3">
            <p className={`text-2xl font-mono font-bold ${s.color || 'text-foreground'}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick generate */}
      {leadsWithoutEmail.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground/50 mb-2">Quick generate</p>
          <div className="flex gap-2 flex-wrap">
            {leadsWithoutEmail.slice(0, 8).map(lead => (
              <button key={lead.id} onClick={() => generateEmail(lead)} disabled={generating === lead.id}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border hover:border-amber-500/40 rounded-md text-sm transition-all disabled:opacity-50">
                {generating === lead.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                  : <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                {lead.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Separator className="mb-5" />

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        {['all', 'draft', 'approved', 'queued', 'sent', 'opened', 'replied', 'bounced'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${statusFilter === s ? 'bg-amber-500/15 text-amber-400' : 'text-muted-foreground hover:text-foreground'}`}>
            {s === 'all' ? `All (${emails.length})` : `${s} (${emails.filter(e => e.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Email list */}
      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <Mail className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No emails yet. Generate from a lead above or compose manually.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(email => {
            const meta = STATUS_META[email.status] || STATUS_META.draft
            return (
              <div key={email.id} className="bg-card border border-border rounded-lg p-5 hover:border-border/60 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Building2 className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                      <span className="text-sm font-medium">{email.crm_leads?.name || '—'}</span>
                      <span className="text-xs text-muted-foreground">{email.crm_leads?.email}</span>
                      {email.ai_generated && (
                        <Badge variant="secondary" className="text-xs gap-1 py-0 h-5">
                          <Sparkles className="h-2.5 w-2.5" /> AI
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-sm mb-1">{email.subject}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{email.body}</p>
                  </div>
                  <span className={`text-xs font-mono flex-shrink-0 ${meta.color}`}>{meta.label}</span>
                </div>

                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border flex-wrap">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => copyEmail(email)}>
                    {copied === email.id ? <><Check className="h-3 w-3 text-emerald-400" />Copied</> : <><Copy className="h-3 w-3" />Copy</>}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setEditDialog(email)}>
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <a href={`mailto:${email.crm_leads?.email || ''}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <Mail className="h-3 w-3" /> Open in mail
                    </Button>
                  </a>
                  {email.status === 'draft' && (
                    <Button size="sm" className="h-7 text-xs gap-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20" onClick={() => approveEmail(email.id)}>
                      <CheckCircle2 className="h-3 w-3" /> Approve
                    </Button>
                  )}
                  {email.status === 'approved' && (
                    <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                      disabled={sendingId === email.id} onClick={() => sendEmail(email)}>
                      {sendingId === email.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} Send
                    </Button>
                  )}
                  {email.status === 'sent' && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-cyan-400"
                      onClick={async () => {
                        await supabase.from('crm_outreach_emails').update({ status: 'opened' }).eq('id', email.id)
                        load()
                      }}>
                      <Eye className="h-3 w-3" /> Mark opened
                    </Button>
                  )}
                  {email.status === 'opened' && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-purple-400"
                      onClick={async () => {
                        await supabase.from('crm_outreach_emails').update({ status: 'replied' }).eq('id', email.id)
                        load()
                      }}>
                      <Mail className="h-3 w-3" /> Mark replied
                    </Button>
                  )}
                  <div className="flex-1" />
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deleteEmail(email.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={open => !open && setEditDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit email</DialogTitle></DialogHeader>
          {editDialog && (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label>Subject</Label>
                <Input value={editDialog.subject} onChange={e => setEditDialog(p => p ? { ...p, subject: e.target.value } : p)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Body</Label>
                <Textarea value={editDialog.body} onChange={e => setEditDialog(p => p ? { ...p, body: e.target.value } : p)} rows={12} className="font-mono text-sm" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={composeSaving}>
              {composeSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save as draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compose Dialog */}
      <Dialog open={composeDialog} onOpenChange={setComposeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Compose email</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Lead</Label>
              <Select value={composeLead} onValueChange={setComposeLead}>
                <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
                <SelectContent>{leads.map(l => <SelectItem key={l.id} value={l.id}>{l.name} — {l.company}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Subject</Label>
              <Input value={composeSubject} onChange={e => setComposeSubject(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Body</Label>
              <Textarea value={composeBody} onChange={e => setComposeBody(e.target.value)} rows={8} className="font-mono text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeDialog(false)}>Cancel</Button>
            <Button onClick={saveCompose} disabled={composeSaving || !composeLead || !composeSubject || !composeBody}>
              {composeSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save as draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
