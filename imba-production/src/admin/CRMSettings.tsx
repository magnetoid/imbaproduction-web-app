import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  DEFAULT_CRM_RUNTIME_SETTINGS,
  getCRMRuntimeSettings,
  type AIProvider,
  type CRMRuntimeSettings,
} from '@/lib/ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'ollama', label: 'Ollama (self-hosted)' },
]

const toLines = (arr: string[]) => arr.join('\n')
const fromLines = (text: string) =>
  text.split('\n').map(l => l.trim()).filter(Boolean)

export default function CRMSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [s, setS] = useState<CRMRuntimeSettings>(DEFAULT_CRM_RUNTIME_SETTINGS)

  useEffect(() => {
    getCRMRuntimeSettings()
      .then(setS)
      .catch(err => toast.error(`Load failed: ${err.message ?? err}`))
      .finally(() => setLoading(false))
  }, [])

  function update<K extends keyof CRMRuntimeSettings>(key: K, value: CRMRuntimeSettings[K]) {
    setS(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('crm_runtime_settings')
      .upsert({ id: 1, ...s, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    setSaving(false)
    if (error) {
      toast.error(`Save failed: ${error.message}`)
    } else {
      toast.success('CRM settings saved')
    }
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )

  const SaveButton = (
    <Button onClick={handleSave} disabled={saving}>
      {saving
        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
        : <><Save className="mr-2 h-4 w-4" />Save all</>}
    </Button>
  )

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">AI CRM runtime</p>
          <h1 className="text-3xl font-semibold text-foreground">CRM Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Provider keys, email delivery, AI behaviour and company context — the single config row that powers every CRM/AI feature.
          </p>
        </div>
        {SaveButton}
      </div>

      <div className="flex flex-col gap-6">
        {/* Active provider */}
        <Card>
          <CardHeader><CardTitle className="text-base">Active AI engine</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Provider</Label>
              <Select
                value={s.active_ai_provider}
                onValueChange={v => update('active_ai_provider', v as AIProvider)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="active-model">Active model</Label>
              <Input
                id="active-model"
                value={s.active_ai_model}
                onChange={e => update('active_ai_model', e.target.value)}
                placeholder="claude-sonnet-4-20250514"
              />
            </div>
          </CardContent>
        </Card>

        {/* Provider credentials */}
        <Card>
          <CardHeader><CardTitle className="text-base">Provider credentials & models</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ProviderFields
              title="Anthropic"
              apiKey={s.anthropic_api_key}
              onApiKey={v => update('anthropic_api_key', v)}
              model={s.anthropic_model}
              onModel={v => update('anthropic_model', v)}
              models={s.anthropic_models}
              onModels={v => update('anthropic_models', v)}
            >
              <div className="flex flex-col gap-1.5">
                <Label>Temperature</Label>
                <Input
                  type="number" step="0.1" min="0" max="2"
                  value={s.anthropic_temperature}
                  onChange={e => update('anthropic_temperature', Number(e.target.value))}
                />
              </div>
            </ProviderFields>

            <ProviderFields
              title="OpenAI"
              apiKey={s.openai_api_key}
              onApiKey={v => update('openai_api_key', v)}
              model={s.openai_model}
              onModel={v => update('openai_model', v)}
              models={s.openai_models}
              onModels={v => update('openai_models', v)}
            />

            <ProviderFields
              title="Google Gemini"
              apiKey={s.gemini_api_key}
              onApiKey={v => update('gemini_api_key', v)}
              model={s.gemini_model}
              onModel={v => update('gemini_model', v)}
              models={s.gemini_models}
              onModels={v => update('gemini_models', v)}
            />

            <ProviderFields
              title="Perplexity"
              apiKey={s.perplexity_api_key}
              onApiKey={v => update('perplexity_api_key', v)}
              model={s.perplexity_model}
              onModel={v => update('perplexity_model', v)}
              models={s.perplexity_models}
              onModels={v => update('perplexity_models', v)}
            />

            {/* Ollama (no API key — base URL instead) */}
            <div className="flex flex-col gap-3 pt-2 border-t border-border">
              <p className="text-sm font-medium text-foreground">Ollama (self-hosted)</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Base URL</Label>
                  <Input
                    value={s.ollama_base_url}
                    onChange={e => update('ollama_base_url', e.target.value)}
                    placeholder="http://host.docker.internal:11434"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Default model</Label>
                  <Input
                    value={s.ollama_model}
                    onChange={e => update('ollama_model', e.target.value)}
                    placeholder="llama3.1"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Available models (one per line)</Label>
                <Textarea
                  rows={2}
                  value={toLines(s.ollama_models)}
                  onChange={e => update('ollama_models', fromLines(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email / SMTP */}
        <Card>
          <CardHeader><CardTitle className="text-base">Email delivery (SMTP)</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>SMTP host</Label>
              <Input value={s.smtp_host} onChange={e => update('smtp_host', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>SMTP port</Label>
              <Input value={s.smtp_port} onChange={e => update('smtp_port', e.target.value)} placeholder="587" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Username</Label>
              <Input value={s.smtp_username} onChange={e => update('smtp_username', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Password</Label>
              <Input type="password" value={s.smtp_password} onChange={e => update('smtp_password', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>From name</Label>
              <Input value={s.smtp_from_name} onChange={e => update('smtp_from_name', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>From email</Label>
              <Input type="email" value={s.smtp_from_email} onChange={e => update('smtp_from_email', e.target.value)} />
            </div>
            <label className="flex items-center gap-3 col-span-2">
              <Switch checked={s.smtp_secure} onCheckedChange={v => update('smtp_secure', v)} />
              <span className="text-sm text-foreground">Use TLS/SSL (secure)</span>
            </label>
          </CardContent>
        </Card>

        {/* Email inbox (IMAP) */}
        <Card>
          <CardHeader><CardTitle className="text-base">Email inbox (IMAP)</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>IMAP host</Label>
              <Input value={s.imap_host} onChange={e => update('imap_host', e.target.value)} placeholder="imap.gmail.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>IMAP port</Label>
              <Input value={s.imap_port} onChange={e => update('imap_port', e.target.value)} placeholder="993" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Username</Label>
              <Input value={s.imap_username} onChange={e => update('imap_username', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Password</Label>
              <Input type="password" value={s.imap_password} onChange={e => update('imap_password', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Mailbox</Label>
              <Input value={s.imap_mailbox} onChange={e => update('imap_mailbox', e.target.value)} placeholder="INBOX" />
            </div>
            <label className="flex items-center gap-3 col-span-2">
              <Switch checked={s.imap_secure} onCheckedChange={v => update('imap_secure', v)} />
              <span className="text-sm text-foreground">Use TLS/SSL (secure)</span>
            </label>
            <p className="col-span-2 text-xs text-muted-foreground/70">
              Incoming mail is synced into the Inbox by the <span className="font-mono">imap-sync</span> edge function. Credentials are stored server-side and never sent to the browser.
            </p>
          </CardContent>
        </Card>

        {/* AI behaviour */}
        <Card>
          <CardHeader><CardTitle className="text-base">AI behaviour</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Outreach tone</Label>
                <Input value={s.ai_outreach_tone} onChange={e => update('ai_outreach_tone', e.target.value)} placeholder="professional" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Outreach daily limit</Label>
                <Input
                  type="number" min="0"
                  value={s.outreach_daily_limit}
                  onChange={e => update('outreach_daily_limit', Number(e.target.value))}
                />
              </div>
            </div>
            <label className="flex items-center gap-3">
              <Switch checked={s.ai_auto_enrich} onCheckedChange={v => update('ai_auto_enrich', v)} />
              <span className="text-sm text-foreground">Auto-enrich new leads</span>
            </label>
            <label className="flex items-center gap-3">
              <Switch checked={s.ai_inbox_auto_categorize} onCheckedChange={v => update('ai_inbox_auto_categorize', v)} />
              <span className="text-sm text-foreground">Auto-categorize inbox messages</span>
            </label>
            <div className="flex flex-col gap-1.5">
              <Label>Lead sources enabled (one per line)</Label>
              <Textarea
                rows={3}
                value={toLines(s.lead_sources_enabled)}
                onChange={e => update('lead_sources_enabled', fromLines(e.target.value))}
                placeholder={'manual\nquote_form\nai_search'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Company context */}
        <Card>
          <CardHeader><CardTitle className="text-base">Company context</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Company name</Label>
                <Input value={s.company_name} onChange={e => update('company_name', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Scheduling URL</Label>
                <Input value={s.scheduling_url} onChange={e => update('scheduling_url', e.target.value)} placeholder="https://cal.com/…" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Textarea rows={2} value={s.company_description} onChange={e => update('company_description', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Unique selling proposition (USP)</Label>
              <Textarea rows={2} value={s.usp} onChange={e => update('usp', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">{SaveButton}</div>
      </div>
    </div>
  )
}

function ProviderFields({
  title, apiKey, onApiKey, model, onModel, models, onModels, children,
}: {
  title: string
  apiKey: string
  onApiKey: (v: string) => void
  model: string
  onModel: (v: string) => void
  models: string[]
  onModels: (v: string[]) => void
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 pb-2">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>API key</Label>
          <Input type="password" value={apiKey} onChange={e => onApiKey(e.target.value)} placeholder="sk-…" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Default model</Label>
          <Input value={model} onChange={e => onModel(e.target.value)} />
        </div>
        {children}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Available models (one per line)</Label>
        <Textarea
          rows={2}
          value={toLines(models)}
          onChange={e => onModels(fromLines(e.target.value))}
        />
      </div>
    </div>
  )
}
