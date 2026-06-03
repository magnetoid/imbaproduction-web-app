import { useRef, useState, useEffect } from 'react'
import type { Data } from '@puckeditor/core'
import { callAIJSON } from '@/lib/ai'
import { applyOperations, buildPrompt, type AIResponse } from './page-builder/ai-operations'
import { Button } from '@/components/ui/button'
import { Bot, X, Send, Loader2, Undo2, Sparkles } from 'lucide-react'

interface Msg { role: 'user' | 'assistant'; text: string }

interface Props {
  open: boolean
  onClose: () => void
  data: Data
  onApply: (data: Data) => void
}

const SUGGESTIONS = [
  'Add a hero with the headline "Cinematic video, on demand" and a "Book a call" button',
  'Add a section heading "What we do" followed by a short paragraph',
  'Add an image block and a divider under it',
]

function parseResponse(raw: unknown): AIResponse {
  let obj: unknown = raw
  if (typeof raw === 'string') {
    const cleaned = raw.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim()
    obj = JSON.parse(cleaned)
  }
  const r = (obj ?? {}) as Partial<AIResponse>
  return {
    reply: typeof r.reply === 'string' ? r.reply : 'Done.',
    operations: Array.isArray(r.operations) ? r.operations : [],
  }
}

export default function AIPageAssistant({ open, onClose, data, onApply }: Props) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [undoData, setUndoData] = useState<Data | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages, loading])

  async function send(text: string) {
    const instruction = text.trim()
    if (!instruction || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: instruction }])
    setLoading(true)

    const history = messages.slice(-6).map(m => `${m.role === 'user' ? 'USER' : 'ASSISTANT'}: ${m.text}`).join('\n')
    const snapshot = data

    try {
      const raw = await callAIJSON<unknown>(buildPrompt(data, instruction, history))
      const parsed = parseResponse(raw)
      const { data: next, applied, skipped } = applyOperations(data, parsed.operations)
      if (applied.length) { onApply(next); setUndoData(snapshot) }
      const detail = [
        applied.length ? `✓ ${applied.join(', ')}` : '',
        skipped.length ? `⚠ ${skipped.join(', ')}` : '',
      ].filter(Boolean).join('  ·  ')
      setMessages(prev => [...prev, { role: 'assistant', text: parsed.reply + (detail ? `\n\n${detail}` : '') }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `Sorry — I couldn't apply that. ${err instanceof Error ? err.message : 'Please rephrase and try again.'}`,
      }])
    } finally {
      setLoading(false)
    }
  }

  function undo() {
    if (!undoData) return
    onApply(undoData)
    setUndoData(null)
    setMessages(prev => [...prev, { role: 'assistant', text: 'Reverted the last change.' }])
  }

  if (!open) return null

  return (
    <aside className="fixed right-0 top-0 z-50 flex h-full w-[380px] flex-col border-l border-border bg-background shadow-2xl">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-1">
          {undoData && (
            <button onClick={undo} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-accent" title="Undo last AI change">
              <Undo2 className="h-3.5 w-3.5" />Undo
            </button>
          )}
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2 mb-3 text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">Build this page with AI</span>
            </div>
            <p className="mb-3 text-xs leading-relaxed">Tell me what to add or change. I edit the blocks directly — review on the canvas, then Save or Publish.</p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs rounded-md border border-border px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
              m.role === 'user'
                ? 'self-end bg-primary text-primary-foreground'
                : 'self-start bg-muted text-foreground'
            }`}
          >
            {m.text}
          </div>
        ))}

        {loading && (
          <div className="self-start flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />Thinking…
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            rows={2}
            placeholder="e.g. Add a hero, then a heading and two paragraphs…"
            className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
          <Button size="icon" onClick={() => send(input)} disabled={loading || !input.trim()} title="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-[0.65rem] text-muted-foreground/60">Enter to send · Shift+Enter for newline. Changes aren't saved until you Save/Publish.</p>
      </div>
    </aside>
  )
}
