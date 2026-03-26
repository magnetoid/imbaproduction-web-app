import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import toast from 'react-hot-toast'
import {
  Settings, Loader2, CheckCircle2, AlertCircle, Mail, Key,
  Save, Eye, EyeOff, Zap,
} from 'lucide-react'

interface SmtpConfig {
  host: string; port: string; secure: boolean
  username: string; password: string; from_name: string; from_email: string
}

const EMPTY_SMTP: SmtpConfig = { host: '', port: '587', secure: false, username: '', password: '', from_name: 'Imba Production', from_email: '' }

export default function AISettings() {
  const [smtp, setSmtp] = useState<SmtpConfig>(EMPTY_SMTP)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('anthropic_api_key') || '')
  const [showPass, setShowPass] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingSmtp, setSavingSmtp] = useState(false)
  const [savingAI, setSavingAI] = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [smtpTestResult, setSmtpTestResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [aiTone, setAiTone] = useState('professional')
  const [autoEnrich, setAutoEnrich] = useState(true)
  const [autoCategorize, setAutoCategorize] = useState(true)
  const [companyName, setCompanyName] = useState('Imba Production')
  const [companyDesc, setCompanyDesc] = useState('Cinematic video production powered by AI strategy.')
  const [usp, setUsp] = useState('We combine human creativity with AI to produce cinematic-quality videos at scale.')
  const [schedulingUrl, setSchedulingUrl] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('crm_ai_settings').select('key, value')
    if (data) {
      const m = Object.fromEntries(data.map(r => [r.key, r.value]))
      if (m.smtp_config) setSmtp(m.smtp_config as SmtpConfig)
      if (m.ai_outreach_tone) setAiTone(m.ai_outreach_tone as string)
      if (m.ai_auto_enrich !== undefined) setAutoEnrich(Boolean(m.ai_auto_enrich))
      if (m.ai_inbox_auto_categorize !== undefined) setAutoCategorize(Boolean(m.ai_inbox_auto_categorize))
      if (m.company_profile) {
        const cp = m.company_profile as { company_name?: string; company_description?: string; usp?: string; scheduling_url?: string }
        if (cp.company_name) setCompanyName(cp.company_name)
        if (cp.company_description) setCompanyDesc(cp.company_description)
        if (cp.usp) setUsp(cp.usp)
        if (cp.scheduling_url) setSchedulingUrl(cp.scheduling_url)
      }
    }
    setLoading(false)
  }

  async function saveSmtp() {
    setSavingSmtp(true)
    const { error } = await supabase.from('crm_ai_settings').upsert({ key: 'smtp_config', value: smtp, description: 'SMTP configuration' })
    setSavingSmtp(false)
    if (error) { toast.error(error.message); return }
    toast.success('SMTP saved')
  }

  async function testSmtp() {
    setTestingSmtp(true)
    setSmtpTestResult(null)
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { to: smtp.from_email, to_name: smtp.from_name, subject: 'SMTP Test — Imba CRM', body: 'If you received this, your SMTP is configured correctly.', smtp },
      })
      if (error) throw error
      setSmtpTestResult({ ok: true, message: 'Test email sent successfully!' })
      toast.success('SMTP test passed!')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Edge Function not deployed yet'
      setSmtpTestResult({ ok: false, message: msg })
      toast.error('SMTP test failed — see details below.')
    }
    setTestingSmtp(false)
  }

  async function saveAI() {
    setSavingAI(true)
    await Promise.all([
      supabase.from('crm_ai_settings').upsert({ key: 'ai_outreach_tone', value: aiTone }),
      supabase.from('crm_ai_settings').upsert({ key: 'ai_auto_enrich', value: autoEnrich }),
      supabase.from('crm_ai_settings').upsert({ key: 'ai_inbox_auto_categorize', value: autoCategorize }),
      supabase.from('crm_ai_settings').upsert({ key: 'company_profile', value: { company_name: companyName, company_description: companyDesc, usp, scheduling_url: schedulingUrl } }),
    ])
    setSavingAI(false)
    toast.success('AI settings saved')
  }

  function saveApiKey() {
    if (!apiKey) { toast.error('Enter your API key first.'); return }
    localStorage.setItem('anthropic_api_key', apiKey)
    toast.success('API key saved to browser storage')
  }

  const sf = (k: keyof SmtpConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSmtp(p => ({ ...p, [k]: e.target.value }))

  if (loading) return <div className="flex justify-center items-center py-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <Settings className="h-5 w-5 text-amber-500" />
        <h1 className="text-2xl font-semibold">CRM Settings</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-10">Configure SMTP for email sending, AI behaviour, and company profile used in all prompts.</p>

      {/* API Key */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Key className="h-4 w-4 text-amber-500" />
          <h2 className="font-medium">Anthropic API Key</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Required for AI lead generation, email writing, inbox analysis. Stored in your browser only — never sent to our servers.</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input type={showApiKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-api03-…" className="pr-10 font-mono text-sm" />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowApiKey(p => !p)}>
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button onClick={saveApiKey} variant="outline">Save key</Button>
        </div>
        {apiKey && <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> API key configured</p>}
      </section>

      <Separator className="mb-10" />

      {/* SMTP */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-4 w-4 text-amber-500" />
          <h2 className="font-medium">SMTP Configuration</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          Used to send outreach emails directly from the CRM. Requires the
          <code className="bg-muted px-1 rounded text-[11px] mx-1">send-email</code>
          Supabase Edge Function. <span className="text-amber-500">Deploy guide below ↓</span>
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <Label>SMTP Host</Label>
            <Input value={smtp.host} onChange={sf('host')} placeholder="smtp.gmail.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Port</Label>
            <Input value={smtp.port} onChange={sf('port')} placeholder="587" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Username</Label>
            <Input value={smtp.username} onChange={sf('username')} placeholder="you@domain.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Password / App password</Label>
            <div className="relative">
              <Input type={showPass ? 'text' : 'password'} value={smtp.password} onChange={sf('password')} placeholder="••••••••" className="pr-10" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPass(p => !p)}>
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>From name</Label>
            <Input value={smtp.from_name} onChange={sf('from_name')} placeholder="Imba Production" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>From email</Label>
            <Input value={smtp.from_email} onChange={sf('from_email')} placeholder="hello@imbaproduction.com" />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <Switch id="smtp-secure" checked={smtp.secure} onCheckedChange={v => setSmtp(p => ({ ...p, secure: v }))} />
          <Label htmlFor="smtp-secure" className="font-normal">Use SSL/TLS (port 465)</Label>
        </div>

        {smtpTestResult && (
          <div className={`flex items-center gap-2 text-sm p-3 rounded mb-4 ${smtpTestResult.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {smtpTestResult.ok ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
            {smtpTestResult.message}
          </div>
        )}

        <div className="flex gap-2 mb-8">
          <Button onClick={saveSmtp} disabled={savingSmtp} className="gap-2">
            {savingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save SMTP
          </Button>
          <Button variant="outline" onClick={testSmtp} disabled={testingSmtp || !smtp.host || !smtp.username} className="gap-2">
            {testingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} Test connection
          </Button>
        </div>

        {/* Deploy guide */}
        <div className="bg-muted/20 border border-border rounded-lg p-5">
          <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground/40 mb-3">Edge Function deploy guide</p>
          <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside leading-relaxed">
            <li>Install CLI: <code className="bg-muted px-1 rounded">npm i -g supabase</code></li>
            <li>Link project: <code className="bg-muted px-1 rounded">supabase link --project-ref YOUR_REF</code></li>
            <li>Edge Function file: <code className="bg-muted px-1 rounded">supabase/functions/send-email/index.ts</code> (already in repo)</li>
            <li>Deploy: <code className="bg-muted px-1 rounded">supabase functions deploy send-email --no-verify-jwt</code></li>
            <li>Test with the "Test connection" button above</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-3">
            Without the Edge Function, clicking Send will open your mail client as a fallback.
          </p>
        </div>
      </section>

      <Separator className="mb-10" />

      {/* AI Settings */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-amber-500" />
          <h2 className="font-medium">AI Behaviour</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5">Control how Claude generates content and processes data.</p>

        <div className="flex flex-col gap-5 mb-8">
          <div className="flex flex-col gap-1.5">
            <Label>Default email tone</Label>
            <Select value={aiTone} onValueChange={setAiTone}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['professional', 'casual', 'direct', 'consultative', 'enthusiastic'].map(t => (
                  <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="auto-enrich" checked={autoEnrich} onCheckedChange={setAutoEnrich} />
            <div>
              <Label htmlFor="auto-enrich" className="font-normal">Auto-enrich new leads</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Use AI to fill in missing data when leads are imported</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="auto-cat" checked={autoCategorize} onCheckedChange={setAutoCategorize} />
            <div>
              <Label htmlFor="auto-cat" className="font-normal">Auto-analyze inbox messages</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Automatically analyze sentiment & category when opening a message</p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="mb-10" />

      {/* Company Profile */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="h-4 w-4 text-amber-500" />
          <h2 className="font-medium">Company Profile</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5">Injected into every AI prompt to personalize generated content and lead searches.</p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Company name</Label>
            <Input value={companyName} onChange={e => setCompanyName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Description</Label>
            <Input value={companyDesc} onChange={e => setCompanyDesc(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Unique selling point</Label>
            <Input value={usp} onChange={e => setUsp(e.target.value)} />
          </div>
          <Separator />
          <div className="flex flex-col gap-1.5">
            <Label>Meeting scheduling URL</Label>
            <Input value={schedulingUrl} onChange={e => setSchedulingUrl(e.target.value)} placeholder="https://cal.com/your-name or https://calendly.com/your-name" />
            <p className="text-xs text-muted-foreground">
              Paste your Cal.com or Calendly link. AI outreach emails will auto-append a booking CTA with this link.
            </p>
          </div>
        </div>
      </section>

      <Button onClick={saveAI} disabled={savingAI} className="gap-2">
        {savingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save AI settings
      </Button>
    </div>
  )
}
