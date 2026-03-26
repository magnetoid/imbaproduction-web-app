import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send, Wand2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AIOutreach() {
  const [leads, setLeads] = useState<any[]>([])
  const [selectedLead, setSelectedLead] = useState<string>('')
  const [objective, setObjective] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState({ subject: '', body: '' })
  const [aiKey] = useState(() => localStorage.getItem('openai_api_key') || localStorage.getItem('anthropic_api_key') || '')

  useEffect(() => {
    loadLeads()
  }, [])

  async function loadLeads() {
    const { data } = await supabase.from('crm_leads').select('*').order('created_at', { ascending: false })
    if (data) setLeads(data)
  }

  async function handleGenerate() {
    if (!selectedLead || !objective) {
      toast.error('Please select a lead and enter an objective')
      return
    }
    if (!aiKey) {
      toast.error('AI API Key not configured')
      return
    }

    setLoading(true)
    try {
      const lead = leads.find(l => l.id === selectedLead)
      const prompt = `You are an expert sales copywriter. Generate a highly personalized, concise cold email for:
      Company: ${lead.company_name}
      Contact: ${lead.contact_name || 'The team'}
      Industry: ${lead.industry}
      AI Summary Context: ${lead.ai_summary}
      
      Objective: ${objective}
      
      Return ONLY valid JSON: { "subject": "Catchy subject", "body": "Email body (use plain text with newlines, no HTML)" }`

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      })

      if (!res.ok) throw new Error('Generation failed')
      
      const data = await res.json()
      const parsed = JSON.parse(data.choices[0].message.content)
      setGeneratedEmail(parsed)
      toast.success('Email generated!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveDraft() {
    if (!generatedEmail.subject) return
    try {
      const { error } = await supabase.from('crm_outreach_emails').insert([{
        lead_id: selectedLead,
        subject: generatedEmail.subject,
        body: generatedEmail.body,
        ai_generated: true,
        ai_prompt_used: objective
      }])
      if (error) throw error
      toast.success('Saved to drafts')
      setGeneratedEmail({ subject: '', body: '' })
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Wand2 className="h-8 w-8 text-primary" />
          AI Outreach Generator
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate hyper-personalized cold emails based on lead data and AI insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Campaign Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Lead</label>
              <Select value={selectedLead} onValueChange={setSelectedLead}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a lead..." />
                </SelectTrigger>
                <SelectContent>
                  {leads.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.company_name} ({l.contact_name || 'No Name'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Objective</label>
              <Textarea 
                placeholder="e.g. Introduce our new AI video production service and ask for a 10 min call next week."
                value={objective}
                onChange={e => setObjective(e.target.value)}
                rows={5}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleGenerate}
              disabled={loading || !selectedLead || !objective}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              Generate Draft
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Preview & Edit</span>
              {generatedEmail.subject && (
                <Button size="sm" onClick={handleSaveDraft}>
                  <Send className="h-4 w-4 mr-2" /> Save to Drafts
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedEmail.subject ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Subject Line</label>
                  <Input 
                    value={generatedEmail.subject}
                    onChange={e => setGeneratedEmail(prev => ({...prev, subject: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email Body</label>
                  <Textarea 
                    value={generatedEmail.body}
                    onChange={e => setGeneratedEmail(prev => ({...prev, body: e.target.value}))}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                <Mail className="h-12 w-12 mb-4 opacity-50" />
                <p>Configure settings and click generate to create an email.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}