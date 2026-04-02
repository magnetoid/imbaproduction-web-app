import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DEFAULT_CRM_RUNTIME_SETTINGS, getCRMRuntimeSettings, type CRMRuntimeSettings } from '@/lib/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import toast from 'react-hot-toast'
import { Settings, Loader2, CheckCircle2, AlertCircle, Mail, Save, Eye, EyeOff, Zap } from 'lucide-react'

export default function AISettings() {
  const [settings, setSettings] = useState<CRMRuntimeSettings>(DEFAULT_CRM_RUNTIME_SETTINGS)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [smtpTestResult, setSmtpTestResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => { void load() }, [])

  async function load() {
    setLoading(true)
    try {
      setSettings(await getCRMRuntimeSettings())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load CRM settings')
    }
    setLoading(false)
  }

  async function saveAll() {
    setSaving(true)
    const { error } = await supabase.from('crm_runtime_settings').upsert({ id: 1, ...settings })
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success('CRM runtime settings saved')
  }

  async function testSmtp() {
    if (!settings.smtp_from_email) {
      toast.error('Set a from email first')
      return
    }
    await saveAll()
    setTestingSmtp(true)
    setSmtpTestResult(null)
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: settings.smtp_from_email,
          to_name: settings.smtp_from_name,
          subject: 'SMTP Test — Imba CRM',
          body: 'If you received this, your SMTP runtime settings are working correctly.',
        },
      })
      if (error) throw error
      setSmtpTestResult({ ok: true, message: 'Test email sent successfully.' })
      toast.success('SMTP test passed')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'SMTP test failed'
      setSmtpTestResult({ ok: false, message })
      toast.error(message)
    }
    setTestingSmtp(false)
  }

  const setField = <K extends keyof CRMRuntimeSettings>(key: K, value: CRMRuntimeSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) return <div className="flex justify-center items-center py-32"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <Settings className="h-5 w-5 text-amber-500" />
        <h1 className="text-2xl font-semibold">CRM Settings</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-10">Centralized runtime settings for AI prompts, SMTP delivery and company context.</p>

      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-amber-500" />
          <h2 className="font-medium">AI Runtime</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5">AI is now proxied server-side through Supabase Edge Functions. No browser API keys are used in CRM.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Default model</Label>
            <Input value={settings.anthropic_model} onChange={e => setField('anthropic_model', e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Temperature</Label>
            <Input type="number" min="0" max="1" step="0.1" value={settings.anthropic_temperature} onChange={e => setField('anthropic_temperature', Number(e.target.value) || 0)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Default outreach tone</Label>
            <Select value={settings.ai_outreach_tone} onValueChange={v => setField('ai_outreach_tone', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['professional', 'casual', 'direct', 'consultative', 'enthusiastic'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Daily outreach limit</Label>
            <Input type="number" min="1" value={settings.outreach_daily_limit} onChange={e => setField('outreach_daily_limit', Number(e.target.value) || 1)} />
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-5">
          <div className="flex items-center gap-3">
            <Switch checked={settings.ai_auto_enrich} onCheckedChange={v => setField('ai_auto_enrich', v)} />
            <Label className="font-normal">Auto-enrich new leads</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={settings.ai_inbox_auto_categorize} onCheckedChange={v => setField('ai_inbox_auto_categorize', v)} />
            <Label className="font-normal">Auto-analyze inbox replies on open</Label>
          </div>
        </div>
      </section>

      <Separator className="mb-10" />

      <section className="mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-4 w-4 text-amber-500" />
          <h2 className="font-medium">SMTP Configuration</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5">Stored in the database and used only by the send-email Edge Function.</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5"><Label>SMTP Host</Label><Input value={settings.smtp_host} onChange={e => setField('smtp_host', e.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><Label>Port</Label><Input value={settings.smtp_port} onChange={e => setField('smtp_port', e.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><Label>Username</Label><Input value={settings.smtp_username} onChange={e => setField('smtp_username', e.target.value)} /></div>
          <div className="flex flex-col gap-1.5">
            <Label>Password / App password</Label>
            <div className="relative">
              <Input type={showPass ? 'text' : 'password'} value={settings.smtp_password} onChange={e => setField('smtp_password', e.target.value)} className="pr-10" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPass(p => !p)}>
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5"><Label>From name</Label><Input value={settings.smtp_from_name} onChange={e => setField('smtp_from_name', e.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><Label>From email</Label><Input value={settings.smtp_from_email} onChange={e => setField('smtp_from_email', e.target.value)} /></div>
        </div>
        <div className="flex items-center gap-2 mb-5">
          <Switch checked={settings.smtp_secure} onCheckedChange={v => setField('smtp_secure', v)} />
          <Label className="font-normal">Use SSL/TLS (port 465)</Label>
        </div>
        {smtpTestResult && (
          <div className={`flex items-center gap-2 text-sm p-3 rounded mb-4 ${smtpTestResult.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {smtpTestResult.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {smtpTestResult.message}
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={saveAll} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save settings</Button>
          <Button variant="outline" onClick={testSmtp} disabled={testingSmtp || !settings.smtp_host || !settings.smtp_username} className="gap-2">{testingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} Test SMTP</Button>
        </div>
      </section>

      <Separator className="mb-10" />

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="h-4 w-4 text-amber-500" />
          <h2 className="font-medium">Company Profile</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-5">Injected into CRM prompts for lead search, outreach and proposals.</p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5"><Label>Company name</Label><Input value={settings.company_name} onChange={e => setField('company_name', e.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><Label>Description</Label><Input value={settings.company_description} onChange={e => setField('company_description', e.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><Label>Unique selling point</Label><Input value={settings.usp} onChange={e => setField('usp', e.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><Label>Meeting scheduling URL</Label><Input value={settings.scheduling_url} onChange={e => setField('scheduling_url', e.target.value)} placeholder="https://cal.com/your-name" /></div>
        </div>
      </section>
    </div>
  )
}
