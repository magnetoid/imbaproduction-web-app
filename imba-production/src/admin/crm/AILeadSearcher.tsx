import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Bot, Plus, Building2, Globe, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

interface LeadPreview {
  company_name: string
  contact_name: string
  email: string
  industry: string
  ai_score: number
  ai_summary: string
}

export default function AILeadSearcher() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<LeadPreview[]>([])
  const [aiKey] = useState(() => localStorage.getItem('openai_api_key') || localStorage.getItem('anthropic_api_key') || '')

  async function handleSearch() {
    if (!query) return
    if (!aiKey) {
      toast.error('Please configure your AI API key in Settings first')
      return
    }

    setLoading(true)
    try {
      // In a real production app, this would hit an API endpoint that uses 
      // tools like Apollo, Hunter.io, or SerpApi combined with LLM processing.
      // For this demo, we simulate the LLM analyzing the query and generating synthetic leads based on the target criteria.
      
      const prompt = `You are an AI Lead Generation tool. The user is searching for: "${query}". 
      Generate 3 highly realistic potential B2B leads that match this description.
      Return ONLY valid JSON matching this exact array structure:
      [{
        "company_name": "String",
        "contact_name": "String",
        "email": "String",
        "industry": "String",
        "ai_score": Number (80-99),
        "ai_summary": "1 sentence explaining why this is a good lead based on the query"
      }]`

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

      if (!res.ok) {
        throw new Error('AI request failed. Check API key.')
      }

      const data = await res.json()
      const parsed = JSON.parse(data.choices[0].message.content)
      setResults(Array.isArray(parsed) ? parsed : parsed.leads || [])
      toast.success('Leads generated successfully!')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to search leads')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveLead(lead: LeadPreview) {
    try {
      const { error } = await supabase.from('crm_leads').insert([{
        company_name: lead.company_name,
        contact_name: lead.contact_name,
        email: lead.email,
        industry: lead.industry,
        ai_score: lead.ai_score,
        ai_summary: lead.ai_summary,
        source: 'ai_searcher'
      }])

      if (error) throw error
      toast.success(`${lead.company_name} saved to CRM!`)
      setResults(results.filter(r => r.email !== lead.email))
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          AI Lead Searcher
        </h1>
        <p className="text-muted-foreground mt-2">
          Describe your ideal customer profile and let AI find and qualify leads for you.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Target Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input 
                placeholder="e.g. 'Marketing directors at mid-sized SaaS companies in Europe'" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !query}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Find Leads
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">AI Suggested Leads</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((lead, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{lead.company_name}</CardTitle>
                    <Badge variant={lead.ai_score >= 90 ? 'default' : 'secondary'}>
                      Score: {lead.ai_score}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Building2 className="h-3 w-3" /> {lead.industry}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="font-medium">{lead.contact_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{lead.email}</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-md text-sm italic">
                    "{lead.ai_summary}"
                  </div>

                  <Button 
                    className="w-full mt-auto" 
                    variant="outline"
                    onClick={() => handleSaveLead(lead)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Save to CRM
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}