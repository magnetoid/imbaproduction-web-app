import { Extension } from '@tiptap/core'
import type { Editor, Range } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import {
  forwardRef, useEffect, useImperativeHandle, useState,
  type ReactNode,
} from 'react'
import {
  Type, Heading2, Heading3, Heading4, List, ListOrdered,
  Quote, Code, Minus, Image as ImageIcon,
} from 'lucide-react'

interface SlashItem {
  title: string
  description: string
  searchTerms: string[]
  icon: ReactNode
  command: (opts: { editor: Editor; range: Range }) => void
}

const ITEMS: SlashItem[] = [
  {
    title: 'Text', description: 'Plain paragraph', searchTerms: ['paragraph', 'p', 'body'],
    icon: <Type className="h-4 w-4" />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: 'Heading 2', description: 'Main section', searchTerms: ['h2', 'title', 'section'],
    icon: <Heading2 className="h-4 w-4" />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Heading 3', description: 'Sub-section', searchTerms: ['h3', 'subsection'],
    icon: <Heading3 className="h-4 w-4" />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run(),
  },
  {
    title: 'Heading 4', description: 'Deep detail', searchTerms: ['h4'],
    icon: <Heading4 className="h-4 w-4" />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleHeading({ level: 4 }).run(),
  },
  {
    title: 'Bullet list', description: 'Unordered list', searchTerms: ['ul', 'bullet', 'unordered'],
    icon: <List className="h-4 w-4" />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: 'Numbered list', description: 'Ordered list', searchTerms: ['ol', 'ordered', 'number'],
    icon: <ListOrdered className="h-4 w-4" />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: 'Quote', description: 'Block quotation', searchTerms: ['blockquote', 'citation'],
    icon: <Quote className="h-4 w-4" />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: 'Code block', description: 'Formatted code', searchTerms: ['code', 'pre', 'snippet'],
    icon: <Code className="h-4 w-4" />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: 'Divider', description: 'Horizontal rule', searchTerms: ['hr', 'separator', 'line'],
    icon: <Minus className="h-4 w-4" />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: 'Image', description: 'Insert by URL', searchTerms: ['img', 'picture', 'photo'],
    icon: <ImageIcon className="h-4 w-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      const url = window.prompt('Image URL:')
      if (url) editor.chain().focus().setImage({ src: url }).run()
    },
  },
]

// ── Popup list (keyboard-navigable) ─────────────────────────────
interface CommandListHandle { onKeyDown: (p: SuggestionKeyDownProps) => boolean }
interface CommandListProps { items: SlashItem[]; command: (item: SlashItem) => void }

const CommandList = forwardRef<CommandListHandle, CommandListProps>(({ items, command }, ref) => {
  const [selected, setSelected] = useState(0)
  useEffect(() => setSelected(0), [items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') { setSelected(s => (s + items.length - 1) % items.length); return true }
      if (event.key === 'ArrowDown') { setSelected(s => (s + 1) % items.length); return true }
      if (event.key === 'Enter') { const it = items[selected]; if (it) command(it); return true }
      return false
    },
  }), [items, selected, command])

  if (items.length === 0) {
    return (
      <div className="w-72 rounded-lg border border-border bg-popover shadow-xl p-2 text-sm text-muted-foreground">
        No matching blocks
      </div>
    )
  }

  return (
    <div className="w-72 max-h-80 overflow-y-auto rounded-lg border border-border bg-popover shadow-xl p-1.5">
      {items.map((item, i) => (
        <button
          key={item.title}
          type="button"
          onMouseEnter={() => setSelected(i)}
          onClick={() => command(item)}
          className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors ${
            i === selected ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/50'
          }`}
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
            {item.icon}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium">{item.title}</span>
            <span className="block text-xs text-muted-foreground truncate">{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  )
})
CommandList.displayName = 'SlashCommandList'

// ── Extension ───────────────────────────────────────────────────
export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashItem>({
        editor: this.editor,
        char: '/',
        startOfLine: false,
        command: ({ editor, range, props }) => props.command({ editor, range }),
        items: ({ query }) => {
          const q = query.toLowerCase()
          return ITEMS.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.searchTerms.some(t => t.includes(q)),
          )
        },
        render: () => {
          let component: ReactRenderer<CommandListHandle, CommandListProps> | null = null
          let popup: HTMLDivElement | null = null

          const position = (props: SuggestionProps<SlashItem>) => {
            const rect = props.clientRect?.()
            if (!rect || !popup) return
            popup.style.left = `${rect.left + window.scrollX}px`
            popup.style.top = `${rect.bottom + window.scrollY + 6}px`
          }

          return {
            onStart: (props) => {
              component = new ReactRenderer(CommandList, {
                props: { items: props.items, command: props.command },
                editor: props.editor,
              })
              popup = document.createElement('div')
              popup.style.position = 'absolute'
              popup.style.zIndex = '60'
              popup.appendChild(component.element)
              document.body.appendChild(popup)
              position(props)
            },
            onUpdate: (props) => {
              component?.updateProps({ items: props.items, command: props.command })
              position(props)
            },
            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                popup?.remove()
                return true
              }
              return component?.ref?.onKeyDown(props) ?? false
            },
            onExit: () => {
              popup?.remove()
              popup = null
              component?.destroy()
              component = null
            },
          }
        },
      }),
    ]
  },
})
