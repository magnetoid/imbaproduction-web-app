import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Inbox as InboxIcon, Search, Sparkles, MessageSquareReply, Archive, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react'

export default function AIInbox() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    // In a real app, this would sync via Webhooks/API from Gmail/Outlook
    // For this demo we'll fetch from our new DB table
    const { data } = await supabase
      .from('crm_inbox_messages')
      .select('*, crm_leads(company_name, contact_name)')
      .order('received_at', { ascending: false })
    
    if (data) setMessages(data)
    setLoading(false)
  }

  const getSentimentColor = (sentiment: string) => {
    switch(sentiment) {
      case 'positive': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'negative': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'question': return <HelpCircle className="h-4 w-4" />
      case 'meeting_request': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'objection': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default: return <MessageSquareReply className="h-4 w-4" />
    }
  }

  const filtered = messages.filter(m => 
    m.subject?.toLowerCase().includes(search.toLowerCase()) || 
    m.from_email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <InboxIcon className="h-8 w-8 text-primary" />
            AI-Enhanced Inbox
          </h1>
          <p className="text-muted-foreground mt-2">
            Smart categorization, sentiment analysis, and auto-drafted replies.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-lg border">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium">Auto-categorization Active</span>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search emails..." 
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline">Unread Only</Button>
        <Button variant="outline">Action Required</Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading inbox...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-card text-muted-foreground">
            No messages found. 
            <p className="text-sm mt-2">(In a real environment, emails would sync here via your email provider API)</p>
          </div>
        ) : (
          filtered.map(msg => (
            <Card key={msg.id} className={`hover:border-primary/50 transition-colors ${msg.status === 'unread' ? 'border-l-4 border-l-primary' : ''}`}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Left Column: Metadata & AI Tags */}
                  <div className="w-48 shrink-0 space-y-3 border-r pr-6">
                    <div>
                      <p className="font-semibold truncate">{msg.from_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(msg.received_at).toLocaleDateString()}
                      </p>
                    </div>
                    {msg.crm_leads && (
                      <Badge variant="outline" className="w-full justify-center">
                        Lead: {msg.crm_leads.company_name}
                      </Badge>
                    )}
                    {msg.ai_sentiment && (
                      <Badge variant="outline" className={`w-full justify-center ${getSentimentColor(msg.ai_sentiment)}`}>
                        {msg.ai_sentiment.toUpperCase()}
                      </Badge>
                    )}
                    {msg.ai_category && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground capitalize">
                        {getCategoryIcon(msg.ai_category)}
                        {msg.ai_category.replace('_', ' ')}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Content */}
                  <div className="flex-1 space-y-4">
                    <h3 className="text-lg font-semibold">{msg.subject}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {msg.body}
                    </p>
                    
                    {msg.ai_suggested_reply && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
                          <Sparkles className="h-4 w-4" /> AI Suggested Reply
                        </div>
                        <p className="text-sm text-muted-foreground italic">"{msg.ai_suggested_reply}"</p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm">Use Suggestion</Button>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex flex-col gap-2">
                    <Button variant="ghost" size="icon" title="Reply">
                      <MessageSquareReply className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Archive">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}