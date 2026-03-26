import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Settings, Key, Bell, Shield, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AISettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Record<string, any>>({})
  
  // Local storage keys
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')

  useEffect(() => {
    loadSettings()
    setOpenaiKey(localStorage.getItem('openai_api_key') || '')
    setAnthropicKey(localStorage.getItem('anthropic_api_key') || '')
  }, [])

  async function loadSettings() {
    const { data } = await supabase.from('crm_ai_settings').select('*')
    if (data) {
      const parsed = data.reduce((acc, row) => {
        acc[row.key] = row.value
        return acc
      }, {} as Record<string, any>)
      setSettings(parsed)
    }
    setLoading(false)
  }

  async function handleSaveSettings() {
    setSaving(true)
    try {
      // Save API keys locally for frontend AI features
      if (openaiKey) localStorage.setItem('openai_api_key', openaiKey)
      if (anthropicKey) localStorage.setItem('anthropic_api_key', anthropicKey)

      // Save config to DB
      const updates = Object.entries(settings).map(([key, value]) => ({ key, value }))
      if (updates.length > 0) {
        const { error } = await supabase.from('crm_ai_settings').upsert(updates)
        if (error) throw error
      }
      
      toast.success('AI Settings saved successfully')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            AI Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your AI models, automation workflows, and global system parameters.
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" /> API Integrations
            </CardTitle>
            <CardDescription>Configure the LLM providers used for CRM intelligence.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">OpenAI API Key (GPT-4)</label>
              <Input 
                type="password" 
                value={openaiKey} 
                onChange={e => setOpenaiKey(e.target.value)} 
                placeholder="sk-..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Anthropic API Key (Claude 3)</label>
              <Input 
                type="password" 
                value={anthropicKey} 
                onChange={e => setAnthropicKey(e.target.value)} 
                placeholder="sk-ant-..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Automations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Automation Rules
            </CardTitle>
            <CardDescription>Let AI handle repetitive tasks automatically in the background.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-enrich new leads</p>
                <p className="text-sm text-muted-foreground">AI will automatically scrape and summarize company data when a new lead is added.</p>
              </div>
              <Switch 
                checked={settings.ai_auto_enrich === true}
                onCheckedChange={c => setSettings(prev => ({...prev, ai_auto_enrich: c}))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Smart Inbox Categorization</p>
                <p className="text-sm text-muted-foreground">Automatically label incoming emails and analyze prospect sentiment.</p>
              </div>
              <Switch 
                checked={settings.ai_inbox_auto_categorize === true}
                onCheckedChange={c => setSettings(prev => ({...prev, ai_inbox_auto_categorize: c}))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Outreach Preferences
            </CardTitle>
            <CardDescription>Set global guardrails for AI-generated communications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Tone of Voice</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={settings.ai_outreach_tone || 'professional'}
                onChange={e => setSettings(prev => ({...prev, ai_outreach_tone: e.target.value}))}
              >
                <option value="professional">Professional & Direct</option>
                <option value="casual">Casual & Friendly</option>
                <option value="urgent">Urgent & Action-Oriented</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}