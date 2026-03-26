import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart2, TrendingUp, Users, Mail, DollarSign, BrainCircuit, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AIAnalytics() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    qualifiedLeads: 0,
    emailsSent: 0,
    conversionRate: 0
  })
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [aiKey] = useState(() => localStorage.getItem('openai_api_key') || localStorage.getItem('anthropic_api_key') || '')

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const { count: totalLeads } = await supabase.from('crm_leads').select('*', { count: 'exact', head: true })
    const { count: qualifiedLeads } = await supabase.from('crm_leads').select('*', { count: 'exact', head: true }).gt('ai_score', 80)
    const { count: emailsSent } = await supabase.from('crm_outreach_emails').select('*', { count: 'exact', head: true })
    
    setStats({
      totalLeads: totalLeads || 0,
      qualifiedLeads: qualifiedLeads || 0,
      emailsSent: emailsSent || 0,
      conversionRate: totalLeads ? Math.round(((qualifiedLeads || 0) / totalLeads) * 100) : 0
    })
  }

  async function generateAIInsights() {
    if (!aiKey) {
      toast.error('AI API Key not configured')
      return
    }

    setLoading(true)
    try {
      const prompt = `Analyze this CRM data and provide 3 actionable, predictive insights for the sales team:
      Total Leads: ${stats.totalLeads}
      Highly Qualified Leads: ${stats.qualifiedLeads}
      Emails Sent: ${stats.emailsSent}
      Conversion Rate to Qualified: ${stats.conversionRate}%
      
      Return ONLY a JSON array of 3 string insights.`

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

      if (!res.ok) throw new Error('Failed to generate insights')
      const data = await res.json()
      const parsed = JSON.parse(data.choices[0].message.content)
      setInsights(Array.isArray(parsed) ? parsed : Object.values(parsed)[0] as string[])
      toast.success('Insights generated!')
    } catch (err: any) {
      toast.error(err.message)
      // Fallback for demo
      setInsights([
        "Increase email volume: Your qualified lead pool is healthy, but outreach volume is low compared to database size.",
        "Focus on high-scoring leads: You have a strong conversion rate, prioritize the leads scoring 80+ for manual follow-up.",
        "A/B test subject lines: To improve engagement on your next campaign, try testing urgency vs curiosity based subject lines."
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart2 className="h-8 w-8 text-primary" />
            AI Analytics & Forecasting
          </h1>
          <p className="text-muted-foreground mt-2">
            Predictive performance metrics and actionable machine-learning insights.
          </p>
        </div>
        <Button onClick={generateAIInsights} disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <BrainCircuit className="h-4 w-4 mr-2" />}
          Generate AI Insights
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <h3 className="text-2xl font-bold">{stats.totalLeads}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Highly Qualified</p>
                <h3 className="text-2xl font-bold">{stats.qualifiedLeads}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Mail className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outreach Sent</p>
                <h3 className="text-2xl font-bold">{stats.emailsSent}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pipeline Conv.</p>
                <h3 className="text-2xl font-bold">{stats.conversionRate}%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 h-96 flex items-center justify-center border-dashed">
          <p className="text-muted-foreground">Visual Chart Area (Requires Recharts/ChartJS)</p>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              Actionable Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, i) => (
                <div key={i} className="p-4 bg-muted/50 rounded-lg text-sm border">
                  {insight}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Click "Generate AI Insights" to analyze your current pipeline data.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}