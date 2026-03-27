import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import toast from 'react-hot-toast'
import {
  Search, Sparkles, Loader2, Building2, Mail, Globe, Phone,
  CheckCircle2, Plus, Download, Star, Target, History,
} from 'lucide-react'

interface DiscoveredLead {
  company_name: string
  contact_name: string
  email: string
  phone: string
  website: string
  industry: string
  company_size: string
  ai_score: number
  ai_summary: string
}

const INDUSTRIES = [
  'E-commerce & Retail', 'SaaS & Tech', 'Real Estate', 'Healthcare', 'Food & Beverage',
  'Fashion & Beauty', 'Education & eLearning', 'Finance & Fintech', 'Hospitality & Travel',
  'Manufacturing', 'Non-Profit', 'Legal & Professional Services', 'Entertainment & Media',
]
const SIZES = ['1–10', '11–50', '51–200', '201–500', '500+']
const GOALS = ['brand awareness', 'product launch', 'lead generation', 'investor pitch', 'social media content', 'eLearning / training']

async function claudeJSON<T>(apiKey: string, prompt: string, max_tokens = 4000): Promise<T> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: 'claude-opus-4-6', max_tokens, messages: [{ role: 'user', content: prompt }] }),
  })
  const data = await res.json()
  const text: string = data.content?.[0]?.text || ''
  const match = text.match(/[\[{][\s\S]*[\]}]/)
  if (!match) throw new Error('No JSON in response')
  return JSON.parse(match[0]) as T
}

export default function AILeadSearcher() {
  const [apiKey] = useState(() => localStorage.getItem('anthropic_api_key') || '')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<DiscoveredLead[]>([])
  const [importingAll, setImportingAll] = useState(false)
  const [imported, setImported] = useState<Set<number>>(new Set())
  const [searchHistory, setSearchHistory] = useState<{ label: string; count: number; date: string }[]>([])
  const [criteria, setCriteria] = useState({ industry: '', location: '', size: '', videoGoal: '', keywords: '', count: '10' })

  useEffect(() => { loadHistory() }, [])

  async function loadHistory() {
    const { data } = await supabase.from('crm_ai_settings').select('value').eq('key', 'lead_search_history').maybeSingle()
    if (data?.value) setSearchHistory((data.value as { searches: typeof searchHistory }).searches || [])
  }

  async function search() {
    if (!apiKey) { toast.error('Add your Anthropic API key in CRM → Settings first.'); return }
    if (!criteria.industry) { toast.error('Select an industry.'); return }
    setLoading(true)
    setResults([])
    setImported(new Set())

    const prompt = `You are a B2B lead researcher for Imba Production, a cinematic video production company.
Generate ${criteria.count} realistic but fictional potential B2B leads that need professional video production.

Criteria:
- Industry: ${criteria.industry}
- Location: ${criteria.location || 'Global / US / Europe'}
- Company size: ${criteria.size || 'Any'}
- Video goal: ${criteria.videoGoal || 'Brand awareness'}
- Keywords: ${criteria.keywords || 'growth-stage, digital-first'}

Return ONLY a valid JSON array (no markdown):
[{
  "company_name": "string",
  "contact_name": "string (CMO/CEO/Marketing Director)",
  "email": "string (realistic business email)",
  "phone": "string (international format)",
  "website": "string (realistic .com domain)",
  "industry": "string",
  "company_size": "string (e.g. 50-200)",
  "ai_score": number (0-100, likelihood they need video production),
  "ai_summary": "2 sentences: their pain point and opportunity for Imba Production"
}]`

    try {
      const leads = await claudeJSON<DiscoveredLead[]>(apiKey, prompt)
      setResults(leads)
      const label = `${criteria.industry} · ${criteria.location || 'Global'}`
      const entry = { label, count: leads.length, date: new Date().toISOString() }
      const next = [entry, ...searchHistory].slice(0, 8)
      setSearchHistory(next)
      await supabase.from('crm_ai_settings').upsert({ key: 'lead_search_history', value: { searches: next } })
      toast.success(`Found ${leads.length} leads`)
    } catch {
      toast.error('AI search failed. Check your API key and try again.')
    }
    setLoading(false)
  }

  async function importLead(lead: DiscoveredLead, idx: number) {
    const { error } = await supabase.from('crm_leads').insert({
      name: lead.company_name, company: lead.contact_name,
      email: lead.email, phone: lead.phone, website: lead.website,
      notes: `Industry: ${lead.industry || 'N/A'} | Company size: ${lead.company_size || 'N/A'}`,
      ai_score: lead.ai_score, ai_notes: lead.ai_summary,
      source: 'ai_search', stage: 'new',
    })
    if (error) { toast.error(`Failed: ${error.message}`); return }
    setImported(prev => new Set([...prev, idx]))
    toast.success(`${lead.company_name} added to CRM`)
  }

  async function importAll() {
    setImportingAll(true)
    let count = 0
    for (let i = 0; i < results.length; i++) {
      if (!imported.has(i)) {
        const { error } = await supabase.from('crm_leads').insert({
          name: results[i].company_name, company: results[i].contact_name,
          email: results[i].email, phone: results[i].phone, website: results[i].website,
          notes: `Industry: ${results[i].industry || 'N/A'} | Company size: ${results[i].company_size || 'N/A'}`,
          ai_score: results[i].ai_score, ai_notes: results[i].ai_summary,
          source: 'ai_search', stage: 'new',
        })
        if (!error) { setImported(prev => new Set([...prev, i])); count++ }
      }
    }
    toast.success(`${count} leads imported to CRM`)
    setImportingAll(false)
  }

  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-muted-foreground'

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <Target className="h-5 w-5 text-amber-500" />
        <h1 className="text-2xl font-semibold">AI Lead Finder</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-8">
        Describe your ideal client. Claude generates targeted leads you can import and outreach immediately.
      </p>

      {/* Search Form */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          <div className="flex flex-col gap-1.5">
            <Label>Industry *</Label>
            <Select value={criteria.industry} onValueChange={v => setCriteria(p => ({ ...p, industry: v }))}>
              <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Location</Label>
            <Input value={criteria.location} onChange={e => setCriteria(p => ({ ...p, location: e.target.value }))} placeholder="US, Germany, UK…" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Company size</Label>
            <Select value={criteria.size} onValueChange={v => setCriteria(p => ({ ...p, size: v }))}>
              <SelectTrigger><SelectValue placeholder="Any size" /></SelectTrigger>
              <SelectContent>{SIZES.map(s => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Video goal</Label>
            <Select value={criteria.videoGoal} onValueChange={v => setCriteria(p => ({ ...p, videoGoal: v }))}>
              <SelectTrigger><SelectValue placeholder="Any goal" /></SelectTrigger>
              <SelectContent>{GOALS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Keywords</Label>
            <Input value={criteria.keywords} onChange={e => setCriteria(p => ({ ...p, keywords: e.target.value }))} placeholder="startup, DTC, B2B…" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Number of leads</Label>
            <Select value={criteria.count} onValueChange={v => setCriteria(p => ({ ...p, count: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{['5','10','15','20'].map(n => <SelectItem key={n} value={n}>{n} leads</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={search} disabled={loading} className="gap-2 bg-amber-500 hover:bg-amber-600 text-black">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Searching…</> : <><Sparkles className="h-4 w-4" />Find leads with AI</>}
        </Button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{results.length} leads found · {imported.size} imported</p>
            <Button variant="outline" size="sm" onClick={importAll}
              disabled={importingAll || imported.size === results.length} className="gap-2">
              {importingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Import all to CRM
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.map((lead, i) => (
              <div key={i} className={`bg-card border rounded-lg p-5 transition-all ${imported.has(i) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border hover:border-amber-500/30'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{lead.company_name}</p>
                      <p className="text-xs text-muted-foreground">{lead.contact_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className={`h-3.5 w-3.5 ${scoreColor(lead.ai_score)}`} />
                      <span className={`text-sm font-mono font-medium ${scoreColor(lead.ai_score)}`}>{lead.ai_score}</span>
                    </div>
                    {imported.has(i) ? (
                      <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 text-xs gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Imported
                      </Badge>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => importLead(lead, i)}>
                        <Plus className="h-3 w-3" /> Import
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                  {lead.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>}
                  {lead.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{lead.website}</span>}
                  {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>}
                </div>
                <div className="flex gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">{lead.industry}</Badge>
                  {lead.company_size && <Badge variant="secondary" className="text-xs">{lead.company_size} employees</Badge>}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{lead.ai_summary}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && results.length === 0 && !loading && (
        <div className="mt-8">
          <Separator className="mb-6" />
          <div className="flex items-center gap-2 mb-4">
            <History className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground/50">Recent searches</p>
          </div>
          <div className="flex flex-col gap-2">
            {searchHistory.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm text-muted-foreground bg-card border border-border rounded px-3 py-2">
                <span className="flex items-center gap-2"><Search className="h-3.5 w-3.5" />{s.label}</span>
                <span className="text-xs">{s.count} leads · {new Date(s.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
