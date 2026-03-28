import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { useEffect } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
  Image as ImageIcon, Code, Quote, Undo, Redo, Minus
} from 'lucide-react'

interface TiptapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function TiptapEditor({ value, onChange, placeholder = 'Write your blog post...' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false)
    }
  }, [value])

  if (!editor) return null

  const btn = (active: boolean, onClick: () => void, title: string, icon: React.ReactNode) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
    >
      {icon}
    </button>
  )

  const addImage = () => {
    const url = window.prompt('Image URL:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const setLink = () => {
    const url = window.prompt('URL:', editor.getAttributes('link').href)
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="border border-input rounded-md overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b border-input bg-muted/30">
        {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Bold', <Bold className="w-3.5 h-3.5" />)}
        {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Italic', <Italic className="w-3.5 h-3.5" />)}
        {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'Underline', <UnderlineIcon className="w-3.5 h-3.5" />)}
        {btn(editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), 'Strike', <Strikethrough className="w-3.5 h-3.5" />)}
        <div className="w-px bg-border mx-0.5" />
        {btn(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), 'H1', <Heading1 className="w-3.5 h-3.5" />)}
        {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2', <Heading2 className="w-3.5 h-3.5" />)}
        {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3', <Heading3 className="w-3.5 h-3.5" />)}
        <div className="w-px bg-border mx-0.5" />
        {btn(editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), 'Left', <AlignLeft className="w-3.5 h-3.5" />)}
        {btn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), 'Center', <AlignCenter className="w-3.5 h-3.5" />)}
        {btn(editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), 'Right', <AlignRight className="w-3.5 h-3.5" />)}
        <div className="w-px bg-border mx-0.5" />
        {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'Bullet List', <List className="w-3.5 h-3.5" />)}
        {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Ordered List', <ListOrdered className="w-3.5 h-3.5" />)}
        {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), 'Quote', <Quote className="w-3.5 h-3.5" />)}
        {btn(editor.isActive('code'), () => editor.chain().focus().toggleCode().run(), 'Code', <Code className="w-3.5 h-3.5" />)}
        <div className="w-px bg-border mx-0.5" />
        {btn(editor.isActive('link'), setLink, 'Link', <LinkIcon className="w-3.5 h-3.5" />)}
        {btn(false, addImage, 'Image', <ImageIcon className="w-3.5 h-3.5" />)}
        {btn(false, () => editor.chain().focus().setHorizontalRule().run(), 'Divider', <Minus className="w-3.5 h-3.5" />)}
        <div className="w-px bg-border mx-0.5" />
        {btn(false, () => editor.chain().focus().undo().run(), 'Undo', <Undo className="w-3.5 h-3.5" />)}
        {btn(false, () => editor.chain().focus().redo().run(), 'Redo', <Redo className="w-3.5 h-3.5" />)}
      </div>
      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none min-h-[400px] p-4 focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[380px]"
      />
    </div>
  )
}
