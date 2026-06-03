import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { InboxMessage } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Loader2, Inbox, RefreshCw, Reply, Archive, Mail, Send, PenSquare,
} from 'lucide-react'
import toast from 'react-hot-toast'

function relTime(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const min = Math.round(diff / 60000)
  if (min < 60) return `${min}m`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h`
  return d.toLocaleDateString()
}

export default function InboxAdmin() {
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selected, setSelected] = useState<InboxMessage | null>(null)

  // Compose / reply dialog
  const [composeOpen, setComposeOpen] = useState(false)
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('crm_inbox_messages')
      .select('*')
      .order('received_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(200)
    setMessages((data || []) as InboxMessage[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function openMessage(m: InboxMessage) {
    setSelected(m)
    if (m.status === 'unread') {
      await supabase.from('crm_inbox_messages').update({ status: 'read' }).eq('id', m.id)
      setMessages(prev => prev.map(x => x.id === m.id ? { ...x, status: 'read' } : x))
    }
  }

  async function archive(m: InboxMessage) {
    await supabase.from('crm_inbox_messages').update({ status: 'archived' }).eq('id', m.id)
    setMessages(prev => prev.map(x => x.id === m.id ? { ...x, status: 'archived' } : x))
    if (selected?.id === m.id) setSelected({ ...m, status: 'archived' })
    toast.success('Archived')
  }

  async function syncNow() {
    setSyncing(true)
    const { error } = await supabase.functions.invoke('imap-sync', { body: {} })
    setSyncing(false)
    if (error) { toast.error(`Sync failed: ${error.message}`); return }
    toast.success('Inbox synced')
    load()
  }

  function startCompose() {
    setTo(''); setSubject(''); setBody(''); setComposeOpen(true)
  }
  function startReply(m: InboxMessage) {
    setTo(m.from_email || '')
    setSubject(m.subject ? (m.subject.startsWith('Re:') ? m.subject : `Re: ${m.subject}`) : 'Re:')
    setBody('')
    setComposeOpen(true)
  }

  async function sendEmail() {
    if (!to.trim() || !subject.trim() || !body.trim()) { toast.error('To, subject and body are required'); return }
    setSending(true)
    const { error } = await supabase.functions.invoke('send-email', {
      body: { to: to.trim(), subject: subject.trim(), body },
    })
    if (!error) {
      // Record the outbound message in the thread.
      await supabase.from('crm_inbox_messages').insert([{
        direction: 'outbound', to_email: to.trim(), subject: subject.trim(), body, status: 'read',
      }])
    }
    setSending(false)
    if (error) { toast.error(`Send failed: ${error.message}`); return }
    toast.success('Email sent')
    setComposeOpen(false)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Inbox</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Email synced over IMAP. {messages.length > 0 && `${messages.filter(m => m.status === 'unread').length} unread.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={syncNow} disabled={syncing}>
            {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Sync now
          </Button>
          <Button onClick={startCompose}>
            <PenSquare className="h-4 w-4 mr-2" />Compose
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg">
          <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm mb-1">No messages yet</p>
          <p className="text-muted-foreground/60 text-xs">Configure IMAP in CRM Settings, then “Sync now”.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 border border-border rounded-lg overflow-hidden">
          {/* List */}
          <div className="border-r border-border max-h-[70vh] overflow-y-auto divide-y divide-border">
            {messages.map(m => (
              <button
                key={m.id}
                onClick={() => openMessage(m)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  selected?.id === m.id ? 'bg-accent' : 'hover:bg-accent/40'
                } ${m.status === 'unread' ? 'font-medium' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-foreground truncate">
                    {m.direction === 'outbound' ? `To: ${m.to_email}` : (m.from_email || 'Unknown sender')}
                  </span>
                  <span className="text-[0.65rem] text-muted-foreground font-mono flex-shrink-0">{relTime(m.received_at || m.created_at)}</span>
                </div>
                <div className="text-sm text-muted-foreground truncate">{m.subject || '(no subject)'}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  {m.status === 'unread' && <Badge className="text-[0.6rem]">new</Badge>}
                  {m.direction === 'outbound' && <Badge variant="secondary" className="text-[0.6rem]">sent</Badge>}
                  {m.status === 'archived' && <Badge variant="outline" className="text-[0.6rem]">archived</Badge>}
                  {m.ai_category && <Badge variant="outline" className="text-[0.6rem]">{m.ai_category}</Badge>}
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {selected ? (
              <>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-foreground">{selected.subject || '(no subject)'}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {selected.direction === 'outbound' ? `To ${selected.to_email}` : `From ${selected.from_email || 'unknown'}`}
                      {' · '}{relTime(selected.received_at || selected.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {selected.direction === 'inbound' && (
                      <Button variant="outline" size="sm" onClick={() => startReply(selected)}>
                        <Reply className="h-3.5 w-3.5 mr-1" />Reply
                      </Button>
                    )}
                    {selected.status !== 'archived' && (
                      <Button variant="ghost" size="sm" onClick={() => archive(selected)}>
                        <Archive className="h-3.5 w-3.5 mr-1" />Archive
                      </Button>
                    )}
                  </div>
                </div>
                {selected.ai_suggested_reply && (
                  <div className="mb-4 rounded-md border border-border bg-muted/40 p-3 text-sm">
                    <p className="text-[0.6rem] font-mono uppercase tracking-widest text-muted-foreground mb-1">AI suggested reply</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selected.ai_suggested_reply}</p>
                  </div>
                )}
                <div className="prose-sm whitespace-pre-wrap text-foreground leading-relaxed">{selected.body}</div>
              </>
            ) : (
              <div className="h-full grid place-items-center text-muted-foreground text-sm">
                <div className="flex flex-col items-center gap-2">
                  <Mail className="h-8 w-8" />
                  Select a message
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose / reply */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Compose email</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-to">To</Label>
              <Input id="c-to" type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-subject">Subject</Label>
              <Input id="c-subject" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-body">Message</Label>
              <Textarea id="c-body" rows={8} value={body} onChange={e => setBody(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button onClick={sendEmail} disabled={sending}>
              {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</> : <><Send className="mr-2 h-4 w-4" />Send</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
